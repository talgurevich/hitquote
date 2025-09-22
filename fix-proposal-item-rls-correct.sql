-- Fix RLS policies for proposal_item table with correct type casting

-- Drop existing policies
DROP POLICY IF EXISTS "Users can only see their own proposal items" ON proposal_item;
DROP POLICY IF EXISTS "Users can manage their own proposal items" ON proposal_item;

-- Create new policy with proper type casting
CREATE POLICY "Users can manage their own proposal items" ON proposal_item
    FOR ALL USING (
        user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()::TEXT)
    )
    WITH CHECK (
        user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()::TEXT)
    );

-- Also fix proposal table
DROP POLICY IF EXISTS "Users can only see their own proposals" ON proposal;
DROP POLICY IF EXISTS "Users can manage their own proposals" ON proposal;

CREATE POLICY "Users can manage their own proposals" ON proposal
    FOR ALL USING (
        user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()::TEXT)
    )
    WITH CHECK (
        user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()::TEXT)
    );