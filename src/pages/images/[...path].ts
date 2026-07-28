export const prerender = false;

export async function GET({ params, locals }: { params: { path?: string }; locals: App.Locals }) {
    const { path } = params;
    const { env } = locals.runtime;

    if (!path) {
        return new Response("Image key required", { status: 400 });
    }

    if (!env || !env.IMAGES) {
        return new Response("R2 binding missing", { status: 500 });
    }

    try {
        const object = await env.IMAGES.get(path);

        if (!object) {
            return new Response("Not Found", { status: 404 });
        }

        return new Response(object.body, {
            headers: {
                "Content-Type": object.httpMetadata?.contentType || "image/png",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Image fetch error:", error);
        return new Response("Failed to fetch image", { status: 500 });
    }
}
