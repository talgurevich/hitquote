-- Fix products with null tenant_id for tal.gurevich2@gmail.com
-- These products were uploaded but not assigned to the correct user

-- Update all products with null tenant_id to belong to tal.gurevich2@gmail.com
-- Using the converted UUID format: 00000000-0001-1203-3013-510964625130

UPDATE product 
SET tenant_id = '00000000-0001-1203-3013-510964625130'
WHERE tenant_id IS NULL;

-- Verify the update
SELECT 
    tenant_id,
    COUNT(*) as product_count,
    MIN(name) as sample_product_name
FROM product 
WHERE tenant_id = '00000000-0001-1203-3013-510964625130'
GROUP BY tenant_id;