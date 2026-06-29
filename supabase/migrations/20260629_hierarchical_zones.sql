-- Migration: Establish hierarchical zones system (states, municipalities, zones)
-- IDEMPOTENT: creates tables if not exists, adds columns safely, and seeds all zones

-- Create Nivel 1: States
CREATE TABLE IF NOT EXISTS states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Nivel 2: Municipalities
CREATE TABLE IF NOT EXISTS municipalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID REFERENCES states(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_muni_slug UNIQUE (slug)
);

-- Alter Nivel 3: Zones
ALTER TABLE zones ADD COLUMN IF NOT EXISTS municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL;
ALTER TABLE zones ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Enable RLS for new tables
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE municipalities ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
DROP POLICY IF EXISTS "Allow public read on states" ON states;
CREATE POLICY "Allow public read on states" ON states FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on municipalities" ON municipalities;
CREATE POLICY "Allow public read on municipalities" ON municipalities FOR SELECT USING (true);

-- Seed Nivel 1: Mérida State
INSERT INTO states (slug, name)
VALUES ('merida', 'Mérida')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- Seed Nivel 2: 23 Municipalities of Mérida
-- Only 'Libertador' is active initially (true), the other 22 are inactive (false)
DO $$
DECLARE
  merida_state_id UUID;
BEGIN
  SELECT id INTO merida_state_id FROM states WHERE slug = 'merida';

  INSERT INTO municipalities (state_id, name, slug, active)
  VALUES
    (merida_state_id, 'Libertador', 'libertador', true),
    (merida_state_id, 'Campo Elías', 'campo-elias', false),
    (merida_state_id, 'Santos Marquina', 'santos-marquina', false),
    (merida_state_id, 'Sucre', 'sucre', false),
    (merida_state_id, 'Rangel', 'rangel', false),
    (merida_state_id, 'Alberto Adriani', 'alberto-adriani', false),
    (merida_state_id, 'Tovar', 'tovar', false),
    (merida_state_id, 'Cardenal Quintero', 'cardenal-quintero', false),
    (merida_state_id, 'Miranda', 'miranda', false),
    (merida_state_id, 'Antonio Pinto Salinas', 'antonio-pinto-salinas', false),
    (merida_state_id, 'Rivas Dávila', 'rivas-davila', false),
    (merida_state_id, 'Zea', 'zea', false),
    (merida_state_id, 'Guaraque', 'guaraque', false),
    (merida_state_id, 'Andrés Bello', 'andres-bello', false),
    (merida_state_id, 'Caracciolo Parra Olmedo', 'caracciolo-parra-olmedo', false),
    (merida_state_id, 'Obispo Ramos de Lora', 'obispo-ramos-de-lora', false),
    (merida_state_id, 'Arzobispo Chacón', 'arzobispo-chacon', false),
    (merida_state_id, 'Aricagua', 'aricagua', false),
    (merida_state_id, 'Padre Noguera', 'padre-noguera', false),
    (merida_state_id, 'Pueblo Llano', 'pueblo-llano', false),
    (merida_state_id, 'Justo Briceño', 'justo-briceno', false),
    (merida_state_id, 'Julio César Salas', 'julio-cesar-salas', false),
    (merida_state_id, 'Tulio Febres Cordero', 'tulio-febres-cordero', false)
  ON CONFLICT (slug) DO UPDATE SET
    state_id = EXCLUDED.state_id,
    name = EXCLUDED.name,
    active = EXCLUDED.active;
END $$;

-- Update original static zones (la-pedregosa, la-floresta, las-tapias, el-encanto, belensate)
UPDATE zones 
SET municipality_id = (SELECT id FROM municipalities WHERE slug = 'libertador'), 
    active = true 
WHERE slug IN ('la-pedregosa', 'la-floresta', 'las-tapias', 'el-encanto', 'belensate');

