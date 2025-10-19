-- Create vendor_applications table for pending applications
CREATE TABLE public.vendor_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Page 1: Basic Info
  website TEXT,
  social_media_links TEXT[],
  city TEXT,
  state_region TEXT,
  country TEXT,
  phone_number TEXT,
  business_type TEXT,
  business_type_other TEXT,
  
  -- Page 2: About Your Business
  business_description TEXT,
  products_services TEXT[],
  inventory_type TEXT[],
  shipping_options TEXT[],
  pickup_address TEXT,
  
  -- Page 3: Expertise
  area_of_expertise TEXT[],
  business_duration TEXT,
  craft_development TEXT,
  certifications_awards TEXT,
  
  -- Page 4: Practices & Creativity
  creativity_style TEXT,
  inspiration TEXT,
  brand_uniqueness TEXT,
  sustainable_methods TEXT[],
  
  -- Page 5: Pricing & Accessibility
  pricing_style TEXT,
  exclusive_offers TEXT,
  promotion_social_channels TEXT,
  future_website TEXT,
  
  -- Page 6: Subscription
  promo_code TEXT,
  subscription_type TEXT,
  payment_method_saved BOOLEAN DEFAULT false,
  
  -- Page 7: Confirmation
  additional_info TEXT,
  info_accurate BOOLEAN DEFAULT false,
  understands_review BOOLEAN DEFAULT false,
  agrees_to_terms BOOLEAN DEFAULT false,
  receive_updates BOOLEAN DEFAULT false,
  
  -- Admin notes
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Create vendor_profiles table for approved vendors
CREATE TABLE public.vendor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  application_id UUID REFERENCES public.vendor_applications(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  
  -- Basic Info (LOCKED - requires admin approval)
  website TEXT NOT NULL,
  social_media_links TEXT[],
  city TEXT NOT NULL,
  state_region TEXT NOT NULL,
  country TEXT NOT NULL,
  phone_number TEXT,
  business_type TEXT NOT NULL,
  business_type_other TEXT,
  
  -- About Business
  business_description TEXT NOT NULL,
  products_services TEXT[],
  inventory_type TEXT[],
  shipping_options TEXT[],
  pickup_address TEXT,
  
  -- Expertise (LOCKED - requires admin approval)
  area_of_expertise TEXT[] NOT NULL,
  business_duration TEXT NOT NULL,
  craft_development TEXT,
  certifications_awards TEXT,
  
  -- Practices & Creativity
  creativity_style TEXT,
  inspiration TEXT,
  brand_uniqueness TEXT,
  sustainable_methods TEXT[],
  
  -- Pricing & Accessibility
  pricing_style TEXT,
  exclusive_offers TEXT,
  promotion_social_channels TEXT,
  future_website TEXT,
  
  -- Subscription info
  subscription_type TEXT,
  subscription_status TEXT DEFAULT 'active',
  subscription_started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Analytics
  profile_views INTEGER DEFAULT 0,
  clicks_to_website INTEGER DEFAULT 0,
  
  -- Fields requiring admin approval
  pending_changes JSONB
);

-- Create change_requests table for vendor edit requests
CREATE TABLE public.vendor_change_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_profile_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  field_name TEXT NOT NULL,
  current_value TEXT,
  requested_value TEXT NOT NULL,
  reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT
);

-- Enable RLS
ALTER TABLE public.vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_change_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor_applications
CREATE POLICY "Users can view own applications"
ON public.vendor_applications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own applications"
ON public.vendor_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending applications"
ON public.vendor_applications FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- RLS Policies for vendor_profiles
CREATE POLICY "Vendor profiles are viewable by everyone"
ON public.vendor_profiles FOR SELECT
USING (true);

CREATE POLICY "Vendors can update own profile (non-locked fields)"
ON public.vendor_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for vendor_change_requests
CREATE POLICY "Vendors can view own change requests"
ON public.vendor_change_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Vendors can create change requests"
ON public.vendor_change_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_vendor_applications_updated_at
BEFORE UPDATE ON public.vendor_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_profiles_updated_at
BEFORE UPDATE ON public.vendor_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_vendor_applications_user_id ON public.vendor_applications(user_id);
CREATE INDEX idx_vendor_applications_status ON public.vendor_applications(status);
CREATE INDEX idx_vendor_profiles_user_id ON public.vendor_profiles(user_id);
CREATE INDEX idx_vendor_profiles_status ON public.vendor_profiles(status);
CREATE INDEX idx_vendor_change_requests_vendor_profile_id ON public.vendor_change_requests(vendor_profile_id);
CREATE INDEX idx_vendor_change_requests_status ON public.vendor_change_requests(status);