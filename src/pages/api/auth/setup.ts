export const prerender = false;

import type { APIContext } from 'astro';
import bcrypt from 'bcryptjs';

export async function GET(context: APIContext) {
    try {
        const { env } = context.locals.runtime;

        // Check if users exist
        const countResult = await env.DB.prepare('SELECT COUNT(*) as count FROM admin_users').first();
        if (countResult && countResult.count > 0) {
            return new Response('Users already exist. Setup skipped.', { status: 403 });
        }

        const email = 'admin@alphadigitalagency.id';
        const password = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await env.DB.prepare(
            'INSERT INTO admin_users (email, password_hash, name, role) VALUES (?, ?, ?, ?)'
        ).bind(email, hash, 'Administrator', 'admin')
            .run();

        return new Response(`User created: ${email} / ${password}`, { status: 200 });

    } catch (error) {
        console.error('Setup error:', error);
        return new Response(`Error: ${error.message}`, { status: 500 });
    }
}
