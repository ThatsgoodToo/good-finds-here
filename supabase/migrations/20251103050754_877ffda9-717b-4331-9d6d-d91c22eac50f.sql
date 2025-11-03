-- Fix the actual materialized view security issue: popular_listings
-- Materialized views cannot enforce RLS, so they must not be accessible via API

-- Revoke all access from API roles
REVOKE ALL ON public.popular_listings FROM public;
REVOKE ALL ON public.popular_listings FROM anon;
REVOKE ALL ON public.popular_listings FROM authenticated;

-- Grant access only to service role for internal use
GRANT SELECT ON public.popular_listings TO service_role;

-- Create a security definer function to safely access popular listings
-- This allows controlled access without exposing the materialized view
CREATE OR REPLACE FUNCTION public.get_popular_listings(_limit integer DEFAULT 10)
RETURNS TABLE(
  listing_id uuid,
  title text,
  description text,
  category text,
  image_url text,
  vendor_id uuid,
  views integer,
  save_count bigint,
  share_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Return popular listings data with basic info only
  -- Additional RLS checks can be applied here if needed
  SELECT 
    l.id as listing_id,
    l.title,
    l.description,
    l.category,
    l.image_url,
    l.vendor_id,
    l.views,
    (SELECT COUNT(*) FROM user_saves WHERE target_id = l.id AND save_type = 'listing') as save_count,
    (SELECT COUNT(*) FROM shares WHERE listing_id = l.id) as share_count
  FROM public.listings l
  WHERE l.status = 'active'
  ORDER BY l.views DESC
  LIMIT _limit;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.get_popular_listings(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_popular_listings(integer) TO anon;

COMMENT ON FUNCTION public.get_popular_listings IS 'Secure function to retrieve popular listings without exposing the materialized view. Returns top listings by views.';