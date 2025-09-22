-- Debug product access by temporarily disabling RLS to verify data exists
-- Then set up proper authentication context

-- Check if products exist at all
DO $$
DECLARE
    total_products INTEGER;
    tal_products INTEGER;
    moran_products INTEGER;
    tal_user_id UUID;
    moran_user_id UUID;
    rec RECORD;
BEGIN
    -- Get user IDs
    SELECT id INTO tal_user_id FROM auth.users WHERE email = 'tal.gurevich@gmail.com';
    SELECT id INTO moran_user_id FROM auth.users WHERE email = 'moran.marmus@gmail.com';
    
    -- Count all products
    SELECT COUNT(*) INTO total_products FROM product;
    SELECT COUNT(*) INTO tal_products FROM product WHERE tenant_id = tal_user_id;
    SELECT COUNT(*) INTO moran_products FROM product WHERE tenant_id = moran_user_id;
    
    RAISE NOTICE 'Total products in database: %', total_products;
    RAISE NOTICE 'Tal products: %', tal_products;
    RAISE NOTICE 'Moran products: %', moran_products;
    
    -- Show sample data
    IF total_products > 0 THEN
        RAISE NOTICE 'Sample products:';
        FOR rec IN (SELECT tenant_id, name, category FROM product LIMIT 3)
        LOOP
            RAISE NOTICE '  - % (tenant: %): %', rec.category, rec.tenant_id, rec.name;
        END LOOP;
    END IF;
END $$;

-- Temporarily disable RLS to allow debugging
ALTER TABLE product DISABLE ROW LEVEL SECURITY;

-- Create a simple public function that users can call to get their products
CREATE OR REPLACE FUNCTION get_user_products()
RETURNS TABLE (
    id UUID,
    category TEXT,
    name TEXT,
    unit_label TEXT,
    base_price DECIMAL,
    notes TEXT,
    options TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) 
SECURITY DEFINER
LANGUAGE SQL
AS $$
    SELECT p.id, p.category, p.name, p.unit_label, p.base_price, p.notes, p.options, p.created_at, p.updated_at
    FROM product p
    WHERE p.tenant_id = auth.uid()
    ORDER BY p.category, p.name;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_products() TO authenticated;

-- Re-enable RLS
ALTER TABLE product ENABLE ROW LEVEL SECURITY;