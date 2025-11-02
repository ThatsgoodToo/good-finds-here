-- Add listing_types array column to support multiple listing types
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS listing_types text[] DEFAULT ARRAY[]::text[];

-- Update existing listings to populate listing_types from listing_type
UPDATE listings 
SET listing_types = ARRAY[listing_type]::text[]
WHERE listing_types IS NULL OR listing_types = ARRAY[]::text[];

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_listings_listing_types ON listings USING GIN(listing_types);