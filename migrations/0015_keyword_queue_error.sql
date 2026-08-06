-- 0015_keyword_queue_error.sql
-- Persist blog-agent failure reasons on keyword_queue rows.
-- Previously failures were console-only (wrangler tail) and unrecoverable after
-- the fact; blog-agent now writes the exception message here on status='failed'.
ALTER TABLE keyword_queue ADD COLUMN error TEXT;
