-- 0013_authors_fk.sql — KG-SEO v3 Gap #10: standardize post authorship
--
-- Migrates posts.author (free text: "Alpha Digital Agent" / "Hotel Editorial
-- Team" / "Daniel Santoso" / NULL) to an author_id FK on the authors table.
-- Standardization rule (PRD REQ-DY-2, 03 §3 example):
--   - "Daniel Santoso"                → Person (schema @type Person + /daniel-santoso)
--   - every other / NULL attribution  → Organization (Alpha Digital Agency, @id #organization)
--
-- The authors table may already exist in production (created out-of-band);
-- seeds are existence-guarded by name so no duplicate rows appear either way.
-- Apply ONCE in migration order (SQLite has no ADD COLUMN IF NOT EXISTS — a
-- second run errors on the duplicate column, which is the expected guard that
-- the column is already present). Inserts + backfills are re-run safe.

CREATE TABLE IF NOT EXISTS authors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  bio TEXT,
  website TEXT,
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Canonical author rows (existence-guarded — prod already has an org row).
INSERT INTO authors (name, bio, website)
SELECT 'Daniel Santoso',
       'Founder Alpha Digital Agency Indonesia — Google Ads specialist, AI integration, hospitality digital marketing.',
       'https://alphadigitalagency.id/daniel-santoso'
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE name = 'Daniel Santoso');

INSERT INTO authors (name, bio, website)
SELECT 'Alpha Digital Agency',
       'Alpha Digital Agency Indonesia — Google Ads, AI & Digital Transformation for Bali Hospitality.',
       'https://alphadigitalagency.id'
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE name = 'Alpha Digital Agency');

-- posts.author_id FK (column + index; re-runnable).
ALTER TABLE posts ADD COLUMN author_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);

-- Backfill: Person = Daniel Santoso; everything else (Agent/Editorial/NULL) = Organization.
UPDATE posts SET author_id = (SELECT id FROM authors WHERE name = 'Daniel Santoso')
WHERE author_id IS NULL AND author = 'Daniel Santoso';

UPDATE posts SET author_id = (SELECT id FROM authors WHERE name = 'Alpha Digital Agency')
WHERE author_id IS NULL;
