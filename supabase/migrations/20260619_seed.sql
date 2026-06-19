-- Seed Data for Knordica Real Estate Database
-- Project ID: pvcbicsryyqgapibpbba

-- ─── ZONAS (ZONES) ──────────────────────────────────────────
INSERT INTO zones (id, slug, name_es, name_en, description_es, description_en, city, lat, lng, cover_image_url, featured)
VALUES
  (
    '0a84e2be-80d4-48f8-b391-7db1387d8531',
    'la-pedregosa',
    'La Pedregosa',
    'La Pedregosa',
    'Una de las zonas residenciales más exclusivas de Mérida, con vistas privilegiadas a la ciudad y cercanía al campus universitario.',
    'One of Mérida''s most exclusive residential areas, with privileged city views and proximity to the university campus.',
    'Mérida',
    8.596,
    -71.140,
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    true
  ),
  (
    '0a84e2be-80d4-48f8-b391-7db1387d8532',
    'la-floresta',
    'La Floresta',
    'La Floresta',
    'Tranquilo sector residencial con amplias avenidas arborizadas y una comunidad consolidada de familias.',
    'A tranquil residential area with wide tree-lined avenues and an established family community.',
    'Mérida',
    8.605,
    -71.152,
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    true
  ),
  (
    '0a84e2be-80d4-48f8-b391-7db1387d8533',
    'las-tapias',
    'Las Tapias',
    'Las Tapias',
    'Zona en crecimiento con inversión activa. Preferida por jóvenes profesionales e inversores que buscan oportunidades de plusvalía.',
    'A growing area with active investment. Preferred by young professionals and investors seeking appreciation opportunities.',
    'Mérida',
    8.612,
    -71.160,
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80',
    false
  ),
  (
    '0a84e2be-80d4-48f8-b391-7db1387d8534',
    'el-encanto',
    'El Encanto',
    'El Encanto',
    'Prestigiosa zona residencial de las alturas de Mérida, con clima fresco y vistas panorámicas excepcionales.',
    'A prestigious residential area in Mérida''s heights, with cool weather and exceptional panoramic views.',
    'Mérida',
    8.580,
    -71.125,
    'https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1200&q=80',
    true
  ),
  (
    '0a84e2be-80d4-48f8-b391-7db1387d8535',
    'belensate',
    'Belensate',
    'Belensate',
    'Sector tradicional y bien comunicado, con oferta variada de casas y apartamentos a precios accesibles.',
    'A traditional, well-connected area with a varied range of houses and apartments at accessible prices.',
    'Mérida',
    8.618,
    -71.144,
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    false
  )
ON CONFLICT (id) DO UPDATE SET
  name_es = EXCLUDED.name_es,
  name_en = EXCLUDED.name_en,
  description_es = EXCLUDED.description_es,
  description_en = EXCLUDED.description_en,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  cover_image_url = EXCLUDED.cover_image_url,
  featured = EXCLUDED.featured;

-- ─── AGENTES (AGENTS) ────────────────────────────────────────
INSERT INTO agents (id, full_name, email, phone, whatsapp, bio_es, bio_en, avatar_url, role, active)
VALUES
  (
    '1f84e2be-80d4-48f8-b391-7db1387d8541',
    'Carlos Valera',
    'carlos@knordica.com',
    '+58 412 242 3334',
    '5804122423334',
    'Especialista en propiedades residenciales premium. 10 años en el mercado inmobiliario de Mérida.',
    'Residential premium property specialist. 10 years in Mérida''s real estate market.',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80',
    'senior',
    true
  ),
  (
    '1f84e2be-80d4-48f8-b391-7db1387d8542',
    'María Fernanda Rodríguez',
    'mariafe@knordica.com',
    '+58 424 111 2222',
    '5804241112222',
    'Especializada en inversión y propiedades comerciales. MBA con enfoque en mercados emergentes.',
    'Specialized in investment and commercial properties. MBA with a focus on emerging markets.',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
    'agent',
    true
  )
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  whatsapp = EXCLUDED.whatsapp,
  bio_es = EXCLUDED.bio_es,
  bio_en = EXCLUDED.bio_en,
  avatar_url = EXCLUDED.avatar_url,
  role = EXCLUDED.role,
  active = EXCLUDED.active;

