-- Add photo_url column to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS photo_url TEXT;
