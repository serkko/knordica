// Roles del panel — alineados con Supabase profiles.role
export type PanelRole = "user" | "agent" | "admin";

// Item de navegación
export interface PanelNavItem {
  href: string;
  label: string;
  iconName: string;
  roles: PanelRole[];
  badge?: number;
}

// Contexto del usuario en el panel
export interface PanelUser {
  id: string;
  email: string;
  userName: string;
  avatarUrl: string | null;
  role: PanelRole;
}

// KPI genérico para tarjetas de estadísticas
export interface KPIData {
  label: string;
  value: number | string;
  delta?: number;        // % cambio respecto al período anterior
  deltaLabel?: string;   // "vs. mes anterior"
  trend?: "up" | "down" | "neutral";
  prefix?: string;       // "$"
  suffix?: string;       // "propiedades"
}

// Estado de una propiedad en el panel
export type PanelPropertyStatus = "activa" | "vendida" | "alquilada" | "reservada" | "inactiva";

// Pipeline CRM — 6 etapas canónicas (mismo valor que leads.status en DB)
export type CRMStage = "nuevo" | "contactado" | "visita" | "negociacion" | "cerrado" | "perdido";

// Entrada de agenda
export interface AgendaEvent {
  id: string;
  title: string;
  description?: string | null;
  event_type: "visita" | "llamada" | "reunion" | "tarea";
  starts_at: string;
  ends_at?: string | null;
  agent_id: string;
  client_id?: string | null;
  property_id?: string | null;
  completed: boolean;
  created_at: string;
}

// Estado del autoguardado
export type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

// Estadísticas de KPI
export interface KPIStat {
  id?: string;
  key: string;
  title?: string;
  title_es: string;
  title_en: string;
  value: string | number;
  delta?: string;
  deltaType?: "increase" | "decrease" | "moderate";
  sparkline?: number[];
  change?: number;
  is_currency?: boolean;
  unit?: string;
}

// Artículos de blog
export interface BlogArticle {
  id: string;
  title_es: string;
  title_en?: string | null;
  slug: string;
  content_es: string;
  content_en?: string | null;
  status: "published" | "draft" | "scheduled" | "publicado" | "borrador";
  author_id: string;
  cover_image_url?: string | null;
  category?: string | null;
  views?: number;
  excerpt_es?: string | null;
  excerpt_en?: string | null;
  seo_title_es?: string | null;
  seo_description_es?: string | null;
  tags?: string[] | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Tipos del CRM
export type ClientStage = CRMStage;
// 4 tipos canónicos sin sinónimos — coinciden exactamente con los valores en DB
export type ClientType = "comprador" | "arrendatario" | "propietario" | "inversor";

export interface CRMClient {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  stage: CRMStage;
  client_type?: ClientType | null;
  agent_id: string;
  property_interest?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  budget_currency?: string | null;
  interested_zones?: string[] | null;
  interested_types?: string[] | null;
  properties_shown?: string[] | null;
  notes?: string | null;
  last_contact?: string | null;
  next_action?: string | null;
  next_action_date?: string | null;
  priority?: "alta" | "media" | "baja" | null;
  source?: string | null;
  req_bedrooms?: number | null;
  req_bathrooms?: number | null;
  req_parking?: number | null;
  bath_preference?: "privado" | "compartido" | "indiferente" | null;
  cedula_rif?: string | null;
  preferred_payment?: string | null;
  urgency?: string | null;
  created_at: string;
  updated_at: string;
}
