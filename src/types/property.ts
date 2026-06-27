// TypeScript types for Knordica data models
// Aligned with the Supabase schema defined in the implementation plan

export type PropertyOperation = "venta" | "alquiler" | "vacacional";

export type PropertyType =
  | "casa"
  | "apartamento"
  | "townhouse"
  | "anexo"
  | "edificio"
  | "galpon"
  | "habitacion"
  | "hacienda_finca"
  | "local"
  | "oficina"
  | "terreno_lote";

export type PropertyStatus =
  | "activa"
  | "vendida"
  | "alquilada"
  | "reservada"
  | "cerrada";

export type PropertyCondition =
  | "nuevo"          // Nuevo / A estrenar
  | "excelente"      // Excelente
  | "buen_estado"    // Buen estado
  | "por_remodelar"  // Por remodelar
  | "en_gris";       // En obra gris

export type FurnishedStatus =
  | "sin_muebles"
  | "semi_amoblado"
  | "amoblado";

export type GasType = "central" | "bombona" | "no_tiene";

export type KitchenType =
  | "gas"       // A gas
  | "electrica" // Eléctrica
  | "induccion" // Inducción
  | "mixta"     // Mixta
  | "no_tiene"; // No tiene

export type ListingBadge = "basico" | "completo" | "premium";

export type FeatureCategory =
  | "servicios_basicos"
  | "seguridad"
  | "amenidades"
  | "equipamiento"
  | "habitacion"
  | "vacacional"
  | "general";

export type Municipio =
  | "libertador"
  | "campo_elias"
  | "santos_marquina"
  | "sucre"
  | "rangel";

export interface Zone {
  id: string;
  slug: string;
  name_es: string;
  name_en: string;
  description_es: string | null;
  description_en: string | null;
  city: string;
  lat: number | null;
  lng: number | null;
  cover_image_url: string | null;
  featured: boolean;
}

export interface Agent {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  bio_es: string | null;
  bio_en: string | null;
  avatar_url: string | null;
  role: "agent" | "admin";
  active: boolean;
}

export interface PropertyImage {
  id: string;
  property_id?: string;
  url: string;
  alt_es: string | null;
  alt_en: string | null;
  sort_order?: number;
  order_index?: number;
  is_cover: boolean;
}

export interface PropertyFeature {
  id: string;
  property_id?: string;
  category?: FeatureCategory;
  key: string;
  value_es: string;
  value_en: string;
  icon: string | null;
  group?: string | null;            // "legal", "servicios", "extras"
}

export interface PropertyVideo {
  id: string;
  property_id?: string;
  url: string;
  platform: 'youtube' | 'vimeo' | 'direct';
  title_es: string | null;
  title_en: string | null;
  thumbnail_url?: string | null;
  sort_order?: number;
  created_at?: string;
}

export interface PropertyTranslation {
  id?: string;
  property_id?: string;
  locale: string;
  title: string;
  description: string | null;
  short_description: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
}

export interface PriceHistoryEntry {
  price: number;
  date: string;
  note?: string;
}

export interface Property {
  // Identidad
  id: string;
  slug: string;
  status: PropertyStatus;
  operation: 'venta' | 'alquiler' | 'vacacional';
  property_type: PropertyType;

  // Badges de identidad
  featured: boolean;
  exclusive: boolean;
  new_listing: boolean;
  price_reduced: boolean;
  price_negotiable: boolean;
  listing_badge: string | null;   // texto libre premium: "OPORTUNIDAD", "ÚLTIMA UNIDAD", etc.
  completeness_score: number;     // 0–100

  // Precio
  price: number;
  price_currency: string;
  price_per_m2?: number | null;
  maintenance_fee?: number | null;
  maintenance_fee_currency?: string | null;

  // Dimensiones
  area_built: number | null;       // m²
  area_total: number | null;       // m² terreno total
  area_hectares: number | null;    // para fincas
  floors: number | null;           // pisos totales del inmueble
  floor_number: number | null;     // piso en que está (apartamentos)

  // Habitáculos
  bedrooms: number | null;
  bathrooms: number | null;
  half_bathrooms: number | null;
  parking_spaces: number | null;
  service_rooms?: number | null;
  storage_rooms?: number | null;

