-- Add source_url column to listings table for storing reference URLs
ALTER TABLE listings
ADD COLUMN source_url TEXT;