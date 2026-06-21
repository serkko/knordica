-- Knordica Schema v2 Migration
-- Created: 2026-06-21
-- Description: Expand property types, add vacacional mode,
--              housing details, gamification score, and feature categories

-- ==========================================
-- CAMBIO 1, 2 y 3 — Preparar y Modificar Constraints de 'properties'
-- ==========================================

-- A. Actualizar registros obsoletos antes de aplicar las nuevas restricciones
UPDATE properties SET property_type = 'apartamento' WHERE property_type = 'proyecto';
UPDATE properties SET property_type = 'terreno_lote' WHERE property_type = 'terreno';
UPDATE properties SET status = 'cerrada' WHERE status = 'inactiva';

-- B. Eliminar dinámicamente cualquier check constraint existente en las columnas modificadas de la tabla 'properties'
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Eliminar check constraints de 'operation'
    FOR r IN (
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class cl ON cl.oid = con.conrelid
        JOIN pg_namespace ns ON ns.oid = cl.relnamespace
        JOIN pg_attribute att ON att.attrelid = cl.oid AND att.attnum = con.conkey[1]
        WHERE ns.nspname = 'public'
          AND cl.relname = 'properties'
          AND con.contype = 'c'
          AND att.attname = 'operation'
    ) LOOP
        EXECUTE 'ALTER TABLE properties DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;

    -- Eliminar check constraints de 'property_type'
    FOR r IN (
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class cl ON cl.oid = con.conrelid
        JOIN pg_namespace ns ON ns.oid = cl.relnamespace
        JOIN pg_attribute att ON att.attrelid = cl.oid AND att.attnum = con.conkey[1]
        WHERE ns.nspname = 'public'
          AND cl.relname = 'properties'
          AND con.contype = 'c'
          AND att.attname = 'property_type'
    ) LOOP
        EXECUTE 'ALTER TABLE properties DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;

    -- Eliminar check constraints de 'status'
    FOR r IN (
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class cl ON cl.oid = con.conrelid
        JOIN pg_namespace ns ON ns.oid = cl.relnamespace
        JOIN pg_attribute att ON att.attrelid = cl.oid AND att.attnum = con.conkey[1]
        WHERE ns.nspname = 'public'
          AND cl.relname = 'properties'
          AND con.contype = 'c'
          AND att.attname = 'status'
    ) LOOP
        EXECUTE 'ALTER TABLE properties DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- C. Aplicar nuevos check constraints a la tabla 'properties'
ALTER TABLE properties ADD CONSTRAINT chk_properties_operation CHECK (operation IN ('venta', 'alquiler', 'vacacional'));
ALTER TABLE properties ADD CONSTRAINT chk_properties_property_type CHECK (property_type IN ('casa', 'apartamento', 'townhouse', 'anexo', 'edificio', 'galpon', 'habitacion', 'hacienda_finca', 'local', 'oficina', 'terreno_lote'));
ALTER TABLE properties ADD CONSTRAINT chk_properties_status CHECK (status IN ('activa', 'vendida', 'alquilada', 'reservada', 'cerrada'));


-- ==========================================
-- CAMBIO 4 — Agregar Columnas Nuevas a 'properties'
-- ==========================================

ALTER TABLE properties ADD COLUMN IF NOT EXISTS municipio TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS show_exact_location BOOLEAN DEFAULT true;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS price_usd DECIMAL(14,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Servicios básicos
ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_water_tank BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_hot_water BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_generator BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS gas_type TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_internet BOOLEAN DEFAULT false;

-- Seguridad
ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_security_24h BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_electric_gate BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_cctv BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_electric_fence BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_intercom BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_armored_door BOOLEAN DEFAULT false;

-- Estructura y confort
ALTER TABLE properties ADD COLUMN IF NOT EXISTS floor_number INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS total_floors INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_elevator BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_age INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS condition TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS furnished TEXT DEFAULT 'sin_muebles';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS parking_covered BOOLEAN DEFAULT false;

-- Climatización
ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_ac BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_heating BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS kitchen_type TEXT;

-- Inventario de muebles y amenidades
ALTER TABLE properties ADD COLUMN IF NOT EXISTS furniture_inventory JSONB DEFAULT '[]';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]';

