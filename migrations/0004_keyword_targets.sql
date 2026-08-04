-- Website Command Center v2: keyword target pool (Google Ads Keyword Planner import)
-- Migration 0004 (applied after 0003_blog_agent.sql)

CREATE TABLE IF NOT EXISTS keyword_targets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT NOT NULL,
  avg_monthly_searches INTEGER DEFAULT 0,
  competition TEXT DEFAULT 'MEDIUM',        -- LOW | MEDIUM | HIGH
  top_of_page_bid_low REAL DEFAULT 0,
  top_of_page_bid_high REAL DEFAULT 0,
  pillar_id TEXT,                            -- FK to core_seo_pillars.pillar_id (nullable until matched)
  status TEXT NOT NULL DEFAULT 'new',        -- new | promoted | skipped
  import_batch TEXT,                         -- batch identifier (timestamp)
  imported_at TEXT DEFAULT (datetime('now')),
  promoted_at TEXT,
  FOREIGN KEY (pillar_id) REFERENCES core_seo_pillars(pillar_id)
);

CREATE INDEX IF NOT EXISTS idx_kt_status ON keyword_targets(status);
CREATE INDEX IF NOT EXISTS idx_kt_pillar ON keyword_targets(pillar_id, status);
CREATE INDEX IF NOT EXISTS idx_kt_import_batch ON keyword_targets(import_batch);
