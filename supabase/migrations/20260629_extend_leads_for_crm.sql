-- ===========================================================================
-- Migración: Extender tabla leads con campos CRM
-- Fecha: 2026-06-29
-- Propósito: Añadir columnas de CRM a la tabla existente `leads` para que
--            los leads del formulario público y los clientes creados desde
--            el panel usen la misma tabla sin duplicar datos.
-- IDEMPOTENTE: usa ADD COLUMN IF NOT EXISTS
-- ===========================================================================

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS client_type       TEXT,
  ADD COLUMN IF NOT EXISTS budget_min        NUMERIC,
  ADD COLUMN IF NOT EXISTS budget_max        NUMERIC,
  ADD COLUMN IF NOT EXISTS budget_currency   TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS interested_zones  TEXT[],
  ADD COLUMN IF NOT EXISTS interested_types  TEXT[],
  ADD COLUMN IF NOT EXISTS next_action       TEXT,
  ADD COLUMN IF NOT EXISTS next_action_date  DATE,
  ADD COLUMN IF NOT EXISTS properties_shown  UUID[],
  ADD COLUMN IF NOT EXISTS notes             TEXT,
  ADD COLUMN IF NOT EXISTS last_contact      DATE,
  ADD COLUMN IF NOT EXISTS priority          TEXT DEFAULT 'media',
  ADD COLUMN IF NOT EXISTS source            TEXT DEFAULT 'web',
  ADD COLUMN IF NOT EXISTS req_bedrooms      INTEGER,
  ADD COLUMN IF NOT EXISTS req_bathrooms     NUMERIC,
  ADD COLUMN IF NOT EXISTS req_parking       INTEGER,
  ADD COLUMN IF NOT EXISTS bath_preference   TEXT;


-- Nota: el campo `status` ya existe en leads con DEFAULT 'nuevo'.
-- Los valores válidos del pipeline CRM son:
-- 'nuevo' | 'contactado' | 'visita' | 'negociacion' | 'cerrado' | 'perdido'
-- Todos los registros existentes del formulario ya usan 'nuevo' por defecto
-- (confirmado en src/lib/queries/leads.ts y src/app/api/leads/route.ts).

-- Comentario en columna para documentar valores válidos de client_type
COMMENT ON COLUMN leads.client_type IS 'comprador | arrendatario | propietario | inversor';
COMMENT ON COLUMN leads.status IS 'nuevo | contactado | visita | negociacion | cerrado | perdido';
COMMENT ON COLUMN leads.priority IS 'alta | media | baja';
