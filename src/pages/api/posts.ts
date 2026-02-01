import type { APIRoute } from 'astro';

export const prerender = false;

// GET /api/posts - List all published posts
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

// POST /api/posts - Create new post
export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const db = locals.runtime.env.DB;
        const body = await request.json();

        const { slug, title, description, content, hero_image, author } = body;

        if (!slug || !title || !content) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const result = await db.prepare(`
      INSERT INTO posts (slug, title, description, content, hero_image, author, is_published)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `).bind(slug, title, description, content, hero_image, author || 'Hotel Editorial Team').run();

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
