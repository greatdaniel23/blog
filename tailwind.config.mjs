import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				primary: "#059669",
				"primary-dark": "#047857",
				charcoal: "#0f172a",
				slate: "#64748b",
				"background-light": "#f8fafc",
				"background-dark": "#020617",
				"emerald-dark": "#064e3b",
				"emerald-mid": "#4c9a66",
			},
			fontFamily: {
				display: ["Manrope", "sans-serif"],
				body: ["Manrope", "sans-serif"],
			},
			borderRadius: {
				DEFAULT: "0.125rem",
				lg: "0.25rem",
			},
			boxShadow: {
				premium: "5px 3px 0px 0px rgba(15, 23, 42, 1)",
				"premium-hover": "2px 1px 0px 0px rgba(15, 23, 42, 1)",
				"premium-dark": "5px 3px 0px 0px rgba(255, 255, 255, 0.9)",
				"premium-dark-hover": "2px 1px 0px 0px rgba(255, 255, 255, 0.9)",
				glow: "0 0 15px rgba(5, 150, 105, 0.4)",
				"inner-light": "inset 0 1px 0 0 rgba(255, 255, 255, 0.4)",
			},
			letterSpacing: {
				tightest: "-0.05em",
				tight: "-0.03em",
			},
			lineHeight: {
				display: "0.9",
			},
			animation: {
				"marquee-left": "marquee-left 40s linear infinite",
			},
			keyframes: {
				"marquee-left": {
					"0%": { transform: "translateX(0%)" },
					"100%": { transform: "translateX(-50%)" },
				},
			},
			backgroundImage: {
				"noise-pattern": "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.7%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%221%22/%3E%3C/svg%3E')",
			},
			// Typography (@tailwindcss/typography) — article `prose` rendering.
			// Two deliberate overrides on top of the default prose theme:
			//  1. Images get markedly MORE vertical breathing room than the
			//     paragraph rhythm, so an image reads as its own block.
			//  2. Code blocks render as an obvious dark code-box (padding,
			//     rounded corners, border, monospace, horizontal scroll).
			typography: () => ({
				DEFAULT: {
					css: {
						// (1) Image spacing — distinct from paragraph rhythm.
						// Default prose img margin is ~2em; bump to 3.5em top/bottom
						// (paragraph spacing is ~1.25em) for clear separation.
						img: {
							marginTop: "3.5em",
							marginBottom: "3.5em",
						},
						figure: {
							marginTop: "3.5em",
							marginBottom: "3.5em",
						},
						// (2) Code-box — distinct dark block, not flat body text.
						// NOTE: this project redefines `slate` as a FLAT color, so
						// theme("colors.slate.900") is undefined — use hex literals.
						pre: {
							backgroundColor: "#0f172a",
							color: "#e2e8f0",
							padding: "1.25em 1.5em",
							borderRadius: "0.5rem",
							border: "1px solid #334155",
							overflowX: "auto",
							fontSize: "0.875em",
							lineHeight: "1.7",
							fontFamily:
								"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
							marginTop: "2em",
							marginBottom: "2em",
						},
						"pre code": {
							backgroundColor: "transparent",
							color: "inherit",
							padding: "0",
							borderRadius: "0",
							fontWeight: "400",
							fontSize: "inherit",
						},
						// Inline code (not inside <pre>) — tinted chip.
						"code::before": { content: '""' },
						"code::after": { content: '""' },
					},
				},
			}),
		},
	},
	plugins: [
		forms,
		containerQueries,
		typography,
	],
}
