-- Initial Schema Migration for Knordica Real Estate
-- Project ID: pvcbicsryyqgapibpbba

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ZONAS DE MÉRIDA
CREATE TABLE IF NOT EXISTS zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_es TEXT NOT NULL,
  name_en TEXT,
  description_es TEXT,
  description_en TEXT,
  city TEXT DEFAULT 'Merida',
  state TEXT DEFAULT 'Merida',
  country TEXT DEFAULT 'VE',
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  cover_image_url TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AGENTES
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  bio_es TEXT,
  bio_en TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'agent', -- 'agent' | 'senior' | 'admin'
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PROPIEDADES
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  operation TEXT NOT NULL, -- 'venta' | 'alquiler'
  property_type TEXT NOT NULL, -- 'casa' | 'apartamento' | 'local' | 'terreno' | 'finca' | 'oficina' | 'proyecto'
  status TEXT DEFAULT 'activa', -- 'activa' | 'vendida' | 'alquilada' | 'reservada' | 'inactiva'
  featured BOOLEAN DEFAULT false,
  exclusive BOOLEAN DEFAULT false,
  new_listing BOOLEAN DEFAULT false,
  price_reduced BOOLEAN DEFAULT false,
  
  -- Precio
  price DECIMAL(14,2) NOT NULL,
  price_currency TEXT DEFAULT 'USD',
  price_negotiable BOOLEAN DEFAULT false,
  price_history JSONB DEFAULT '[]', -- [{price, date, note}]
  
  -- Dimensiones
  area_total DECIMAL(10,2),
  area_built DECIMAL(10,2),
  
  -- Habitaciones
  bedrooms INTEGER,
  bathrooms INTEGER,
  half_bathrooms INTEGER,
  parking_spaces INTEGER,
  
  -- Ubicación
  zone_id UUID REFERENCES zones(id),
  address_es TEXT,
  address_en TEXT,
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  
  -- Agente
  agent_id UUID REFERENCES agents(id),
  
  -- SEO
  meta_title_es TEXT,
  meta_title_en TEXT,
  meta_description_es TEXT,
  meta_description_en TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- TRADUCCIONES DE PROPIEDADES
CREATE TABLE IF NOT EXISTS property_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  locale TEXT NOT NULL, -- 'es' | 'en'
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  UNIQUE(property_id, locale)
);

-- IMÁGENES DE PROPIEDADES
CREATE TABLE IF NOT EXISTS property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_es TEXT,
  alt_en TEXT,
  sort_order INTEGER DEFAULT 0,
  is_cover BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CARACTERÍSTICAS / AMENIDADES
CREATE TABLE IF NOT EXISTS property_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'general' | 'amenidades' | 'seguridad' | 'servicios'
  key TEXT NOT NULL,
  value_es TEXT,
  value_en TEXT,
  icon TEXT
);

-- FAVORITOS
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, property_id)
);

-- LEADS
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  agent_id UUID REFERENCES agents(id),
  
  -- Datos del lead
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  
  -- Intent
  intent TEXT, -- 'comprar' | 'alquilar' | 'invertir' | 'vender' | 'info'
  message TEXT,
  source TEXT, -- 'web_form' | 'whatsapp' | 'phone' | 'referral'
  
  -- CRM Pipeline
  status TEXT DEFAULT 'nuevo', -- 'nuevo' | 'contactado' | 'visita' | 'negociacion' | 'cerrado' | 'perdido'
  priority TEXT DEFAULT 'media', -- 'alta' | 'media' | 'baja'
  
  -- Meta
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- NOTAS DE LEADS
CREATE TABLE IF NOT EXISTS lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  author_id UUID REFERENCES agents(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CITAS / VISITAS
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  property_id UUID REFERENCES properties(id),
  agent_id UUID REFERENCES agents(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pendiente', -- 'pendiente' | 'confirmada' | 'completada' | 'cancelada'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- BLOG
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  category TEXT, -- 'mercado' | 'inversion' | 'guias' | 'legal' | 'zonas' | 'noticias'
  author_id UUID REFERENCES agents(id),
  cover_image_url TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- TRADUCCIONES DE BLOG
CREATE TABLE IF NOT EXISTS blog_post_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT, -- MDX/Markdown
  meta_title TEXT,
  meta_description TEXT,
  UNIQUE(post_id, locale)
);

-- TESTIMONIOS
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_title TEXT,
  quote_es TEXT NOT NULL,
  quote_en TEXT,
  rating INTEGER DEFAULT 5,
  property_id UUID REFERENCES properties(id),
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CONFIGURACIÓN DEL SITIO
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) on tables
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ─── Row Level Security Policies ──────────────────────────

