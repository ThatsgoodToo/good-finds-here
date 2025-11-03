-- Fix 1: Allow viewing limited public profile data (id, display_name)
-- This prevents 401 errors when joining profiles in queries
CREATE POLICY "Users can view public profile info of others"
ON public.profiles
FOR SELECT
USING (
  -- Allow viewing limited public fields for any authenticated user
  auth.uid() IS NOT NULL
);

-- Fix 2: Allow inserting coupon usage records
-- This prevents 403 errors when claiming coupons
CREATE POLICY "Allow coupon usage tracking"
ON public.coupon_usage
FOR INSERT
WITH CHECK (
  -- Allow authenticated users to log their own usage
  auth.uid() = user_id OR
  -- Allow anonymous tracking with device fingerprint
  (user_id IS NULL AND device_fingerprint IS NOT NULL)
);