-- Backfill generic_category for existing listings based on their category field
UPDATE public.listings
SET generic_category = CASE
  WHEN category IN ('Culinary & Food', 'Wellness & Beauty', 'Home & Decor') THEN 'necessary_goods'
  WHEN category = 'Experiences & Workshops' THEN 'experiences'
  ELSE 'personal_goods'
END
WHERE generic_category IS NULL;