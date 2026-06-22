"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/components/layout/LocaleProvider";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Home,
  UserCheck,
  Users,
  BookOpen,
  Settings,
  LogOut,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminSidebarProps {
  userName: string;
  userRole: string;
  userEmail: string;
  avatarUrl: string | null;
  isDemo?: boolean;
}

/** Color of the avatar ring based on agent role */
function getRoleRingColor(role: string): string {
  switch (role) {
    case "admin":
      return "ring-[var(--accent)]";
    case "senior":
      return "ring-[var(--gold)]";
    default:
      return "ring-blue-400";
  }
}

/** Background color of the avatar initials circle */
function getRoleAvatarBg(role: string): string {
  switch (role) {
    case "admin":
      return "bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]";
    case "senior":
      return "bg-[var(--gold)]/10 border-[var(--gold)]/30 text-[var(--gold)]";
    default:
      return "bg-blue-500/10 border-blue-500/30 text-blue-400";
  }
}

/** Badge text color based on role */
function getRoleBadgeClass(role: string): string {
  switch (role) {
    case "admin":
      return "border-[var(--accent)]/20 bg-[var(--accent)]/5 text-[var(--accent)]";
    case "senior":
      return "border-[var(--gold)]/20 bg-[var(--gold)]/5 text-[var(--gold)]";
    default:
      return "border-blue-500/20 bg-blue-500/5 text-blue-400";
  }
}

export function AdminSidebar({
  userName,
  userRole,
  userEmail,
  avatarUrl,
  isDemo = false,
}: AdminSidebarProps) {
  const { locale } = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  const initial = userName.charAt(0).toUpperCase();

  const navItems = [
    {
      href: `/${locale}/admin`,
      label: locale === "es" ? "Resumen" : "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      exact: true,
    },
    {
      href: `/${locale}/admin/propiedades`,
      label: locale === "es" ? "Propiedades" : "Properties",
      icon: <Home className="h-4 w-4" />,
    },
    {
      href: `/${locale}/admin/leads`,
      label: locale === "es" ? "Clientes y CRM" : "CRM & Leads",
      icon: <UserCheck className="h-4 w-4" />,
    },
    {
      href: `/${locale}/admin/agentes`,
      label: locale === "es" ? "Agentes" : "Agents",
      icon: <Users className="h-4 w-4" />,
    },
    {
      href: `/${locale}/admin/blog`,
      label: locale === "es" ? "Blog Editorial" : "Blog Editorial",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      href: `/${locale}/admin/configuracion`,
      label: locale === "es" ? "Configuración" : "Settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
    router.refresh();
  };

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden h-16 border-b border-[var(--border)] bg-[var(--background-alt)] px-6 flex items-center justify-between z-40 relative">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="font-display font-bold tracking-widest text-[var(--accent)] text-xs uppercase">
            Knordica CRM
          </span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-9 w-9 rounded-sm border border-[var(--border)] flex items-center justify-center text-[var(--text)] cursor-pointer"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Sidebar main body */}
      <aside
        className={`
          fixed inset-0 md:relative z-30 md:z-auto w-64 border-r border-[var(--border)] bg-[var(--background-alt)] flex flex-col justify-between shrink-0
          transition-transform duration-300 md:transition-none md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Header branding */}
            <div className="h-20 border-b border-[var(--border)] px-6 flex items-center">
              <Link href={`/${locale}`} className="flex items-center gap-2">
                <span className="font-display font-bold tracking-widest text-[var(--accent)] text-xs uppercase">
                  Knordica CRM
                </span>
              </Link>
            </div>

            {/* Profile widget — dynamic avatar + role badge */}
            <div className="p-6 border-b border-[var(--border)] bg-[var(--surface)]/20">
              <div className="flex items-center gap-3">
                {/* Avatar: image or initial with role-colored ring */}
                <div className={`relative h-10 w-10 shrink-0 rounded-full ring-2 ring-offset-1 ring-offset-[var(--background-alt)] ${getRoleRingColor(userRole)}`}>
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={userName}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`h-full w-full rounded-full border flex items-center justify-center font-display font-bold text-sm ${getRoleAvatarBg(userRole)}`}
                    >
                      {initial}
                    </div>
                  )}
                </div>

                {/* Name, role badge, email */}
                <div className="min-w-0 flex flex-col gap-0.5">
                  <h4 className="text-xs font-bold text-[var(--text)] truncate">{userName}</h4>
                  <motion.span
                    key={userRole}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`inline-block px-1.5 py-0.5 rounded-xs text-[8px] font-bold uppercase tracking-wider font-display border ${getRoleBadgeClass(userRole)}`}
                  >
                    {userRole}
                  </motion.span>
                  <p className="text-[9px] text-[var(--text-muted)] font-mono truncate">{userEmail}</p>
                </div>
              </div>

              {isDemo && (
                <div className="mt-3 px-2.5 py-1.5 border border-amber-500/20 bg-amber-500/5 text-[9px] font-mono text-amber-400 rounded-sm leading-tight text-center">
                  {locale === "es" ? "Modo Demo Local" : "Local Demo Mode"}
                </div>
              )}
            </div>

            {/* Navigation links */}
            <nav className="p-4 flex flex-col gap-1">
              {navItems.map((item) => {
                const active = isActive(item);
                return (
                  <motion.div
                    key={item.href}
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.12, ease: "easeOut" }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-sm text-xs font-semibold transition-colors ${
                        active
                          ? "bg-[var(--accent)]/10 border-l-2 border-[var(--accent)] text-[var(--accent)]"
                          : "text-[var(--text-2)] hover:bg-[var(--surface-hover)]/50 hover:text-[var(--text)]"
                      }`}
                    >
                      <span
                        className={`shrink-0 ${active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </div>

          {/* Footer controls */}
          <div className="p-4 border-t border-[var(--border)] flex flex-col gap-1 bg-[var(--surface)]/10">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-3 px-4 py-2 rounded-sm text-xs text-[var(--text-2)] hover:text-[var(--text)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
              <span>{locale === "es" ? "Volver a la web" : "Back to website"}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2 rounded-sm text-xs text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all text-left cursor-pointer"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>{locale === "es" ? "Cerrar sesión" : "Logout"}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Background overlay on mobile when sidebar is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-xs"
          />
        )}
      </AnimatePresence>
    </>
  );
}
