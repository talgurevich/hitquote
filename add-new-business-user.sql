-- Add new business user for mvmntfactoryakko@gmail.com

-- First, check what auth users exist for this email
SELECT 'Auth user for mvmntfactoryakko@gmail.com:' as debug_step;
SELECT id, email, created_at, raw_user_meta_data
FROM auth.users 
WHERE email = 'mvmntfactoryakko@gmail.com';

-- Check if business user already exists
SELECT 'Current business user check:' as debug_step;
SELECT id, email, auth_user_id
FROM public.users 
WHERE email = 'mvmntfactoryakko@gmail.com';

-- Insert the new business user (get the auth user ID from the query above)
-- You'll need to replace 'AUTH_USER_ID_HERE' with the actual ID from the first query
-- For now, let's create a template:

-- INSERT INTO public.users (email, name, auth_user_id, created_at)
-- VALUES (
--     'mvmntfactoryakko@gmail.com',
--     'MVMNT Factory Akko',
--     'REPLACE_WITH_ACTUAL_AUTH_USER_ID',
--     NOW()
-- );

-- Create default settings for the new user
-- INSERT INTO settings (user_id, vat_rate, default_payment_terms)
-- SELECT id, 18, 'מזומן / המחאה / העברה בנקאית / שוטף +30'
-- FROM public.users 
-- WHERE email = 'mvmntfactoryakko@gmail.com';

SELECT 'Run the queries above after getting the auth_user_id from the first query' as instruction;