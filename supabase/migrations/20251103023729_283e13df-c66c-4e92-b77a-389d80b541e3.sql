-- Fix security warnings: Set search_path for all cron functions

CREATE OR REPLACE FUNCTION public.log_cron_start(job_name text)
RETURNS uuid 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.cron_logs (job_name, started_at, status)
  VALUES (job_name, now(), 'running')
  RETURNING id INTO log_id;
  RETURN log_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_cron_complete(
  log_id uuid,
  records_count integer,
  emails_count integer,
  error_msg text DEFAULT NULL
)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.cron_logs
  SET 
    completed_at = now(),
    status = CASE WHEN error_msg IS NULL THEN 'success' ELSE 'error' END,
    records_processed = records_count,
    emails_sent = emails_count,
    error_message = error_msg
  WHERE id = log_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.daily_listing_notifications()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id uuid;
  expire_count integer := 0;
  reset_count integer := 0;
  email_count integer := 0;
  listing_record RECORD;
  user_record RECORD;
  vendor_email text;
BEGIN
  log_id := public.log_cron_start('daily_listing_notifications');
  
  -- PART A: EXPIRING LISTINGS (within 7 days)
  FOR listing_record IN
    SELECT l.id, l.title, l.vendor_id, l.expires_at,
           c.code as coupon_code
    FROM public.listings l
    LEFT JOIN public.coupons c ON c.listing_id = l.id AND c.active_status = true
    WHERE l.expires_at IS NOT NULL
      AND l.expires_at < now() + interval '7 days'
      AND l.expires_at > now()
      AND l.status = 'active'
  LOOP
    expire_count := expire_count + 1;
    
    FOR user_record IN
      SELECT p.email, p.display_name
      FROM public.user_saves us
      JOIN public.profiles p ON p.id = us.user_id
      WHERE us.listing_id = listing_record.id
        AND us.email_on_save = true
    LOOP
      PERFORM net.http_post(
        url := 'https://fksjvollrvzokhpptdoi.supabase.co/functions/v1/send-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrc2p2b2xscnZ6b2tocHB0ZG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDE5OTQsImV4cCI6MjA3NjM3Nzk5NH0.5C-dRTTNcR8FC2oeNHAdLICy588BSyOhrF8qYYNDHzE'
        ),
        body := jsonb_build_object(
          'to', user_record.email,
          'subject', 'Your Saved Deal Expires Soon! ⏰',
          'html', '<p>Hi ' || COALESCE(user_record.display_name, 'there') || ',</p><p>Your saved listing <strong>' || listing_record.title || '</strong> expires soon!</p><p>Expires: ' || to_char(listing_record.expires_at, 'Mon DD, YYYY') || '</p>' || CASE WHEN listing_record.coupon_code IS NOT NULL THEN '<p>🎟️ Use coupon: <strong>' || listing_record.coupon_code || '</strong></p>' ELSE '' END || '<p><a href="https://thatsgoodtoo.shop/listing/' || listing_record.id || '" style="background: #FF4500; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Redeem Now</a></p>',
          'templateVars', jsonb_build_object(
            'user_name', COALESCE(user_record.display_name, 'there'),
            'listing_title', listing_record.title,
            'coupon_code', COALESCE(listing_record.coupon_code, 'N/A'),
            'expires_date', to_char(listing_record.expires_at, 'Mon DD, YYYY')
          )
        )
      );
      email_count := email_count + 1;
    END LOOP;
    
    SELECT p.email INTO vendor_email
    FROM public.profiles p
    WHERE p.id = listing_record.vendor_id;
    
    IF vendor_email IS NOT NULL THEN
      PERFORM net.http_post(
        url := 'https://fksjvollrvzokhpptdoi.supabase.co/functions/v1/send-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrc2p2b2xscnZ6b2tocHB0ZG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDE5OTQsImV4cCI6MjA3NjM3Nzk5NH0.5C-dRTTNcR8FC2oeNHAdLICy588BSyOhrF8qYYNDHzE'
        ),
        body := jsonb_build_object(
          'to', vendor_email,
          'subject', 'Listing Expiring Soon - Renew Now',
          'html', '<p>Your listing <strong>' || listing_record.title || '</strong> expires on ' || to_char(listing_record.expires_at, 'Mon DD, YYYY') || '.</p><p>Want to keep it live? Renew it now!</p><p><a href="https://thatsgoodtoo.shop/vendor-dashboard" style="background: #32CD32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Renew Listing</a></p>'
        )
      );
      email_count := email_count + 1;
    END IF;
  END LOOP;
  
  -- PART B: COUPON RESETS
  FOR listing_record IN
    SELECT l.id, l.title, l.vendor_id, l.resets_at, l.reset_cycle,
           c.id as coupon_id, c.code as coupon_code
    FROM public.listings l
    JOIN public.coupons c ON c.listing_id = l.id
    WHERE l.resets_at IS NOT NULL
      AND l.resets_at <= now()
      AND l.reset_cycle != 'none'
      AND l.status = 'active'
      AND c.active_status = true
  LOOP
    reset_count := reset_count + 1;
    
    UPDATE public.coupons
    SET used_count = 0,
        active_status = true,
        updated_at = now()
    WHERE id = listing_record.coupon_id;
    
    UPDATE public.listings
    SET resets_at = CASE listing_record.reset_cycle
      WHEN 'daily' THEN now() + interval '1 day'
      WHEN 'weekly' THEN now() + interval '7 days'
      WHEN 'monthly' THEN now() + interval '1 month'
      ELSE resets_at
    END,
    updated_at = now()
    WHERE id = listing_record.id;
    
    FOR user_record IN
      SELECT p.email, p.display_name
      FROM public.user_saves us
      JOIN public.profiles p ON p.id = us.user_id
      WHERE us.listing_id = listing_record.id
        AND us.email_on_save = true
    LOOP
      PERFORM net.http_post(
        url := 'https://fksjvollrvzokhpptdoi.supabase.co/functions/v1/send-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrc2p2b2xscnZ6b2tocHB0ZG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDE5OTQsImV4cCI6MjA3NjM3Nzk5NH0.5C-dRTTNcR8FC2oeNHAdLICy588BSyOhrF8qYYNDHzE'
        ),
        body := jsonb_build_object(
          'to', user_record.email,
          'subject', '🔄 Coupon Reset! Use It Again Today',
          'html', '<p>Great news, ' || COALESCE(user_record.display_name, 'there') || '!</p><p>The coupon for <strong>' || listing_record.title || '</strong> has been reset.</p><p>🎟️ Coupon: <strong>' || listing_record.coupon_code || '</strong></p><p>Use it again today!</p><p><a href="https://thatsgoodtoo.shop/listing/' || listing_record.id || '" style="background: #FF4500; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Claim Now</a></p>',
          'templateVars', jsonb_build_object(
            'user_name', COALESCE(user_record.display_name, 'there'),
            'listing_title', listing_record.title,
            'coupon_code', listing_record.coupon_code,
            'reset_date', to_char(now(), 'Mon DD, YYYY')
          )
        )
      );
      email_count := email_count + 1;
    END LOOP;
    
    SELECT p.email INTO vendor_email
    FROM public.profiles p
    WHERE p.id = listing_record.vendor_id;
    
    IF vendor_email IS NOT NULL THEN
      PERFORM net.http_post(
        url := 'https://fksjvollrvzokhpptdoi.supabase.co/functions/v1/send-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrc2p2b2xscnZ6b2tocHB0ZG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDE5OTQsImV4cCI6MjA3NjM3Nzk5NH0.5C-dRTTNcR8FC2oeNHAdLICy588BSyOhrF8qYYNDHzE'
        ),
        body := jsonb_build_object(
          'to', vendor_email,
          'subject', 'Coupon Reset Triggered - Boost Your Views!',
          'html', '<p>Your coupon for <strong>' || listing_record.title || '</strong> has been automatically reset.</p><p>Users can now claim it again. Expect increased traffic!</p><p><a href="https://thatsgoodtoo.shop/vendor-dashboard" style="background: #32CD32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Dashboard</a></p>'
        )
      );
      email_count := email_count + 1;
    END IF;
  END LOOP;
  
  PERFORM public.log_cron_complete(log_id, expire_count + reset_count, email_count, NULL);
  
