-- Check if tal.gurevich2@gmail.com exists in business users table
SELECT id, email, name, auth_user_id, created_at 
FROM public.users 
WHERE email = 'tal.gurevich2@gmail.com';

-- Also check what auth users exist for tal
SELECT id, email, created_at 
FROM auth.users 
WHERE email LIKE '%tal%'
ORDER BY email;