// @ts-check

import mdx from '@astrojs/mdx';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

// ── Astro integration: CSS preload hint ────────────────────────────────────
// Adds <link rel="preload" as="style"> for every CSS bundle in prerendered HTML.
// This tells the browser to start fetching CSS at highest priority while still
// parsing the HTML — overlapping download with parse reduces render-blocking time.
// The original <link rel="stylesheet"> is kept (still needed for apply), so this
// is safe: no CLS, no FOUC. Just faster download start.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function addCSSPreloadHints() {
	return {
		name: 'add-css-preload-hints',
		hooks: {
			'astro:build:done': ({ dir }) => {
				// Fix Windows path from file:// URL format
				let distPath = dir.pathname;
				if (process.platform === 'win32') {
					distPath = distPath.replace(/^\/([A-Za-z]:)/, '$1').replace(/\//g, '\\');
				}

				function processDir(dirPath) {
					let entries;
					try { entries = readdirSync(dirPath); } catch { return; }
					for (const entry of entries) {
						const fullPath = join(dirPath, entry);
						let stat;
						try { stat = statSync(fullPath); } catch { continue; }
						if (stat.isDirectory()) {
							processDir(fullPath);
						} else if (entry.endsWith('.html')) {
							let html = readFileSync(fullPath, 'utf-8');
							// For each CSS link, add a preload hint just before it
							const transformed = html.replace(
								/(<link rel="stylesheet" href="(\/_astro\/[^"]+\.css)"([^>]*)>)/g,
								(match, fullTag, href, attrs) => {
									// Add preload hint before the stylesheet link
									const preloadHint = `<link rel="preload" href="${href}" as="style"${attrs}>`;
									return preloadHint + fullTag;
								}
							);
							if (transformed !== html) {
								writeFileSync(fullPath, transformed, 'utf-8');
								console.log(`[css-preload] Added preload hints in ${entry}`);
							}
						}
					}
				}

				processDir(distPath);
			},
		},
	};
}

// https://astro.build/config
export default defineConfig({
	site: 'https://alphadigitalagency.id',
	// trailingSlash kept at Astro's default ('ignore') — flipping to 'never' broke SSR
	// dynamic-route param resolution on the CF adapter (all /blog/<slug> 404'd, 2026-06-09).
	// No-trailing-slash canonicalization is handled via the <link rel="canonical"> tag
	// instead (NEXUS to re-implement the redirect safely + test before next deploy).
	trailingSlash: 'ignore',
	integrations: [
		mdx(),
		// NOTE: @astrojs/sitemap removed 2026-06-09 (NEXUS). It is a BUILD-TIME
		// integration and could not see the SSR (prerender=false) blog posts, so
		// it emitted a competing, blog-less, all-trailing-slash sitemap-index.xml
		// + sitemap-0.xml alongside the authoritative SSR /sitemap.xml. The single
		// source of truth is now src/pages/sitemap.xml.ts (queries D1 directly).
		react(),
		tailwind({
			applyBaseStyles: false,
		}),
		addCSSPreloadHints(),
	],
	adapter: cloudflare({
		// Custom worker entrypoint enforces canonical-host redirects before Astro
		// or static/prerendered content is served.
		workerEntryPoint: {
			path: 'src/worker.ts',
		},
		platformProxy: {
			enabled: true,
		},
	}),
	output: 'server',
	vite: {
		resolve: {
			// Use react-dom edge build for CF Workers (avoids MessageChannel ReferenceError)
			alias: import.meta.env.PROD
				? { 'react-dom/server': 'react-dom/server.edge' }
				: undefined,
		},
	},
});
