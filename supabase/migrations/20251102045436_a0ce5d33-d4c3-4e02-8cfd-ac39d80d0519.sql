-- Add location_public field to vendor_profiles
ALTER TABLE public.vendor_profiles 
ADD COLUMN location_public boolean DEFAULT true;