-- Fix security definer view by recreating with explicit security_invoker
DROP VIEW IF EXISTS public.vendor_coupon_analytics;

CREATE VIEW public.vendor_coupon_analytics 
WITH (security_invoker=true) AS
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
  COUNT(cu.id) AS total_claims,
  COUNT(DISTINCT cu.user_id) AS unique_users,
  ROUND(
    (COUNT(cu.id)::NUMERIC / NULLIF(c.max_uses, 0)) * 100,
    2
  ) AS usage_percentage,
  c.created_at
FROM public.coupons c
LEFT JOIN public.coupon_usage cu ON c.id = cu.coupon_id
GROUP BY c.id;