/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, react-hooks/immutability */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { usePanelRole } from "@/hooks/usePanelRole";
import { createClient } from "@/lib/supabase/client";
import type { PanelRole } from "@/types/panel";
import {
  Building2,
  Users,
  TrendingUp,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// ── Tipos ──
interface KPI {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  icon: React.ElementType;
  accent?: string;
}

interface RecentProperty {
  id: string;
  slug: string;
  title: string;
  status: string;
  price: number;
  price_currency: string;
  operation: string;
  cover_url: string | null;
  zone_name: string | null;
  created_at: string;
}

// ── Animación count-up ──
function CountUp({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const steps = 40;
    const step = target / steps;
    let current = 0;
    const id = setInterval(() => {
      current += step;
      if (current >= target) {
        setVal(target);
        clearInterval(id);
      } else {
        setVal(Math.floor(current));
      }
    }, 20);
    return () => clearInterval(id);
  }, [target]);
  return <span>{prefix}{val.toLocaleString("es-VE")}{suffix}</span>;
}

// ── Tarjeta KPI ──
function KPICard({ kpi, index }: { kpi: KPI; index: number }) {
  const Icon = kpi.icon;
  const hasDelta = kpi.delta !== undefined;
  const isUp = (kpi.delta ?? 0) > 0;
  const isDown = (kpi.delta ?? 0) < 0;
  const DeltaIcon = isUp ? ArrowUpRight : isDown ? ArrowDownRight : Minus;
  const deltaColor = isUp ? "var(--p-green)" : isDown ? "var(--p-red)" : "var(--p-text-3)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className="relative overflow-hidden"
      style={{
        background: "var(--p-surface)",
        border: "1px solid var(--p-border)",
        borderRadius: "var(--p-radius)",
        padding: "20px",
      }}
    >
      {/* Ícono */}
      <div
        className="w-8 h-8 flex items-center justify-center mb-4"
        style={{
          borderRadius: "var(--p-radius)",
          background: kpi.accent ? `${kpi.accent}14` : "var(--p-surface-3)",
          color: kpi.accent ?? "var(--p-accent)",
        }}
      >
        <Icon size={15} strokeWidth={2} />
      </div>

      {/* Label */}
      <p className="text-[12px] mb-1" style={{ color: "var(--p-text-2)" }}>
        {kpi.label}
      </p>

      {/* Valor */}
      <p className="text-[28px] font-semibold leading-none mb-2" style={{ color: "var(--p-text)" }}>
        {typeof kpi.value === "number" ? (
          <CountUp target={kpi.value} />
        ) : (
          kpi.value
        )}
      </p>

      {/* Delta */}
      {hasDelta && (
        <div className="flex items-center gap-1">
          <DeltaIcon size={12} style={{ color: deltaColor }} />
          <span className="text-[11px]" style={{ color: deltaColor }}>
            {Math.abs(kpi.delta!)}%
          </span>
          {kpi.deltaLabel && (
            <span className="text-[11px]" style={{ color: "var(--p-text-3)" }}>
              {kpi.deltaLabel}
            </span>
          )}
        </div>
      )}

      {/* Brillo decorativo — esquina top-right */}
      <div
        className="absolute -top-6 -right-6 w-16 h-16 rounded-full pointer-events-none"
        style={{ background: kpi.accent ? `${kpi.accent}08` : "var(--p-accent-soft)" }}
      />
    </motion.div>
  );
}

