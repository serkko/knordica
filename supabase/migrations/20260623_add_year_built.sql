-- Knordica Schema Migration: Add year_built Column
-- Created: 2026-06-23
-- Description: Add year_built column to properties table to support capturing build year and deriving age.

ALTER TABLE properties ADD COLUMN IF NOT EXISTS year_built INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS maintenance_included BOOLEAN DEFAULT false;
