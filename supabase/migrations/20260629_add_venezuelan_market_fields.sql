-- Migration: Add Venezuelan market top-tier CRM fields to leads
-- IDEMPOTENT: uses ADD COLUMN IF NOT EXISTS

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS cedula_rif TEXT,
  ADD COLUMN IF NOT EXISTS preferred_payment TEXT,
  ADD COLUMN IF NOT EXISTS urgency TEXT;

COMMENT ON COLUMN leads.cedula_rif IS 'Cédula de Identidad o RIF del cliente';
COMMENT ON COLUMN leads.preferred_payment IS 'zelle | efectivo | transferencia_int | transferencia_ves';
COMMENT ON COLUMN leads.urgency IS 'inmediata (1-15 días) | corto_plazo (1-3 meses) | mediano_plazo (más de 3 meses) | explorando';
