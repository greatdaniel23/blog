// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://alphadigitalagency.id',
	integrations: [
		mdx(),
		sitemap({
			filter: (page) => !/\/pembantu(\/|$)/.test(page),
		}),
		react(),
		tailwind({
			applyBaseStyles: false,
		}),
	],
	adapter: cloudflare({
		platformProxy: {
			enabled: true,
		},
	}),
	output: 'server',
});
