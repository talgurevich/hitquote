-- Add delivery_date field to proposal table
ALTER TABLE proposal 
ADD COLUMN delivery_date DATE;

-- Add comment for documentation
COMMENT ON COLUMN proposal.delivery_date IS 'Expected delivery date for the proposal';