
-- Fix RLS policies on favorites table to use authenticated role instead of public
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;

-- Recreate policies with authenticated role
CREATE POLICY "Users can insert own favorites"
ON public.favorites
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own favorites"
ON public.favorites
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
ON public.favorites
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
