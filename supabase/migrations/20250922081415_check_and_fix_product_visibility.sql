-- Check and fix product visibility issues
-- This script verifies data exists and ensures RLS policies work correctly

DO $$
DECLARE
    tal_user_id UUID;
    moran_user_id UUID;
    tal_product_count INTEGER;
    moran_product_count INTEGER;
    rec RECORD;
BEGIN
    -- Get user IDs
    SELECT id INTO tal_user_id FROM auth.users WHERE email = 'tal.gurevich@gmail.com';
    SELECT id INTO moran_user_id FROM auth.users WHERE email = 'moran.marmus@gmail.com';
    
    RAISE NOTICE 'Tal user ID: %', tal_user_id;
    RAISE NOTICE 'Moran user ID: %', moran_user_id;
    
    -- Count products for each user
    SELECT COUNT(*) INTO tal_product_count FROM product WHERE tenant_id = tal_user_id;
    SELECT COUNT(*) INTO moran_product_count FROM product WHERE tenant_id = moran_user_id;
    
    RAISE NOTICE 'Tal has % products', tal_product_count;
    RAISE NOTICE 'Moran has % products', moran_product_count;
    
    -- Show some sample products
    RAISE NOTICE 'Sample products for Tal:';
    FOR rec IN (SELECT name, category FROM product WHERE tenant_id = tal_user_id LIMIT 5)
    LOOP
        RAISE NOTICE '  - %: %', rec.category, rec.name;
    END LOOP;
    
    RAISE NOTICE 'Sample products for Moran:';
    FOR rec IN (SELECT name, category FROM product WHERE tenant_id = moran_user_id LIMIT 5)
    LOOP
        RAISE NOTICE '  - %: %', rec.category, rec.name;
    END LOOP;
    
END $$;

-- Ensure RLS is properly configured
ALTER TABLE product ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they work correctly
DROP POLICY IF EXISTS "Users can only see their own products" ON product;
DROP POLICY IF EXISTS "Users can only insert their own products" ON product;
DROP POLICY IF EXISTS "Users can only update their own products" ON product;
DROP POLICY IF EXISTS "Users can only delete their own products" ON product;

-- Create comprehensive RLS policies
CREATE POLICY "Users can only see their own products" ON product
    FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "Users can only insert their own products" ON product
    FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can only update their own products" ON product
    FOR UPDATE USING (tenant_id = auth.uid());

CREATE POLICY "Users can only delete their own products" ON product
    FOR DELETE USING (tenant_id = auth.uid());

-- Ensure service role can bypass RLS for maintenance
GRANT ALL ON product TO service_role;

-- RLS policies configuration complete
SELECT 'RLS policies have been recreated successfully' as status;