-- Create listings table for vendor products/services/content
CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2),
  image_url TEXT,
  listing_type TEXT NOT NULL DEFAULT 'product',
  location TEXT,
  website_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Listings are viewable by everyone" 
ON public.listings 
FOR SELECT 
USING (true);

CREATE POLICY "Vendors can create own listings" 
ON public.listings 
FOR INSERT 
WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update own listings" 
ON public.listings 
FOR UPDATE 
USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can delete own listings" 
ON public.listings 
FOR DELETE 
USING (auth.uid() = vendor_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_listings_updated_at
BEFORE UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_listings_vendor_id ON public.listings(vendor_id);
CREATE INDEX idx_listings_category ON public.listings(category);
CREATE INDEX idx_listings_status ON public.listings(status);