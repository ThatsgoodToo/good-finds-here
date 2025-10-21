-- Create coupons table
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  max_uses INTEGER CHECK (max_uses > 0),
  used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT CHECK (recurrence_pattern IN ('weekly', 'monthly', 'quarterly', 'yearly', 'custom')),
  active_status BOOLEAN NOT NULL DEFAULT true,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(vendor_id, code),
  CONSTRAINT valid_date_range CHECK (start_date < end_date)
);

-- Create coupon usage tracking table
CREATE TABLE public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  device_fingerprint TEXT,
  ip_address TEXT
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coupons
CREATE POLICY "Vendors can view own coupons"
  ON public.coupons FOR SELECT
  USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can create own coupons"
  ON public.coupons FOR INSERT
  WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update own coupons"
  ON public.coupons FOR UPDATE
  USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can delete own coupons"
  ON public.coupons FOR DELETE
  USING (auth.uid() = vendor_id);

CREATE POLICY "Users can view active coupons"
  ON public.coupons FOR SELECT
  USING (active_status = true AND NOW() BETWEEN start_date AND end_date);

-- RLS Policies for coupon usage
CREATE POLICY "Users can view own usage"
  ON public.coupon_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Vendors can view usage of their coupons"
  ON public.coupon_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coupons
      WHERE coupons.id = coupon_usage.coupon_id
      AND coupons.vendor_id = auth.uid()
    )
  );

