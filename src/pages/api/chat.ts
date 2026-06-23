import type { APIRoute } from 'astro';

export const prerender = false;

// POST /api/chat — Same-origin proxy for the AI Agent demo chat endpoint.
// Forwards to AI_AGENT_UPSTREAM (bound via Pages env var).
// Replaces the workers.dev URL that would otherwise be exposed in /ai-agent/demo/.
export const POST: APIRoute = async ({ request, locals }) => {
    const upstream = locals.runtime.env.AI_AGENT_UPSTREAM as string | undefined;

    if (!upstream) {
        return new Response(JSON.stringify({ error: "upstream not configured" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const body = await request.text();
        const res = await fetch(upstream.replace(/\/+$/, "") + "/api/chat", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body,
        });

        return new Response(res.body, {
            status: res.status,
            headers: {
                "Content-Type": res.headers.get("content-type") || "application/json",
                "Cache-Control": "no-store",
            },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: "proxy error", detail: String(err) }), {
            status: 502,
            headers: { "Content-Type": "application/json" },
        });
    }
};
