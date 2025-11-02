-- Add listing_link column to listings table
ALTER TABLE listings
ADD COLUMN listing_link TEXT;

COMMENT ON COLUMN listings.listing_link IS 'External URL where shoppers can purchase or view the item';

-- Migrate existing viewerbase listings to experience
UPDATE listings 
SET listing_type = 'experience' 
WHERE listing_type = 'viewerbase';