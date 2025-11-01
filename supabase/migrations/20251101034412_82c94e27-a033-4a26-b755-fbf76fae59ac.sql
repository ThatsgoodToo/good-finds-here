-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Drop existing triggers first
DROP TRIGGER IF EXISTS after_profile_insert ON public.profiles;
DROP TRIGGER IF EXISTS notify_new_signup_trigger ON public.profiles;

-- Now drop the function
DROP FUNCTION IF EXISTS public.notify_new_signup();

-- Create function to notify signup via edge function
CREATE OR REPLACE FUNCTION public.notify_new_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  request_id bigint;
  function_url text := 'https://fksjvollrvzokhpptdoi.supabase.co/functions/v1/send-signup-notification';
  service_role_key text;
  user_role text;
BEGIN
  -- Get user role from user_roles table
  SELECT role::text INTO user_role
  FROM public.user_roles
  WHERE user_id = NEW.id
  ORDER BY created_at DESC
  LIMIT 1;

  -- Default to 'shopper' if no role found
  IF user_role IS NULL THEN
    user_role := 'shopper';
  END IF;

  -- Get service role key from settings
  BEGIN
    service_role_key := current_setting('app.settings.supabase_service_role_key', true);
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Service role key not configured. Signup notification will fail.';
      RETURN NEW;
  END;

  -- Make async HTTP request to edge function using pg_net
  SELECT INTO request_id extensions.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object(
      'user_id', NEW.id::text,
      'role', user_role
    ),
    timeout_milliseconds := 5000
  );

  -- Log the request (optional, for debugging)
  RAISE LOG 'Signup notification request sent for user % with role %, request_id: %', NEW.id, user_role, request_id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Failed to send signup notification for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger on profiles table (fires after insert)
CREATE TRIGGER notify_new_signup_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_signup();