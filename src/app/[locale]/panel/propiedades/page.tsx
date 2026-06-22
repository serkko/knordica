"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Eye,
  Pencil,
  Trash2,
  Copy,
  MoreHorizontal,
  ArrowUpDown,
  CheckSquare,
  Square,
  Home,
  TrendingUp,
  Clock,
  X,
  ExternalLink,
} from "lucide-react";

// ── Tipos ──
interface Property {
  id: string;
  slug: string;
  operation: string;
  property_type: string;
  status: string;
  price: number;
  price_currency: string;
  area_built: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  municipio: string | null;
  featured: boolean;
  exclusive: boolean;
  created_at: string;
  cover_url?: string | null;
  title?: string;
}

type SortField = "created_at" | "price" | "status" | "operation";
type SortDir = "asc" | "desc";

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  activa:    { label: "Activa",    color: "#5A9E6F", bg: "rgba(90,158,111,0.12)" },
  reservada: { label: "Reservada", color: "#D4924A", bg: "rgba(212,146,74,0.12)" },
  vendida:   { label: "Vendida",   color: "#7A6EAA", bg: "rgba(122,110,170,0.12)" },
  alquilada: { label: "Alquilada", color: "#4A8FC4", bg: "rgba(74,143,196,0.12)" },
  cerrada:   { label: "Cerrada",   color: "#888",    bg: "rgba(136,136,136,0.1)" },
};

const OP_LABEL: Record<string, string> = {
  venta: "Venta",
  alquiler: "Alquiler",
  vacacional: "Vacacional",
};

function fmt(price: number, currency: string) {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: currency === "VES" ? "USD" : currency, // fallback
    maximumFractionDigits: 0,
  }).format(price).replace("US$", "$");
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_LABEL[status] ?? STATUS_LABEL.cerrada;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium"
      style={{
        borderRadius: "var(--p-radius)",
        color: s.color,
        background: s.bg,
      }}
    >
      {s.label}
    </span>
  );
}

