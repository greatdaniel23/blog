-- Website Command Center v2: per-pillar publishing config + SEO directives
-- Migration 0005 (applied after 0004_keyword_targets.sql)

CREATE TABLE IF NOT EXISTS pillar_config (
  pillar_id TEXT PRIMARY KEY,
  posts_per_week INTEGER NOT NULL DEFAULT 1,  -- e.g. 2 = 2x/week
  is_active INTEGER NOT NULL DEFAULT 1,        -- 0 = skip this pillar entirely
  seo_directive TEXT NOT NULL DEFAULT '',       -- injected into GLM system prompt
  content_rules TEXT NOT NULL DEFAULT '{}',     -- JSON: {min_words, require_faq, forbidden_topics[], required_sections[]}
  require_approval INTEGER NOT NULL DEFAULT 1,  -- 0 = auto-publish, 1 = draft-only (HERALD gate)
  system_prompt_override TEXT DEFAULT NULL,     -- optional full prompt replacement
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (pillar_id) REFERENCES core_seo_pillars(pillar_id)
);

-- Seed config for existing 3 pillars
INSERT OR IGNORE INTO pillar_config (pillar_id, posts_per_week, is_active, seo_directive, require_approval) VALUES
  ('booking-engine', 2, 1, 'Fokus: pain point komisi OTA 15-20%. Tiap artikel harus ada hitungan real berapa rupiah hotel hilang ke OTA per bulan. Gunakan examples dari Bali real (tanpa sebut nama hotel). CTA: konsultasi gratis booking engine.', 1),
  ('website', 1, 1, 'Fokus: website hotel bukan brosur — harus mesin booking 24/7. Tiap artikel harus sebut mobile-first (70% tamu booking dari HP). CTA: demo website.', 1),
  ('ai-agent', 1, 1, 'Fokus: AI agent bukan gimmick — jawab pertanyaan tamu 24/7, rekomendasi kamar, bantu booking. Hindari overpromise. CTA: demo AI agent gratis.', 1);
