import type { APIRoute } from 'astro';

export const prerender = false;

// GET /api/posts/[id] - Get single post
export const GET: APIRoute = async ({ params, locals }) => {
    try {
        const db = locals.runtime.env.DB;
        const { id } = params;

        const post = await db.prepare(`
      SELECT * FROM posts WHERE id = ?
    `).bind(id).first();

        if (!post) {
            return new Response(JSON.stringify({ error: 'Post not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ post }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch post' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

// PUT /api/posts/[id] - Update post
export const PUT: APIRoute = async ({ params, request, locals }) => {
    try {
        const db = locals.runtime.env.DB;
        const { id } = params;
        const body = await request.json();

        const { title, slug, description, content, hero_image, author, is_published } = body;

        await db.prepare(`
      UPDATE posts 
      SET title = ?, slug = ?, description = ?, content = ?, 
          hero_image = ?, author = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(title, slug, description, content, hero_image, author, is_published ? 1 : 0, id).run();

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to update post' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

// DELETE /api/posts/[id] - Delete post
export const DELETE: APIRoute = async ({ params, locals }) => {
    try {
        const db = locals.runtime.env.DB;
        const { id } = params;

        await db.prepare(`DELETE FROM posts WHERE id = ?`).bind(id).run();

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to delete post' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
