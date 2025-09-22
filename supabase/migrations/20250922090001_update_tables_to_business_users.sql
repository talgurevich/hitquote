-- Update all business tables to reference business users instead of auth.users
-- This replaces tenant_id (UUID pointing to auth.users) with user_id (INTEGER pointing to business users)

-- 1. Add user_id columns to all business tables
ALTER TABLE settings ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES public.users(id);
ALTER TABLE customer ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES public.users(id);
ALTER TABLE product ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES public.users(id);
ALTER TABLE proposal ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES public.users(id);
ALTER TABLE proposal_item ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES public.users(id);

-- 2. Create indexes for user_id columns
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_user_id ON customer(user_id);
CREATE INDEX IF NOT EXISTS idx_product_user_id ON product(user_id);
CREATE INDEX IF NOT EXISTS idx_proposal_user_id ON proposal(user_id);
CREATE INDEX IF NOT EXISTS idx_proposal_item_user_id ON proposal_item(user_id);

-- 3. Populate user_id columns based on existing tenant_id data
-- This maps the auth.users IDs to business users IDs
UPDATE settings SET user_id = (
    SELECT u.id FROM public.users u WHERE u.auth_user_id = settings.tenant_id
) WHERE tenant_id IS NOT NULL;

UPDATE customer SET user_id = (
    SELECT u.id FROM public.users u WHERE u.auth_user_id = customer.tenant_id
) WHERE tenant_id IS NOT NULL;

UPDATE product SET user_id = (
    SELECT u.id FROM public.users u WHERE u.auth_user_id = product.tenant_id
) WHERE tenant_id IS NOT NULL;

UPDATE proposal SET user_id = (
    SELECT u.id FROM public.users u WHERE u.auth_user_id = proposal.tenant_id
) WHERE tenant_id IS NOT NULL;

UPDATE proposal_item SET user_id = (
    SELECT u.id FROM public.users u WHERE u.auth_user_id = proposal_item.tenant_id
) WHERE tenant_id IS NOT NULL;

-- 4. Drop old tenant-based RLS policies
DROP POLICY IF EXISTS "Users can only see their own settings" ON settings;
DROP POLICY IF EXISTS "Users can only see their own customers" ON customer;
DROP POLICY IF EXISTS "Users can only see their own products" ON product;
DROP POLICY IF EXISTS "Users can only see their own proposals" ON proposal;
DROP POLICY IF EXISTS "Users can only see their own proposal items" ON proposal_item;

-- 5. Create new business user-based RLS policies
-- Settings policies
CREATE POLICY "Users can only see their own settings" ON settings
    FOR ALL USING (
        user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Customer policies  
CREATE POLICY "Users can only see their own customers" ON customer
    FOR ALL USING (
        user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Product policies
CREATE POLICY "Users can only see their own products" ON product
    FOR ALL USING (
        user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Proposal policies
CREATE POLICY "Users can only see their own proposals" ON proposal
    FOR ALL USING (
        user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Proposal item policies
CREATE POLICY "Users can only see their own proposal items" ON proposal_item
    FOR ALL USING (
        user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- 6. Update the auto-set function to use business users
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Update triggers to use new function
DROP TRIGGER IF EXISTS set_tenant_id_settings ON settings;
DROP TRIGGER IF EXISTS set_tenant_id_customer ON customer;
DROP TRIGGER IF EXISTS set_tenant_id_product ON product;
DROP TRIGGER IF EXISTS set_tenant_id_proposal ON proposal;
DROP TRIGGER IF EXISTS set_tenant_id_proposal_item ON proposal_item;

CREATE TRIGGER set_user_id_settings
    BEFORE INSERT ON settings
    FOR EACH ROW EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_customer
    BEFORE INSERT ON customer
    FOR EACH ROW EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_product
    BEFORE INSERT ON product
    FOR EACH ROW EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_proposal
    BEFORE INSERT ON proposal
    FOR EACH ROW EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_proposal_item
    BEFORE INSERT ON proposal_item
    FOR EACH ROW EXECUTE FUNCTION set_user_id();

-- 8. Update the first-time user function
DROP FUNCTION IF EXISTS is_first_time_user(UUID);
CREATE OR REPLACE FUNCTION is_first_time_user(auth_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    business_user_id INTEGER;
BEGIN
    SELECT id INTO business_user_id FROM public.users WHERE auth_user_id = is_first_time_user.auth_user_id;
    
    IF business_user_id IS NULL THEN
        RETURN TRUE; -- No business user exists yet
    END IF;
    
    RETURN NOT EXISTS (
        SELECT 1 FROM settings WHERE user_id = business_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Update the new user initialization function
-- First drop the trigger that depends on the function
DROP TRIGGER IF EXISTS initialize_new_user_trigger ON auth.users;
DROP FUNCTION IF EXISTS initialize_new_user();
CREATE OR REPLACE FUNCTION initialize_new_user()
RETURNS TRIGGER AS $$
DECLARE
    business_user_id INTEGER;
BEGIN
    -- First, create the business user record
    INSERT INTO public.users (email, name, auth_user_id)
    VALUES (
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.id
    )
    RETURNING id INTO business_user_id;
    
    -- Then create default settings for the business user
    INSERT INTO settings (user_id, vat_rate, default_payment_terms)
    VALUES (business_user_id, 18, 'מזומן / המחאה / העברה בנקאית / שוטף +30');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger for new user initialization
CREATE TRIGGER initialize_new_user_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION initialize_new_user();