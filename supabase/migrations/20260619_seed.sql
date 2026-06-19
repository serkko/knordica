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
    210.00,
    185.00,
    3,
    2,
    2,
    '0a84e2be-80d4-48f8-b391-7db1387d8532', -- La Floresta
    '1f84e2be-80d4-48f8-b391-7db1387d8542', -- María Fernanda
    8.607,
    -71.150,
    now()
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8553',
    'casa-campo-el-encanto-5hab',
    'venta',
    'casa',
    'activa',
    true,
    true,
    false,
    false,
    420000.00,
    'USD',
    true,
    1200.00,
    680.00,
    5,
    6,
    4,
    '0a84e2be-80d4-48f8-b391-7db1387d8534', -- El Encanto
    '1f84e2be-80d4-48f8-b391-7db1387d8541', -- Carlos Valera
    8.582,
    -71.127,
    now()
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8554',
    'apartamento-ejecutivo-la-pedregosa',
    'alquiler',
    'apartamento',
    'activa',
    false,
    false,
    true,
    false,
    1200.00,
    'USD',
    false,
    145.00,
    130.00,
    2,
    2,
    1,
    '0a84e2be-80d4-48f8-b391-7db1387d8531', -- La Pedregosa
    '1f84e2be-80d4-48f8-b391-7db1387d8542', -- María Fernanda
    8.594,
    -71.138,
    now()
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8555',
    'local-comercial-belensate-180m2',
    'venta',
    'local',
    'activa',
    false,
    false,
    false,
    true,
    95000.00,
    'USD',
    true,
    180.00,
    180.00,
    0,
    2,
    2,
    '0a84e2be-80d4-48f8-b391-7db1387d8535', -- Belensate
    '1f84e2be-80d4-48f8-b391-7db1387d8542', -- María Fernanda
    8.619,
    -71.146,
    now()
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8556',
    'terreno-urbanizado-las-tapias',
    'venta',
    'terreno',
    'activa',
    false,
    false,
    false,
    false,
    72000.00,
    'USD',
    false,
    800.00,
    0.00,
    0,
    0,
    0,
    '0a84e2be-80d4-48f8-b391-7db1387d8533', -- Las Tapias
    '1f84e2be-80d4-48f8-b391-7db1387d8541', -- Carlos Valera
    8.614,
    -71.162,
    now()
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8557',
    'casa-la-floresta-3hab-alquiler',
    'alquiler',
    'casa',
    'activa',
    false,
    false,
    false,
    false,
    900.00,
    'USD',
    true,
    280.00,
    240.00,
    3,
    3,
    2,
    '0a84e2be-80d4-48f8-b391-7db1387d8532', -- La Floresta
    '1f84e2be-80d4-48f8-b391-7db1387d8542', -- María Fernanda
    8.603,
    -71.154,
    now()
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8558',
    'penthouse-la-pedregosa',
    'venta',
    'apartamento',
    'activa',
    true,
    true,
    true,
    false,
    340000.00,
    'USD',
    true,
    320.00,
    280.00,
    4,
    3,
    3,
    '0a84e2be-80d4-48f8-b391-7db1387d8531', -- La Pedregosa
    '1f84e2be-80d4-48f8-b391-7db1387d8541', -- Carlos Valera
    8.597,
    -71.135,
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  operation = EXCLUDED.operation,
  property_type = EXCLUDED.property_type,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  area_total = EXCLUDED.area_total,
  area_built = EXCLUDED.area_built,
  bedrooms = EXCLUDED.bedrooms,
  bathrooms = EXCLUDED.bathrooms,
  parking_spaces = EXCLUDED.parking_spaces,
  zone_id = EXCLUDED.zone_id,
  agent_id = EXCLUDED.agent_id,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng;

