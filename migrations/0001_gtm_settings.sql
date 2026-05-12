-- Migration: 0001_gtm_settings.sql
-- Date: 2026-05-12
-- Author: MASON (KURATOR v2 follow-up)
-- Purpose: Ensure `gtm_settings` table exists in production D1 `blogdatabase`.
--   BaseHead.astro reads from this table to inject GTM container ID site-wide;
--   the read is wrapped in try/catch so a missing table fails SILENTLY (no GTM).
--   This non-destructive migration creates the table only if absent.
--
-- Safe to run multiple times: uses CREATE TABLE IF NOT EXISTS + INSERT OR IGNORE.
-- DOES NOT drop or modify any existing data.
--
-- To apply (after Daniel approval, from D:\multiple-agentic\repos\blog\):
--   wrangler d1 execute blogdatabase --remote --file=migrations/0001_gtm_settings.sql
--
-- To verify after apply:
--   wrangler d1 execute blogdatabase --remote --command "SELECT * FROM gtm_settings;"

CREATE TABLE IF NOT EXISTS gtm_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    gtm_id TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO gtm_settings (id, gtm_id) VALUES (1, '');
