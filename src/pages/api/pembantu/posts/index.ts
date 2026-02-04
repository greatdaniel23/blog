import type { APIRoute } from 'astro';
import { getSession } from "@/lib/auth";

export const GET: APIRoute = async ({ locals, cookies, request }) => {
    const { env } = locals.runtime;
    const { user } = await getSession(cookies, env?.DB);

    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const { results } = await env.DB.prepare(
            "SELECT * FROM posts ORDER BY created_at DESC"
        ).all();

        return new Response(JSON.stringify({ posts: results }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Fetch posts error:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch posts' }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ locals, cookies, request }) => {
    const { env } = locals.runtime;
    const { user } = await getSession(cookies, env?.DB);

    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, slug, content, description, hero_image, is_published } = body;

        // Basic validation
        if (!title || !slug) {
            return new Response(JSON.stringify({ error: 'Title and Slug are required' }), { status: 400 });
        }

        const result = await env.DB.prepare(
            `INSERT INTO posts (title, slug, content, description, hero_image, is_published, author, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
        ).bind(
            title,
            slug,
            content || '',
            description || '',
            hero_image || null,
            is_published ? 1 : 0,
            user.name || 'Admin'
        ).run();

        return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Create post error:', error);
        return new Response(JSON.stringify({ error: 'Failed to create post' }), { status: 500 });
    }
};
