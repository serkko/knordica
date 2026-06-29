-- SQL Migration: Rename property status 'cerrada' to 'inactiva'

-- 1. Drop existing CHECK constraint
ALTER TABLE properties DROP CONSTRAINT IF EXISTS chk_properties_status;

-- 2. Update existing rows in properties table
UPDATE properties SET status = 'inactiva' WHERE status = 'cerrada';

-- 3. Add new CHECK constraint with 'inactiva' instead of 'cerrada'
ALTER TABLE properties ADD CONSTRAINT chk_properties_status CHECK (status IN ('activa', 'vendida', 'alquilada', 'reservada', 'inactiva'));
