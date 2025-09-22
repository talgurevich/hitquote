-- Final comprehensive fix for auth_user_id column type
-- Must drop foreign key constraint, policies, change type, then recreate policies

-- 1. Drop the foreign key constraint first
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_auth_user_id_fkey;

-- 2. Drop all policies that reference auth_user_id on the users table
DROP POLICY IF EXISTS "Users can view own record" ON public.users;
DROP POLICY IF EXISTS "Users can update own record" ON public.users;

-- 3. Drop all policies on business tables that reference auth.uid()
DROP POLICY IF EXISTS "Users can only see their own settings" ON settings;
DROP POLICY IF EXISTS "Users can only see their own customers" ON customer;
DROP POLICY IF EXISTS "Users can only see their own products" ON product;
DROP POLICY IF EXISTS "Users can only see their own proposals" ON proposal;
DROP POLICY IF EXISTS "Users can only see their own proposal items" ON proposal_item;

-- 4. Now we can change the column type
ALTER TABLE public.users ALTER COLUMN auth_user_id TYPE TEXT;

-- 5. Recreate policies for the users table (TEXT comparison)
CREATE POLICY "Users can view own record" ON public.users
    FOR SELECT USING (auth_user_id = auth.uid()::TEXT);

CREATE POLICY "Users can update own record" ON public.users
    FOR UPDATE USING (auth_user_id = auth.uid()::TEXT);

-- 6. Recreate business table policies (using subquery to business users)
CREATE POLICY "Users can only see their own settings" ON settings
    FOR ALL USING (
        user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()::TEXT)
    );

CREATE POLICY "Users can only see their own customers" ON customer
    FOR ALL USING (
        user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()::TEXT)
    );

CREATE POLICY "Users can only see their own products" ON product
    FOR ALL USING (
        user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()::TEXT)
    );

CREATE POLICY "Users can only see their own proposals" ON proposal
    FOR ALL USING (
        user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()::TEXT)
    );

CREATE POLICY "Users can only see their own proposal items" ON proposal_item
    FOR ALL USING (
        user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()::TEXT)
    );

-- 7. Insert the missing users with their numeric Google OAuth IDs
INSERT INTO public.users (email, name, auth_user_id, created_at)
VALUES 
    ('tal.gurevich2@gmail.com', 'Tal Gurevich', '112033013510964625130', NOW()),
    ('tal.gurevich@gmail.com', 'Tal Gurevich', '100019258193212857278', NOW())
ON CONFLICT (email) DO UPDATE SET 
    auth_user_id = EXCLUDED.auth_user_id,
    name = EXCLUDED.name;

-- 8. Update the initialize_new_user function to use TEXT
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
        NEW.id::TEXT  -- Cast UUID to TEXT
    )
    RETURNING id INTO business_user_id;
    
    -- Then create default settings for the business user
    INSERT INTO settings (user_id, vat_rate, default_payment_terms)
    VALUES (business_user_id, 18, 'מזומן / המחאה / העברה בנקאית / שוטף +30');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Verify the users were added
SELECT id, email, name, auth_user_id FROM public.users ORDER BY id;