const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'about.astro');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add imports to frontmatter
if (!content.includes('import { t }')) {
    content = content.replace('import SwissLayout from "../components/SwissLayout.astro";', 
`import SwissLayout from "../components/SwissLayout.astro";
import { t } from "../i18n/translations";
import type { Locale } from "../i18n/utils";

const locale = (Astro.locals as any).locale as Locale || 'id';`);
}

// 2. Replacements dictionary
const replacements = [
    // Meta
    ['title="About Alpha Digital Agency Bali | Daniel Santoso"', 'title={t(locale, "about.meta.title")}'],
    
    // Hero
    ['<h1\n                class="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl text-charcoal dark:text-white leading-[1.1] mb-6"\n            >\n                About.\n            </h1>', 
    `<h1 class="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl text-charcoal dark:text-white leading-[1.1] mb-6">
                {t(locale, "about.hero.h1")}
            </h1>`],
            
    ['<p class="text-xl md:text-2xl text-charcoal/80 dark:text-white/80 font-medium mb-4 max-w-3xl mx-auto">\n                Daniel Santoso — Google Ads Specialist Bali, 9 Tahun Pengalaman untuk Vila & Hotel\n            </p>',
    `<p class="text-xl md:text-2xl text-charcoal/80 dark:text-white/80 font-medium mb-4 max-w-3xl mx-auto">
                {t(locale, "about.hero.h2")}
            </p>`],
            
    ['<p class="text-lg md:text-xl text-charcoal/70 dark:text-white/70 max-w-2xl mx-auto">\n                9 tahun Google Ads untuk hospitality Bali — satu sistem, satu laporan, satu tujuan.\n            </p>',
    `<p class="text-lg md:text-xl text-charcoal/70 dark:text-white/70 max-w-2xl mx-auto">
                {t(locale, "about.hero.subtitle")}
            </p>`],
    
    // Who We Are
    ['<h2 class="font-display font-bold text-3xl md:text-4xl text-charcoal dark:text-white mb-8">\n                    Siapa Kami\n                </h2>',
    `<h2 class="font-display font-bold text-3xl md:text-4xl text-charcoal dark:text-white mb-8">
                    {t(locale, "about.who.h2")}
                </h2>`],
    
    // Expertise
    ['<h2 class="font-display font-bold text-3xl md:text-4xl text-charcoal dark:text-white text-center mb-12">\n                    Keahlian Kami\n                </h2>',
    `<h2 class="font-display font-bold text-3xl md:text-4xl text-charcoal dark:text-white text-center mb-12">
                    {t(locale, "about.expertise.h2")}
                </h2>`],
    ['<h3 class="font-display font-bold text-xl text-charcoal dark:text-white mb-3">\n                            Google Ads — 9 Tahun\n                        </h3>',
    `<h3 class="font-display font-bold text-xl text-charcoal dark:text-white mb-3">
                            {t(locale, "about.expertise.ads.h3")}
                        </h3>`],
    ['<p class="text-charcoal/70 dark:text-white/70">\n                            Spesialisasi kampanye Google Ads untuk vila dan hotel boutique di Bali. Keyword research, bid strategy, creative optimization — berbasis data, bukan asumsi.\n                        </p>',
    `<p class="text-charcoal/70 dark:text-white/70">
                            {t(locale, "about.expertise.ads.p")}
                        </p>`],
                        
    ['<h3 class="font-display font-bold text-xl text-charcoal dark:text-white mb-3">\n                            Data Tracking & Analytics\n                        </h3>',
    `<h3 class="font-display font-bold text-xl text-charcoal dark:text-white mb-3">
                            {t(locale, "about.expertise.tracking.h3")}
                        </h3>`],
    ['<p class="text-charcoal/70 dark:text-white/70">\n                            Setup GA4, GTM, dan Google Search Console yang benar. Laporan bulanan yang menggabungkan data Ads + organik + booking dalam satu tampilan.\n                        </p>',
    `<p class="text-charcoal/70 dark:text-white/70">
                            {t(locale, "about.expertise.tracking.p")}
                        </p>`],
                        
    ['<h3 class="font-display font-bold text-xl text-charcoal dark:text-white mb-3">\n                            Booking Engine Integration\n                        </h3>',
    `<h3 class="font-display font-bold text-xl text-charcoal dark:text-white mb-3">
                            {t(locale, "about.expertise.booking.h3")}
                        </h3>`],
    ['<p class="text-charcoal/70 dark:text-white/70">\n                            Install dan kelola booking engine — platform apa pun, tanpa lock-in vendor. Reservasi langsung terhubung ke laporan Ads Anda.\n                        </p>',
    `<p class="text-charcoal/70 dark:text-white/70">
                            {t(locale, "about.expertise.booking.p")}
                        </p>`],
                        
    ['<h3 class="font-display font-bold text-xl text-charcoal dark:text-white mb-3">\n                            AI Agent untuk Properti\n                        </h3>',
    `<h3 class="font-display font-bold text-xl text-charcoal dark:text-white mb-3">
                            {t(locale, "about.expertise.ai.h3")}
                        </h3>`],
    ['<p class="text-charcoal/70 dark:text-white/70">\n                            Asisten digital 24/7 di website properti Anda — jawab pertanyaan tamu, bantu proses reservasi, terintegrasi dengan booking engine.\n                        </p>',
    `<p class="text-charcoal/70 dark:text-white/70">
                            {t(locale, "about.expertise.ai.p")}
                        </p>`],
    
    // Proof
    ['<h2 class="font-display font-bold text-3xl md:text-4xl text-charcoal dark:text-white text-center mb-12">\n                    Hasil Nyata\n                </h2>',
    `<h2 class="font-display font-bold text-3xl md:text-4xl text-charcoal dark:text-white text-center mb-12">
                    {t(locale, "about.proof.h2")}
                </h2>`],
    ['<p class="text-xl md:text-2xl text-charcoal/90 dark:text-white/90 font-medium italic mb-6 leading-relaxed">\n                        "Properti vila Bali dengan 4 unit — direct booking naik 34% dalam 90 hari setelah audit funnel + optimasi Google Ads."\n                    </p>',
    `<p class="text-xl md:text-2xl text-charcoal/90 dark:text-white/90 font-medium italic mb-6 leading-relaxed">
                        {t(locale, "about.proof.quote")}
                    </p>`],
    ['<p class="text-charcoal/60 dark:text-white/60 font-medium">\n                        — Verified client data. Name withheld per client policy.\n                    </p>',
    `<p class="text-charcoal/60 dark:text-white/60 font-medium">
                        {t(locale, "about.proof.cite")}
                    </p>`],
    
    // FAQ
    ['<h2 class="font-display font-bold text-3xl md:text-4xl text-charcoal dark:text-white mb-12">\n                        Pertanyaan Umum\n                    </h2>',
    `<h2 class="font-display font-bold text-3xl md:text-4xl text-charcoal dark:text-white mb-12">
                        {t(locale, "about.faq.h2")}
                    </h2>`],
    ['<h3 class="font-display font-bold text-xl text-charcoal dark:text-white mb-3">\n                                Siapa di balik Alpha Digital Agency?\n                            </h3>',
    `<h3 class="font-display font-bold text-xl text-charcoal dark:text-white mb-3">
                                {t(locale, "about.faq.1.q")}
                            </h3>`],
    ['<p class="text-charcoal/70 dark:text-white/70">\n                                Daniel Santoso — 9 tahun spesialisasi Google Ads untuk properti hospitality di Bali. Alpha Digital bukan konglomerat besar; kami praktik yang tight, pakai data nyata, dan bertanggung jawab langsung ke Anda.\n                            </p>',
    `<p class="text-charcoal/70 dark:text-white/70">
                                {t(locale, "about.faq.1.a")}
                            </p>`],
                            
    ['<h3 class="font-display font-bold text-xl text-charcoal dark:text-white mb-3">\n                                Mengapa Alpha Digital fokus hanya pada hospitality Bali?\n                            </h3>',
    `<h3 class="font-display font-bold text-xl text-charcoal dark:text-white mb-3">
                                {t(locale, "about.faq.2.q")}
                            </h3>`],
    ['<p class="text-charcoal/70 dark:text-white/70">\n                                Karena spesialisasi menghasilkan hasil lebih baik dari generalisasi. Kami tahu behavior tamu Bali, dinamika OTA di pasar ini, dan struktur kampanye Google Ads yang efektif untuk vila dan hotel boutique.\n                            </p>',
    `<p class="text-charcoal/70 dark:text-white/70">
                                {t(locale, "about.faq.2.a")}
                            </p>`],
                            
    ['<h3 class="font-display font-bold text-xl text-charcoal dark:text-white mb-3">\n                                Apakah Alpha Digital menggunakan AI dalam operasional?\n                            </h3>',
    `<h3 class="font-display font-bold text-xl text-charcoal dark:text-white mb-3">
                                {t(locale, "about.faq.3.q")}
                            </h3>`],
    ['<p class="text-charcoal/70 dark:text-white/70">\n                                Ya — Alpha Digital adalah praktik pertama di Bali yang secara terbuka menggunakan AI end-to-end dalam operasional: dari riset, analisis data, hingga pembuatan konten. Tapi keputusan strategis dan review klien tetap di tangan manusia.\n                            </p>',
    `<p class="text-charcoal/70 dark:text-white/70">
                                {t(locale, "about.faq.3.a")}
                            </p>`],
                            
    ['<h3 class="font-display font-bold text-xl text-charcoal dark:text-white mb-3">\n                                Bagaimana cara Alpha Digital melaporkan hasil ke klien?\n                            </h3>',
    `<h3 class="font-display font-bold text-xl text-charcoal dark:text-white mb-3">
                                {t(locale, "about.faq.4.q")}
                            </h3>`],
    ['<p class="text-charcoal/70 dark:text-white/70">\n                                Kami kirim laporan bulanan yang menggabungkan data Google Ads, Search Console, dan Analytics dalam satu tampilan. Tidak ada laporan 50 halaman yang tidak bisa dibaca — hanya angka yang penting dan rekomendasi aksi nyata.\n                            </p>',
    `<p class="text-charcoal/70 dark:text-white/70">
                                {t(locale, "about.faq.4.a")}
                            </p>`],
    
    // Byline & Links
    ['Ditulis oleh Daniel Santoso &middot; Terakhir diperbarui: Mei 2026', '{t(locale, "about.byline")}'],
    ['<span class="text-sm font-bold tracking-wider uppercase text-charcoal/50 dark:text-white/50 mb-4 block">\n                            Agency\n                        </span>',
    `<span class="text-sm font-bold tracking-wider uppercase text-charcoal/50 dark:text-white/50 mb-4 block">
                            {t(locale, "about.links.agency.label")}
                        </span>`],
    ['<h3 class="font-display font-bold text-xl text-charcoal dark:text-white group-hover:text-primary transition-colors mb-2">\n                            Digital Marketing Agency Bali &rarr;\n                        </h3>',
    `<h3 class="font-display font-bold text-xl text-charcoal dark:text-white group-hover:text-primary transition-colors mb-2">
                            {t(locale, "about.links.agency.title")}
                        </h3>`],
    ['<p class="text-charcoal/70 dark:text-white/70">\n                            Hospitality, direct booking, Ads, SEO, AI.\n                        </p>',
    `<p class="text-charcoal/70 dark:text-white/70">
                            {t(locale, "about.links.agency.desc")}
                        </p>`],
                        
    ['<span class="text-sm font-bold tracking-wider uppercase text-charcoal/50 dark:text-white/50 mb-4 block">\n                            Layanan Utama\n                        </span>',
    `<span class="text-sm font-bold tracking-wider uppercase text-charcoal/50 dark:text-white/50 mb-4 block">
                            {t(locale, "about.links.growth.label")}
                        </span>`],
    ['<h3 class="font-display font-bold text-xl text-charcoal dark:text-white group-hover:text-primary transition-colors mb-2">\n                            Growth — Google Ads &rarr;\n                        </h3>',
    `<h3 class="font-display font-bold text-xl text-charcoal dark:text-white group-hover:text-primary transition-colors mb-2">
                            {t(locale, "about.links.growth.title")}
                        </h3>`],
                        
    ['<span class="text-sm font-bold tracking-wider uppercase text-charcoal/50 dark:text-white/50 mb-4 block">\n                            Full-Funnel\n                        </span>',
    `<span class="text-sm font-bold tracking-wider uppercase text-charcoal/50 dark:text-white/50 mb-4 block">
                            {t(locale, "about.links.authority.label")}
                        </span>`],
    ['<h3 class="font-display font-bold text-xl text-charcoal dark:text-white group-hover:text-primary transition-colors mb-2">\n                            Authority Tier &rarr;\n                        </h3>',
    `<h3 class="font-display font-bold text-xl text-charcoal dark:text-white group-hover:text-primary transition-colors mb-2">
                            {t(locale, "about.links.authority.title")}
                        </h3>`],
    
    // CTA
    ['<h2 class="font-display font-bold text-4xl md:text-5xl text-charcoal dark:text-white mb-6">\n                    Mulai dari Mana?\n                </h2>',
    `<h2 class="font-display font-bold text-4xl md:text-5xl text-charcoal dark:text-white mb-6">
                    {t(locale, "about.cta.h2")}
                </h2>`],
    ['<p class="text-lg text-charcoal/70 dark:text-white/70 max-w-2xl mx-auto mb-10">\n                    Kirim email atau WhatsApp. Kami mulai dengan audit cepat situasi digital properti Anda — gratis, tanpa komitmen.\n                </p>',
    `<p class="text-lg text-charcoal/70 dark:text-white/70 max-w-2xl mx-auto mb-10">
                    {t(locale, "about.cta.p")}
                </p>`],
    ['Minta Penawaran', '{t(locale, "about.cta.email")}'],
    ['WhatsApp', '{t(locale, "about.cta.whatsapp")}']
];

