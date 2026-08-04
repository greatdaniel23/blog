-- 0007_new_seo_pillars.sql — Additional Core SEO Pillars (Google Ads, SEO Data, Google Maps)
-- Matches existing pillar format from 023_core_seo_pillars.sql
-- Migration 0007 (applied after 0006_keyword_queue_pillar_id.sql)

INSERT OR IGNORE INTO core_seo_pillars (pillar_id, title, pitch, key_arguments, target_keywords, cta_template, example_topics, landing_page_url, sort_order) VALUES

('google-ads', 'Jualan Google Ads',
 'Daniel Santoso 9 tahun experience Google Ads spesialis hospitality. Alpha bukan jualan klik — kami jualan conversion. Tracking loop: Google Ads → booking engine → GA4 → conversion data balik ke Ads campaign. Setiap rupiah iklan terlacak.',
 '["9 tahun track record Google Ads hospitality","Conversion tracking — bukan vanity metrics","Target ROAS — setiap campaign diukur","Integrasi penuh dengan booking engine + GA4","Negative keyword & audience refinement berkala"]',
 '["google ads hotel bali","jasa iklan google hotel","google ads untuk villa","biaya iklan google ads hotel","cara pasang google ads hotel","google ads agency bali"]',
 'Mau Google Ads yang benar-benar menghasilkan booking — bukan cuma klik? Alpha Digital siap bantu — [hubungi kami] untuk audit akun gratis.',
 '["Berapa Biaya Google Ads untuk Hotel di Bali? Hitungan Real","Google Ads vs OTA — Mana yang Lebih Murah per Booking?","5 Kesalahan Google Ads Hotel yang Bikin Budget Habis","Cara Tracking Booking dari Google Ads Sampai ke GA4"]',
 '/en/services/growth', 4),

('seo-data', 'Jualan SEO & Data Tracking',
 'Website hotel percuma kalau gak bisa diukur. Alpha setup GTM + GA4 + GSC + Microsoft Clarity dari nol — tracking booking, analisa traffic, heatmap user behavior. Tahu persis channel mana yang menghasilkan tamu.',
 '["Setup GTM + GA4 + GSC + Clarity lengkap","Tracking konversi booking — bukan cuma pageview","Tahu channel mana yang ROI-nya paling tinggi","Laporan bulanan dengan insight actionable","Data-driven decisions — bukan feeling"]',
 '["jasa seo hotel bali","google analytics untuk hotel","google tag manager hotel","tracking konversi website hotel","google search console hotel","microsoft clarity hotel"]',
 'Mau tahu persis dari mana tamu hotel kamu berasal? Alpha Digital siap bantu — [hubungi kami] untuk audit tracking gratis.',
 '["Google Analytics 4 untuk Hotel: Setup yang Benar dari Awal","Cara Tracking Booking di Website Hotel — GTM + GA4","Google Search Console untuk Hotel: Kenapa Penting?","Microsoft Clarity: Lihat Bagaimana Tamu Berinteraksi dengan Website Kamu"]',
 '/en/services/foundation', 5),

('google-maps', 'Jualan Google Maps Ranking',
 '70% tamu hotel nemu lewat Google Maps — bukan Google Search. Alpha punya Local Business Grid: rank tracker + GBP optimization. Dominasi pencarian lokal "hotel di [area]" — ranking Maps = booking langsung.',
 '["Local Business Grid — pantau ranking Maps area","GBP optimization — foto, review, post, Q&A","Review management — naikin rating & volume","Local SEO — dominasi pencarian hotel di area","Competitor tracking — tahu posisi kamu vs kompetitor"]',
 '["google maps ranking bali","google business profile hotel","optimasi gmb hotel","local seo hotel bali","cara naikin ranking google maps","google maps marketing hotel"]',
 'Mau hotel kamu muncul #1 di Google Maps untuk area kamu? Alpha Digital siap bantu — [hubungi kami] untuk cek ranking gratis.',
 '["Cara Muncul #1 di Google Maps untuk Hotel Bali","Google Business Profile Hotel: Setup Lengkap 2026","Kenapa Google Maps Lebih Penting dari Google Search untuk Hotel?","Local SEO Hotel Bali: Ranking Maps = Booking Langsung"]',
 '/en/services/growth', 6);

INSERT OR IGNORE INTO pillar_config (pillar_id, posts_per_week, is_active, seo_directive, require_approval) VALUES
  ('google-ads', 2, 1, 'Fokus: Google Ads = conversion, bukan klik. Tiap artikel harus ada data tracking loop (Ads→booking engine→GA4→conversion). Highlight Daniel 9 tahun experience. Hindari overpromise ROAS. CTA: audit akun gratis.', 1),
  ('seo-data', 1, 1, 'Fokus: data-driven decisions untuk hotel. Tiap artikel harus sebut GTM/GA4/GSC specific setup steps. Hindari jargon teknis tanpa penjelasan. CTA: audit tracking gratis.', 1),
  ('google-maps', 1, 1, 'Fokus: Google Maps = direct booking channel. Tiap artikel harus sebut Local Business Grid atau GBP optimization. Tekankan 70% tamu nemu lewat Maps. CTA: cek ranking gratis.', 1);
