-- Fix products with null user_id by assigning them to the correct business user

-- First, find the business user ID for tal.gurevich2@gmail.com
SELECT 'Business user for tal.gurevich2@gmail.com:' as debug_step;
SELECT id, email, auth_user_id 
FROM public.users 
WHERE email = 'tal.gurevich2@gmail.com';

-- Update all products with null user_id to belong to user ID 5 (tal.gurevich2@gmail.com)
UPDATE product 
SET user_id = 5 
WHERE user_id IS NULL;

-- Verify the fix
SELECT 'After fix - products by user_id:' as debug_step;
SELECT user_id, COUNT(*) as product_count
FROM product 
GROUP BY user_id
ORDER BY product_count DESC;