for (const [search, replace] of replacements) {
    if (content.includes(search)) {
        content = content.replace(search, replace);
    }
}

// Special replacements for <p> tags with HTML in them (Who We Are)
const p1Regex = /Alpha Digital Agency adalah praktik marketing hospitality Bali — spesialisasi Google Ads, data tracking lintas channel, dan integrasi booking engine langsung untuk vila dan hotel\. Fokus kami adalah perhotelan mewah di Bali — <strong[^>]*>9 active hospitality clients across Bali<\/strong> yang membutuhkan hasil terukur, bukan sekadar laporan\./;
content = content.replace(p1Regex, 
    '<span set:html={t(locale, "about.who.p1").replace("9 active hospitality clients across Bali", "<strong>9 active hospitality clients across Bali</strong>")} />'
);

const p2Regex = /Daniel Santoso, founder Alpha Digital, membawa 9 tahun kedalaman Google Ads untuk properti hospitality — dilengkapi dengan praktik Data Science modern: GA4 Analytics, <strong[^>]*>BigQuery<\/strong> untuk analisis data skala enterprise, dan <strong[^>]*>AI Agents<\/strong> yang bekerja 24\/7 di website properti Anda\./;
content = content.replace(p2Regex, 
    '<span set:html={t(locale, "about.who.p2").replace("BigQuery", "<strong>BigQuery</strong>").replace("AI Agents", "<strong>AI Agents</strong>")} />'
);

