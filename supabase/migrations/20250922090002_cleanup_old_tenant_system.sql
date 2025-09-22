-- Clean up old tenant_id system after migration to business users
-- This removes the old UUID-based tenant system

-- 1. Verify all data has been migrated (optional safety check)
-- Uncomment these to check before running cleanup:
-- SELECT 'settings' as table_name, COUNT(*) as total, COUNT(user_id) as migrated FROM settings;
-- SELECT 'customer' as table_name, COUNT(*) as total, COUNT(user_id) as migrated FROM customer;
-- SELECT 'product' as table_name, COUNT(*) as total, COUNT(user_id) as migrated FROM product;
-- SELECT 'proposal' as table_name, COUNT(*) as total, COUNT(user_id) as migrated FROM proposal;
-- SELECT 'proposal_item' as table_name, COUNT(*) as total, COUNT(user_id) as migrated FROM proposal_item;

-- 2. Drop old tenant_id indexes
DROP INDEX IF EXISTS idx_settings_tenant_id;
DROP INDEX IF EXISTS idx_customer_tenant_id;
DROP INDEX IF EXISTS idx_product_tenant_id;
DROP INDEX IF EXISTS idx_proposal_tenant_id;
DROP INDEX IF EXISTS idx_proposal_item_tenant_id;

-- 3. Drop old tenant_id columns
ALTER TABLE settings DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE customer DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE product DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE proposal DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE proposal_item DROP COLUMN IF EXISTS tenant_id;

-- 4. Drop old functions that were tenant-based
DROP FUNCTION IF EXISTS set_tenant_id();

-- 5. Make user_id columns NOT NULL (after data migration is verified)
-- ALTER TABLE settings ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE customer ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE product ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE proposal ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE proposal_item ALTER COLUMN user_id SET NOT NULL;

-- Note: The above ALTER statements are commented out for safety.
-- Uncomment them only after verifying that all data has been properly migrated
-- and all user_id columns are populated correctly.