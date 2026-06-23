"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Plus, Search, Eye, Pencil, Trash2,
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
  created_at: string;
  cover_url?: string | null;
  title: string;
  savedFlash?: boolean;
}

type SortField = "created_at" | "price" | "status" | "operation";
type SortDir = "asc" | "desc";

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  activa: { label: "Activa", color: "#4ADE80", bg: "rgba(74,222,128,0.12)", border: "rgba(74,222,128,0.25)" },
  reservada: { label: "Reservada", color: "#FBB040", bg: "rgba(251,176,64,0.12)", border: "rgba(251,176,64,0.25)" },
  vendida: { label: "Vendida", color: "#A78BFA", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.25)" },
  alquilada: { label: "Alquilada", color: "#60A5FA", bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.25)" },
  cerrada: { label: "Cerrada", color: "#71717A", bg: "rgba(113,113,122,0.12)", border: "rgba(113,113,122,0.25)" },
};

const OP_LABEL: Record<string, string> = {
  venta: "Venta", alquiler: "Alquiler", vacacional: "Vacacional",
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

const RESIDENTIAL_TYPES = new Set(["casa", "apartamento", "townhouse", "anexo", "habitacion", "hacienda_finca", "edificio"]);
const HAS_AREA_BUILT = new Set(["casa", "apartamento", "townhouse", "anexo", "habitacion", "hacienda_finca", "edificio", "local", "oficina", "galpon"]);
const HAS_PARKING = new Set(["casa", "apartamento", "townhouse", "edificio", "local", "oficina", "galpon"]);

const MUNICIPIOS = ["libertador", "campo_elias", "santos_marquina", "sucre", "rangel"];
const MUNICIPIO_LABEL: Record<string, string> = {
  libertador: "Libertador",
  campo_elias: "Campo Elías",
  santos_marquina: "Santos Marquina",
  sucre: "Sucre",
  rangel: "Rangel",
};

function fmtNum(n: number | string): string {
  const num = typeof n === "string" ? Number(n) : n;
  if (isNaN(num)) return "";
  return Math.round(num).toLocaleString("es-VE");
}
function fmtUSD(price: number) {
  return "$" + fmtNum(price);
}

// ─── Animated StyledSelect (toolbar) ─────────────────────────────────────────
interface SelectOption { value: string; label: string }

function StyledSelect({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const isActive = !!value;

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          height: 34, padding: "0 10px",
          display: "flex", alignItems: "center", gap: 6,
          fontSize: "13px",
          background: isActive ? "var(--p-accent-soft)" : "var(--p-surface-2)",
          border: `1px solid ${isActive ? "var(--p-accent)" : "var(--p-border)"}`,
          borderRadius: "var(--p-radius)",
          color: isActive ? "var(--p-accent)" : "var(--p-text-2)",
          cursor: "pointer", whiteSpace: "nowrap",
          transition: "all 0.15s",
          fontWeight: isActive ? 500 : 400,
          minWidth: 0,
        }}
      >
        <span>{selected ? selected.label : (placeholder ?? "Seleccionar")}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "flex", alignItems: "center", opacity: 0.6 }}
        >
          <ChevronDown size={11} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scaleY: 0.94 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              zIndex: 100,
              minWidth: "100%",
              background: "var(--p-surface-2)",
              border: "1px solid var(--p-border)",
              borderRadius: "var(--p-radius)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              padding: "4px 0",
              transformOrigin: "top center",
            }}
          >
            {placeholder && (
              <DropdownItem
                label={placeholder}
                active={false}
                muted
                onClick={() => { onChange(""); setOpen(false); }}
              />
            )}
            {options.map(opt => (
              <DropdownItem
                key={opt.value}
                label={opt.label}
                active={opt.value === value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── StyledSelectFull (quick-edit) — dropdown usa position:fixed para escapar overflow ──
function StyledSelectFull({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleOpen = () => {
    if (!open && ref.current) {
      const btn = ref.current.querySelector("button");
      if (btn) {
        const r = btn.getBoundingClientRect();
        setDropPos({ top: r.bottom + 4, left: r.left, width: r.width });
      }
    }
    setOpen(v => !v);
  };

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={handleOpen}
        style={{
          width: "100%", height: 34, padding: "0 10px",
          display: "flex", alignItems: "center", gap: 6,
          fontSize: "13px",
          background: "var(--p-surface-3)",
          border: "1px solid var(--p-border)",
          borderRadius: "var(--p-radius)",
          color: "var(--p-text)",
          cursor: "pointer",
          transition: "border-color 0.15s",
        }}
      >
        <span style={{ flex: 1, textAlign: "left" }}>
          {selected ? selected.label : (placeholder ?? "—")}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "flex", alignItems: "center", opacity: 0.5, flexShrink: 0 }}
        >
          <ChevronDown size={12} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && dropPos && (
          <motion.div
            initial={{ opacity: 0, y: -6, scaleY: 0.94 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              top: dropPos.top,
              left: dropPos.left,
              width: dropPos.width,
              zIndex: 9999,
              minWidth: 160,
              background: "var(--p-surface-2)",
              border: "1px solid var(--p-border)",
              borderRadius: "var(--p-radius)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.65)",
              padding: "4px 0",
              transformOrigin: "top center",
            }}
            // Posicionamos con JS al montar
            ref={el => {
              if (!el || !ref.current) return;
              const btn = ref.current.querySelector("button");
              if (!btn) return;
              const r = btn.getBoundingClientRect();
              el.style.top = r.bottom + 4 + "px";
              el.style.left = r.left + "px";
              el.style.width = r.width + "px";
            }}
          >
            {placeholder && (
              <DropdownItem
                label={placeholder}
                active={false}
                muted
                onClick={() => { onChange(""); setOpen(false); }}
              />
            )}
            {options.map(opt => (
              <DropdownItem
                key={opt.value}
                label={opt.label}
                active={opt.value === value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Shared dropdown item ─────────────────────────────────────────────────────
function DropdownItem({ label, active, muted, onClick }: {
  label: string;
  active: boolean;
  muted?: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", textAlign: "left",
        padding: "7px 12px",
        fontSize: "13px",
        color: muted ? "var(--p-text-3)" : active ? "var(--p-accent)" : "var(--p-text)",
        background: active
          ? "var(--p-accent-soft)"
          : hovered
            ? "var(--p-surface-3)"
            : "transparent",
        border: "none", cursor: "pointer",
        fontWeight: active ? 500 : 400,
        display: "flex", alignItems: "center", gap: 8,
        transition: "background 0.1s, color 0.1s",
      }}
    >
      {active ? <Check size={11} /> : <span style={{ width: 11 }} />}
      {label}
    </button>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG["cerrada"];
  if (!cfg) return null;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "fit-content",
      maxWidth: "100%",
      borderRadius: "3px",
      color: cfg.color,
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      fontSize: "11px",
      fontWeight: 600,
      padding: "3px 8px",
      whiteSpace: "nowrap",
      lineHeight: 1.4,
    }}>
      {cfg.label}
    </span>
  );
}

// ─── ChipToggle ───────────────────────────────────────────────────────────────
function ChipToggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "5px 11px",
        borderRadius: "3px",
        border: `1px solid ${active ? "var(--p-accent)" : "var(--p-border)"}`,
        background: active ? "var(--p-accent-soft)" : "var(--p-surface-3)",
        color: active ? "var(--p-accent)" : "var(--p-text-3)",
        fontSize: "12px", fontWeight: active ? 600 : 400,
        cursor: "pointer",
        transition: "all 0.18s ease",
      }}
    >
      {active && <Check size={11} />}
      {label}
    </button>
  );
}

// ─── Quick Edit ───────────────────────────────────────────────────────────────
function QuickEditRow({ property, onClose, onSaved, onEdit }: {
  property: Property;
  onClose: () => void;
  onSaved: (next: Partial<Property> & { id: string }) => void;
  onEdit: () => void;
}) {
  const [title, setTitle] = useState(property.title);
  const [price, setPrice] = useState(fmtNum(property.price ?? 0));
  const [status, setStatus] = useState(property.status);
  const [operation, setOperation] = useState(property.operation);
  const [propType, setPropType] = useState(property.property_type);
  const [municipio, setMunicipio] = useState(property.municipio ?? "");
  const [bedrooms, setBedrooms] = useState(String(property.bedrooms ?? ""));
  const [bathrooms, setBathrooms] = useState(String(property.bathrooms ?? ""));
  const [halfBath, setHalfBath] = useState(String(property.half_bathrooms ?? ""));
  const [parking, setParking] = useState(String(property.parking_spaces ?? ""));
  const [areaBuilt, setAreaBuilt] = useState(String(property.area_built ?? ""));
  const [areaTotal, setAreaTotal] = useState(String(property.area_total ?? ""));
  const [featured, setFeatured] = useState(property.featured);
  const [exclusive, setExclusive] = useState(property.exclusive);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isResidential = RESIDENTIAL_TYPES.has(propType);
  const hasAreaBuilt = HAS_AREA_BUILT.has(propType);
  const hasParking = HAS_PARKING.has(propType);
  const isTerrain = propType === "terreno_lote";

  const rawPrice = () => Number(price.replace(/\./g, "").replace(/[^0-9]/g, "")) || 0;

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
    transition: "border-color 0.15s",
  };

  const numS: React.CSSProperties = { ...inputS, textAlign: "center" };

  const label = (text: string) => (
    <p style={{ fontSize: "11px", color: "var(--p-text-3)", marginBottom: 5, fontWeight: 500 }}>{text}</p>
  );

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const priceNum = rawPrice();

    const updates: Record<string, unknown> = {
      price: priceNum,
      price_currency: "USD",
      status, operation,
      property_type: propType,
      municipio: municipio || null,
      bedrooms: bedrooms !== "" ? Number(bedrooms) : null,
      bathrooms: bathrooms !== "" ? Number(bathrooms) : null,
      half_bathrooms: halfBath !== "" ? Number(halfBath) : null,
      parking_spaces: parking !== "" ? Number(parking) : null,
      area_built: areaBuilt !== "" ? Number(areaBuilt) : null,
      area_total: areaTotal !== "" ? Number(areaTotal) : null,
      featured, exclusive,
    };

    const [{ error: propErr }, { error: transErr }] = await Promise.all([
      supabase.from("properties").update(updates).eq("id", property.id),
      supabase.from("property_translations").update({ title }).eq("property_id", property.id).eq("locale", "es"),
    ]);

    if (!propErr && !transErr) {
      setSaved(true);
      onSaved({
        id: property.id, title,
        price: priceNum,
        price_currency: "USD",
        status, operation,
        property_type: propType,
        municipio: municipio || null,
        bedrooms: bedrooms !== "" ? Number(bedrooms) : null,
        bathrooms: bathrooms !== "" ? Number(bathrooms) : null,
        half_bathrooms: halfBath !== "" ? Number(halfBath) : null,
        parking_spaces: parking !== "" ? Number(parking) : null,
        area_built: areaBuilt !== "" ? Number(areaBuilt) : null,
        area_total: areaTotal !== "" ? Number(areaTotal) : null,
        featured, exclusive, savedFlash: true,
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
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      style={{
        overflow: "visible",
        borderBottom: "1px solid var(--p-border)",
        background: "var(--p-surface-2)",
        minHeight: 200,
        position: "relative",
        zIndex: 20,
      }}
    >
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Fila 1: Título */}
        <div>
          {label("Título")}
          <input value={title} onChange={e => setTitle(e.target.value)} style={inputS} placeholder="Sin título" />
        </div>

        {/* Fila 2: Precio + Operación + Estado + Tipo + Municipio */}
        <div style={{ display: "grid", gridTemplateColumns: "200px 140px 140px 180px 160px", gap: 10 }}>
          <div>
            {label("Precio (USD)")}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "var(--p-text-3)", pointerEvents: "none" }}>$</span>
              <input
                value={price}
                onChange={e => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setPrice(raw ? fmtNum(Number(raw)) : "");
                }}
                type="text" inputMode="numeric"
                style={{ ...inputS, paddingLeft: 22 }}
                placeholder="0"
              />
            </div>
          </div>
          <div>
            {label("Operación")}
            <StyledSelectFull value={operation} onChange={setOperation} options={[
              { value: "venta", label: "Venta" },
              { value: "alquiler", label: "Alquiler" },
              { value: "vacacional", label: "Vacacional" },
            ]} />
          </div>
          <div>
            {label("Estado")}
            <StyledSelectFull value={status} onChange={setStatus} options={[
              { value: "activa", label: "Activa" },
              { value: "reservada", label: "Reservada" },
              { value: "vendida", label: "Vendida" },
              { value: "alquilada", label: "Alquilada" },
              { value: "cerrada", label: "Cerrada" },
            ]} />
          </div>
          <div>
            <StyledSelectFull value={propType} onChange={setPropType}
              options={Object.entries(PROP_TYPE_LABEL).map(([v, l]) => ({ value: v, label: l }))}
            />
          </div>
          <div>
            {label("Municipio")}
            <StyledSelectFull value={municipio} onChange={setMunicipio} placeholder="Sin especificar"
              options={MUNICIPIOS.map(m => ({ value: m, label: MUNICIPIO_LABEL[m] as string }))}
            />
          </div>
        </div>

        {/* Campos dinámicos residencial */}
        <AnimatePresence>
          {isResidential && (
            <motion.div
              key="res"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "90px 90px 90px 90px 1fr 1fr", gap: 10 }}>
                <div>{label("Habitaciones")}<input value={bedrooms} onChange={e => setBedrooms(e.target.value)} type="number" min="0" style={numS} placeholder="—" /></div>
                <div>{label("Baños")}<input value={bathrooms} onChange={e => setBathrooms(e.target.value)} type="number" min="0" style={numS} placeholder="—" /></div>
                <div>{label("Medio baño")}<input value={halfBath} onChange={e => setHalfBath(e.target.value)} type="number" min="0" style={numS} placeholder="—" /></div>
                <div>{label("Estacionam.")}<input value={parking} onChange={e => setParking(e.target.value)} type="number" min="0" style={numS} placeholder="—" /></div>
                <div>{label("Área construida (m²)")}<input value={areaBuilt} onChange={e => setAreaBuilt(e.target.value)} type="number" min="0" style={inputS} placeholder="—" /></div>
                <div>{label("Área total (m²)")}<input value={areaTotal} onChange={e => setAreaTotal(e.target.value)} type="number" min="0" style={inputS} placeholder="—" /></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Parking no-residencial */}
        <AnimatePresence>
          {!isResidential && hasParking && (
            <motion.div
              key="park"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr", gap: 10 }}>
                <div>{label("Estacionam.")}<input value={parking} onChange={e => setParking(e.target.value)} type="number" min="0" style={numS} placeholder="—" /></div>
                {hasAreaBuilt && !isTerrain && (
                  <div>{label("Área construida (m²)")}<input value={areaBuilt} onChange={e => setAreaBuilt(e.target.value)} type="number" min="0" style={inputS} placeholder="—" /></div>
                )}
                <div>{label("Área total (m²)")}<input value={areaTotal} onChange={e => setAreaTotal(e.target.value)} type="number" min="0" style={inputS} placeholder="—" /></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Terreno */}
        <AnimatePresence>
          {isTerrain && (
            <motion.div
              key="terrain"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 400 }}>
                <div>{label("Área total (m²)")}<input value={areaTotal} onChange={e => setAreaTotal(e.target.value)} type="number" min="0" style={inputS} placeholder="—" /></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chips Destacada / Exclusiva */}
        <div>
          {label("Etiquetas")}
          <div style={{ display: "flex", gap: 8 }}>
            <ChipToggle active={featured} onClick={() => setFeatured(v => !v)} label="Destacada" />
            <ChipToggle active={exclusive} onClick={() => setExclusive(v => !v)} label="Exclusiva" />
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{ padding: "0 20px 16px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button
          onClick={onClose}
          style={{ borderRadius: "var(--p-radius)", border: "1px solid var(--p-border)", color: "var(--p-text-2)", padding: "7px 16px", fontSize: "13px", background: "none", cursor: "pointer" }}
        >Cancelar</button>
        <button
          onClick={onEdit}
          style={{
            borderRadius: "var(--p-radius)",
            border: "1px solid var(--p-border)",
            color: "var(--p-text-2)",
            padding: "7px 14px",
            fontSize: "13px",
            background: "none",
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <Pencil size={12} /> Editar completo
        </button>
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
          {saved ? <><Check size={13} /> Guardado</> : saving ? "Guardando..." : <><Save size={12} /> Guardar</>}
        </button>
      </div>
    </motion.div>
  );
}

// ─── RowMenu ──────────────────────────────────────────────────────────────────
function RowMenu({ id, slug, locale, isOpen, onOpen, onClose, onDelete, onDuplicate }: {
  id: string; slug: string; locale: string; isOpen: boolean;
  onOpen: (id: string) => void; onClose: () => void;
  onDelete: (id: string) => void; onDuplicate: (id: string) => void;
}) {
  const router = useRouter();
  const items: { icon: React.ElementType; label: string; action: () => void; danger?: boolean }[] = [
    { icon: Eye, label: "Ver en sitio", action: () => window.open(`/${locale}/${slug}`, "_blank") },
    { icon: Pencil, label: "Editar completo", action: () => router.push(`/${locale}/panel/propiedades/${id}/editar`) },
    { icon: Copy, label: "Duplicar", action: () => onDuplicate(id) },
    { icon: Trash2, label: "Eliminar", action: () => onDelete(id), danger: true },
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

// ─── FilterChip ───────────────────────────────────────────────────────────────
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 8px 3px 10px",
      borderRadius: "3px",
      background: "rgba(96,165,250,0.10)",
      border: "1px solid rgba(96,165,250,0.28)",
      color: "#60A5FA",
      fontSize: "12px", fontWeight: 500,
    }}>
      {label}
      <button onClick={onRemove} style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "#60A5FA", padding: 0, opacity: 0.7 }}>
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
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterOp, setFilterOp] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterMunicipio, setFilterMunicipio] = useState("");

  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [quickEditId, setQuickEditId] = useState<string | null>(null);
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());

  // IDs siendo eliminados — para animar su salida antes de quitarlos del estado
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const fetchAll = useCallback(async () => {
    setLoading(true); setDbError(null);
    const supabase = createClient();
    const { data: propsData, error: propsErr } = await supabase
      .from("properties")
      .select(`id, slug, operation, property_type, status, price, price_currency,
               area_built, area_total, bedrooms, bathrooms, half_bathrooms,
               parking_spaces, municipio, featured, exclusive, created_at`)
      .order("created_at", { ascending: false });

    if (propsErr) { setDbError(`Error: ${propsErr.message}`); setLoading(false); return; }
    if (!propsData || propsData.length === 0) { setAllProps([]); setLoading(false); return; }

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
    if (filterOp) list = list.filter(p => p.operation === filterOp);
    if (filterStatus) list = list.filter(p => p.status === filterStatus);
    if (filterType) list = list.filter(p => p.property_type === filterType);
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
  const allSelected = visible.length > 0 && visible.every(p => selected.has(p.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(visible.map(p => p.id)));

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 2200);
  };

  const handleDelete = async (id: string) => {
    setDeletingIds(prev => new Set(prev).add(id));
    setDeleteConfirm(null);
    await createClient().from("properties").delete().eq("id", id);
    setTimeout(() => {
      setAllProps(prev => prev.filter(p => p.id !== id));
      setDeletingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
    }, 320);
  };

  const handleDuplicate = async (id: string) => {
    const prop = allProps.find(p => p.id === id);
    if (!prop) return;
    const newSlug = `${prop.slug}-copia-${Date.now().toString(36)}`;

    const res = await fetch("/api/panel/duplicate-property", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: newSlug,
        operation: prop.operation,
        property_type: prop.property_type,
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
        title: `${prop.title} (Copia)`,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Error desconocido" }));
      console.error("[Duplicar] Error:", err.error);
      return;
    }
    fetchAll();
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    setDeletingIds(new Set(ids));
    await createClient().from("properties").delete().in("id", ids);
    setTimeout(() => {
      setAllProps(prev => prev.filter(p => !ids.includes(p.id)));
      setDeletingIds(new Set());
      setSelected(new Set());
    }, 320);
  };

  const handleBulkStatus = async (status: string) => {
    const ids = Array.from(selected);
    await createClient().from("properties").update({ status }).in("id", ids);
    setAllProps(prev => prev.map(p => selected.has(p.id) ? { ...p, status } : p));
    setSelected(new Set());
  };

  const handleSaved = (next: Partial<Property> & { id: string }) => {
    setAllProps(prev => prev.map(p => p.id === next.id ? { ...p, ...next } : p));
    setFlashIds(prev => new Set(prev).add(next.id));
    showSuccess("Cambios guardados");
    setTimeout(() => setFlashIds(prev => { const n = new Set(prev); n.delete(next.id); return n; }), 2200);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const activeFilters = [filterOp, filterStatus, filterType, filterMunicipio].filter(Boolean);
  const COLS = "28px 44px 1.5fr 80px 100px 116px 96px 34px";

  const renderDatos = (p: Property) => {
    const parts: string[] = [];
    if (p.bedrooms != null) parts.push(`${p.bedrooms}h`);
    if (p.bathrooms != null) parts.push(`${p.bathrooms}b`);
    if (p.area_built != null) parts.push(`${p.area_built}m²`);
    else if (p.area_total != null) parts.push(`${p.area_total}m²`);
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
    padding: "5px 11px",
    fontSize: "12px",
    display: "flex", alignItems: "center", gap: 5,
    background: "none", cursor: "pointer",
    whiteSpace: "nowrap" as const,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--p-text)", margin: 0 }}>Propiedades</h2>
          <AnimatePresence>
            {successMsg && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                style={{ fontSize: "12px", color: "#4ADE80", fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}
              >
                <Check size={12} /> {successMsg}
              </motion.span>
            )}
          </AnimatePresence>
          {!successMsg && (
            <span style={{ fontSize: "13px", color: "var(--p-text-3)" }}>
              {loading ? "Cargando..."
                : dbError ? ""
                  : `${visible.length} de ${allProps.length}`}
            </span>
          )}
        </div>
        <button
          onClick={() => router.push(`/${locale}/panel/propiedades/nueva`)}
          style={{ borderRadius: "var(--p-radius)", background: "var(--p-accent)", color: "#090909", padding: "8px 16px", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: 7, border: "none", cursor: "pointer" }}
        >
          <Plus size={14} /> Nueva propiedad
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ ...cardStyle, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: 8 }}>
        <div style={{ position: "relative", flex: 1, minWidth: 160, maxWidth: 300 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--p-text-3)", pointerEvents: "none" }} />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "var(--p-text-3)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <X size={11} />
            </button>
          )}
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            style={{ width: "100%", height: 34, paddingLeft: 32, paddingRight: 28, fontSize: "13px", background: "var(--p-surface-2)", border: "1px solid var(--p-border)", borderRadius: "var(--p-radius)", color: "var(--p-text)", outline: "none" }}
          />
        </div>
        <StyledSelect value={filterOp} onChange={setFilterOp} placeholder="Operación"
          options={[{ value: "venta", label: "Venta" }, { value: "alquiler", label: "Alquiler" }, { value: "vacacional", label: "Vacacional" }]} />
        <StyledSelect value={filterStatus} onChange={setFilterStatus} placeholder="Estado"
          options={[{ value: "activa", label: "Activa" }, { value: "reservada", label: "Reservada" }, { value: "vendida", label: "Vendida" }, { value: "alquilada", label: "Alquilada" }, { value: "cerrada", label: "Cerrada" }]} />
        <StyledSelect value={filterType} onChange={setFilterType} placeholder="Tipo"
          options={Object.entries(PROP_TYPE_LABEL).map(([v, l]) => ({ value: v, label: l || v }))} />
        <StyledSelect value={filterMunicipio} onChange={setFilterMunicipio} placeholder="Municipio"
          options={MUNICIPIOS.map(m => ({ value: m, label: MUNICIPIO_LABEL[m] || m }))} />

        {activeFilters.length > 0 && (
          <button
            onClick={() => { setFilterOp(""); setFilterStatus(""); setFilterType(""); setFilterMunicipio(""); }}
            style={{ height: 34, padding: "0 10px", borderRadius: "var(--p-radius)", border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.08)", color: "var(--p-red)", fontSize: "12px", display: "flex", alignItems: "center", gap: 4, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            <X size={10} /> Limpiar
          </button>
        )}

        <div style={{ flex: 1 }} />

        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <span style={{ fontSize: "12px", color: "var(--p-text-3)", paddingRight: 2 }}>
                {selected.size} {selected.size === 1 ? "seleccionado" : "seleccionados"}
              </span>
              <button style={btnGhost} onClick={() => { Array.from(selected).forEach(handleDuplicate); setSelected(new Set()); }}><Copy size={11} />Duplicar</button>
              <button style={btnGhost} onClick={() => handleBulkStatus("activa")}>Activar</button>
              <button style={btnGhost} onClick={() => handleBulkStatus("reservada")}>Reservar</button>
              <button onClick={handleBulkDelete} style={{ ...btnGhost, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "var(--p-red)" }}>
                <Trash2 size={11} />Eliminar
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active filter chips */}
      <AnimatePresence>
        {activeFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ display: "flex", flexWrap: "wrap", gap: 6, overflow: "hidden" }}
          >
            {filterOp && <FilterChip label={`Operación: ${OP_LABEL[filterOp] ?? filterOp}`} onRemove={() => setFilterOp("")} />}
            {filterStatus && <FilterChip label={`Estado: ${STATUS_CFG[filterStatus]?.label ?? filterStatus}`} onRemove={() => setFilterStatus("")} />}
            {filterType && <FilterChip label={`Tipo: ${PROP_TYPE_LABEL[filterType] ?? filterType}`} onRemove={() => setFilterType("")} />}
            {filterMunicipio && <FilterChip label={`Municipio: ${MUNICIPIO_LABEL[filterMunicipio] ?? filterMunicipio}`} onRemove={() => setFilterMunicipio("")} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div style={{ ...cardStyle, overflow: "visible", position: "relative" }}>
        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: COLS, alignItems: "center", padding: "8px 14px", borderBottom: "1px solid var(--p-border)", background: "var(--p-surface-2)", borderRadius: "var(--p-radius) var(--p-radius) 0 0" }}>
          <button onClick={toggleAll} style={{ display: "flex", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            {allSelected ? <CheckSquare size={14} style={{ color: "var(--p-accent)" }} /> : <Square size={14} style={{ color: "var(--p-text-3)" }} />}
          </button>
          <span />
          <button style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "11px", color: "var(--p-text-3)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }} onClick={() => toggleSort("created_at")}>Propiedad <ArrowUpDown size={9} /></button>
          <button style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "11px", color: "var(--p-text-3)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }} onClick={() => toggleSort("operation")}>Op. <ArrowUpDown size={9} /></button>
          <button style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "11px", color: "var(--p-text-3)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }} onClick={() => toggleSort("status")}>Estado <ArrowUpDown size={9} /></button>
          <button style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "11px", color: "var(--p-text-3)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }} onClick={() => toggleSort("price")}>Precio <ArrowUpDown size={9} /></button>
          <span style={{ fontSize: "11px", color: "var(--p-text-3)", fontWeight: 500 }}>Datos</span>
          <span />
        </div>

        {/* Skeleton */}
        {loading && (
          <div style={{ padding: "8px 14px", display: "flex", flexDirection: "column", gap: 1 }}>
            {[...Array(10)].map((_, i) => (
              <div key={i} style={{ height: 50, display: "flex", alignItems: "center", gap: 10, opacity: 1 - i * 0.08 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: "var(--p-surface-3)" }} />
                <div style={{ width: 40, height: 28, borderRadius: 3, background: "var(--p-surface-3)" }} />
                <div style={{ flex: 1, height: 13, borderRadius: 3, background: "var(--p-surface-3)", maxWidth: 260 }} />
                <div style={{ width: 55, height: 13, borderRadius: 3, background: "var(--p-surface-3)" }} />
                <div style={{ width: 62, height: 20, borderRadius: 3, background: "var(--p-surface-3)" }} />
                <div style={{ width: 76, height: 13, borderRadius: 3, background: "var(--p-surface-3)" }} />
              </div>
            ))}
          </div>
        )}

        {/* Rows */}
        {!loading && visible.length > 0 && (
          <LayoutGroup>
            <motion.div layout>
              <AnimatePresence mode="popLayout" initial={false}>
                {visible.map(p => {
                  const isExpanded = quickEditId === p.id;
                  const isFlash = flashIds.has(p.id);
                  const isSelected = selected.has(p.id);
                  const isDeleting = deletingIds.has(p.id);
                  const dimmed = quickEditId !== null && !isExpanded;

                  return (
                    <motion.div
                      key={p.id}
                      layout
                      layoutId={p.id}
                      initial={{ opacity: 0, scaleY: 0.95 }}
                      animate={{
                        opacity: isDeleting ? 0 : dimmed ? 0.38 : 1,
                        scaleY: isDeleting ? 0 : 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        scaleY: 0,
                        transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
                      }}
                      transition={{
                        layout: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
                        opacity: { duration: isDeleting ? 0.22 : dimmed ? 0.18 : 0.12 },
                        scaleY: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
                      }}
                      style={{
                        transformOrigin: "top center",
                        overflow: isExpanded ? "visible" : "hidden",
                        position: "relative",
                        zIndex: isExpanded ? 5 : 1,
                      }}
                    >
                      {/* Row principal */}
                      <motion.div
                        animate={{
                          backgroundColor: isExpanded
                            ? "rgba(99,220,180,0.07)"
                            : isFlash
                              ? "rgba(74,222,128,0.07)"
                              : isSelected
                                ? "var(--p-accent-soft)"
                                : "rgba(0,0,0,0)",
                        }}
                        transition={{ backgroundColor: { duration: isFlash ? 0.6 : 0.22 } }}
                        style={{
                          display: "grid",
                          gridTemplateColumns: COLS,
                          alignItems: "center",
                          padding: "10px 14px",
                          borderBottom: "1px solid var(--p-border)",
                          cursor: "pointer",
                          outline: isFlash ? "1px solid rgba(74,222,128,0.2)" : "none",
                          outlineOffset: "-1px",
                          transition: "outline 0.6s",
                          borderLeft: isExpanded ? "3px solid var(--p-accent)" : "3px solid transparent",
                          boxShadow: isExpanded ? "0 2px 0 0 rgba(99,220,180,0.15) inset, 0 -1px 0 0 rgba(99,220,180,0.1) inset" : "none",
                        }}
                        onClick={() => !isDeleting && setQuickEditId(v => v === p.id ? null : p.id)}
                      >
                        {/* Checkbox */}
                        <button onClick={e => { e.stopPropagation(); toggleSelect(p.id); }} style={{ display: "flex", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                          {isSelected
                            ? <CheckSquare size={14} style={{ color: "var(--p-accent)" }} />
                            : <Square size={14} style={{ color: "var(--p-text-3)" }} />}
                        </button>

                        {/* Thumbnail */}
                        <div style={{ width: 40, height: 28, borderRadius: "3px", overflow: "hidden", background: "var(--p-surface-3)", flexShrink: 0 }}>
                          {p.cover_url
                            ? <img src={p.cover_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Home size={12} style={{ color: "var(--p-text-3)" }} /></div>}
                        </div>

                        {/* Title + badges */}
                        <div style={{ minWidth: 0, paddingRight: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--p-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
                            {p.featured && <span style={{ borderRadius: "3px", background: "rgba(251,176,64,0.12)", color: "#FBB040", border: "1px solid rgba(251,176,64,0.2)", fontSize: "9px", fontWeight: 700, padding: "2px 5px", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0, whiteSpace: "nowrap" }}>Destacada</span>}
                            {p.exclusive && <span style={{ borderRadius: "3px", background: "rgba(74,222,128,0.1)", color: "#4ADE80", border: "1px solid rgba(74,222,128,0.2)", fontSize: "9px", fontWeight: 700, padding: "2px 5px", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0, whiteSpace: "nowrap" }}>Exclusiva</span>}
                          </div>
                          <p style={{ fontSize: "11px", color: "var(--p-text-3)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.municipio ? MUNICIPIO_LABEL[p.municipio] ?? p.municipio : "Sin ubicación"} · {PROP_TYPE_LABEL[p.property_type] ?? p.property_type}
                          </p>
                        </div>

                        {/* Operation */}
                        <span style={{ fontSize: "12px", color: "var(--p-text-2)" }}>{OP_LABEL[p.operation] ?? p.operation}</span>

                        {/* Status */}
                        <StatusBadge status={p.status} />

                        {/* Price */}
                        <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--p-text)", fontVariantNumeric: "tabular-nums" }}>
                          {fmtUSD(p.price)}
                          {p.operation === "alquiler" && <span style={{ fontSize: "10px", color: "var(--p-text-3)", marginLeft: 2 }}>/mes</span>}
                          {p.operation === "vacacional" && <span style={{ fontSize: "10px", color: "var(--p-text-3)", marginLeft: 2 }}>/noche</span>}
                        </span>

                        {/* Data */}
                        {renderDatos(p)}

                        {/* Menu */}
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

                      {/* Quick edit */}
                      <AnimatePresence>
                        {isExpanded && (
                          <QuickEditRow
                            property={p}
                            onClose={() => setQuickEditId(null)}
                            onSaved={next => { handleSaved(next); setQuickEditId(null); }}
                            onEdit={() => router.push(`/${locale}/panel/propiedades/${p.id}/editar`)}
                          />
                        )}
                      </AnimatePresence>
                    </motion.div>
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

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.7)" }}
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
              style={{ position: "fixed", zIndex: 51, top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 320, padding: 24, background: "var(--p-surface)", border: "1px solid var(--p-border)", borderRadius: "var(--p-radius)", boxShadow: "0 24px 64px rgba(0,0,0,0.8)" }}
            >
              <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--p-text)", marginBottom: 8 }}>¿Eliminar propiedad?</p>
              <p style={{ fontSize: "13px", color: "var(--p-text-2)", marginBottom: 20 }}>Esta acción no se puede deshacer y eliminará la propiedad permanentemente.</p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button onClick={() => setDeleteConfirm(null)} style={{ borderRadius: "var(--p-radius)", border: "1px solid var(--p-border)", color: "var(--p-text-2)", padding: "7px 16px", fontSize: "13px", background: "none", cursor: "pointer" }}>Cancelar</button>
                <button onClick={() => handleDelete(deleteConfirm)} style={{ borderRadius: "var(--p-radius)", background: "var(--p-red)", color: "#fff", padding: "7px 16px", fontSize: "13px", fontWeight: 500, border: "none", cursor: "pointer" }}>Eliminar</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
