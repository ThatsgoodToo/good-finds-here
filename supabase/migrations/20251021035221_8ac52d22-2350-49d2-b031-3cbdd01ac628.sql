-- Add categories array column to listings table
ALTER TABLE listings 
ADD COLUMN categories TEXT[] DEFAULT ARRAY['product'];

-- Migrate existing data to categories array
UPDATE listings 
SET categories = ARRAY[category::text] 
WHERE categories IS NULL OR categories = ARRAY['product'];

-- Add generic category columns for backend tracking (not shown in UI)
ALTER TABLE listings 
ADD COLUMN generic_category TEXT,
ADD COLUMN generic_subcategory TEXT;

-- Add check constraint for generic categories
ALTER TABLE listings 
ADD CONSTRAINT check_generic_category 
CHECK (generic_category IS NULL OR generic_category IN ('necessary_goods', 'personal_goods', 'experiences'));