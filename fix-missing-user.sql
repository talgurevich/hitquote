-- Add tal.gurevich2@gmail.com to business users table
-- First check what auth users exist:
SELECT id, email, raw_user_meta_data FROM auth.users WHERE email LIKE '%tal%';

-- Add the missing user to business users table
INSERT INTO public.users (email, name, auth_user_id, created_at)
SELECT 
    email,
    COALESCE(raw_user_meta_data->>'name', email),
    id,
    created_at
FROM auth.users
WHERE email = 'tal.gurevich2@gmail.com'
ON CONFLICT (email) DO NOTHING;

-- Verify the user was added
SELECT * FROM public.users WHERE email = 'tal.gurevich2@gmail.com';