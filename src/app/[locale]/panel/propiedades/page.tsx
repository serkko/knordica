"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { usePanelRole } from "@/hooks/usePanelRole";
import {
  Plus,
  LayoutGrid,
  List,
  Search,
  Building2,
  MapPin,
  Eye,
  Pencil,
  Trash2,
  ChevronDown,
} from "lucide-react";

// ── Tipos ──
interface PropRow {
  id: string;
  slug: string;
  title: string;
  status: string;
  operation: string;
  property_type: string;
  price: number;
  price_currency: string;
  zone_name: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_built: number | null;
  cover_url: string | null;
  created_at: string;
  agent_name: string | null;
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  activa:    { label: "Activa",    color: "var(--p-green)", bg: "rgba(76,175,125,0.12)" },
  vendida:   { label: "Vendida",   color: "var(--p-blue)",  bg: "rgba(91,143,212,0.12)" },
  alquilada: { label: "Alquilada", color: "var(--p-blue)",  bg: "rgba(91,143,212,0.12)" },
  reservada: { label: "Reservada", color: "var(--p-amber)", bg: "rgba(212,146,74,0.12)" },
  cerrada:   { label: "Cerrada",   color: "var(--p-text-3)",bg: "var(--p-surface-3)" },
};

const OP_MAP: Record<string, string> = {
  venta: "Venta",
  alquiler: "Alquiler",
  vacacional: "Vacacional",
};

const FILTERS = [
  { key: "",          label: "Todas" },
  { key: "activa",    label: "Activas" },
  { key: "reservada", label: "Reservadas" },
  { key: "vendida",   label: "Vendidas" },
  { key: "cerrada",   label: "Cerradas" },
];

