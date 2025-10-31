-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to send signup notification via edge function
CREATE OR REPLACE FUNCTION public.notify_new_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_id bigint;
  function_url text;
BEGIN
  -- Build the edge function URL
  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-signup-notification';
  
  -- If app.settings.supabase_url is not set, fall back to env var pattern
  IF function_url IS NULL OR function_url = '/functions/v1/send-signup-notification' THEN
    function_url := 'https://fksjvollrvzokhpptdoi.supabase.co/functions/v1/send-signup-notification';
  END IF;

  -- Make async HTTP request to edge function
  SELECT INTO request_id net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_role_key', true)
    ),
    body := jsonb_build_object(
      'user_id', NEW.id::text,
      'role', NEW.role::text
    ),
    timeout_milliseconds := 5000
  );

  -- Log the request (optional, for debugging)
  RAISE LOG 'Signup notification request sent for user % with request_id %', NEW.id, request_id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Failed to send signup notification for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS after_profile_insert ON public.profiles;

CREATE TRIGGER after_profile_insert
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_signup();

-- Add comment for documentation
COMMENT ON FUNCTION public.notify_new_signup() 
IS 'Sends an email notification to connect@thatsgoodtoo.shop when a new user signs up. Calls the send-signup-notification edge function with user details.';