EXCEPTION WHEN OTHERS THEN
  PERFORM public.log_cron_complete(log_id, 0, 0, SQLERRM);
  RAISE;
END;
$$;

CREATE OR REPLACE FUNCTION public.weekly_vendor_nudges()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id uuid;
  vendor_count integer := 0;
  email_count integer := 0;
  vendor_record RECORD;
BEGIN
  log_id := public.log_cron_start('weekly_vendor_nudges');
  
  FOR vendor_record IN
    SELECT vp.id, vp.user_id, p.email, p.display_name,
           COALESCE(COUNT(l.id) FILTER (WHERE l.status = 'active'), 0) as active_listings,
           COALESCE(SUM(l.views), 0) as total_views
    FROM public.vendor_profiles vp
    JOIN public.profiles p ON p.id = vp.user_id
    LEFT JOIN public.listings l ON l.vendor_id = vp.user_id 
      AND l.created_at > now() - interval '30 days'
    WHERE vp.subscription_status = 'active'
    GROUP BY vp.id, vp.user_id, p.email, p.display_name
    HAVING COUNT(l.id) FILTER (WHERE l.status = 'active') = 0
       OR COALESCE(SUM(l.views), 0) < 10
  LOOP
    vendor_count := vendor_count + 1;
    
    PERFORM net.http_post(
      url := 'https://fksjvollrvzokhpptdoi.supabase.co/functions/v1/send-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrc2p2b2xscnZ6b2tocHB0ZG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDE5OTQsImV4cCI6MjA3NjM3Nzk5NH0.5C-dRTTNcR8FC2oeNHAdLICy588BSyOhrF8qYYNDHzE'
      ),
      body := jsonb_build_object(
        'to', vendor_record.email,
        'subject', '📢 Time to Boost Your Presence!',
        'html', '<p>Hi ' || COALESCE(vendor_record.display_name, 'there') || ',</p>' ||
          CASE 
            WHEN vendor_record.active_listings = 0 THEN 
              '<p>We noticed you don''t have any active listings. Post a new promo to reach more shoppers!</p>'
            ELSE 
              '<p>Your listings aren''t getting much traction. Try posting a fresh coupon to boost engagement!</p>'
          END ||
          '<p><a href="https://thatsgoodtoo.shop/vendor/new-listing" style="background: #FF4500; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Create New Listing</a></p>'
      )
    );
    email_count := email_count + 1;
  END LOOP;
  
  PERFORM public.log_cron_complete(log_id, vendor_count, email_count, NULL);
  
