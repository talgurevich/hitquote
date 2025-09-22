-- Fix the set_user_id() function to handle TEXT auth_user_id
-- The function needs to cast auth.uid() to TEXT for comparison

DROP FUNCTION IF EXISTS set_user_id() CASCADE;

CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()::TEXT);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the triggers for all tables that use this function
DROP TRIGGER IF EXISTS set_user_id_trigger ON settings;
CREATE TRIGGER set_user_id_trigger
    BEFORE INSERT ON settings
    FOR EACH ROW EXECUTE FUNCTION set_user_id();

DROP TRIGGER IF EXISTS set_user_id_trigger ON customer;
CREATE TRIGGER set_user_id_trigger
    BEFORE INSERT ON customer
    FOR EACH ROW EXECUTE FUNCTION set_user_id();

DROP TRIGGER IF EXISTS set_user_id_trigger ON product;
CREATE TRIGGER set_user_id_trigger
    BEFORE INSERT ON product
    FOR EACH ROW EXECUTE FUNCTION set_user_id();

DROP TRIGGER IF EXISTS set_user_id_trigger ON proposal;
CREATE TRIGGER set_user_id_trigger
    BEFORE INSERT ON proposal
    FOR EACH ROW EXECUTE FUNCTION set_user_id();

DROP TRIGGER IF EXISTS set_user_id_trigger ON proposal_item;
CREATE TRIGGER set_user_id_trigger
    BEFORE INSERT ON proposal_item
    FOR EACH ROW EXECUTE FUNCTION set_user_id();