-- Phase 1: Create Normalized folders Table (Idempotent)
DROP TABLE IF EXISTS public.folders CASCADE;

CREATE TABLE public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) > 0),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, name)
);

CREATE INDEX idx_folders_user_id ON public.folders(user_id);

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own folders"
ON public.folders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own folders"
ON public.folders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own folders"
ON public.folders FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders"
ON public.folders FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all folders"
ON public.folders FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_folders_updated_at
BEFORE UPDATE ON public.folders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Phase 2: Recreate user_saves with Folder Support (Idempotent)
DROP TABLE IF EXISTS public.user_saves CASCADE;

CREATE TABLE public.user_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  save_type TEXT NOT NULL CHECK (save_type IN ('listing', 'vendor')),
  target_id UUID NOT NULL,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  email_on_save BOOLEAN DEFAULT false,
  UNIQUE(user_id, save_type, target_id)
);

CREATE INDEX idx_user_saves_user_id ON public.user_saves(user_id);
CREATE INDEX idx_user_saves_target_id ON public.user_saves(target_id);
CREATE INDEX idx_user_saves_folder_id ON public.user_saves(folder_id);
CREATE INDEX idx_user_saves_save_type ON public.user_saves(save_type);
CREATE INDEX idx_user_saves_user_type ON public.user_saves(user_id, save_type);

ALTER TABLE public.user_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own saves"
ON public.user_saves FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own saves"
ON public.user_saves FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own saves"
ON public.user_saves FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saves"
ON public.user_saves FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all saves"
ON public.user_saves FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Phase 3: Migrate Data from Old favorites Table
DO $$
DECLARE
  folder_record RECORD;
  new_folder_id UUID;
BEGIN
  FOR folder_record IN 
    SELECT DISTINCT user_id, folder_name 
    FROM public.favorites
  LOOP
    INSERT INTO public.folders (user_id, name, description)
    VALUES (
      folder_record.user_id, 
      folder_record.folder_name,
      'Migrated from favorites'
    )
    ON CONFLICT (user_id, name) DO NOTHING
    RETURNING id INTO new_folder_id;
    
    IF new_folder_id IS NULL THEN
      SELECT id INTO new_folder_id 
      FROM public.folders 
      WHERE user_id = folder_record.user_id 
        AND name = folder_record.folder_name;
    END IF;
    
    INSERT INTO public.user_saves (user_id, save_type, target_id, folder_id, saved_at)
    SELECT 
      f.user_id,
      'listing' AS save_type,
      f.item_id::UUID,
      new_folder_id,
      f.created_at
    FROM public.favorites f
    WHERE f.user_id = folder_record.user_id
      AND f.folder_name = folder_record.folder_name
    ON CONFLICT (user_id, save_type, target_id) DO NOTHING;
  END LOOP;
END $$;

DROP TABLE IF EXISTS public.favorites CASCADE;

-- Phase 4: Insert Test Data
DO $$
DECLARE
  test_user_id UUID;
  favorites_folder_id UUID;
  test_listing_id UUID := 'a0f46cbf-0b3f-4eac-8e25-b4414fdeb75d';
  test_vendor_id UUID;
BEGIN
  SELECT id INTO test_user_id 
  FROM auth.users 
  WHERE email = 'biz@fatcat.media'
  LIMIT 1;
  
  SELECT user_id INTO test_vendor_id
  FROM public.vendor_profiles
  LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    INSERT INTO public.folders (user_id, name, description)
    VALUES (
      test_user_id,
      'Favorites',
      'My favorite listings and vendors'
    )
    ON CONFLICT (user_id, name) DO UPDATE
    SET description = EXCLUDED.description
    RETURNING id INTO favorites_folder_id;
    
    INSERT INTO public.user_saves (user_id, save_type, target_id, folder_id, email_on_save)
    VALUES (
      test_user_id,
      'listing',
      test_listing_id,
      favorites_folder_id,
      true
    )
    ON CONFLICT (user_id, save_type, target_id) DO NOTHING;
    
    IF test_vendor_id IS NOT NULL THEN
      INSERT INTO public.user_saves (user_id, save_type, target_id, folder_id, email_on_save)
      VALUES (
        test_user_id,
        'vendor',
        test_vendor_id,
        favorites_folder_id,
        false
      )
      ON CONFLICT (user_id, save_type, target_id) DO NOTHING;
    END IF;
    
    INSERT INTO public.folders (user_id, name, description)
    VALUES 
      (test_user_id, 'Wishlist', 'Items I want to buy later'),
      (test_user_id, 'For Later', 'Deals to check out soon')
    ON CONFLICT (user_id, name) DO NOTHING;
  END IF;
END $$;