
-- SECURITY FIX: Remove the overly permissive public SELECT policy
-- This policy with USING(true) allows reading ALL columns including emails
DROP POLICY IF EXISTS "Public can view safe profile info" ON profiles;

-- The remaining policies are:
-- 1. "Users can view own complete profile" - authenticated users can view their own data
-- 2. "Users can update own profile" - authenticated users can update their own data

-- For public profile viewing, applications MUST use:
-- - public_profiles view (which excludes email, full_name, and sensitive fields)
-- - get_public_profile() function
-- - Never query profiles table directly for other users' data

COMMENT ON TABLE profiles IS 
  'User profiles with sensitive PII. RLS restricts direct access to owner only. For public profile data, use public_profiles view which excludes emails and sensitive fields.';

-- Ensure the public_profiles view is properly secured
-- Revoke direct table access for anon users
REVOKE SELECT ON profiles FROM anon;

-- Grant access to the public view for everyone
GRANT SELECT ON public_profiles TO authenticated, anon;

-- Create a policy on the view for clarity (though views inherit table policies)
COMMENT ON VIEW public_profiles IS 
  'Public-safe profile data. This view excludes email, full_name, subscription_status, and internal flags. Use this for displaying profile information to other users.';
