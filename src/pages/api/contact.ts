import type { APIRoute } from 'astro';

export const prerender = false;

// POST /api/contact - Contact form submission
export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const db = locals.runtime.env.DB;
        const body = await request.json();

        const { name, email, subject, message } = body;

        if (!name || !email || !message) {
            return new Response(JSON.stringify({ error: 'Name, email, and message are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        await db.prepare(`
      INSERT INTO contact_submissions (name, email, subject, message)
      VALUES (?, ?, ?, ?)
    `).bind(name, email, subject || null, message).run();

        return new Response(JSON.stringify({
            success: true,
            message: 'Message sent successfully!'
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to send message' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