-- Seed Nivel 3 Zones (both new and updated ones to ensure they reference municipality_id)
DO $$
DECLARE
  muni_libertador_id UUID;
  muni_campo_elias_id UUID;
  muni_santos_marquina_id UUID;
  muni_sucre_id UUID;
  muni_rangel_id UUID;
  muni_alberto_adriani_id UUID;
  muni_tovar_id UUID;
  muni_cardenal_quintero_id UUID;
  muni_miranda_id UUID;
  muni_antonio_pinto_salinas_id UUID;
  muni_rivas_davila_id UUID;
  muni_zea_id UUID;
  muni_guaraque_id UUID;
  muni_andres_bello_id UUID;
  muni_caracciolo_parra_olmedo_id UUID;
  muni_obispo_ramos_de_lora_id UUID;
  muni_arzobispo_chacon_id UUID;
  muni_aricagua_id UUID;
  muni_padre_noguera_id UUID;
  muni_pueblo_llano_id UUID;
  muni_justo_briceno_id UUID;
  muni_julio_cesar_salas_id UUID;
  muni_tulio_febres_cordero_id UUID;
BEGIN
  SELECT id INTO muni_libertador_id FROM municipalities WHERE slug = 'libertador';
  SELECT id INTO muni_campo_elias_id FROM municipalities WHERE slug = 'campo-elias';
  SELECT id INTO muni_santos_marquina_id FROM municipalities WHERE slug = 'santos-marquina';
  SELECT id INTO muni_sucre_id FROM municipalities WHERE slug = 'sucre';
  SELECT id INTO muni_rangel_id FROM municipalities WHERE slug = 'rangel';
  SELECT id INTO muni_alberto_adriani_id FROM municipalities WHERE slug = 'alberto-adriani';
  SELECT id INTO muni_tovar_id FROM municipalities WHERE slug = 'tovar';
  SELECT id INTO muni_cardenal_quintero_id FROM municipalities WHERE slug = 'cardenal-quintero';
  SELECT id INTO muni_miranda_id FROM municipalities WHERE slug = 'miranda';
  SELECT id INTO muni_antonio_pinto_salinas_id FROM municipalities WHERE slug = 'antonio-pinto-salinas';
  SELECT id INTO muni_rivas_davila_id FROM municipalities WHERE slug = 'rivas-davila';
  SELECT id INTO muni_zea_id FROM municipalities WHERE slug = 'zea';
  SELECT id INTO muni_guaraque_id FROM municipalities WHERE slug = 'guaraque';
  SELECT id INTO muni_andres_bello_id FROM municipalities WHERE slug = 'andres-bello';
  SELECT id INTO muni_caracciolo_parra_olmedo_id FROM municipalities WHERE slug = 'caracciolo-parra-olmedo';
  SELECT id INTO muni_obispo_ramos_de_lora_id FROM municipalities WHERE slug = 'obispo-ramos-de-lora';
  SELECT id INTO muni_arzobispo_chacon_id FROM municipalities WHERE slug = 'arzobispo-chacon';
  SELECT id INTO muni_aricagua_id FROM municipalities WHERE slug = 'aricagua';
  SELECT id INTO muni_padre_noguera_id FROM municipalities WHERE slug = 'padre-noguera';
  SELECT id INTO muni_pueblo_llano_id FROM municipalities WHERE slug = 'pueblo-llano';
  SELECT id INTO muni_justo_briceno_id FROM municipalities WHERE slug = 'justo-briceno';
  SELECT id INTO muni_julio_cesar_salas_id FROM municipalities WHERE slug = 'julio-cesar-salas';
  SELECT id INTO muni_tulio_febres_cordero_id FROM municipalities WHERE slug = 'tulio-febres-cordero';

  -- Seed Libertador Zones
  INSERT INTO zones (slug, name_es, name_en, municipality_id, city, featured, active) VALUES
    ('centro-merida', 'Centro de Mérida', 'Downtown Mérida', muni_libertador_id, 'Mérida', true, true),
    ('av-las-americas', 'Avenida Las Américas', 'Las Américas Avenue', muni_libertador_id, 'Mérida', true, true),
    ('av-los-proceres', 'Avenida Los Próceres', 'Los Próceres Avenue', muni_libertador_id, 'Mérida', true, true),
    ('av-urdaneta', 'Avenida Urdaneta / Carrizal', 'Urdaneta Avenue / Carrizal', muni_libertador_id, 'Mérida', false, true),
    ('los-chorros-milla', 'Los Chorros / Milla', 'Los Chorros / Milla', muni_libertador_id, 'Mérida', false, true),
    ('el-valle-culata', 'El Valle / La Culata', 'El Valle / La Culata', muni_libertador_id, 'Mérida', false, true),
    ('la-parroquia', 'La Parroquia / El Espejo', 'La Parroquia / El Espejo', muni_libertador_id, 'Mérida', false, true),
    ('campo-claro', 'Campo Claro', 'Campo Claro', muni_libertador_id, 'Mérida', false, true),
    ('santa-juana', 'Santa Juana', 'Santa Juana', muni_libertador_id, 'Mérida', false, true),
    ('la-mara', 'La Mara', 'La Mara', muni_libertador_id, 'Mérida', false, true),
    ('la-hechicera', 'La Hechicera', 'La Hechicera', muni_libertador_id, 'Mérida', false, true),
    ('la-pedregosa-alta', 'La Pedregosa Alta', 'La Pedregosa Alta', muni_libertador_id, 'Mérida', false, true),
    ('la-pedregosa-media', 'La Pedregosa Media', 'La Pedregosa Media', muni_libertador_id, 'Mérida', false, true),
    ('la-pedregosa-baja', 'La Pedregosa Baja', 'La Pedregosa Baja', muni_libertador_id, 'Mérida', false, true),
    ('santa-anita', 'Santa Anita', 'Santa Anita', muni_libertador_id, 'Mérida', false, true),
    ('vuelta-de-lola', 'Vuelta de Lola', 'Vuelta de Lola', muni_libertador_id, 'Mérida', false, true)
  ON CONFLICT (slug) DO UPDATE SET municipality_id = EXCLUDED.municipality_id, name_es = EXCLUDED.name_es, active = EXCLUDED.active;

  -- Seed Campo Elías Zones
  INSERT INTO zones (slug, name_es, name_en, municipality_id, city, featured, active) VALUES
    ('ejido-centro', 'Ejido Centro', 'Ejido Downtown', muni_campo_elias_id, 'Ejido', false, true),
    ('el-manzano', 'El Manzano', 'El Manzano', muni_campo_elias_id, 'Ejido', false, true),
    ('pozo-hondo', 'Pozo Hondo', 'Pozo Hondo', muni_campo_elias_id, 'Ejido', false, true),
    ('san-buenaventura', 'San Buenaventura', 'San Buenaventura', muni_campo_elias_id, 'Ejido', false, true),
    ('aguas-calientes', 'Aguas Calientes', 'Aguas Calientes', muni_campo_elias_id, 'Ejido', false, true)
  ON CONFLICT (slug) DO UPDATE SET municipality_id = EXCLUDED.municipality_id, name_es = EXCLUDED.name_es, active = EXCLUDED.active;

  -- Seed Santos Marquina Zones
  INSERT INTO zones (slug, name_es, name_en, municipality_id, city, featured, active) VALUES
    ('tabay-centro', 'Tabay Centro', 'Tabay Downtown', muni_santos_marquina_id, 'Tabay', false, true),
    ('mucunutan', 'Mucunután', 'Mucunután', muni_santos_marquina_id, 'Tabay', false, true),
    ('la-mucuy', 'La Mucuy', 'La Mucuy', muni_santos_marquina_id, 'Tabay', false, true)
  ON CONFLICT (slug) DO UPDATE SET municipality_id = EXCLUDED.municipality_id, name_es = EXCLUDED.name_es, active = EXCLUDED.active;

  -- Seed Sucre Zones
  INSERT INTO zones (slug, name_es, name_en, municipality_id, city, featured, active) VALUES
    ('lagunillas-centro', 'Lagunillas Centro', 'Lagunillas Downtown', muni_sucre_id, 'Lagunillas', false, true),
    ('san-juan-lagunillas', 'San Juan de Lagunillas', 'San Juan de Lagunillas', muni_sucre_id, 'Lagunillas', false, true),
    ('chiguara', 'Chiguará', 'Chiguará', muni_sucre_id, 'Chiguará', false, true)
  ON CONFLICT (slug) DO UPDATE SET municipality_id = EXCLUDED.municipality_id, name_es = EXCLUDED.name_es, active = EXCLUDED.active;

  -- Seed Rangel Zones
  INSERT INTO zones (slug, name_es, name_en, municipality_id, city, featured, active) VALUES
    ('mucuchies-centro', 'Mucuchíes Centro', 'Mucuchíes Downtown', muni_rangel_id, 'Mucuchíes', false, true),
    ('san-rafael-mucuchies', 'San Rafael de Mucuchíes', 'San Rafael de Mucuchíes', muni_rangel_id, 'Mucuchíes', false, true),
    ('apartaderos', 'Apartaderos', 'Apartaderos', muni_rangel_id, 'Apartaderos', false, true)
  ON CONFLICT (slug) DO UPDATE SET municipality_id = EXCLUDED.municipality_id, name_es = EXCLUDED.name_es, active = EXCLUDED.active;

  -- Seed Alberto Adriani Zones
  INSERT INTO zones (slug, name_es, name_en, municipality_id, city, featured, active) VALUES
    ('el-vigia-centro', 'El Vigía Centro', 'El Vigía Downtown', muni_alberto_adriani_id, 'El Vigía', true, true),
    ('buenos-aires-vigia', 'Buenos Aires (El Vigía)', 'Buenos Aires (El Vigía)', muni_alberto_adriani_id, 'El Vigía', false, true)
  ON CONFLICT (slug) DO UPDATE SET municipality_id = EXCLUDED.municipality_id, name_es = EXCLUDED.name_es, active = EXCLUDED.active;

  -- Seed Tovar Zones
  INSERT INTO zones (slug, name_es, name_en, municipality_id, city, featured, active) VALUES
    ('tovar-centro', 'Tovar Centro', 'Tovar Downtown', muni_tovar_id, 'Tovar', false, true),
    ('el-llano-tovar', 'El Llano (Tovar)', 'El Llano (Tovar)', muni_tovar_id, 'Tovar', false, true)
  ON CONFLICT (slug) DO UPDATE SET municipality_id = EXCLUDED.municipality_id, name_es = EXCLUDED.name_es, active = EXCLUDED.active;

  -- Seed other single-zone municipalities
  INSERT INTO zones (slug, name_es, name_en, municipality_id, city, featured, active) VALUES
    ('santo-domingo', 'Santo Domingo Centro', 'Santo Domingo Downtown', muni_cardenal_quintero_id, 'Santo Domingo', false, true),
    ('timotes', 'Timotes Centro', 'Timotes Downtown', muni_miranda_id, 'Timotes', false, true),
    ('santa-cruz-de-mora', 'Santa Cruz de Mora', 'Santa Cruz de Mora', muni_antonio_pinto_salinas_id, 'Santa Cruz de Mora', false, true),
    ('bailadores', 'Bailadores Centro', 'Bailadores Downtown', muni_rivas_davila_id, 'Bailadores', false, true),
    ('zea', 'Zea Centro', 'Zea Downtown', muni_zea_id, 'Zea', false, true),
    ('guaraque', 'Guaraque Centro', 'Guaraque Downtown', muni_guaraque_id, 'Guaraque', false, true),
    ('la-azulita', 'La Azulita Centro', 'La Azulita Downtown', muni_andres_bello_id, 'La Azulita', false, true),
    ('tucani', 'Tucaní Centro', 'Tucaní Downtown', muni_caracciolo_parra_olmedo_id, 'Tucaní', false, true),
    ('santa-elena-de-arenales', 'Santa Elena de Arenales', 'Santa Elena de Arenales', muni_obispo_ramos_de_lora_id, 'Santa Elena de Arenales', false, true),
    ('canagua', 'Canagua Centro', 'Canagua Downtown', muni_arzobispo_chacon_id, 'Canagua', false, true),
    ('aricagua', 'Aricagua Centro', 'Aricagua Downtown', muni_aricagua_id, 'Aricagua', false, true),
    ('santa-maria-de-caparo', 'Santa María de Caparo', 'Santa María de Caparo', muni_padre_noguera_id, 'Santa María de Caparo', false, true),
    ('pueblo-llano', 'Pueblo Llano Centro', 'Pueblo Llano Downtown', muni_pueblo_llano_id, 'Pueblo Llano', false, true),
    ('torondoy', 'Torondoy Centro', 'Torondoy Downtown', muni_justo_briceno_id, 'Torondoy', false, true),
    ('arapuey', 'Arapuey Centro', 'Arapuey Downtown', muni_julio_cesar_salas_id, 'Arapuey', false, true),
    ('nueva-bolivia', 'Nueva Bolivia Centro', 'Nueva Bolivia Downtown', muni_tulio_febres_cordero_id, 'Nueva Bolivia', false, true)
  ON CONFLICT (slug) DO UPDATE SET municipality_id = EXCLUDED.municipality_id, name_es = EXCLUDED.name_es, active = EXCLUDED.active;

END $$;
