import type { APIRoute } from 'astro';

export const prerender = false;

const SITE = 'https://alphadigitalagency.id';

// Public, indexable static routes.
//
// SLASH POLICY (verified live 2026-06-09, NEXUS): the site has TWO URL regimes
// and every sitemap URL MUST be listed at the exact form that returns HTTP 200
// DIRECTLY (a sitemap of 301/308 redirects is an SEO defect):
//   • SSR / middleware routes serve NO-slash (slash 301s):
//       /  ·  /blog  ·  /booking-engine  ·  /gallery
//   • Static (prerendered) pages serve TRAILING-slash (no-slash 308s):
//       /about/  ·  /ai-agent/  ·  /ekosistem/  ·  /services/*  ·  /privacy-policy/
// We cannot cleanly unify to all-no-slash: trailingSlash:'never' broke SSR
// dynamic-route resolution (2026-06-09), and there is no safe CF-Pages-level
// toggle for the static auto-redirect before the deadline. KNOWN RESIDUAL:
// static pages emit a no-slash <link rel="canonical"> while serving at the
// trailing-slash URL — a canonical-vs-served mismatch to reconcile later.
//
// Excludes: /pembantu (admin), /api/*, /404, rss.xml, the booking proxy, and
// /ai-agent/demo/ (noindex — ALPHA decision 2026-06-09).
const STATIC_ROUTES: Array<{ path: string; changefreq: string; priority: string }> = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/about/', changefreq: 'monthly', priority: '0.7' },
  { path: '/daniel-santoso/', changefreq: 'monthly', priority: '0.7' },
  { path: '/ai-agent/', changefreq: 'monthly', priority: '0.8' },
  { path: '/booking-engine', changefreq: 'monthly', priority: '0.8' },
  { path: '/ekosistem/', changefreq: 'monthly', priority: '0.7' },
  { path: '/gallery', changefreq: 'monthly', priority: '0.6' },
  { path: '/blog', changefreq: 'daily', priority: '0.7' },
  { path: '/layanan/', changefreq: 'monthly', priority: '0.7' },
  { path: '/kelas/', changefreq: 'monthly', priority: '0.5' },
  { path: '/kelas/digital-marketing-fundamental/', changefreq: 'monthly', priority: '0.4' },
  { path: '/kelas/google-ads/', changefreq: 'monthly', priority: '0.4' },
  { path: '/kelas/ai-produktivitas-karyawan/', changefreq: 'monthly', priority: '0.4' },
  { path: '/kelas/seo-google-analytics/', changefreq: 'monthly', priority: '0.4' },
  { path: '/kelas/ai-agent-chatbot/', changefreq: 'monthly', priority: '0.4' },
  { path: '/kelas/ai-untuk-orang-tua/', changefreq: 'monthly', priority: '0.3' },
  { path: '/services/authority/', changefreq: 'monthly', priority: '0.8' },
  { path: '/services/booking-integration/', changefreq: 'monthly', priority: '0.8' },
  { path: '/services/foundation/', changefreq: 'monthly', priority: '0.8' },
  { path: '/services/growth/', changefreq: 'monthly', priority: '0.8' },
  { path: '/privacy-policy/', changefreq: 'yearly', priority: '0.3' },
];

type PostRow = { slug: string; pub_date: string | null; updated_at: string | null };

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isoDate(v: string | null): string | null {
  if (!v) return null;
  // pub_date is stored as "YYYY-MM-DD HH:MM:SS". Treat it as UTC.
  const d = new Date(v.replace(' ', 'T') + 'Z');
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export const GET: APIRoute = async ({ locals }) => {
  const env: any = (locals as any).runtime?.env ?? {};
  const db: D1Database | undefined = env.DB;

  let posts: PostRow[] = [];
  if (db) {
    try {
      // Same filter as blog/index.astro (schema: is_published / pub_date).
      const rs = await db
        .prepare(
          `SELECT slug, pub_date, updated_at
           FROM posts
           WHERE is_published = 1
           ORDER BY pub_date DESC
           LIMIT 5000`
        )
        .all<PostRow>();
      posts = (rs.results ?? []) as PostRow[];
    } catch (e) {
      // Fail soft — still emit static routes so the sitemap is never broken.
      console.error('[sitemap] post fetch failed', e);
    }
  }

  const urls: string[] = [];

  for (const r of STATIC_ROUTES) {
    urls.push(
      `  <url>\n` +
        `    <loc>${SITE}${r.path}</loc>\n` +
        `    <changefreq>${r.changefreq}</changefreq>\n` +
        `    <priority>${r.priority}</priority>\n` +
        `  </url>`
    );
  }

  for (const p of posts) {
    if (!p.slug) continue;
    // Prefer updated_at (most recent edit) for lastmod; fall back to pub_date.
    const lastmod = isoDate(p.updated_at) ?? isoDate(p.pub_date);
    urls.push(
      `  <url>\n` +
        `    <loc>${SITE}/blog/${xmlEscape(p.slug)}</loc>\n` +
        (lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : '') +
        `    <changefreq>monthly</changefreq>\n` +
        `    <priority>0.6</priority>\n` +
        `  </url>`
    );
  }

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.join('\n') +
    `\n</urlset>\n`;

  return new Response(body, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=600',
    },
  });
};
