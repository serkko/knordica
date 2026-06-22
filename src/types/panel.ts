// ─── Roles ──────────────────────────────────────────────────
export type PanelRole = 'user' | 'agent' | 'senior' | 'admin';

// ─── Permisos por sección ────────────────────────────────────
export interface PanelPermissions {
  canViewAllProperties: boolean;
  canCreateProperty: boolean;
  canPublishProperty: boolean;
  canDeleteProperty: boolean;
  canManageAgents: boolean;
  canManageUsers: boolean;
  canViewCRM: boolean;
  canViewAllClients: boolean;
  canManageBlog: boolean;
  canViewSettings: boolean;
  canViewAnalytics: boolean;
  canViewGlobalAnalytics: boolean;
  canAssignAgent: boolean;
  canBulkActions: boolean;
}

export const ROLE_PERMISSIONS: Record<PanelRole, PanelPermissions> = {
  user: {
    canViewAllProperties: false, canCreateProperty: false,
    canPublishProperty: false, canDeleteProperty: false,
    canManageAgents: false, canManageUsers: false,
    canViewCRM: false, canViewAllClients: false,
    canManageBlog: false, canViewSettings: false,
    canViewAnalytics: false, canViewGlobalAnalytics: false,
    canAssignAgent: false, canBulkActions: false,
  },
  agent: {
    canViewAllProperties: false, canCreateProperty: true,
    canPublishProperty: false, canDeleteProperty: false,
    canManageAgents: false, canManageUsers: false,
    canViewCRM: true, canViewAllClients: false,
    canManageBlog: false, canViewSettings: false,
    canViewAnalytics: true, canViewGlobalAnalytics: false,
    canAssignAgent: false, canBulkActions: false,
  },
  senior: {
    canViewAllProperties: true, canCreateProperty: true,
    canPublishProperty: true, canDeleteProperty: false,
    canManageAgents: false, canManageUsers: false,
    canViewCRM: true, canViewAllClients: true,
    canManageBlog: false, canViewSettings: false,
    canViewAnalytics: true, canViewGlobalAnalytics: false,
    canAssignAgent: true, canBulkActions: false,
  },
  admin: {
    canViewAllProperties: true, canCreateProperty: true,
    canPublishProperty: true, canDeleteProperty: true,
    canManageAgents: true, canManageUsers: true,
    canViewCRM: true, canViewAllClients: true,
    canManageBlog: true, canViewSettings: true,
    canViewAnalytics: true, canViewGlobalAnalytics: true,
    canAssignAgent: true, canBulkActions: true,
  },
};

// ─── Navegación del sidebar ──────────────────────────────────
export interface NavItem {
  key: string;
  label_es: string;
  label_en: string;
  href: string;
  icon: string;
  badge?: number | null;
  roles: PanelRole[];
  children?: NavItem[];
}

export const PANEL_NAV: NavItem[] = [
  { key: 'inicio', label_es: 'Inicio', label_en: 'Home',
    href: 'inicio', icon: 'Home', roles: ['user', 'agent', 'senior', 'admin'] },

  // ── USUARIO ──
  { key: 'favoritos', label_es: 'Mis Favoritos', label_en: 'My Favorites',
    href: 'favoritos', icon: 'Heart', roles: ['user'] },
  { key: 'busquedas', label_es: 'Búsquedas Guardadas', label_en: 'Saved Searches',
    href: 'busquedas', icon: 'Search', roles: ['user'] },
  { key: 'mensajes', label_es: 'Mensajes', label_en: 'Messages',
    href: 'mensajes', icon: 'MessageSquare', badge: null, roles: ['user'] },

  // ── AGENTE / SENIOR ──
  { key: 'propiedades', label_es: 'Mis Propiedades', label_en: 'My Properties',
    href: 'propiedades', icon: 'Building2', roles: ['agent', 'senior', 'admin'] },
  { key: 'clientes', label_es: 'Clientes CRM', label_en: 'CRM',
    href: 'clientes', icon: 'Users', roles: ['agent', 'senior', 'admin'] },
  { key: 'agenda', label_es: 'Agenda', label_en: 'Schedule',
    href: 'agenda', icon: 'Calendar', roles: ['agent', 'senior', 'admin'] },
  { key: 'estadisticas', label_es: 'Estadísticas', label_en: 'Statistics',
    href: 'estadisticas', icon: 'BarChart3', roles: ['agent', 'senior'] },

  // ── ADMIN EXTRA ──
  { key: 'agentes', label_es: 'Agentes', label_en: 'Agents',
    href: 'agentes', icon: 'UserCheck', roles: ['admin'] },
  { key: 'usuarios', label_es: 'Usuarios', label_en: 'Users',
    href: 'usuarios', icon: 'UsersRound', roles: ['admin'] },
  { key: 'blog', label_es: 'Blog', label_en: 'Blog',
    href: 'blog', icon: 'FileText', roles: ['admin'] },
  { key: 'analitica', label_es: 'Analítica', label_en: 'Analytics',
    href: 'analitica', icon: 'TrendingUp', roles: ['admin'] },
  { key: 'configuracion', label_es: 'Configuración', label_en: 'Settings',
    href: 'configuracion', icon: 'Settings', roles: ['admin'] },

  // ── TODOS (bottom) ──
  { key: 'perfil', label_es: 'Mi Perfil', label_en: 'My Profile',
    href: 'perfil', icon: 'CircleUser', roles: ['user', 'agent', 'senior', 'admin'] },
];

// ─── CRM ────────────────────────────────────────────────────
export type ClientStage =
  | 'nuevo' | 'contactado' | 'calificado'
  | 'visita' | 'propuesta' | 'cerrado' | 'perdido';

export type ClientType = 'comprador' | 'arrendatario' | 'inversor';

export interface CRMClient {
  id: string;
  agent_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  client_type: ClientType;
  stage: ClientStage;
  budget_min: number | null;
  budget_max: number | null;
  budget_currency: string;
  interested_zones: string[];
  interested_types: string[];
  notes: string | null;
  next_action: string | null;
  next_action_date: string | null;
  last_contact: string | null;
  properties_shown: string[];
  created_at: string;
  updated_at: string;
}

export interface CRMInteraction {
  id: string;
  client_id: string;
  type: 'llamada' | 'whatsapp' | 'email' | 'visita' | 'nota' | 'propuesta';
  summary: string;
  created_at: string;
  agent_id: string;
}

// ─── Blog ────────────────────────────────────────────────────
export type ArticleStatus = 'borrador' | 'publicado' | 'archivado';

export interface BlogArticle {
  id: string;
  slug: string;
  status: ArticleStatus;
  author_id: string;
  category: string;
  tags: string[];
  cover_image_url: string | null;
  title_es: string;
  title_en: string;
  excerpt_es: string | null;
  excerpt_en: string | null;
  content_es: string;
  content_en: string;
  seo_title_es: string | null;
  seo_description_es: string | null;
  views: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Agenda ──────────────────────────────────────────────────
export type EventType = 'visita' | 'llamada' | 'reunion' | 'tarea';

export interface AgendaEvent {
  id: string;
  agent_id: string;
  client_id: string | null;
  property_id: string | null;
  type: EventType;
  title: string;
  notes: string | null;
  starts_at: string;
  ends_at: string;
  confirmed: boolean;
  whatsapp_sent: boolean;
}

// ─── AutoSave ────────────────────────────────────────────────
export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ─── KPI ─────────────────────────────────────────────────────
export interface KPIStat {
  key: string;
  title_es: string;
  title_en: string;
  value: number;
  unit?: string;
  is_currency?: boolean;
  change?: number;
  sparkline?: number[];
}
