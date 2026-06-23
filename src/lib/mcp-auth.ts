// Bearer-token gate for /api/posts/* mutation endpoints (NOT for /api/pembantu/* — those use session cookies).
// Token provisioned via `wrangler pages secret put BLOG_MCP_TOKEN --project-name=blogtemplate`.

function constantTimeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}

export function requireMcpToken(request: Request, env: any): Response | null {
    const expected = env?.BLOG_MCP_TOKEN;
    if (!expected || typeof expected !== 'string' || expected.length < 32) {
        return new Response(JSON.stringify({ error: 'Server auth misconfigured' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const header = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!header || !header.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', 'WWW-Authenticate': 'Bearer' },
        });
    }

    const presented = header.slice(7).trim();
    if (!constantTimeEqual(presented, expected)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', 'WWW-Authenticate': 'Bearer' },
        });
    }

    return null;
}
