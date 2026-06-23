"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  Calendar,
  BarChart3,
  Settings,
  Heart,
  MessageSquare,
  User,
  BookOpen,
  TrendingUp,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import type { PanelRole } from "@/types/panel";
import { createClient } from "@/lib/supabase/client";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: PanelRole[];
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/panel/inicio",        label: "Inicio",         icon: LayoutDashboard, roles: ["user","agent","senior","admin"] },
  { href: "/panel/favoritos",     label: "Favoritos",      icon: Heart,           roles: ["user"] },
  { href: "/panel/mensajes",      label: "Mensajes",       icon: MessageSquare,   roles: ["user"] },
  { href: "/panel/propiedades",   label: "Propiedades",    icon: Building2,       roles: ["agent","senior","admin"] },
  { href: "/panel/clientes",      label: "Clientes",       icon: Users,           roles: ["agent","senior","admin"] },
  { href: "/panel/agenda",        label: "Agenda",         icon: Calendar,        roles: ["agent","senior","admin"] },
  { href: "/panel/estadisticas",  label: "Estadísticas",   icon: TrendingUp,      roles: ["agent","senior","admin"] },
  { href: "/panel/agentes",       label: "Agentes",        icon: UserCheck,       roles: ["admin"] },
  { href: "/panel/usuarios",      label: "Usuarios",       icon: User,            roles: ["admin"] },
  { href: "/panel/blog",          label: "Blog",           icon: BookOpen,        roles: ["admin"] },
  { href: "/panel/analitica",     label: "Analítica",      icon: BarChart3,       roles: ["admin"] },
  { href: "/panel/configuracion", label: "Configuración",  icon: Settings,        roles: ["admin"] },
];

const ROLE_LABELS: Record<PanelRole, string> = {
  user: "Usuario", agent: "Agente", senior: "Senior", admin: "Administrador",
};

// Sidebar toggle icon — estilo panel AI (columna izquierda + flecha)
function SidebarToggleIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="15" height="15" rx="3" stroke="currentColor" strokeWidth="1.4"/>
      <line x1="5.5" y1="1" x2="5.5" y2="16" stroke="currentColor" strokeWidth="1.4"/>
      {collapsed ? (
        <path d="M8.5 5.5L11 8.5L8.5 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      ) : (
        <path d="M10.5 5.5L8 8.5L10.5 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      )}
    </svg>
  );
}

interface PanelSidebarProps {
  role: PanelRole;
  userName: string;
  userEmail: string;
  avatarUrl: string | null;
  locale?: string;
}

