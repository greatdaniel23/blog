import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, cookies, locals, request } = context;

    // ── No-trailing-slash canonicalization (301) ─────────────────────────────
    // SAFE re-implementation of no-slash canonicalization WITHOUT flipping the
    // astro.config `trailingSlash` flag (which broke SSR dynamic-route param
    // resolution and 404'd every /blog/<slug>, 2026-06-09 — see
    // reference_astro_trailingslash_ssr_gotcha).
    //
    // Why this is safe vs the flag: the flag changed Astro's ROUTE-MATCHING /
    // param resolution at build+request time. This middleware does NOT touch
    // route matching — it only inspects the incoming pathname and, if a NON-root
    // URL ends in "/", issues a 301 to the no-slash form. The request that
    // actually renders the page (the no-slash one) is matched and resolved by
    // Astro exactly as before. trailingSlash stays 'ignore'.
    //
    // Scope: this worker only runs for the `_routes.json` INCLUDE paths
    // (/blog/*, /booking-engine, /api/*, …). Static EXCLUDE paths (/services/*,
    // /about, …) are served by CF Pages' static-asset layer and never reach
    // this code, so there is NO redirect-loop with CF's own static
    // trailing-slash handling. For those static pages the no-slash canonical is
    // enforced via the <link rel="canonical"> tag (normalized in
    // BaseHead/SwissLayout) instead.
    //
    // Exclusions: root "/" (must keep its slash) and asset-ish paths (anything
    // whose last segment contains a "." — e.g. dashboard.css, .js, .xml — and
    // the Astro/_image internal namespaces) are passed through untouched so we
    // never 301 a real file request. Query string + hash are preserved.
    //
    // CRITICAL — skip during PRERENDER. Middleware also runs at BUILD time while
    // Astro prerenders static pages, where the simulated pathname is the
    // directory form "/about/" (trailing slash). Without this guard the redirect
    // fired during prerender and Astro serialized the 301 as a "Redirecting to:"
    // stub HTML *in place of the real page content* — turning /about, all
    // /services/*, /privacy-policy, /kelas/* into redirect stubs that then looped
    // against CF's static no-slash→slash 308 (full page-render outage, 2026-06-09).
    // At runtime static pages are served by CF static (this code never runs for
    // them); only SSR routes (isPrerendered=false) need the canonicalization.
    {
        const { pathname, search } = url;
        const lastSeg = pathname.slice(pathname.lastIndexOf('/') + 1);
        const looksLikeFile = lastSeg.includes('.');
        const isInternal =
            pathname.startsWith('/_') ||      // /_astro, /_image, /_server-islands
            pathname.startsWith('/api/');     // never redirect API calls
        if (
            !context.isPrerendered &&         // never redirect while prerendering at build
            pathname !== '/' &&
            pathname.endsWith('/') &&
            !looksLikeFile &&
            !isInternal
        ) {
            // Force a SINGLE leading slash so a "//evil.com/" (or "\evil.com/",
            // which WHATWG folds to "//") pathname can't emit a protocol-relative
            // Location and open-redirect cross-origin (WARDEN hard-fail 2026-06-09).
            const noSlashPath = '/' + pathname.replace(/\/+$/, '').replace(/^[/\\]+/, '');
            const target = noSlashPath + search;
            // 301 permanent — consolidate the slash variant onto the no-slash URL.
            return context.redirect(target || '/', 301);
        }
    }

    // ── pages.dev noindex ────────────────────────────────────────────────────
    // The blogtemplate.pages.dev preview domain must never be indexed.
    // Inject noindex on every response if the Host header is *.pages.dev.
    const host = request.headers.get('host') ?? '';
    const isPagesDevHost = host.endsWith('.pages.dev');

    // Defines protected routes (starts with these)
    const protectedRoutes = ['/pembantu', '/api/pembantu'];
    // Defines public exceptions within protected routes
    const publicRoutes = [
        '/pembantu/login',
        '/api/auth/login',
        '/api/auth/logout',
        '/api/auth/setup',
        '/pembantu/dashboard.css'
    ];

    const isProtected = protectedRoutes.some(route => url.pathname.startsWith(route));
    const isPublic = publicRoutes.some(route => url.pathname.startsWith(route));

    if (isProtected && !isPublic) {
        const sessionId = cookies.get('session_id')?.value;
        if (!sessionId) {
            return context.redirect('/pembantu/login');
        }

        try {
            // Access runtime environment. 
            // In dev mode or some adapters, it might be structured differently, 
            // but context.locals.runtime.env is the standard for Cloudflare adapter.
            const runtime = locals.runtime;

            if (!runtime || !runtime.env || !runtime.env.DB) {
                // Fallback or skip if DB not available (e.g. during build?)
                // But for /pembantu we need it.
                console.error("DB not available in middleware");
                // Proceeding might be dangerous if we assume Auth, but if DB is missing we can't auth.
                // Let's assume valid runtime for now.
                return next();
            }

            const { env } = runtime;
            const session = await env.DB.prepare(
                'SELECT * FROM sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP'
            ).bind(sessionId).first();

            if (!session) {
                // Invalid or expired
                cookies.delete('session_id', { path: '/' });
                return context.redirect('/pembantu/login');
            }

            // Valid session, fetch user
            const user = await env.DB.prepare('SELECT * FROM admin_users WHERE id = ?').bind(session.user_id).first();

            if (user) {
                locals.user = user as any; // Type casting to match App.Locals
            } else {
                return context.redirect('/pembantu/login');
            }

        } catch (e) {
            console.error('Middleware auth error:', e);
            return context.redirect('/pembantu/login');
        }
    }

    const response = await next();

    // Attach noindex headers for pages.dev preview domain
    if (isPagesDevHost) {
        response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    }

    return response;
});
