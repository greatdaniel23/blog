-- 0014_seo_data_landing.sql — seo-data pillar points at its own page (NEXUS 2026-08-07)
--
-- Daniel decision 2026-08-07: /services/seo-data page created (closes the v3
-- static-node gap — the D1 pillar existed since 0007 but had no page). This
-- migration:
--  1. Aligns core_seo_pillars.landing_page_url for 'seo-data' (was stale
--     '/services/foundation') to the LIVE no-slash canonical service page.
--     Value format matches table convention: relative path in
--     landing_page_url, absolute verified URL in evidence_sources (same as
--     migration 0012 rows).
--  2. Seeds the Gap 16 anti-cannibalization registry (static_node_keywords)
--     for the new /services/seo-data static node — its commercial keywords
--     (from 0007 target_keywords) become reserved for the static page
--     (PRD RULE-BR-2); posts must go long-tail.
--
-- Re-runnable: UPDATEs + INSERT OR IGNORE only, no DDL, no drops.

UPDATE core_seo_pillars
SET landing_page_url = '/services/seo-data',
    salience_score = 0.7,
    evidence_sources = '[{"predicate":"landing_page_url","source_url":"https://alphadigitalagency.id/services/seo-data","verification_status":"verified"}]'
WHERE pillar_id = 'seo-data';

INSERT OR IGNORE INTO static_node_keywords (static_url, primary_keyword, keyword_group) VALUES
  ('/services/seo-data', 'jasa seo hotel bali', 'primary'),
  ('/services/seo-data', 'google analytics untuk hotel', 'primary'),
  ('/services/seo-data', 'google search console hotel', 'primary'),
  ('/services/seo-data', 'google tag manager hotel', 'ls'),
  ('/services/seo-data', 'microsoft clarity hotel', 'ls'),
  ('/services/seo-data', 'tracking konversi website hotel', 'ls');
