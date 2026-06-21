// TypeScript types for Knordica data models
// Aligned with the Supabase schema defined in the implementation plan

export type PropertyOperation = "venta" | "alquiler";

export type PropertyType =
  | "casa"
  | "apartamento"
  | "townhouse"
  | "local"
  | "terreno"
  | "finca"
  | "oficina"
  | "proyecto";

export type PropertyStatus = "activa" | "vendida" | "alquilada" | "reservada" | "inactiva";

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
  category: "general" | "amenidades" | "seguridad" | "servicios";
  key: string;
  value_es: string | null;
  value_en: string | null;
  icon: string | null;
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
  price_negotiable: boolean;
  price_history: PriceHistoryEntry[];

  area_total: number | null;
  area_built: number | null;

  bedrooms: number | null;
  bathrooms: number | null;
  half_bathrooms: number | null;
  parking_spaces: number | null;

  zone_id: string | null;
  address_es: string | null;
  address_en: string | null;
  lat: number | null;
  lng: number | null;

  agent_id: string | null;

  meta_title_es: string | null;
  meta_title_en: string | null;
  meta_description_es: string | null;
  meta_description_en: string | null;

  created_at: string;
  updated_at: string;
  published_at: string | null;

  // Joined data
  zone?: Zone | null;
  agent?: Agent | null;
  images?: PropertyImage[];
  features?: PropertyFeature[];
  translations?: PropertyTranslation[];
}

// Full property view (for list/cards) — lighter version
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
  title: string; // from translation
  short_description: string | null; // from translation
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
}