const p3Regex = /Kami <strong[^>]*>tidak menjual tech\. Tidak menjual platform\.<\/strong> Kami memastikan digital marketing dapat diimplementasikan dengan benar dan tepat — sehingga pemilik properti punya gambaran jelas tentang channel mana yang benar-benar menghasilkan reservasi\./;
content = content.replace(p3Regex, 
    '<span set:html={t(locale, "about.who.p3").replace("tidak menjual tech. Tidak menjual platform.", "<strong>tidak menjual tech. Tidak menjual platform.</strong>")} />'
);

const p4Regex = /Kami gabungkan Google Ads, Search Console, dan Analytics dalam satu sistem laporan — supaya iklan berbayar dan pencarian organik <strong[^>]*>tidak saling makan budget<\/strong>, tapi saling mendukung reservasi langsung\./;
content = content.replace(p4Regex, 
    '<span set:html={t(locale, "about.who.p4").replace("tidak saling makan budget", "<strong>tidak saling makan budget</strong>")} />'
);

// Special replacements for proof note
const noteRegex = /Case Study #1 — full breakdown coming soon\. <a href="\/layanan\/" class="text-primary hover:underline">Hubungi kami<\/a> untuk melihat methodology secara detail\./;
content = content.replace(noteRegex, 
    '{t(locale, "about.proof.note")}<a href="/layanan/" class="text-primary hover:underline">{t(locale, "about.proof.note.link")}</a>{t(locale, "about.proof.note.after")}'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Replaced successfully');
