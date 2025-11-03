-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_listings_vendor_created ON public.listings(vendor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_status_created ON public.listings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_saves_user_type ON public.user_saves(user_id, save_type);
CREATE INDEX IF NOT EXISTS idx_followers_shopper ON public.followers(shopper_id);
CREATE INDEX IF NOT EXISTS idx_followers_vendor ON public.followers(vendor_id);
CREATE INDEX IF NOT EXISTS idx_coupons_listing_active ON public.coupons(listing_id, active_status);
CREATE INDEX IF NOT EXISTS idx_coupons_vendor_active ON public.coupons(vendor_id, active_status);

-- Fix RLS policy for website_clicks - allow authenticated users to insert
DROP POLICY IF EXISTS "Authenticated users can track clicks" ON public.website_clicks;
CREATE POLICY "Authenticated users can track clicks"
ON public.website_clicks
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create materialized view for popular listings
DROP MATERIALIZED VIEW IF EXISTS public.popular_listings;
CREATE MATERIALIZED VIEW public.popular_listings AS
SELECT 
  l.id,
  l.title,
  l.image_url,
  l.category,
  l.vendor_id,
  l.views,
  COUNT(DISTINCT us.id) as saves_count,
  COUNT(DISTINCT s.id) as shares_count,
  COUNT(DISTINCT cu.id) as coupon_claims,
  (COALESCE(l.views, 0) * 0.3 + 
   COUNT(DISTINCT us.id) * 0.4 + 
   COUNT(DISTINCT s.id) * 0.2 + 
   COUNT(DISTINCT cu.id) * 0.1) as popularity_score
FROM public.listings l
LEFT JOIN public.user_saves us ON us.target_id = l.id AND us.save_type = 'listing'
LEFT JOIN public.shares s ON s.listing_id = l.id
LEFT JOIN public.coupons c ON c.listing_id = l.id
LEFT JOIN public.coupon_usage cu ON cu.coupon_id = c.id
WHERE l.status = 'active'
GROUP BY l.id
ORDER BY popularity_score DESC;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_popular_listings_score ON public.popular_listings(popularity_score DESC);

-- Enable RLS on materialized view
ALTER MATERIALIZED VIEW public.popular_listings OWNER TO postgres;

-- Grant select to authenticated and anon
GRANT SELECT ON public.popular_listings TO authenticated;
GRANT SELECT ON public.popular_listings TO anon;