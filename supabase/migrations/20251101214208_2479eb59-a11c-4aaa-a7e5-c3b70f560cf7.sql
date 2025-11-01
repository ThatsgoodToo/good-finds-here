-- Add INSERT policy for vendor_profiles to allow service role to create profiles
-- This is needed for the update-vendor-status edge function to work when approving applications

CREATE POLICY "Service role can insert vendor profiles"
ON public.vendor_profiles
FOR INSERT
TO service_role
WITH CHECK (true);

-- Also allow admins to insert vendor profiles directly if needed
CREATE POLICY "Admins can insert vendor profiles"
ON public.vendor_profiles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));