-- ─── TRADUCCIONES DE PROPIEDADES ────────────────────────────
INSERT INTO property_translations (property_id, locale, title, description, short_description)
VALUES
  (
    'd184e2be-80d4-48f8-b391-7db1387d8551', 'es',
    'Casa moderna en La Pedregosa con vistas a la ciudad',
    'Residencia contemporánea de 4 habitaciones en suite. Acabados de primer nivel, jardín privado y vistas panorámicas privilegiadas sobre la cordillera y la ciudad de Mérida.',
    'Residencia contemporánea de 4 habitaciones en suite. Acabados de primer nivel, jardín privado y vistas panorámicas privilegiadas.'
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8551', 'en',
    'Modern house in La Pedregosa with city views',
    'Contemporary residence featuring 4 en-suite bedrooms. Top-tier finishes, private landscaped garden, and exceptional panoramic views over the Andes range and Mérida city.',
    'Contemporary residence featuring 4 en-suite bedrooms. Top-tier finishes, private landscaped garden, and exceptional panoramic views.'
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8552', 'es',
    'Apartamento de 3 habitaciones en La Floresta',
    'Excelente apartamento en zona residencial tranquila. Espacios iluminados de concepto abierto, balcón panorámico y seguridad privada las 24 horas del día.',
    'Piso 8, zona tranquila y residencial. Balcón con vista a las montañas. Conjunto cerrado con seguridad.'
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8552', 'en',
    '3 bedroom apartment in La Floresta',
    'Excellent apartment in a peaceful residential sector. Bright open concept living spaces, panoramic balcony, and 24-hour private security.',
    '8th floor, quiet residential area. Balcony with mountain view. Gated community with security.'
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8553', 'es',
    'Casa de campo en El Encanto con piscina y terreno',
    'Propiedad de lujo a 1.800 msnm. Clima fresco, piscina climatizada, jardines formales y guest house independiente.',
    'Propiedad de lujo a 1.800 msnm. Clima fresco, piscina climatizada, jardines formales y guest house independiente.'
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8553', 'en',
    'Country house in El Encanto with pool and land',
    'Luxury property at 1,800 meters above sea level. Cool weather, heated pool, formal gardens, and independent guest house.',
    'Luxury property at 1,800 meters above sea level. Cool weather, heated pool, formal gardens, and independent guest house.'
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8554', 'es',
    'Apartamento ejecutivo en La Pedregosa',
    'Ideal para ejecutivos y profesionales. Amoblado de alto nivel. Acceso a gimnasio y área social.',
    'Ideal para ejecutivos y profesionales. Amoblado de alto nivel. Acceso a gimnasio y área social.'
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8554', 'en',
    'Executive apartment in La Pedregosa',
    'Ideal for executives and professionals. High-level furnishings. Access to gym and social area.',
    'Ideal for executives and professionals. High-level furnishings. Access to gym and social area.'
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8555', 'es',
    'Local comercial en Belensate — Alta visibilidad',
    'Local en esquina con frente doble. Techo alto, 4 baños, depósito independiente. Excelente para clínica, galería o tienda.',
    'Local en esquina con frente doble. Techo alto, 4 baños, depósito independiente.'
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8555', 'en',
    'Commercial local in Belensate — High visibility',
    'Corner commercial property with double storefront. High ceiling, 4 bathrooms, independent storage room.',
    'Corner commercial property with double storefront. High ceiling, 4 bathrooms.'
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8556', 'es',
    'Terreno urbanizado en Las Tapias',
    'Lote de 800m² con todos los servicios. Topografía plana. Zona de alto crecimiento. Ideal para desarrollo de 6-8 unidades.',
    'Lote de 800m² con todos los servicios. Topografía plana. Zona de alto crecimiento.'
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8556', 'en',
    'Urbanized land in Las Tapias',
    '800sqm lot with all utilities. Flat topography. High-growth area. Ideal for development of 6-8 units.',
    '800sqm lot with all utilities. Flat topography. High-growth area.'
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8557', 'es',
    'Casa en La Floresta para alquilar',
    'Casa familiar en urbanización cerrada con vigilancia 24h. Jardín privado, cuarto de servicio y zona de lavandería.',
    'Casa familiar en urbanización cerrada con vigilancia 24h. Jardín privado y zona de lavandería.'
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8557', 'en',
    'House in La Floresta for rent',
    'Family home in gated community with 24h security. Private garden, maid quarters, and laundry area.',
    'Family home in gated community with 24h security. Private garden and laundry area.'
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8558', 'es',
    'Penthouse de 320m² en La Pedregosa — Último piso',
    'Terraza privada de 180m² con vista 360° de Mérida. Acabados de lujo importados. Única unidad disponible.',
    'Terraza privada de 180m² con vista 360° de Mérida. Acabados de lujo importados.'
  ),
  (
    'd184e2be-80d4-48f8-b391-7db1387d8558', 'en',
    '320sqm Penthouse in La Pedregosa — Top floor',
    'Private terrace of 180sqm with a 360° view of Mérida. Imported luxury finishes. Only unit available.',
    'Private terrace of 180sqm with a 360° view of Mérida. Imported luxury finishes.'
  )
