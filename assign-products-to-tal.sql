-- Assign products with null tenant_id to tal.gurevich@gmail.com
-- First, get the user ID for tal.gurevich@gmail.com
SELECT id, email FROM auth.users WHERE email = 'tal.gurevich@gmail.com';

-- Copy the ID from above and use it in the UPDATE below
-- Replace 'USER_ID_FROM_ABOVE' with the actual ID:

-- UPDATE product 
-- SET tenant_id = 'USER_ID_FROM_ABOVE'
-- WHERE tenant_id IS NULL;

-- Check how many products will be updated:
SELECT COUNT(*) as products_to_update 
FROM product 
WHERE tenant_id IS NULL;

-- After updating, verify the assignment:
-- SELECT 
--     tenant_id,
--     COUNT(*) as product_count,
--     MIN(name) as sample_product_name
-- FROM product 
-- WHERE tenant_id = 'USER_ID_FROM_ABOVE'
-- GROUP BY tenant_id;