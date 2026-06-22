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
  Save,
  ChevronDown,
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
  activa: { label: "Activa", color: "#5A9E6F", bg: "rgba(90,158,111,0.12)" },
  reservada: { label: "Reservada", color: "#D4924A", bg: "rgba(212,146,74,0.12)" },
  vendida: { label: "Vendida", color: "#7A6EAA", bg: "rgba(122,110,170,0.12)" },
  alquilada: { label: "Alquilada", color: "#4A8FC4", bg: "rgba(74,143,196,0.12)" },
  cerrada: { label: "Cerrada", color: "#888", bg: "rgba(136,136,136,0.1)" },
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
      currency: currency === "VES" ? "USD" : currency || "USD",
      maximumFractionDigits: 0,
    })
      .format(price)
      .replace("US$", "$");
  } catch {
    return `$${price.toLocaleString()}`;
  }
}

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

function QuickEditRow({
  property,
  onClose,
  onSaved,
}: {
  property: Property;
  onClose: () => void;
  onSaved: (next: Partial<Property> & { id: string; title?: string }) => void;
}) {
  const [title, setTitle] = useState(property.title);
  const [price, setPrice] = useState(String(property.price ?? ""));
  const [status, setStatus] = useState(property.status);
  const [operation, setOperation] = useState(property.operation);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();

    await supabase
      .from("properties")
      .update({
        price: Number(price) || 0,
        status,
        operation,
      })
      .eq("id", property.id);

    await supabase
      .from("property_translations")
      .update({ title })
      .eq("property_id", property.id)
      .eq("locale", "es");

    onSaved({ id: property.id, title, price: Number(price) || 0, status, operation });
    setSaving(false);
    onClose();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      style={{
        overflow: "hidden",
        borderBottom: "1px solid var(--p-border)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div className="px-6 py-4 grid grid-cols-4 gap-3">
        <div className="col-span-2">
          <p className="text-[10px] mb-1.5" style={{ color: "var(--p-text-3)" }}>
            Título
          </p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-9 px-3 text-[12px] outline-none"
            style={{
              background: "var(--p-surface-2)",
              border: "1px solid var(--p-border)",
              borderRadius: "var(--p-radius)",
              color: "var(--p-text)",
            }}
          />
        </div>
        <div>
          <p className="text-[10px] mb-1.5" style={{ color: "var(--p-text-3)" }}>
            Precio
          </p>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            className="w-full h-9 px-3 text-[12px] outline-none"
            style={{
              background: "var(--p-surface-2)",
              border: "1px solid var(--p-border)",
              borderRadius: "var(--p-radius)",
              color: "var(--p-text)",
            }}
          />
        </div>
        <div>
          <p className="text-[10px] mb-1.5" style={{ color: "var(--p-text-3)" }}>
            Estado
          </p>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full h-9 px-3 text-[12px] outline-none"
            style={{
              background: "var(--p-surface-2)",
              border: "1px solid var(--p-border)",
              borderRadius: "var(--p-radius)",
              color: "var(--p-text)",
            }}
          >
            <option value="activa">Activa</option>
            <option value="reservada">Reservada</option>
            <option value="vendida">Vendida</option>
            <option value="alquilada">Alquilada</option>
            <option value="cerrada">Cerrada</option>
          </select>
        </div>
        <div>
          <p className="text-[10px] mb-1.5" style={{ color: "var(--p-text-3)" }}>
            Operación
          </p>
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            className="w-full h-9 px-3 text-[12px] outline-none"
            style={{
              background: "var(--p-surface-2)",
              border: "1px solid var(--p-border)",
              borderRadius: "var(--p-radius)",
              color: "var(--p-text)",
            }}
          >
            <option value="venta">Venta</option>
            <option value="alquiler">Alquiler</option>
            <option value="vacacional">Vacacional</option>
          </select>
        </div>
        <div className="col-span-4 flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="px-3 h-8 text-[12px]"
            style={{
              borderRadius: "var(--p-radius)",
              border: "1px solid var(--p-border)",
              color: "var(--p-text-2)",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-3 h-8 text-[12px] flex items-center gap-1.5"
            style={{
              borderRadius: "var(--p-radius)",
              background: "var(--p-accent)",
              color: "#0E0D0C",
            }}
          >
            <Save size={12} />
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function RowMenu({
  id,
  slug,
  locale,
  isOpen,
  onOpen,
  onClose,
  onDelete,
  onDuplicate,
}: {
  id: string;
  slug: string;
  locale: string;
  isOpen: boolean;
  onOpen: (id: string) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const router = useRouter();

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          isOpen ? onClose() : onOpen(id);
        }}
        className="w-7 h-7 flex items-center justify-center"
        style={{
          borderRadius: "var(--p-radius)",
          color: "var(--p-text-2)",
          background: isOpen ? "var(--p-surface-3)" : "transparent",
        }}
      >
        <MoreHorizontal size={14} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-8 z-50 py-1 min-w-[170px]"
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
                { icon: Copy, label: "Duplicar", action: () => onDuplicate(id) },
                { icon: Trash2, label: "Eliminar", action: () => onDelete(id), danger: true },
              ].map(({ icon: Icon, label, action, danger }) => (
                <button
                  key={label}
                  onClick={(e) => {
                    e.stopPropagation();
                    action();
                    onClose();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] hover:opacity-80"
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

export default function PropiedadesPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "es";

  const [allProps, setAllProps] = useState<Property[]>([]);
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [quickEditId, setQuickEditId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: propsData, error: propsErr } = await supabase
      .from("properties")
      .select(
        "id, slug, operation, property_type, status, price, price_currency, maintenance_fee, area_built, bedrooms, bathrooms, municipio, featured, exclusive, created_at"
      )
      .order("created_at", { ascending: false });

    if (propsErr || !propsData) {
      setLoading(false);
      return;
    }

    const ids = propsData.map((p) => p.id);
    const [{ data: translations }, { data: images }] = await Promise.all([
      supabase.from("property_translations").select("property_id, title, locale").in("property_id", ids).eq("locale", "es"),
      supabase.from("property_images").select("property_id, url, is_cover, sort_order").in("property_id", ids),
    ]);

    const titleMap = Object.fromEntries((translations ?? []).map((t) => [t.property_id, t.title]));
    const imageMap: Record<string, string | null> = {};
    if (images) {
      for (const img of images) {
        if (!imageMap[img.property_id] || img.is_cover) imageMap[img.property_id] = img.url;
      }
    }

    setAllProps(
      propsData.map((p) => ({
        ...p,
        title: titleMap[p.id] ?? p.slug ?? "Sin título",
        cover_url: imageMap[p.id] ?? null,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const visible = useMemo(() => {
    let list = [...allProps];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.municipio ?? "").toLowerCase().includes(q) ||
          p.slug.includes(q) ||
          p.property_type.includes(q)
      );
    }
    if (filterOp) list = list.filter((p) => p.operation === filterOp);
    if (filterStatus) list = list.filter((p) => p.status === filterStatus);
    if (filterType) list = list.filter((p) => p.property_type === filterType);

    list.sort((a, b) => {
      let va: string | number = a[sortField] ?? "";
      let vb: string | number = b[sortField] ?? "";
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      return sortDir === "asc" ? (va > vb ? 1 : -1) : va < vb ? 1 : -1;
    });
    return list;
  }, [allProps, search, filterOp, filterStatus, filterType, sortField, sortDir]);

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const allSelected = visible.length > 0 && visible.every((p) => selected.has(p.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(visible.map((p) => p.id)));

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("properties").delete().eq("id", id);
    setAllProps((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
    setSelected((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  };

  const handleDuplicate = async (id: string) => {
    const supabase = createClient();
    const prop = allProps.find((p) => p.id === id);
    if (!prop) return;

    const newSlug = `${prop.slug}-copy-${Date.now().toString(36)}`;
    const { data: inserted } = await supabase
      .from("properties")
      .insert({
        slug: newSlug,
        operation: prop.operation,
        property_type: prop.property_type,
        status: "activa",
        price: prop.price,
        price_currency: prop.price_currency,
        maintenance_fee: prop.maintenance_fee ?? null,
        area_built: prop.area_built,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms ?? null,
        municipio: prop.municipio,
        featured: false,
        exclusive: false,
      })
      .select()
      .single();

    if (inserted) {
      await supabase.from("property_translations").insert({
        property_id: inserted.id,
        locale: "es",
        title: `${prop.title} (Copia)`,
      });
      fetchAll();
    }
  };

  const handleBulkDelete = async () => {
    const supabase = createClient();
    const ids = Array.from(selected);
    if (!ids.length) return;
    await supabase.from("properties").delete().in("id", ids);
    setAllProps((prev) => prev.filter((p) => !selected.has(p.id)));
    setSelected(new Set());
  };

  const handleBulkDuplicate = async () => {
    for (const id of Array.from(selected)) {
      await handleDuplicate(id);
    }
    setSelected(new Set());
  };

  const handleBulkStatus = async (status: string) => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    const supabase = createClient();
    await supabase.from("properties").update({ status }).in("id", ids);
    setAllProps((prev) => prev.map((p) => (selected.has(p.id) ? { ...p, status } : p)));
    setSelected(new Set());
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const activeFilters = [filterOp, filterStatus, filterType].filter(Boolean).length;
  const COLS = "28px 48px 1.6fr 90px 90px 120px 110px 46px";

  const renderContext = (p: Property) => {
    if (p.operation === "alquiler") {
      return (
        <span className="text-[12px]" style={{ color: "var(--p-text-2)" }}>
          {p.maintenance_fee ? `Mant. ${fmt(p.maintenance_fee, p.price_currency)}` : `${p.area_built ?? "—"} m²`}
        </span>
      );
    }
    if (p.operation === "vacacional") {
      return (
        <span className="text-[12px]" style={{ color: "var(--p-text-2)" }}>
          {p.bedrooms ?? "—"} hab · {p.bathrooms ?? "—"} baños
        </span>
      );
    }
    return (
      <span className="text-[12px]" style={{ color: "var(--p-text-2)" }}>
        {p.area_built ? `${p.area_built} m²` : "—"}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-semibold" style={{ color: "var(--p-text)" }}>
            Propiedades
          </h2>
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

      <div
        className="flex items-center gap-2 p-2"
        style={{ background: "var(--p-surface)", border: "1px solid var(--p-border)", borderRadius: "var(--p-radius)" }}
      >
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--p-text-3)" }} />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2" style={{ color: "var(--p-text-3)" }}>
              <X size={11} />
            </button>
          )}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, tipo, municipio..."
            className="w-full h-8 pl-8 pr-7 text-[12px] outline-none"
            style={{ background: "var(--p-surface-2)", border: "1px solid var(--p-border)", borderRadius: "var(--p-radius)", color: "var(--p-text)" }}
          />
        </div>

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
          <SlidersHorizontal size={13} /> Filtros
          {activeFilters > 0 && (
            <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold" style={{ borderRadius: "50%", background: "var(--p-accent)", color: "#0E0D0C" }}>
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex flex-wrap items-center gap-2 px-3 py-2"
            style={{
              background: "var(--p-surface)",
              border: "1px solid var(--p-border)",
              borderRadius: "var(--p-radius)",
            }}
          >
            <span className="text-[12px] mr-2" style={{ color: "var(--p-text-2)" }}>
              {selected.size} seleccionadas
            </span>
            <button onClick={handleBulkDuplicate} className="px-3 h-8 text-[12px] flex items-center gap-1.5" style={{ borderRadius: "var(--p-radius)", border: "1px solid var(--p-border)", color: "var(--p-text-2)" }}>
              <Copy size={12} /> Duplicar
            </button>
            <button onClick={() => handleBulkStatus("activa")} className="px-3 h-8 text-[12px]" style={{ borderRadius: "var(--p-radius)", border: "1px solid var(--p-border)", color: "var(--p-text-2)" }}>
              Marcar activa
            </button>
            <button onClick={() => handleBulkStatus("reservada")} className="px-3 h-8 text-[12px]" style={{ borderRadius: "var(--p-radius)", border: "1px solid var(--p-border)", color: "var(--p-text-2)" }}>
              Reservar
            </button>
            <button onClick={handleBulkDelete} className="px-3 h-8 text-[12px] flex items-center gap-1.5" style={{ borderRadius: "var(--p-radius)", background: "rgba(192,96,90,0.1)", border: "1px solid rgba(192,96,90,0.2)", color: "var(--p-red)" }}>
              <Trash2 size={12} /> Eliminar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: "hidden" }}>
            <div className="flex flex-wrap items-end gap-4 p-4" style={{ background: "var(--p-surface)", border: "1px solid var(--p-border)", borderRadius: "var(--p-radius)" }}>
              {([
                { label: "Operación", value: filterOp, set: setFilterOp, opts: [["venta", "Venta"], ["alquiler", "Alquiler"], ["vacacional", "Vacacional"]] },
                { label: "Estado", value: filterStatus, set: setFilterStatus, opts: [["activa", "Activa"], ["reservada", "Reservada"], ["vendida", "Vendida"], ["alquilada", "Alquilada"], ["cerrada", "Cerrada"]] },
                { label: "Tipo", value: filterType, set: setFilterType, opts: [["apartamento", "Apartamento"], ["casa", "Casa"], ["townhouse", "Townhouse"], ["terreno_lote", "Terreno"], ["local", "Local"], ["oficina", "Oficina"], ["galpon", "Galpón"]] },
              ] as const).map(({ label, value, set, opts }) => (
                <div key={label}>
                  <p className="text-[10px] mb-1.5" style={{ color: "var(--p-text-3)" }}>{label}</p>
                  <select value={value} onChange={(e) => set(e.target.value)} className="h-8 px-2 text-[12px] outline-none" style={{ background: value ? "var(--p-accent-soft)" : "var(--p-surface-2)", border: `1px solid ${value ? "var(--p-accent)" : "var(--p-border)"}`, borderRadius: "var(--p-radius)", color: "var(--p-text)" }}>
                    <option value="">Todos</option>
                    {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ background: "var(--p-surface)", border: "1px solid var(--p-border)", borderRadius: "var(--p-radius)", overflow: "hidden" }}>
        <div className="grid items-center px-4 py-2.5 text-[11px] font-medium" style={{ gridTemplateColumns: COLS, borderBottom: "1px solid var(--p-border)", color: "var(--p-text-3)", background: "var(--p-surface-2)" }}>
          <button onClick={toggleAll} className="flex">{allSelected ? <CheckSquare size={13} style={{ color: "var(--p-accent)" }} /> : <Square size={13} />}</button>
          <span />
          <button className="flex items-center gap-1" onClick={() => toggleSort("created_at")}>Propiedad <ArrowUpDown size={10} /></button>
          <button className="flex items-center gap-1" onClick={() => toggleSort("operation")}>Op. <ArrowUpDown size={10} /></button>
          <button className="flex items-center gap-1" onClick={() => toggleSort("status")}>Estado <ArrowUpDown size={10} /></button>
          <button className="flex items-center gap-1" onClick={() => toggleSort("price")}>Precio <ArrowUpDown size={10} /></button>
          <span>Datos</span>
          <span />
        </div>

        {!loading && visible.length > 0 && (
          <LayoutGroup>
            <motion.div layout>
              <AnimatePresence mode="popLayout" initial={false}>
                {visible.map((p) => (
                  <div key={p.id}>
                    <motion.div
                      layout
                      layoutId={p.id}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6, scaleY: 0.95 }}
                      transition={{ layout: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.15 }, y: { duration: 0.15 } }}
                      className="grid items-center px-4 py-3 cursor-pointer group"
                      style={{ gridTemplateColumns: COLS, borderBottom: "1px solid var(--p-border)", background: selected.has(p.id) ? "var(--p-accent-soft)" : "transparent", willChange: "transform" }}
                      whileHover={{ background: selected.has(p.id) ? "var(--p-accent-soft)" : "var(--p-surface-2)" }}
                      onClick={() => setQuickEditId((v) => (v === p.id ? null : p.id))}
                    >
                      <button onClick={(e) => { e.stopPropagation(); toggleSelect(p.id); }} className="flex items-center">
                        {selected.has(p.id) || selected.size > 0 ? <CheckSquare size={13} style={{ color: selected.has(p.id) ? "var(--p-accent)" : "var(--p-text-3)" }} /> : <Square size={13} style={{ color: "var(--p-text-3)" }} />}
                      </button>

                      <div className="w-10 h-7 flex-shrink-0 overflow-hidden" style={{ borderRadius: "3px", background: "var(--p-surface-3)" }}>
                        {p.cover_url ? <img src={p.cover_url} alt="" className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center"><Home size={12} style={{ color: "var(--p-text-3)" }} /></div>}
                      </div>

                      <div className="min-w-0 pr-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-medium truncate" style={{ color: "var(--p-text)" }}>{p.title}</span>
                          {p.featured && <span className="shrink-0 text-[9px] px-1 py-0.5 font-semibold uppercase tracking-wide" style={{ borderRadius: "3px", background: "rgba(212,146,74,0.15)", color: "#D4924A" }}>dest</span>}
                          {p.exclusive && <span className="shrink-0 text-[9px] px-1 py-0.5 font-semibold uppercase tracking-wide" style={{ borderRadius: "3px", background: "rgba(90,158,111,0.15)", color: "#5A9E6F" }}>excl</span>}
                        </div>
                        <p className="text-[11px] truncate" style={{ color: "var(--p-text-3)" }}>{p.municipio ?? "Sin ubicación"} · {p.property_type}</p>
                      </div>

                      <span className="text-[12px]" style={{ color: "var(--p-text-2)" }}>{OP_LABEL[p.operation] ?? p.operation}</span>
                      <StatusBadge status={p.status} />
                      <span className="text-[13px] font-medium tabular-nums" style={{ color: "var(--p-text)" }}>
                        {fmt(p.price, p.price_currency)}{p.operation === "alquiler" ? "/mes" : p.operation === "vacacional" ? "/noche" : ""}
                      </span>
                      {renderContext(p)}

                      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                        <RowMenu
                          id={p.id}
                          slug={p.slug}
                          locale={locale}
                          isOpen={openMenuId === p.id}
                          onOpen={setOpenMenuId}
                          onClose={() => setOpenMenuId(null)}
                          onDelete={(id) => setDeleteConfirm(id)}
                          onDuplicate={handleDuplicate}
                        />
                      </div>
                    </motion.div>

                    <AnimatePresence>
                      {quickEditId === p.id && (
                        <QuickEditRow
                          property={p}
                          onClose={() => setQuickEditId(null)}
                          onSaved={(next) => {
                            setAllProps((prev) => prev.map((item) => (item.id === next.id ? { ...item, ...next } : item)));
                          }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        )}

        {!loading && visible.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 flex items-center justify-center" style={{ borderRadius: "var(--p-radius)", background: "var(--p-surface-2)", color: "var(--p-text-3)" }}>
              <Home size={18} />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-medium" style={{ color: "var(--p-text)" }}>{allProps.length === 0 ? "Sin propiedades" : "Sin resultados"}</p>
              <p className="text-[11px] mt-1" style={{ color: "var(--p-text-3)" }}>{allProps.length === 0 ? "Agrega tu primera propiedad para comenzar" : "Prueba con otros filtros o términos de búsqueda"}</p>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setDeleteConfirm(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }} transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }} className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 w-80" style={{ background: "var(--p-surface)", border: "1px solid var(--p-border)", borderRadius: "var(--p-radius)" }}>
              <p className="text-[14px] font-semibold mb-2" style={{ color: "var(--p-text)" }}>¿Eliminar propiedad?</p>
              <p className="text-[12px] mb-5" style={{ color: "var(--p-text-2)" }}>Esta acción no se puede deshacer.</p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-[12px]" style={{ borderRadius: "var(--p-radius)", background: "var(--p-surface-2)", border: "1px solid var(--p-border)", color: "var(--p-text-2)" }}>Cancelar</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-[12px] font-medium" style={{ borderRadius: "var(--p-radius)", background: "var(--p-red)", color: "#fff" }}>Eliminar</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
