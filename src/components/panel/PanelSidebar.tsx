"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/components/layout/LocaleProvider";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home, Heart, Search, MessageSquare, Building2, Users, Calendar,
  BarChart3, UserCheck, UsersRound, FileText, TrendingUp, Settings,
  CircleUser, ArrowLeft, LogOut, Menu, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import type { PanelRole, NavItem } from "@/types/panel";
import { PANEL_NAV, ROLE_PERMISSIONS } from "@/types/panel";

const ICON_MAP: Record<string, React.ReactNode> = {
  Home: <Home className="h-4 w-4" />,
  Heart: <Heart className="h-4 w-4" />,
  Search: <Search className="h-4 w-4" />,
  MessageSquare: <MessageSquare className="h-4 w-4" />,
  Building2: <Building2 className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  Calendar: <Calendar className="h-4 w-4" />,
  BarChart3: <BarChart3 className="h-4 w-4" />,
  UserCheck: <UserCheck className="h-4 w-4" />,
  UsersRound: <UsersRound className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  TrendingUp: <TrendingUp className="h-4 w-4" />,
  Settings: <Settings className="h-4 w-4" />,
  CircleUser: <CircleUser className="h-4 w-4" />,
};

interface PanelSidebarProps {
  role: PanelRole;
  userName: string;
  userEmail: string;
  avatarUrl?: string | null;
  isDemo?: boolean;
}

function roleColor(role: PanelRole) {
  if (role === "admin") return { ring: "ring-[var(--accent)]", badge: "text-[var(--accent)] border-[var(--accent)]/20 bg-[var(--accent)]/5" };
  if (role === "senior") return { ring: "ring-[var(--gold)]", badge: "text-[var(--gold)] border-[var(--gold)]/20 bg-[var(--gold)]/5" };
  if (role === "agent") return { ring: "ring-blue-400", badge: "text-blue-400 border-blue-400/20 bg-blue-400/5" };
  return { ring: "ring-[var(--border)]", badge: "text-[var(--text-muted)] border-[var(--border)] bg-transparent" };
}

export function PanelSidebar({
  role,
  userName,
  userEmail,
  avatarUrl,
  isDemo = false,
}: PanelSidebarProps) {
  const { locale } = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const supabase = createClient();

  const initial = userName.charAt(0).toUpperCase();
  const colors = roleColor(role);

  const visibleNav = PANEL_NAV.filter((item) => item.roles.includes(role));
  // Separate profile to always render at bottom
  const mainNav = visibleNav.filter((i) => i.key !== "perfil");
  const bottomNav = visibleNav.filter((i) => i.key === "perfil");

  const isActive = (item: NavItem) => {
    const base = `/${locale}/panel/${item.href}`;
    return pathname === base || pathname.startsWith(base + "/");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
    router.refresh();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`border-b border-[var(--border)] flex items-center ${collapsed ? "px-3 py-5 justify-center" : "px-5 h-16"}`}>
        {!collapsed && (
          <Link href={`/${locale}`} className="font-display font-bold tracking-widest text-[var(--accent)] text-[11px] uppercase">
            Knordica Panel
          </Link>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto hidden md:flex h-7 w-7 items-center justify-center rounded-sm border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Profile */}
      {!collapsed && (
        <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--surface-2)]/20">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 shrink-0 rounded-full ring-2 ring-offset-1 ring-offset-[var(--background-alt)] ${colors.ring} overflow-hidden`}>
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-[var(--accent)]/10 font-display font-bold text-sm text-[var(--accent)]">
                  {initial}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[var(--text)] truncate">{userName}</p>
              <span className={`inline-block mt-0.5 px-1.5 py-px rounded-xs text-[8px] font-bold uppercase tracking-wider border font-display ${colors.badge}`}>
                {role}
              </span>
            </div>
          </div>
          {isDemo && (
            <div className="mt-3 text-center text-[9px] font-mono text-amber-400 border border-amber-500/20 bg-amber-500/5 rounded-xs py-1">
              {locale === "es" ? "Modo Demo" : "Demo Mode"}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
        {mainNav.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.key}
              href={`/${locale}/panel/${item.href}`}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? (locale === "es" ? item.label_es : item.label_en) : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xs text-xs font-semibold transition-all ${
                active
                  ? "bg-[var(--accent)]/10 text-[var(--accent)] border-l-2 border-[var(--accent)] pl-[10px]"
                  : "text-[var(--text-2)] hover:bg-[var(--surface-2)]/40 hover:text-[var(--text)]"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <span className={`shrink-0 ${active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>
                {ICON_MAP[item.icon]}
              </span>
              {!collapsed && <span className="truncate">{locale === "es" ? item.label_es : item.label_en}</span>}
              {!collapsed && item.badge != null && item.badge > 0 && (
                <span className="ml-auto h-4 min-w-4 px-1 rounded-full bg-[var(--accent)] text-white text-[9px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-2 py-3 border-t border-[var(--border)] flex flex-col gap-0.5">
        {bottomNav.map((item) => (
          <Link
            key={item.key}
            href={`/${locale}/panel/${item.href}`}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xs text-xs font-semibold transition-all ${
              isActive(item)
                ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                : "text-[var(--text-2)] hover:bg-[var(--surface-2)]/40 hover:text-[var(--text)]"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <span className="shrink-0 text-[var(--text-muted)]">{ICON_MAP[item.icon]}</span>
            {!collapsed && <span>{locale === "es" ? item.label_es : item.label_en}</span>}
          </Link>
        ))}
        <Link
          href={`/${locale}`}
          className={`flex items-center gap-3 px-3 py-2 rounded-xs text-xs text-[var(--text-2)] hover:text-[var(--text)] transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          <ArrowLeft className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
          {!collapsed && <span>{locale === "es" ? "Volver a la web" : "Back to site"}</span>}
        </Link>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2 rounded-xs text-xs text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all w-full text-left cursor-pointer ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{locale === "es" ? "Cerrar sesión" : "Logout"}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile topbar */}
      <div className="md:hidden h-14 border-b border-[var(--border)] bg-[var(--background-alt)] px-4 flex items-center justify-between z-40 relative">
        <Link href={`/${locale}`} className="font-display font-bold tracking-widest text-[var(--accent)] text-[11px] uppercase">
          Knordica Panel
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="h-8 w-8 border border-[var(--border)] rounded-sm flex items-center justify-center text-[var(--text)] cursor-pointer"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-[var(--border)] bg-[var(--background-alt)] shrink-0 transition-all duration-200 ${
          collapsed ? "w-14" : "w-56"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-xs"
            />
            <motion.aside
              key="drawer"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 left-0 bottom-0 w-56 z-30 bg-[var(--background-alt)] border-r border-[var(--border)] md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
