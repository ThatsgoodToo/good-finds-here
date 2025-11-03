-- Add granular notification preference columns to user_preferences table
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS notify_expiry_alerts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_coupon_resets BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_vendor_nudges BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_engagement BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notify_share_invites BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_referral_bonus BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_feedback_requests BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_listing_updates BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.user_preferences.notify_expiry_alerts IS 'User wants emails about saved deals expiring soon';
COMMENT ON COLUMN public.user_preferences.notify_coupon_resets IS 'User wants emails when saved deal coupons reset';
COMMENT ON COLUMN public.user_preferences.notify_vendor_nudges IS 'Vendor wants weekly activity nudge emails';
COMMENT ON COLUMN public.user_preferences.notify_engagement IS 'User wants monthly re-engagement emails';
COMMENT ON COLUMN public.user_preferences.notify_share_invites IS 'User wants emails when someone shares a deal';
COMMENT ON COLUMN public.user_preferences.notify_referral_bonus IS 'User wants referral success notifications';
COMMENT ON COLUMN public.user_preferences.notify_feedback_requests IS 'User wants feedback survey emails';
COMMENT ON COLUMN public.user_preferences.notify_listing_updates IS 'Vendor wants listing approval/status emails';