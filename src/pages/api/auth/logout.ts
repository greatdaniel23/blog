export const prerender = false;

import type { APIContext } from 'astro';

export async function ALL(context: APIContext) {
    const sessionId = context.cookies.get('session_id')?.value;

    if (sessionId) {
        try {
            const { env } = context.locals.runtime;
            await env.DB.prepare('DELETE FROM sessions WHERE id = ?')
                .bind(sessionId)
                .run();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    context.cookies.delete('session_id', { path: '/' });

    return context.redirect('/pembantu/login');
}
