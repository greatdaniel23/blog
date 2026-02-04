// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	integrations: [mdx(), sitemap(), react()],
	adapter: cloudflare({
		platformProxy: {
			enabled: true,
		},
	}),
	output: 'server',
	vite: {
		resolve: {
			alias: {
				'react-dom/server': 'react-dom/server.edge',
			},
		},
	},
});

