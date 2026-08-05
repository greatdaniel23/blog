-- 0009_posts_pillar_taxonomy.sql — Knowledge Graph SEO v3 dynamic-node taxonomy
-- Adds pillar + node-type classification to posts (Gap #9) and upward-link
-- edges (Gap #8). Safe to re-run: ALTER TABLE only (no drops).

-- pillar_id → content_pillars.pillar_id (5 spec content pillars, NOT the 6
-- product pillars — those live in core_seo_pillars and stay untouched).
ALTER TABLE posts ADD COLUMN pillar_id TEXT;
ALTER TABLE posts ADD COLUMN node_type TEXT NOT NULL DEFAULT 'deep_dive_guide';

-- upward_links: JSON array [{ target_static_url, anchor_text, relevance_score }]
-- — the 1-3 contextual bridge edges to static authority sinks (spec PRD
-- RULE-BR-1, dynamic_page_schema.json). NULL = derive from the per-post
-- entity-matched module at render time.
ALTER TABLE posts ADD COLUMN upward_links TEXT DEFAULT NULL;

-- decay governance (spec dynamic_page_schema.json decay_governance)
ALTER TABLE posts ADD COLUMN last_audit_date TEXT;
ALTER TABLE posts ADD COLUMN decay_status TEXT NOT NULL DEFAULT 'fresh';