// ── Menú contextual de fila ──
function RowMenu({ id, slug, locale, onDelete }: { id: string; slug: string; locale: string; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="w-7 h-7 flex items-center justify-center"
        style={{
          borderRadius: "var(--p-radius)",
          color: "var(--p-text-2)",
          background: open ? "var(--p-surface-3)" : "transparent",
        }}
      >
        <MoreHorizontal size={14} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-8 z-50 py-1 min-w-[160px]"
              style={{
                background: "var(--p-surface-2)",
                border: "1px solid var(--p-border)",
                borderRadius: "var(--p-radius)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
            >
              {[
                { icon: Eye, label: "Ver en sitio", action: () => window.open(`/${locale}/${slug}`, "_blank") },
                { icon: Pencil, label: "Editar", action: () => router.push(`/${locale}/panel/propiedades/${id}/editar`) },
                { icon: Copy, label: "Duplicar", action: () => {} },
                { icon: Trash2, label: "Eliminar", action: () => { onDelete(id); setOpen(false); }, danger: true },
              ].map(({ icon: Icon, label, action, danger }) => (
                <button
                  key={label}
                  onClick={(e) => { e.stopPropagation(); action(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px]"
                  style={{ color: danger ? "var(--p-red)" : "var(--p-text-2)" }}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Página principal ──
export default function PropiedadesPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "es";

  const [props, setProps] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterOp, setFilterOp] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ── Fetch ──
  const fetchProps = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from("properties")
      .select(`
        id, slug, operation, property_type, status,
        price, price_currency, area_built, bedrooms, bathrooms,
        municipio, featured, exclusive, created_at,
        property_translations!inner(title),
        property_images(url, is_cover)
      `)
      .order(sortField, { ascending: sortDir === "asc" });

    if (filterOp) query = query.eq("operation", filterOp);
    if (filterStatus) query = query.eq("status", filterStatus);
    if (filterType) query = query.eq("property_type", filterType);

    const { data } = await query;

    if (data) {
      const mapped: Property[] = data.map((p: any) => ({
        ...p,
        title: p.property_translations?.[0]?.title ?? "Sin título",
        cover_url: p.property_images?.find((i: any) => i.is_cover)?.url ?? p.property_images?.[0]?.url ?? null,
      }));
      // Filtro de búsqueda local
      const q = search.toLowerCase();
      setProps(q ? mapped.filter((p) => p.title?.toLowerCase().includes(q) || p.municipio?.toLowerCase().includes(q) || p.slug.includes(q)) : mapped);
    }
    setLoading(false);
  }, [sortField, sortDir, filterOp, filterStatus, filterType, search]);

  useEffect(() => { fetchProps(); }, [fetchProps]);

  // ── Selección ──
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const allSelected = props.length > 0 && selected.size === props.length;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(props.map((p) => p.id)));

  // ── Eliminar ──
  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("properties").delete().eq("id", id);
    setProps((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  };

  // ── Sort toggle ──
  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const activeFilters = [filterOp, filterStatus, filterType].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-semibold" style={{ color: "var(--p-text)" }}>Propiedades</h2>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--p-text-2)" }}>
            {loading ? "Cargando..." : `${props.length} propiedades`}
          </p>
        </div>
        <button
          onClick={() => router.push(`/${locale}/panel/propiedades/nueva`)}
          className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium"
          style={{
            borderRadius: "var(--p-radius)",
            background: "var(--p-accent)",
            color: "#0E0D0C",
          }}
        >
          <Plus size={14} />
          Nueva propiedad
        </button>
      </div>

      {/* Toolbar */}
      <div
        className="flex items-center gap-2 p-2"
        style={{
          background: "var(--p-surface)",
          border: "1px solid var(--p-border)",
          borderRadius: "var(--p-radius)",
        }}
      >
        {/* Búsqueda */}
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--p-text-3)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, municipio..."
            className="w-full h-8 pl-8 pr-3 text-[12px] outline-none"
            style={{
              background: "var(--p-surface-2)",
              border: "1px solid var(--p-border)",
              borderRadius: "var(--p-radius)",
              color: "var(--p-text)",
            }}
          />
        </div>

        {/* Filtros rápidos */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-1.5 px-3 h-8 text-[12px]"
          style={{
            borderRadius: "var(--p-radius)",
            background: showFilters || activeFilters > 0 ? "var(--p-accent-soft)" : "var(--p-surface-2)",
            border: `1px solid ${activeFilters > 0 ? "var(--p-accent)" : "var(--p-border)"}`,
            color: activeFilters > 0 ? "var(--p-accent)" : "var(--p-text-2)",
          }}
        >
          <SlidersHorizontal size={13} />
          Filtros
          {activeFilters > 0 && (
            <span
              className="w-4 h-4 flex items-center justify-center text-[10px] font-bold"
              style={{ borderRadius: "50%", background: "var(--p-accent)", color: "#0E0D0C" }}
            >
              {activeFilters}
            </span>
          )}
        </button>

        {/* Selección bulk */}
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 ml-auto"
          >
            <span className="text-[12px]" style={{ color: "var(--p-text-2)" }}>
              {selected.size} seleccionadas
            </span>
            <button
              className="px-3 h-8 text-[12px] flex items-center gap-1.5"
              style={{
                borderRadius: "var(--p-radius)",
                background: "rgba(192,96,90,0.1)",
                border: "1px solid rgba(192,96,90,0.2)",
                color: "var(--p-red)",
              }}
            >
              <Trash2 size={12} />
              Eliminar selección
            </button>
          </motion.div>
        )}
      </div>

      {/* Panel de filtros expandible */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="flex items-center gap-3 p-3"
              style={{
                background: "var(--p-surface)",
                border: "1px solid var(--p-border)",
                borderRadius: "var(--p-radius)",
              }}
            >
              {[
                {
                  label: "Operación",
                  value: filterOp,
                  onChange: setFilterOp,
                  options: [["venta","Venta"],["alquiler","Alquiler"],["vacacional","Vacacional"]],
                },
                {
                  label: "Estado",
                  value: filterStatus,
                  onChange: setFilterStatus,
                  options: [["activa","Activa"],["reservada","Reservada"],["vendida","Vendida"],["alquilada","Alquilada"],["cerrada","Cerrada"]],
                },
                {
                  label: "Tipo",
                  value: filterType,
                  onChange: setFilterType,
                  options: [["apartamento","Apartamento"],["casa","Casa"],["townhouse","Townhouse"],["terreno_lote","Terreno"],["local","Local"],["oficina","Oficina"]],
                },
              ].map(({ label, value, onChange, options }) => (
                <div key={label}>
                  <p className="text-[10px] mb-1" style={{ color: "var(--p-text-3)" }}>{label}</p>
                  <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-7 px-2 text-[12px] outline-none"
                    style={{
                      background: "var(--p-surface-2)",
                      border: "1px solid var(--p-border)",
                      borderRadius: "var(--p-radius)",
                      color: "var(--p-text)",
                    }}
                  >
                    <option value="">Todos</option>
                    {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              ))}

              {activeFilters > 0 && (
                <button
                  onClick={() => { setFilterOp(""); setFilterStatus(""); setFilterType(""); }}
                  className="ml-auto flex items-center gap-1 text-[11px] px-2 h-7"
                  style={{
                    borderRadius: "var(--p-radius)",
                    color: "var(--p-text-2)",
                    border: "1px solid var(--p-border)",
                  }}
                >
                  <X size={11} /> Limpiar
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabla */}
      <div
        style={{
          background: "var(--p-surface)",
          border: "1px solid var(--p-border)",
          borderRadius: "var(--p-radius)",
          overflow: "hidden",
        }}
      >
        {/* Head */}
        <div
          className="grid items-center px-4 py-2.5 text-[11px] font-medium"
          style={{
            gridTemplateColumns: "28px 48px 1fr 100px 90px 100px 80px 80px 40px",
            borderBottom: "1px solid var(--p-border)",
            color: "var(--p-text-3)",
            background: "var(--p-surface-2)",
          }}
        >
          <button onClick={toggleAll}>
            {allSelected
              ? <CheckSquare size={13} style={{ color: "var(--p-accent)" }} />
              : <Square size={13} />}
          </button>
          <span />
          <button className="flex items-center gap-1 text-left" onClick={() => toggleSort("created_at")}>
            Propiedad <ArrowUpDown size={10} />
          </button>
          <button className="flex items-center gap-1" onClick={() => toggleSort("operation")}>
            Operación <ArrowUpDown size={10} />
          </button>
          <button className="flex items-center gap-1" onClick={() => toggleSort("status")}>
            Estado <ArrowUpDown size={10} />
          </button>
          <button className="flex items-center gap-1" onClick={() => toggleSort("price")}>
            Precio <ArrowUpDown size={10} />
          </button>
          <span>Área</span>
          <span>Hab.</span>
          <span />
        </div>

        {/* Filas */}
        {loading ? (
          <div className="space-y-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="grid items-center px-4 py-3"
                style={{ gridTemplateColumns: "28px 48px 1fr 100px 90px 100px 80px 80px 40px", borderBottom: "1px solid var(--p-border)" }}
              >
                <div />
                <div className="w-10 h-7 rounded" style={{ background: "var(--p-surface-3)" }} />
                <div>
                  <div className="h-3 w-48 rounded mb-1.5" style={{ background: "var(--p-surface-3)" }} />
                  <div className="h-2.5 w-24 rounded" style={{ background: "var(--p-surface-3)" }} />
                </div>
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-3 w-16 rounded" style={{ background: "var(--p-surface-3)" }} />
                ))}
              </div>
            ))}
          </div>
        ) : props.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center"
              style={{ borderRadius: "var(--p-radius)", background: "var(--p-surface-2)", color: "var(--p-text-3)" }}
            >
              <Home size={18} />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-medium" style={{ color: "var(--p-text)" }}>Sin propiedades</p>
              <p className="text-[11px] mt-1" style={{ color: "var(--p-text-3)" }}>Agrega tu primera propiedad para comenzar</p>
            </div>
            <button
              onClick={() => router.push(`/${locale}/panel/propiedades/nueva`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px]"
              style={{ borderRadius: "var(--p-radius)", background: "var(--p-accent)", color: "#0E0D0C" }}
            >
              <Plus size={13} /> Nueva propiedad
            </button>
          </div>
        ) : (
          <div>
            {props.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
                className="grid items-center px-4 py-3 cursor-pointer group"
                style={{
                  gridTemplateColumns: "28px 48px 1fr 100px 90px 100px 80px 80px 40px",
                  borderBottom: idx < props.length - 1 ? "1px solid var(--p-border)" : "none",
                  background: selected.has(p.id) ? "var(--p-accent-soft)" : "transparent",
                }}
                whileHover={{ background: selected.has(p.id) ? "var(--p-accent-soft)" : "var(--p-surface-2)" }}
                onClick={() => router.push(`/${locale}/panel/propiedades/${p.id}/editar`)}
              >
                {/* Checkbox */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSelect(p.id); }}
                  className="flex items-center"
                >
                  {selected.has(p.id)
                    ? <CheckSquare size={13} style={{ color: "var(--p-accent)" }} />
                    : <Square size={13} style={{ color: "var(--p-text-3)", opacity: 0 }} className="group-hover:opacity-100" />}
                </button>

                {/* Thumb */}
                <div
                  className="w-10 h-7 flex-shrink-0 overflow-hidden"
                  style={{ borderRadius: "4px", background: "var(--p-surface-3)" }}
                >
                  {p.cover_url ? (
                    <img src={p.cover_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home size={12} style={{ color: "var(--p-text-3)" }} />
                    </div>
                  )}
                </div>

                {/* Título */}
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-medium truncate" style={{ color: "var(--p-text)" }}>
                      {p.title}
                    </span>
                    {p.featured && (
                      <span className="text-[9px] px-1 py-0.5 font-semibold uppercase tracking-wide"
                        style={{ borderRadius: "3px", background: "rgba(212,146,74,0.15)", color: "#D4924A" }}>dest</span>
                    )}
                    {p.exclusive && (
                      <span className="text-[9px] px-1 py-0.5 font-semibold uppercase tracking-wide"
                        style={{ borderRadius: "3px", background: "rgba(90,158,111,0.15)", color: "#5A9E6F" }}>excl</span>
                    )}
                  </div>
                  <p className="text-[11px] truncate" style={{ color: "var(--p-text-3)" }}>
                    {p.municipio ?? "Sin ubicación"} · {p.property_type}
                  </p>
                </div>

                {/* Operación */}
                <span className="text-[12px]" style={{ color: "var(--p-text-2)" }}>
                  {OP_LABEL[p.operation] ?? p.operation}
                </span>

                {/* Estado */}
                <StatusBadge status={p.status} />

                {/* Precio */}
                <span className="text-[13px] font-medium tabular-nums" style={{ color: "var(--p-text)" }}>
                  {fmt(p.price, p.price_currency)}
                </span>

                {/* Área */}
                <span className="text-[12px]" style={{ color: "var(--p-text-2)" }}>
                  {p.area_built ? `${p.area_built} m²` : "—"}
                </span>

                {/* Hab */}
                <span className="text-[12px]" style={{ color: "var(--p-text-2)" }}>
                  {p.bedrooms ?? "—"}
                </span>

                {/* Acciones */}
                <div onClick={(e) => e.stopPropagation()}>
                  <RowMenu id={p.id} slug={p.slug} locale={locale} onDelete={(id) => setDeleteConfirm(id)} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal confirmación eliminar */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ background: "rgba(0,0,0,0.6)" }}
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 w-80"
              style={{
                background: "var(--p-surface)",
                border: "1px solid var(--p-border)",
                borderRadius: "var(--p-radius)",
              }}
            >
              <p className="text-[14px] font-semibold mb-2" style={{ color: "var(--p-text)" }}>¿Eliminar propiedad?</p>
              <p className="text-[12px] mb-5" style={{ color: "var(--p-text-2)" }}>
                Esta acción no se puede deshacer. Se eliminarán todas las fotos y datos asociados.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-[12px]"
                  style={{
                    borderRadius: "var(--p-radius)",
                    background: "var(--p-surface-2)",
                    border: "1px solid var(--p-border)",
                    color: "var(--p-text-2)",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 text-[12px] font-medium"
                  style={{
                    borderRadius: "var(--p-radius)",
                    background: "var(--p-red)",
                    color: "#fff",
                  }}
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
