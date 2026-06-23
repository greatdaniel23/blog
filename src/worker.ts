import type { SSRManifest } from 'astro';
import { App } from 'astro/app';
import { handle } from '@astrojs/cloudflare/handler';

const CANONICAL_ORIGIN = 'https://alphadigitalagency.id';
const NOINDEX = 'noindex, nofollow';

function mustRedirectToCanonical(hostname: string): boolean {
	const host = hostname.toLowerCase();
	return (
		host === 'www.alphadigitalagency.id' ||
		host === 'blogtemplate.pages.dev' ||
		host.endsWith('.blogtemplate.pages.dev')
	);
}

export function createExports(manifest: SSRManifest) {
	const app = new App(manifest);

	return {
		default: {
			async fetch(request: Request, env: any, context: any): Promise<Response> {
				const incoming = new URL(request.url);

				if (mustRedirectToCanonical(incoming.hostname)) {
					const canonical = new URL(incoming.pathname + incoming.search, CANONICAL_ORIGIN);
					return new Response(null, {
						status: 301,
						headers: {
							Location: canonical.toString(),
							'X-Robots-Tag': NOINDEX,
							'Cache-Control': 'public, max-age=3600',
						},
					});
				}

				return handle(manifest, app, request, env, context);
			},
		},
	};
}
