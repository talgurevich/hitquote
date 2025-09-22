-- Complete settings table migration
-- Add all necessary columns for business settings and logo

ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS business_name TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS business_email TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS business_phone TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS business_address TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS business_license TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT NULL;