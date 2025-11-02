-- Drop the existing policy for vendor updates
DROP POLICY IF EXISTS "Vendors can update own profile (non-locked fields)" ON vendor_profiles;

-- Create new policy that prevents vendors from updating business_name
CREATE POLICY "Vendors can update own profile (non-locked fields)"
ON vendor_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND (
    -- Allow updates only if business_name is not being changed
    business_name IS NOT DISTINCT FROM (
      SELECT business_name FROM vendor_profiles WHERE id = vendor_profiles.id
    )
  )
);

-- Add helpful comment
COMMENT ON POLICY "Vendors can update own profile (non-locked fields)" ON vendor_profiles IS 
'Vendors can update their profile but cannot modify business_name. Business name changes require admin approval via vendor_change_requests table.';