-- Campos específicos de Habitación y Anexo
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bathroom_type TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS host_housing_type TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS cohabitation TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS occupants_count INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS gender_policy TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS deposit_required BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS services_included JSONB DEFAULT '[]';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS allows_pets BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS allows_cooking BOOLEAN DEFAULT true;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_independent_entrance BOOLEAN DEFAULT false;

-- Campos específicos de Terreno y Finca
ALTER TABLE properties ADD COLUMN IF NOT EXISTS topography TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS land_use TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS zone_services JSONB DEFAULT '[]';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS area_hectares DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_own_water BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS access_type TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS current_use TEXT;

-- Campos específicos de Vacacional
ALTER TABLE properties ADD COLUMN IF NOT EXISTS price_per_night DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS price_weekend DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS min_nights INTEGER DEFAULT 1;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS max_guests INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS checkin_time TEXT DEFAULT '14:00';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS checkout_time TEXT DEFAULT '11:00';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS house_rules TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS includes_breakfast BOOLEAN DEFAULT false;

-- Gamificación de listados
ALTER TABLE properties ADD COLUMN IF NOT EXISTS completeness_score INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_badge TEXT DEFAULT 'basico';


-- ==========================================
-- CAMBIO 5 — Modificar Constraints de 'property_features'
-- ==========================================

-- A. Mapear categorías antiguas antes de aplicar restricciones
UPDATE property_features SET category = 'servicios_basicos' WHERE category = 'servicios';

-- B. Eliminar check constraints de category en la tabla 'property_features'
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class cl ON cl.oid = con.conrelid
        JOIN pg_namespace ns ON ns.oid = cl.relnamespace
        JOIN pg_attribute att ON att.attrelid = cl.oid AND att.attnum = con.conkey[1]
        WHERE ns.nspname = 'public'
          AND cl.relname = 'property_features'
          AND con.contype = 'c'
          AND att.attname = 'category'
    ) LOOP
        EXECUTE 'ALTER TABLE property_features DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- C. Aplicar nueva restricción expandida a 'property_features'
ALTER TABLE property_features ADD CONSTRAINT chk_property_features_category CHECK (category IN ('servicios_basicos', 'seguridad', 'amenidades', 'equipamiento', 'habitacion', 'vacacional', 'general'));


-- ==========================================
-- CAMBIO 6 — Tabla Nueva: property_videos
-- ==========================================

CREATE TABLE IF NOT EXISTS property_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title_es TEXT,
  title_en TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar Row Level Security (RLS) en property_videos
ALTER TABLE property_videos ENABLE ROW LEVEL SECURITY;

-- Registrar políticas RLS para property_videos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'property_videos' 
          AND policyname = 'Allow public read on property_videos'
    ) THEN
        CREATE POLICY "Allow public read on property_videos" ON property_videos
          FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'property_videos' 
          AND policyname = 'Allow agents and admins to manage property_videos'
    ) THEN
        CREATE POLICY "Allow agents and admins to manage property_videos" ON property_videos
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM agents 
              WHERE agents.user_id = auth.uid() 
                AND (agents.role = 'agent' OR agents.role = 'senior' OR agents.role = 'admin')
            )
          );
    END IF;
END $$;


-- ==========================================
-- CAMBIO 7 — Trigger: Calcular completeness_score
-- ==========================================

CREATE OR REPLACE FUNCTION calculate_property_completeness()
RETURNS TRIGGER AS $$
DECLARE
    score INTEGER := 0;
    has_title BOOLEAN := false;
    has_desc BOOLEAN := false;
    has_image BOOLEAN := false;
    features_count INTEGER := 0;
    has_video BOOLEAN := false;
