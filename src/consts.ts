// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Alpha Digital Agency Indonesia';
export const SITE_DESCRIPTION =
	'Alpha Digital Agency Indonesia — digital marketing agency Bali for hospitality businesses: Google Ads, SEO, booking engine, GA4 tracking, and AI agents.';
export const SITE_URL = 'https://alphadigitalagency.id';
export const SITE_AUTHOR = 'Daniel — Alpha Digital Agency Indonesia';
export const SITE_LOGO = 'https://alphadigitalagency.id/favicon.svg';
// SITE_SOCIAL: confirmed handles for Organization JSON-LD sameAs.
// - LinkedIn: Daniel confirmed Decision Inbox D-002 2026-05-12 (numeric company ID URL).
// - Threads: account not yet created (Daniel D-003). Omitted intentionally.
//   NOTE: `@hedonatbali` is Daniel's personal travel account per SOSMED CLAUDE.md L14
//   and MUST NEVER appear in Alpha Digital Organization JSON-LD sameAs.
export const SITE_SOCIAL: { linkedin?: string; threads?: string } = {
	linkedin: 'https://www.linkedin.com/company/100833894',
};

// ─────────────────────────────────────────────────────────────────────────────
// SOCIAL_LINKS — footer social-icon row (SwissFooter.astro).
// ALPHA: fill each value with the real, VERIFIED public profile URL before deploy.
// Any link still set to a "TODO…" placeholder is OMITTED at render (never shipped
// as a broken/placeholder href). Do NOT guess or invent a social URL here.
// ─────────────────────────────────────────────────────────────────────────────
export const SOCIAL_LINKS: { linkedin: string; instagram: string; threads: string } = {
	// LinkedIn = verified company page (D-002). Instagram + Threads stay TODO →
	// auto-omitted at render: no official Alpha IG/Threads account exists yet
	// (Threads not created per D-003; @hedonatbali is Daniel's PERSONAL account and
	// must never represent Alpha Digital). Fill only when real Alpha accounts exist.
	linkedin: 'https://www.linkedin.com/company/100833894',
	instagram: 'TODO-ALPHA-FILL',
	threads: 'TODO-ALPHA-FILL',
};
