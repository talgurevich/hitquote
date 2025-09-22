-- Fix the 78 products with null user_id by assigning them to the new user (ID 17)

-- First verify the new user exists
SELECT 'New user (mvmntfactoryakko@gmail.com):' as step;
SELECT id, email, auth_user_id 
FROM public.users 
WHERE email = 'mvmntfactoryakko@gmail.com';

-- Update the 78 null products to belong to user_id 17
UPDATE product 
SET user_id = 17 
WHERE user_id IS NULL;

-- Verify the fix
SELECT 'After fix - products by user_id:' as step;
SELECT 
    CASE 
        WHEN user_id IS NULL THEN 'NULL' 
        ELSE user_id::TEXT 
    END as user_id_display,
    user_id,
    COUNT(*) as product_count
FROM product 
GROUP BY user_id
ORDER BY product_count DESC;