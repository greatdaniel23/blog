import type { APIRoute } from 'astro';
import { getSession } from "@/lib/auth";

export const GET: APIRoute = async ({ locals, cookies }) => {
    const { env } = locals.runtime;
    const { user } = await getSession(cookies, env?.DB);

    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const { results } = await env.DB.prepare(
            "SELECT id, image_url, caption, created_at FROM gallery ORDER BY created_at DESC"
        ).all();

        return new Response(JSON.stringify({ images: results }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Fetch gallery list error:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch images' }), { status: 500 });
    }
};
