-- Verify current database state after running the migration scripts

-- 1. Check the column type of auth_user_id
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public' 
AND column_name = 'auth_user_id';

-- 2. Check if the business users exist
SELECT 'Business users:' as status;
SELECT id, email, name, auth_user_id, created_at 
FROM public.users 
ORDER BY id;

-- 3. Check if auth users exist  
SELECT 'Auth users:' as status;
SELECT id, email, created_at 
FROM auth.users 
WHERE email LIKE '%tal%'
ORDER BY email;

-- 4. Test the business user lookup with actual auth IDs
SELECT 'Testing business user lookup:' as status;
SELECT id, email, auth_user_id 
FROM public.users 
WHERE auth_user_id IN ('112033013510964625130', '100019258193212857278');

-- 5. Check RLS policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';

-- 6. Check the set_user_id function
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'set_user_id' AND routine_schema = 'public';