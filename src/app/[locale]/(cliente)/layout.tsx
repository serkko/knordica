import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserWithRole } from "@/lib/auth/getUserRole";
import { LayoutDashboard, Heart, CalendarRange, User, ArrowLeft } from "lucide-react";
import { LogoutButton } from "./LogoutButton";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function ProtectedLayout({ children, params }: ProtectedLayoutProps) {
  const { locale } = await params;

  const authUser = await getUserWithRole();

  if (!authUser) {
    redirect(`/${locale}/login`);
  }

  const name = authUser.full_name;
  const email = authUser.email;
  const initial = name.charAt(0).toUpperCase();

  const navItems = [
    {
      href: `/${locale}/cliente`,
      label: locale === "es" ? "Panel General" : "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      href: `/${locale}/cliente/favoritos`,
      label: locale === "es" ? "Mis Favoritos" : "My Favorites",
      icon: <Heart className="h-4 w-4" />,
    },
    {
      href: `/${locale}/cliente/solicitudes`,
      label: locale === "es" ? "Citas y Solicitudes" : "Bookings & Inquiries",
      icon: <CalendarRange className="h-4 w-4" />,
    },
    {
      href: `/${locale}/cliente/perfil`,
      label: locale === "es" ? "Mi Perfil" : "My Profile",
      icon: <User className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--background)]">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[var(--border)] bg-[var(--background-alt)] flex flex-col justify-between shrink-0">
        <div>
          {/* Brand/Logo header */}
          <div className="h-16 md:h-20 border-b border-[var(--border)] px-6 flex items-center justify-between">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <span className="font-display font-bold tracking-widest text-[var(--accent)] text-xs uppercase">
                Knordica Client
              </span>
            </Link>
            <Link
              href={`/${locale}`}
              className="md:hidden flex items-center justify-center h-8 w-8 rounded-full border border-[var(--border)] text-[var(--text-2)]"
              title="Volver a la web"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          {/* User profile card */}
          <div className="p-6 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              {/* Avatar circle with initial */}
              <div className="h-9 w-9 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 flex items-center justify-center font-display font-bold text-xs text-[var(--accent)] shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display">
                  {locale === "es" ? "Bienvenido" : "Welcome"}
                </p>
                <h4 className="text-sm font-bold text-[var(--text)] truncate mt-0.5">{name}</h4>
                <p className="text-[10px] text-[var(--text-muted)] font-mono truncate mt-0.5">{email}</p>
              </div>
            </div>
          </div>

          {/* Navigation link items */}
          <nav className="p-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-sm text-xs font-semibold text-[var(--text-2)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] transition-all"
              >
                <span className="text-[var(--text-muted)] shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer buttons / Logout */}
        <div className="p-4 border-t border-[var(--border)] flex flex-col gap-2">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3 px-4 py-2 rounded-sm text-xs text-[var(--text-2)] hover:text-[var(--text)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
            <span>{locale === "es" ? "Volver a la web" : "Back to website"}</span>
          </Link>
          <LogoutButton text={locale === "es" ? "Cerrar sesión" : "Logout"} />
        </div>
      </aside>

      {/* Main portal contents view */}
      <main className="flex-1 min-h-[300px] md:h-screen md:overflow-y-auto">
        <div className="p-6 sm:p-10 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
