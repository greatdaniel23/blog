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
        let object = await env.IMAGES.get(path);

        // Try alternative extensions (.webp <-> .png)
        if (!object && path.endsWith('.png')) {
            object = await env.IMAGES.get(path.replace(/\.png$/, '.webp'));
        } else if (!object && path.endsWith('.webp')) {
            object = await env.IMAGES.get(path.replace(/\.webp$/, '.png'));
        }

        // Try prefixing heroes/
        if (!object && !path.startsWith('heroes/')) {
            object = await env.IMAGES.get(`heroes/${path}`);
            if (!object && path.endsWith('.png')) {
                object = await env.IMAGES.get(`heroes/${path.replace(/\.png$/, '.webp')}`);
            }
        }

        if (!object) {
            // Try default fallback hero
            object = await env.IMAGES.get("heroes/og-alpha-default.webp") || await env.IMAGES.get("og-alpha-default.webp");
        }

        if (!object) {
            return new Response("Not Found", { status: 404 });
        }

        return new Response(object.body, {
            headers: {
                "Content-Type": object.httpMetadata?.contentType || (path.endsWith('.webp') ? "image/webp" : "image/png"),
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Image fetch error:", error);
        return new Response("Failed to fetch image", { status: 500 });
    }
}

