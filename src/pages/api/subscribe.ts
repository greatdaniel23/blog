import type { APIRoute } from 'astro';

export const prerender = false;

// POST /api/subscribe - Newsletter subscription
export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const db = locals.runtime.env.DB;
        const body = await request.json();

        const { email, name } = body;

        if (!email) {
            return new Response(JSON.stringify({ error: 'Email is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check if already subscribed
        const existing = await db.prepare(`
      SELECT id, is_active FROM subscribers WHERE email = ?
    `).bind(email).first();

        if (existing) {
            if (existing.is_active) {
                return new Response(JSON.stringify({ message: 'Already subscribed' }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            // Reactivate subscription
            await db.prepare(`
        UPDATE subscribers SET is_active = 1, unsubscribed_at = NULL WHERE id = ?
      `).bind(existing.id).run();
        } else {
            await db.prepare(`
        INSERT INTO subscribers (email, name) VALUES (?, ?)
      `).bind(email, name || null).run();
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Successfully subscribed!'
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to subscribe' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
