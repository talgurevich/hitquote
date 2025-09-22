-- Fix missing business user for tal.gurevich2@gmail.com
-- Insert the user with the correct Google OAuth numeric ID

-- First check current state
SELECT 'Current business users:' as status;
SELECT id, email, name, auth_user_id FROM public.users ORDER BY id;

SELECT 'Current auth users:' as status;
SELECT id, email FROM auth.users WHERE email LIKE '%tal%' ORDER BY email;

-- Insert/update tal.gurevich2@gmail.com with the correct Google OAuth ID
INSERT INTO public.users (email, name, auth_user_id, created_at)
VALUES ('tal.gurevich2@gmail.com', 'Tal Gurevich', '112033013510964625130', NOW())
ON CONFLICT (email) DO UPDATE SET 
    auth_user_id = EXCLUDED.auth_user_id,
    name = EXCLUDED.name,
    updated_at = NOW();

-- Also ensure tal.gurevich@gmail.com has the correct auth_user_id
INSERT INTO public.users (email, name, auth_user_id, created_at)
VALUES ('tal.gurevich@gmail.com', 'Tal Gurevich', '100019258193212857278', NOW())
ON CONFLICT (email) DO UPDATE SET 
    auth_user_id = EXCLUDED.auth_user_id,
    name = EXCLUDED.name,
    updated_at = NOW();

-- Create default settings for both users if they don't exist
INSERT INTO settings (user_id, vat_rate, default_payment_terms)
SELECT id, 18, 'מזומן / המחאה / העברה בנקאית / שוטף +30'
FROM public.users 
WHERE email IN ('tal.gurevich2@gmail.com', 'tal.gurevich@gmail.com')
AND id NOT IN (SELECT user_id FROM settings WHERE user_id IS NOT NULL);

-- Verify the fix
SELECT 'After fix - business users:' as status;
SELECT id, email, name, auth_user_id FROM public.users ORDER BY id;

SELECT 'Settings created:' as status;
SELECT s.user_id, u.email, s.vat_rate 
FROM settings s 
JOIN public.users u ON s.user_id = u.id 
WHERE u.email LIKE '%tal%';