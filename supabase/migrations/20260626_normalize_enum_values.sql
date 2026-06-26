-- Migration: 20260626_normalize_enum_values.sql
-- Normaliza los valores de condition, furnished y kitchen_type para que
-- coincidan exactamente con los valores del formulario y los tipos TypeScript.
--
-- CONDITION (antes -> ahora):
--   "remodelado"  -> "excelente"  (no tenia equivalente; remodelado = excelente estado)
--   "a_remodelar" -> "por_remodelar"
--   "nuevo"       -> se mantiene
--   "buen_estado" -> se mantiene
--
-- FURNISHED (antes -> ahora):
--   "parcial"  -> "semi_amueblado"
--   "completo" -> "completamente_amueblado"
--   "sin_muebles" -> se mantiene
--
-- KITCHEN_TYPE (antes -> ahora):
--   "ninguna" -> "no_tiene"
--   "electrica", "gas" -> se mantienen

-- -- CONDITION
UPDATE properties SET condition = 'excelente'     WHERE condition = 'remodelado';
UPDATE properties SET condition = 'por_remodelar' WHERE condition = 'a_remodelar';

-- -- FURNISHED
UPDATE properties SET furnished = 'semi_amueblado'          WHERE furnished = 'parcial';
UPDATE properties SET furnished = 'completamente_amueblado'  WHERE furnished = 'completo';

-- -- KITCHEN_TYPE
UPDATE properties SET kitchen_type = 'no_tiene' WHERE kitchen_type = 'ninguna';

-- -- VERIFICACION (ejecutar manualmente para confirmar que no quedan valores huerfanos)
-- SELECT condition, COUNT(*) FROM properties GROUP BY condition;
-- SELECT furnished, COUNT(*) FROM properties GROUP BY furnished;
-- SELECT kitchen_type, COUNT(*) FROM properties GROUP BY kitchen_type;
