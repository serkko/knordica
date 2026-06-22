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
  ChevronLeft,
  ChevronRight,
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
  // Todos los roles
  { href: "/panel/inicio", label: "Inicio", icon: LayoutDashboard, roles: ["user", "agent", "senior", "admin"] },

  // Solo usuario
  { href: "/panel/favoritos", label: "Favoritos", icon: Heart, roles: ["user"] },
  { href: "/panel/mensajes", label: "Mensajes", icon: MessageSquare, roles: ["user"] },

  // Agente + senior + admin
  { href: "/panel/propiedades", label: "Propiedades", icon: Building2, roles: ["agent", "senior", "admin"] },
  { href: "/panel/clientes", label: "Clientes", icon: Users, roles: ["agent", "senior", "admin"] },
  { href: "/panel/agenda", label: "Agenda", icon: Calendar, roles: ["agent", "senior", "admin"] },
  { href: "/panel/estadisticas", label: "Estadísticas", icon: TrendingUp, roles: ["agent", "senior", "admin"] },

  // Solo admin
  { href: "/panel/agentes", label: "Agentes", icon: UserCheck, roles: ["admin"] },
  { href: "/panel/usuarios", label: "Usuarios", icon: User, roles: ["admin"] },
  { href: "/panel/blog", label: "Blog", icon: BookOpen, roles: ["admin"] },
  { href: "/panel/analitica", label: "Analítica", icon: BarChart3, roles: ["admin"] },
  { href: "/panel/configuracion", label: "Configuración", icon: Settings, roles: ["admin"] },
];

const ROLE_LABELS: Record<PanelRole, string> = {
  user: "Usuario",
  agent: "Agente",
  senior: "Senior",
  admin: "Administrador",
};

const ROLE_COLORS: Record<PanelRole, string> = {
  user: "#6B7BF7",
  agent: "#4CAF7D",
  senior: "#D4924A",
  admin: "#C8B49A",
};

interface PanelSidebarProps {
  role: PanelRole;
  userName: string;
  userEmail: string;
  avatarUrl: string | null;
  locale?: string;
}

export function PanelSidebar({ role, userName, userEmail, avatarUrl, locale = "es" }: PanelSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  // Detecta el item activo normalizando el locale del pathname
  const isActive = (href: string) => {
    const normalized = pathname.replace(/^\/[a-z]{2}/, "");
    return normalized === href || normalized.startsWith(href + "/");
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}`);
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 220 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col flex-shrink-0 overflow-hidden"
      style={{
        background: "var(--p-sidebar)",
        borderRight: "1px solid var(--p-border)",
        height: "100dvh",
        position: "sticky",
        top: 0,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center h-[60px] px-4 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--p-border)" }}
      >
        <motion.div
          animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <span
            className="text-[15px] font-semibold tracking-tight whitespace-nowrap"
            style={{ color: "var(--p-text)", fontFamily: "var(--p-font-display)" }}
          >
            Knordica
          </span>
        </motion.div>

        {collapsed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[11px] font-bold"
            style={{ background: "var(--p-accent)", color: "#0E0D0C" }}
          >
            K
          </motion.div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2">
        <div className="space-y-0.5">
          {visibleItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={`/${locale}${item.href}`}>
                <motion.div
                  className="relative flex items-center gap-3 h-9 px-2.5 cursor-pointer select-none"
                  style={{
                    borderRadius: "6px",
                    color: active ? "var(--p-text)" : "var(--p-text-2)",
                    background: active ? "var(--p-surface-3)" : "transparent",
                  }}
                  whileHover={{
                    background: "var(--p-surface-2)",
                    color: "var(--p-text)",
                  }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Indicador activo */}
                  {active && (
                    <motion.div
                      layoutId="nav-active-dot"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5"
                      style={{
                        borderRadius: "0 3px 3px 0",
                        background: "var(--p-accent)",
                      }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}

                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.15 }}
                    className="flex-shrink-0"
                  >
                    <Icon
                      size={16}
                      style={{ color: active ? "var(--p-accent)" : "inherit" }}
                      strokeWidth={active ? 2.5 : 1.75}
                    />
                  </motion.div>

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.2 }}
                        className="text-[13px] font-medium whitespace-nowrap truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {!collapsed && item.badge && item.badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: "var(--p-accent)", color: "#0E0D0C" }}
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer: usuario + acciones */}
      <div
        className="flex-shrink-0 p-2"
        style={{ borderTop: "1px solid var(--p-border)" }}
      >
        {/* Volver al sitio */}
        <Link href={`/${locale}`}>
          <motion.div
            className="flex items-center gap-3 h-9 px-2.5 cursor-pointer mb-0.5"
            style={{ borderRadius: "6px", color: "var(--p-text-3)" }}
            whileHover={{ background: "var(--p-surface-2)", color: "var(--p-text-2)" }}
            transition={{ duration: 0.15 }}
          >
            <ExternalLink size={15} strokeWidth={1.75} className="flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[12px] whitespace-nowrap"
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
          className="w-full flex items-center gap-3 h-9 px-2.5 cursor-pointer mb-2"
          style={{ borderRadius: "6px", color: "var(--p-text-3)" }}
          whileHover={{ background: "rgba(192,96,90,0.12)", color: "#C0605A" }}
          transition={{ duration: 0.15 }}
        >
          <LogOut size={15} strokeWidth={1.75} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[12px] whitespace-nowrap"
              >
                {signingOut ? "Saliendo..." : "Cerrar sesión"}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Avatar + info usuario */}
        <div
          className="flex items-center gap-2.5 px-2 py-2"
          style={{ borderRadius: "6px", background: "var(--p-surface-2)" }}
        >
          {/* Avatar */}
          <div
            className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold overflow-hidden"
            style={{ background: "var(--p-surface-3)", color: "var(--p-accent)" }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="min-w-0 flex-1"
              >
                <p
                  className="text-[12px] font-medium truncate leading-tight"
                  style={{ color: "var(--p-text)" }}
                >
                  {userName}
                </p>
                <p
                  className="text-[10px] truncate leading-tight"
                  style={{ color: "var(--p-text-3)" }}
                >
                  {ROLE_LABELS[role]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Botón colapsar */}
      <motion.button
        onClick={() => setCollapsed((v) => !v)}
        className="absolute top-[70px] -right-3 w-6 h-6 flex items-center justify-center z-10"
        style={{
          borderRadius: "50%",
          background: "var(--p-surface-3)",
          border: "1px solid var(--p-border)",
          color: "var(--p-text-2)",
        }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.15 }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </motion.button>
    </motion.aside>
  );
}
