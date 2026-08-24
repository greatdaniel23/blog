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

	// Blog EN slug redirects (2026-08-24)
	'/blog/cara-membuat-website-hotel-booking-langsung-en': '/blog/how-to-create-a-hotel-website-for-direct-booking-bali-en',
	'/blog/memilih-digital-agency-di-bali-untuk-hotel-dan-villa-panduan-strategis-2026-en': '/blog/choosing-a-digital-agency-in-bali-for-hotels-and-villas-2026-en',
	'/blog/cara-meningkatkan-direct-booking-untuk-villa-bali-strategi-praktis-memaksimalkan-pendapatan-en': '/blog/how-to-increase-direct-booking-for-bali-villas-en',
	'/blog/digital-marketing-villa-bali-panduan-langkah-demi-langkah-en': '/blog/digital-marketing-for-bali-villas-step-by-step-guide-en',
	'/blog/data-dulu-baru-ads-en': '/blog/data-first-then-ads-lombok-case-study-en',
	'/blog/panduan-strategi-seo-untuk-website-hotel-villa-di-bali-tahun-2026-en': '/blog/seo-strategy-guide-for-hotel-villa-websites-bali-2026-en',
	'/blog/cara-meningkatkan-repeat-guest-hotel-villa-bali-en': '/blog/how-to-increase-repeat-guests-hotels-villas-bali-en',
	'/blog/revpar-adr-occupancy-3-angka-yang-menentukan-revenue-hotel-anda-en': '/blog/revpar-adr-occupancy-3-numbers-that-determine-your-hotel-revenue-en',
	'/blog/roas-iklan-hotel-berapa-yang-sehat-dan-cara-mengukurnya-en': '/blog/hotel-ads-roas-healthy-benchmark-and-how-to-measure-en',
	'/blog/dashboard-analytics-all-in-one-untuk-klien-digital-marketing-bali-en': '/blog/all-in-one-analytics-dashboard-for-digital-marketing-bali-en',
	'/blog/review-online-hotel-cara-kelola-bali-en': '/blog/how-to-manage-online-hotel-reviews-in-bali-en',
	'/blog/rate-parity-adalah-pengaruhnya-ke-strategi-channel-hotel-en': '/blog/what-is-rate-parity-impact-on-hotel-channel-strategy-en',
	'/blog/jasa-digital-marketing-bali-untuk-hotel-villa-cara-memilih-partner-en': '/blog/digital-marketing-services-bali-for-hotels-villas-how-to-choose-en',
	'/blog/cara-meningkatkan-direct-booking-dari-website-sampai-tracking-en': '/blog/how-to-increase-direct-bookings-from-website-to-tracking-en',
	'/blog/seo-untuk-hotel-villa-bali-en': '/blog/seo-for-bali-hotels-and-villas-en',
	'/blog/booking-engine-adalah-en': '/blog/what-is-a-booking-engine-guide-for-bali-hotels-and-villas-en',
	'/blog/google-tag-manager-adalah-en': '/blog/google-tag-manager-for-hotels-booking-tracking-guide-en',
	'/blog/cara-tracking-konversi-booking-villa-bali-en': '/blog/how-to-track-bali-villa-booking-conversions-ga4-gtm-guide-en',
	'/blog/revolusi-reservasi-hotel-ai-agent-booking-engine-en': '/blog/hotel-reservation-revolution-ai-agent-booking-engine-en',
	'/blog/esensi-digital-marketing-dan-strategi-distribusi-informasi-en': '/blog/the-essence-of-digital-marketing-and-information-distribution-strategy-en',
	'/blog/era-baru-google-ads-mengapa-alpha-digital-agency-memilih-integrasi-llm-anthropic-di-2026-en': '/blog/new-era-of-google-ads-ai-hotel-villa-advertising-2026-en',
	'/blog/google-analytics-4-adalah-en': '/blog/what-is-google-analytics-4-ga4-guide-for-hotels-en',
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
