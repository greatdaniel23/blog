import type { APIRoute } from 'astro';

// Serve robots.txt dynamically to bypass Cloudflare Pages'
// auto-generated robots.txt with Content-Signal headers (which Lighthouse
// flags as invalid). Standard robots.txt syntax only.
export const prerender = false;

export const GET: APIRoute = () => {
	const content = `User-agent: *
Disallow: /pembantu/
Disallow: /api/

# Block AI training crawlers
User-agent: GPTBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Amazonbot
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: meta-externalagent
Disallow: /

Sitemap: https://alphadigitalagency.id/sitemap-index.xml
`;

	return new Response(content, {
		status: 200,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400',
		},
	});
};
