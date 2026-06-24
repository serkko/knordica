const fs = require('fs');
const path = require('path');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// 1. Load Supabase credentials
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('Error: .env.local not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
  if (match) {
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    envVars[match[1]] = value;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Download helper
function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get image: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// Unsplash URLs for properties (resized to be lightweight)
const imageUrls = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=640&q=70',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=640&q=70',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=640&q=70',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=640&q=70',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=640&q=70',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=640&q=70',
  'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=640&q=70',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=640&q=70',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=640&q=70',
  'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=640&q=70'
];

// Helper to generate UUIDs
function generateUUID(index) {
  return `d184e2be-80d4-48f8-b391-7db1387d8${100 + index}`;
}

// Base seed data arrays
const ZONES = [
  '0a84e2be-80d4-48f8-b391-7db1387d8531', // La Pedregosa
  '0a84e2be-80d4-48f8-b391-7db1387d8532', // La Floresta
  '0a84e2be-80d4-48f8-b391-7db1387d8533', // Las Tapias
  '0a84e2be-80d4-48f8-b391-7db1387d8534', // El Encanto
  '0a84e2be-80d4-48f8-b391-7db1387d8535'  // Belensate
];

const AGENTS = [
  '1f84e2be-80d4-48f8-b391-7db1387d8541', // Carlos Valera
  '1f84e2be-80d4-48f8-b391-7db1387d8542'  // María Fernanda Rodríguez
];

const MUNICIPIOS = ['libertador', 'campo_elias', 'santos_marquina', 'sucre', 'rangel'];
const OP_TYPES = ['venta', 'alquiler', 'vacacional'];
const PROP_TYPES = ['casa', 'apartamento', 'townhouse', 'local', 'oficina', 'terreno'];

const TITLES_ES = [
  'Apartamento de lujo con acabados de primera',
  'Hermosa casa de campo con jardín amplio',
  'Townhouse moderno en conjunto cerrado',
  'Local comercial ideal para tienda o cafetería',
  'Oficina corporativa en zona céntrica',
  'Terreno con excelente potencial de desarrollo',
  'Exclusiva residencia con vista a la cordillera',
  'Apartamento acogedor ideal para parejas',
  'Chalet alpino en las zonas altas',
  'Penthouse minimalista con terraza privada',
  'Casa colonial restaurada en el centro histórico',
  'Apartamento tipo estudio amoblado',
];

const TITLES_EN = [
  'Luxury apartment with top finishes',
  'Beautiful country house with large garden',
  'Modern townhouse in gated community',
  'Commercial space ideal for shop or cafe',
  'Corporate office in central location',
  'Land plot with high development potential',
  'Exclusive residence with mountain range view',
  'Cozy apartment ideal for couples',
  'Alpine chalet in the high heights',
  'Minimalist penthouse with private terrace',
  'Restored colonial house in historical center',
  'Furnished studio apartment',
];

const DESCRIPTIONS_ES = [
  'Esta propiedad cuenta con acabados modernos de alta calidad, iluminación LED integrada, gabinetes empotrados de primera y vistas espectaculares. El conjunto residencial ofrece vigilancia privada las 24 horas.',
  'Ubicada en una de las zonas más frescas y tranquilas de la ciudad, esta casa ofrece amplios jardines ideales para la relajación familiar, techos de madera noble y un clima ideal durante todo el año.',
  'Townhouse de tres niveles completamente amoblado. Cuenta con cocina de concepto abierto, sala espaciosa, terraza posterior con área de parrillera y estacionamiento techado.',
  'Local comercial a pie de calle en zona de alto tráfico peatonal y vehicular. Cuenta con amplias vitrinas, techos altos, baño completo y área de depósito.',
];

const DESCRIPTIONS_EN = [
  'This property features high-quality modern finishes, integrated LED lighting, premium built-in cabinets, and spectacular views. The residential complex offers 24-hour private security.',
  'Located in one of the coolest and quietest areas of the city, this house offers large gardens ideal for family relaxation, hardwood ceilings, and perfect weather all year round.',
  'Fully furnished three-level townhouse. Features open-concept kitchen, spacious living room, back terrace with BBQ area, and covered parking spaces.',
  'Street-level commercial space in a high pedestrian and vehicular traffic area. Features large display windows, high ceilings, full bathroom, and storage room.',
];

async function run() {
  try {
    // 3. Ensure directories exist
    const imagesDir = path.join(__dirname, 'public', 'images', 'properties');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    console.log('Downloading property images to public/images/properties/...');
    for (let i = 0; i < imageUrls.length; i++) {
      const dest = path.join(imagesDir, `p${i + 1}.jpg`);
      if (!fs.existsSync(dest)) {
        await downloadImage(imageUrls[i], dest);
        console.log(`Downloaded image p${i + 1}.jpg`);
      }
    }

    console.log('Generating 32 additional properties...');
    const propertiesToInsert = [];
    const translationsToInsert = [];
    const imagesToInsert = [];

    for (let i = 1; i <= 32; i++) {
      const id = generateUUID(i);
      const zoneId = ZONES[(i - 1) % ZONES.length];
      const agentId = AGENTS[(i - 1) % AGENTS.length];
      const municipio = MUNICIPIOS[(i - 1) % MUNICIPIOS.length];
      
      // Select types & operations with varied distribution
      let operation = 'venta';
      if (i % 3 === 0) operation = 'alquiler';
      else if (i % 7 === 0) operation = 'vacacional';

      let propertyType = 'apartamento';
      if (i % 4 === 0) propertyType = 'casa';
      else if (i % 6 === 0) propertyType = 'townhouse';
      else if (i % 8 === 0) propertyType = 'local';
      else if (i % 10 === 0) propertyType = 'oficina';
      else if (i % 12 === 0) propertyType = 'terreno';

      // Realistic values based on type & operation
      let price = 120000;
      if (operation === 'alquiler') {
        price = propertyType === 'local' ? 900 : propertyType === 'oficina' ? 600 : 450;
        price += (i % 5) * 100;
      } else if (operation === 'vacacional') {
        price = 80 + (i % 5) * 30;
      } else {
        price = propertyType === 'casa' ? 220000 : propertyType === 'townhouse' ? 165000 : propertyType === 'terreno' ? 45000 : 95000;
        price += (i % 8) * 20000;
      }

      const bedrooms = propertyType === 'local' || propertyType === 'terreno' || propertyType === 'oficina' ? 0 : 2 + (i % 3);
      const bathrooms = propertyType === 'local' || propertyType === 'oficina' ? 1 : propertyType === 'terreno' ? 0 : 2 + (i % 2);
      const parking = propertyType === 'terreno' ? 0 : 1 + (i % 3);
      
      const areaTotal = propertyType === 'terreno' ? 600 + i * 20 : 120 + i * 15;
      const areaBuilt = propertyType === 'terreno' ? 0 : 100 + i * 10;

      // Coordinate offset centering around Mérida city center
      const lat = 8.585 + (i * 0.0017) % 0.04;
      const lng = -71.168 + (i * 0.0021) % 0.07;

      const slug = `${propertyType}-${operation}-${municipio}-${i}-${Date.now().toString(36).substring(4)}`;
      
      // Selected titles and descriptions
      const titleIndex = i % TITLES_ES.length;
      const descIndex = i % DESCRIPTIONS_ES.length;

      const titleEs = `${TITLES_ES[titleIndex]} #${i}`;
      const titleEn = `${TITLES_EN[titleIndex]} #${i}`;

      const descEs = DESCRIPTIONS_ES[descIndex];
      const descEn = DESCRIPTIONS_EN[descIndex];

      propertiesToInsert.push({
        id,
        slug,
        operation,
        property_type: propertyType,
        status: 'activa',
        featured: i % 5 === 0,
        exclusive: i % 6 === 0,
        new_listing: i % 4 === 0,
        price_reduced: false,
        price,
        price_currency: 'USD',
        price_negotiable: i % 2 === 0,
        area_total: areaTotal,
        area_built: areaBuilt,
        bedrooms,
        bathrooms,
        parking_spaces: parking,
        zone_id: zoneId,
        agent_id: agentId,
        lat,
        lng,
        published_at: new Date().toISOString(),
        municipio
      });

      // Translations
      translationsToInsert.push({
        property_id: id,
        locale: 'es',
        title: titleEs,
        description: descEs,
        short_description: titleEs
      });

      translationsToInsert.push({
        property_id: id,
        locale: 'en',
        title: titleEn,
        description: descEn,
        short_description: titleEn
      });

      // Images (2 images per property)
      const img1Index = (i % imageUrls.length) + 1;
      const img2Index = ((i + 1) % imageUrls.length) + 1;

      imagesToInsert.push({
        id: `e184e2be-80d4-48f8-b391-7db1387d8${200 + i * 2}`,
        property_id: id,
        url: `/images/properties/p${img1Index}.jpg`,
        alt_es: `Imagen principal de la propiedad ${i}`,
        alt_en: `Main image of property ${i}`,
        sort_order: 0,
        is_cover: true
      });

      imagesToInsert.push({
        id: `e184e2be-80d4-48f8-b391-7db1387d8${200 + i * 2 + 1}`,
        property_id: id,
        url: `/images/properties/p${img2Index}.jpg`,
        alt_es: `Imagen secundaria de la propiedad ${i}`,
        alt_en: `Secondary image of property ${i}`,
        sort_order: 1,
        is_cover: false
      });
    }

    console.log('Inserting properties in database...');
    const { error: propErr } = await supabase.from('properties').insert(propertiesToInsert);
    if (propErr) throw propErr;
    console.log('Inserted properties successfully!');

    console.log('Inserting translations...');
    const { error: transErr } = await supabase.from('property_translations').insert(translationsToInsert);
    if (transErr) throw transErr;
    console.log('Inserted translations successfully!');

    console.log('Inserting property images...');
    const { error: imgErr } = await supabase.from('property_images').insert(imagesToInsert);
    if (imgErr) throw imgErr;
    console.log('Inserted property images successfully!');

    console.log('SUCCESS! Seeded 32 properties, total properties should now be 40.');

  } catch (err) {
    console.error('Error during seeding:', err.message);
  }
}

run();
