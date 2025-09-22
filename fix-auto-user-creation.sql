-- Fix automatic business user creation for new signups

-- First, let's manually add the new user
-- Get the auth user info
SELECT 'Auth user info:' as step;
SELECT id, email, created_at, raw_user_meta_data 
FROM auth.users 
WHERE email = 'mvmntfactoryakko@gmail.com';

-- Add the business user manually (using a dynamic query)
INSERT INTO public.users (email, name, auth_user_id, created_at)
SELECT 
    email,
    COALESCE(raw_user_meta_data->>'name', email),
    id::TEXT,
    created_at
FROM auth.users
WHERE email = 'mvmntfactoryakko@gmail.com'
ON CONFLICT (email) DO NOTHING;

-- Create default settings
INSERT INTO settings (user_id, vat_rate, default_payment_terms)
SELECT id, 18, 'מזומן / המחאה / העברה בנקאית / שוטף +30'
FROM public.users 
WHERE email = 'mvmntfactoryakko@gmail.com'
AND id NOT IN (SELECT user_id FROM settings WHERE user_id IS NOT NULL);

-- Verify the user was created
SELECT 'New business user created:' as step;
SELECT id, email, name, auth_user_id 
FROM public.users 
WHERE email = 'mvmntfactoryakko@gmail.com';

-- Check if the trigger is properly set up
SELECT 'Checking trigger setup:' as step;
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'initialize_new_user_trigger';