BEGIN
    -- 1. Consultar tablas relacionadas usando consultas seguras
    IF NEW.id IS NOT NULL THEN
        SELECT EXISTS(SELECT 1 FROM property_translations WHERE property_id = NEW.id AND title IS NOT NULL AND title <> '') INTO has_title;
        SELECT EXISTS(SELECT 1 FROM property_translations WHERE property_id = NEW.id AND description IS NOT NULL AND description <> '') INTO has_desc;
        SELECT EXISTS(SELECT 1 FROM property_images WHERE property_id = NEW.id) INTO has_image;
        SELECT COUNT(*) FROM property_features WHERE property_id = NEW.id INTO features_count;
        SELECT EXISTS(SELECT 1 FROM property_videos WHERE property_id = NEW.id) INTO has_video;
    END IF;

    -- 2. Asignar puntuaciones parciales
    IF has_title THEN score := score + 10; END IF;
    IF has_desc THEN score := score + 10; END IF;
    IF has_image THEN score := score + 10; END IF;
    
    IF NEW.price IS NOT NULL AND NEW.price > 0 THEN score := score + 5; END IF;
    IF NEW.zone_id IS NOT NULL THEN score := score + 5; END IF;
    IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN score := score + 5; END IF;
    IF NEW.area_built IS NOT NULL AND NEW.area_built > 0 THEN score := score + 5; END IF;
    
    -- Habitaciones aplica para viviendas residenciales
    IF NEW.property_type IN ('casa', 'apartamento', 'townhouse', 'anexo', 'habitacion') THEN
        IF NEW.bedrooms IS NOT NULL AND NEW.bedrooms > 0 THEN score := score + 5; END IF;
    ELSE
        score := score + 5; -- Porcentaje compensado si no aplica
    END IF;

    IF NEW.bathrooms IS NOT NULL AND NEW.bathrooms > 0 THEN score := score + 5; END IF;
    
    IF (NEW.video_url IS NOT NULL AND NEW.video_url <> '') OR has_video THEN score := score + 5; END IF;
    
    IF NEW.condition IS NOT NULL AND NEW.condition <> '' THEN score := score + 5; END IF;
    IF NEW.furnished IS NOT NULL AND NEW.furnished <> '' THEN score := score + 5; END IF;
    
    IF features_count >= 3 THEN score := score + 10; END IF;
    
    IF NEW.address_es IS NOT NULL AND NEW.address_es <> '' THEN score := score + 5; END IF;
    IF NEW.municipio IS NOT NULL AND NEW.municipio <> '' THEN score := score + 5; END IF;
    
    -- Todos los servicios básicos respondidos (no null)
    IF NEW.has_water_tank IS NOT NULL 
       AND NEW.has_generator IS NOT NULL 
       AND NEW.gas_type IS NOT NULL 
       AND NEW.has_internet IS NOT NULL 
    THEN 
        score := score + 5; 
    END IF;

    -- Amenities con al menos 1 elemento
    IF NEW.amenities IS NOT NULL AND jsonb_array_length(NEW.amenities) > 0 THEN
        score := score + 5;
    END IF;

    -- 3. Asegurar límites entre 0 y 100
    IF score > 100 THEN score := 100; END IF;

    -- 4. Asignar Badges según el puntaje
    NEW.completeness_score := score;
    IF score <= 40 THEN
        NEW.listing_badge := 'basico';
    ELSIF score <= 70 THEN
        NEW.listing_badge := 'completo';
    ELSE
        NEW.listing_badge := 'premium';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger en la tabla 'properties'
DROP TRIGGER IF EXISTS trg_properties_completeness ON properties;
CREATE TRIGGER trg_properties_completeness
BEFORE INSERT OR UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION calculate_property_completeness();


-- ==========================================
-- CAMBIO 8 — Índices para Rendimiento
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_properties_operation ON properties(operation);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_zone_id ON properties(zone_id);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_property_features_property_id ON property_features(property_id);
CREATE INDEX IF NOT EXISTS idx_property_features_category ON property_features(category);

-- Migration complete. Run: supabase db push
