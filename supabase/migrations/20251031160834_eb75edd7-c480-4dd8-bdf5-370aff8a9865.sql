
-- Create a view for public profile data that excludes sensitive information
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  display_name,
  avatar_url,
  profile_picture_url,
  bio,
  created_at,
  high_fives_public,
  location_public
FROM profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- Add RLS to the view (views inherit table policies, but we make it explicit)
ALTER VIEW public.public_profiles SET (security_invoker = true);

COMMENT ON VIEW public.public_profiles IS 
  'Public-safe view of profiles table that excludes sensitive PII like emails, full_name, and internal flags. Use this view for public profile displays instead of querying the profiles table directly.';