export function PanelSidebar({ role, userName, userEmail, avatarUrl, locale = "es" }: PanelSidebarProps) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [collapsed, setCollapsed]   = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(role));

  const isActive = (href: string) => {
    const normalized = pathname.replace(/^\/[a-z]{2}/, "");
    return normalized === href || normalized.startsWith(href + "/");
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await createClient().auth.signOut();
    router.push(`/${locale}`);
  };

  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 232 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col flex-shrink-0"
      style={{
        background: "var(--p-sidebar)",
        borderRight: "1px solid var(--p-border)",
        height: "100dvh",
        position: "sticky",
        top: 0,
        overflow: "visible",
      }}
    >
      {/* Logo area */}
      <div
        className="flex items-center h-[58px] px-4 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--p-border)" }}
      >
        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.div
              key="icon"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[13px] font-bold flex-shrink-0"
              style={{ background: "var(--p-accent)", color: "#0E0D0C" }}
            >
              K
            </motion.div>
          ) : (
            <motion.span
              key="text"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="text-[15px] font-semibold tracking-tight whitespace-nowrap"
              style={{ color: "var(--p-text)", fontFamily: "var(--p-font-display)" }}
            >
              Knordica
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2" style={{ scrollbarWidth: "none" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {visibleItems.map(item => {
            const active = isActive(item.href);
            const Icon   = item.icon;
            return (
              <Link key={item.href} href={`/${locale}${item.href}`}>
                <motion.div
                  className="relative flex items-center cursor-pointer select-none"
                  style={{
                    height: 42,
                    padding: "0 12px",
                    gap: 12,
                    borderRadius: "6px",
                    color: active ? "var(--p-text)" : "var(--p-text-2)",
                    background: active ? "var(--p-surface-3)" : "transparent",
                  }}
                  whileHover={{
                    background: active ? "var(--p-surface-3)" : "var(--p-surface-2)",
                    color: "var(--p-text)",
                  }}
                  transition={{ duration: 0.15 }}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-active-dot"
                      style={{
                        position: "absolute", left: 0, top: "50%",
                        transform: "translateY(-50%)",
                        width: 3, height: 20,
                        borderRadius: "0 3px 3px 0",
                        background: "var(--p-accent)",
                      }}
                      transition={{ duration: 0.25, ease: [0.16,1,0.3,1] }}
                    />
                  )}

                  <Icon
                    size={18}
                    style={{ color: active ? "var(--p-accent)" : "inherit", flexShrink: 0 }}
                    strokeWidth={active ? 2.5 : 1.75}
                  />

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.18 }}
                        style={{ fontSize: "14px", fontWeight: active ? 500 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {!collapsed && item.badge && item.badge > 0 && (
                    <span
                      style={{ marginLeft: "auto", fontSize: "10px", fontWeight: 600, padding: "1px 6px", borderRadius: "9999px", background: "var(--p-accent)", color: "#0E0D0C", flexShrink: 0 }}
                    >
                      {item.badge}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 p-2" style={{ borderTop: "1px solid var(--p-border)" }}>
        {/* Ir al sitio */}
        <Link href={`/${locale}`}>
          <motion.div
            className="flex items-center cursor-pointer mb-0.5"
            style={{ height: 40, padding: "0 12px", gap: 10, borderRadius: "6px", color: "var(--p-text-3)" }}
            whileHover={{ background: "var(--p-surface-2)", color: "var(--p-text-2)" }}
            transition={{ duration: 0.15 }}
          >
            <ExternalLink size={16} strokeWidth={1.75} style={{ flexShrink: 0 }} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ fontSize: "14px", whiteSpace: "nowrap" }}
                >
                  Ir al sitio
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </Link>

        {/* Logout */}
        <motion.button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center cursor-pointer mb-2"
          style={{ height: 40, padding: "0 12px", gap: 10, borderRadius: "6px", color: "var(--p-text-3)", background: "none", border: "none" }}
          whileHover={{ background: "rgba(192,96,90,0.12)", color: "#C0605A" }}
          transition={{ duration: 0.15 }}
        >
          <LogOut size={16} strokeWidth={1.75} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ fontSize: "14px", whiteSpace: "nowrap" }}
              >
                {signingOut ? "Saliendo..." : "Cerrar sesión"}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Avatar */}
        <div
          className="flex items-center"
          style={{ gap: 10, padding: "8px 12px", borderRadius: "6px", background: "var(--p-surface-2)" }}
        >
          <div
            style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, overflow: "hidden", background: "var(--p-surface-3)", color: "var(--p-accent)" }}
          >
            {avatarUrl
              ? <img src={avatarUrl} alt={userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span>{initials}</span>}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                style={{ minWidth: 0, flex: 1 }}
              >
                <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--p-text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</p>
                <p style={{ fontSize: "11px", color: "var(--p-text-3)", margin: 0 }}>{ROLE_LABELS[role]}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse toggle — sidebar panel icon */}
      <motion.button
        onClick={() => setCollapsed(v => !v)}
        style={{
          position: "absolute",
          top: 14,
          right: -15,
          width: 30,
          height: 30,
          borderRadius: "6px",
          background: "var(--p-surface-2)",
          border: "1px solid var(--p-border)",
          color: "var(--p-text-3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}
        whileHover={{ color: "var(--p-text)", background: "var(--p-surface-3)" }}
        whileTap={{ scale: 0.92 }}
        transition={{ duration: 0.15 }}
        title={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
      >
        <SidebarToggleIcon collapsed={collapsed} />
      </motion.button>
    </motion.aside>
  );
}