EXCEPTION WHEN OTHERS THEN
  PERFORM public.log_cron_complete(log_id, 0, 0, SQLERRM);
  RAISE;
END;
$$;

CREATE OR REPLACE FUNCTION public.monthly_engagement_tasks()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id uuid;
  vendor_count integer := 0;
  inactive_count integer := 0;
  email_count integer := 0;
  vendor_record RECORD;
  user_record RECORD;
  top_coupons text;
BEGIN
  log_id := public.log_cron_start('monthly_engagement_tasks');
  
  FOR vendor_record IN
    SELECT vp.user_id, p.email, p.display_name
    FROM public.vendor_profiles vp
    JOIN public.profiles p ON p.id = vp.user_id
    WHERE vp.subscription_status = 'active'
      AND NOT EXISTS (
        SELECT 1 FROM public.coupons c
        WHERE c.vendor_id = vp.user_id
          AND c.active_status = true
          AND c.end_date > now()
      )
  LOOP
    vendor_count := vendor_count + 1;
    
    PERFORM net.http_post(
      url := 'https://fksjvollrvzokhpptdoi.supabase.co/functions/v1/send-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrc2p2b2xscnZ6b2tocHB0ZG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDE5OTQsImV4cCI6MjA3NjM3Nzk5NH0.5C-dRTTNcR8FC2oeNHAdLICy588BSyOhrF8qYYNDHzE'
      ),
      body := jsonb_build_object(
        'to', vendor_record.email,
        'subject', '⚠️ No Active Coupons - Add One Now!',
        'html', '<p>Hi ' || COALESCE(vendor_record.display_name, 'there') || ',</p><p>You don''t have any active coupons right now. Add one to attract more customers!</p><p><a href="https://thatsgoodtoo.shop/vendor-dashboard" style="background: #32CD32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Add Coupon Now</a></p>'
      )
    );
    email_count := email_count + 1;
  END LOOP;
  
  SELECT string_agg(
    '• ' || l.title || ' - ' || c.code,
    E'\n'
  ) INTO top_coupons
  FROM public.listings l
  JOIN public.coupons c ON c.listing_id = l.id
  WHERE l.status = 'active'
    AND c.active_status = true
    AND c.end_date > now()
  ORDER BY l.views DESC
  LIMIT 3;
  
  FOR user_record IN
    SELECT id, email, display_name
    FROM public.profiles
    WHERE last_activity_at < now() - interval '60 days'
      OR last_activity_at IS NULL
    LIMIT 100
  LOOP
    inactive_count := inactive_count + 1;
    
    PERFORM net.http_post(
      url := 'https://fksjvollrvzokhpptdoi.supabase.co/functions/v1/send-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrc2p2b2xscnZ6b2tocHB0ZG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDE5OTQsImV4cCI6MjA3NjM3Nzk5NH0.5C-dRTTNcR8FC2oeNHAdLICy588BSyOhrF8qYYNDHzE'
      ),
      body := jsonb_build_object(
        'to', user_record.email,
        'subject', '💝 We Missed You! Top 3 Hot Coupons Inside',
        'html', '<p>Hey ' || COALESCE(user_record.display_name, 'there') || ',</p><p>It''s been a while! Check out these trending deals:</p><pre>' || COALESCE(top_coupons, 'No coupons available') || '</pre><p><a href="https://thatsgoodtoo.shop" style="background: #FF4500; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Explore Deals</a></p>'
      )
    );
    email_count := email_count + 1;
  END LOOP;
  
  PERFORM public.log_cron_complete(log_id, vendor_count + inactive_count, email_count, NULL);
  
