/**
 * /api/kg/query — vector query endpoint for blog semantic connectivity.
 *
 * Single embedding code path (vector-connectivity design, audit §4.2): the
 * server embeds `text` with Workers AI (bge-base-en-v1.5 — the SAME model the
 * kg-blog-index sync uses; the index dimension is locked at 768) and returns
 * top-K Vectorize matches with full metadata. Callers (blog-agent injection +
 * cannibalization gate, post-page related module) apply their own rerank/filter
 * rules (language hard-filter, ID/EN twin exclusion, pillar boost, floor,
 * top-3 cap) — this route stays a raw, dumb query.
 *
 * POST only. Bearer-gated (WARDEN pattern: constant-time compare via
 * crypto.subtle; secret read from env KG_QUERY_TOKEN, provisioned via
 * `wrangler pages secret put KG_QUERY_TOKEN` — NEVER wrangler.toml).
 * Fail-closed: secret missing or < 32 chars → 503 (never allow-fallthrough);
 * bad/missing auth → 401 with WWW-Authenticate: Bearer (RFC 6750). No
 * ?token= query fallback (URL-log leak).
 *
 * Degrade contract: empty/stale index → 200 with empty `matches` (caller skips
 * injection and hides the module — today's behavior); hard errors → 500.
 */
import type { APIRoute } from "astro";

export const prerender = false;

interface Env {
  VECTORIZE: VectorizeIndex;
  AI: Ai;
  KG_QUERY_TOKEN?: string;
}

interface QueryBody {
  text?: string;
  language?: string;
  pillar?: string;
  top_k?: number;
}

async function verifyToken(token: string | null, secret: string): Promise<boolean> {
  if (!token || !secret) return false;
  const a = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  const bytesA = new Uint8Array(a);
  const bytesB = new Uint8Array(b);
  if (bytesA.length !== bytesB.length) return false;
  let diff = 0;
  for (let i = 0; i < bytesA.length; i++) diff |= bytesA[i] ^ bytesB[i];
  return diff === 0;
}

// Vectorize 40041 = per-account rate limit; same backoff as the sync route.
const RATE_LIMIT_KEYS = ["40041", "rate limit", "rate_limit"];
async function withRateBackoff<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      const msg = String((e as Error).message ?? "");
      const isRateLimit = RATE_LIMIT_KEYS.some((k) => msg.toLowerCase().includes(k));
      if (!isRateLimit || attempt === maxAttempts) throw e;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  throw new Error("Unreachable");
}

async function embedText(env: Env, text: string): Promise<number[]> {
  const emb = await env.AI.run("@cf/baai/bge-base-en-v1.5", { text: [text] });
  // Same response handling as the sync route: bge returns { data: [[...]] },
  // some models { data: [{ embedding: [...] }] } — handle both.
  const raw = emb as { data?: (number[] | { embedding?: number[] })[] };
  const first = raw.data?.[0];
  const values = Array.isArray(first) ? first : first?.embedding;
  if (!values) throw new Error("no embedding returned");
  return values;
}

export const POST: APIRoute = async ({ locals, request }) => {
  const env = (locals as any).runtime?.env as Env;
  if (!env?.VECTORIZE) {
    return Response.json({ ok: false, error: "VECTORIZE binding missing" }, { status: 503 });
  }
  if (!env.AI) {
    return Response.json({ ok: false, error: "AI binding missing" }, { status: 503 });
  }

  // Fail-closed auth: secret unset or too short → 503, never allow-fallthrough.
  const secret = env.KG_QUERY_TOKEN ?? "";
  if (!secret || secret.length < 32) {
    return Response.json({ ok: false, error: "service not configured" }, { status: 503 });
  }
  const auth = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!auth || !(await verifyToken(auth, secret))) {
    return Response.json(
      { ok: false, error: "unauthorized" },
      { status: 401, headers: { "WWW-Authenticate": "Bearer" } },
    );
  }

  let body: QueryBody;
  try {
    body = (await request.json()) as QueryBody;
  } catch {
    return Response.json({ ok: false, error: "invalid JSON body" }, { status: 400 });
  }
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return Response.json({ ok: false, error: "text required" }, { status: 400 });
  if (text.length > 4000) {
    return Response.json({ ok: false, error: "text too long" }, { status: 400 });
  }
  const topK = Math.min(Math.max(Number(body.top_k) || 20, 1), 30);

  try {
    const vector = await withRateBackoff(() => embedText(env, text));
    const res = await withRateBackoff(() => env.VECTORIZE.query(vector, { topK, returnMetadata: "all" }));
    const matches = (res.matches ?? []).map((m) => ({
      id: m.id,
      score: m.score,
      metadata: m.metadata ?? {},
    }));
    return Response.json({ ok: true, matches });
  } catch (e) {
    return Response.json(
      { ok: false, error: `kg query failed: ${(e as Error).message}` },
      { status: 500 },
    );
  }
};
