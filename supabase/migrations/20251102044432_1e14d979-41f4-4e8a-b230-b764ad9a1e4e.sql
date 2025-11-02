-- Add business_name column to vendor_profiles
ALTER TABLE vendor_profiles ADD COLUMN business_name TEXT;

-- Add business_name column to vendor_applications
ALTER TABLE vendor_applications ADD COLUMN business_name TEXT;