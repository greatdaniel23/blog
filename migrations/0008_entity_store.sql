-- 0008_entity_store.sql — Knowledge Graph SEO v3 entity attributes
-- Adds v3 entity attributes to existing product pillars + new content-pillar layer.
-- Product pillars (core_seo_pillars) are NOT dropped or renamed — extended only.

ALTER TABLE core_seo_pillars ADD COLUMN wikidata_id TEXT;
ALTER TABLE core_seo_pillars ADD COLUMN kgmid TEXT;
ALTER TABLE core_seo_pillars ADD COLUMN place_id TEXT;
ALTER TABLE core_seo_pillars ADD COLUMN salience_score REAL NOT NULL DEFAULT 0.0;
ALTER TABLE core_seo_pillars ADD COLUMN evidence_sources TEXT NOT NULL DEFAULT '[]';

-- Content pillars (blog strategy / entity graph layer) — 5 spec pillars.
-- product_pillar_id links to the matching product pillar where the domain overlaps.
CREATE TABLE IF NOT EXISTS content_pillars (
  pillar_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  hub_topic TEXT,
  description TEXT,
  product_pillar_id TEXT,
  wikidata_id TEXT,
  kgmid TEXT,
  place_id TEXT,
  salience_score REAL NOT NULL DEFAULT 0.0,
  evidence_sources TEXT NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (product_pillar_id) REFERENCES core_seo_pillars(pillar_id)
);

INSERT OR IGNORE INTO content_pillars (pillar_id, title, hub_topic, description, product_pillar_id, wikidata_id, salience_score, sort_order) VALUES
  ('digital-marketing-bali', 'Digital Marketing Bali', 'Digital Marketing in Bali', 'Hub pillar — digital marketing agency topics for Bali', NULL, NULL, 0.9, 1),
  ('google-ads', 'Google Ads', 'Google Ads', 'Google Ads strategy, management, and conversion tracking topics', 'google-ads', 'Q43452', 0.9, 2),
  ('digital-marketing-for-hotel', 'Digital Marketing for Hotel', 'Hotel Digital Marketing', 'Hotel and villa digital marketing topics', NULL, NULL, 0.9, 3),
  ('booking-engine', 'Booking Engine', 'Booking Engine', 'Direct booking engine and OTA-reduction topics', 'booking-engine', NULL, 0.8, 4),
  ('ai-agent', 'AI Agent', 'AI Agent', 'AI agent / AI chatbot for hospitality topics', 'ai-agent', NULL, 0.8, 5);

-- Product pillar entity attributes (seeded only where verifiable; no fabricated IDs)
UPDATE core_seo_pillars SET wikidata_id = 'Q43452', salience_score = 0.9 WHERE pillar_id = 'google-ads';
UPDATE core_seo_pillars SET wikidata_id = 'Q162620', salience_score = 0.9 WHERE pillar_id = 'google-maps';

-- Landing URL standard (English): google-ads product pillar now lands on the
-- new /services/google-ads page per Daniel's locked decision.
UPDATE core_seo_pillars SET landing_page_url = '/services/google-ads' WHERE pillar_id = 'google-ads';
