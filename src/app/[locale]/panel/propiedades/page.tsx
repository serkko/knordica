"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Plus, Search, SlidersHorizontal, Eye, Pencil, Trash2,
  Copy, MoreHorizontal, ArrowUpDown, CheckSquare, Square,
  Home, X, Save,
} from "lucide-react";

interface Property {
  id: string;
  slug: string;
  operation: string;
  property_type: string;
  status: string;
  price: number;
  price_currency: string;
  maintenance_fee?: number | null;
  area_built: number | null;
  bedrooms: number | null;
  bathrooms?: number | null;
  municipio: string | null;
  featured: boolean;
  exclusive: boolean;
  created_at: string;
  cover_url?: string | null;
  title: string;
}

type SortField = "created_at" | "price" | "status" | "operation";
type SortDir = "asc" | "desc";

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  activa:    { label: "Activa",    color: "#4ADE80", bg: "rgba(74,222,128,0.1)" },
  reservada: { label: "Reservada", color: "#FBB040", bg: "rgba(251,176,64,0.1)" },
  vendida:   { label: "Vendida",   color: "#A78BFA", bg: "rgba(167,139,250,0.1)" },
  alquilada: { label: "Alquilada", color: "#60A5FA", bg: "rgba(96,165,250,0.1)" },
  cerrada:   { label: "Cerrada",   color: "#616160", bg: "rgba(97,97,96,0.15)" },
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
    return `$${price?.toLocaleString() ?? 0}`;
  }
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_CFG[status] ?? STATUS_CFG.cerrada;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 font-medium whitespace-nowrap"
      style={{ borderRadius: "3px", color: s.color, background: s.bg, fontSize: "11px" }}
    >
      {s.label}
    </span>
  );
}