// ── Badge de estado ──
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    activa:    { label: "Activa",    color: "var(--p-green)", bg: "rgba(76,175,125,0.1)" },
    vendida:   { label: "Vendida",   color: "var(--p-blue)",  bg: "rgba(91,143,212,0.1)" },
    alquilada: { label: "Alquilada", color: "var(--p-blue)",  bg: "rgba(91,143,212,0.1)" },
    reservada: { label: "Reservada", color: "var(--p-amber)", bg: "rgba(212,146,74,0.1)" },
    cerrada:   { label: "Cerrada",   color: "var(--p-text-3)",bg: "var(--p-surface-3)" },
  };
  const s = map[status] || { label: "Cerrada", color: "var(--p-text-3)", bg: "var(--p-surface-3)" };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium"
      style={{ borderRadius: "4px", background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

// ── Componente principal ──
export default function InicioPanelPage() {
  const params = useParams();
  const locale = params?.locale || "es";
  const { role, loading: roleLoading } = usePanelRole();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [recent, setRecent] = useState<RecentProperty[]>([]);
  const [userName, setUserName] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (roleLoading) return;
    loadDashboard(role ?? "user");
  }, [role, roleLoading]);

  async function loadDashboard(r: PanelRole) {
    setLoadingData(true);
    const supabase = createClient();

    // Obtener usuario
    const { data: { user } } = await supabase.auth.getUser();
    const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
    setUserName(name);

    if (r === "user") {
      // KPIs de usuario: favoritos y mensajes
      const [{ count: favs }, { count: msgs }] = await Promise.all([
        supabase.from("favorites").select("*", { count: "exact", head: true }).eq("user_id", user?.id ?? ""),
        supabase.from("messages").select("*", { count: "exact", head: true }).eq("user_id", user?.id ?? ""),
      ]);
      setKpis([
        { label: "Propiedades guardadas", value: favs ?? 0, icon: Building2 },
        { label: "Mensajes", value: msgs ?? 0, icon: Users },
      ]);
      setRecent([]);
    } else {
      // Agente: propiedades propias
      // Admin: todas las propiedades
      const isAdmin = r === "admin";

      let query = supabase
        .from("properties")
        .select(`
          id, slug, status, operation, price, price_currency, created_at,
          translations:property_translations(locale, title),
          images:property_images(url, is_cover),
          zone:zones(name_es)
        `)
        .order("created_at", { ascending: false })
        .limit(6);

      if (!isAdmin && user?.id) {
        query = query.eq("agent_id", user.id);
      }

      const { data: props } = await query;

      // KPIs conteo por status
      let countQuery = supabase.from("properties").select("status", { count: "exact" });
      if (!isAdmin && user?.id) countQuery = countQuery.eq("agent_id", user.id);
      const { data: allProps } = await countQuery;

      const activas = allProps?.filter((p: { status: string }) => p.status === "activa").length ?? 0;
      const vendidas = allProps?.filter((p: { status: string }) => p.status === "vendida").length ?? 0;
      const total = allProps?.length ?? 0;

      // Clientes (CRM)
      let crmQuery = supabase.from("crm_clients").select("*", { count: "exact", head: true });
      if (!isAdmin && user?.id) crmQuery = crmQuery.eq("agent_id", user.id);
      const { count: clients } = await crmQuery;

      setKpis([
        {
          label: "Propiedades activas",
          value: activas,
          icon: Building2,
          accent: "#4CAF7D",
          delta: 0,
          deltaLabel: "vs. mes anterior",
        },
        {
          label: "Total propiedades",
          value: total,
          icon: TrendingUp,
          accent: "#C8B49A",
        },
        {
          label: "Vendidas / Alquiladas",
          value: vendidas,
          icon: CheckCircle2,
          accent: "#5B8FD4",
        },
        {
          label: "Clientes CRM",
          value: clients ?? 0,
          icon: Users,
          accent: "#D4924A",
        },
      ]);

      // Propiedades recientes formateadas
      const formatted: RecentProperty[] = (props ?? []).map((p: any) => ({
        id: p.id,
        slug: p.slug,
        title: p.translations?.find((t: any) => t.locale === "es")?.title ?? p.slug,
        status: p.status,
        price: p.price,
        price_currency: p.price_currency,
        operation: p.operation,
        cover_url: p.images?.find((i: any) => i.is_cover)?.url ?? p.images?.[0]?.url ?? null,
        zone_name: p.zone ? (Array.isArray(p.zone) ? p.zone[0]?.name_es : p.zone.name_es) : null,
        created_at: p.created_at,
      }));
      setRecent(formatted);
    }

    setLoadingData(false);
  }

  // ── Saludo según hora ──
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  if (roleLoading || loadingData) {
    return (
      <div className="space-y-4">
        {/* Skeletons */}
        <div className="h-6 w-48 rounded" style={{ background: "var(--p-surface-2)" }} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded animate-pulse"
              style={{ background: "var(--p-surface)", animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Saludo */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-[13px] mb-0.5" style={{ color: "var(--p-text-3)" }}>
          {greeting},
        </p>
        <h2 className="text-[22px] font-semibold" style={{ color: "var(--p-text)" }}>
          {userName || "bienvenido"} ✨
        </h2>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <KPICard key={kpi.label} kpi={kpi} index={i} />
        ))}
      </div>

      {/* Propiedades recientes — solo agente/admin */}
      {recent.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold" style={{ color: "var(--p-text)" }}>
              Últimas propiedades
            </h3>
            <a
              href="../panel/propiedades"
              className="text-[12px] hover:underline"
              style={{ color: "var(--p-accent)" }}
            >
              Ver todas
            </a>
          </div>

          <div className="space-y-2">
            {recent.map((prop, i) => (
              <motion.div
                key={prop.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.35 + i * 0.05 }}
                className="flex items-center gap-3 p-3"
                style={{
                  background: "var(--p-surface)",
                  border: "1px solid var(--p-border)",
                  borderRadius: "var(--p-radius)",
                }}
              >
                {/* Imagen miniatura */}
                <div
                  className="w-12 h-12 flex-shrink-0 overflow-hidden"
                  style={{
                    borderRadius: "var(--p-radius)",
                    background: "var(--p-surface-3)",
                  }}
                >
                  {prop.cover_url ? (
                    <img
                      src={prop.cover_url}
                      alt={prop.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 size={16} style={{ color: "var(--p-text-3)" }} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[13px] font-medium truncate leading-tight"
                    style={{ color: "var(--p-text)" }}
                  >
                    {prop.title}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--p-text-2)" }}>
                    {prop.zone_name ?? "Sin zona"} ·{" "}
                    {prop.price_currency} {prop.price.toLocaleString("es-VE")}
                  </p>
                </div>

                {/* Status */}
                <StatusBadge status={prop.status} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Estado vacío para usuario sin favoritos */}
      {role === "user" && kpis[0]?.value === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div
            className="w-12 h-12 flex items-center justify-center mb-4"
            style={{
              borderRadius: "var(--p-radius)",
              background: "var(--p-surface-2)",
              color: "var(--p-text-3)",
            }}
          >
            <Building2 size={20} />
          </div>
          <p className="text-[14px] font-medium mb-1" style={{ color: "var(--p-text)" }}>
            Aún no tienes favoritos
          </p>
          <p className="text-[12px] max-w-[260px]" style={{ color: "var(--p-text-2)" }}>
            Explora el catálogo y guarda las propiedades que te interesen
          </p>
          <Link
            href={`/${locale}`}
            className="mt-4 inline-flex items-center gap-1.5 text-[12px] px-4 py-2"
            style={{
              borderRadius: "var(--p-radius)",
              background: "var(--p-accent)",
              color: "#0E0D0C",
              fontWeight: 500,
            }}
          >
            Ver catálogo
          </Link>
        </motion.div>
      )}
    </div>
  );
}
