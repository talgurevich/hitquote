-- Temporarily disable RLS for migrations to allow data insertion
-- This will be re-enabled after the migration completes

-- Disable RLS temporarily for product table during migrations
ALTER TABLE product DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS and recreate policies
ALTER TABLE product ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can only see their own products" ON product;
DROP POLICY IF EXISTS "Users can only insert their own products" ON product;
DROP POLICY IF EXISTS "Users can only update their own products" ON product;
DROP POLICY IF EXISTS "Users can only delete their own products" ON product;

-- Recreate policies with proper permissions
CREATE POLICY "Users can only see their own products" ON product
    FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "Users can only insert their own products" ON product
    FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can only update their own products" ON product
    FOR UPDATE USING (tenant_id = auth.uid());

CREATE POLICY "Users can only delete their own products" ON product
    FOR DELETE USING (tenant_id = auth.uid());

-- Grant necessary permissions for the service role to bypass RLS during migrations
GRANT ALL ON product TO service_role;