-- Create approved_emails table for account approval system
CREATE TABLE IF NOT EXISTS approved_emails (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by VARCHAR(255),
    approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_approved_emails_email ON approved_emails(email);
CREATE INDEX IF NOT EXISTS idx_approved_emails_status ON approved_emails(status);

-- Enable RLS (Row Level Security)
ALTER TABLE approved_emails ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to have full access
CREATE POLICY "Service role can manage approved_emails" ON approved_emails
    FOR ALL USING (auth.role() = 'service_role');

-- Create policy for authenticated users to read their own approval status
CREATE POLICY "Users can check their own approval status" ON approved_emails
    FOR SELECT USING (auth.email() = email);

-- Insert existing users from users table into approved_emails
-- (Run this after creating the table)
INSERT INTO approved_emails (email, status, approved_by, approved_at)
SELECT DISTINCT email, 'approved', 'system_migration', CURRENT_TIMESTAMP
FROM users
WHERE email IS NOT NULL
ON CONFLICT (email) DO NOTHING;