EXCEPTION WHEN OTHERS THEN
  PERFORM public.log_cron_complete(log_id, 0, 0, SQLERRM);
  RAISE;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_referral_bonus()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referral_record RECORD;
  referrer_email text;
BEGIN
  SELECT r.id, r.referrer_id, r.status
  INTO referral_record
  FROM public.referrals r
  WHERE r.referred_email = NEW.email
    AND r.status = 'pending'
  LIMIT 1;
  
  IF FOUND THEN
    UPDATE public.referrals
    SET status = 'success'
    WHERE id = referral_record.id;
    
    SELECT p.email INTO referrer_email
    FROM public.profiles p
    WHERE p.id = referral_record.referrer_id;
    
    IF referrer_email IS NOT NULL THEN
      PERFORM net.http_post(
        url := 'https://fksjvollrvzokhpptdoi.supabase.co/functions/v1/send-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrc2p2b2xscnZ6b2tocHB0ZG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDE5OTQsImV4cCI6MjA3NjM3Nzk5NH0.5C-dRTTNcR8FC2oeNHAdLICy588BSyOhrF8qYYNDHzE'
        ),
        body := jsonb_build_object(
          'to', referrer_email,
          'subject', '🎉 Referral Bonus Unlocked!',
          'html', '<p>Congratulations!</p><p>Your friend just signed up using your referral link.</p><p>Your bonus coupon code: <strong>REFER10</strong></p><p>Use it on your next purchase!</p><p><a href="https://thatsgoodtoo.shop" style="background: #32CD32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Shop Now</a></p>',
          'templateVars', jsonb_build_object(
            'coupon_code', 'REFER10'
          )
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_cron_job(job_name text)
RETURNS jsonb 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  CASE job_name
    WHEN 'daily' THEN
      PERFORM public.daily_listing_notifications();
    WHEN 'weekly' THEN
      PERFORM public.weekly_vendor_nudges();
    WHEN 'monthly' THEN
      PERFORM public.monthly_engagement_tasks();
    ELSE
      RETURN jsonb_build_object('error', 'Unknown job name');
  END CASE;
  
  RETURN jsonb_build_object('success', true, 'job', job_name);
END;
$$;