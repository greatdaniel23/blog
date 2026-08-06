-- 0012_entity_store_completion.sql — KG-SEO v3 static scope (NEXUS 2026-08-06)
--
-- Completes the v3 entity store on the EXISTING taxonomy (Gap #4 Phase A):
--  1. Corrects spec-fabricated Wikidata QIDs. Verified via Wikidata
--     wbsearchentities + wbgetentities (2026-08-06, en labels):
--       Q271982 = Google Ads    (Q43452 is "Autonomous University of Barcelona")
--       Q12013  = Google Maps   (Q162620 is a province of Spain)
--       Q3125978 = Bali (province of Indonesia) — used in areaServed
--  2. Aligns core_seo_pillars.landing_page_url to the LIVE no-slash canonical
--     service pages (D-SEO-002; all targets verified HTTP 200 2026-08-06).
--     The stale /en/ locale-prefixed values are dropped.
--  3. Fills attribute salience + evidence_sources per entity_graph_schema.json.
--
-- Re-runnable: UPDATEs only, no DDL, no drops.

-- ── 1) content_pillars (5 spec content pillars) ────────────────────────────
UPDATE content_pillars
SET wikidata_id = 'Q271982',
    evidence_sources = '[{"predicate":"wikidata_id","source_url":"https://www.wikidata.org/wiki/Q271982","verification_status":"verified"}]'
WHERE pillar_id = 'google-ads';

UPDATE content_pillars
SET evidence_sources = '[{"predicate":"wikidata_id","source_url":"https://www.wikidata.org/wiki/Q1323528","verification_status":"verified"}]'
WHERE pillar_id = 'digital-marketing-bali';

UPDATE content_pillars
SET evidence_sources = '[{"predicate":"wikidata_id","source_url":"https://www.wikidata.org/wiki/Q27686","verification_status":"verified"}]'
WHERE pillar_id = 'digital-marketing-for-hotel';

UPDATE content_pillars
SET evidence_sources = '[{"predicate":"wikidata_id","source_url":"https://www.wikidata.org/wiki/Q11660","verification_status":"verified"}]'
WHERE pillar_id = 'ai-agent';

-- booking-engine: verified NO high-confidence Wikidata entity (2026-08-05/06);
-- closest candidate "online booking system" Q57496985 — not used, documented.
UPDATE content_pillars
SET evidence_sources = '[{"predicate":"wikidata_id","source_url":"","verification_status":"pending","note":"no high-confidence Wikidata entity; closest: Q57496985 (online booking system)"}]'
WHERE pillar_id = 'booking-engine';

-- ── 2) core_seo_pillars (6 product pillars) — QID + landing alignment ──────
UPDATE core_seo_pillars
SET wikidata_id = 'Q271982',
    landing_page_url = '/services/google-ads',
    salience_score = 0.9,
    evidence_sources = '[{"predicate":"wikidata_id","source_url":"https://www.wikidata.org/wiki/Q271982","verification_status":"verified"},{"predicate":"landing_page_url","source_url":"https://alphadigitalagency.id/services/google-ads","verification_status":"verified"}]'
WHERE pillar_id = 'google-ads';

UPDATE core_seo_pillars
SET wikidata_id = 'Q12013',
    landing_page_url = '/services/growth',
    salience_score = 0.9,
    evidence_sources = '[{"predicate":"wikidata_id","source_url":"https://www.wikidata.org/wiki/Q12013","verification_status":"verified"},{"predicate":"landing_page_url","source_url":"https://alphadigitalagency.id/services/growth","verification_status":"verified"}]'
WHERE pillar_id = 'google-maps';

UPDATE core_seo_pillars
SET landing_page_url = '/services/booking-engine',
    salience_score = 0.8,
    evidence_sources = '[{"predicate":"landing_page_url","source_url":"https://alphadigitalagency.id/services/booking-engine","verification_status":"verified"}]'
WHERE pillar_id = 'booking-engine';

UPDATE core_seo_pillars
SET landing_page_url = '/services/ai-agent',
    salience_score = 0.8,
    evidence_sources = '[{"predicate":"landing_page_url","source_url":"https://alphadigitalagency.id/services/ai-agent","verification_status":"verified"}]'
WHERE pillar_id = 'ai-agent';

UPDATE core_seo_pillars
SET landing_page_url = '/services/growth',
    salience_score = 0.8,
    evidence_sources = '[{"predicate":"landing_page_url","source_url":"https://alphadigitalagency.id/services/growth","verification_status":"verified"}]'
WHERE pillar_id = 'website';

UPDATE core_seo_pillars
SET landing_page_url = '/services/foundation',
    salience_score = 0.7,
    evidence_sources = '[{"predicate":"landing_page_url","source_url":"https://alphadigitalagency.id/services/foundation","verification_status":"verified"}]'
WHERE pillar_id = 'seo-data';
