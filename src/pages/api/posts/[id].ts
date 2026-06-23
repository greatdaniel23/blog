import type { APIRoute } from 'astro';
import { requireMcpToken } from '@/lib/mcp-auth';

export const prerender = false;

// GET /api/posts/[id] - Get single post (public read)
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

// PUT /api/posts/[id] - Update post (BEARER-GATED, MCP surface)
export const PUT: APIRoute = async ({ params, request, locals }) => {
    const authFail = requireMcpToken(request, locals.runtime.env);
    if (authFail) return authFail;

    try {
        const db = locals.runtime.env.DB;
        const { id } = params;
        const body = await request.json();

        const { title, slug, description, content, hero_image, author, is_published, pub_date } = body;

        if (!title || !slug || !content || !hero_image || typeof hero_image !== 'string' || !hero_image.trim()) {
            return new Response(JSON.stringify({ error: 'Missing or invalid required fields: title, slug, content, and hero_image are required.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // pub_date is authorable and NON-DESTRUCTIVE:
        //  - value supplied  → set it (correct/backdate the publish date)
        //  - omitted/blank   → COALESCE(?, pub_date) keeps the EXISTING value,
        //                      never silently resetting it to now.
        // updated_at always moves.
        const hasPubDate = pub_date !== undefined && pub_date !== null && pub_date !== '';

        await db.prepare(`
      UPDATE posts
      SET title = ?, slug = ?, description = ?, content = ?,
          hero_image = ?, author = ?, is_published = ?,
          pub_date = COALESCE(?, pub_date), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(title, slug, description, content, hero_image, author, is_published ? 1 : 0, hasPubDate ? pub_date : null, id).run();

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

// DELETE /api/posts/[id] - Delete post (BEARER-GATED, MCP surface)
export const DELETE: APIRoute = async ({ params, request, locals }) => {
    const authFail = requireMcpToken(request, locals.runtime.env);
    if (authFail) return authFail;

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
