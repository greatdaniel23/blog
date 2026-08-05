import type { SSRManifest } from 'astro';
import { App } from 'astro/app';
import { handle } from '@astrojs/cloudflare/handler';

const CANONICAL_ORIGIN = 'https://alphadigitalagency.id';
const NOINDEX = 'noindex, nofollow';

// Legacy URL → English URL standard (Daniel decision 2026-08-05, KG-SEO v3 Phase A).
// Old service-page URLs 301 to their /services/* homes. Exact-path map; trailing
// slash normalized before lookup. Subpaths (/ai-agent/demo, /booking/*) untouched.
const LEGACY_REDIRECTS: Record<string, string> = {
	// /layanan → /services (Daniel decision 2026-08-05: temporary target, GSC
	// manual update to follow; /services is the service hub index page).
	'/layanan': '/services',
	'/en/layanan': '/en/services',
	'/ai-agent': '/services/ai-agent',
	'/en/ai-agent': '/en/services/ai-agent',
	'/booking-engine': '/services/booking-engine',
	'/en/booking-engine': '/en/services/booking-engine',
};

function mustRedirectToCanonical(hostname: string): boolean {
	const host = hostname.toLowerCase();
	return (
		host === 'www.alphadigitalagency.id' ||
		host === 'blogtemplate.pages.dev' ||
		host.endsWith('.blogtemplate.pages.dev')
	);
}

/**
 * Rewrite /en/* requests to the canonical path (strip /en prefix)
 * and set X-Locale: en so middleware can set Astro.locals.locale.
 *
 * Architecture (ref src/i18n/utils.ts):
 *   worker.ts rewrites /en/* -> /* and sets X-Locale: en header
 *   middleware.ts reads the header and sets locals.locale
 *   Pages/components read locals.locale and call t(locale, key)
 */
function rewriteEnPath(request: Request): Request {
	const url = new URL(request.url);

	// Match /en exactly or /en/<anything>
	if (url.pathname === '/en' || url.pathname.startsWith('/en/')) {
		// Strip /en prefix to get the canonical path
		const newPath = url.pathname.replace(/^\/en(\/|$)/, '/') || '/';
		const newUrl = new URL(newPath, url.origin);
		newUrl.search = url.search;

		const headers = new Headers(request.headers);
		headers.set('X-Locale', 'en');

		return new Request(newUrl.toString(), {
			method: request.method,
			headers,
			body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
			redirect: request.redirect,
		});
	}

	return request;
}

export function createExports(manifest: SSRManifest) {
	const app = new App(manifest);

	return {
		default: {
			async fetch(request: Request, env: any, context: any): Promise<Response> {
				const incoming = new URL(request.url);

				// Legacy service-URL 301s — run BEFORE the /en/ rewrite so both
				// the bare and /en/ forms map explicitly (locale prefix preserved).
				const pathForRedirect = incoming.pathname.replace(/\/+$/, '') || '/';
				const legacyTarget = LEGACY_REDIRECTS[pathForRedirect];
				if (legacyTarget) {
					return new Response(null, {
						status: 301,
						headers: {
							Location: legacyTarget,
							'Cache-Control': 'public, max-age=3600',
						},
					});
				}

				// /en/ rewrite must run BEFORE canonical redirect so the
				// rewritten path is what gets forwarded, and the canonical
				// redirect (if triggered) uses the correct /en/ origin.
				if (incoming.pathname === '/en' || incoming.pathname.startsWith('/en/')) {
					return handle(manifest, app, rewriteEnPath(request), env, context);
				}

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
