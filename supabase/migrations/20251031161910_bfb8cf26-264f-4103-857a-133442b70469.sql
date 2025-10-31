-- Alter the view to explicitly set security_invoker
ALTER VIEW vendor_coupon_analytics SET (security_invoker = true);

-- Verify the change with a comment
COMMENT ON VIEW vendor_coupon_analytics 
IS 'Security invoker view that enforces RLS based on the querying user. Vendors can only view analytics for their own coupons due to the "Vendors can view own coupons" policy on the coupons table (WHERE auth.uid() = vendor_id).';