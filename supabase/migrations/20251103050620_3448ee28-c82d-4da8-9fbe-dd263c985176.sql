-- Fix materialized view security issue
-- Materialized views should not be directly accessible via Data APIs
-- Instead, use security definer functions with proper access control

-- Revoke direct access to the materialized view from public roles
REVOKE ALL ON public.vendor_coupon_analytics FROM anon;
REVOKE ALL ON public.vendor_coupon_analytics FROM authenticated;

-- Grant access only to service role (for internal use)
GRANT SELECT ON public.vendor_coupon_analytics TO service_role;

-- Create a security definer function for vendors to access their own analytics
CREATE OR REPLACE FUNCTION public.get_vendor_coupon_analytics(_vendor_id uuid DEFAULT NULL)
RETURNS TABLE(
  coupon_id uuid,
  vendor_id uuid,
  code text,
  discount_type text,
  discount_value numeric,
  start_date timestamptz,
  end_date timestamptz,
  max_uses integer,
  used_count integer,
  active_status boolean,
  created_at timestamptz,
  total_claims bigint,
  unique_users bigint,
  usage_percentage numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- If vendor_id is provided, use it; otherwise use authenticated user's id
  SELECT 
    vca.coupon_id,
    vca.vendor_id,
    vca.code,
    vca.discount_type,
    vca.discount_value,
    vca.start_date,
    vca.end_date,
    vca.max_uses,
    vca.used_count,
    vca.active_status,
    vca.created_at,
    vca.total_claims,
    vca.unique_users,
    vca.usage_percentage
  FROM public.vendor_coupon_analytics vca
  WHERE vca.vendor_id = COALESCE(_vendor_id, auth.uid())
    -- Additional security: ensure requester is either the vendor or an admin
    AND (
      auth.uid() = vca.vendor_id 
      OR public.has_role(auth.uid(), 'admin')
    );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_vendor_coupon_analytics(uuid) TO authenticated;

COMMENT ON FUNCTION public.get_vendor_coupon_analytics IS 'Secure function to retrieve vendor coupon analytics. Vendors can only see their own data, admins can see all.';