ON CONFLICT (property_id, locale) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description;

-- ─── IMÁGENES DE PROPIEDADES ────────────────────────────────
INSERT INTO property_images (id, property_id, url, alt_es, alt_en, sort_order, is_cover)
VALUES
  ('e184e2be-80d4-48f8-b391-7db1387d8561', 'd184e2be-80d4-48f8-b391-7db1387d8551', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 'Fachada principal de la casa', 'Main facade of the house', 0, true),
  ('e184e2be-80d4-48f8-b391-7db1387d8562', 'd184e2be-80d4-48f8-b391-7db1387d8551', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', 'Cocina de diseño contemporáneo', 'Contemporary design kitchen', 1, false),
  ('e184e2be-80d4-48f8-b391-7db1387d8563', 'd184e2be-80d4-48f8-b391-7db1387d8552', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', 'Sala de estar moderna', 'Modern living room', 0, true),
  ('e184e2be-80d4-48f8-b391-7db1387d8564', 'd184e2be-80d4-48f8-b391-7db1387d8552', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', 'Dormitorio principal', 'Master bedroom', 1, false),
  ('e184e2be-80d4-48f8-b391-7db1387d8565', 'd184e2be-80d4-48f8-b391-7db1387d8553', 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80', 'Fachada casa de campo', 'Country house facade', 0, true),
  ('e184e2be-80d4-48f8-b391-7db1387d8566', 'd184e2be-80d4-48f8-b391-7db1387d8553', 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1200&q=80', 'Interior con chimenea', 'Interior with fireplace', 1, false),
  ('e184e2be-80d4-48f8-b391-7db1387d8567', 'd184e2be-80d4-48f8-b391-7db1387d8554', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80', 'Interior apartamento', 'Apartment interior', 0, true),
  ('e184e2be-80d4-48f8-b391-7db1387d8568', 'd184e2be-80d4-48f8-b391-7db1387d8555', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80', 'Local comercial Belensate', 'Belensate commercial local', 0, true),
  ('e184e2be-80d4-48f8-b391-7db1387d8569', 'd184e2be-80d4-48f8-b391-7db1387d8556', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', 'Terreno Las Tapias', 'Las Tapias land', 0, true),
  ('e184e2be-80d4-48f8-b391-7db1387d8570', 'd184e2be-80d4-48f8-b391-7db1387d8557', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80', 'Casa La Floresta fachada', 'La Floresta house facade', 0, true),
  ('e184e2be-80d4-48f8-b391-7db1387d8571', 'd184e2be-80d4-48f8-b391-7db1387d8558', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', 'Penthouse terraza', 'Penthouse terrace', 0, true)
ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  is_cover = EXCLUDED.is_cover;
