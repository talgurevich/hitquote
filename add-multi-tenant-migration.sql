-- Multi-tenant migration: Add tenant_id to all tables and implement proper RLS
-- This script converts the application to support multiple isolated user accounts

-- 1. Add tenant_id columns to all tables
ALTER TABLE settings ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES auth.users(id);
ALTER TABLE customer ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES auth.users(id);
ALTER TABLE product ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES auth.users(id);
ALTER TABLE proposal ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES auth.users(id);
ALTER TABLE proposal_item ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES auth.users(id);

-- 2. Create indexes for tenant_id columns for better performance
CREATE INDEX IF NOT EXISTS idx_settings_tenant_id ON settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customer_tenant_id ON customer(tenant_id);
CREATE INDEX IF NOT EXISTS idx_product_tenant_id ON product(tenant_id);
CREATE INDEX IF NOT EXISTS idx_proposal_tenant_id ON proposal(tenant_id);
CREATE INDEX IF NOT EXISTS idx_proposal_item_tenant_id ON proposal_item(tenant_id);

-- 3. Drop existing policies that allow all operations
DROP POLICY IF EXISTS "Allow all operations on settings" ON settings;
DROP POLICY IF EXISTS "Allow all operations on customer" ON customer;
DROP POLICY IF EXISTS "Allow all operations on product" ON product;
DROP POLICY IF EXISTS "Allow all operations on proposal" ON proposal;
DROP POLICY IF EXISTS "Allow all operations on proposal_item" ON proposal_item;

-- 4. Create tenant-based RLS policies
-- Settings policies
CREATE POLICY "Users can only see their own settings" ON settings
  FOR ALL USING (auth.uid() = tenant_id);

-- Customer policies  
CREATE POLICY "Users can only see their own customers" ON customer
  FOR ALL USING (auth.uid() = tenant_id);

-- Product policies
CREATE POLICY "Users can only see their own products" ON product
  FOR ALL USING (auth.uid() = tenant_id);

-- Proposal policies
CREATE POLICY "Users can only see their own proposals" ON proposal
  FOR ALL USING (auth.uid() = tenant_id);

-- Proposal item policies
CREATE POLICY "Users can only see their own proposal items" ON proposal_item
  FOR ALL USING (auth.uid() = tenant_id);

-- 5. Add function to automatically set tenant_id on inserts
CREATE OR REPLACE FUNCTION set_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tenant_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create triggers to automatically set tenant_id on inserts
CREATE TRIGGER set_tenant_id_settings
  BEFORE INSERT ON settings
  FOR EACH ROW EXECUTE FUNCTION set_tenant_id();

CREATE TRIGGER set_tenant_id_customer
  BEFORE INSERT ON customer
  FOR EACH ROW EXECUTE FUNCTION set_tenant_id();

CREATE TRIGGER set_tenant_id_product
  BEFORE INSERT ON product
  FOR EACH ROW EXECUTE FUNCTION set_tenant_id();

CREATE TRIGGER set_tenant_id_proposal
  BEFORE INSERT ON proposal
  FOR EACH ROW EXECUTE FUNCTION set_tenant_id();

CREATE TRIGGER set_tenant_id_proposal_item
  BEFORE INSERT ON proposal_item
  FOR EACH ROW EXECUTE FUNCTION set_tenant_id();

-- 7. Create a function to check if user is first-time user
CREATE OR REPLACE FUNCTION is_first_time_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM settings WHERE tenant_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create a function to initialize new user with default settings
CREATE OR REPLACE FUNCTION initialize_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default settings for new user
  INSERT INTO settings (tenant_id, vat_rate, default_payment_terms)
  VALUES (NEW.id, 18, 'מזומן / המחאה / העברה בנקאית / שוטף +30');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create trigger to auto-initialize new users
CREATE TRIGGER initialize_new_user_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_new_user();

-- 10. Add constraint to ensure tenant_id is always set (except for legacy data)
-- We'll make these NOT NULL after data migration
-- ALTER TABLE settings ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE customer ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE product ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE proposal ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE proposal_item ALTER COLUMN tenant_id SET NOT NULL;