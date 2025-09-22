-- Add signature fields to the proposal table
ALTER TABLE proposal 
ADD COLUMN IF NOT EXISTS signature_data TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS signature_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS signature_status VARCHAR(20) DEFAULT 'pending' CHECK (signature_status IN ('pending', 'signed')),
ADD COLUMN IF NOT EXISTS signer_name VARCHAR(255) DEFAULT NULL;

-- Add index for faster queries on signature status
CREATE INDEX IF NOT EXISTS idx_signature_status ON proposal(signature_status);