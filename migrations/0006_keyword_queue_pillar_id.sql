-- Website Command Center v2: Sprint C prerequisite (missed in Sprint A)
-- Add pillar FK column to keyword_queue so blog-agent can join to core_seo_pillars
ALTER TABLE keyword_queue ADD COLUMN pillar_id TEXT;

CREATE INDEX IF NOT EXISTS idx_kq_pillar ON keyword_queue(pillar_id);
