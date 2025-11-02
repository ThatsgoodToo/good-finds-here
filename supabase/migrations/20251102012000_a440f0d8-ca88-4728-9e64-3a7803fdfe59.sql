-- Add shopper role to all vendors who don't have it
-- This ensures vendors can access shopper dashboard as per design
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT ur.user_id, 'shopper'::app_role
FROM public.user_roles ur
WHERE ur.role = 'vendor'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur2
  WHERE ur2.user_id = ur.user_id
  AND ur2.role = 'shopper'
);