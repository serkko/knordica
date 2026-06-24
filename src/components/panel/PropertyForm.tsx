/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, Reorder, LayoutGroup } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { checkFieldApplies, isCombinationInconsistent } from "@/utils/propertyDiscrimination";
import {
  Upload,
  X,
  Minus,
  GripVertical,
  Star,
  Plus,
  ChevronDown,
  ChevronUp,
  Video,
  Link as LinkIcon,
  ArrowLeft,
  Save,
  Image as ImageIcon,
} from "lucide-react";

// ── Tipos ──
interface ImageFile {
  id: string;
  file?: File;
  preview: string;
  url?: string;
  isCover: boolean;
  uploading: boolean;
  progress: number;
}

interface FormData {
  // Clasificación y Gamificación
  operation: string;
  property_type: string;
  status: string;
  listing_badge: string;
  completeness_score: string;
  featured: boolean;
  exclusive: boolean;
  new_listing: boolean;
  price_reduced: boolean;

  // Título y Descripción (Multi-idioma)
  title_es: string;
  description_es: string;
  title_en: string;
  description_en: string;

  // Precio y Condiciones
  price: string;
  price_currency: string;
  price_negotiable: boolean;
  price_usd: string;
  maintenance_fee: string;
  maintenance_included: boolean;

  // Vacacional
  price_per_night: string;
  price_weekend: string;
  min_nights: string;
  max_guests: string;
  checkin_time: string;
  checkout_time: string;
  house_rules: string;
  includes_breakfast: boolean;

  // Dimensiones y Habitáculos
  area_built: string;
  area_total: string;
  area_hectares: string;
  bedrooms: string;
  bathrooms: string;
  half_bathrooms: string;
  parking_spaces: string;
  parking_covered: boolean;
  floors: string;
  floor_number: string;
  property_age: string;
  year_built: string;
  condition: string;
  furnished: string;

  // Ubicación
  municipio: string;
  zone_id: string;
  address_es: string;
  address_en: string;
  lat: string;
  lng: string;
  show_exact_location: boolean;

  // Servicios Básicos
  has_elevator: boolean;
  has_water_tank: boolean;
  has_hot_water: boolean;
  has_generator: boolean;
  gas_type: string;
  has_internet: boolean;

  // Seguridad
  has_security_24h: boolean;
  has_electric_gate: boolean;
  has_cctv: boolean;
  has_electric_fence: boolean;
  has_intercom: boolean;
  has_armored_door: boolean;

  // Climatización
  has_ac: boolean;
  has_heating: boolean;
  kitchen_type: string;

  // Habitación y Anexo
  bathroom_type: string;
  host_housing_type: string;
  cohabitation: string;
  occupants_count: string;
  gender_policy: string;
  deposit_required: boolean;
  deposit_amount: string;
  allows_pets: boolean;
  allows_cooking: boolean;
  has_independent_entrance: boolean;

  // Terreno y Finca
  topography: string;
  land_use: string;
  access_type: string;
  current_use: string;
  has_own_water: boolean;

  // Media
  video_url: string;
  virtual_tour_url: string;
}

const INIT: FormData = {
  operation: "venta",
  property_type: "apartamento",
  status: "activa",
  listing_badge: "basico",
  completeness_score: "0",
  featured: false,
  exclusive: false,
  new_listing: true,
  price_reduced: false,
  title_es: "",
  description_es: "",
  title_en: "",
  description_en: "",
  price: "",
  price_currency: "USD",
  price_negotiable: false,
  price_usd: "",
  maintenance_fee: "",
  maintenance_included: false,
  price_per_night: "",
  price_weekend: "",
  min_nights: "1",
  max_guests: "",
  checkin_time: "14:00",
  checkout_time: "11:00",
  house_rules: "",
  includes_breakfast: false,
  area_built: "",
  area_total: "",
  area_hectares: "",
  bedrooms: "",
  bathrooms: "",
  half_bathrooms: "",
  parking_spaces: "",
  parking_covered: false,
  floors: "",
  floor_number: "",
  property_age: "",
  year_built: "",
  condition: "",
  furnished: "sin_muebles",
  municipio: "",
  zone_id: "",
  address_es: "",
  address_en: "",
  lat: "",
  lng: "",
  show_exact_location: true,
  has_elevator: false,
  has_water_tank: false,
  has_hot_water: false,
  has_generator: false,
  gas_type: "",
  has_internet: false,
  has_security_24h: false,
  has_electric_gate: false,
  has_cctv: false,
  has_electric_fence: false,
  has_intercom: false,
  has_armored_door: false,
  has_ac: false,
  has_heating: false,
  kitchen_type: "",
  bathroom_type: "",
  host_housing_type: "",
  cohabitation: "",
  occupants_count: "",
  gender_policy: "",
  deposit_required: false,
  deposit_amount: "",
  allows_pets: false,
  allows_cooking: true,
  has_independent_entrance: false,
  topography: "",
  land_use: "",
  access_type: "",
  current_use: "",
  has_own_water: false,
  video_url: "",
  virtual_tour_url: "",
};

const INPUT = {
  base: {
    background: "var(--p-surface-2)",
    border: "1px solid var(--p-border)",
    borderRadius: "var(--p-radius)",
    color: "var(--p-text)",
    padding: "0 12px",
    height: "38px",
    fontSize: "13px",
    outline: "none",
    width: "100%",
  } as React.CSSProperties,
  textarea: {
    background: "var(--p-surface-2)",
    border: "1px solid var(--p-border)",
    borderRadius: "var(--p-radius)",
    color: "var(--p-text)",
    padding: "10px 12px",
    fontSize: "13px",
    outline: "none",
    width: "100%",
    resize: "vertical" as const,
    minHeight: "100px",
  } as React.CSSProperties,
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-medium mb-1.5" style={{ color: "var(--p-text-2)" }}>
      {children}
    </label>
  );
}

