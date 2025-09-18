-- Add status field to proposal table
ALTER TABLE proposal 
ADD COLUMN status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected'));

-- Add comment for documentation
COMMENT ON COLUMN proposal.status IS 'Status of the proposal: pending, accepted, or rejected';

-- Update existing records to have 'pending' status
UPDATE proposal SET status = 'pending' WHERE status IS NULL;