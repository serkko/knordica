-- Migration: 20260626_normalize_enum_values_v2.sql
-- Aligns all DB values with the authoritative form values shown in the UI
-- Source of truth: labels and values as they appear in PropertyForm.tsx

-- ── condition (Estado de conservación) ──────────────────────────────────────
-- Old "bueno" → "buen_estado"
UPDATE properties SET condition = 'buen_estado' WHERE condition = 'bueno';

-- ── furnished (Mobiliario) ───────────────────────────────────────────────────
-- Old "completamente_amueblado" or "completo" → "amoblado"
UPDATE properties SET furnished = 'amoblado' WHERE furnished IN ('completamente_amueblado', 'completo');
-- Old "semi_amueblado" (with typo, missing 'o') → "semi_amoblado"
UPDATE properties SET furnished = 'semi_amoblado' WHERE furnished = 'semi_amueblado';
-- Old "parcial" → "semi_amoblado"
UPDATE properties SET furnished = 'semi_amoblado' WHERE furnished = 'parcial';
-- Old "sin_amueblar" → "sin_muebles"
UPDATE properties SET furnished = 'sin_muebles' WHERE furnished = 'sin_amueblar';

-- ── gas_type (Tipo de gas) ───────────────────────────────────────────────────
-- Old "bombonas" (plural) → "bombona"
UPDATE properties SET gas_type = 'bombona' WHERE gas_type = 'bombonas';
-- Old "ninguno" → "no_tiene"
UPDATE properties SET gas_type = 'no_tiene' WHERE gas_type = 'ninguno';
-- Old "directo" → "central" (previous migration may have done this already)
UPDATE properties SET gas_type = 'central' WHERE gas_type = 'directo';