-- Function: Validate and claim coupon
CREATE OR REPLACE FUNCTION public.claim_coupon(
  _coupon_code TEXT,
  _vendor_id UUID,
  _user_id UUID DEFAULT NULL,
  _listing_id UUID DEFAULT NULL,
  _device_fingerprint TEXT DEFAULT NULL,
  _ip_address TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _coupon_record RECORD;
  _usage_id UUID;
BEGIN
  -- Get coupon with row lock
  SELECT * INTO _coupon_record
  FROM public.coupons
  WHERE code = _coupon_code
    AND vendor_id = _vendor_id
    AND active_status = true
    AND NOW() BETWEEN start_date AND end_date
  FOR UPDATE;

  -- Check if coupon exists
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired coupon');
  END IF;

  -- Check usage limit
  IF _coupon_record.max_uses IS NOT NULL 
     AND _coupon_record.used_count >= _coupon_record.max_uses THEN
    RETURN json_build_object('success', false, 'error', 'Coupon usage limit reached');
  END IF;

  -- Increment usage count
  UPDATE public.coupons
  SET used_count = used_count + 1,
      updated_at = NOW()
  WHERE id = _coupon_record.id;

  -- Auto-deactivate if limit reached
  IF _coupon_record.max_uses IS NOT NULL 
     AND (_coupon_record.used_count + 1) >= _coupon_record.max_uses THEN
    UPDATE public.coupons
    SET active_status = false,
        updated_at = NOW()
    WHERE id = _coupon_record.id;
  END IF;

  -- Record usage
  INSERT INTO public.coupon_usage (coupon_id, user_id, listing_id, device_fingerprint, ip_address)
  VALUES (_coupon_record.id, _user_id, _listing_id, _device_fingerprint, _ip_address)
  RETURNING id INTO _usage_id;

  RETURN json_build_object(
    'success', true,
    'coupon', json_build_object(
      'id', _coupon_record.id,
      'code', _coupon_record.code,
      'discount_type', _coupon_record.discount_type,
      'discount_value', _coupon_record.discount_value
    ),
    'usage_id', _usage_id
  );
END;
$$;

-- Function: Auto-expire coupons
CREATE OR REPLACE FUNCTION public.expire_coupons()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _expired_count INTEGER;
  _expiring_soon RECORD;
  _expiring_soon_coupons JSON[];
BEGIN
  -- Deactivate expired coupons
  WITH updated AS (
    UPDATE public.coupons
    SET active_status = false,
        updated_at = NOW()
    WHERE active_status = true
      AND (
        end_date < NOW()
        OR (max_uses IS NOT NULL AND used_count >= max_uses)
      )
    RETURNING id, code, vendor_id
  )
  SELECT COUNT(*) INTO _expired_count FROM updated;

  -- Get coupons expiring in 3 days
  _expiring_soon_coupons := ARRAY(
    SELECT json_build_object(
      'id', id,
      'code', code,
      'vendor_id', vendor_id,
      'end_date', end_date
    )
    FROM public.coupons
    WHERE active_status = true
      AND end_date BETWEEN NOW() AND NOW() + INTERVAL '3 days'
  );

  RETURN json_build_object(
    'expired_count', _expired_count,
    'expiring_soon', _expiring_soon_coupons
  );
END;
$$;

-- Function: Renew recurring coupons
CREATE OR REPLACE FUNCTION public.renew_recurring_coupons()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _renewed_count INTEGER := 0;
  _coupon RECORD;
  _new_start_date TIMESTAMPTZ;
  _new_end_date TIMESTAMPTZ;
  _renewed_coupons JSON[] := '{}';
BEGIN
  FOR _coupon IN
    SELECT * FROM public.coupons
    WHERE is_recurring = true
      AND active_status = false
      AND end_date < NOW()
  LOOP
    -- Calculate new dates based on recurrence pattern
    CASE _coupon.recurrence_pattern
      WHEN 'weekly' THEN
        _new_start_date := _coupon.end_date + INTERVAL '1 week';
        _new_end_date := _new_start_date + (_coupon.end_date - _coupon.start_date);
      WHEN 'monthly' THEN
        _new_start_date := _coupon.end_date + INTERVAL '1 month';
        _new_end_date := _new_start_date + (_coupon.end_date - _coupon.start_date);
      WHEN 'quarterly' THEN
        _new_start_date := _coupon.end_date + INTERVAL '3 months';
        _new_end_date := _new_start_date + (_coupon.end_date - _coupon.start_date);
      WHEN 'yearly' THEN
        _new_start_date := _coupon.end_date + INTERVAL '1 year';
        _new_end_date := _new_start_date + (_coupon.end_date - _coupon.start_date);
      ELSE
        CONTINUE;
    END CASE;

    -- Create new coupon instance
    INSERT INTO public.coupons (
      vendor_id, code, discount_type, discount_value,
      max_uses, used_count, start_date, end_date,
      is_recurring, recurrence_pattern, active_status, listing_id
    ) VALUES (
      _coupon.vendor_id, _coupon.code, _coupon.discount_type,
      _coupon.discount_value, _coupon.max_uses, 0,
      _new_start_date, _new_end_date, true,
      _coupon.recurrence_pattern, true, _coupon.listing_id
    );

    _renewed_coupons := array_append(_renewed_coupons, json_build_object(
      'code', _coupon.code,
      'vendor_id', _coupon.vendor_id,
      'new_start_date', _new_start_date,
      'new_end_date', _new_end_date
    ));

    _renewed_count := _renewed_count + 1;
  END LOOP;

  RETURN json_build_object(
    'renewed_count', _renewed_count,
    'renewed_coupons', _renewed_coupons
  );
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_coupons_vendor_id ON public.coupons(vendor_id);
CREATE INDEX idx_coupons_code ON public.coupons(vendor_id, code);
CREATE INDEX idx_coupons_active ON public.coupons(active_status, start_date, end_date);
CREATE INDEX idx_coupon_usage_coupon_id ON public.coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_user_id ON public.coupon_usage(user_id);

-- Create analytics view for vendors
CREATE VIEW public.vendor_coupon_analytics AS
SELECT
  c.vendor_id,
  c.id AS coupon_id,
  c.code,
  c.discount_type,
  c.discount_value,
  c.used_count,
  c.max_uses,
  c.active_status,
  c.start_date,
  c.end_date,
  COUNT(cu.id) AS total_claims,
  COUNT(DISTINCT cu.user_id) AS unique_users,
  ROUND(
    (COUNT(cu.id)::NUMERIC / NULLIF(c.max_uses, 0)) * 100,
    2
  ) AS usage_percentage,
  c.created_at
FROM public.coupons c
LEFT JOIN public.coupon_usage cu ON c.id = cu.coupon_id
GROUP BY c.id;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();