-- Data migration script to assign existing data to approved users
-- This script assigns all existing data to the two approved users based on their Google auth IDs

-- NOTE: You'll need to replace the USER_ID values below with the actual auth.users IDs 
-- from your Supabase auth.users table for tal.gurevich@gmail.com and moran.marmus@gmail.com

-- Step 1: Find the user IDs for the approved emails
-- Run this query first in Supabase to get the actual user IDs:
-- SELECT id, email FROM auth.users WHERE email IN ('tal.gurevich@gmail.com', 'moran.marmus@gmail.com');

-- Step 2: Replace these placeholder IDs with the actual user IDs from Step 1
-- IMPORTANT: Update these UUIDs with the real ones from your auth.users table
DO $$
DECLARE
    tal_user_id UUID; 
    moran_user_id UUID;
BEGIN
    -- Get user IDs from auth.users table
    SELECT id INTO tal_user_id FROM auth.users WHERE email = 'tal.gurevich@gmail.com';
    SELECT id INTO moran_user_id FROM auth.users WHERE email = 'moran.marmus@gmail.com';
    
    -- If we found tal's user ID, assign all existing data to him
    -- (assuming he's the primary user who has been using the system)
    IF tal_user_id IS NOT NULL THEN
        -- Update all existing records to belong to tal.gurevich@gmail.com
        UPDATE settings SET tenant_id = tal_user_id WHERE tenant_id IS NULL;
        UPDATE customer SET tenant_id = tal_user_id WHERE tenant_id IS NULL;
        UPDATE product SET tenant_id = tal_user_id WHERE tenant_id IS NULL;
        UPDATE proposal SET tenant_id = tal_user_id WHERE tenant_id IS NULL;
        UPDATE proposal_item SET tenant_id = tal_user_id WHERE tenant_id IS NULL;
        
        RAISE NOTICE 'Assigned all existing data to tal.gurevich@gmail.com (ID: %)', tal_user_id;
    ELSE
        RAISE EXCEPTION 'Could not find user ID for tal.gurevich@gmail.com';
    END IF;
    
    -- Note: moran.marmus@gmail.com will get a copy of all tal's data 
    -- Run the copy-data-to-moran.sql script after this migration
    IF moran_user_id IS NOT NULL THEN
        RAISE NOTICE 'Found moran.marmus@gmail.com (ID: %) - run copy-data-to-moran.sql next', moran_user_id;
    ELSE
        RAISE NOTICE 'Could not find user ID for moran.marmus@gmail.com';
    END IF;
    
END $$;

-- Step 3: Verify the migration worked
-- SELECT 
--   'settings' as table_name, 
--   tenant_id, 
--   COUNT(*) as record_count 
-- FROM settings 
-- WHERE tenant_id IS NOT NULL 
-- GROUP BY tenant_id
-- UNION ALL
-- SELECT 
--   'customer' as table_name, 
--   tenant_id, 
--   COUNT(*) as record_count 
-- FROM customer 
-- WHERE tenant_id IS NOT NULL 
-- GROUP BY tenant_id
-- UNION ALL
-- SELECT 
--   'product' as table_name, 
--   tenant_id, 
--   COUNT(*) as record_count 
-- FROM product 
-- WHERE tenant_id IS NOT NULL 
-- GROUP BY tenant_id
-- UNION ALL
-- SELECT 
--   'proposal' as table_name, 
--   tenant_id, 
--   COUNT(*) as record_count 
-- FROM proposal 
-- WHERE tenant_id IS NOT NULL 
-- GROUP BY tenant_id;

-- Step 4: After verification, make tenant_id NOT NULL (uncomment when ready)
-- ALTER TABLE settings ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE customer ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE product ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE proposal ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE proposal_item ALTER COLUMN tenant_id SET NOT NULL;