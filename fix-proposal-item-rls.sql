-- Fix RLS policies for proposal_item table to allow inserts/updates

-- Check existing policies
SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'proposal_item';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can only see their own proposal items" ON proposal_item;
DROP POLICY IF EXISTS "Users can insert their own proposal items" ON proposal_item;
DROP POLICY IF EXISTS "Users can update their own proposal items" ON proposal_item;
DROP POLICY IF EXISTS "Users can delete their own proposal items" ON proposal_item;

-- Create comprehensive RLS policies for proposal_item
CREATE POLICY "Users can select their own proposal items" ON proposal_item
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()::TEXT
        )
    );

CREATE POLICY "Users can insert their own proposal items" ON proposal_item
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()::TEXT
        )
    );

CREATE POLICY "Users can update their own proposal items" ON proposal_item
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()::TEXT
        )
    ) WITH CHECK (
        user_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()::TEXT
        )
    );

CREATE POLICY "Users can delete their own proposal items" ON proposal_item
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()::TEXT
        )
    );

-- Allow service role to bypass RLS for proposal_item
CREATE POLICY "Service role bypass for proposal_item" ON proposal_item
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);
