const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'src', 'pages', 'index.astro');
let content = fs.readFileSync(indexPath, 'utf-8');

// 1. Add imports to frontmatter
if (!content.includes('import { t }')) {
    content = content.replace('export const prerender = true;\n', ''); // Remove prerender
    content = content.replace('import SwissLayout from "../components/SwissLayout.astro";', 
`import SwissLayout from "../components/SwissLayout.astro";
import { t } from "../i18n/translations";
import type { Locale } from "../i18n/utils";

const locale = (Astro.locals as any).locale as Locale || 'id';`);
}

// 2. Replacements dictionary
const replacements = [
    // Meta (in HTML section, so use {t(...)})
    ['title="Digital Marketing Agency Bali | Alpha Digital"', 'title={t(locale, "home.meta.title")}'],
    ['description="Digital marketing agency Bali for hotels and villas: Google Ads, SEO, booking engine, GA4 tracking, AI agents, and direct booking growth."', 'description={t(locale, "home.meta.description")}'],
    
    // FAQ Objects (in Frontmatter section, use t(...) without curly braces inside strings, or just replace the whole array)
];

// Let's replace the whole homeFaqItems array to be safe
const faqArrayRegex = /const homeFaqItems = \[\s*\{[\s\S]*?\}\s*\];/m;
content = content.replace(faqArrayRegex, 
`const homeFaqItems = [
  {
    q: t(locale, "home.faq.1.q"),
    a: t(locale, "home.faq.1.a")
  },
  {
    q: t(locale, "home.faq.2.q"),
    a: t(locale, "home.faq.2.a")
  },
  {
    q: t(locale, "home.faq.3.q"),
    a: t(locale, "home.faq.3.a")
  },
  {
    q: t(locale, "home.faq.4.q"),
    a: t(locale, "home.faq.4.a")
  },
  {
    q: t(locale, "home.faq.5.q"),
    a: t(locale, "home.faq.5.a")
  },
  {
    q: t(locale, "home.faq.6.q"),
    a: t(locale, "home.faq.6.a")
  },
  {
    q: t(locale, "home.faq.7.q"),
    a: t(locale, "home.faq.7.a")
  },
  {
    q: t(locale, "home.faq.8.q"),
    a: t(locale, "home.faq.8.a")
  }
];`);

// Hero
const heroH1Regex = /<h1\n[\s]*class="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-charcoal dark:text-white leading-\[1\.1\] mb-6"\n[\s]*>\n[\s]*<span class="bg-gradient-to-r from-primary to-primary-dark text-transparent bg-clip-text">Digital marketing agency Bali<\/span> untuk hotel dan vila\.\n[\s]*<\/h1>/;
content = content.replace(heroH1Regex, 
`<h1 class="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-charcoal dark:text-white leading-[1.1] mb-6">
                        <span class="bg-gradient-to-r from-primary to-primary-dark text-transparent bg-clip-text">Digital marketing agency {locale === 'en' ? 'in Bali' : 'Bali'}</span> {locale === 'en' ? 'for hotels and villas.' : 'untuk hotel dan vila.'}
                    </h1>`);

const heroPRegex = /<p class="text-lg md:text-xl text-charcoal\/80 dark:text-white\/80 max-w-2xl mx-auto mb-10 leading-relaxed">\n[\s]*Kami gabungkan Google Ads, SEO, booking engine, GA4 tracking, dan AI Agent dalam satu sistem, supaya setiap rupiah marketing kelihatan hasilnya\. Spesialis hospitality Bali yang ingin kurangi ketergantungan OTA\.\n[\s]*<\/p>/;
content = content.replace(heroPRegex, 
`<p class="text-lg md:text-xl text-charcoal/80 dark:text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
                        {t(locale, "home.hero.subtitle")}
                    </p>`);

// CTA buttons
content = content.replace(
    '<span class="font-bold">Minta Penawaran</span>', 
    '<span class="font-bold">{t(locale, "home.cta.email")}</span>'
);
content = content.replace(
    '<span class="font-bold">0881 480 2249</span>', 
    '<span class="font-bold">{t(locale, "home.cta.phone")}</span>'
);

// Services
content = content.replace(
    '<h2 class="font-display font-bold text-3xl md:text-4xl text-charcoal dark:text-white max-w-3xl leading-[1.2]">\n                    Kami menganalisis jalur konversi &mdash; booking funnel audit secara otomatis\n                </h2>',
    '<h2 class="font-display font-bold text-3xl md:text-4xl text-charcoal dark:text-white max-w-3xl leading-[1.2]">{t(locale, "home.services.h2")}</h2>'
);

