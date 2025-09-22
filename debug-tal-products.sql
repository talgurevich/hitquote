-- Debug script to check products for tal.gurevich2@gmail.com
-- Run this in Supabase SQL editor

-- Check if there are any products with the converted UUID
SELECT * FROM product WHERE tenant_id = '00000000-0001-1203-3013-510964625130';

-- Check if there are any products with the original numeric ID (shouldn't work but let's check)
SELECT * FROM product WHERE tenant_id = '112033013510964625130';

-- Check if there are any products without tenant_id
SELECT * FROM product WHERE tenant_id IS NULL;

-- Count all products in the system
SELECT count(*) as total_products FROM product;

-- Show all products with their tenant_ids (first 10)
SELECT id, tenant_id, name, category, created_at FROM product ORDER BY created_at DESC LIMIT 10;