// ── Badge ──
function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.cerrada;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium"
      style={{ borderRadius: "4px", background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

// ── Card vista grid ──
function PropCard({ prop, locale, onDelete }: { prop: PropRow; locale: string; onDelete: (id: string) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: "var(--p-surface)",
        border: "1px solid var(--p-border)",
        borderRadius: "var(--p-radius)",
        overflow: "hidden",
      }}
    >
      {/* Foto */}
      <div
        className="relative w-full aspect-[16/9] overflow-hidden"
        style={{ background: "var(--p-surface-3)" }}
      >
        {prop.cover_url ? (
          <img
            src={prop.cover_url}
            alt={prop.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 size={24} style={{ color: "var(--p-text-3)" }} />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <StatusBadge status={prop.status} />
        </div>
        <div
          className="absolute top-2 right-2 text-[10px] px-2 py-0.5 font-medium"
          style={{
            borderRadius: "4px",
            background: "rgba(14,13,12,0.7)",
            color: "var(--p-text-2)",
            backdropFilter: "blur(4px)",
          }}
        >
          {OP_MAP[prop.operation] ?? prop.operation}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p
          className="text-[13px] font-medium truncate mb-1"
          style={{ color: "var(--p-text)" }}
        >
          {prop.title}
        </p>
        {prop.zone_name && (
          <p className="flex items-center gap-1 text-[11px] mb-2" style={{ color: "var(--p-text-2)" }}>
            <MapPin size={10} />
            {prop.zone_name}
          </p>
        )}
        <p className="text-[15px] font-semibold" style={{ color: "var(--p-accent)" }}>
          {prop.price_currency} {prop.price.toLocaleString("es-VE")}
        </p>

        {/* Acciones */}
        <div className="flex items-center gap-1 mt-3 pt-3" style={{ borderTop: "1px solid var(--p-border)" }}>
          <Link
            href={`/${locale}/propiedades/${prop.slug}`}
            target="_blank"
            className="flex items-center gap-1 text-[11px] px-2 py-1 flex-1 justify-center"
            style={{
              borderRadius: "var(--p-radius)",
              color: "var(--p-text-2)",
              background: "var(--p-surface-2)",
            }}
          >
            <Eye size={11} /> Ver
          </Link>
          <Link
            href={`/${locale}/panel/propiedades/${prop.id}/editar`}
            className="flex items-center gap-1 text-[11px] px-2 py-1 flex-1 justify-center"
            style={{
              borderRadius: "var(--p-radius)",
              color: "var(--p-text-2)",
              background: "var(--p-surface-2)",
            }}
          >
            <Pencil size={11} /> Editar
          </Link>
          <button
            onClick={() => onDelete(prop.id)}
            className="flex items-center gap-1 text-[11px] px-2 py-1 flex-1 justify-center"
            style={{
              borderRadius: "var(--p-radius)",
              color: "var(--p-red)",
              background: "rgba(192,96,90,0.08)",
            }}
          >
            <Trash2 size={11} /> Eliminar
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Fila vista lista ──
function PropRow({ prop, locale, onDelete }: { prop: PropRow; locale: string; onDelete: (id: string) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className="flex items-center gap-4 px-4 py-3"
      style={{
        background: "var(--p-surface)",
        border: "1px solid var(--p-border)",
        borderRadius: "var(--p-radius)",
      }}
    >
      {/* Thumb */}
      <div
        className="w-14 h-10 flex-shrink-0 overflow-hidden"
        style={{ borderRadius: "var(--p-radius)", background: "var(--p-surface-3)" }}
      >
        {prop.cover_url ? (
          <img src={prop.cover_url} alt={prop.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 size={14} style={{ color: "var(--p-text-3)" }} />
          </div>
        )}
      </div>

      {/* Título + zona */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium truncate" style={{ color: "var(--p-text)" }}>
          {prop.title}
        </p>
        <p className="text-[11px]" style={{ color: "var(--p-text-2)" }}>
          {prop.zone_name ?? "Sin zona"} · {OP_MAP[prop.operation] ?? prop.operation}
        </p>
      </div>

      {/* Precio */}
      <p className="text-[13px] font-semibold w-32 text-right flex-shrink-0" style={{ color: "var(--p-accent)" }}>
        {prop.price_currency} {prop.price.toLocaleString("es-VE")}
      </p>

      {/* Status */}
      <div className="w-24 flex-shrink-0 flex justify-center">
        <StatusBadge status={prop.status} />
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Link
          href={`/${locale}/propiedades/${prop.slug}`}
          target="_blank"
          className="w-7 h-7 flex items-center justify-center"
          style={{ borderRadius: "var(--p-radius)", color: "var(--p-text-2)", background: "var(--p-surface-2)" }}
        >
          <Eye size={13} />
        </Link>
        <Link
          href={`/${locale}/panel/propiedades/${prop.id}/editar`}
          className="w-7 h-7 flex items-center justify-center"
          style={{ borderRadius: "var(--p-radius)", color: "var(--p-text-2)", background: "var(--p-surface-2)" }}
        >
          <Pencil size={13} />
        </Link>
        <button
          onClick={() => onDelete(prop.id)}
          className="w-7 h-7 flex items-center justify-center"
          style={{ borderRadius: "var(--p-radius)", color: "var(--p-red)", background: "rgba(192,96,90,0.08)" }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
}

// ── Página ──
export default function PropiedadesPage() {
  const params = useParams();
  const locale = (params?.locale as string) ?? "es";
  const { role } = usePanelRole();

  const [props, setProps] = useState<PropRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("list");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
      .from("properties")
      .select(`
        id, slug, status, operation, property_type, price, price_currency,
        bedrooms, bathrooms, area_built, created_at,
        translations:property_translations(locale, title),
        images:property_images(url, is_cover, sort_order),
        zone:zones(name_es),
        agent:profiles!agent_id(full_name)
      `)
      .order("created_at", { ascending: false });

    if (role !== "admin" && user?.id) {
      query = query.eq("agent_id", user.id);
    }
    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const { data } = await query;

    const rows: PropRow[] = (data ?? []).map((p: {
      id: string; slug: string; status: string; operation: string;
      property_type: string; price: number; price_currency: string;
      bedrooms: number | null; bathrooms: number | null; area_built: number | null;
      created_at: string;
      translations: Array<{ locale: string; title: string }>;
      images: Array<{ url: string; is_cover: boolean; sort_order: number }>;
      zone: { name_es: string } | null;
      agent: { full_name: string } | null;
    }) => ({
      id: p.id,
      slug: p.slug,
      title: p.translations?.find((t) => t.locale === "es")?.title ?? p.slug,
      status: p.status,
      operation: p.operation,
      property_type: p.property_type,
      price: p.price,
      price_currency: p.price_currency,
      zone_name: p.zone?.name_es ?? null,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      area_built: p.area_built,
      cover_url:
        p.images?.find((i) => i.is_cover)?.url ??
        p.images?.sort((a, b) => a.sort_order - b.sort_order)[0]?.url ??
        null,
      created_at: p.created_at,
      agent_name: p.agent?.full_name ?? null,
    }));

    setProps(rows);
    setLoading(false);
  }, [role, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = props.filter((p) =>
    search === "" ||
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.zone_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("\u00bfEliminar esta propiedad? Esta acción no se puede deshacer.")) return;
    const supabase = createClient();
    await supabase.from("properties").delete().eq("id", id);
    setProps((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-semibold" style={{ color: "var(--p-text)" }}>
            Propiedades
          </h2>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--p-text-2)" }}>
            {filtered.length} propiedad{filtered.length !== 1 ? "es" : ""}
          </p>
        </div>
        <Link
          href={`/${locale}/panel/propiedades/nueva`}
          className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium"
          style={{
            borderRadius: "var(--p-radius)",
            background: "var(--p-accent)",
            color: "#0E0D0C",
          }}
        >
          <Plus size={15} />
          Nueva propiedad
        </Link>
      </div>

      {/* Barra de herramientas */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Buscador */}
        <div
          className="flex items-center gap-2 flex-1 min-w-[200px] px-3 h-9"
          style={{
            background: "var(--p-surface)",
            border: "1px solid var(--p-border)",
            borderRadius: "var(--p-radius)",
          }}
        >
          <Search size={14} style={{ color: "var(--p-text-3)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o zona..."
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[var(--p-text-3)]"
            style={{ color: "var(--p-text)" }}
          />
        </div>

        {/* Filtros rápidos por status */}
        <div className="flex items-center gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className="px-3 h-9 text-[12px] font-medium transition-colors"
              style={{
                borderRadius: "var(--p-radius)",
                background: statusFilter === f.key ? "var(--p-surface-3)" : "transparent",
                color: statusFilter === f.key ? "var(--p-text)" : "var(--p-text-2)",
                border: "1px solid",
                borderColor: statusFilter === f.key ? "var(--p-border)" : "transparent",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Toggle vista */}
        <div
          className="flex items-center p-0.5 gap-0.5"
          style={{
            background: "var(--p-surface)",
            border: "1px solid var(--p-border)",
            borderRadius: "var(--p-radius)",
          }}
        >
          {(["list", "grid"] as const).map((v) => (
            <motion.button
              key={v}
              onClick={() => setView(v)}
              className="w-8 h-8 flex items-center justify-center"
              style={{
                borderRadius: "5px",
                background: view === v ? "var(--p-surface-3)" : "transparent",
                color: view === v ? "var(--p-text)" : "var(--p-text-3)",
              }}
              whileTap={{ scale: 0.9 }}
            >
              {v === "list" ? <List size={14} /> : <LayoutGrid size={14} />}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className={view === "grid" ? "grid grid-cols-2 lg:grid-cols-3 gap-3" : "space-y-2"}>
          {[0,1,2,3,4,5].map((i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{
                height: view === "grid" ? 240 : 64,
                borderRadius: "var(--p-radius)",
                background: "var(--p-surface)",
                animationDelay: `${i * 60}ms`,
              }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-20 text-center"
        >
          <Building2 size={28} style={{ color: "var(--p-text-3)", marginBottom: 12 }} />
          <p className="text-[14px] font-medium" style={{ color: "var(--p-text)" }}>
            No hay propiedades
          </p>
          <p className="text-[12px] mt-1 max-w-[240px]" style={{ color: "var(--p-text-2)" }}>
            {search ? "Ningún resultado para \u201c" + search + "\u201d" : "Crea tu primera propiedad para comenzar"}
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          {view === "grid" ? (
            <motion.div
              key="grid"
              layout
              className="grid grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {filtered.map((p) => (
                <PropCard key={p.id} prop={p} locale={locale} onDelete={handleDelete} />
              ))}
            </motion.div>
          ) : (
            <motion.div key="list" layout className="space-y-2">
              {filtered.map((p) => (
                <PropRow key={p.id} prop={p} locale={locale} onDelete={handleDelete} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
