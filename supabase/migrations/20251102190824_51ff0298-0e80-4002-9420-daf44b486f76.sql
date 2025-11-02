-- Create website_clicks table for time-series tracking
CREATE TABLE public.website_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL,
  listing_id UUID NULL,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_vendor FOREIGN KEY (vendor_id) REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE public.website_clicks ENABLE ROW LEVEL SECURITY;

-- Vendors can view their own clicks
CREATE POLICY "Vendors can view own clicks"
ON public.website_clicks
FOR SELECT
USING (auth.uid() = vendor_id);

-- Create index for better query performance
CREATE INDEX idx_website_clicks_vendor_id ON public.website_clicks(vendor_id);
CREATE INDEX idx_website_clicks_clicked_at ON public.website_clicks(clicked_at DESC);