-- Debug the business user issue step by step

-- STEP 1: Check if auth_user_id column is actually TEXT
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public' 
AND column_name = 'auth_user_id';

-- STEP 2: Check current business users
SELECT 'Current business users:' as debug_step;
SELECT id, email, name, auth_user_id, created_at 
FROM public.users;

-- STEP 3: Check current auth users (what IDs are we trying to match)
SELECT 'Current auth users:' as debug_step;
SELECT id, email, created_at 
FROM auth.users 
WHERE email LIKE '%tal%';

-- STEP 4: Try to manually test the query that's failing
SELECT 'Testing the exact query from businessUserUtils:' as debug_step;
SELECT id
FROM public.users 
WHERE auth_user_id = '112033013510964625130';

-- STEP 5: Check RLS policies
SELECT 'RLS policies on users table:' as debug_step;
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';

-- STEP 6: Check if RLS is enabled
SELECT 'RLS status:' as debug_step;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';