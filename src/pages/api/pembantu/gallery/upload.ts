import type { APIRoute } from 'astro';
import { getSession } from "@/lib/auth";

export const POST: APIRoute = async ({ locals, cookies, request }) => {
    const { env } = locals.runtime;
    const { user } = await getSession(cookies, env?.DB);

    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const formData = await request.formData();
        const files = formData.getAll('images') as File[];

        if (!files || files.length === 0) {
            return new Response(JSON.stringify({ error: 'No files uploaded' }), { status: 400 });
        }

        const uploadedImages: any[] = [];
        const failedUploads: string[] = [];

        for (const file of files) {
            try {
                // Generate unique key: timestamp-filename
                const key = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

                // Upload to R2
                await env.IMAGES.put(key, file.stream(), {
                    httpMetadata: { contentType: file.type }
                });

                // Construct public URL using our proxy
                const imageUrl = `/api/images/${key}`;

                // Insert into DB
                const result = await env.DB.prepare(
                    `INSERT INTO gallery (image_url, caption, created_at)
                     VALUES (?, ?, CURRENT_TIMESTAMP)`
                ).bind(
                    imageUrl,
                    file.name // Use filename as default caption
                ).run();

                uploadedImages.push({
                    id: result.meta.last_row_id,
                    url: imageUrl,
                    caption: file.name
                });

            } catch (err) {
                console.error(`Failed to upload ${file.name}:`, err);
                failedUploads.push(file.name);
            }
        }

        return new Response(JSON.stringify({
            success: true,
            uploaded: uploadedImages,
            failed: failedUploads
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Bulk upload error:', error);
        return new Response(JSON.stringify({ error: 'Failed to process uploads' }), { status: 500 });
    }
};
