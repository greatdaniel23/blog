import type { APIRoute } from 'astro';
import { getSession } from "@/lib/auth";

export const DELETE: APIRoute = async ({ locals, cookies, params }) => {
    const { env } = locals.runtime;
    const { user } = await getSession(cookies, env?.DB);
    const { id } = params;

    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    if (!id) {
        return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400 });
    }

    try {
        await env.DB.prepare(
            "DELETE FROM gallery WHERE id = ?"
        ).bind(id).run();

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Delete image error:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete image' }), { status: 500 });
    }
};
