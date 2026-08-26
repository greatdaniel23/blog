import type { APIRoute } from 'astro';

export const prerender = false;

const SITE = 'https://alphadigitalagency.id';

// Static routes with exact bilingual alternate relationships
interface StaticRouteConfig {
  path: string;
  changefreq: string;
  priority: string;
  altPath?: string;
  lang?: 'id' | 'en';
}

const STATIC_ROUTES: StaticRouteConfig[] = [
  // Core Pages (Indonesian)
  { path: '/', changefreq: 'weekly', priority: '1.0', altPath: '/en', lang: 'id' },
  { path: '/about', changefreq: 'monthly', priority: '0.7', altPath: '/en/about', lang: 'id' },
  { path: '/daniel-santoso', changefreq: 'monthly', priority: '0.7', altPath: '/en/daniel-santoso', lang: 'id' },
  { path: '/services', changefreq: 'monthly', priority: '0.8', altPath: '/en', lang: 'id' },
  { path: '/services/foundation', changefreq: 'monthly', priority: '0.8', altPath: '/en/services/foundation', lang: 'id' },
  { path: '/services/growth', changefreq: 'monthly', priority: '0.8', altPath: '/en/services/growth', lang: 'id' },
  { path: '/services/authority', changefreq: 'monthly', priority: '0.8', altPath: '/en/services/authority', lang: 'id' },
  { path: '/services/booking-engine', changefreq: 'monthly', priority: '0.8', altPath: '/en/services/booking-integration', lang: 'id' },
  { path: '/services/booking-integration', changefreq: 'monthly', priority: '0.8', altPath: '/en/services/booking-integration', lang: 'id' },
  { path: '/services/ai-agent', changefreq: 'monthly', priority: '0.8', altPath: '/en/services/authority', lang: 'id' },
  { path: '/services/google-ads', changefreq: 'monthly', priority: '0.7', altPath: '/en/services/growth', lang: 'id' },
  { path: '/services/seo-data', changefreq: 'monthly', priority: '0.8', altPath: '/en/services/seo-data', lang: 'id' },
  { path: '/seo', changefreq: 'weekly', priority: '0.8', altPath: '/en/seo', lang: 'id' },
  { path: '/ekosistem', changefreq: 'monthly', priority: '0.7', altPath: '/en/ekosistem', lang: 'id' },
  { path: '/gallery', changefreq: 'monthly', priority: '0.6', lang: 'id' },
  { path: '/blog', changefreq: 'daily', priority: '0.7', altPath: '/blog', lang: 'id' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3', altPath: '/en/privacy-policy', lang: 'id' },

  // English Core Pages
  { path: '/en', changefreq: 'weekly', priority: '1.0', altPath: '/', lang: 'en' },
  { path: '/en/about', changefreq: 'monthly', priority: '0.7', altPath: '/about', lang: 'en' },
  { path: '/en/daniel-santoso', changefreq: 'monthly', priority: '0.7', altPath: '/daniel-santoso', lang: 'en' },
  { path: '/en/ekosistem', changefreq: 'monthly', priority: '0.7', altPath: '/ekosistem', lang: 'en' },
  { path: '/en/seo', changefreq: 'weekly', priority: '0.8', altPath: '/seo', lang: 'en' },
  { path: '/en/services/foundation', changefreq: 'monthly', priority: '0.8', altPath: '/services/foundation', lang: 'en' },
  { path: '/en/services/growth', changefreq: 'monthly', priority: '0.8', altPath: '/services/growth', lang: 'en' },
  { path: '/en/services/authority', changefreq: 'monthly', priority: '0.8', altPath: '/services/authority', lang: 'en' },
  { path: '/en/services/booking-integration', changefreq: 'monthly', priority: '0.8', altPath: '/services/booking-integration', lang: 'en' },
  { path: '/en/services/seo-data', changefreq: 'monthly', priority: '0.8', altPath: '/services/seo-data', lang: 'en' },
  { path: '/en/privacy-policy', changefreq: 'yearly', priority: '0.3', altPath: '/privacy-policy', lang: 'en' },

  // Classes / Training (Indonesian)
  { path: '/kelas', changefreq: 'monthly', priority: '0.5', altPath: '/en/kelas', lang: 'id' },
  { path: '/kelas/digital-marketing-fundamental', changefreq: 'monthly', priority: '0.4', altPath: '/en/kelas/digital-marketing-fundamental', lang: 'id' },
  { path: '/kelas/google-ads', changefreq: 'monthly', priority: '0.4', altPath: '/en/kelas/google-ads', lang: 'id' },
  { path: '/kelas/ai-produktivitas-karyawan', changefreq: 'monthly', priority: '0.4', altPath: '/en/kelas/ai-produktivitas-karyawan', lang: 'id' },
  { path: '/kelas/seo-google-analytics', changefreq: 'monthly', priority: '0.4', altPath: '/en/kelas/seo-google-analytics', lang: 'id' },
  { path: '/kelas/ai-agent-chatbot', changefreq: 'monthly', priority: '0.4', altPath: '/en/kelas/ai-agent-chatbot', lang: 'id' },
  { path: '/kelas/ai-untuk-orang-tua', changefreq: 'monthly', priority: '0.3', altPath: '/en/kelas/ai-untuk-orang-tua', lang: 'id' },

  // Classes / Training (English)
  { path: '/en/kelas', changefreq: 'monthly', priority: '0.5', altPath: '/kelas', lang: 'en' },
  { path: '/en/kelas/digital-marketing-fundamental', changefreq: 'monthly', priority: '0.4', altPath: '/kelas/digital-marketing-fundamental', lang: 'en' },
  { path: '/en/kelas/google-ads', changefreq: 'monthly', priority: '0.4', altPath: '/kelas/google-ads', lang: 'en' },
  { path: '/en/kelas/ai-produktivitas-karyawan', changefreq: 'monthly', priority: '0.4', altPath: '/kelas/ai-produktivitas-karyawan', lang: 'en' },
  { path: '/en/kelas/seo-google-analytics', changefreq: 'monthly', priority: '0.4', altPath: '/kelas/seo-google-analytics', lang: 'en' },
  { path: '/en/kelas/ai-agent-chatbot', changefreq: 'monthly', priority: '0.4', altPath: '/kelas/ai-agent-chatbot', lang: 'en' },
  { path: '/en/kelas/ai-untuk-orang-tua', changefreq: 'monthly', priority: '0.3', altPath: '/kelas/ai-untuk-orang-tua', lang: 'en' },

  // Evergreen Pillar Hubs
  { path: '/blog/pillar/digital-marketing-bali', changefreq: 'weekly', priority: '0.7', lang: 'id' },
  { path: '/blog/pillar/google-ads', changefreq: 'weekly', priority: '0.7', lang: 'id' },
  { path: '/blog/pillar/digital-marketing-for-hotel', changefreq: 'weekly', priority: '0.7', lang: 'id' },
  { path: '/blog/pillar/booking-engine', changefreq: 'weekly', priority: '0.7', lang: 'id' },
  { path: '/blog/pillar/ai-agent', changefreq: 'weekly', priority: '0.7', lang: 'id' },
];

type PostRow = { id: number; slug: string; language: string | null; pub_date: string | null; updated_at: string | null };
type PairRow = { id_post_id: number; en_post_id: number };

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
  const d = new Date(v.replace(' ', 'T') + 'Z');
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export const GET: APIRoute = async ({ locals }) => {
  const env: any = (locals as any).runtime?.env ?? {};
  const db: D1Database | undefined = env.DB;

  let posts: PostRow[] = [];
  const pairMap = new Map<number, number>(); // id_post_id -> en_post_id & en_post_id -> id_post_id
  const postMap = new Map<number, PostRow>();

  if (db) {
    try {
      const [postRes, pairRes] = await Promise.all([
        db
          .prepare(
            `SELECT id, slug, language, pub_date, updated_at
             FROM posts
             WHERE is_published = 1
             ORDER BY pub_date DESC
             LIMIT 5000`
          )
          .all<PostRow>(),
        db
          .prepare(
            `SELECT id_post_id, en_post_id
             FROM content_work_items
             WHERE id_post_id IS NOT NULL AND en_post_id IS NOT NULL`
          )
          .all<PairRow>()
      ]);

      posts = (postRes.results ?? []) as PostRow[];
      for (const p of posts) {
        postMap.set(p.id, p);
      }

      const pairs = (pairRes.results ?? []) as PairRow[];
      for (const pair of pairs) {
        pairMap.set(pair.id_post_id, pair.en_post_id);
        pairMap.set(pair.en_post_id, pair.id_post_id);
      }
    } catch (e) {
      console.error('[sitemap] post fetch failed', e);
    }
  }

  const urls: string[] = [];

  // Static routes
  for (const r of STATIC_ROUTES) {
    const lines: string[] = [];
    lines.push(`  <url>`);
    lines.push(`    <loc>${SITE}${r.path}</loc>`);

    if (r.altPath) {
      if (r.lang === 'id') {
        lines.push(`    <xhtml:link rel="alternate" hreflang="id" href="${SITE}${r.path}"/>`);
        lines.push(`    <xhtml:link rel="alternate" hreflang="en" href="${SITE}${r.altPath}"/>`);
      } else if (r.lang === 'en') {
        lines.push(`    <xhtml:link rel="alternate" hreflang="id" href="${SITE}${r.altPath}"/>`);
        lines.push(`    <xhtml:link rel="alternate" hreflang="en" href="${SITE}${r.path}"/>`);
        lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${r.path}"/>`);
      }
    }

    lines.push(`    <changefreq>${r.changefreq}</changefreq>`);
    lines.push(`    <priority>${r.priority}</priority>`);
    lines.push(`  </url>`);
    urls.push(lines.join('\n'));
  }

  // Dynamic blog posts
  for (const p of posts) {
    if (!p.slug) continue;
    const lastmod = isoDate(p.updated_at) ?? isoDate(p.pub_date);
    const isEn = p.language === 'en' || p.slug.endsWith('-en');
    const twinPostId = pairMap.get(p.id);
    const twinPost = twinPostId ? postMap.get(twinPostId) : undefined;
    const currentLoc = `${SITE}/blog/${xmlEscape(p.slug)}`;
    const twinLoc = twinPost?.slug ? `${SITE}/blog/${xmlEscape(twinPost.slug)}` : null;

    const lines: string[] = [];
    lines.push(`  <url>`);
    lines.push(`    <loc>${currentLoc}</loc>`);

    if (isEn) {
      if (twinLoc) {
        lines.push(`    <xhtml:link rel="alternate" hreflang="id" href="${twinLoc}"/>`);
      }
      lines.push(`    <xhtml:link rel="alternate" hreflang="en" href="${currentLoc}"/>`);
      lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${currentLoc}"/>`);
    } else {
      lines.push(`    <xhtml:link rel="alternate" hreflang="id" href="${currentLoc}"/>`);
      if (twinLoc) {
        lines.push(`    <xhtml:link rel="alternate" hreflang="en" href="${twinLoc}"/>`);
      }
    }

    if (lastmod) {
      lines.push(`    <lastmod>${lastmod}</lastmod>`);
    }
    lines.push(`    <changefreq>monthly</changefreq>`);
    lines.push(`    <priority>0.6</priority>`);
    lines.push(`  </url>`);

    urls.push(lines.join('\n'));
  }

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    urls.join('\n') +
    `\n</urlset>\n`;

  return new Response(body, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=600',
    },
  });
};
