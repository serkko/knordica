"use client";

import Link from "next/link";
import { useFavorites } from "@/hooks/useFavorites";
import { useLocale } from "@/components/layout/LocaleProvider";
import { PropertyCard } from "@/components/property/PropertyCard";
import {
  Heart,
  CalendarRange,
  ArrowRight,
  UserCheck,
  Shield,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export default function ClienteDashboard() {
  const { locale } = useLocale();
  const { favorites, isLoading } = useFavorites();
  const [leadsCount, setLeadsCount] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const devLeads = JSON.parse(
        localStorage.getItem("knordica-dev-leads") || "[]"
      );
      setLeadsCount(devLeads.length);
    }
  }, []);

  const stats = [
    {
      title: locale === "es" ? "Favoritos Guardados" : "Saved Favorites",
      value: isLoading ? "–" : favorites.length,
      icon: <Heart className="h-5 w-5 text-red-400" />,
      link: `/${locale}/cliente/favoritos`,
      color: "hover:border-red-400/40",
    },
    {
      title: locale === "es" ? "Solicitudes de Contacto" : "Active Inquiries",
      value: leadsCount,
      icon: <CalendarRange className="h-5 w-5 text-[var(--accent)]" />,
      link: `/${locale}/cliente/solicitudes`,
      color: "hover:border-[var(--accent)]/40",
    },
    {
      title: locale === "es" ? "Estado de Cuenta" : "Account Status",
      value: locale === "es" ? "Activo" : "Active",
      icon: <UserCheck className="h-5 w-5 text-emerald-400" />,
      link: `/${locale}/cliente/perfil`,
      color: "hover:border-emerald-400/40",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-10"
    >
      {/* Title */}
      <motion.div variants={itemVariants}>
        <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-semibold font-display block mb-1">
          {locale === "es" ? "PORTAL PRIVADO" : "PRIVATE PORTAL"}
        </span>
        <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[var(--text)]">
          {locale === "es" ? "Panel de Control" : "Client Dashboard"}
        </h2>
        <p className="text-xs text-[var(--text-2)] font-light mt-1">
          {locale === "es"
            ? "Gestiona tus búsquedas guardadas, solicitudes de visitas y agenda de asesoría."
            : "Manage your saved searches, appointment requests, and advisor schedules."}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6"
      >
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <Link href={stat.link} className="block group">
              <div
                className={`p-5 border border-[var(--border)] bg-[var(--surface)] rounded-sm transition-all ${stat.color} hover:shadow-md flex items-center justify-between`}
              >
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display">
                    {stat.title}
                  </span>
                  <p className="text-2xl font-bold font-display text-[var(--text)] mt-2 group-hover:text-[var(--accent)] transition-colors">
                    {stat.value}
                  </p>
                </div>
                <div className="h-10 w-10 border border-[var(--border)] rounded-full flex items-center justify-center bg-[var(--surface-2)] shrink-0">
                  {stat.icon}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Security info block */}
      <motion.div
        variants={itemVariants}
        className="p-5 border border-emerald-500/20 bg-emerald-500/5 rounded-sm flex items-start gap-4"
      >
        <Shield className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-emerald-300">
          <h5 className="font-bold mb-1">
            {locale === "es" ? "Conexión Segura TLS" : "TLS Secure Connection"}
          </h5>
          <p className="font-light">
            {locale === "es"
              ? "Toda la información y documentación compartida con nuestros agentes está cifrada de punto a punto y protegida por políticas estrictas de privacidad."
              : "All information and documentation shared with our advisors is encrypted end-to-end and protected by strict privacy policies."}
          </p>
        </div>
      </motion.div>

      {/* Recent Favorites Section */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h3 className="font-display font-bold text-base text-[var(--text)]">
            {locale === "es" ? "Favoritos Recientes" : "Recent Favorites"}
          </h3>
          {favorites.length > 0 && (
            <Link
              href={`/${locale}/cliente/favoritos`}
              className="text-[10px] font-display font-semibold uppercase tracking-wider text-[var(--text-2)] hover:text-[var(--accent)] transition-colors flex items-center gap-1"
            >
              <span>{locale === "es" ? "Ver todos" : "View all"}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="h-44 w-full bg-[var(--surface-2)] animate-pulse rounded-sm border border-[var(--border)]" />
        ) : favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-8 border border-[var(--border)] bg-[var(--surface)]/30 rounded-sm text-center text-xs text-[var(--text-muted)] font-mono"
          >
            {locale === "es"
              ? "No tienes favoritos guardados actualmente."
              : "You do not have any saved favorites currently."}
            <Link
              href={`/${locale}/propiedades`}
              className="flex items-center justify-center gap-1 mt-3 text-[var(--accent)] font-semibold font-display hover:underline text-[10px] uppercase tracking-widest"
            >
              <span>{locale === "es" ? "Explorar catálogo" : "Browse catalog"}</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {favorites.slice(0, 2).map((property, i) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              >
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
