import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, locals }) => {
    const { env } = locals.runtime;

    if (!env || !env.IMAGES) {
        return new Response('R2 binding missing', { status: 500 });
    }

    try {
        // Get the image key from the URL path
        const key = params.path;

        if (!key) {
            return new Response('Image key required', { status: 400 });
        }

        // Fetch from R2
        const object = await env.IMAGES.get(key);

        if (!object) {
            return new Response('Image not found', { status: 404 });
        }

        // Return the image with proper headers
        const headers = new Headers();
        headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
        headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        headers.set('ETag', object.etag);

        return new Response(object.body, { headers });

    } catch (error) {
        console.error('Image fetch error:', error);
        return new Response('Failed to fetch image', { status: 500 });
    }
};
