import type { APIRoute } from 'astro';

export const prerender = false;

const MAX_BODY_BYTES = 16_384;
const ALLOWED_ORIGINS = new Set([
    'https://alphadigitalagency.id',
    'https://www.alphadigitalagency.id',
    'https://blogtemplate.pages.dev',
    'http://localhost:4321',
    'http://127.0.0.1:4321',
]);

function originIsAllowed(request: Request): boolean {
    const origin = request.headers.get('origin');
    // This endpoint proxies a browser-facing write. Require a present,
    // explicitly allowlisted Origin; Sec-Fetch-Site is not an auth signal.
    return Boolean(origin) && ALLOWED_ORIGINS.has(origin);
}

/** Same-origin proxy for the public consultation-request contract. */
export const POST: APIRoute = async ({ request, locals }) => {
    if (!originIsAllowed(request)) {
        return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        });
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().startsWith('application/json')) {
        return new Response(JSON.stringify({ error: 'JSON content required' }), {
            status: 415,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        });
    }

    const declaredLength = Number(request.headers.get('content-length') || 0);
    if (declaredLength > MAX_BODY_BYTES) {
        return new Response(JSON.stringify({ error: 'Request is too large' }), {
            status: 413,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        });
    }

    const upstream = locals.runtime.env.AI_AGENT_UPSTREAM as string | undefined;
    if (!upstream) {
        return new Response(JSON.stringify({ error: 'upstream not configured' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        });
    }

    try {
        const body = await request.text();
        if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
            return new Response(JSON.stringify({ error: 'Request is too large' }), {
                status: 413,
                headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
            });
        }
        const res = await fetch(upstream.replace(/\/+$/, '') + '/api/agency/consultation-request', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                ...(request.headers.get('origin') ? { origin: request.headers.get('origin') as string } : {}),
                ...(request.headers.get('cf-connecting-ip') ? { 'cf-connecting-ip': request.headers.get('cf-connecting-ip') as string } : {}),
            },
            body,
        });

        return new Response(res.body, {
            status: res.status,
            headers: {
                'Content-Type': res.headers.get('content-type') || 'application/json',
                'Cache-Control': 'no-store',
                ...(res.headers.get('retry-after') ? { 'Retry-After': res.headers.get('retry-after') as string } : {}),
            },
        });
    } catch (_) {
        return new Response(JSON.stringify({ error: 'Unable to reach consultation service' }), {
            status: 502,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        });
    }
};
