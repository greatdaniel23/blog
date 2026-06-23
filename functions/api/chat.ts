// functions/api/chat.ts
// Same-origin proxy for the AI Agent demo chat endpoint.
// Replaces the workers.dev URL exposed in /ai-agent/demo/.
export const onRequestPost: PagesFunction<{ AI_AGENT_UPSTREAM: string }> = async ({ request, env }) => {
  const upstream = env.AI_AGENT_UPSTREAM;
  if (!upstream) {
    return new Response(JSON.stringify({ error: "upstream not configured" }), {
      status: 503, headers: { "content-type": "application/json" }
    });
  }
  const body = await request.text();
  const res = await fetch(upstream.replace(/\/+$/, "") + "/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
  // Stream response back unchanged; preserve content-type
  return new Response(res.body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") || "application/json",
      "cache-control": "no-store",
    },
  });
};
