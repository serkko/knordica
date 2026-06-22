// Roles del panel — alineados con Supabase profiles.role
export type PanelRole = "user" | "agent" | "senior" | "admin";

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
export type PanelPropertyStatus = "activa" | "vendida" | "alquilada" | "reservada" | "cerrada";

// Estado de un cliente en CRM
export type CRMStage = "nuevo" | "contactado" | "visita" | "negociacion" | "cerrado" | "perdido";

export interface CRMClient {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  stage: CRMStage;
  agent_id: string;
  property_interest?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

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
