-- Fix RLS policies for proposal_item table to allow inserts

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'proposal_item' AND schemaname = 'public';

-- Drop existing policy and recreate with proper permissions
DROP POLICY IF EXISTS "Users can only see their own proposal items" ON proposal_item;

-- Create new policy that allows SELECT, INSERT, UPDATE, DELETE
CREATE POLICY "Users can manage their own proposal items" ON proposal_item
    FOR ALL USING (
        user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    )
    WITH CHECK (
        user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Also check if proposal table has similar issues
DROP POLICY IF EXISTS "Users can only see their own proposals" ON proposal;

CREATE POLICY "Users can manage their own proposals" ON proposal
    FOR ALL USING (
        user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    )
    WITH CHECK (
        user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );