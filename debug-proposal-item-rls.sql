-- Debug proposal_item RLS issues

-- Check if proposal_item has the set_user_id trigger
SELECT tgname, tgrelid::regclass, proname 
FROM pg_trigger t 
JOIN pg_proc p ON t.tgfoid = p.oid 
WHERE tgrelid = 'proposal_item'::regclass;

-- Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('proposal_item', 'proposal') AND schemaname = 'public';

-- Check if user_id column exists and has proper constraints
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'proposal_item' AND table_schema = 'public';

-- Simple fix: disable RLS temporarily for proposal_item if needed
-- ALTER TABLE proposal_item DISABLE ROW LEVEL SECURITY;