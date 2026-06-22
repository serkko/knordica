"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Plus, Search, SlidersHorizontal, Eye, Pencil, Trash2,
  Copy, MoreHorizontal, ArrowUpDown, CheckSquare, Square,
  Home, X, Save, Check, ChevronDown,
} from "lucide-react";

interface Property {
  id: string;
  slug: string;
  operation: string;
  property_type: string;
  status: string;
  price: number;
  price_currency: string;
  area_built: number | null;
  area_total: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  half_bathrooms: number | null;
  parking_spaces: number | null;
  municipio: string | null;
  featured: boolean;
  exclusive: boolean;
  price_negotiable: boolean;
  created_at: string;
  cover_url?: string | null;
  title: string;
  savedFlash?: boolean;
}

type SortField = "created_at" | "price" | "status" | "operation";
type SortDir = "asc" | "desc";

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  activa:    { label: "Activa",    color: "#4ADE80", bg: "rgba(74,222,128,0.12)",  border: "rgba(74,222,128,0.25)" },
  reservada: { label: "Reservada", color: "#FBB040", bg: "rgba(251,176,64,0.12)", border: "rgba(251,176,64,0.25)" },
  vendida:   { label: "Vendida",   color: "#A78BFA", bg: "rgba(167,139,250,0.12)",border: "rgba(167,139,250,0.25)" },
  alquilada: { label: "Alquilada", color: "#60A5FA", bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.25)" },
  cerrada:   { label: "Cerrada",   color: "#71717A", bg: "rgba(113,113,122,0.12)",border: "rgba(113,113,122,0.25)" },
};

const OP_LABEL: Record<string, string> = {
  venta: "Venta",
  alquiler: "Alquiler",
  vacacional: "Vacacional",
};

const PROP_TYPE_LABEL: Record<string, string> = {
  casa: "Casa",
  apartamento: "Apartamento",
  townhouse: "Townhouse",
  anexo: "Anexo",
  edificio: "Edificio",
  galpon: "Galpón",
  habitacion: "Habitación",
  hacienda_finca: "Hacienda / Finca",
  local: "Local comercial",
  oficina: "Oficina",
  terreno_lote: "Terreno / Lote",
};

const MUNICIPIOS = [
  "libertador", "campo_elias", "santos_marquina", "sucre", "rangel",
];
const MUNICIPIO_LABEL: Record<string, string> = {
  libertador: "Libertador",
  campo_elias: "Campo Elías",
  santos_marquina: "Santos Marquina",
  sucre: "Sucre",
  rangel: "Rangel",
};

function fmtUSD(price: number) {
  return "$" + Math.round(price).toLocaleString("en-US");
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_CFG[status] ?? STATUS_CFG.cerrada;
  return (
    <span style={{
      borderRadius: "4px",
      color: s.color,
      background: s.bg,
      border: `1px solid ${s.border}`,
      fontSize: "11px",
      fontWeight: 600,
      padding: "3px 8px",
      whiteSpace: "nowrap",
      display: "inline-flex",
      alignItems: "center",
      lineHeight: 1,
    }}>
      {s.label}
    </span>
  );
}

