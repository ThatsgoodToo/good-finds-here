-- Create coupon_shares table for tracking when vendors share coupons with shoppers
CREATE TABLE public.coupon_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shopper_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  viewed BOOLEAN DEFAULT false,
  viewed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.coupon_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Vendors can view own shares"
  ON public.coupon_shares FOR SELECT
  USING (auth.uid() = vendor_id);

CREATE POLICY "Shoppers can view received shares"
  ON public.coupon_shares FOR SELECT
  USING (auth.uid() = shopper_id);

CREATE POLICY "Vendors can create shares"
  ON public.coupon_shares FOR INSERT
  WITH CHECK (auth.uid() = vendor_id);

-- Index for performance
CREATE INDEX idx_coupon_shares_vendor ON public.coupon_shares(vendor_id, shared_at DESC);
CREATE INDEX idx_coupon_shares_shopper ON public.coupon_shares(shopper_id, viewed, shared_at DESC);