-- ─── PROPIEDADES (PROPERTIES) ────────────────────────────────
INSERT INTO properties (
  id, slug, operation, property_type, status, featured, exclusive, new_listing, price_reduced,
  price, price_currency, price_negotiable, area_total, area_built, bedrooms, bathrooms, parking_spaces,
  zone_id, agent_id, lat, lng, published_at
) VALUES
  (
    'd184e2be-80d4-48f8-b391-7db1387d8551',
    'casa-moderna-la-pedregosa-4hab',
    'venta',
    'casa',
    'activa',
    true,
    true,
    false,
    false,
    280000.00,
    'USD',
    true,
    520.00,
    380.00,
    4,
    4,
    3,
    '0a84e2be-80d4-48f8-b391-7db1387d8531', -- La Pedregosa
    '1f84e2be-80d4-48f8-b391-7db1387d8541', -- Carlos Valera
    8.598,
    -71.142,
    now()
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8552',
    'apartamento-la-floresta-3hab',
    'venta',
    'apartamento',
    'activa',
    true,
    false,
    true,
    false,
    145000.00,
    'USD',
    false,
    110.00,
    110.00,
    3,
    2,
    2,
    '0a84e2be-80d4-48f8-b391-7db1387d8532', -- La Floresta
    '1f84e2be-80d4-48f8-b391-7db1387d8542', -- María Fernanda
    8.607,
    -71.150,
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  operation = EXCLUDED.operation,
  property_type = EXCLUDED.property_type,
  status = EXCLUDED.status,
  price = EXCLUDED.price;

-- ─── TRADUCCIONES DE PROPIEDADES ────────────────────────────
INSERT INTO property_translations (property_id, locale, title, description, short_description)
VALUES
  (
    'd184e2be-80d4-48f8-b391-7db1387d8551',
    'es',
    'Casa moderna en La Pedregosa con vistas a la ciudad',
    'Residencia contemporánea de 4 habitaciones en suite. Acabados de primer nivel, jardín privado y vistas panorámicas privilegiadas sobre la cordillera y la ciudad de Mérida.',
    'Residencia contemporánea de 4 habitaciones en suite. Acabados de primer nivel, jardín privado y vistas panorámicas privilegiadas.'
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8551',
    'en',
    'Modern house in La Pedregosa with city views',
    'Contemporary residence featuring 4 en-suite bedrooms. Top-tier finishes, private landscaped garden, and exceptional panoramic views over the Andes range and Mérida city.',
    'Contemporary residence featuring 4 en-suite bedrooms. Top-tier finishes, private landscaped garden, and exceptional panoramic views.'
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8552',
    'es',
    'Apartamento moderno en La Floresta',
    'Excelente apartamento en zona residencial tranquila. Espacios iluminados de concepto abierto, balcón panorámico y seguridad privada las 24 horas del día.',
    'Excelente apartamento en zona residencial tranquila. Espacios iluminados de concepto abierto y balcón.'
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8552',
    'en',
    'Modern apartment in La Floresta',
    'Excellent apartment in a peaceful residential sector. Bright open concept living spaces, panoramic balcony, and 24-hour private security.',
    'Excellent apartment in a peaceful residential sector. Bright open concept living spaces and balcony.'
  )
ON CONFLICT (property_id, locale) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description;

-- ─── IMÁGENES DE PROPIEDADES ────────────────────────────────
INSERT INTO property_images (id, property_id, url, alt_es, alt_en, sort_order, is_cover)
VALUES
  (
    'e184e2be-80d4-48f8-b391-7db1387d8561',
    'd184e2be-80d4-48f8-b391-7db1387d8551',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'Fachada principal de la casa',
    'Main facade of the house',
    0,
    true
  ),
  (
    'e184e2be-80d4-48f8-b391-7db1387d8562',
    'd184e2be-80d4-48f8-b391-7db1387d8551',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    'Cocina de diseño contemporáneo',
    'Contemporary design kitchen',
    1,
    false
  ),
  (
    'e184e2be-80d4-48f8-b391-7db1387d8563',
    'd184e2be-80d4-48f8-b391-7db1387d8552',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    'Fachada de edificio La Floresta',
    'La Floresta building facade',
    0,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  is_cover = EXCLUDED.is_cover;