const tiers = [
    ['Tier 1', '{t(locale, "home.services.tier1.label")}'],
    ['Foundation', '{t(locale, "home.services.tier1.name")}'],
    ['Tracking benar sebelum scale iklan.', '{t(locale, "home.services.tier1.desc")}'],
    ['Tier 2', '{t(locale, "home.services.tier2.label")}'],
    ['Growth', '{t(locale, "home.services.tier2.name")}'],
    ['Google Ads + audit funnel booking.', '{t(locale, "home.services.tier2.desc")}'],
    ['Tier 3', '{t(locale, "home.services.tier3.label")}'],
    ['Authority', '{t(locale, "home.services.tier3.name")}'],
    ['Semua channel, satu laporan.', '{t(locale, "home.services.tier3.desc")}'],
    ['Tier 4', '{t(locale, "home.services.tier4.label")}'],
    ['Booking Engine', '{t(locale, "home.services.tier4.name")}'],
    ['Install & kelola, tanpa lock-in.', '{t(locale, "home.services.tier4.desc")}']
];

for (const [search, replace] of tiers) {
    // Only replace within the Services grid (roughly 500 characters around) to avoid breaking other things
    content = content.replace(`>
                                ${search}
                            <`, `>
                                ${replace}
                            <`);
}

// Answer section
content = content.replace(
    '<h2 class="font-display font-bold text-3xl md:text-4xl text-charcoal dark:text-white mb-6 leading-tight">\n                        Apa yang membuat Alpha Digital Agency berbeda dari agency digital lain di Bali?\n                    </h2>',
    `<h2 class="font-display font-bold text-3xl md:text-4xl text-charcoal dark:text-white mb-6 leading-tight">
                        {t(locale, "home.answer.h2")}
                    </h2>`
);
content = content.replace(
    '<p class="text-lg text-charcoal/80 dark:text-white/80 leading-relaxed mb-6">\n                        Alpha Digital Agency Indonesia adalah agensi spesialis industri perhotelan mewah (luxury hospitality) di Bali — fokus pada vila, hotel boutique, dan restoran. Tidak seperti agency umum, kami membangun <strong>AI Agents</strong> yang menghubungkan data Google Ads, pencarian organik, dan GA4 ke dalam satu ekosistem terpadu. Sistem ini menganalisis jalur konversi (booking funnel audit) secara otomatis, sehingga setiap rupiah iklan yang dikeluarkan terlacak hingga ke reservasi langsung. Hasilnya: pengurangan ketergantungan OTA dan peningkatan ROI yang terukur — bukan laporan vanity metric.\n                    </p>',
    `<p class="text-lg text-charcoal/80 dark:text-white/80 leading-relaxed mb-6" set:html={t(locale, "home.answer.body").replace("AI Agents", "<strong>AI Agents</strong>")} />`
);

// Marquee - just exact match
const marquees = [
    ['Luxury Hospitality', '{t(locale, "home.marquee.luxury")}'],
    ['Direct Booking', '{t(locale, "home.marquee.direct")}'],
    ['Revenue Growth', '{t(locale, "home.marquee.revenue")}'],
    ['Data Science', '{t(locale, "home.marquee.data")}'],
    ['Conversion Rate', '{t(locale, "home.marquee.conversion")}'],
    ['Brand Equity', '{t(locale, "home.marquee.brand")}'],
];
for (const [search, replace] of marquees) {
    content = content.replace(`>
                            ${search}
                        <`, `>
                            ${replace}
                        <`);
}

// Why section
content = content.replace(
    'Banyak bisnis mencari <strong>digital marketing Bali</strong> karena butuh website, iklan, konten, atau SEO. Untuk hotel, vila, dan restoran, masalahnya lebih spesifik: traffic harus berubah menjadi reservasi langsung, data iklan harus tersambung ke booking engine, dan laporan harus menunjukkan channel mana yang benar-benar menghasilkan revenue.',
    '<span set:html={t(locale, "home.content.p1").replace("digital marketing Bali", "<strong>digital marketing Bali</strong>")} />'
);

