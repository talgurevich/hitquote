-- Temporarily disable RLS on proposal_item to fix the blocking issue
ALTER TABLE proposal_item DISABLE ROW LEVEL SECURITY;

-- Also disable for proposal table
ALTER TABLE proposal DISABLE ROW LEVEL SECURITY;