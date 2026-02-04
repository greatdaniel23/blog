import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
    const { env } = locals.runtime;

    if (!env || !env.IMAGES) {
        return new Response(JSON.stringify({ error: 'R2 binding missing' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('image') as File;
        const caption = formData.get('caption') as string || '';
        const altText = formData.get('alt_text') as string || '';

        if (!file) {
            return new Response(JSON.stringify({ error: 'No image file provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Generate unique key for the image
        const timestamp = Date.now();
        const extension = file.name.split('.').pop() || 'jpg';
        const key = `gallery/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;

        // Upload to R2
        const arrayBuffer = await file.arrayBuffer();
        await env.IMAGES.put(key, arrayBuffer, {
            httpMetadata: {
                contentType: file.type,
            },
        });

        // Get the next display order
        const orderResult = await env.DB.prepare(
            "SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM gallery"
        ).first<{ next_order: number }>();
        const displayOrder = orderResult?.next_order || 1;

        // Insert into database
        const imageUrl = `/api/images/${key}`;
        await env.DB.prepare(
            `INSERT INTO gallery (image_url, caption, alt_text, display_order, is_published) 
			 VALUES (?, ?, ?, ?, 1)`
        ).bind(imageUrl, caption, altText, displayOrder).run();

        return new Response(JSON.stringify({
            success: true,
            key,
            url: imageUrl
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Upload error:', error);
        return new Response(JSON.stringify({ error: 'Upload failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

// GET: List all images in gallery
export const GET: APIRoute = async ({ locals }) => {
    const { env } = locals.runtime;

    if (!env || !env.DB) {
        return new Response(JSON.stringify({ error: 'DB binding missing' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { results } = await env.DB.prepare(
            "SELECT * FROM gallery WHERE is_published = 1 ORDER BY display_order ASC"
        ).all();

        return new Response(JSON.stringify({ images: results }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Fetch error:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch images' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
