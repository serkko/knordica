-- Knordica Schema Migration: Add missing columns identified during form audit
-- Created: 2026-06-23
-- Description: Add all columns referenced in PropertyForm.tsx that were missing from the DB schema.
--              These were defined in TypeScript types but never migrated to Supabase.

-- Virtual tour URL (used in multimedia section of PropertyForm)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT;

-- Maintenance fee currency (companion to maintenance_fee added earlier today)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS maintenance_fee_currency TEXT DEFAULT 'USD';
