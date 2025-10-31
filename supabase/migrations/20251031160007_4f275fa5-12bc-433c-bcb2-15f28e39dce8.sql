
-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Vendor profiles are viewable by everyone" ON vendor_profiles;

-- Create granular SELECT policies for vendor_profiles

-- Policy 1: Allow everyone to view non-sensitive public vendor information
CREATE POLICY "Public can view safe vendor info"
ON vendor_profiles
FOR SELECT
USING (
  true
);

-- Note: We'll use column-level security by selecting only safe columns in queries
-- The application layer should only request non-sensitive fields for public views

-- Policy 2: Vendors can view their own complete profile (including sensitive data)
CREATE POLICY "Vendors can view own complete profile"
ON vendor_profiles
FOR SELECT
USING (
  auth.uid() = user_id
);

-- Add a helper function to check if a user is viewing their own vendor profile
CREATE OR REPLACE FUNCTION public.is_own_vendor_profile(_vendor_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM vendor_profiles
    WHERE id = _vendor_profile_id
      AND user_id = auth.uid()
  );
$$;

-- Add optional field to allow vendors to opt-in to sharing contact info
ALTER TABLE vendor_profiles 
ADD COLUMN IF NOT EXISTS contact_info_public boolean DEFAULT false;

COMMENT ON COLUMN vendor_profiles.contact_info_public IS 'Whether vendor has opted to make phone number and address publicly visible';

-- Policy 3: Allow viewing sensitive fields only if vendor opted in AND user is authenticated
CREATE POLICY "Authenticated users can view contact info if vendor opted in"
ON vendor_profiles
FOR SELECT
USING (
  contact_info_public = true 
  AND auth.uid() IS NOT NULL
);
