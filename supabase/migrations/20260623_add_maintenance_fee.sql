-- Knordica Schema Migration: Add maintenance_fee Column
-- Created: 2026-06-23
-- Description: Add maintenance_fee and maintenance_fee_currency columns to properties table.
--              These are used in the PropertyForm for monthly HOA/condominium fees.

ALTER TABLE properties ADD COLUMN IF NOT EXISTS maintenance_fee DECIMAL(14,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS maintenance_fee_currency TEXT DEFAULT 'USD';
