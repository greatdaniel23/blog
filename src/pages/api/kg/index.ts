/**
 * /api/kg/sync — Knowledge Graph vector pipeline (KG-SEO v3 Phase 4 / Gap #14).
 *
 * Chunks published blog posts (300–500 words) and upserts their embeddings
 * into Vectorize via Workers AI (bge-m2-base, 768-dim). Metadata per chunk
 * follows spec 03 §4: doc_id#chunk_n, node_type, entity_tags (pillar),
 * target_static_node, last_updated.
 *
 * GET  → summary of indexed docs (counts)
 * POST → re-sync all published posts (idempotent upsert; deletes stale doc ids)
 *
 * Bearer-gated (WARDEN pattern: constant-time compare via crypto.subtle).
 */
import type { APIRoute } from "astro";

export const prerender = false;

const CHUNK_WORDS = 400;

interface PostRow {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  content: string;
  pillar_id: string | null;
  node_type: string | null;
  updated_at: string | null;
}

interface Env {
  DB: D1Database;
  VECTORIZE: VectorizeIndex;
  AI: Ai;
}

const STATIC_TARGET: Record<string, string> = {
  "google-ads": "/services/google-ads",
  "booking-engine": "/services/booking-engine",
  "ai-agent": "/services/ai-agent",
  "digital-marketing-bali": "/",
  "digital-marketing-for-hotel": "/services/google-ads",
};

function chunkText(text: string, maxWords: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(" "));
  }
  return chunks.length ? chunks : [""];
}

// Vectorize ids are capped at 64 bytes — long slugs overflow. Use a stable
// 8-hex hash of the slug as the doc id base (metadata carries the full slug).
async function shortHash(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest).slice(0, 4))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyToken(env: Env, token: string | null, secret: string): Promise<boolean> {
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

export const GET: APIRoute = async ({ locals, request }) => {
  const env = (locals as any).runtime?.env as Env;
  if (!env?.VECTORIZE) {
    return Response.json({ ok: false, error: "VECTORIZE binding missing" }, { status: 503 });
  }
  const summary = await env.VECTORIZE.describe();
  return Response.json({ ok: true, index: summary });
};

export const POST: APIRoute = async ({ locals, request }) => {
  const env = (locals as any).runtime?.env as Env;
  if (!env?.VECTORIZE) return Response.json({ ok: false, error: "VECTORIZE binding missing" }, { status: 503 });
  if (!env.AI) return Response.json({ ok: false, error: "AI (Workers AI) binding missing — add [[ai]] binding to wrangler.toml" }, { status: 503 });

  const secret = (env as any).KG_SYNC_TOKEN as string | undefined;
  const auth = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!(await verifyToken(env, auth, secret ?? ""))) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { results: posts } = await env.DB.prepare(
    "SELECT id, slug, title, description, content, pillar_id, node_type, updated_at FROM posts WHERE is_published = 1",
  ).all<PostRow>();

  let upserted = 0;
  const failures: string[] = [];

  for (const post of posts) {
    try {
      const body = [post.title, post.description ?? "", post.content].join("\n\n");
      const chunks = chunkText(body, CHUNK_WORDS);
      const docIdBase = `blog_${await shortHash(post.slug)}`;

      // Delete stale chunks for this doc before upsert (Vectorize has no list() —
      // bounded id namespace is the documented pattern).
      const stale = Array.from({ length: 64 }, (_, i) => `${docIdBase}#c${i}`);
      await env.VECTORIZE.deleteByIds(stale);

      const vectors: { id: string; values: number[]; metadata: Record<string, string> }[] = [];
      for (let i = 0; i < chunks.length; i++) {
        const emb = await env.AI.run("@cf/baai/bge-base-en-v1.5", { text: [chunks[i]] });
        const values = (emb as { data?: { embedding?: number[] }[] }).data?.[0]?.embedding;
        if (!values) {
          failures.push(`${docIdBase}#c${i} (no embedding)`);
          continue;
        }
        vectors.push({
          id: `${docIdBase}#c${i}`,
          values,
          metadata: {
            doc_id: `blog_${post.slug}`,
            node_type: post.node_type ?? "deep_dive_guide",
            entity_tags: post.pillar_id ?? "unclassified",
            target_static_node: STATIC_TARGET[post.pillar_id ?? ""] ?? "",
            last_updated: post.updated_at ?? new Date().toISOString().slice(0, 10),
            title: post.title,
          },
        });
      }
      if (vectors.length > 0) {
        await env.VECTORIZE.upsert(vectors);
        upserted += vectors.length;
      }
    } catch (e) {
      failures.push(`${post.slug}: ${(e as Error).message}`);
    }
  }

  return Response.json({
    ok: true,
    upserted_chunks: upserted,
    posts: posts.length,
    failures,
  });
};
