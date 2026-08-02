-- SuperrBook Patch v2 — Run this in Supabase SQL Editor
-- Fixes: library public read, community likes, FK constraints

-- ============================================================
-- 1. Backfill profiles for any existing auth.users without one
--    (Fixes "Can't create session" — FK constraint on chat_sessions)
-- ============================================================
INSERT INTO public.profiles (id, email, full_name, avatar_url)
SELECT
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1)
  ),
  au.raw_user_meta_data->>'avatar_url'
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. Make library user_id nullable (shared public library)
-- ============================================================
ALTER TABLE public.library_materials ALTER COLUMN user_id DROP NOT NULL;

-- Drop old per-user read policy
DROP POLICY IF EXISTS "Users can view own library materials" ON public.library_materials;
DROP POLICY IF EXISTS "Library is publicly readable" ON public.library_materials;
CREATE POLICY "Library is publicly readable" ON public.library_materials
  FOR SELECT USING (true);

-- Allow any authenticated user to insert
DROP POLICY IF EXISTS "Users can insert own library materials" ON public.library_materials;
DROP POLICY IF EXISTS "Authenticated users can insert materials" ON public.library_materials;
CREATE POLICY "Authenticated users can insert materials" ON public.library_materials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- 3. Fix community posts — allow anyone to update likes
-- ============================================================
DROP POLICY IF EXISTS "Users can update own post likes" ON public.community_posts;
DROP POLICY IF EXISTS "Anyone can update likes" ON public.community_posts;
CREATE POLICY "Anyone can update likes" ON public.community_posts
  FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================================
-- 4. Ensure chat_sessions update policy exists
-- ============================================================
DROP POLICY IF EXISTS "Users can update own chat sessions" ON public.chat_sessions;
CREATE POLICY "Users can update own chat sessions" ON public.chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);
