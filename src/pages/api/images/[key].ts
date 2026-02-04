import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals, params }) => {
    const { env } = locals.runtime;
    const { key } = params;

    if (!env?.IMAGES) {
        return new Response('R2 bucket binding not found', { status: 500 });
    }

    if (!key) {
        return new Response('Image key required', { status: 400 });
    }

    try {
        const object = await env.IMAGES.get(key);

        if (object === null) {
            return new Response('Image not found', { status: 404 });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);

        return new Response(object.body, {
            headers,
        });
    } catch (error) {
        console.error('Error fetching image from R2:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};
