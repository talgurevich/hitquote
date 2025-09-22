-- Verify what products were uploaded and with which user_id

-- Check all products in the database
SELECT 'All products in database:' as debug_step;
SELECT id, name, user_id, category, base_price, created_at 
FROM product 
ORDER BY created_at DESC 
LIMIT 20;

-- Check business users and their IDs
SELECT 'Business users:' as debug_step;
SELECT id, email, auth_user_id, created_at 
FROM public.users 
ORDER BY id;

-- Check specifically for user_id 5 products
SELECT 'Products for user_id 5:' as debug_step;
SELECT COUNT(*) as count, user_id
FROM product 
WHERE user_id = 5
GROUP BY user_id;

-- Check all user_ids with products
SELECT 'All user_ids with products:' as debug_step;
SELECT user_id, COUNT(*) as product_count
FROM product 
GROUP BY user_id
ORDER BY product_count DESC;