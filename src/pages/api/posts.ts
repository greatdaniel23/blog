import type { APIRoute } from 'astro';
import { requireMcpToken } from '@/lib/mcp-auth';

export const prerender = false;

// GET /api/posts - List all published posts (public read)
export const GET: APIRoute = async ({ locals }) => {
    try {
        const db = locals.runtime.env.DB;

        const { results } = await db.prepare(`
      SELECT id, slug, title, description, hero_image, author, pub_date, view_count
      FROM posts 
      WHERE is_published = 1 
      ORDER BY pub_date DESC
    `).all();

        return new Response(JSON.stringify({ posts: results }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch posts' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

// POST /api/posts - Create new post (BEARER-GATED, MCP surface)
export const POST: APIRoute = async ({ request, locals }) => {
    const authFail = requireMcpToken(request, locals.runtime.env);
    if (authFail) return authFail;

    try {
        const db = locals.runtime.env.DB;
        const body = await request.json();

        const { slug, title, description, content, hero_image, author, pub_date } = body;

        if (!slug || !title || !content || !hero_image || typeof hero_image !== 'string' || !hero_image.trim()) {
            return new Response(JSON.stringify({ error: 'Missing required fields: slug, title, content, and hero_image are required.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // pub_date is authorable. When provided, persist the caller's value;
        // when omitted, fall through to the column DEFAULT CURRENT_TIMESTAMP
        // by binding null (so the publish date stays the row-insert time).
        const hasPubDate = pub_date !== undefined && pub_date !== null && pub_date !== '';

        const result = await db.prepare(`
      INSERT INTO posts (slug, title, description, content, hero_image, author, is_published, pub_date)
      VALUES (?, ?, ?, ?, ?, ?, 0, COALESCE(?, CURRENT_TIMESTAMP))
    `).bind(slug, title, description ?? null, content, hero_image, author || 'Hotel Editorial Team', hasPubDate ? pub_date : null).run();

        return new Response(JSON.stringify({
            success: true,
            id: result.meta.last_row_id
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to create post' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
