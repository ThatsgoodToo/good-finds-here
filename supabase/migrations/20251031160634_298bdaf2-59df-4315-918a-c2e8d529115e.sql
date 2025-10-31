
-- Add a security definer function to safely get public profile data
CREATE OR REPLACE FUNCTION public.get_public_profile(_user_id uuid)
RETURNS TABLE (
  id uuid,
  display_name text,
  avatar_url text,
  profile_picture_url text,
  bio text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    display_name,
    avatar_url,
    profile_picture_url,
    bio,
    created_at
  FROM profiles
  WHERE id = _user_id;
$$;

-- Add helper function to check if email should be visible
CREATE OR REPLACE FUNCTION public.can_view_profile_email(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    WHERE auth.uid() = _profile_id  -- Only the profile owner can see their email
  );
$$;

COMMENT ON POLICY "Public can view safe profile info" ON profiles IS 
  'Allows SELECT on profiles table, but application code must only request non-sensitive columns like display_name, avatar_url, bio. Never request email, full_name, or other PII for public views.';
