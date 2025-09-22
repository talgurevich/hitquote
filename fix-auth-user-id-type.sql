-- Fix auth_user_id column type from UUID to TEXT to handle Google OAuth numeric IDs
-- Google OAuth gives numeric IDs like "112033013510964625130" which can't be stored as UUID

-- 1. Change the column type from UUID to TEXT
ALTER TABLE public.users ALTER COLUMN auth_user_id TYPE TEXT;

-- 2. Update RLS policies to not cast to UUID  
DROP POLICY IF EXISTS "Users can view own record" ON public.users;
CREATE POLICY "Users can view own record" ON public.users
    FOR SELECT USING (auth_user_id = auth.uid()::TEXT);

DROP POLICY IF EXISTS "Users can update own record" ON public.users;
CREATE POLICY "Users can update own record" ON public.users
    FOR UPDATE USING (auth_user_id = auth.uid()::TEXT);

-- 3. Now insert the missing users with numeric auth IDs
INSERT INTO public.users (email, name, auth_user_id, created_at)
VALUES 
    ('tal.gurevich2@gmail.com', 'Tal Gurevich', '112033013510964625130', NOW()),
    ('tal.gurevich@gmail.com', 'Tal Gurevich', '100019258193212857278', NOW())
ON CONFLICT (email) DO UPDATE SET auth_user_id = EXCLUDED.auth_user_id;

-- 4. Verify the users were added
SELECT id, email, auth_user_id FROM public.users;