// ─── Quick Edit ───────────────────────────────────────────────────────────────
function QuickEditRow({ property, onClose, onSaved }: {
  property: Property;
  onClose: () => void;
  onSaved: (next: Partial<Property> & { id: string }) => void;
}) {
  const [title, setTitle]           = useState(property.title);
  const [price, setPrice]           = useState(String(Math.round(property.price ?? 0)));
  const [status, setStatus]         = useState(property.status);
  const [operation, setOperation]   = useState(property.operation);
  const [propType, setPropType]     = useState(property.property_type);
  const [municipio, setMunicipio]   = useState(property.municipio ?? "");
  const [bedrooms, setBedrooms]     = useState(String(property.bedrooms ?? ""));
  const [bathrooms, setBathrooms]   = useState(String(property.bathrooms ?? ""));
  const [halfBath, setHalfBath]     = useState(String(property.half_bathrooms ?? ""));
  const [parking, setParking]       = useState(String(property.parking_spaces ?? ""));
  const [areaBuilt, setAreaBuilt]   = useState(String(property.area_built ?? ""));
  const [areaTotal, setAreaTotal]   = useState(String(property.area_total ?? ""));
  const [featured, setFeatured]     = useState(property.featured);
  const [exclusive, setExclusive]   = useState(property.exclusive);
  const [negotiable, setNegotiable] = useState(property.price_negotiable);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);

  const inputS: React.CSSProperties = {
    background: "var(--p-surface-3)",
    border: "1px solid var(--p-border)",
    borderRadius: "var(--p-radius)",
    color: "var(--p-text)",
    height: "34px",
    padding: "0 10px",
    fontSize: "13px",
    width: "100%",
    outline: "none",
    WebkitAppearance: "none",
  };

  const numS: React.CSSProperties = { ...inputS, width: "100%", textAlign: "center" };

  const label = (text: string) => (
    <p style={{ fontSize: "11px", color: "var(--p-text-3)", marginBottom: 5, fontWeight: 500 }}>{text}</p>
  );

  const toggle = (active: boolean, onClick: () => void, labelText: string) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 6, height: 34, padding: "0 12px", borderRadius: "var(--p-radius)",
        border: `1px solid ${active ? "var(--p-accent)" : "var(--p-border)"}`,
        background: active ? "var(--p-accent-soft)" : "var(--p-surface-3)",
        color: active ? "var(--p-accent)" : "var(--p-text-3)",
        fontSize: "12px", fontWeight: active ? 600 : 400,
        cursor: "pointer", width: "100%",
        transition: "all 0.15s",
      }}
    >
      {active && <Check size={11} />}
      {labelText}
    </button>
  );

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();

    const updates: Record<string, unknown> = {
      price:           Number(price) || 0,
      price_currency:  "USD",
      status,
      operation,
      property_type:   propType,
      municipio:       municipio || null,
      bedrooms:        bedrooms  !== "" ? Number(bedrooms)  : null,
      bathrooms:       bathrooms !== "" ? Number(bathrooms) : null,
      half_bathrooms:  halfBath  !== "" ? Number(halfBath)  : null,
      parking_spaces:  parking   !== "" ? Number(parking)   : null,
      area_built:      areaBuilt !== "" ? Number(areaBuilt) : null,
      area_total:      areaTotal !== "" ? Number(areaTotal) : null,
      featured,
      exclusive,
      price_negotiable: negotiable,
    };

    const [{ error: propErr }, { error: transErr }] = await Promise.all([
      supabase.from("properties").update(updates).eq("id", property.id),
      supabase.from("property_translations").update({ title }).eq("property_id", property.id).eq("locale", "es"),
    ]);

    if (!propErr && !transErr) {
      setSaved(true);
      onSaved({
        id: property.id, title,
        price: Number(price) || 0,
        price_currency: "USD",
        status, operation,
        property_type: propType,
        municipio:     municipio || null,
        bedrooms:      bedrooms  !== "" ? Number(bedrooms)  : null,
        bathrooms:     bathrooms !== "" ? Number(bathrooms) : null,
        half_bathrooms:halfBath  !== "" ? Number(halfBath)  : null,
        parking_spaces:parking   !== "" ? Number(parking)   : null,
        area_built:    areaBuilt !== "" ? Number(areaBuilt) : null,
        area_total:    areaTotal !== "" ? Number(areaTotal) : null,
        featured, exclusive, price_negotiable: negotiable,
        savedFlash: true,
      });
      setTimeout(() => { onClose(); }, 900);
    } else {
      console.error("Quick edit error:", propErr?.message ?? transErr?.message);
      setSaving(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={{ overflow: "hidden", borderBottom: "1px solid var(--p-border)", background: "var(--p-surface-2)" }}
    >
      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Fila 1: Título */}
        <div>
          {label("Título de la publicación")}
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ ...inputS, width: "100%" }}
            placeholder="Sin título"
          />
        </div>

        {/* Fila 2: Precio + Operación + Estado */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 160px", gap: 12 }}>
          <div>
            {label("Precio (USD)")}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "var(--p-text-3)", pointerEvents: "none" }}>$</span>
              <input
                value={price}
                onChange={e => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
                type="text"
                inputMode="numeric"
                style={{ ...inputS, paddingLeft: 22 }}
                placeholder="0"
              />
            </div>
          </div>
          <div>
            {label("Operación")}
            <select value={operation} onChange={e => setOperation(e.target.value)} style={inputS}>
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
              <option value="vacacional">Vacacional</option>
            </select>
          </div>
          <div>
            {label("Estado")}
            <select value={status} onChange={e => setStatus(e.target.value)} style={inputS}>
              <option value="activa">Activa</option>
              <option value="reservada">Reservada</option>
              <option value="vendida">Vendida</option>
              <option value="alquilada">Alquilada</option>
              <option value="cerrada">Cerrada</option>
            </select>
          </div>
        </div>

        {/* Fila 3: Tipo + Municipio */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            {label("Tipo de propiedad")}
            <select value={propType} onChange={e => setPropType(e.target.value)} style={inputS}>
              {Object.entries(PROP_TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            {label("Municipio")}
            <select value={municipio} onChange={e => setMunicipio(e.target.value)} style={inputS}>
              <option value="">Sin especificar</option>
              {MUNICIPIOS.map(m => <option key={m} value={m}>{MUNICIPIO_LABEL[m]}</option>)}
            </select>
          </div>
        </div>

        {/* Fila 4: Habitaciones, Baños, Medio baño, Estacionamiento */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <div>{label("Habitaciones")}<input value={bedrooms} onChange={e => setBedrooms(e.target.value)} type="number" min="0" style={numS} placeholder="—" /></div>
          <div>{label("Baños")}<input value={bathrooms} onChange={e => setBathrooms(e.target.value)} type="number" min="0" style={numS} placeholder="—" /></div>
          <div>{label("Medio baño")}<input value={halfBath} onChange={e => setHalfBath(e.target.value)} type="number" min="0" style={numS} placeholder="—" /></div>
          <div>{label("Estacionamiento")}<input value={parking} onChange={e => setParking(e.target.value)} type="number" min="0" style={numS} placeholder="—" /></div>
        </div>

        {/* Fila 5: Área construida + Área total */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            {label("Área construida (m²)")}
            <input value={areaBuilt} onChange={e => setAreaBuilt(e.target.value)} type="number" min="0" style={inputS} placeholder="—" />
          </div>
          <div>
            {label("Área total (m²)")}
            <input value={areaTotal} onChange={e => setAreaTotal(e.target.value)} type="number" min="0" style={inputS} placeholder="—" />
          </div>
        </div>

        {/* Fila 6: Toggles */}
        <div>
          {label("Destacados")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {toggle(featured,    () => setFeatured(v => !v),    "Destacada")}
            {toggle(exclusive,   () => setExclusive(v => !v),  "Exclusiva")}
            {toggle(negotiable,  () => setNegotiable(v => !v), "Precio negociable")}
          </div>
        </div>

      </div>

      {/* Footer botones */}
      <div style={{ padding: "0 20px 18px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button
          onClick={onClose}
          style={{ borderRadius: "var(--p-radius)", border: "1px solid var(--p-border)", color: "var(--p-text-2)", padding: "7px 16px", fontSize: "13px", background: "none", cursor: "pointer" }}
        >Cancelar</button>
        <button
          onClick={handleSave}
          disabled={saving || saved}
          style={{
            borderRadius: "var(--p-radius)",
            background: saved ? "rgba(74,222,128,0.15)" : "var(--p-accent)",
            color: saved ? "#4ADE80" : "#090909",
            border: saved ? "1px solid rgba(74,222,128,0.3)" : "none",
            padding: "7px 18px", fontSize: "13px", fontWeight: 600,
            display: "flex", alignItems: "center", gap: 7,
            cursor: saving || saved ? "default" : "pointer",
            transition: "all 0.3s",
          }}
        >
          {saved
            ? <><Check size={13} /> Guardado</>
            : saving
              ? "Guardando..."
              : <><Save size={12} /> Guardar cambios</>
          }
        </button>
      </div>
    </motion.div>
  );
}

// ─── Row menu ─────────────────────────────────────────────────────────────────
function RowMenu({ id, slug, locale, isOpen, onOpen, onClose, onDelete, onDuplicate }: {
  id: string; slug: string; locale: string; isOpen: boolean;
  onOpen: (id: string) => void; onClose: () => void;
  onDelete: (id: string) => void; onDuplicate: (id: string) => void;
}) {
  const router = useRouter();
  const items: { icon: React.ElementType; label: string; action: () => void; danger?: boolean }[] = [
    { icon: Eye,    label: "Ver en sitio", action: () => window.open(`/${locale}/${slug}`, "_blank") },
    { icon: Pencil, label: "Editar completo", action: () => router.push(`/${locale}/panel/propiedades/${id}/editar`) },
    { icon: Copy,   label: "Duplicar",     action: () => onDuplicate(id) },
    { icon: Trash2, label: "Eliminar",     action: () => onDelete(id), danger: true },
  ];
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={e => { e.stopPropagation(); isOpen ? onClose() : onOpen(id); }}
        style={{ width: 28, height: 28, borderRadius: "var(--p-radius)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--p-text-3)", background: isOpen ? "var(--p-surface-3)" : "transparent", border: "none", cursor: "pointer" }}
      >
        <MoreHorizontal size={15} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={onClose} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ duration: 0.1 }}
              style={{ position: "absolute", right: 0, top: 32, zIndex: 50, minWidth: 180, background: "var(--p-surface-2)", border: "1px solid var(--p-border)", borderRadius: "var(--p-radius)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", padding: "4px 0" }}
            >
              {items.map(({ icon: Icon, label, action, danger }) => (
                <button key={label}
                  onClick={e => { e.stopPropagation(); action(); onClose(); }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", fontSize: "13px", color: danger ? "var(--p-red)" : "var(--p-text-2)", background: "none", border: "none", cursor: "pointer" }}
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

// ─── Chip de filtro activo ────────────────────────────────────────────────────
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 8px 3px 10px", borderRadius: "var(--p-radius-full, 9999px)",
      background: "var(--p-accent-soft)", border: "1px solid var(--p-accent)",
      color: "var(--p-accent)", fontSize: "12px", fontWeight: 500,
    }}>
      {label}
      <button onClick={onRemove} style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "var(--p-accent)", padding: 0, opacity: 0.7 }}>
        <X size={10} />
      </button>
    </span>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function PropiedadesPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "es";

  const [allProps, setAllProps] = useState<Property[]>([]);
  const [loading, setLoading]   = useState(true);
  const [dbError, setDbError]   = useState<string | null>(null);

  const [search, setSearch]           = useState("");
  const [filterOp, setFilterOp]       = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType]   = useState("");
  const [filterMunicipio, setFilterMunicipio] = useState("");

  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir]     = useState<SortDir>("desc");
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId]   = useState<string | null>(null);
  const [quickEditId, setQuickEditId] = useState<string | null>(null);
  const [flashIds, setFlashIds]       = useState<Set<string>>(new Set());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setDbError(null);
    const supabase = createClient();

    const { data: propsData, error: propsErr } = await supabase
      .from("properties")
      .select(`
        id, slug, operation, property_type, status,
        price, price_currency,
        area_built, area_total,
        bedrooms, bathrooms, half_bathrooms, parking_spaces,
        municipio, featured, exclusive, price_negotiable, created_at
      `)
      .order("created_at", { ascending: false });

    if (propsErr) {
      setDbError(`Error: ${propsErr.message}`);
      setLoading(false);
      return;
    }

    if (!propsData || propsData.length === 0) {
      setAllProps([]);
      setLoading(false);
      return;
    }

    const ids = propsData.map(p => p.id);
    const [{ data: translations }, { data: images }] = await Promise.all([
      supabase.from("property_translations").select("property_id, title").in("property_id", ids).eq("locale", "es"),
      supabase.from("property_images").select("property_id, url, is_cover").in("property_id", ids),
    ]);

    const titleMap = Object.fromEntries((translations ?? []).map(t => [t.property_id, t.title]));
    const imageMap: Record<string, string | null> = {};
    for (const img of (images ?? [])) {
      if (!imageMap[img.property_id] || img.is_cover) imageMap[img.property_id] = img.url;
    }

    setAllProps(propsData.map(p => ({
      ...p,
      price_negotiable: p.price_negotiable ?? false,
      half_bathrooms: p.half_bathrooms ?? null,
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
    if (filterOp)        list = list.filter(p => p.operation === filterOp);
    if (filterStatus)    list = list.filter(p => p.status === filterStatus);
    if (filterType)      list = list.filter(p => p.property_type === filterType);
    if (filterMunicipio) list = list.filter(p => p.municipio === filterMunicipio);
    list.sort((a, b) => {
      let va: string | number = (a[sortField] ?? "") as string | number;
      let vb: string | number = (b[sortField] ?? "") as string | number;
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      return sortDir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    return list;
  }, [allProps, search, filterOp, filterStatus, filterType, filterMunicipio, sortField, sortDir]);

  const toggleSelect = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSelected  = visible.length > 0 && visible.every(p => selected.has(p.id));
  const toggleAll    = () => setSelected(allSelected ? new Set() : new Set(visible.map(p => p.id)));

  const handleDelete = async (id: string) => {
    await createClient().from("properties").delete().eq("id", id);
    setAllProps(prev => prev.filter(p => p.id !== id));
    setDeleteConfirm(null);
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const handleDuplicate = async (id: string) => {
    const supabase = createClient();
    const prop = allProps.find(p => p.id === id);
    if (!prop) return;
    const newSlug = `${prop.slug}-copia-${Date.now().toString(36)}`;
    const { data: inserted, error } = await supabase
      .from("properties")
      .insert({
        slug: newSlug,
        operation: prop.operation,
        property_type: prop.property_type,
        status: "activa",
        price: prop.price,
        price_currency: prop.price_currency ?? "USD",
        area_built: prop.area_built,
        area_total: prop.area_total,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        parking_spaces: prop.parking_spaces,
        municipio: prop.municipio,
        featured: false,
        exclusive: false,
        price_negotiable: false,
      })
      .select()
      .single();

    if (error) {
      console.error("[Duplicar] Error:", error.message);
      return;
    }
    if (inserted) {
      await supabase.from("property_translations").insert({
        property_id: inserted.id,
        locale: "es",
        title: `${prop.title} (Copia)`,
        description: null,
        short_description: null,
      });
      fetchAll();
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    await createClient().from("properties").delete().in("id", ids);
    setAllProps(prev => prev.filter(p => !selected.has(p.id)));
    setSelected(new Set());
  };

  const handleBulkStatus = async (status: string) => {
    const ids = Array.from(selected);
    await createClient().from("properties").update({ status }).in("id", ids);
    setAllProps(prev => prev.map(p => selected.has(p.id) ? { ...p, status } : p));
    setSelected(new Set());
  };

  const handleSaved = (next: Partial<Property> & { id: string }) => {
    setAllProps(prev => prev.map(p => p.id === next.id ? { ...p, ...next } : p));
    // Flash verde en la fila
    setFlashIds(prev => new Set(prev).add(next.id));
    setTimeout(() => setFlashIds(prev => { const n = new Set(prev); n.delete(next.id); return n; }), 2200);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const activeFilters = [filterOp, filterStatus, filterType, filterMunicipio].filter(Boolean);
  const COLS = "28px 52px 1.6fr 100px 110px 130px 110px 40px";

  const renderDatos = (p: Property) => {
    const parts: string[] = [];
    if (p.bedrooms   != null) parts.push(`${p.bedrooms} hab`);
    if (p.bathrooms  != null) parts.push(`${p.bathrooms} baños`);
    if (p.area_built != null) parts.push(`${p.area_built} m²`);
    else if (p.area_total != null) parts.push(`${p.area_total} m²`);
    return <span style={{ fontSize: "12px", color: "var(--p-text-3)" }}>{parts.join(" · ") || "—"}</span>;
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

  const selectStyle = (active: boolean): React.CSSProperties => ({
    height: 34,
    padding: "0 28px 0 10px",
    fontSize: "13px",
    background: active ? "var(--p-accent-soft)" : "var(--p-surface-2)",
    border: `1px solid ${active ? "var(--p-accent)" : "var(--p-border)"}`,
    borderRadius: "var(--p-radius)",
    color: active ? "var(--p-accent)" : "var(--p-text-2)",
    outline: "none",
    cursor: "pointer",
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "calc(100% - 8px) center",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--p-text)", margin: 0 }}>Propiedades</h2>
          <p style={{ fontSize: "13px", color: "var(--p-text-3)", marginTop: 3 }}>
            {loading ? "Cargando..."
              : dbError ? <span style={{ color: "var(--p-red)" }}>{dbError}</span>
              : `${visible.length} de ${allProps.length} propiedades`}
          </p>
        </div>
        <button
          onClick={() => router.push(`/${locale}/panel/propiedades/nueva`)}
          style={{ borderRadius: "var(--p-radius)", background: "var(--p-accent)", color: "#090909", padding: "8px 16px", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: 7, border: "none", cursor: "pointer" }}
        >
          <Plus size={14} /> Nueva propiedad
        </button>
      </div>

      {/* Barra busqueda + filtros */}
      <div style={{ ...cardStyle, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: 8 }}>
        {/* Buscador */}
        <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 360 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--p-text-3)", pointerEvents: "none" }} />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "var(--p-text-3)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <X size={11} />
            </button>
          )}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título, municipio..."
            style={{ width: "100%", height: 34, paddingLeft: 32, paddingRight: 28, fontSize: "13px", background: "var(--p-surface-2)", border: "1px solid var(--p-border)", borderRadius: "var(--p-radius)", color: "var(--p-text)", outline: "none" }}
          />
        </div>

        {/* Filtros inline */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <select value={filterOp} onChange={e => setFilterOp(e.target.value)} style={selectStyle(!!filterOp)}>
            <option value="">Operación</option>
            <option value="venta">Venta</option>
            <option value="alquiler">Alquiler</option>
            <option value="vacacional">Vacacional</option>
          </select>

          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle(!!filterStatus)}>
            <option value="">Estado</option>
            <option value="activa">Activa</option>
            <option value="reservada">Reservada</option>
            <option value="vendida">Vendida</option>
            <option value="alquilada">Alquilada</option>
            <option value="cerrada">Cerrada</option>
          </select>

          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={selectStyle(!!filterType)}>
            <option value="">Tipo</option>
            {Object.entries(PROP_TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>

          <select value={filterMunicipio} onChange={e => setFilterMunicipio(e.target.value)} style={selectStyle(!!filterMunicipio)}>
            <option value="">Municipio</option>
            {MUNICIPIOS.map(m => <option key={m} value={m}>{MUNICIPIO_LABEL[m]}</option>)}
          </select>

          {activeFilters.length > 0 && (
            <button
              onClick={() => { setFilterOp(""); setFilterStatus(""); setFilterType(""); setFilterMunicipio(""); }}
              style={{ height: 34, padding: "0 12px", borderRadius: "var(--p-radius)", border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.08)", color: "var(--p-red)", fontSize: "12px", display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}
            >
              <X size={10} /> Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Chips de filtros activos */}
      <AnimatePresence>
        {activeFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ display: "flex", flexWrap: "wrap", gap: 6, overflow: "hidden" }}
          >
            {filterOp        && <FilterChip label={`Operación: ${OP_LABEL[filterOp] ?? filterOp}`}             onRemove={() => setFilterOp("")} />}
            {filterStatus    && <FilterChip label={`Estado: ${STATUS_CFG[filterStatus]?.label ?? filterStatus}`} onRemove={() => setFilterStatus("")} />}
            {filterType      && <FilterChip label={`Tipo: ${PROP_TYPE_LABEL[filterType] ?? filterType}`}        onRemove={() => setFilterType("")} />}
            {filterMunicipio && <FilterChip label={`Municipio: ${MUNICIPIO_LABEL[filterMunicipio] ?? filterMunicipio}`} onRemove={() => setFilterMunicipio("")} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk actions */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            style={{ ...cardStyle, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "10px 14px" }}
          >
            <span style={{ fontSize: "13px", color: "var(--p-text-2)", marginRight: 6 }}>{selected.size} seleccionadas</span>
            <button style={btnGhost} onClick={() => { Array.from(selected).forEach(handleDuplicate); setSelected(new Set()); }}><Copy size={12} />Duplicar</button>
            <button style={btnGhost} onClick={() => handleBulkStatus("activa")}>Marcar activa</button>
            <button style={btnGhost} onClick={() => handleBulkStatus("reservada")}>Marcar reservada</button>
            <button onClick={handleBulkDelete} style={{ ...btnGhost, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "var(--p-red)" }}><Trash2 size={12} />Eliminar</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabla */}
      <div style={{ ...cardStyle, overflow: "hidden" }}>

        {/* Encabezado columnas */}
        <div style={{ display: "grid", gridTemplateColumns: COLS, alignItems: "center", padding: "10px 16px", borderBottom: "1px solid var(--p-border)", background: "var(--p-surface-2)" }}>
          <button onClick={toggleAll} style={{ display: "flex", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            {allSelected
              ? <CheckSquare size={14} style={{ color: "var(--p-accent)" }} />
              : <Square size={14} style={{ color: "var(--p-text-3)" }} />}
          </button>
          <span />
          <button style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "11px", color: "var(--p-text-3)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }} onClick={() => toggleSort("created_at")}>Propiedad <ArrowUpDown size={9} /></button>
          <button style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "11px", color: "var(--p-text-3)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }} onClick={() => toggleSort("operation")}>Operación <ArrowUpDown size={9} /></button>
          <button style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "11px", color: "var(--p-text-3)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }} onClick={() => toggleSort("status")}>Estado <ArrowUpDown size={9} /></button>
          <button style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "11px", color: "var(--p-text-3)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }} onClick={() => toggleSort("price")}>Precio <ArrowUpDown size={9} /></button>
          <span style={{ fontSize: "11px", color: "var(--p-text-3)", fontWeight: 500 }}>Datos</span>
          <span />
        </div>

        {/* Skeleton loading */}
        {loading && (
          <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 1 }}>
            {[...Array(10)].map((_, i) => (
              <div key={i} style={{ height: 52, display: "flex", alignItems: "center", gap: 12, opacity: 1 - i * 0.08 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: "var(--p-surface-3)" }} />
                <div style={{ width: 42, height: 30, borderRadius: 3, background: "var(--p-surface-3)" }} />
                <div style={{ flex: 1, height: 14, borderRadius: 3, background: "var(--p-surface-3)", maxWidth: 280 }} />
                <div style={{ width: 70, height: 14, borderRadius: 3, background: "var(--p-surface-3)" }} />
                <div style={{ width: 70, height: 20, borderRadius: 3, background: "var(--p-surface-3)" }} />
                <div style={{ width: 90, height: 14, borderRadius: 3, background: "var(--p-surface-3)" }} />
              </div>
            ))}
          </div>
        )}

        {/* Filas */}
        {!loading && visible.length > 0 && (
          <LayoutGroup>
            <motion.div layout>
              <AnimatePresence mode="popLayout" initial={false}>
                {visible.map(p => {
                  const isFlash = flashIds.has(p.id);
                  return (
                    <div key={p.id}>
                      <motion.div
                        layout
                        layoutId={p.id}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          backgroundColor: isFlash
                            ? "rgba(74,222,128,0.07)"
                            : selected.has(p.id)
                              ? "var(--p-accent-soft)"
                              : "rgba(0,0,0,0)",
                        }}
                        exit={{ opacity: 0, scaleY: 0.95 }}
                        transition={{ layout: { duration: 0.22, ease: [0.16,1,0.3,1] }, opacity: { duration: 0.12 }, backgroundColor: { duration: 0.6 } }}
                        style={{
                          display: "grid",
                          gridTemplateColumns: COLS,
                          alignItems: "center",
                          padding: "11px 16px",
                          borderBottom: "1px solid var(--p-border)",
                          cursor: "pointer",
                          outline: isFlash ? "1px solid rgba(74,222,128,0.2)" : "none",
                          outlineOffset: "-1px",
                          transition: "outline 0.6s",
                        }}
                        onClick={() => setQuickEditId(v => v === p.id ? null : p.id)}
                      >
                        {/* Checkbox */}
                        <button onClick={e => { e.stopPropagation(); toggleSelect(p.id); }} style={{ display: "flex", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                          {selected.has(p.id) || selected.size > 0
                            ? <CheckSquare size={14} style={{ color: selected.has(p.id) ? "var(--p-accent)" : "var(--p-text-3)" }} />
                            : <Square size={14} style={{ color: "var(--p-text-3)" }} />}
                        </button>

                        {/* Miniatura */}
                        <div style={{ width: 42, height: 30, borderRadius: "3px", overflow: "hidden", background: "var(--p-surface-3)", flexShrink: 0 }}>
                          {p.cover_url
                            ? <img src={p.cover_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Home size={13} style={{ color: "var(--p-text-3)" }} /></div>}
                        </div>

                        {/* Nombre + badges */}
                        <div style={{ minWidth: 0, paddingRight: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--p-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
                            {p.featured  && <span style={{ borderRadius: "3px", background: "rgba(251,176,64,0.12)", color: "#FBB040", border: "1px solid rgba(251,176,64,0.2)", fontSize: "9px", fontWeight: 700, padding: "2px 5px", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0 }}>Destacada</span>}
                            {p.exclusive && <span style={{ borderRadius: "3px", background: "rgba(74,222,128,0.1)",   color: "#4ADE80",  border: "1px solid rgba(74,222,128,0.2)",  fontSize: "9px", fontWeight: 700, padding: "2px 5px", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0 }}>Exclusiva</span>}
                          </div>
                          <p style={{ fontSize: "12px", color: "var(--p-text-3)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.municipio ? MUNICIPIO_LABEL[p.municipio] ?? p.municipio : "Sin ubicación"} · {PROP_TYPE_LABEL[p.property_type] ?? p.property_type}
                          </p>
                        </div>

                        {/* Operación */}
                        <span style={{ fontSize: "13px", color: "var(--p-text-2)" }}>{OP_LABEL[p.operation] ?? p.operation}</span>

                        {/* Estado */}
                        <StatusBadge status={p.status} />

                        {/* Precio */}
                        <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--p-text)", fontVariantNumeric: "tabular-nums" }}>
                          {fmtUSD(p.price)}
                          {p.operation === "alquiler" ? "/mes" : p.operation === "vacacional" ? "/noche" : ""}
                          {p.price_negotiable && <span style={{ fontSize: "10px", color: "var(--p-text-3)", marginLeft: 4 }}>neg.</span>}
                        </span>

                        {/* Datos */}
                        {renderDatos(p)}

                        {/* Menú */}
                        <div style={{ display: "flex", justifyContent: "flex-end" }} onClick={e => e.stopPropagation()}>
                          <RowMenu
                            id={p.id} slug={p.slug} locale={locale}
                            isOpen={openMenuId === p.id}
                            onOpen={setOpenMenuId}
                            onClose={() => setOpenMenuId(null)}
                            onDelete={id => setDeleteConfirm(id)}
                            onDuplicate={handleDuplicate}
                          />
                        </div>
                      </motion.div>

                      {/* Quick edit expandible */}
                      <AnimatePresence>
                        {quickEditId === p.id && (
                          <QuickEditRow
                            property={p}
                            onClose={() => setQuickEditId(null)}
                            onSaved={next => { handleSaved(next); setQuickEditId(null); }}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        )}

        {/* Empty state */}
        {!loading && visible.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 32px", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: "var(--p-radius)", background: "var(--p-surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Home size={20} style={{ color: "var(--p-text-3)" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--p-text)", margin: 0 }}>{allProps.length === 0 ? "Sin propiedades" : "Sin resultados"}</p>
              <p style={{ fontSize: "12px", color: "var(--p-text-3)", marginTop: 4 }}>{allProps.length === 0 ? "Agrega tu primera propiedad para comenzar" : "Intenta con otros filtros o busca por nombre"}</p>
              {dbError && <p style={{ fontSize: "12px", color: "var(--p-red)", marginTop: 8, fontFamily: "monospace" }}>{dbError}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Modal confirmación eliminar */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.7)" }}
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              style={{ position: "fixed", zIndex: 51, top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 320, padding: 24, background: "var(--p-surface)", border: "1px solid var(--p-border)", borderRadius: "var(--p-radius)", boxShadow: "0 24px 64px rgba(0,0,0,0.8)" }}
            >
              <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--p-text)", marginBottom: 8 }}>¿Eliminar propiedad?</p>
              <p style={{ fontSize: "13px", color: "var(--p-text-2)", marginBottom: 20 }}>Esta acción no se puede deshacer y eliminará la propiedad permanentemente.</p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button onClick={() => setDeleteConfirm(null)} style={btnGhost}>Cancelar</button>
                <button onClick={() => handleDelete(deleteConfirm)} style={{ borderRadius: "var(--p-radius)", background: "var(--p-red)", color: "#fff", padding: "7px 16px", fontSize: "13px", fontWeight: 500, border: "none", cursor: "pointer" }}>Eliminar</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