-- ZONES: anyone can read
CREATE POLICY "Allow public read on zones" ON zones 
  FOR SELECT USING (true);

-- AGENTS: anyone can read active agents, only admins/agents edit
CREATE POLICY "Allow public read on active agents" ON agents 
  FOR SELECT USING (active = true);

-- PROPERTIES: anyone can read active properties
CREATE POLICY "Allow public read on active properties" ON properties 
  FOR SELECT USING (status = 'activa' OR status = 'reservada' OR status = 'vendida' OR status = 'alquilada');

-- PROPERTY TRANSLATIONS: public read
CREATE POLICY "Allow public read on translations" ON property_translations 
  FOR SELECT USING (true);

-- PROPERTY IMAGES: public read
CREATE POLICY "Allow public read on images" ON property_images 
  FOR SELECT USING (true);

-- PROPERTY FEATURES: public read
CREATE POLICY "Allow public read on features" ON property_features 
  FOR SELECT USING (true);

-- FAVORITES: user must be authenticated and only read/write their own
CREATE POLICY "Allow users to manage their own favorites" ON favorites 
  FOR ALL USING (auth.uid() = user_id);

-- LEADS: public insert, only agents/admins select/update
CREATE POLICY "Allow public lead inserts" ON leads 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow agents and admins to manage leads" ON leads 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.user_id = auth.uid() 
      AND (agents.role = 'agent' OR agents.role = 'senior' OR agents.role = 'admin')
    )
  );

-- LEAD NOTES: only agents/admins can select/insert/update
CREATE POLICY "Allow agents and admins to manage lead notes" ON lead_notes 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.user_id = auth.uid() 
      AND (agents.role = 'agent' OR agents.role = 'senior' OR agents.role = 'admin')
    )
  );

-- APPOINTMENTS: user can read/write their own, agents/admins manage all
CREATE POLICY "Allow users to view their own appointments" ON appointments 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads 
      WHERE leads.id = appointments.lead_id 
      AND leads.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow users to create appointments" ON appointments 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow agents and admins to update appointments" ON appointments 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.user_id = auth.uid()
    )
  );

-- BLOG: anyone can view published posts, only admins/seniors edit
CREATE POLICY "Allow public read on published posts" ON blog_posts 
  FOR SELECT USING (published = true);

CREATE POLICY "Allow admins and seniors to manage blog posts" ON blog_posts 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.user_id = auth.uid() 
      AND (agents.role = 'senior' OR agents.role = 'admin')
    )
  );

-- BLOG TRANSLATIONS: public read
CREATE POLICY "Allow public read on blog translations" ON blog_post_translations 
  FOR SELECT USING (true);

CREATE POLICY "Allow admins and seniors to manage blog translations" ON blog_post_translations 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.user_id = auth.uid() 
      AND (agents.role = 'senior' OR agents.role = 'admin')
    )
  );

-- TESTIMONIALS: public read
CREATE POLICY "Allow public read on active testimonials" ON testimonials 
  FOR SELECT USING (active = true);

-- SITE SETTINGS: public read, only admin write
CREATE POLICY "Allow public read on settings" ON site_settings 
  FOR SELECT USING (true);

CREATE POLICY "Allow admins to manage settings" ON site_settings 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.user_id = auth.uid() 
      AND agents.role = 'admin'
    )
  );
