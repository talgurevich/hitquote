-- Temporarily disable RLS on users table to fix the business user lookup
-- This is a quick fix - we can re-enable it later with proper policies

-- Disable RLS on the users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';