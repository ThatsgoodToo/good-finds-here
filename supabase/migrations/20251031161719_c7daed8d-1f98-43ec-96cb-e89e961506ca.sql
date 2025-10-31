-- Drop the existing view
DROP VIEW IF EXISTS vendor_coupon_analytics;

-- Recreate as a security barrier view that enforces RLS from base tables
CREATE VIEW vendor_coupon_analytics 
WITH (security_barrier = true) AS
SELECT 
  c.vendor_id,
  c.id AS coupon_id,
  c.code,
  c.discount_type,
  c.discount_value,
  c.used_count,
  c.max_uses,
  c.active_status,
  c.start_date,
  c.end_date,
  count(cu.id) AS total_claims,
  count(DISTINCT cu.user_id) AS unique_users,
  round(count(cu.id)::numeric / NULLIF(c.max_uses, 0)::numeric * 100::numeric, 2) AS usage_percentage,
  c.created_at
FROM coupons c
LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
GROUP BY c.id;

-- Add comment explaining the security model
COMMENT ON VIEW vendor_coupon_analytics 
IS 'Security barrier view that enforces RLS from the coupons table. Vendors can only view analytics for their own coupons due to the "Vendors can view own coupons" policy on the coupons table (WHERE auth.uid() = vendor_id).';