function QuickEditRow({
  property, onClose, onSaved,
}: {
  property: Property;
  onClose: () => void;
  onSaved: (next: Partial<Property> & { id: string }) => void;
}) {
  const [title, setTitle] = useState(property.title);
  const [price, setPrice] = useState(String(property.price ?? ""));
  const [status, setStatus] = useState(property.status);
  const [operation, setOperation] = useState(property.operation);
  const [saving, setSaving] = useState(false);

  const inputStyle: React.CSSProperties = {
    background: "var(--p-surface-3)",
    border: "1px solid var(--p-border)",
    borderRadius: "var(--p-radius)",
    color: "var(--p-text)",
    height: "34px",
    padding: "0 10px",
    fontSize: "13px",
    width: "100%",
    outline: "none",
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("properties").update({ price: Number(price) || 0, status, operation }).eq("id", property.id);
    await supabase.from("property_translations").update({ title }).eq("property_id", property.id).eq("locale", "es");
    onSaved({ id: property.id, title, price: Number(price) || 0, status, operation });
    setSaving(false);
    onClose();
  };

  return (
    <motion.div
      layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      style={{ overflow: "hidden", borderBottom: "1px solid var(--p-border)", background: "var(--p-surface-2)" }}
    >
      <div className="px-6 py-4" style={{ display: "grid", gridTemplateColumns: "1.6fr 160px 160px 140px", gap: "12px", alignItems: "end" }}>
        <div>
          <p style={{ fontSize: "11px", color: "var(--p-text-3)", marginBottom: "6px" }}>Título</p>
          <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <p style={{ fontSize: "11px", color: "var(--p-text-3)", marginBottom: "6px" }}>Precio</p>
          <input value={price} onChange={e => setPrice(e.target.value)} type="number" style={inputStyle} />
        </div>
        <div>
          <p style={{ fontSize: "11px", color: "var(--p-text-3)", marginBottom: "6px" }}>Estado</p>
          <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
            <option value="activa">Activa</option>
            <option value="reservada">Reservada</option>
            <option value="vendida">Vendida</option>
            <option value="alquilada">Alquilada</option>
            <option value="cerrada">Cerrada</option>
          </select>
        </div>
        <div>
          <p style={{ fontSize: "11px", color: "var(--p-text-3)", marginBottom: "6px" }}>Operación</p>
          <select value={operation} onChange={e => setOperation(e.target.value)} style={inputStyle}>
            <option value="venta">Venta</option>
            <option value="alquiler">Alquiler</option>
            <option value="vacacional">Vacacional</option>
          </select>
        </div>
      </div>
      <div className="px-6 pb-4 flex justify-end gap-2">
        <button onClick={onClose} style={{ borderRadius: "var(--p-radius)", border: "1px solid var(--p-border)", color: "var(--p-text-2)", padding: "6px 14px", fontSize: "13px" }}>Cancelar</button>
        <button onClick={handleSave} style={{ borderRadius: "var(--p-radius)", background: "var(--p-accent)", color: "#090909", padding: "6px 14px", fontSize: "13px", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
          <Save size={12} />{saving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </motion.div>
  );
}

function RowMenu({ id, slug, locale, isOpen, onOpen, onClose, onDelete, onDuplicate }: {
  id: string; slug: string; locale: string; isOpen: boolean;
  onOpen: (id: string) => void; onClose: () => void;
  onDelete: (id: string) => void; onDuplicate: (id: string) => void;
}) {
  const router = useRouter();
  const items = [
    { icon: Eye,    label: "Ver en sitio", action: () => window.open(`/${locale}/${slug}`, "_blank") },
    { icon: Pencil, label: "Editar",       action: () => router.push(`/${locale}/panel/propiedades/${id}/editar`) },
    { icon: Copy,   label: "Duplicar",     action: () => onDuplicate(id) },
    { icon: Trash2, label: "Eliminar",     action: () => onDelete(id), danger: true },
  ];
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={e => { e.stopPropagation(); isOpen ? onClose() : onOpen(id); }}
        style={{ width: 28, height: 28, borderRadius: "var(--p-radius)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--p-text-3)", background: isOpen ? "var(--p-surface-3)" : "transparent" }}
      >
        <MoreHorizontal size={15} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={onClose} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ duration: 0.1 }}
              style={{ position: "absolute", right: 0, top: 32, zIndex: 50, minWidth: 170, background: "var(--p-surface-2)", border: "1px solid var(--p-border)", borderRadius: "var(--p-radius)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", padding: "4px 0" }}
            >
              {items.map(({ icon: Icon, label, action, danger }) => (
                <button key={label} onClick={e => { e.stopPropagation(); action(); onClose(); }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", fontSize: "13px", color: danger ? "var(--p-red)" : "var(--p-text-2)", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
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

export default function PropiedadesPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "es";

  const [allProps, setAllProps] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterOp, setFilterOp] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [quickEditId, setQuickEditId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setDbError(null);
    const supabase = createClient();

    // Step 1: traer propiedades sin joins que puedan filtrar rows
    const { data: propsData, error: propsErr } = await supabase
      .from("properties")
      .select("id, slug, operation, property_type, status, price, price_currency, maintenance_fee, area_built, bedrooms, bathrooms, municipio, featured, exclusive, created_at")
      .order("created_at", { ascending: false });

    if (propsErr) {
      console.error("[Propiedades] Error fetching properties:", propsErr);
      setDbError(`DB Error: ${propsErr.message}`);
      setLoading(false);
      return;
    }

    if (!propsData || propsData.length === 0) {
      console.warn("[Propiedades] 0 rows returned — table may be empty or RLS blocking");
      setAllProps([]);
      setLoading(false);
      return;
    }

    console.log(`[Propiedades] ${propsData.length} properties loaded`);

    const ids = propsData.map(p => p.id);

    // Step 2: traducciones e imágenes en paralelo, sin bloquear si faltan
    const [{ data: translations }, { data: images }] = await Promise.all([
      supabase.from("property_translations").select("property_id, title").in("property_id", ids).eq("locale", "es"),
      supabase.from("property_images").select("property_id, url, is_cover, sort_order").in("property_id", ids),
    ]);

    const titleMap = Object.fromEntries((translations ?? []).map(t => [t.property_id, t.title]));
    const imageMap: Record<string, string | null> = {};
    if (images) {
      for (const img of images) {
        if (!imageMap[img.property_id] || img.is_cover) imageMap[img.property_id] = img.url;
      }
    }

    setAllProps(propsData.map(p => ({
      ...p,
      title: titleMap[p.id] ?? p.slug ?? "Sin título",
      cover_url: imageMap[p.id] ?? null,
    })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const visible = useMemo(() => {
    let list = [...allProps];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.municipio ?? "").toLowerCase().includes(q) ||
        p.slug.includes(q)
      );
    }
    if (filterOp) list = list.filter(p => p.operation === filterOp);
    if (filterStatus) list = list.filter(p => p.status === filterStatus);
    if (filterType) list = list.filter(p => p.property_type === filterType);
    list.sort((a, b) => {
      let va: string | number = a[sortField] ?? "";
      let vb: string | number = b[sortField] ?? "";
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      return sortDir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    return list;
  }, [allProps, search, filterOp, filterStatus, filterType, sortField, sortDir]);

  const toggleSelect = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSelected = visible.length > 0 && visible.every(p => selected.has(p.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(visible.map(p => p.id)));

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("properties").delete().eq("id", id);
    setAllProps(prev => prev.filter(p => p.id !== id));
    setDeleteConfirm(null);
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const handleDuplicate = async (id: string) => {
    const supabase = createClient();
    const prop = allProps.find(p => p.id === id);
    if (!prop) return;
    const newSlug = `${prop.slug}-copy-${Date.now().toString(36)}`;
    const { data: inserted } = await supabase.from("properties").insert({
      slug: newSlug, operation: prop.operation, property_type: prop.property_type,
      status: "activa", price: prop.price, price_currency: prop.price_currency,
      maintenance_fee: prop.maintenance_fee ?? null, area_built: prop.area_built,
      bedrooms: prop.bedrooms, bathrooms: prop.bathrooms ?? null,
      municipio: prop.municipio, featured: false, exclusive: false,
    }).select().single();
    if (inserted) {
      await supabase.from("property_translations").insert({ property_id: inserted.id, locale: "es", title: `${prop.title} (Copia)` });
      fetchAll();
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    const supabase = createClient();
    await supabase.from("properties").delete().in("id", ids);
    setAllProps(prev => prev.filter(p => !selected.has(p.id)));
    setSelected(new Set());
  };

  const handleBulkStatus = async (status: string) => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    const supabase = createClient();
    await supabase.from("properties").update({ status }).in("id", ids);
    setAllProps(prev => prev.map(p => selected.has(p.id) ? { ...p, status } : p));
    setSelected(new Set());
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const activeFilters = [filterOp, filterStatus, filterType].filter(Boolean).length;
  const COLS = "28px 52px 1.6fr 90px 100px 130px 110px 40px";

  const renderContext = (p: Property) => {
    if (p.operation === "alquiler")
      return <span style={{ fontSize: "13px", color: "var(--p-text-2)" }}>{p.maintenance_fee ? `Mant. ${fmt(p.maintenance_fee, p.price_currency)}` : `${p.area_built ?? "—"} m²`}</span>;
    if (p.operation === "vacacional")
      return <span style={{ fontSize: "13px", color: "var(--p-text-2)" }}>{p.bedrooms ?? "—"} hab · {p.bathrooms ?? "—"} baños</span>;
    return <span style={{ fontSize: "13px", color: "var(--p-text-2)" }}>{p.area_built ? `${p.area_built} m²` : "—"}</span>;
  };

  const cardStyle: React.CSSProperties = {
    background: "var(--p-surface)",
    border: "1px solid var(--p-border)",
    borderRadius: "var(--p-radius)",
  };

  const btnGhost: React.CSSProperties = {
    borderRadius: "var(--p-radius)",
    border: "1px solid var(--p-border)",
    color: "var(--p-text-2)",
    padding: "6px 14px",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "none",
    cursor: "pointer",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--p-text)", margin: 0 }}>Propiedades</h2>
          <p style={{ fontSize: "13px", color: "var(--p-text-3)", marginTop: 3 }}>
            {loading ? "Cargando..." : dbError ? dbError : `${visible.length} de ${allProps.length} propiedades`}
          </p>
        </div>
        <button
          onClick={() => router.push(`/${locale}/panel/propiedades/nueva`)}
          style={{ borderRadius: "var(--p-radius)", background: "var(--p-accent)", color: "#090909", padding: "8px 16px", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: 7, border: "none", cursor: "pointer" }}
        >
          <Plus size={14} /> Nueva propiedad
        </button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 8, padding: 8 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--p-text-3)" }} />
          {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "var(--p-text-3)", background: "none", border: "none", cursor: "pointer" }}><X size={11} /></button>}
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título, municipio..."
            style={{ width: "100%", height: 34, paddingLeft: 32, paddingRight: 28, fontSize: "13px", background: "var(--p-surface-2)", border: "1px solid var(--p-border)", borderRadius: "var(--p-radius)", color: "var(--p-text)", outline: "none" }}
          />
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          style={{ height: 34, padding: "0 14px", borderRadius: "var(--p-radius)", background: activeFilters > 0 ? "var(--p-accent-soft)" : "var(--p-surface-2)", border: `1px solid ${activeFilters > 0 ? "var(--p-accent)" : "var(--p-border)"}`, color: activeFilters > 0 ? "var(--p-accent)" : "var(--p-text-2)", fontSize: "13px", display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}
        >
          <SlidersHorizontal size={13} /> Filtros
          {activeFilters > 0 && <span style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--p-accent)", color: "#090909", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{activeFilters}</span>}
        </button>
      </div>

      {/* Bulk actions */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            style={{ ...cardStyle, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "10px 14px" }}
          >
            <span style={{ fontSize: "13px", color: "var(--p-text-2)", marginRight: 6 }}>{selected.size} seleccionadas</span>
            <button style={btnGhost} onClick={() => Array.from(selected).forEach(handleDuplicate).valueOf() || setSelected(new Set())}><Copy size={12} />Duplicar</button>
            <button style={btnGhost} onClick={() => handleBulkStatus("activa")}>Marcar activa</button>
            <button style={btnGhost} onClick={() => handleBulkStatus("reservada")}>Reservar</button>
            <button onClick={handleBulkDelete} style={{ ...btnGhost, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "var(--p-red)" }}><Trash2 size={12} />Eliminar</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtros expandibles */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: "hidden" }}>
            <div style={{ ...cardStyle, display: "flex", flexWrap: "wrap", gap: 16, padding: 16 }}>
              {([
                { label: "Operación", value: filterOp, set: setFilterOp, opts: [["venta","Venta"],["alquiler","Alquiler"],["vacacional","Vacacional"]] },
                { label: "Estado", value: filterStatus, set: setFilterStatus, opts: [["activa","Activa"],["reservada","Reservada"],["vendida","Vendida"],["alquilada","Alquilada"],["cerrada","Cerrada"]] },
                { label: "Tipo", value: filterType, set: setFilterType, opts: [["apartamento","Apartamento"],["casa","Casa"],["townhouse","Townhouse"],["terreno_lote","Terreno"],["local","Local"],["oficina","Oficina"],["galpon","Galpón"]] },
              ] as const).map(({ label, value, set, opts }) => (
                <div key={label}>
                  <p style={{ fontSize: "11px", color: "var(--p-text-3)", marginBottom: 6 }}>{label}</p>
                  <select value={value} onChange={e => (set as (v: string) => void)(e.target.value)}
                    style={{ height: 34, padding: "0 10px", fontSize: "13px", background: value ? "var(--p-accent-soft)" : "var(--p-surface-2)", border: `1px solid ${value ? "var(--p-accent)" : "var(--p-border)"}`, borderRadius: "var(--p-radius)", color: "var(--p-text)", outline: "none", cursor: "pointer" }}
                  >
                    <option value="">Todos</option>
                    {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabla */}
      <div style={{ ...cardStyle, overflow: "hidden" }}>
        {/* Header de columnas */}
        <div style={{ display: "grid", gridTemplateColumns: COLS, alignItems: "center", padding: "10px 16px", borderBottom: "1px solid var(--p-border)", background: "var(--p-surface-2)" }}>
          <button onClick={toggleAll} style={{ display: "flex", background: "none", border: "none", cursor: "pointer" }}>
            {allSelected ? <CheckSquare size={14} style={{ color: "var(--p-accent)" }} /> : <Square size={14} style={{ color: "var(--p-text-3)" }} />}
          </button>
          <span />
          {(["created_at", "Propiedad"] as const).map(() => null)}
          <button style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "11px", color: "var(--p-text-3)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }} onClick={() => toggleSort("created_at")}>Propiedad <ArrowUpDown size={9} /></button>
          <button style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "11px", color: "var(--p-text-3)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }} onClick={() => toggleSort("operation")}>Op. <ArrowUpDown size={9} /></button>
          <button style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "11px", color: "var(--p-text-3)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }} onClick={() => toggleSort("status")}>Estado <ArrowUpDown size={9} /></button>
          <button style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "11px", color: "var(--p-text-3)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }} onClick={() => toggleSort("price")}>Precio <ArrowUpDown size={9} /></button>
          <span style={{ fontSize: "11px", color: "var(--p-text-3)", fontWeight: 500 }}>Datos</span>
          <span />
        </div>

        {/* Filas */}
        {!loading && visible.length > 0 && (
          <LayoutGroup>
            <motion.div layout>
              <AnimatePresence mode="popLayout" initial={false}>
                {visible.map(p => (
                  <div key={p.id}>
                    <motion.div
                      layout layoutId={p.id}
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scaleY: 0.95 }}
                      transition={{ layout: { duration: 0.22, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.12 } }}
                      style={{ display: "grid", gridTemplateColumns: COLS, alignItems: "center", padding: "11px 16px", borderBottom: "1px solid var(--p-border)", cursor: "pointer", background: selected.has(p.id) ? "var(--p-accent-soft)" : "transparent", transition: "background 0.15s" }}
                      whileHover={{ background: selected.has(p.id) ? "var(--p-accent-soft)" : "var(--p-surface-2)" }}
                      onClick={() => setQuickEditId(v => v === p.id ? null : p.id)}
                    >
                      {/* Checkbox */}
                      <button onClick={e => { e.stopPropagation(); toggleSelect(p.id); }} style={{ display: "flex", background: "none", border: "none", cursor: "pointer" }}>
                        {(selected.has(p.id) || selected.size > 0)
                          ? <CheckSquare size={14} style={{ color: selected.has(p.id) ? "var(--p-accent)" : "var(--p-text-3)" }} />
                          : <Square size={14} style={{ color: "var(--p-text-3)" }} />}
                      </button>

                      {/* Thumbnail */}
                      <div style={{ width: 42, height: 30, borderRadius: "3px", overflow: "hidden", background: "var(--p-surface-3)", flexShrink: 0 }}>
                        {p.cover_url
                          ? <img src={p.cover_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Home size={13} style={{ color: "var(--p-text-3)" }} /></div>}
                      </div>

                      {/* Título + badges */}
                      <div style={{ minWidth: 0, paddingRight: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--p-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
                          {p.featured && <span style={{ borderRadius: "3px", background: "rgba(251,176,64,0.12)", color: "#FBB040", fontSize: "9px", fontWeight: 700, padding: "2px 5px", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0 }}>dest</span>}
                          {p.exclusive && <span style={{ borderRadius: "3px", background: "rgba(74,222,128,0.1)", color: "#4ADE80", fontSize: "9px", fontWeight: 700, padding: "2px 5px", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0 }}>excl</span>}
                        </div>
                        <p style={{ fontSize: "12px", color: "var(--p-text-3)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.municipio ?? "Sin ubicación"} · {p.property_type}</p>
                      </div>

                      <span style={{ fontSize: "13px", color: "var(--p-text-2)" }}>{OP_LABEL[p.operation] ?? p.operation}</span>
                      <StatusBadge status={p.status} />
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--p-text)", fontVariantNumeric: "tabular-nums" }}>
                        {fmt(p.price, p.price_currency)}{p.operation === "alquiler" ? "/mes" : p.operation === "vacacional" ? "/noche" : ""}
                      </span>
                      {renderContext(p)}

                      <div style={{ display: "flex", justifyContent: "flex-end" }} onClick={e => e.stopPropagation()}>
                        <RowMenu id={p.id} slug={p.slug} locale={locale} isOpen={openMenuId === p.id} onOpen={setOpenMenuId} onClose={() => setOpenMenuId(null)} onDelete={id => setDeleteConfirm(id)} onDuplicate={handleDuplicate} />
                      </div>
                    </motion.div>

                    <AnimatePresence>
                      {quickEditId === p.id && (
                        <QuickEditRow property={p} onClose={() => setQuickEditId(null)}
                          onSaved={next => setAllProps(prev => prev.map(item => item.id === next.id ? { ...item, ...next } : item))}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        )}

        {/* Empty state */}
        {!loading && visible.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 32px", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: "var(--p-radius)", background: "var(--p-surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Home size={20} style={{ color: "var(--p-text-3)" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--p-text)", margin: 0 }}>{allProps.length === 0 ? "Sin propiedades" : "Sin resultados"}</p>
              <p style={{ fontSize: "12px", color: "var(--p-text-3)", marginTop: 4 }}>{allProps.length === 0 ? "Agrega tu primera propiedad para comenzar" : "Prueba otros filtros o términos de búsqueda"}</p>
              {dbError && <p style={{ fontSize: "12px", color: "var(--p-red)", marginTop: 8 }}>{dbError}</p>}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: 52, borderRadius: "var(--p-radius)", background: "var(--p-surface-2)", opacity: 1 - i * 0.12 }} />
            ))}
          </div>
        )}
      </div>

      {/* Confirm delete modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.7)" }} onClick={() => setDeleteConfirm(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
              style={{ position: "fixed", zIndex: 51, top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 320, padding: 24, background: "var(--p-surface)", border: "1px solid var(--p-border)", borderRadius: "var(--p-radius)", boxShadow: "0 24px 64px rgba(0,0,0,0.8)" }}
            >
              <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--p-text)", marginBottom: 8 }}>¿Eliminar propiedad?</p>
              <p style={{ fontSize: "13px", color: "var(--p-text-2)", marginBottom: 20 }}>Esta acción no se puede deshacer.</p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button onClick={() => setDeleteConfirm(null)} style={{ ...btnGhost }}>Cancelar</button>
                <button onClick={() => handleDelete(deleteConfirm)} style={{ borderRadius: "var(--p-radius)", background: "var(--p-red)", color: "#fff", padding: "7px 16px", fontSize: "13px", fontWeight: 500, border: "none", cursor: "pointer" }}>Eliminar</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
