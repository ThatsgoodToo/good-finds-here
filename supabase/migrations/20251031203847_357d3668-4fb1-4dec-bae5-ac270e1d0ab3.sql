-- Grant admin role to connect@thatsgoodtoo.shop
INSERT INTO public.user_roles (user_id, role)
VALUES ('d19764da-ea53-48f4-a494-2541777d4ca9', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;