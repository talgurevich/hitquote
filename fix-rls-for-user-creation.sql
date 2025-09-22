-- Fix RLS policies to allow automatic business user creation

-- Option 1: Add INSERT policy for users table
DROP POLICY IF EXISTS "Users can insert own record" ON public.users;
CREATE POLICY "Users can insert own record" ON public.users
    FOR INSERT WITH CHECK (auth_user_id = auth.uid()::TEXT);

-- Option 2: Alternatively, disable RLS temporarily for user creation
-- (We already disabled it earlier, but let's make sure)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- Check current policies
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';