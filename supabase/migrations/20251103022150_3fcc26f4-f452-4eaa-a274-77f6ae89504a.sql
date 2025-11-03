-- Phase 1: Email Automation Tables & Columns Migration

-- ============================================================
-- 1. CREATE CONTACTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  email TEXT NOT NULL CHECK (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  message TEXT NOT NULL CHECK (char_length(message) >= 10 AND char_length(message) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form"
  ON public.contacts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all contacts"
  ON public.contacts FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE INDEX idx_contacts_created_at ON public.contacts(created_at DESC);
CREATE INDEX idx_contacts_email ON public.contacts(email);

-- ============================================================
-- 2. CREATE WAITLIST TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE CHECK (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  name TEXT CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view waitlist"
  ON public.waitlist FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE INDEX idx_waitlist_created_at ON public.waitlist(created_at DESC);
CREATE INDEX idx_waitlist_email ON public.waitlist(email);

-- ============================================================
-- 3. CREATE USER_SAVES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  email_on_save BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, listing_id)
);

ALTER TABLE public.user_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saves"
  ON public.user_saves FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_user_saves_user_id ON public.user_saves(user_id);
CREATE INDEX idx_user_saves_listing_id ON public.user_saves(listing_id);
CREATE INDEX idx_user_saves_saved_at ON public.user_saves(saved_at DESC);
CREATE INDEX idx_user_saves_email_notifications ON public.user_saves(listing_id, email_on_save) WHERE email_on_save = true;

-- ============================================================
-- 4. CREATE SHARES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  shared_to_email TEXT NOT NULL CHECK (shared_to_email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  shared_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can create shares"
  ON public.shares FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own shares"
  ON public.shares FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Vendors can view shares of their listings"
  ON public.shares FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = shares.listing_id
      AND listings.vendor_id = auth.uid()
    )
  );

CREATE INDEX idx_shares_user_id ON public.shares(user_id);
CREATE INDEX idx_shares_listing_id ON public.shares(listing_id);
CREATE INDEX idx_shares_shared_at ON public.shares(shared_at DESC);

-- ============================================================
-- 5. CREATE REFERRALS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_email TEXT NOT NULL CHECK (referred_email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can create referrals"
  ON public.referrals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can update own referral status"
  ON public.referrals FOR UPDATE
  TO authenticated
  USING (auth.uid() = referrer_id)
  WITH CHECK (auth.uid() = referrer_id);

CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred_email ON public.referrals(referred_email);
CREATE INDEX idx_referrals_status ON public.referrals(status);
CREATE INDEX idx_referrals_created_at ON public.referrals(created_at DESC);

-- ============================================================
-- 6. EXTEND LISTINGS TABLE (Coupon Reset Fields)
-- ============================================================
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS resets_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reset_cycle TEXT DEFAULT 'none' CHECK (reset_cycle IN ('none', 'daily', 'weekly', 'monthly')),
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_listings_expires_at ON public.listings(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_resets_at ON public.listings(resets_at) WHERE resets_at IS NOT NULL AND reset_cycle != 'none';
CREATE INDEX IF NOT EXISTS idx_listings_views ON public.listings(views DESC);

-- ============================================================
-- 7. EXTEND PROFILES TABLE (Activity Tracking)
-- ============================================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_profiles_last_activity_at ON public.profiles(last_activity_at);

-- ============================================================
-- 8. CREATE TRIGGER FUNCTION FOR ACTIVITY TRACKING
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_last_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET last_activity_at = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- Create triggers on user_saves and shares
DROP TRIGGER IF EXISTS update_activity_on_save ON public.user_saves;
CREATE TRIGGER update_activity_on_save
  AFTER INSERT ON public.user_saves
  FOR EACH ROW EXECUTE FUNCTION public.update_last_activity();

DROP TRIGGER IF EXISTS update_activity_on_share ON public.shares;
CREATE TRIGGER update_activity_on_share
  AFTER INSERT ON public.shares
  FOR EACH ROW EXECUTE FUNCTION public.update_last_activity();

-- ============================================================
-- 9. INSERT TEST DATA
-- ============================================================

-- Test contacts
INSERT INTO public.contacts (name, email, message) VALUES
  ('Alice Johnson', 'alice@example.com', 'I love your platform! Do you have plans for a mobile app?'),
  ('Bob Smith', 'bob@example.com', 'Can I schedule a demo for my business? I have a local bakery.')
ON CONFLICT DO NOTHING;

-- Test waitlist
INSERT INTO public.waitlist (email, name) VALUES
  ('waitlist1@example.com', 'Charlie Brown'),
  ('waitlist2@example.com', 'Diana Prince')
ON CONFLICT (email) DO NOTHING;

-- Test user_saves (requires existing users and listings)
INSERT INTO public.user_saves (user_id, listing_id, email_on_save)
SELECT 
  u.id,
  l.id,
  CASE WHEN random() > 0.5 THEN true ELSE false END
FROM (SELECT id FROM auth.users LIMIT 2) u
CROSS JOIN (SELECT id FROM public.listings WHERE status = 'active' LIMIT 2) l
ON CONFLICT (user_id, listing_id) DO NOTHING;

-- Test shares (requires existing users and listings)
INSERT INTO public.shares (user_id, listing_id, shared_to_email)
SELECT 
  u.id,
  l.id,
  'friend' || floor(random() * 100)::text || '@example.com'
FROM (SELECT id FROM auth.users LIMIT 2) u
CROSS JOIN (SELECT id FROM public.listings WHERE status = 'active' LIMIT 1) l;

-- Test referrals
INSERT INTO public.referrals (referrer_id, referred_email, status)
SELECT 
  id,
  'newuser' || floor(random() * 100)::text || '@example.com',
  CASE WHEN random() > 0.5 THEN 'success' ELSE 'pending' END
FROM auth.users
LIMIT 2;

-- Update test listings with coupon reset data
UPDATE public.listings
SET 
  expires_at = now() + interval '5 days',
  resets_at = now() - interval '1 day', -- PAST DATE for immediate testing
  reset_cycle = 'daily',
  views = 42
WHERE id = (SELECT id FROM public.listings WHERE status = 'active' ORDER BY created_at DESC LIMIT 1 OFFSET 0);

UPDATE public.listings
SET 
  expires_at = now() + interval '3 days', -- expires soon (triggers warning)
  resets_at = NULL,
  reset_cycle = 'none',
  views = 120
WHERE id = (SELECT id FROM public.listings WHERE status = 'active' ORDER BY created_at DESC LIMIT 1 OFFSET 1);

UPDATE public.listings
SET 
  expires_at = now() + interval '30 days',
  resets_at = now() + interval '6 days',
  reset_cycle = 'weekly',
  views = 89
WHERE id = (SELECT id FROM public.listings WHERE status = 'active' ORDER BY created_at DESC LIMIT 1 OFFSET 2);