-- 0010_backfill_post_pillars.sql — classify existing published posts into the
-- 5 content pillars (KG-SEO v3 Gap #9). Deterministic per-post assignment from
-- title topic (reviewed 2026-08-05 against live titles). No drops; re-runnable.

-- google-ads pillar
UPDATE posts SET pillar_id = 'google-ads' WHERE id IN (4, 19, 23, 46, 54, 58, 75, 77, 87);
-- booking-engine pillar (direct booking, OTA, booking engine, rate parity, booking tracking)
UPDATE posts SET pillar_id = 'booking-engine' WHERE id IN (5, 10, 16, 21, 24, 47, 48, 51, 56, 59, 79, 82, 88, 92, 94, 96);
-- ai-agent pillar (chatbot, AI for hotel, AI agent)
UPDATE posts SET pillar_id = 'ai-agent' WHERE id IN (2, 44, 83, 85);
-- digital-marketing-for-hotel (hotel/villa marketing, SEO, reviews, repeat guest, tracking)
UPDATE posts SET pillar_id = 'digital-marketing-for-hotel' WHERE id IN (11, 12, 20, 49, 50, 55, 69, 73, 74, 76, 78, 80, 81, 84, 86, 89, 90, 91, 93);
-- digital-marketing-bali (agency selection, digital marketing fundamentals, client dashboard)
UPDATE posts SET pillar_id = 'digital-marketing-bali' WHERE id IN (3, 17, 18, 22, 25, 45, 52, 53, 57, 60, 95);

-- node_type: empirical case studies → case_study; trend/framework pieces → industry_update;
-- everything else stays the default deep_dive_guide.
UPDATE posts SET node_type = 'case_study' WHERE id IN (75, 77);
UPDATE posts SET node_type = 'industry_update' WHERE id IN (4, 46, 86, 76, 74);

-- decay governance baseline: today = audit start date, all fresh.
UPDATE posts SET last_audit_date = '2026-08-05', decay_status = 'fresh'
WHERE is_published = 1 AND last_audit_date IS NULL;
