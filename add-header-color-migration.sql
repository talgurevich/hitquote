-- Add header_color field to settings table
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS header_color TEXT DEFAULT '#FDDC33';

-- Update comment to describe the new field
COMMENT ON COLUMN settings.header_color IS 'Hex color code for PDF header background';