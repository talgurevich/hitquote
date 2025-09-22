-- Check the most recent products and their user_id assignments

-- Check products uploaded in last 30 minutes by created_at
SELECT 'Recent products by user_id:' as debug_step;
SELECT user_id, COUNT(*) as count
FROM product 
WHERE created_at > NOW() - INTERVAL '30 minutes'
GROUP BY user_id
ORDER BY count DESC;

-- Check the most recent 10 products
SELECT 'Most recent products:' as debug_step;
SELECT id, name, user_id, created_at 
FROM product 
ORDER BY created_at DESC 
LIMIT 10;

-- Check if there are products with user_id = 17 (the new user)
SELECT 'Products for user_id 17:' as debug_step;
SELECT COUNT(*) as count
FROM product 
WHERE user_id = 17;

-- Check all user_ids with product counts
SELECT 'All user_ids with products:' as debug_step;
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