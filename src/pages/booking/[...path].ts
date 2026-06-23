import type { APIRoute } from 'astro';

export const prerender = false;

// ALL /booking/* — Same-origin proxy for the booking frontend.
// Forwards to BOOKING_UPSTREAM (bound via Pages env var).
// Replaces the pages.dev URL that would otherwise be exposed in /ai-agent/demo/.
export const ALL: APIRoute = async ({ request, params, locals }) => {
    const upstream = locals.runtime.env.BOOKING_UPSTREAM as string | undefined;

    if (!upstream) {
        return new Response(JSON.stringify({ error: "booking upstream not configured" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const path = params.path || "";
        const reqUrl = new URL(request.url);
        const targetUrl = upstream.replace(/\/+$/, "") + "/" + path + (reqUrl.search || "");

        const res = await fetch(targetUrl, {
            method: request.method,
            headers: request.headers,
            body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
            redirect: "follow",
        });

        // Pass through response headers but strip hop-by-hop headers
        const responseHeaders = new Headers();
        res.headers.forEach((value, key) => {
            const hopByHop = ["connection", "keep-alive", "transfer-encoding", "upgrade", "proxy-authenticate", "proxy-authorization", "te", "trailers"];
            if (!hopByHop.includes(key.toLowerCase())) {
                responseHeaders.set(key, value);
            }
        });

        return new Response(res.body, {
            status: res.status,
            headers: responseHeaders,
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: "booking proxy error", detail: String(err) }), {
            status: 502,
            headers: { "Content-Type": "application/json" },
        });
    }
};
