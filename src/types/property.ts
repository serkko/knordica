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
  | "terreno_lote"
  // Deprecated/compatibility types to avoid breaking existing pages/components
  | "terreno"
  | "finca"
  | "proyecto";

export type PropertyStatus =
  | "activa"
  | "vendida"
  | "alquilada"
  | "reservada"
  | "cerrada";

export type PropertyCondition =
  | "nuevo"
  | "remodelado"
  | "buen_estado"
  | "a_remodelar";

export type FurnishedStatus =
  | "sin_muebles"
  | "parcial"
  | "completo";

export type GasType = "central" | "bombonas" | "ninguno";

export type KitchenType = "electrica" | "gas" | "ninguna";

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
  role: "agent" | "senior" | "admin";
  active: boolean;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  alt_es: string | null;
  alt_en: string | null;
  sort_order: number;
  is_cover: boolean;
}

export interface PropertyFeature {
  id: string;
  property_id: string;
  category: FeatureCategory;
  key: string;
  value_es: string | null;
  value_en: string | null;
  icon: string | null;
}

export interface PropertyVideo {
  id: string;
  property_id: string;
  url: string;
  title_es?: string | null;
  title_en?: string | null;
  sort_order: number;
  created_at: string;
}

export interface PropertyTranslation {
  id: string;
  property_id: string;
  locale: "es" | "en";
  title: string;
  description: string | null;
  short_description: string | null;
}

export interface PriceHistoryEntry {
  price: number;
  date: string;
  note?: string;
}

export interface Property {
  // --- Identidad ---
  id: string;
  slug: string;
  operation: PropertyOperation;
  property_type: PropertyType;
  status: PropertyStatus;
  featured: boolean;
  exclusive: boolean;
  new_listing: boolean;
  price_reduced: boolean;

  // --- Precio ---
  price: number;
  price_currency: string;
  price_usd?: number | null;
  price_negotiable: boolean;
  price_history: PriceHistoryEntry[];

  // --- Dimensiones ---
  area_total?: number | null;
  area_built?: number | null;
  area_hectares?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  half_bathrooms?: number | null;
  parking_spaces?: number | null;
  parking_covered: boolean;

  // --- Ubicación ---
  zone_id?: string | null;
  municipio?: Municipio | null;
  address_es?: string | null;
  address_en?: string | null;
  lat?: number | null;
  lng?: number | null;
  show_exact_location: boolean;

  // --- Relaciones ---
  agent_id?: string | null;
  zone?: Zone | null;
  agent?: Agent | null;
  images?: PropertyImage[];
  features?: PropertyFeature[];
  translations?: PropertyTranslation[];
  videos?: PropertyVideo[];

  // --- Media ---
  video_url?: string | null;

  // --- Estructura y confort ---
  floor_number?: number | null;
  total_floors?: number | null;
  has_elevator: boolean;
  property_age?: number | null;
  condition?: PropertyCondition | null;
  furnished: FurnishedStatus;
  kitchen_type?: KitchenType | null;

  // --- Servicios básicos ---
  has_water_tank: boolean;
  has_hot_water: boolean;
  has_generator: boolean;
  gas_type?: GasType | null;
  has_internet: boolean;

  // --- Seguridad ---
  has_security_24h: boolean;
  has_electric_gate: boolean;
  has_cctv: boolean;
  has_electric_fence: boolean;
  has_intercom: boolean;
  has_armored_door: boolean;

  // --- Climatización ---
  has_ac: boolean;
  has_heating: boolean;

  // --- Inventario y amenidades ---
  furniture_inventory: string[];
  amenities: string[];

  // --- Específico: Habitación y Anexo ---
  bathroom_type?: "privado" | "compartido" | null;
  host_housing_type?: "casa" | "apartamento" | "anexo_independiente" | null;
  cohabitation?: "solo" | "con_personas" | null;
  occupants_count?: number | null;
  gender_policy?: "cualquiera" | "mujeres" | "hombres" | null;
  deposit_required: boolean;
  deposit_amount?: number | null;
  services_included: string[];
  allows_pets: boolean;
  allows_cooking: boolean;
  has_independent_entrance: boolean;

  // --- Específico: Terreno y Finca ---
  topography?: "plano" | "inclinado" | "mixto" | null;
  land_use?: "residencial" | "comercial" | "agricola" | "mixto" | null;
  zone_services: string[];
  has_own_water: boolean;
  access_type?: "pavimentado" | "camino_tierra" | "mixto" | null;
  current_use?: string | null;

  // --- Específico: Vacacional ---
  price_per_night?: number | null;
  price_weekend?: number | null;
  min_nights: number;
  max_guests?: number | null;
  checkin_time: string;
  checkout_time: string;
  house_rules?: string | null;
  includes_breakfast: boolean;

  // --- SEO ---
  meta_title_es?: string | null;
  meta_title_en?: string | null;
  meta_description_es?: string | null;
  meta_description_en?: string | null;

  // --- Gamificación ---
  completeness_score: number;
  listing_badge: ListingBadge;

  // --- Timestamps ---
  created_at: string;
  updated_at: string;
  published_at?: string | null;
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
  listing_badge?: ListingBadge;
  has_generator?: boolean;
  has_water_tank?: boolean;
  has_ac?: boolean;
  furnished?: FurnishedStatus;
  municipio?: Municipio | null;
}

export interface PropertyFilters {
  operacion?: PropertyOperation;
  tipo?: PropertyType;
  zona?: string;
  precio_min?: number;
  precio_max?: number;
  habitaciones?: number;
  banos?: number;
  area_min?: number;
  area_max?: number;
  destacadas?: boolean;
  nuevas?: boolean;
  sort?: "recientes" | "precio_asc" | "precio_desc" | "area_desc";
  page?: number;
  per_page?: number;

  // New schema_v2 optional fields
  municipio?: Municipio;
  furnished?: FurnishedStatus;
  has_ac?: boolean;
  has_generator?: boolean;
  has_pool?: boolean;
  allows_pets?: boolean;
  min_area?: number;
  max_area?: number;
}
