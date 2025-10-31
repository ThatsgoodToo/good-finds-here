-- Create function to get vendor application status
CREATE OR REPLACE FUNCTION public.get_vendor_application_status(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT status 
  FROM vendor_applications 
  WHERE user_id = _user_id 
  ORDER BY created_at DESC 
  LIMIT 1;
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  );
$$;

-- Add RLS policies for admin access to vendor applications
CREATE POLICY "Admins can view all applications"
ON vendor_applications
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update applications"
ON vendor_applications
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));