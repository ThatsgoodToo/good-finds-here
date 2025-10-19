-- Add privacy settings columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN high_fives_public boolean DEFAULT true,
ADD COLUMN location_public boolean DEFAULT true;

COMMENT ON COLUMN public.profiles.high_fives_public IS 'Controls whether high fives/favorites are visible on public profile';
COMMENT ON COLUMN public.profiles.location_public IS 'Controls whether location is visible on public profile';