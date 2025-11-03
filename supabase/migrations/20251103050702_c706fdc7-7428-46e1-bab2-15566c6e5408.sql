-- Complete fix for materialized view security issue
-- Must also revoke from 'public' role which sets default permissions

-- Revoke SELECT from the public role (which sets defaults for all roles)
REVOKE SELECT ON public.vendor_coupon_analytics FROM public;

-- Verify the fix is working by checking permissions
-- The following should return false:
-- SELECT pg_catalog.has_table_privilege('anon', 'public.vendor_coupon_analytics'::regclass::oid, 'select');
-- SELECT pg_catalog.has_table_privilege('authenticated', 'public.vendor_coupon_analytics'::regclass::oid, 'select');