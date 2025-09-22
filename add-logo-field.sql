-- Add logo URL field to settings table
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT NULL;