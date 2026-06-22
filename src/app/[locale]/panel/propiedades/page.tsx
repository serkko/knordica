"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Eye,
  Pencil,
  Trash2,
  Copy,
  MoreHorizontal,
  ArrowUpDown,
  CheckSquare,
  Square,
  Home,
  X,
} from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────────────────────
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
  municipio: string | null;
  featured: boolean;
  exclusive: boolean;
  created_at: string;
  cover_url?: string | null;
  title: string;
}

type SortField = "created_at" | "price" | "status" | "operation";
type SortDir   = "asc" | "desc";

// ─── Constantes ───────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
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
  try {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: currency === "VES" ? "USD" : (currency || "USD"),
      maximumFractionDigits: 0,
    }).format(price).replace("US$", "$");
  } catch {
    return `$${price.toLocaleString()}`;
  }
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s = STATUS_CFG[status] ?? STATUS_CFG.cerrada;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium whitespace-nowrap"
      style={{ borderRadius: "3px", color: s.color, background: s.bg }}
    >
      {s.label}
    </span>
  );
}

function RowMenu({ id, slug, locale, onDelete }: {
  id: string; slug: string; locale: string; onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const actions = [
    { icon: Eye,    label: "Ver en sitio", action: () => window.open(`/${locale}/${slug}`, "_blank") },
    { icon: Pencil, label: "Editar",       action: () => router.push(`/${locale}/panel/propiedades/${id}/editar`) },
    { icon: Copy,   label: "Duplicar",     action: () => {} },
    { icon: Trash2, label: "Eliminar",     action: () => { onDelete(id); setOpen(false); }, danger: true },
  ] as const;

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
              {actions.map(({ icon: Icon, label, action, danger }) => (
                <button
                  key={label}
                  onClick={(e) => { e.stopPropagation(); action(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] hover:opacity-80"
                  style={{ color: (danger as boolean) ? "var(--p-red)" : "var(--p-text-2)" }}
                >
                  <Icon size={13} />{label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function PropiedadesPage() {
  const router  = useRouter();
  const params  = useParams();
  const locale  = (params?.locale as string) ?? "es";

  // Estado base (todos los datos crudos de la DB)
  const [allProps, setAllProps]         = useState<Property[]>([]);
  const [loading, setLoading]           = useState(true);

  // Filtros / búsqueda — operan sobre allProps en cliente
  const [search, setSearch]             = useState("");
  const [filterOp, setFilterOp]         = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType]     = useState("");
  const [sortField, setSortField]       = useState<SortField>("created_at");
  const [sortDir, setSortDir]           = useState<SortDir>("desc");

  // UI
  const [selected, setSelected]         = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters]   = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ─── Fetch UNA sola vez (sin filtros en servidor) ─────────────────────────
  // Así evitamos el problema de que el join falle o cambie el resultado
  const fetchAll = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    // Query principal sin joins que puedan romper
    const { data: propsData, error: propsErr } = await supabase
      .from("properties")
      .select(
        "id, slug, operation, property_type, status, price, price_currency, " +
        "area_built, bedrooms, municipio, featured, exclusive, created_at"
      )
      .order("created_at", { ascending: false });

    if (propsErr || !propsData) { setLoading(false); return; }

    // Traducciones en paralelo (puede fallar sin romper todo)
    const ids = propsData.map((p) => p.id);

    const [{ data: translations }, { data: images }] = await Promise.all([
      supabase
        .from("property_translations")
        .select("property_id, title, locale")
        .in("property_id", ids)
        .eq("locale", "es"),
      supabase
        .from("property_images")
        .select("property_id, url, is_cover, sort_order")
        .in("property_id", ids),
    ]);

    // Mapear traducciones e imágenes
    const titleMap  = Object.fromEntries((translations ?? []).map((t) => [t.property_id, t.title]));
    const imageMap: Record<string, string | null> = {};
    if (images) {
      for (const img of images) {
        if (!imageMap[img.property_id] || img.is_cover) {
          imageMap[img.property_id] = img.url;
        }
      }
    }

    const mapped: Property[] = propsData.map((p) => ({
      ...p,
      title:     titleMap[p.id]  ?? p.slug ?? "Sin título",
      cover_url: imageMap[p.id]  ?? null,
    }));

    setAllProps(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Filtrado / ordenación en cliente (instantáneo, sin re-fetch) ──────────
  const visible = useMemo(() => {
    let list = [...allProps];

    // Búsqueda
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        (p.municipio ?? "").toLowerCase().includes(q) ||
        p.slug.includes(q) ||
        p.property_type.includes(q)
      );
    }
    // Filtros
    if (filterOp)     list = list.filter((p) => p.operation     === filterOp);
    if (filterStatus) list = list.filter((p) => p.status        === filterStatus);
    if (filterType)   list = list.filter((p) => p.property_type === filterType);

    // Ordenación
    list.sort((a, b) => {
      let va: string | number = a[sortField] ?? "";
      let vb: string | number = b[sortField] ?? "";
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      return sortDir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

    return list;
  }, [allProps, search, filterOp, filterStatus, filterType, sortField, sortDir]);

  // ─── Selección ────────────────────────────────────────────────────────────
  const toggleSelect = (id: string) =>
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSelected = visible.length > 0 && selected.size === visible.length;
  const toggleAll   = () => setSelected(allSelected ? new Set() : new Set(visible.map((p) => p.id)));

  // ─── Eliminar ─────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("properties").delete().eq("id", id);
    setAllProps((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  };

  // ─── Sort ─────────────────────────────────────────────────────────────────
  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const activeFilters = [filterOp, filterStatus, filterType].filter(Boolean).length;

  const COLS = "28px 48px 1fr 90px 100px 110px 70px 60px 36px";

  return (
    <div className="space-y-4">

      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-semibold" style={{ color: "var(--p-text)" }}>Propiedades</h2>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--p-text-2)" }}>
            {loading ? "Cargando..." : `${visible.length} de ${allProps.length}`}
          </p>
        </div>
        <button
          onClick={() => router.push(`/${locale}/panel/propiedades/nueva`)}
          className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium"
          style={{ borderRadius: "var(--p-radius)", background: "var(--p-accent)", color: "#0E0D0C" }}
        >
          <Plus size={14} /> Nueva propiedad
        </button>
      </div>

      {/* ─── Toolbar ────────────────────────────────────────────────────── */}
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
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2"
              style={{ color: "var(--p-text-3)" }}
            >
              <X size={11} />
            </button>
          )}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, tipo, municipio..."
            className="w-full h-8 pl-8 pr-7 text-[12px] outline-none"
            style={{
              background: "var(--p-surface-2)",
              border: "1px solid var(--p-border)",
              borderRadius: "var(--p-radius)",
              color: "var(--p-text)",
            }}
          />
        </div>

        {/* Filtros btn */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-1.5 px-3 h-8 text-[12px]"
          style={{
            borderRadius: "var(--p-radius)",
            background: activeFilters > 0 ? "var(--p-accent-soft)" : "var(--p-surface-2)",
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

        {/* Bulk delete */}
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
              className="flex items-center gap-2 ml-auto"
            >
              <span className="text-[12px]" style={{ color: "var(--p-text-2)" }}>{selected.size} sel.</span>
              <button
                className="px-3 h-8 text-[12px] flex items-center gap-1.5"
                style={{
                  borderRadius: "var(--p-radius)",
                  background: "rgba(192,96,90,0.1)",
                  border: "1px solid rgba(192,96,90,0.2)",
                  color: "var(--p-red)",
                }}
              >
                <Trash2 size={12} /> Eliminar
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Panel filtros ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="flex flex-wrap items-end gap-4 p-4"
              style={{
                background: "var(--p-surface)",
                border: "1px solid var(--p-border)",
                borderRadius: "var(--p-radius)",
              }}
            >
              {([
                { label: "Operación",  value: filterOp,     set: setFilterOp,     opts: [["venta","Venta"],["alquiler","Alquiler"],["vacacional","Vacacional"]] },
                { label: "Estado",     value: filterStatus, set: setFilterStatus, opts: [["activa","Activa"],["reservada","Reservada"],["vendida","Vendida"],["alquilada","Alquilada"],["cerrada","Cerrada"]] },
                { label: "Tipo",       value: filterType,   set: setFilterType,   opts: [["apartamento","Apartamento"],["casa","Casa"],["townhouse","Townhouse"],["terreno_lote","Terreno"],["local","Local"],["oficina","Oficina"],["galpon","Galpón"]] },
              ] as const).map(({ label, value, set, opts }) => (
                <div key={label}>
                  <p className="text-[10px] mb-1.5" style={{ color: "var(--p-text-3)" }}>{label}</p>
                  <select
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    className="h-8 px-2 text-[12px] outline-none"
                    style={{
                      background: value ? "var(--p-accent-soft)" : "var(--p-surface-2)",
                      border: `1px solid ${value ? "var(--p-accent)" : "var(--p-border)"}`,
                      borderRadius: "var(--p-radius)",
                      color: "var(--p-text)",
                    }}
                  >
                    <option value="">Todos</option>
                    {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              ))}
              {activeFilters > 0 && (
                <button
                  onClick={() => { setFilterOp(""); setFilterStatus(""); setFilterType(""); }}
                  className="flex items-center gap-1 text-[11px] px-3 h-8"
                  style={{
                    borderRadius: "var(--p-radius)",
                    color: "var(--p-text-2)",
                    border: "1px solid var(--p-border)",
                  }}
                >
                  <X size={11} /> Limpiar filtros
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Tabla ───────────────────────────────────────────────────────── */}
      <div
        style={{
          background: "var(--p-surface)",
          border: "1px solid var(--p-border)",
          borderRadius: "var(--p-radius)",
          overflow: "hidden",
        }}
      >
        {/* Cabecera */}
        <div
          className="grid items-center px-4 py-2.5 text-[11px] font-medium"
          style={{
            gridTemplateColumns: COLS,
            borderBottom: "1px solid var(--p-border)",
            color: "var(--p-text-3)",
            background: "var(--p-surface-2)",
          }}
        >
          <button onClick={toggleAll} className="flex">
            {allSelected
              ? <CheckSquare size={13} style={{ color: "var(--p-accent)" }} />
              : <Square size={13} />}
          </button>
          <span />
          <button className="flex items-center gap-1" onClick={() => toggleSort("created_at")}>
            Propiedad <ArrowUpDown size={10} />
          </button>
          <button className="flex items-center gap-1" onClick={() => toggleSort("operation")}>
            Op. <ArrowUpDown size={10} />
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

        {/* Skeleton */}
        {loading && (
          <div>
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="grid items-center px-4 py-3"
                style={{ gridTemplateColumns: COLS, borderBottom: "1px solid var(--p-border)" }}
              >
                <div />
                <div className="w-10 h-7 rounded" style={{ background: "var(--p-surface-3)" }} />
                <div className="space-y-1.5">
                  <div className="h-3 rounded" style={{ width: `${140 + (i % 3) * 40}px`, background: "var(--p-surface-3)" }} />
                  <div className="h-2.5 w-20 rounded" style={{ background: "var(--p-surface-3)" }} />
                </div>
                {[80, 72, 90, 48, 32].map((w, j) => (
                  <div key={j} className="h-3 rounded" style={{ width: `${w}px`, background: "var(--p-surface-3)" }} />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && visible.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center"
              style={{ borderRadius: "var(--p-radius)", background: "var(--p-surface-2)", color: "var(--p-text-3)" }}
            >
              <Home size={18} />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-medium" style={{ color: "var(--p-text)" }}>
                {allProps.length === 0 ? "Sin propiedades" : "Sin resultados"}
              </p>
              <p className="text-[11px] mt-1" style={{ color: "var(--p-text-3)" }}>
                {allProps.length === 0
                  ? "Agrega tu primera propiedad para comenzar"
                  : "Prueba con otros filtros o términos de búsqueda"}
              </p>
            </div>
            {allProps.length === 0 && (
              <button
                onClick={() => router.push(`/${locale}/panel/propiedades/nueva`)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px]"
                style={{ borderRadius: "var(--p-radius)", background: "var(--p-accent)", color: "#0E0D0C" }}
              >
                <Plus size={13} /> Nueva propiedad
              </button>
            )}
          </div>
        )}

        {/* Filas con layout animation fluida */}
        {!loading && visible.length > 0 && (
          <LayoutGroup>
            <motion.div layout>
              <AnimatePresence mode="popLayout" initial={false}>
                {visible.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    layoutId={p.id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6, scaleY: 0.95 }}
                    transition={{
                      layout:  { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                      opacity: { duration: 0.15 },
                      y:       { duration: 0.15 },
                    }}
                    className="grid items-center px-4 py-3 cursor-pointer group"
                    style={{
                      gridTemplateColumns: COLS,
                      borderBottom: "1px solid var(--p-border)",
                      background: selected.has(p.id) ? "var(--p-accent-soft)" : "transparent",
                      willChange: "transform",
                    }}
                    whileHover={{
                      background: selected.has(p.id) ? "var(--p-accent-soft)" : "var(--p-surface-2)",
                    }}
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
                      style={{ borderRadius: "3px", background: "var(--p-surface-3)" }}
                    >
                      {p.cover_url
                        ? <img src={p.cover_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                        : <div className="w-full h-full flex items-center justify-center"><Home size={12} style={{ color: "var(--p-text-3)" }} /></div>
                      }
                    </div>

                    {/* Título + badges */}
                    <div className="min-w-0 pr-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-medium truncate" style={{ color: "var(--p-text)" }}>
                          {p.title}
                        </span>
                        {p.featured && (
                          <span className="shrink-0 text-[9px] px-1 py-0.5 font-semibold uppercase tracking-wide"
                            style={{ borderRadius: "3px", background: "rgba(212,146,74,0.15)", color: "#D4924A" }}>
                            dest
                          </span>
                        )}
                        {p.exclusive && (
                          <span className="shrink-0 text-[9px] px-1 py-0.5 font-semibold uppercase tracking-wide"
                            style={{ borderRadius: "3px", background: "rgba(90,158,111,0.15)", color: "#5A9E6F" }}>
                            excl
                          </span>
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

                    {/* Menú */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <RowMenu id={p.id} slug={p.slug} locale={locale} onDelete={(id) => setDeleteConfirm(id)} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        )}
      </div>

      {/* ─── Modal eliminar ──────────────────────────────────────────────── */}
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
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
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
                  style={{ borderRadius: "var(--p-radius)", background: "var(--p-red)", color: "#fff" }}
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
