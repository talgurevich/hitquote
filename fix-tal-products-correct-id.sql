-- First, find the actual user ID for tal.gurevich2@gmail.com
-- Run this query first to see what user IDs exist:

SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'tal.gurevich2@gmail.com'
ORDER BY created_at DESC;

-- Alternative: Check all users to see the pattern
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- Once you find the correct user ID, replace 'USER_ID_HERE' below with the actual ID:

-- UPDATE product 
-- SET tenant_id = 'USER_ID_HERE'
-- WHERE tenant_id IS NULL;

-- Verify the update (replace USER_ID_HERE with the actual ID):
-- SELECT 
--     tenant_id,
--     COUNT(*) as product_count,
--     MIN(name) as sample_product_name
-- FROM product 
-- WHERE tenant_id = 'USER_ID_HERE'
-- GROUP BY tenant_id;