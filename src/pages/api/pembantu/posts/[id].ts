
import type { APIRoute } from 'astro';
import { getSession } from "@/lib/auth";

export const DELETE: APIRoute = async ({ locals, cookies, params }) => {
    const { env } = locals.runtime;
    const { user } = await getSession(cookies, env?.DB);

    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const id = params.id;
    if (!id) {
        return new Response(JSON.stringify({ error: 'ID required' }), { status: 400 });
    }

    try {
        await env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to delete post' }), { status: 500 });
    }
};

export const PUT: APIRoute = async ({ locals, cookies, params, request }) => {
    const { env } = locals.runtime;
    const { user } = await getSession(cookies, env?.DB);

    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const id = params.id;
    try {
        const body = await request.json();
        const { title, slug, content, description, hero_image, is_published } = body;

        await env.DB.prepare(
            `UPDATE posts SET title = ?, slug = ?, content = ?, description = ?, hero_image = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        ).bind(
            title, slug, content, description, hero_image, is_published ? 1 : 0, id
        ).run();

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to update post' }), { status: 500 });
    }
};
