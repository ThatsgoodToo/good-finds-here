-- Add location field to profiles table for shoppers
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location TEXT;