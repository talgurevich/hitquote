-- Verify tal.gurevich2@gmail.com products were saved correctly
-- Run this in Supabase SQL editor

-- Check products with the converted UUID
SELECT count(*) as product_count, tenant_id 
FROM product 
WHERE tenant_id = '00000000-0001-1203-3013-510964625130';

-- Show first 5 products to verify they exist
SELECT id, tenant_id, name, category, base_price, created_at 
FROM product 
WHERE tenant_id = '00000000-0001-1203-3013-510964625130'
ORDER BY created_at DESC
LIMIT 5;

-- Check if there are products with any other tenant_id patterns
SELECT tenant_id, count(*) as count
FROM product 
GROUP BY tenant_id
ORDER BY count DESC;