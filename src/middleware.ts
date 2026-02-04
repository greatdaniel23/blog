import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, cookies, locals } = context;

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

    return next();
});
