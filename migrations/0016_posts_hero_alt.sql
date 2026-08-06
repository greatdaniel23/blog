-- 0016_posts_hero_alt.sql
-- Daniel directive 2026-08-07: every blog post image must carry a description (alt).
-- Per-post hero alt text. Values backfilled from the hero filename (the R2 pool
-- filenames ARE content descriptions) by tools/backfill_hero_alt.py — this
-- migration only adds the column; the renderer falls back to post.title when NULL.
ALTER TABLE posts ADD COLUMN hero_alt TEXT;
