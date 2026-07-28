-- Blog Agent: keyword_queue + hero_images tables
-- Migration 0003 (applied after 0002_post_structured_schema.sql)

-- Keyword queue — drives the blog-agent content generation pipeline
CREATE TABLE IF NOT EXISTS keyword_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  blog_id TEXT UNIQUE,                              -- e.g. 'BLOG-80'
  keyword TEXT NOT NULL,
  intent TEXT NOT NULL DEFAULT 'informational',     -- informational | commercial | transactional | how-to
  target_url TEXT,                                  -- optional: pre-set slug
  pillar TEXT,                                      -- blog core pillar (P1-P5)
  priority INTEGER NOT NULL DEFAULT 5,              -- 1-10, lower = higher priority
  status TEXT NOT NULL DEFAULT 'pending',           -- pending | drafting | gated | published | failed
  frequency TEXT DEFAULT 'weekly',                  -- weekly | biweekly | monthly | evergreen
  google_doc_url TEXT,                              -- link to existing Google Doc draft
  scout_notes TEXT,                                 -- validation notes from SCOUT
  last_published DATE,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_kq_status ON keyword_queue(status);
CREATE INDEX IF NOT EXISTS idx_kq_priority ON keyword_queue(priority, status);

-- Hero images registry — metadata for R2 images available as blog hero images
CREATE TABLE IF NOT EXISTS hero_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL UNIQUE,
  alt_text TEXT DEFAULT '',
  tags TEXT DEFAULT '',                             -- comma-separated topic tags for keyword matching
  r2_key TEXT NOT NULL,                             -- key in R2 bucket (e.g. 'blog-heroes/filename.jpg')
  public_url TEXT NOT NULL,                         -- public R2 URL
  content_type TEXT DEFAULT 'image/png',
  file_size INTEGER DEFAULT 0,
  width INTEGER DEFAULT 0,
  height INTEGER DEFAULT 0,
  used_count INTEGER DEFAULT 0,                     -- rotation: prefer least-used images
  last_used_at TEXT,                                -- for rotation fairness
  status TEXT DEFAULT 'active',                     -- active | removed
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_hi_tags ON hero_images(tags);
CREATE INDEX IF NOT EXISTS idx_hi_usage ON hero_images(used_count ASC, last_used_at ASC);

-- Seed keyword_queue with validated DRAFT keywords from Blog SEO Plan
-- All 6 have SCOUT validation + Google Doc drafts, menunggu HERALD gate
INSERT OR IGNORE INTO keyword_queue (blog_id, keyword, intent, pillar, priority, status, google_doc_url, scout_notes) VALUES
  ('BLOG-80', 'review online hotel cara kelola', 'how-to', 'P1 Digital Marketing di Bali', 1, 'pending',
   'https://docs.google.com/document/d/1xVxXn_bJZxQw_ZDI_scRAU4RQGgfovvA1T8ir4-47ds/edit',
   'VALID kualitatif. search_keyword 0 hasil, WebSearch: hotelmu.id, guestpro.id, ecommerceloka.com, ivosights.com, STAAH ReviewMinder hadir = demand B2B real.'),
  ('BLOG-32', 'cara dapat tamu hotel tanpa OTA', 'informational', 'P1 Digital Marketing di Bali', 2, 'pending',
   'https://docs.google.com/document/d/1itBHdLNVA2b69j-ha1drIYxcV4Dc3hPTK-18Tt-9IL0/edit',
   'VALID kualitatif. search_keyword 0 hasil (frasa belum established), WebSearch: kinghousecleaning.id, hotelmu.id, guestpro.id, satuvision hadir = demand B2B owner real. OTA-netral total.'),
  ('BLOG-78', 'cara meningkatkan repeat guest', 'informational', 'P3 Digital Marketing for Hotel', 3, 'pending',
   'https://docs.google.com/document/d/1xw44i_VBR7dcyaby2NkoIrMBc-jN87-Yd4BhDERVNWI/edit',
   'VALID (guestpro.id, hotelmu.id, agendakota.id = demand B2B ID nyata).'),
  ('BLOG-30', 'digital marketing untuk restoran di Bali', 'commercial', 'P1 Digital Marketing di Bali', 4, 'pending',
   'https://docs.google.com/document/d/1sTXxUvK90-DxFJqKRVtho6UpHdj7tSvj_JDBYqhevkk/edit',
   'Re-key dari ''digital marketing restoran bali'' (1 hasil) ke ''digital marketing untuk restoran'' (34 hasil). Gap angle Bali + Maps hospitality nyata.'),
  ('BLOG-49', 'cara meningkatkan ADR hotel', 'informational', 'P3 Digital Marketing for Hotel', 5, 'pending',
   'https://docs.google.com/document/d/1Wp3hB0OoZE0c6fhulYvsqClsA9oCWt7fjUkN4ZNeN4k/edit',
   'VALID (bukitvista.com, bookingninjas.com/id, guestpro.id, hotelmu.id = demand B2B ID nyata).'),
  ('BLOG-50', 'customer journey tamu hotel', 'informational', 'P3 Digital Marketing for Hotel', 6, 'pending',
   'https://docs.google.com/document/d/1Cf5RSBAWHWWHU3C74vWuL5JbDffZi-y1N74h5XVkNO8/edit',
   'VALID kualitatif (EHL, SHR Group, Renascence.io, marketeers.com) + gap Bahasa ID angle tracking.');
