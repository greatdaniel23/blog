export const prerender = false;

import type { APIContext } from 'astro';
import bcrypt from 'bcryptjs';

export async function POST(context: APIContext) {
    const formData = await context.request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return context.redirect('/pembantu/login?message=Missing email or password');
    }

    try {
        const { env } = context.locals.runtime;

        // Fetch user
        const user = await env.DB.prepare('SELECT * FROM admin_users WHERE email = ?')
            .bind(email)
            .first();

        if (!user) {
            return context.redirect('/pembantu/login?message=Invalid credentials');
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash as string);

        if (!validPassword) {
            return context.redirect('/pembantu/login?message=Invalid credentials');
        }

        // Create session
        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

        await env.DB.prepare(
            'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
        ).bind(sessionId, user.id, expiresAt.toISOString())
            .run();

        // Set cookie
        context.cookies.set('session_id', sessionId, {
            path: '/',
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'lax',
            expires: expiresAt
        });

        return context.redirect('/pembantu');

    } catch (error) {
        console.error('Login error:', error);
        return context.redirect('/pembantu/login?message=An error occurred');
    }
}