const capitalize = (str: string) => {
  if (!str) return "";
  if (str === "hacienda_finca") return "Hacienda / Finca";
  if (str === "terreno_lote") return "Terreno / Lote";
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// ── FormattedNumberInput for thousands separator ──
function FormattedNumberInput({
  value,
  onChange,
  style,
  placeholder,
  required,
  ...props
}: {
  value: string;
  onChange: (val: string) => void;
  style?: React.CSSProperties;
  placeholder?: string;
  required?: boolean;
  [key: string]: any;
}) {
  const getDisplayValue = (val: string) => {
    if (!val) return "";
    const parts = val.split(".");
    const integerPart = parts[0] || "";
    const decimalPart = parts[1];
    
    const cleanInt = integerPart.replace(/[^\d-]/g, "");
    if (cleanInt === "" || cleanInt === "-") return cleanInt;
    
    const formattedInt = Number(cleanInt).toLocaleString("es-ES", { useGrouping: true, maximumFractionDigits: 0 });
    
    if (decimalPart !== undefined) {
      return `${formattedInt},${decimalPart}`;
    }
    return formattedInt;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    const normalized = text.replace(/\./g, "").replace(/,/g, ".");
    
    if (normalized === "" || normalized === "-" || /^-?\d*\.?\d*$/.test(normalized)) {
      onChange(normalized);
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={getDisplayValue(value)}
      onChange={handleTextChange}
      style={style}
      placeholder={placeholder}
      required={required}
      {...props}
    />
  );
}

// ── NumberStepper — side arrow style ──
function NumberStepper({ value, onChange, min = 0, max }: {
  value: string;
  onChange: (val: string) => void;
  min?: number;
  max?: number;
}) {
  const numVal = parseInt(value) || 0;

  const adjust = (delta: number) => {
    let next = numVal + delta;
    if (next < min) next = min;
    if (max !== undefined && next > max) next = max;
    onChange(next.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d+$/.test(val)) {
      onChange(val);
    }
  };

  const handleBlur = () => {
    if (value === "") return;
    let next = parseInt(value) || 0;
    if (next < min) next = min;
    if (max !== undefined && next > max) next = max;
    onChange(next.toString());
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "var(--p-surface-2)",
        border: "1px solid var(--p-border)",
        borderRadius: "var(--p-radius)",
        padding: "3px",
        height: "38px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <button
        type="button"
        onClick={() => adjust(-1)}
        style={{
          height: "100%",
          aspectRatio: "1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--p-surface-3)",
          border: "1px solid var(--p-border)",
          borderRadius: "4px",
          color: "var(--p-text-2)",
          cursor: "pointer",
          outline: "none",
          transition: "all 0.1s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "var(--p-text)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--p-surface-3)"; e.currentTarget.style.color = "var(--p-text-2)"; }}
      >
        <Minus size={13} strokeWidth={2.5} />
      </button>

      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        style={{
          flex: 1,
          minWidth: 0,
          background: "transparent",
          textAlign: "center",
          color: "var(--p-text)",
          fontSize: "13px",
          fontWeight: 600,
          border: "none",
          outline: "none",
          height: "100%",
        }}
      />

      <button
        type="button"
        onClick={() => adjust(1)}
        style={{
          height: "100%",
          aspectRatio: "1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--p-surface-3)",
          border: "1px solid var(--p-border)",
          borderRadius: "4px",
          color: "var(--p-text-2)",
          cursor: "pointer",
          outline: "none",
          transition: "all 0.1s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "var(--p-text)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--p-surface-3)"; e.currentTarget.style.color = "var(--p-text-2)"; }}
      >
        <Plus size={13} strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ── FormSelect — custom dropdown with Framer ──
function FormSelect({ value, onChange, options, placeholder, disabled }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleOpen = () => {
    if (!disabled) setOpen(v => !v);
  };

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        style={{
          width: "100%",
          height: 38,
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "13px",
          background: "var(--p-surface-2)",
          border: "1px solid var(--p-border)",
          borderRadius: "var(--p-radius)",
          color: selected ? "var(--p-text)" : "var(--p-text-3)",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          transition: "border-color 0.15s, background 0.15s",
          textAlign: "left",
        }}
      >
        <span>{selected ? selected.label : (placeholder ?? "Seleccionar...")}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "flex", alignItems: "center", opacity: 0.5 }}
        >
          <ChevronDown size={14} />
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
              width: "100%",
              background: "rgba(24, 24, 27, 0.98)",
              backdropFilter: "blur(12px)",
              border: "1px solid var(--p-border)",
              borderRadius: "var(--p-radius)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              padding: "4px 0",
              transformOrigin: "top center",
            }}
          >
            {options.map(opt => {
              const isActive = opt.value === value;
              const isOptionDisabled = !!opt.disabled;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isOptionDisabled}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 12px",
                    fontSize: "13px",
                    color: isOptionDisabled ? "var(--p-text-3)" : isActive ? "var(--p-accent)" : "var(--p-text)",
                    background: isActive ? "var(--p-accent-soft)" : "transparent",
                    border: "none",
                    cursor: isOptionDisabled ? "not-allowed" : "pointer",
                    opacity: isOptionDisabled ? 0.4 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "background 0.1s, color 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isOptionDisabled && !isActive) {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isOptionDisabled && !isActive) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {isActive ? <span style={{ color: "var(--p-accent)", marginRight: 4 }}>✓</span> : <span style={{ width: 10 }} />}
                  {opt.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── SearchableFormSelect — custom dropdown with search input and Framer ──
function SearchableFormSelect({ value, onChange, options, placeholder, disabled }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleOpen = () => {
    if (!disabled) setOpen(v => !v);
  };

  const filtered = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        style={{
          width: "100%",
          height: 38,
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "13px",
          background: "var(--p-surface-2)",
          border: "1px solid var(--p-border)",
          borderRadius: "var(--p-radius)",
          color: selected ? "var(--p-text)" : "var(--p-text-3)",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          transition: "border-color 0.15s, background 0.15s",
          textAlign: "left",
        }}
      >
        <span>{selected ? selected.label : (placeholder ?? "Seleccionar...")}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "flex", alignItems: "center", opacity: 0.5 }}
        >
          <ChevronDown size={14} />
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
              width: "100%",
              background: "rgba(24, 24, 27, 0.98)",
              backdropFilter: "blur(12px)",
              border: "1px solid var(--p-border)",
              borderRadius: "var(--p-radius)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              padding: "4px 0",
              transformOrigin: "top center",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ padding: "6px 8px", borderBottom: "1px solid var(--p-border)" }}>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                style={{
                  width: "100%",
                  height: "30px",
                  padding: "0 8px",
                  fontSize: "12px",
                  background: "var(--p-surface-3)",
                  border: "1px solid var(--p-border)",
                  borderRadius: "4px",
                  color: "var(--p-text)",
                  outline: "none",
                }}
              />
            </div>
            
            <div style={{ maxHeight: "220px", overflowY: "auto", padding: "4px 0" }}>
              {filtered.length === 0 ? (
                <div style={{ padding: "8px 12px", fontSize: "12px", color: "var(--p-text-3)" }}>
                  No se encontraron resultados
                </div>
              ) : (
                filtered.map(opt => {
                  const isActive = opt.value === value;
                  const isOptionDisabled = !!opt.disabled;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={isOptionDisabled}
                      onClick={() => { onChange(opt.value); setOpen(false); }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 12px",
                        fontSize: "13px",
                        color: isOptionDisabled ? "var(--p-text-3)" : isActive ? "var(--p-accent)" : "var(--p-text)",
                        background: isActive ? "var(--p-accent-soft)" : "transparent",
                        border: "none",
                        cursor: isOptionDisabled ? "not-allowed" : "pointer",
                        opacity: isOptionDisabled ? 0.4 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        transition: "background 0.1s, color 0.1s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isOptionDisabled && !isActive) {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isOptionDisabled && !isActive) {
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      {isActive ? <span style={{ color: "var(--p-accent)", marginRight: 4 }}>✓</span> : <span style={{ width: 10 }} />}
                      {opt.label}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── SectionCard with layout animation ──
function SectionCard({
  title,
  children,
  defaultOpen = true,
  layoutId,
  style = {},
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  layoutId?: string;
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div
      layout
      layoutId={layoutId}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      style={{
        background: "var(--p-surface)",
        border: "1px solid var(--p-border)",
        borderRadius: "var(--p-radius)",
        overflow: open ? "visible" : "hidden",
        ...style,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer"
        style={{ borderBottom: open ? "1px solid var(--p-border)" : "none" }}
      >
        <span className="text-[13px] font-semibold" style={{ color: "var(--p-text)" }}>
          {title}
        </span>
        {open ? <ChevronUp size={15} style={{ color: "var(--p-text-2)" }} /> : <ChevronDown size={15} style={{ color: "var(--p-text-2)" }} />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="p-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Glowing premium Toggle ──
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-[12px] select-none cursor-pointer text-left w-fit max-w-full"
      style={{ color: checked ? "var(--p-text)" : "var(--p-text-2)" }}
    >
      <div
        style={{
          position: "relative",
          width: "38px",
          height: "22px",
          borderRadius: "11px",
          border: "1px solid",
          borderColor: checked ? "rgba(99, 220, 180, 0.4)" : "var(--p-border)",
          background: checked ? "linear-gradient(135deg, var(--p-accent-soft), rgba(99, 220, 180, 0.2))" : "var(--p-surface-3)",
          boxShadow: checked ? "0 0 10px rgba(99, 220, 180, 0.15)" : "none",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
        }}
      >
        <motion.div
          style={{
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            backgroundColor: checked ? "var(--p-accent)" : "#888888",
            boxShadow: checked ? "0 0 6px var(--p-accent)" : "none",
            transition: "background-color 0.2s, box-shadow 0.2s",
          }}
          animate={{
            x: checked ? 20 : 3,
            scale: checked ? 1.05 : 1,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        />
      </div>
      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }} title={label}>
        {label}
      </span>
    </button>
  );
}

// ── ImageDropzone ──
function ImageDropzone({ images, onAdd, onRemove, onReorder, onSetCover }: {
  images: ImageFile[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onReorder: (items: ImageFile[]) => void;
  onSetCover: (id: string) => void;
}) {
  const [draggingOver, setDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDraggingOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length) onAdd(files);
  }, [onAdd]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onAdd(files);
    e.target.value = "";
  };

  const canAdd = images.length < 20;

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDraggingOver(true); }}
        onDragLeave={() => setDraggingOver(false)}
        onDrop={handleDrop}
        onClick={() => canAdd && fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-3 py-10 cursor-pointer"
        style={{
          border: "2px dashed",
          borderColor: draggingOver ? "var(--p-accent)" : "rgba(255,255,255,0.12)",
          background: draggingOver ? "var(--p-accent-soft)" : "var(--p-surface-2)",
          borderRadius: "var(--p-radius)",
          transition: "border-color 0.15s, background 0.15s",
        }}
      >
        <div
          className="w-10 h-10 flex items-center justify-center"
          style={{
            borderRadius: "var(--p-radius)",
            background: "var(--p-surface-3)",
            color: "var(--p-accent)",
          }}
        >
          <Upload size={18} />
        </div>
        <div className="text-center">
          <p className="text-[13px] font-medium" style={{ color: "var(--p-text)" }}>
            Arrastra fotos aquí
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--p-text-2)" }}>
            o haz clic para explorar · hasta 20 fotos · JPG, PNG, WEBP
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
          disabled={!canAdd}
        />
      </div>

      {images.length > 0 && (
        <Reorder.Group axis="y" values={images} onReorder={onReorder} className="space-y-1.5">
          {images.map((img) => (
            <Reorder.Item
              key={img.id}
              value={img}
              className="flex items-center gap-3 p-2 rounded-[6px]"
              style={{
                background: "var(--p-surface-2)",
                border: "1px solid var(--p-border)",
              }}
            >
              <div className="cursor-grab active:cursor-grabbing text-white/30 hover:text-white/60">
                <GripVertical size={14} />
              </div>
              <div className="w-12 h-9 rounded-sm overflow-hidden bg-black/20 flex-shrink-0">
                <img src={img.preview} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white/50 truncate">
                  {img.file ? img.file.name : "Foto de la propiedad"}
                </p>
              </div>
              {img.uploading && (
                <div className="w-20 bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: `${img.progress}%` }} />
                </div>
              )}
              <button
                type="button"
                onClick={() => onSetCover(img.id)}
                className="p-1.5 hover:bg-white/5 rounded-sm transition-colors text-white/30 hover:text-[#C8B49A]"
                style={{ color: img.isCover ? "#C8B49A" : undefined }}
                title="Establecer como portada"
              >
                <Star size={14} fill={img.isCover ? "#C8B49A" : "none"} />
              </button>
              <button
                type="button"
                onClick={() => onRemove(img.id)}
                className="p-1.5 hover:bg-red-500/10 rounded-sm transition-colors text-white/30 hover:text-red-400"
              >
                <X size={14} />
              </button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
    </div>
  );
}

// ── Layout variant detector ──
type LayoutVariant = "residential" | "shared" | "commercial" | "land" | "vacacional" | "hacienda";

function getLayoutVariant(type: string, op: string): LayoutVariant {
  if (op === "vacacional") return "vacacional";
  if (["habitacion", "anexo"].includes(type) && op === "alquiler") return "shared";
  if (["terreno_lote"].includes(type)) return "land";
  if (["hacienda_finca"].includes(type)) return "hacienda";
  if (["galpon", "local", "oficina"].includes(type)) return "commercial";
  return "residential"; // casa, apartamento, townhouse, edificio
}

// ── ImageIcon aliased to avoid collision ──
const _ImageIcon = ImageIcon;

// ── Segmented Progress Bar (Framer Motion) ──
function ProgressBar({ score, recommendations }: { score: number; recommendations: { label: string; weight: number }[] }) {
  const activeColor = score < 35 ? "#ef4444" : score < 80 ? "#f59e0b" : "#10b981";
  const statusLabel = score < 35 ? "Borrador" : score < 80 ? "Incompleto" : "Excelente";

  return (
    <div className="relative group flex flex-col justify-center select-none" style={{ display: "flex", flexDirection: "column", gap: "3px", width: "160px", marginRight: "12px", cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "10px", fontWeight: 500, color: "var(--p-text-3)", letterSpacing: "0.02em" }}>
          Progreso de la Publicación
        </span>
        <span style={{ fontSize: "10px", fontWeight: 600, color: activeColor }}>
          {score}%
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "9px", color: "var(--p-text-3)", fontWeight: 500 }}>0%</span>
        <div style={{ flex: 1, height: "4px", background: "var(--p-surface-3)", borderRadius: "100px", overflow: "hidden", position: "relative" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              height: "100%",
              background: activeColor,
              borderRadius: "100px",
              boxShadow: `0 0 8px ${activeColor}60`,
            }}
          />
        </div>
        <span style={{ fontSize: "9px", color: "var(--p-text-3)", fontWeight: 500 }}>100%</span>
      </div>

      {/* Tooltip on Hover */}
      <div 
        className="absolute top-full mt-2 right-0 p-3 bg-black/95 backdrop-blur-md border border-white/10 rounded shadow-xl text-[11px] w-64 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 text-white leading-normal"
        style={{
          boxShadow: "0 10px 30px -10px rgba(0,0,0,0.7)",
          transformOrigin: "top right",
        }}
      >
        <p className="font-semibold mb-1" style={{ color: activeColor }}>
          Progreso de la Publicación: {score}% ({statusLabel})
        </p>
        <p className="text-white/70 mb-2">
          Este indicador mide la calidad de la información completada. Llena todos los parámetros recomendados para lograr el 100% y aumentar el alcance de tu publicación.
        </p>
        {recommendations.length > 0 && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "6px", marginTop: "6px" }}>
            <p style={{ fontWeight: 600, color: "var(--p-accent)", marginBottom: "4px" }}>Recomendado para completar:</p>
            <ul style={{ paddingLeft: "12px", listStyleType: "disc", color: "rgba(255,255,255,0.85)" }}>
              {recommendations.slice(0, 3).map((rec, i) => (
                <li key={i} style={{ marginBottom: "2px" }}>
                  {rec.label} <span style={{ color: "var(--p-text-3)", fontSize: "9px" }}>(+{rec.weight}%)</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PropertyForm props ──
interface PropertyFormProps {
  locale: string;
  propertyId: string;
}

export function PropertyForm({ locale, propertyId }: PropertyFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INIT);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [zonesList, setZonesList] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const set = (key: keyof FormData, val: any) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const checkApplies = (fieldOrGroup: string): boolean => {
    return checkFieldApplies(fieldOrGroup, form.property_type, form.operation);
  };

  const calculateProgress = (f: FormData, imgs: any[]): { score: number; recommendations: { label: string; weight: number }[] } => {
    let totalWeight = 0;
    let filledWeight = 0;
    const recommendations: { label: string; weight: number }[] = [];

    const checkField = (field: keyof FormData, weight: number, applies: boolean, label: string) => {
      if (!applies) return;
      totalWeight += weight;
      const val = f[field];
      const isFilled = typeof val === "boolean" ? true : (val && val.toString().trim() !== "");
      if (isFilled) {
        filledWeight += weight;
      } else {
        recommendations.push({ label, weight });
      }
    };

    // 1. Contenido
    checkField("title_es", 15, true, "Título (Español)");
    checkField("description_es", 10, true, "Descripción (Español)");

    // 2. Precio
    if (isVacacional) {
      checkField("price_per_night", 10, true, "Precio por Noche");
      checkField("price_weekend", 5, true, "Precio Fin de Semana");
      checkField("min_nights", 5, true, "Noches Mínimas");
      checkField("max_guests", 5, true, "Huéspedes Máximos");
    } else {
      checkField("price", 15, true, "Precio");
      checkField("maintenance_fee", 5, checkApplies("maintenance"), "Monto de Condominio");
    }

    // 3. Dimensiones
    checkField("area_built", 10, checkApplies("area_built"), "Área de Construcción");
    checkField("area_total", 10, true, "Área Total");
    checkField("area_hectares", 10, checkApplies("area_hectares"), "Área en Hectáreas");
    checkField("bedrooms", 5, checkApplies("bedrooms"), "Número de Habitaciones");
    checkField("bathrooms", 5, checkApplies("bathrooms"), "Número de Baños");
    checkField("half_bathrooms", 5, checkApplies("half_bathrooms"), "Medios Baños");
    checkField("parking_spaces", 5, checkApplies("parking"), "Puestos de Estacionamiento");
    checkField("floor_number", 5, checkApplies("floor_number"), "Número de Piso");
    checkField("floors", 5, checkApplies("floors"), "Pisos Totales");
    checkField("year_built", 5, checkApplies("year_built"), "Año de Construcción");
    checkField("condition", 5, checkApplies("condition"), "Estado de Conservación");
    checkField("furnished", 5, checkApplies("furnished"), "Amoblado");

    // 4. Ubicación
    checkField("municipio", 10, true, "Municipio");
    checkField("zone_id", 10, true, "Zona / Sector");
    checkField("address_es", 5, true, "Dirección");
    checkField("lat", 5, true, "Latitud (Mapa)");
    checkField("lng", 5, true, "Longitud (Mapa)");

    // 5. Compartido
    if (hasShared) {
      checkField("bathroom_type", 5, true, "Tipo de Baño");
      checkField("host_housing_type", 5, true, "Vivienda del Anfitrión");
      checkField("cohabitation", 5, true, "Cohabitación");
      checkField("gender_policy", 5, true, "Política de Género");
      checkField("occupants_count", 5, true, "Cantidad de Ocupantes");
      checkField("deposit_amount", 5, true, "Monto de Depósito");
    }

    // 6. Terreno
    if (hasLandSection) {
      checkField("topography", 5, true, "Topografía");
      checkField("access_type", 5, true, "Tipo de Acceso");
      checkField("land_use", 5, true, "Uso de Suelo");
      checkField("current_use", 5, true, "Uso Actual");
    }

    // 7. Media
    checkField("video_url", 5, true, "Enlace de Video");
    checkField("virtual_tour_url", 5, true, "Enlace de Tour Virtual");

    // 8. Imágenes
    totalWeight += 15;
    if (imgs.length > 0) {
      filledWeight += 15;
    } else {
      recommendations.push({ label: "Fotos de la propiedad", weight: 15 });
    }

    const score = totalWeight === 0 ? 0 : Math.round((filledWeight / totalWeight) * 100);
    recommendations.sort((a, b) => b.weight - a.weight);
    return { score, recommendations };
  };

  const variant = getLayoutVariant(form.property_type, form.operation);

  // ── Load Property ──
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const supabase = createClient();
        // 1. Fetch zones list
        const { data: zonesData } = await supabase.from("zones").select("id, name_es").order("name_es", { ascending: true });
        if (zonesData) {
          setZonesList(zonesData.map((z: any) => ({ value: z.id, label: z.name_es })));
        }

        // 2. Fetch property fields
        const { data: prop, error: propErr } = await supabase
          .from("properties")
          .select("*")
          .eq("id", propertyId)
          .single();
        if (propErr || !prop) throw propErr || new Error("Propiedad no encontrada");
        const { data: translations } = await supabase
          .from("property_translations")
          .select("locale, title, description")
          .eq("property_id", propertyId);
        const transEs = (translations as any)?.find((t: any) => t.locale === "es") || {};
        const transEn = (translations as any)?.find((t: any) => t.locale === "en") || {};
        const { data: imgs } = await supabase
          .from("property_images")
          .select("*")
          .eq("property_id", propertyId)
          .order("sort_order", { ascending: true });
        setForm({
          operation: prop.operation || "venta",
          property_type: prop.property_type || "apartamento",
          status: prop.status || "activa",
          listing_badge: prop.listing_badge || "basico",
          completeness_score: prop.completeness_score?.toString() || "0",
          featured: !!prop.featured,
          exclusive: !!prop.exclusive,
          new_listing: !!prop.new_listing,
          price_reduced: !!prop.price_reduced,
          title_es: transEs.title || "",
          description_es: transEs.description || "",
          title_en: transEn.title || "",
          description_en: transEn.description || "",
          price: prop.price?.toString() || "",
          price_currency: prop.price_currency || "USD",
          price_negotiable: !!prop.price_negotiable,
          price_usd: prop.price_usd?.toString() || "",
          maintenance_fee: prop.maintenance_fee?.toString() || "",
          maintenance_included: !!prop.maintenance_included,
          price_per_night: prop.price_per_night?.toString() || "",
          price_weekend: prop.price_weekend?.toString() || "",
          min_nights: prop.min_nights?.toString() || "1",
          max_guests: prop.max_guests?.toString() || "",
          checkin_time: prop.checkin_time || "14:00",
          checkout_time: prop.checkout_time || "11:00",
          house_rules: prop.house_rules || "",
          includes_breakfast: !!prop.includes_breakfast,
          area_built: prop.area_built?.toString() || "",
          area_total: prop.area_total?.toString() || "",
          area_hectares: prop.area_hectares?.toString() || "",
          bedrooms: prop.bedrooms?.toString() || "",
          bathrooms: prop.bathrooms?.toString() || "",
          half_bathrooms: prop.half_bathrooms?.toString() || "",
          parking_spaces: prop.parking_spaces?.toString() || "",
          parking_covered: !!prop.parking_covered,
          floors: prop.total_floors?.toString() || "",
          floor_number: prop.floor_number?.toString() || "",
          property_age: prop.property_age?.toString() || "",
          year_built: prop.year_built?.toString() || (prop.property_age ? (new Date().getFullYear() - prop.property_age).toString() : ""),
          condition: prop.condition || "",
          furnished: prop.furnished || "sin_muebles",
          municipio: prop.municipio || "",
          zone_id: prop.zone_id || "",
          address_es: prop.address_es || "",
          address_en: prop.address_en || "",
          lat: prop.lat?.toString() || "",
          lng: prop.lng?.toString() || "",
          show_exact_location: !!prop.show_exact_location,
          has_elevator: !!prop.has_elevator,
          has_water_tank: !!prop.has_water_tank,
          has_hot_water: !!prop.has_hot_water,
          has_generator: !!prop.has_generator,
          gas_type: prop.gas_type || "",
          has_internet: !!prop.has_internet,
          has_security_24h: !!prop.has_security_24h,
          has_electric_gate: !!prop.has_electric_gate,
          has_cctv: !!prop.has_cctv,
          has_electric_fence: !!prop.has_electric_fence,
          has_intercom: !!prop.has_intercom,
          has_armored_door: !!prop.has_armored_door,
          has_ac: !!prop.has_ac,
          has_heating: !!prop.has_heating,
          kitchen_type: prop.kitchen_type || "",
          bathroom_type: prop.bathroom_type || "",
          host_housing_type: prop.host_housing_type || "",
          cohabitation: prop.cohabitation || "",
          occupants_count: prop.occupants_count?.toString() || "",
          gender_policy: prop.gender_policy || "",
          deposit_required: !!prop.deposit_required,
          deposit_amount: prop.deposit_amount?.toString() || "",
          allows_pets: !!prop.allows_pets,
          allows_cooking: !!prop.allows_cooking,
          has_independent_entrance: !!prop.has_independent_entrance,
          topography: prop.topography || "",
          land_use: prop.land_use || "",
          access_type: prop.access_type || "",
          current_use: prop.current_use || "",
          has_own_water: !!prop.has_own_water,
          video_url: prop.video_url || "",
          virtual_tour_url: prop.virtual_tour_url || "",
        });
        if (imgs) {
          setImages(
            imgs.map((im: any) => ({
              id: im.id,
              preview: im.url,
              url: im.url,
              isCover: !!im.is_cover,
              uploading: false,
              progress: 100,
            }))
          );
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar la propiedad");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [propertyId]);

  // ── Image Handlers ──
  const handleAddImages = (files: File[]) => {
    const space = 20 - images.length;
    const added = files.slice(0, space).map((f) => ({
      id: Math.random().toString(36).substring(2, 9),
      file: f,
      preview: URL.createObjectURL(f),
      isCover: false,
      uploading: false,
      progress: 0,
    }));
    setImages((prev) => {
      const next = [...prev, ...added];
      if (next.length > 0 && !next.some((x) => x.isCover) && next[0]) {
        next[0].isCover = true;
      }
      return next;
    });
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((x) => x.id === id);
      if (target && target.url) {
        setRemovedImages((r) => [...r, target.id]);
      }
      const filtered = prev.filter((x) => x.id !== id);
      if (target?.isCover && filtered.length > 0 && filtered[0]) {
        filtered[0].isCover = true;
      }
      return filtered;
    });
  };

  const handleSetCover = (id: string) => {
    setImages((prev) => prev.map((img) => ({ ...img, isCover: img.id === id })));
  };

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const { score: currentProgress } = calculateProgress(form, images);
    setSaving(true);
    try {
      const supabase = createClient();
      const { error: propErr } = await supabase
        .from("properties")
        .update({
          operation: form.operation,
          property_type: form.property_type,
          status: form.status,
          price: parseFloat(form.price) || 0,
          price_currency: form.price_currency,
          price_negotiable: form.price_negotiable,
          price_usd: form.price_usd ? parseFloat(form.price_usd) : null,
          maintenance_fee: form.maintenance_fee ? parseFloat(form.maintenance_fee) : null,
          maintenance_included: form.maintenance_included,
          price_per_night: form.price_per_night ? parseFloat(form.price_per_night) : null,
          price_weekend: form.price_weekend ? parseFloat(form.price_weekend) : null,
          min_nights: form.min_nights ? parseInt(form.min_nights) : 1,
          max_guests: form.max_guests ? parseInt(form.max_guests) : null,
          checkin_time: form.checkin_time || null,
          checkout_time: form.checkout_time || null,
          house_rules: form.house_rules || null,
          includes_breakfast: form.includes_breakfast,
          area_built: form.area_built ? parseFloat(form.area_built) : null,
          area_total: form.area_total ? parseFloat(form.area_total) : null,
          area_hectares: form.area_hectares ? parseFloat(form.area_hectares) : null,
          bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
          bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
          half_bathrooms: form.half_bathrooms ? parseInt(form.half_bathrooms) : null,
          parking_spaces: form.parking_spaces ? parseInt(form.parking_spaces) : null,
          parking_covered: form.parking_covered,
          total_floors: form.floors ? parseInt(form.floors) : null,
          floor_number: form.floor_number ? parseInt(form.floor_number) : null,
          year_built: form.year_built ? parseInt(form.year_built) : null,
          property_age: form.year_built ? (new Date().getFullYear() - parseInt(form.year_built)) : (form.property_age ? parseInt(form.property_age) : null),
          condition: form.condition || null,
          furnished: form.furnished || "sin_muebles",
          municipio: form.municipio || null,
          zone_id: form.zone_id || null,
          address_es: form.address_es || null,
          address_en: form.address_en || null,
          lat: form.lat ? parseFloat(form.lat) : null,
          lng: form.lng ? parseFloat(form.lng) : null,
          show_exact_location: form.show_exact_location,
          has_water_tank: form.has_water_tank,
          has_hot_water: form.has_hot_water,
          has_generator: form.has_generator,
          gas_type: form.gas_type || null,
          has_internet: form.has_internet,
          has_security_24h: form.has_security_24h,
          has_electric_gate: form.has_electric_gate,
          has_cctv: form.has_cctv,
          has_electric_fence: form.has_electric_fence,
          has_intercom: form.has_intercom,
          has_armored_door: form.has_armored_door,
          has_ac: form.has_ac,
          has_heating: form.has_heating,
          kitchen_type: form.kitchen_type || null,
          bathroom_type: form.bathroom_type || null,
          host_housing_type: form.host_housing_type || null,
          cohabitation: form.cohabitation || null,
          occupants_count: form.occupants_count ? parseInt(form.occupants_count) : null,
          gender_policy: form.gender_policy || null,
          deposit_required: form.deposit_required,
          deposit_amount: form.deposit_amount ? parseFloat(form.deposit_amount) : null,
          allows_pets: form.allows_pets,
          allows_cooking: form.allows_cooking,
          has_independent_entrance: form.has_independent_entrance,
          topography: form.topography || null,
          land_use: form.land_use || null,
          access_type: form.access_type || null,
          current_use: form.current_use || null,
          has_own_water: form.has_own_water,
          video_url: form.video_url || null,
          virtual_tour_url: form.virtual_tour_url || null,
          listing_badge: form.listing_badge || "basico",
          completeness_score: currentProgress,
        })
        .eq("id", propertyId);
      if (propErr) throw propErr;
      await supabase.from("property_translations").upsert([
        { property_id: propertyId, locale: "es", title: form.title_es, description: form.description_es || null },
        { property_id: propertyId, locale: "en", title: form.title_en || form.title_es, description: form.description_en || null },
      ], { onConflict: "property_id,locale" });
      if (removedImages.length > 0) {
        await supabase.from("property_images").delete().in("id", removedImages);
        setRemovedImages([]);
      }
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (!img) continue;
        if (img.url) {
          await supabase.from("property_images").update({ sort_order: i, is_cover: img.isCover }).eq("id", img.id);
        } else if (img.file) {
          const currentId = img.id;
          const currentIsCover = img.isCover;
          setImages((prev) => prev.map((x) => x.id === currentId ? { ...x, uploading: true, progress: 15 } : x));
          const ext = img.file.name.split(".").pop();
          const path = `properties/${propertyId}/${Date.now()}-${i}.${ext}`;
          const { data: uploaded, error: upErr } = await supabase.storage
            .from("property-images")
            .upload(path, img.file, { upsert: false, cacheControl: "31536000" });
          setImages((prev) => prev.map((x) => x.id === currentId ? { ...x, progress: 80 } : x));
          if (!upErr && uploaded) {
            const { data: { publicUrl } } = supabase.storage.from("property-images").getPublicUrl(path);
            const { data: insertedImg } = await supabase.from("property_images").insert({
              property_id: propertyId, url: publicUrl, is_cover: currentIsCover, sort_order: i,
              alt_es: form.title_es, alt_en: form.title_es,
            }).select().single();
            if (insertedImg) {
              setImages((prev) => prev.map((x) => x.id === currentId
                ? { ...x, id: insertedImg.id, url: publicUrl, file: undefined, uploading: false, progress: 100 }
                : x
              ));
            }
          } else {
            setImages((prev) => prev.map((x) => x.id === currentId ? { ...x, uploading: false } : x));
          }
        }
      }
      setSuccess("Propiedad guardada correctamente");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "var(--p-accent)" }} />
        <p className="text-xs text-[var(--p-text-3)] font-mono mt-3">
          Cargando datos de la propiedad...
        </p>
      </div>
    );
  }

  // ── Derived sections ──
  const isLand = variant === "land";
  const isShared = variant === "shared";
  const isVacacional = variant === "vacacional";
  const isHacienda = variant === "hacienda";
  const isCommercial = variant === "commercial";
  const hasServices = checkApplies("services_section");
  const hasSecurity = checkApplies("security_section");
  const hasShared = checkApplies("shared_section");
  const hasLandSection = checkApplies("land_section");

  // ─── SECTION COMPONENTS ───────────────────────────────────────────────────

  // Clasificación — full width at top, always visible
  const sectionClasificacion = (
    <SectionCard title="Clasificación y Publicación" layoutId="sec-clasificacion">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "16px" }}>
        <div>
          <Label>Operación</Label>
          <FormSelect
            value={form.operation}
            onChange={(val) => set("operation", val)}
            options={[
              { value: "venta", label: "Venta", disabled: isCombinationInconsistent(form.property_type, "venta") },
              { value: "alquiler", label: "Alquiler", disabled: isCombinationInconsistent(form.property_type, "alquiler") },
              { value: "vacacional", label: "Vacacional", disabled: isCombinationInconsistent(form.property_type, "vacacional") },
            ].sort((a, b) => a.label.localeCompare(b.label))}
          />
        </div>
        <div>
          <Label>Tipo de inmueble</Label>
          <FormSelect
            value={form.property_type}
            onChange={(val) => set("property_type", val)}
            options={["apartamento", "casa", "townhouse", "anexo", "edificio", "galpon", "habitacion", "hacienda_finca", "local", "oficina", "terreno_lote"].map((t) => ({
              value: t,
              label: capitalize(t),
              disabled: isCombinationInconsistent(t, form.operation),
            })).sort((a, b) => a.label.localeCompare(b.label))}
          />
        </div>
        <div>
          <Label>Estado</Label>
          <FormSelect
            value={form.status}
            onChange={(val) => set("status", val)}
            options={[
              { value: "activa", label: "Activa" },
              { value: "reservada", label: "Reservada" },
              { value: "vendida", label: "Vendida" },
              { value: "alquilada", label: "Alquilada" },
              { value: "cerrada", label: "Cerrada" },
            ].sort((a, b) => a.label.localeCompare(b.label))}
          />
        </div>
        <div>
          <Label>Insignia (Badge)</Label>
          <FormSelect
            value={form.listing_badge}
            onChange={(val) => set("listing_badge", val)}
            options={[
              { value: "basico", label: "Básico" },
              { value: "destacado", label: "Destacado" },
              { value: "oportunidad", label: "Oportunidad" },
              { value: "ultima_unidad", label: "Última Unidad" },
              { value: "exclusivo", label: "Exclusivo" },
            ].sort((a, b) => a.label.localeCompare(b.label))}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-3 mt-4 pt-4" style={{ borderTop: "1px solid var(--p-border)" }}>
        <Toggle checked={form.featured} onChange={(v) => set("featured", v)} label="Destacada" />
        <Toggle checked={form.exclusive} onChange={(v) => set("exclusive", v)} label="Exclusiva" />
        <Toggle checked={form.new_listing} onChange={(v) => set("new_listing", v)} label="Nueva publicación" />
        <Toggle checked={form.price_reduced} onChange={(v) => set("price_reduced", v)} label="Precio reducido" />
      </div>
    </SectionCard>
  );

  // Contenido multi-idioma — always left
  const sectionContenido = (
    <SectionCard title="Contenido de la publicación" layoutId="sec-contenido">
      <div className="space-y-4">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <Label>Título (Español)</Label>
            <input value={form.title_es} onChange={(e) => set("title_es", e.target.value)} placeholder="Ej: Apartamento duplex en La Pedregosa" style={INPUT.base} required />
          </div>
          <div>
            <Label>Título (Inglés)</Label>
            <input value={form.title_en} onChange={(e) => set("title_en", e.target.value)} placeholder="Ej: Duplex apartment in La Pedregosa" style={INPUT.base} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <Label>Descripción (Español)</Label>
            <textarea value={form.description_es} onChange={(e) => set("description_es", e.target.value)} placeholder="Descripción en español..." style={INPUT.textarea} />
          </div>
          <div>
            <Label>Descripción (Inglés)</Label>
            <textarea value={form.description_en} onChange={(e) => set("description_en", e.target.value)} placeholder="Description in English..." style={INPUT.textarea} />
          </div>
        </div>
      </div>
    </SectionCard>
  );

  // Precio — left
  const sectionPrecio = (
    <SectionCard title={isVacacional ? "Precio Base y Tarifas" : "Precio y Condiciones Financieras"} layoutId="sec-precio">
      {isVacacional ? (
        <div className="space-y-4">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px" }}>
            <div>
              <Label>Precio por noche (USD)</Label>
              <FormattedNumberInput value={form.price_per_night} onChange={(val) => set("price_per_night", val)} style={INPUT.base} />
            </div>
            <div>
              <Label>Tarifa fines de semana</Label>
              <FormattedNumberInput value={form.price_weekend} onChange={(val) => set("price_weekend", val)} style={INPUT.base} />
            </div>
            <div>
              <Label>Precio base (referencia)</Label>
              <FormattedNumberInput value={form.price} onChange={(val) => set("price", val)} style={INPUT.base} />
            </div>
            <div>
              <Label>Moneda base</Label>
              <FormSelect
                value={form.price_currency}
                onChange={(val) => set("price_currency", val)}
                options={[
                  { value: "USD", label: "USD ($)" },
                  { value: "EUR", label: "EUR (€)" },
                  { value: "VES", label: "VES (Bs.)" },
                ]}
              />
            </div>
            <div>
              <Label>Mínimo de noches</Label>
              <NumberStepper value={form.min_nights} onChange={(val) => set("min_nights", val)} min={1} />
            </div>
            <div>
              <Label>Máximo de huéspedes</Label>
              <NumberStepper value={form.max_guests} onChange={(val) => set("max_guests", val)} min={1} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <Label>Hora Check-in</Label>
              <FormSelect
                value={form.checkin_time}
                onChange={(val) => set("checkin_time", val)}
                options={["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"].map(t => ({ value: t, label: t }))}
              />
            </div>
            <div>
              <Label>Hora Check-out</Label>
              <FormSelect
                value={form.checkout_time}
                onChange={(val) => set("checkout_time", val)}
                options={["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"].map(t => ({ value: t, label: t }))}
              />
            </div>
          </div>
          <div>
            <Label>Normas de la casa / House Rules</Label>
            <textarea value={form.house_rules} onChange={(e) => set("house_rules", e.target.value)} placeholder="Normas de convivencia, políticas de ruido..." style={INPUT.textarea} />
          </div>
          <Toggle checked={form.includes_breakfast} onChange={(v) => set("includes_breakfast", v)} label="Incluye desayuno" />
        </div>
      ) : (
        <div className="space-y-4">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px" }}>
            <div>
              <Label>{form.operation === "alquiler" ? "Canon mensual" : "Precio base"}</Label>
              <FormattedNumberInput value={form.price} onChange={(val) => set("price", val)} style={INPUT.base} required />
            </div>
            <div>
              <Label>Moneda base</Label>
              <FormSelect
                value={form.price_currency}
                onChange={(val) => set("price_currency", val)}
                options={[
                  { value: "USD", label: "USD ($)" },
                  { value: "EUR", label: "EUR (€)" },
                  { value: "VES", label: "VES (Bs.)" },
                ]}
              />
            </div>
            {checkApplies("maintenance") && (
              <div>
                <Label>Cuota de condominio</Label>
                <FormattedNumberInput value={form.maintenance_fee} onChange={(val) => set("maintenance_fee", val)} style={INPUT.base} />
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <Toggle checked={form.price_negotiable} onChange={(v) => set("price_negotiable", v)} label="Precio negociable" />
            {checkApplies("maintenance") && form.operation === "alquiler" && (
              <Toggle checked={form.maintenance_included} onChange={(v) => set("maintenance_included", v)} label="Condominio incluido en el canon" />
            )}
          </div>
        </div>
      )}
    </SectionCard>
  );

  // Dimensiones — left (content adapted per variant)
  const dimCols = "repeat(auto-fill, minmax(180px, 1fr))";

  const sectionDimensiones = !isLand ? (
    <SectionCard title="Dimensiones y Estructura" layoutId="sec-dimensiones">
      <div style={{ display: "grid", gridTemplateColumns: dimCols, gap: "16px" }}>
        {checkApplies("area_built") && (
          <div>
            <Label>Área construida (m²)</Label>
            <FormattedNumberInput value={form.area_built} onChange={(val) => set("area_built", val)} style={INPUT.base} />
          </div>
        )}
        <div>
          <Label>Área total terreno (m²)</Label>
          <FormattedNumberInput value={form.area_total} onChange={(val) => set("area_total", val)} style={INPUT.base} />
        </div>
        {checkApplies("area_hectares") && (
          <div>
            <Label>Área en hectáreas</Label>
            <FormattedNumberInput value={form.area_hectares} onChange={(val) => set("area_hectares", val)} style={INPUT.base} />
          </div>
        )}
        {checkApplies("bedrooms") && (
          <div>
            <Label>Habitaciones</Label>
            <NumberStepper value={form.bedrooms} onChange={(val) => set("bedrooms", val)} min={0} />
          </div>
        )}
        {checkApplies("bathrooms") && (
          <div>
            <Label>Baños completos</Label>
            <NumberStepper value={form.bathrooms} onChange={(val) => set("bathrooms", val)} min={0} />
          </div>
        )}
        {checkApplies("half_bathrooms") && (
          <div>
            <Label>Medios baños</Label>
            <NumberStepper value={form.half_bathrooms} onChange={(val) => set("half_bathrooms", val)} min={0} />
          </div>
        )}
        {checkApplies("parking") && (
          <div>
            <Label>Estacionamientos</Label>
            <NumberStepper value={form.parking_spaces} onChange={(val) => set("parking_spaces", val)} min={0} />
          </div>
        )}
        {checkApplies("floor_number") && (
          <div>
            <Label>Número de piso</Label>
            <NumberStepper value={form.floor_number} onChange={(val) => set("floor_number", val)} min={0} />
          </div>
        )}
        {checkApplies("floors") && (
          <div>
            <Label>Pisos totales</Label>
            <NumberStepper value={form.floors} onChange={(val) => set("floors", val)} min={0} />
          </div>
        )}
        {checkApplies("year_built") && (
          <div>
            <Label>Año de construcción</Label>
            <input type="number" value={form.year_built} onChange={(e) => set("year_built", e.target.value)} placeholder="Ej: 2015" style={INPUT.base} />
          </div>
        )}
        {checkApplies("condition") && (
          <div>
            <Label>Estado de conservación</Label>
            <FormSelect
              value={form.condition}
              onChange={(val) => set("condition", val)}
              placeholder="Seleccionar..."
              options={[
                { value: "nuevo", label: "Nuevo / A estrenar" },
                { value: "excelente", label: "Excelente" },
                { value: "bueno", label: "Buen estado" },
                { value: "por_remodelar", label: "Por remodelar" },
                { value: "en_gris", label: "En obra gris" },
              ].sort((a, b) => a.label.localeCompare(b.label))}
            />
          </div>
        )}
        {checkApplies("furnished") && (
          <div>
            <Label>Mobiliario</Label>
            <FormSelect
              value={form.furnished}
              onChange={(val) => set("furnished", val)}
              options={[
                { value: "sin_muebles", label: "Sin muebles" },
                { value: "semi_amueblado", label: "Semi amoblado" },
                { value: "completamente_amueblado", label: "Amoblado" },
              ].sort((a, b) => a.label.localeCompare(b.label))}
            />
          </div>
        )}
      </div>
      {checkApplies("parking") && (
        <div className="mt-3">
          <Toggle checked={form.parking_covered} onChange={(v) => set("parking_covered", v)} label="Estacionamiento techado" />
        </div>
      )}
    </SectionCard>
  ) : null;

  // Fotos — always left
  const sectionFotos = (
    <SectionCard title="Fotos de la propiedad (hasta 20)" layoutId="sec-fotos">
      <ImageDropzone
        images={images}
        onAdd={handleAddImages}
        onRemove={handleRemoveImage}
        onReorder={setImages}
        onSetCover={handleSetCover}
      />
    </SectionCard>
  );

  // Ubicación — right
  const sectionUbicacion = (
    <SectionCard title="Ubicación" layoutId="sec-ubicacion">
      <div className="space-y-3">
        <div>
          <Label>Municipio</Label>
          <FormSelect
            value={form.municipio}
            onChange={(val) => set("municipio", val)}
            placeholder="Seleccionar..."
            options={[
              { value: "libertador", label: "Libertador" },
              { value: "campo_elias", label: "Campo Elías" },
              { value: "santos_marquina", label: "Santos Marquina" },
              { value: "sucre", label: "Sucre" },
              { value: "rangel", label: "Rangel" },
            ].sort((a, b) => a.label.localeCompare(b.label))}
          />
        </div>
        <div>
          <Label>Dirección (Español)</Label>
          <input value={form.address_es} onChange={(e) => set("address_es", e.target.value)} placeholder="Calle, edificio..." style={INPUT.base} />
        </div>
        <div>
          <Label>Dirección (Inglés)</Label>
          <input value={form.address_en} onChange={(e) => set("address_en", e.target.value)} placeholder="Street name, reference..." style={INPUT.base} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <Label>Latitud</Label>
            <input type="number" step="any" value={form.lat} onChange={(e) => set("lat", e.target.value)} placeholder="8.59" style={INPUT.base} />
          </div>
          <div>
            <Label>Longitud</Label>
            <input type="number" step="any" value={form.lng} onChange={(e) => set("lng", e.target.value)} placeholder="-71.14" style={INPUT.base} />
          </div>
        </div>
        <div>
          <Label>Zona / Sector</Label>
          <SearchableFormSelect
            value={form.zone_id}
            onChange={(val) => set("zone_id", val)}
            placeholder="Seleccionar zona..."
            options={zonesList}
          />
        </div>
        <Toggle checked={form.show_exact_location} onChange={(v) => set("show_exact_location", v)} label="Mostrar ubicación exacta" />
      </div>
    </SectionCard>
  );

  // Servicios + Seguridad combinados — right
  const sectionServiciosSeguridad = (hasServices || hasSecurity) ? (
    <SectionCard title="Servicios, Amenidades y Seguridad" layoutId="sec-servicios">
      <div className="space-y-4">
        {hasServices && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <Label>Tipo de gas</Label>
                <FormSelect
                  value={form.gas_type}
                  onChange={(val) => set("gas_type", val)}
                  placeholder="Seleccionar..."
                  options={[
                    { value: "bombona", label: "Bombona" },
                    { value: "directo", label: "Gas directo" },
                    { value: "no_tiene", label: "No tiene" },
                  ].sort((a, b) => a.label.localeCompare(b.label))}
                />
              </div>
              <div>
                <Label>Cocina</Label>
                <FormSelect
                  value={form.kitchen_type}
                  onChange={(val) => set("kitchen_type", val)}
                  placeholder="Seleccionar..."
                  options={[
                    { value: "gas", label: "A gas" },
                    { value: "electrica", label: "Eléctrica" },
                    { value: "induccion", label: "Inducción" },
                    { value: "mixta", label: "Mixta" },
                    { value: "no_tiene", label: "No tiene" },
                  ].sort((a, b) => a.label.localeCompare(b.label))}
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
              <Toggle checked={form.has_water_tank} onChange={(v) => set("has_water_tank", v)} label="Tanque de agua" />
              <Toggle checked={form.has_hot_water} onChange={(v) => set("has_hot_water", v)} label="Agua caliente" />
              <Toggle checked={form.has_generator} onChange={(v) => set("has_generator", v)} label="Generador" />
              <Toggle checked={form.has_internet} onChange={(v) => set("has_internet", v)} label="Internet" />
              <Toggle checked={form.has_ac} onChange={(v) => set("has_ac", v)} label="Aire acondicionado" />
              <Toggle checked={form.has_heating} onChange={(v) => set("has_heating", v)} label="Calefacción" />
              {checkApplies("elevator") && (
                <Toggle checked={form.has_elevator} onChange={(v) => set("has_elevator", v)} label="Ascensor" />
              )}
              {checkApplies("has_independent_entrance") && !hasShared && (
                <Toggle checked={form.has_independent_entrance} onChange={(v) => set("has_independent_entrance", v)} label="Entrada independiente" />
              )}
            </div>
          </>
        )}
        {hasSecurity && (
          <>
            {hasServices && (
              <div style={{ height: 1, background: "var(--p-border)", margin: "4px 0" }} />
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
              <Toggle checked={form.has_security_24h} onChange={(v) => set("has_security_24h", v)} label="Seguridad 24h" />
              <Toggle checked={form.has_electric_gate} onChange={(v) => set("has_electric_gate", v)} label="Portón eléctrico" />
              <Toggle checked={form.has_cctv} onChange={(v) => set("has_cctv", v)} label="CCTV / Cámaras" />
              {checkApplies("has_electric_fence") && (
                <Toggle checked={form.has_electric_fence} onChange={(v) => set("has_electric_fence", v)} label="Cerco eléctrico" />
              )}
              <Toggle checked={form.has_intercom} onChange={(v) => set("has_intercom", v)} label="Intercomunicador" />
              <Toggle checked={form.has_armored_door} onChange={(v) => set("has_armored_door", v)} label="Puerta blindada" />
            </div>
          </>
        )}
      </div>
    </SectionCard>
  ) : null;

  // Compartido/Habitación — shared variant only
  const sectionCompartido = hasShared ? (
    <SectionCard title="Condiciones de Habitación" layoutId="sec-compartido" defaultOpen={isShared}>
      <div className="space-y-4">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px 16px" }}>
          <div>
            <Label>Tipo de baño</Label>
            <FormSelect value={form.bathroom_type} onChange={(val) => set("bathroom_type", val)} placeholder="Seleccionar..." options={[{ value: "privado", label: "Baño privado" }, { value: "compartido", label: "Baño compartido" }].sort((a, b) => a.label.localeCompare(b.label))} />
          </div>
          <div>
            <Label>Vivienda del anfitrión</Label>
            <FormSelect value={form.host_housing_type} onChange={(val) => set("host_housing_type", val)} placeholder="Seleccionar..." options={[{ value: "casa", label: "Casa" }, { value: "apartamento", label: "Apartamento" }].sort((a, b) => a.label.localeCompare(b.label))} />
          </div>
          <div>
            <Label>Cohabitación</Label>
            <FormSelect value={form.cohabitation} onChange={(val) => set("cohabitation", val)} placeholder="Seleccionar..." options={[{ value: "solo_inquilinos", label: "Solo inquilinos" }, { value: "con_propietario", label: "Con propietario" }].sort((a, b) => a.label.localeCompare(b.label))} />
          </div>
          <div>
            <Label>Política de género</Label>
            <FormSelect value={form.gender_policy} onChange={(val) => set("gender_policy", val)} placeholder="Seleccionar..." options={[{ value: "mixto", label: "Mixto" }, { value: "solo_mujeres", label: "Solo mujeres" }, { value: "solo_hombres", label: "Solo hombres" }].sort((a, b) => a.label.localeCompare(b.label))} />
          </div>
          <div>
            <Label>Ocupantes actuales</Label>
            <NumberStepper value={form.occupants_count} onChange={(val) => set("occupants_count", val)} min={0} />
          </div>
          <div>
            <Label>Monto depósito (USD)</Label>
            <FormattedNumberInput value={form.deposit_amount} onChange={(val) => set("deposit_amount", val)} style={INPUT.base} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px 16px", borderTop: "1px solid var(--p-border)", paddingTop: "12px" }}>
          <Toggle checked={form.deposit_required} onChange={(v) => set("deposit_required", v)} label="Requiere depósito" />
          <Toggle checked={form.allows_pets} onChange={(v) => set("allows_pets", v)} label="Acepta mascotas" />
          <Toggle checked={form.allows_cooking} onChange={(v) => set("allows_cooking", v)} label="Permite cocinar" />
          <Toggle checked={form.has_independent_entrance} onChange={(v) => set("has_independent_entrance", v)} label="Entrada independiente" />
        </div>
      </div>
    </SectionCard>
  ) : null;

  // Terreno y Campo — right for hacienda, main for land
  const sectionTerreno = hasLandSection ? (
    <SectionCard title="Parámetros de Terreno y Campo" layoutId="sec-terreno" defaultOpen={isLand}>
      <div style={{ display: "grid", gridTemplateColumns: isLand ? "repeat(3, 1fr)" : "repeat(2, 1fr)", gap: "12px 16px" }}>
        <div>
          <Label>Topografía</Label>
          <FormSelect value={form.topography} onChange={(val) => set("topography", val)} placeholder="Seleccionar..." options={[{ value: "plano", label: "Plano" }, { value: "inclinado", label: "Semi-inclinado" }, { value: "irregular", label: "Irregular / Quebrado" }].sort((a, b) => a.label.localeCompare(b.label))} />
        </div>
        <div>
          <Label>Vía de acceso</Label>
          <FormSelect value={form.access_type} onChange={(val) => set("access_type", val)} placeholder="Seleccionar..." options={[{ value: "asfalto", label: "Asfalto / Pavimento" }, { value: "tierra", label: "Tierra / Granzón" }, { value: "concreto", label: "Concreto" }].sort((a, b) => a.label.localeCompare(b.label))} />
        </div>
        <div>
          <Label>Uso del suelo</Label>
          <input value={form.land_use} onChange={(e) => set("land_use", e.target.value)} placeholder="Ej: Residencial, Agrícola" style={INPUT.base} />
        </div>
        <div>
          <Label>Uso actual</Label>
          <input value={form.current_use} onChange={(e) => set("current_use", e.target.value)} placeholder="Ej: Cultivo, Vacío" style={INPUT.base} />
        </div>
        {isLand && (
          <div>
            <Label>Área en hectáreas</Label>
            <FormattedNumberInput value={form.area_hectares} onChange={(val) => set("area_hectares", val)} style={INPUT.base} />
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", minHeight: "38px", paddingTop: "14px" }}>
          <Toggle checked={form.has_own_water} onChange={(v) => set("has_own_water", v)} label="Agua propia (Manantial / Pozo)" />
        </div>
      </div>
    </SectionCard>
  ) : null;

  // Media — right
  const sectionMedia = (
    <SectionCard title="Video y Tour Virtual" layoutId="sec-media" defaultOpen={false}>
      <div className="space-y-3">
        <div>
          <Label>Video (YouTube / Vimeo)</Label>
          <div className="relative">
            <Video size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--p-text-3)" }} />
            <input value={form.video_url} onChange={(e) => set("video_url", e.target.value)} placeholder="https://youtube.com/watch?v=..." style={{ ...INPUT.base, paddingLeft: "36px" }} />
          </div>
        </div>
        <div>
          <Label>Tour virtual (Matterport u otro)</Label>
          <div className="relative">
            <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--p-text-3)" }} />
            <input value={form.virtual_tour_url} onChange={(e) => set("virtual_tour_url", e.target.value)} placeholder="https://matterport.com/..." style={{ ...INPUT.base, paddingLeft: "36px" }} />
          </div>
        </div>
      </div>
    </SectionCard>
  );

  // ─── RENDER ──────────────────────────────────────────────────────────────

    const progressData = calculateProgress(form, images);
    const progressScore = progressData.score;

    return (
      <form onSubmit={handleSubmit} style={{ width: "100%", textAlign: "left" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(`/${locale}/panel/propiedades`)}
              className="w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors"
              style={{ borderRadius: "var(--p-radius)", background: "var(--p-surface)", border: "1px solid var(--p-border)", color: "var(--p-text-2)" }}
            >
              <ArrowLeft size={14} />
            </button>
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-[18px] font-semibold" style={{ color: "var(--p-text)" }}>
                  Editar propiedad
                </h2>
                <p className="text-[12px]" style={{ color: "var(--p-text-2)" }}>
                  Modifica la información y fotos de la publicación
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ProgressBar score={progressScore} recommendations={progressData.recommendations} />
            <button
              type="button"
              onClick={() => router.push(`/${locale}/panel/propiedades`)}
              className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-pointer"
              style={{ borderRadius: "var(--p-radius)", background: "var(--p-surface-2)", border: "1px solid var(--p-border)", color: "var(--p-text-2)" }}
            >
              <X size={14} />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-pointer"
              style={{ borderRadius: "var(--p-radius)", background: saving ? "var(--p-surface-3)" : "var(--p-accent)", color: saving ? "var(--p-text-2)" : "#0E0D0C", opacity: saving ? 0.7 : 1 }}
            >
              <Save size={14} />
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>



        {/* Alerts */}
        <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="px-4 py-3 text-[13px] mb-4"
            style={{ borderRadius: "var(--p-radius)", background: "rgba(76,175,125,0.12)", border: "1px solid rgba(76,175,125,0.2)", color: "var(--p-green)" }}
          >
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="px-4 py-3 text-[13px] mb-4"
            style={{ borderRadius: "var(--p-radius)", background: "rgba(192,96,90,0.12)", border: "1px solid rgba(192,96,90,0.2)", color: "var(--p-red)" }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {isCombinationInconsistent(form.property_type, form.operation) && (
        <div className="px-4 py-3 text-[12px] rounded mb-4" style={{ background: "rgba(212,146,74,0.12)", border: "1px solid rgba(212,146,74,0.2)", color: "#D4924A" }}>
          ⚠️ <strong>Aviso de inconsistencia lógica:</strong> La combinación {capitalize(form.property_type)} × {capitalize(form.operation)} no está recomendada. Es solo informativo.
        </div>
      )}

      <LayoutGroup id={`prop-form-${propertyId}`}>
        {/* Clasificación — Full width at top */}
        <motion.div layout className="mb-4">
          {sectionClasificacion}
        </motion.div>

        {/* Two column main layout */}
        <div className="prop-form-two-col">
          {/* ─── LEFT COLUMN ─── */}
          <motion.div layout className="space-y-4">
            {sectionContenido}
            {sectionPrecio}
            {sectionDimensiones}
            {hasShared && sectionCompartido}
            {/* For land variant: show terreno details in left as part of main content */}
            {isLand && sectionTerreno}
            {sectionFotos}
          </motion.div>

          {/* ─── RIGHT COLUMN ─── */}
          <motion.div layout className="space-y-4">
            {sectionUbicacion}
            <AnimatePresence mode="sync">
              {!isLand && hasLandSection && (
                <motion.div key="sec-terreno-wrap" layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: "spring", stiffness: 280, damping: 28 }}>
                  {sectionTerreno}
                </motion.div>
              )}
              {(hasServices || hasSecurity) && (
                <motion.div key="sec-servicios-wrap" layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: "spring", stiffness: 280, damping: 28 }}>
                  {sectionServiciosSeguridad}
                </motion.div>
              )}
            </AnimatePresence>
            {sectionMedia}
          </motion.div>
        </div>

        {/* Bottom actions */}
        <motion.div layout className="flex justify-between pt-6 pb-8 mt-4">
          <button
            type="button"
            onClick={() => router.push(`/${locale}/panel/propiedades`)}
            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium cursor-pointer"
            style={{ borderRadius: "var(--p-radius)", background: "var(--p-surface-2)", border: "1px solid var(--p-border)", color: "var(--p-text-2)" }}
          >
            <ArrowLeft size={14} />
            Volver al listado
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-[13px] font-medium cursor-pointer"
            style={{ borderRadius: "var(--p-radius)", background: saving ? "var(--p-surface-3)" : "var(--p-accent)", color: saving ? "var(--p-text-2)" : "#0E0D0C" }}
          >
            <Save size={15} />
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </motion.div>
      </LayoutGroup>
    </form>
  );
}
