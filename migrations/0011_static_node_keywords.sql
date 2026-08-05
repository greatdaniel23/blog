-- 0011_static_node_keywords.sql — Anti-cannibalization registry (KG-SEO v3 Gap #16).
-- Static pages OWN their primary keywords; dynamic posts must never target them
-- (PRD RULE-BR-2). This table + tools/cannibalization_check.ts enforce the gate.
-- Re-runnable (IF NOT EXISTS / OR IGNORE).

CREATE TABLE IF NOT EXISTS static_node_keywords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  static_url TEXT NOT NULL,              -- canonical no-slash static page URL
  primary_keyword TEXT NOT NULL,         -- keyword RESERVED for the static page
  keyword_group TEXT NOT NULL DEFAULT 'primary',
  UNIQUE (static_url, primary_keyword)
);

-- Seeded from spec 07 §2 node map (primary commercial keywords are static-owned).
INSERT OR IGNORE INTO static_node_keywords (static_url, primary_keyword, keyword_group) VALUES
  ('/services/google-ads', 'google ads specialist bali', 'primary'),
  ('/services/google-ads', 'jasa google ads bali', 'primary'),
  ('/services/google-ads', 'google ads agency bali', 'primary'),
  ('/services/google-ads', 'google ads hotel', 'ls'),
  ('/services/booking-engine', 'booking engine villa bali', 'primary'),
  ('/services/booking-engine', 'booking engine hotel', 'primary'),
  ('/services/booking-engine', 'direct booking bali', 'ls'),
  ('/services/ai-agent', 'ai chatbot villa bali', 'primary'),
  ('/services/ai-agent', 'ai agent hotel', 'primary'),
  ('/services/ai-agent', 'chatbot hotel bali', 'ls'),
  ('/', 'digital marketing agency bali', 'primary'),
  ('/', 'digital agency bali', 'primary');
