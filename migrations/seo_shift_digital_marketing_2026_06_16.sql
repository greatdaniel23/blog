UPDATE posts
SET
  title = 'Digital Marketing Bali untuk Hotel dan Vila',
  description = 'Panduan digital marketing Bali untuk hotel, vila, dan restoran: Google Ads, SEO, booking engine, GA4, AI agent, dan direct booking.',
  content = REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          content,
          '# Digital Agency Bali untuk Hotel dan Vila',
          '# Digital Marketing Bali untuk Hotel dan Vila'
        ),
        'memilih digital agency Bali',
        'memilih digital marketing agency Bali'
      ),
      'sebagai digital agency Bali untuk hospitality',
      'sebagai digital marketing agency Bali untuk hospitality'
    ),
    'digital agency Bali tidak bisa disamakan',
    'digital marketing agency Bali tidak bisa disamakan'
  ),
  updated_at = '2026-06-16 19:55:00'
WHERE slug = 'digital-agency-bali-hotel-villa';