content = content.replace(
    'Alpha Digital tidak memposisikan diri sebagai agency umum untuk semua industri. Kami adalah <strong>digital marketing agency in Bali</strong> yang fokus pada hospitality: Google Ads, SEO, GA4/GTM tracking, booking engine integration, dan AI Agent yang membantu tamu sebelum mereka pindah ke OTA. Dalam istilah yang lebih sempit, kami juga tetap relevan untuk pencarian <em>digital agency Bali</em>, tapi fokus kami lebih besar: sistem marketing yang menghasilkan booking.',
    '<span set:html={t(locale, "home.content.p2").replace("digital marketing agency in Bali", "<strong>digital marketing agency in Bali</strong>").replace("digital agency Bali", "<em>digital agency Bali</em>")} />'
);

content = content.replace(
    'Jika Anda mengelola properti di Bali, memilih <strong>digital marketing agency Bali</strong> seharusnya bukan hanya soal siapa yang bisa membuat konten terlihat bagus. Yang lebih penting adalah siapa yang bisa membaca Search Console, menghubungkan campaign Google Ads ke conversion value, memperbaiki halaman yang bocor, dan membangun sistem direct booking yang bisa dievaluasi setiap bulan.',
    '<span set:html={t(locale, "home.content.p3").replace("digital marketing agency Bali", "<strong>digital marketing agency Bali</strong>")} />'
);

const p4BlockRegex = /Karena itu homepage ini menjadi pusat layanan Alpha: dari.*?reporting\./s;
content = content.replace(p4BlockRegex, 
`{t(locale, "home.content.p4")}<a href="/services/growth/" class="text-primary hover:underline">{t(locale, "home.content.p4.link1")}</a>{t(locale, "home.content.p4_2")}<a href="/booking-engine/" class="text-primary hover:underline">{t(locale, "home.content.p4.link2")}</a>{t(locale, "home.content.p4_3")}<a href="/ai-agent/" class="text-primary hover:underline">{t(locale, "home.content.p4.link3")}</a>{t(locale, "home.content.p4_4")}<a href="/ekosistem/" class="text-primary hover:underline">{t(locale, "home.content.p4.link4")}</a>{t(locale, "home.content.p4_5")}`);

// Compare section
const compares = [
    ['How Alpha Compares', '{t(locale, "home.compare.h3")}'],
    ['Creative agency', '{t(locale, "home.compare.creative.title")}'],
    ['Strong for brand identity, photo/video, and campaign look. Often weaker on booking attribution and revenue tracking.', '{t(locale, "home.compare.creative.desc")}'],
    ['Social media agency', '{t(locale, "home.compare.social.title")}'],
    ['Strong for posting cadence and engagement. Not always built around high-intent Google search and direct reservations.', '{t(locale, "home.compare.social.desc")}'],
    ['Web agency', '{t(locale, "home.compare.web.title")}'],
    ['Strong for interface and development. Often stops before Google Ads, GA4, Search Console, and booking-engine feedback loops.', '{t(locale, "home.compare.web.desc")}'],
    ['Alpha Digital', '{t(locale, "home.compare.alpha.title")}'],
    ['Hospitality digital infrastructure: ads, SEO, booking engine, AI Agent, and reporting connected into one direct-booking system for Bali properties.', '{t(locale, "home.compare.alpha.desc")}'],
];
for (const [search, replace] of compares) {
    const rx = new RegExp(`>\\s*${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*<`);
    content = content.replace(rx, `>
                            ${replace}
                        <`);
}

// FAQ Section Title
content = content.replace(
    '<h2 class="font-display font-bold text-3xl md:text-4xl text-charcoal dark:text-white text-center mb-16">\n                    Pertanyaan yang Sering Kami Terima\n                </h2>',
    `<h2 class="font-display font-bold text-3xl md:text-4xl text-charcoal dark:text-white text-center mb-16">
                    {t(locale, "home.faq.h2")}
                </h2>`
);

// Byline
content = content.replace(
    'Ditulis oleh <a href="/daniel-santoso/" class="hover:text-primary transition-colors">Daniel Santoso</a> &middot; Terakhir diperbarui: Mei 2026',
    '{t(locale, "home.faq.byline")} <a href="/daniel-santoso/" class="hover:text-primary transition-colors">{t(locale, "home.faq.byline.author_link")}</a> {t(locale, "home.faq.byline_date")}'
);

for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
}

fs.writeFileSync(indexPath, content, 'utf-8');
console.log('Replaced successfully');
