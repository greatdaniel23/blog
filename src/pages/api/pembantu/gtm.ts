import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
    try {
        const { env } = context.locals.runtime;
        const result = await env.DB.prepare('SELECT gtm_id FROM gtm_settings WHERE id = 1').first();
        return new Response(JSON.stringify(result || { gtm_id: '' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching GTM ID:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch GTM ID' }), { status: 500 });
    }
}

export async function POST(context: APIContext) {
    try {
        const { env } = context.locals.runtime;
        const body = await context.request.json();
        const gtmId = body.gtm_id;

        if (typeof gtmId !== 'string') {
            return new Response('Invalid GTM ID', { status: 400 });
        }

        await env.DB.prepare('UPDATE gtm_settings SET gtm_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1')
            .bind(gtmId)
            .run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error updating GTM ID:', error);
        return new Response(JSON.stringify({ error: 'Failed to update GTM ID' }), { status: 500 });
    }
}
