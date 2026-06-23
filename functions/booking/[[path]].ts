// functions/booking/[[path]].ts
// Same-origin proxy for the booking frontend.
// Replaces the pages.dev URL exposed in /ai-agent/demo/.
// All /booking/* requests are forwarded to the upstream booking-frontend Pages project.
export const onRequest: PagesFunction<{ BOOKING_UPSTREAM: string }> = async ({ request, params, env }) => {
  const upstream = env.BOOKING_UPSTREAM;
  if (!upstream) {
    return new Response(JSON.stringify({ error: "booking upstream not configured" }), {
      status: 503, headers: { "content-type": "application/json" }
    });
  }
  // params.path is the catch-all segment(s) after /booking/
  const pathSegments = (params.path as string[] | undefined) || [];
  const upstreamPath = pathSegments.length > 0 ? "/" + pathSegments.join("/") : "/";
  const upstreamUrl = upstream.replace(/\/+$/, "") + upstreamPath;

  // Forward query string if any
  const reqUrl = new URL(request.url);
  const targetUrl = upstreamUrl + (reqUrl.search || "");

  const res = await fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    redirect: "follow",
  });

  return new Response(res.body, {
    status: res.status,
    headers: res.headers,
  });
};