  // Año y estado de construcción
  year_built: number | null;
  construction_status?: 'terminado' | 'en_planos' | 'en_construccion' | 'entrega_inmediata' | null;

  // Amenidades booleanas (las 20)
  has_pool: boolean;
  has_garden: boolean;
  has_ac: boolean;
  has_generator: boolean;
  has_water_tank: boolean;
  has_security: boolean;
  has_elevator: boolean;
  allows_pets: boolean;
  furnished: boolean;
  has_gym?: boolean;
  has_jacuzzi?: boolean;
  has_bbq?: boolean;
  has_laundry?: boolean;
  has_study?: boolean;
  has_cinema?: boolean;
  has_wine_cellar?: boolean;
  has_sauna?: boolean;
  has_terrace?: boolean;
  has_balcony?: boolean;
  has_solar_panels?: boolean;

  // Ubicación
  address_es: string | null;
  address_en: string | null;
  municipio: string | null;
  lat: number | null;
  lng: number | null;
  zone?: Zone | null;

  // Media
  images: PropertyImage[];
  videos: PropertyVideo[];
  virtual_tour_url?: string | null;
  video_url?: string | null;        // YouTube/Vimeo embed

  // Agente
  agent_id: string | null;
  agent: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    avatar_url: string | null;
    title?: string | null;           // "Asesor Senior", "Directora Comercial", etc.
    bio_es: string | null;
    bio_en: string | null;
    languages?: string[] | null;     // ["Español", "Inglés"]
  } | null;

  // Contenido
  translations: PropertyTranslation[];
  features: PropertyFeature[];     // pares key/value adicionales

  // SEO / metadata
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface PropertyCard {
  id: string;
  slug: string;
  operation: PropertyOperation;
  property_type: PropertyType;
  status: PropertyStatus;
  featured: boolean;
  exclusive: boolean;
  new_listing: boolean;
  price_reduced: boolean;
  price: number;
  price_currency: string;
  area_total: number | null;
  area_built: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking_spaces: number | null;
  zone?: Zone | null;
  cover_image?: PropertyImage | null;
  lat?: number | null;
  lng?: number | null;
  title: string;
  short_description: string | null;

  // New schema_v2 optional fields
  listing_badge?: string | null;
  has_generator?: boolean;
  has_water_tank?: boolean;
  has_ac?: boolean;
  furnished?: boolean;
  municipio?: string | null;

  // --- NUEVOS a añadir ---
  price_per_m2?: number | null;
  price_negotiable?: boolean;
  half_bathrooms?: number | null;
  year_built?: number | null;
  construction_status?: 'terminado' | 'en_planos' | 'en_construccion' | 'entrega_inmediata' | null;
  has_pool?: boolean;
  has_security?: boolean;
  has_elevator?: boolean;
  allows_pets?: boolean;
  has_balcony?: boolean;
  has_terrace?: boolean;
}

export interface PropertyFilters {
  operacion?: PropertyOperation[];
  tipo?: PropertyType[];
  zona?: string[];
  precio_min?: number;
  precio_max?: number;
  habitaciones?: number[];
  banos?: number[];
  sort?: "recientes" | "precio_asc" | "precio_desc" | "area_desc";
  page?: number;
  per_page?: number;
  destacadas?: boolean;
  nuevas?: boolean;

  municipio?: string;
  furnished?: boolean;
  has_ac?: boolean;
  has_generator?: boolean;
  has_pool?: boolean;
  allows_pets?: boolean;
  area_min?: number;
  area_max?: number;
  min_area?: number;
  max_area?: number;
  has_security?: boolean;
  has_elevator?: boolean;

  // Extended amenity filters
  has_water_tank?: boolean;
  has_gym?: boolean;
  has_bbq?: boolean;
  has_solar_panels?: boolean;
  has_internet?: boolean;
  has_terrace?: boolean;
  has_balcony?: boolean;
  has_garden?: boolean;
  has_laundry?: boolean;
  has_study?: boolean;
  has_jacuzzi?: boolean;
  parking_covered?: boolean;
  has_independent_entrance?: boolean;
}

