"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { checkFieldApplies, isCombinationInconsistent } from "@/utils/propertyDiscrimination";
import { computeCompletenessScore } from "@/utils/propertyCompleteness";
import { useLenis } from "@/lib/lenis";
import { YesNoSelector } from "@/components/ui/YesNoSelector";
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
  Eye,
  Image as ImageIcon,
  Info,
  Sparkles,
  ArrowUpRight,
  Check,
} from "lucide-react";

// ── Tipos ──
interface ImageFile {
  id: string;
  file?: File;
  preview: string;
  url?: string;       // si ya está subida
  isCover: boolean;
  uploading: boolean;
  progress: number;
}

interface FormData {
  // Clasificación
  operation: string;
  property_type: string;
  status: string;
  // Precio
  price: string;
  price_currency: string;
  price_negotiable: boolean;
  maintenance_fee: string;
  // Dimensiones
  area_built: string;
  area_total: string;
  bedrooms: string;
  bathrooms: string;
  half_bathrooms: string;
  parking_spaces: string;
  floors: string;
  floor_number: string;
  year_built: string;
  // Ubicación
  municipio: string;
  zone_id: string;
  address_es: string;
  lat: string;
  lng: string;
  // Contenido
  title_es: string;
  description_es: string;
  // Video
  video_url: string;
  virtual_tour_url: string;
  // Badges
  featured: boolean;
  exclusive: boolean;
  new_listing: boolean;
  price_reduced: boolean;
  // Amenidades
  has_pool: boolean;
  has_garden: boolean;
  has_ac: boolean;
  has_generator: boolean;
  has_water_tank: boolean;
  has_security: boolean;
  has_elevator: boolean;
  allows_pets: boolean;
  furnished: boolean;
  has_gym: boolean;
  has_jacuzzi: boolean;
  has_bbq: boolean;
  has_laundry: boolean;
  has_balcony: boolean;
  has_terrace: boolean;
  has_solar_panels: boolean;

  // Terreno
  topography: string;
  access_type: string;
  land_use: string;
  current_use: string;
  area_hectares: string;
  has_own_water: boolean | null;

  // Compartido
  bathroom_type: string;
  host_housing_type: string;
  cohabitation: string;
  gender_policy: string;
  occupants_count: string;
  allows_cooking: boolean | null;
  has_independent_entrance: boolean | null;
}

const INIT: FormData = {
  operation: "",
  property_type: "",
  status: "",
  price: "",
  price_currency: "",
  price_negotiable: false,
  maintenance_fee: "",
  area_built: "",
  area_total: "",
  bedrooms: "",
  bathrooms: "",
  half_bathrooms: "",
  parking_spaces: "",
  floors: "",
  floor_number: "",
  year_built: "",
  municipio: "",
  zone_id: "",
  address_es: "",
  lat: "",
  lng: "",
  title_es: "",
  description_es: "",
  video_url: "",
  virtual_tour_url: "",
  featured: false,
  exclusive: false,
  new_listing: false,
  price_reduced: false,
  has_pool: false,
  has_garden: false,
  has_ac: false,
  has_generator: false,
  has_water_tank: false,
  has_security: false,
  has_elevator: false,
  allows_pets: false,
  furnished: false,
  has_gym: false,
  has_jacuzzi: false,
  has_bbq: false,
  has_laundry: false,
  has_balcony: false,
  has_terrace: false,
  has_solar_panels: false,

  // Terreno
  topography: "",
  access_type: "",
  land_use: "",
  current_use: "",
  area_hectares: "",
  has_own_water: null,

  // Compartido
  bathroom_type: "",
  host_housing_type: "",
  cohabitation: "",
  gender_policy: "",
  occupants_count: "",
  allows_cooking: null,
  has_independent_entrance: null,
};

// ── Helpers visuales ──
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
    minHeight: "160px",
  } as React.CSSProperties,
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-medium mb-1.5" style={{ color: "var(--p-text-2)" }}>
      {children}
    </label>
  );
}

function SectionCard({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{
        background: "var(--p-surface)",
        border: "1px solid var(--p-border)",
        borderRadius: "var(--p-radius)",
        overflow: open ? "visible" : "hidden",
      }}
    >
      <div
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer select-none"
        style={{ borderBottom: open ? "1px solid var(--p-border)" : "none" }}
      >
        <span className="text-[13px] font-semibold" style={{ color: "var(--p-text)" }}>
          {title}
        </span>
        {open ? <ChevronUp size={15} style={{ color: "var(--p-text-2)" }} /> : <ChevronDown size={15} style={{ color: "var(--p-text-2)" }} />}
      </div>
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
    </div>
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
        width: "120px",
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

// Glowing premium toggle component
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

// ── Zona de drag & drop de imágenes ──
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
      {/* Zona de drop */}
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
        {!canAdd && (
          <p className="text-[11px]" style={{ color: "var(--p-amber)" }}>
            Límite de 20 fotos alcanzado
          </p>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Grid de imágenes con reorden */}
      {images.length > 0 && (
        <div>
          <p className="text-[11px] mb-2" style={{ color: "var(--p-text-3)" }}>
            {images.length}/20 · Arrastra para reordenar · La primera con ★ es la portada
          </p>
          <Reorder.Group
            axis="y"
            values={images}
            onReorder={onReorder}
            className="space-y-2"
          >
            {images.map((img) => (
              <Reorder.Item key={img.id} value={img}>
                <motion.div
                  layout
                  className="flex items-center gap-3 px-3 py-2"
                  style={{
                    background: img.isCover ? "var(--p-accent-medium)" : "var(--p-surface-2)",
                    border: `1px solid ${img.isCover ? "var(--p-accent)" : "var(--p-border)"}`,
                    borderRadius: "var(--p-radius)",
                  }}
                >
                  {/* Grip */}
                  <GripVertical size={14} style={{ color: "var(--p-text-3)", flexShrink: 0, cursor: "grab" }} />

                  {/* Preview */}
                  <div
                    className="w-14 h-10 flex-shrink-0 overflow-hidden"
                    style={{ borderRadius: "4px", background: "var(--p-surface-3)" }}
                  >
                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  </div>

                  {/* Nombre */}
                  <span className="flex-1 text-[12px] truncate" style={{ color: "var(--p-text-2)" }}>
                    {img.file?.name ?? "Imagen subida"}
                  </span>

                  {/* Progress bar */}
                  {img.uploading && (
                    <div
                      className="w-20 h-1 overflow-hidden"
                      style={{ borderRadius: "2px", background: "var(--p-surface-3)" }}
                    >
                      <motion.div
                        className="h-full"
                        style={{ background: "var(--p-accent)" }}
                        animate={{ width: `${img.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}

                  {/* Portada */}
                  <button
                    type="button"
                    onClick={() => onSetCover(img.id)}
                    title="Establecer como portada"
                    className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderRadius: "var(--p-radius)",
                      color: img.isCover ? "#D4924A" : "var(--p-text-3)",
                      background: img.isCover ? "rgba(212,146,74,0.15)" : "transparent",
                    }}
                  >
                    <Star size={13} fill={img.isCover ? "currentColor" : "none"} />
                  </button>

                  {/* Eliminar */}
                  <button
                    type="button"
                    onClick={() => onRemove(img.id)}
                    className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderRadius: "var(--p-radius)",
                      color: "var(--p-red)",
                      background: "rgba(192,96,90,0.08)",
                    }}
                  >
                    <X size={13} />
                  </button>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}
    </div>
  );
}

// ── Segmented Progress Bar (Framer Motion) ──
function ProgressBar({ score, recommendations }: { score: number; recommendations: { label: string; weight: number; field: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeColor = score < 35 ? "#ef4444" : score < 80 ? "#f59e0b" : "#10b981";
  const statusLabel = score < 35 ? "Borrador" : score < 80 ? "Incompleto" : "Excelente";

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const lenis = useLenis();

  const handleScrollToField = (field: string) => {
    let target = document.getElementById(field);
    if (!target) {
      target = document.getElementById(`field-${field}`) || document.querySelector(`[name="${field}"]`);
    }
    if (!target && field === "price") {
      target = document.getElementById("price") || document.querySelector('[name="price"]');
    }
    if (!target && field === "lat") {
      target = document.getElementById("lat") || document.getElementById("lng");
    }

    if (target) {
      setIsOpen(false);
      
      const rect = target.getBoundingClientRect();
      const absoluteElementTop = rect.top + window.scrollY;
      const targetPosition = absoluteElementTop - (window.innerHeight / 2) + (rect.height / 2);
      let container = target;
      if (target.id && document.getElementById(target.id)) {
        const wrapperDiv = document.getElementById(target.id)?.closest("div");
        if (wrapperDiv && (wrapperDiv as any) !== target.closest("form") && (wrapperDiv as any) !== target.closest('[id^="sec-"]')) {
          container = wrapperDiv;
        }
      } else {
        container = target.closest("div") || target;
      }

      if (lenis) {
        const currentPos = window.scrollY;
        const distance = Math.abs(targetPosition - currentPos);

        if (distance > 1200) {
          const jumpTarget = targetPosition > currentPos ? targetPosition - 400 : targetPosition + 400;
          lenis.scrollTo(jumpTarget, { immediate: true });
          setTimeout(() => {
            lenis.scrollTo(targetPosition, {
              duration: 0.5,
              easing: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
            });
          }, 50);
        } else {
          lenis.scrollTo(targetPosition, {
            duration: 0.5,
            easing: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
          });
        }
      } else {
        window.scrollTo({ top: targetPosition, behavior: "smooth" });
      }

      container.classList.add("highlight-field-pulse");
      
      if (typeof (target as any).focus === "function") {
        (target as any).focus({ preventScroll: true });
      }

      setTimeout(() => {
        container.classList.remove("highlight-field-pulse");
      }, 3000);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative flex flex-col justify-center select-none animate-fade-in" 
      style={{ display: "flex", flexDirection: "column", gap: "3px", width: "160px", marginRight: "12px", cursor: "pointer" }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
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

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full mt-2 right-0 p-5 rounded-xl shadow-2xl text-[11px] w-[480px] z-[9999] text-white leading-normal"
            style={{
              background: "rgba(15, 15, 15, 0.96)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 10px 30px -10px rgba(0,0,0,0.8)",
              transformOrigin: "top right",
              pointerEvents: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 font-semibold text-xs">
                <Sparkles size={13} className="text-yellow-400" />
                <span>Calidad del Anuncio</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase" style={{ background: `${activeColor}20`, color: activeColor, border: `1px solid ${activeColor}40` }}>
                {statusLabel} • {score}%
              </span>
            </div>
            
            <p className="text-white/60 mb-4 text-[10px] leading-relaxed">
              Completa los campos recomendados para mejorar el posicionamiento de tu propiedad en las búsquedas.
            </p>

            {recommendations.length > 0 && score < 100 ? (
              <div className="border-t border-white/5 pt-3.5">
                <p className="font-semibold text-white/80 mb-2.5 flex items-center gap-1">
                  <Info size={11} className="text-blue-400" />
                  <span>Sugerencias para subir el puntaje (haz clic para ir al campo):</span>
                </p>
                <div 
                  className="space-y-2 suggestions-scroll max-h-[160px] overflow-y-auto pr-2"
                  style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.3) rgba(255,255,255,0.05)" }}
                >
                  {recommendations.slice(0, 5).map((rec, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleScrollToField(rec.field)}
                      className="w-full flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 border border-white/[0.03] text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <ArrowUpRight size={12} className="text-emerald-400 shrink-0" />
                        <span className="truncate text-white/90 text-[10.5px]">{rec.label}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-400 shrink-0 ml-2">
                        +{rec.weight}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border-t border-white/5 pt-3.5 flex items-center gap-1.5 text-emerald-400">
                <Check size={12} />
                <span className="font-semibold">¡Publicación al 100% completada!</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Página principal ──
export default function NuevaPropiedadPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "es";

  const [form, setForm] = useState<FormData>(INIT);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [zonesList, setZonesList] = useState<{ value: string; label: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof FormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const shouldShowField = (field: string) => {
    if (!form.property_type || !form.operation) return true;
    return checkFieldApplies(field, form.property_type, form.operation);
  };

  const hasLandSection = !form.property_type || !form.operation || checkFieldApplies("land_section", form.property_type, form.operation);
  const hasShared = !form.property_type || !form.operation || checkFieldApplies("shared_section", form.property_type, form.operation);

  // Load Zones list
  useEffect(() => {
    async function loadZones() {
      const supabase = createClient();
      const { data } = await supabase.from("zones").select("id, name_es").order("name_es", { ascending: true });
      if (data) {
        setZonesList(data.map(z => ({ value: z.id, label: z.name_es })));
      }
    }
    loadZones();
  }, []);

  const checkApplies = (fieldOrGroup: string): boolean => {
    return checkFieldApplies(fieldOrGroup, form.property_type, form.operation);
  };

  const calculateProgress = (f: FormData, imgs: ImageFile[]): { score: number; recommendations: { label: string; weight: number; field: string }[] } => {
    return computeCompletenessScore(f, f.property_type, f.operation, imgs.length, checkApplies);
  };

  // ── Imágenes: agregar ──
  const handleAddImages = useCallback((files: File[]) => {
    const remaining = 20 - images.length;
    const toAdd = files.slice(0, remaining);
    const newImgs: ImageFile[] = toAdd.map((file, i) => ({
      id: `${Date.now()}-${i}-${file.name}`,
      file,
      preview: URL.createObjectURL(file),
      isCover: images.length === 0 && i === 0,
      uploading: false,
      progress: 0,
    }));
    setImages((prev) => [...prev, ...newImgs]);
  }, [images.length]);

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      // Si se eliminó la portada, asignar la primera como portada
      if (filtered.length > 0 && !filtered.some((i) => i.isCover)) {
        const first = filtered[0];
        if (first) first.isCover = true;
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

    if (!form.title_es.trim()) { setError("El título es obligatorio."); return; }
    const { score: currentProgress } = calculateProgress(form, images);

    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // Generar slug desde título
      const slug = form.title_es
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim().replace(/\s+/g, "-")
        + "-" + Date.now().toString(36);

      // 1. Insertar propiedad
      const { data: prop, error: propErr } = await supabase
        .from("properties")
        .insert({
          slug,
          agent_id: user.id,
          operation: form.operation,
          property_type: form.property_type,
          status: form.status,
          price: parseFloat(form.price) || 0,
          price_currency: form.price_currency,
          price_negotiable: form.price_negotiable,
          maintenance_fee: form.maintenance_fee ? parseFloat(form.maintenance_fee) : null,
          area_built: form.area_built ? parseFloat(form.area_built) : null,
          area_total: form.area_total ? parseFloat(form.area_total) : null,
          bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
          bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
          half_bathrooms: form.half_bathrooms ? parseInt(form.half_bathrooms) : null,
          parking_spaces: form.parking_spaces ? parseInt(form.parking_spaces) : null,
          floors: form.floors ? parseInt(form.floors) : null,
          floor_number: form.floor_number ? parseInt(form.floor_number) : null,
          year_built: form.year_built ? parseInt(form.year_built) : null,
          property_age: form.year_built ? (new Date().getFullYear() - parseInt(form.year_built)) : null,
          municipio: form.municipio || null,
          zone_id: form.zone_id || null,
          address_es: form.address_es || null,
          lat: form.lat ? parseFloat(form.lat) : null,
          lng: form.lng ? parseFloat(form.lng) : null,
          video_url: form.video_url || null,
          virtual_tour_url: form.virtual_tour_url || null,
          featured: form.featured,
          exclusive: form.exclusive,
          new_listing: form.new_listing,
          price_reduced: form.price_reduced,
          completeness_score: currentProgress,
          has_pool: form.has_pool,
          has_garden: form.has_garden,
          has_ac: form.has_ac,
          has_generator: form.has_generator,
          has_water_tank: form.has_water_tank,
          has_security: form.has_security,
          has_elevator: form.has_elevator,
          allows_pets: form.allows_pets,
          furnished: form.furnished,
          has_gym: form.has_gym,
          has_jacuzzi: form.has_jacuzzi,
          has_bbq: form.has_bbq,
          has_laundry: form.has_laundry,
          has_balcony: form.has_balcony,
          has_terrace: form.has_terrace,
          has_solar_panels: form.has_solar_panels,
          // Terreno
          topography: form.topography || null,
          access_type: form.access_type || null,
          land_use: form.land_use || null,
          current_use: form.current_use || null,
          area_hectares: form.area_hectares ? parseFloat(form.area_hectares) : null,
          has_own_water: form.has_own_water,
          // Compartido
          bathroom_type: form.bathroom_type || null,
          host_housing_type: form.host_housing_type || null,
          cohabitation: form.cohabitation || null,
          gender_policy: form.gender_policy || null,
          occupants_count: form.occupants_count ? parseInt(form.occupants_count) : null,
          allows_cooking: form.allows_cooking,
          has_independent_entrance: form.has_independent_entrance,
        })
        .select()
        .single();

      if (propErr || !prop) throw propErr ?? new Error("Error al crear propiedad");

      // 2. Insertar traducción ES
      const { error: transErr } = await supabase.from("property_translations").insert({
        property_id: prop.id,
        locale: "es",
        title: form.title_es,
        description: form.description_es || null,
        short_description: null,
      });
      if (transErr) throw transErr;

      // 3. Subir imágenes a Supabase Storage
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          if (!img || !img.file) continue;

          const currentId = img.id;
          const currentIsCover = img.isCover;

          // Actualizar progress UI
          setImages((prev) => prev.map((x) => x.id === currentId ? { ...x, uploading: true, progress: 10 } : x));

          const ext = img.file.name.split(".").pop();
          const path = `properties/${prop.id}/${Date.now()}-${i}.${ext}`;

          const { data: uploaded, error: upErr } = await supabase.storage
            .from("property-images")
            .upload(path, img.file, { upsert: false, cacheControl: "31536000" });

          setImages((prev) => prev.map((x) => x.id === currentId ? { ...x, progress: 80 } : x));

          if (!upErr && uploaded) {
            const { data: { publicUrl } } = supabase.storage
              .from("property-images")
              .getPublicUrl(path);

            await supabase.from("property_images").insert({
              property_id: prop.id,
              url: publicUrl,
              is_cover: currentIsCover,
              sort_order: i,
              alt_es: form.title_es,
              alt_en: form.title_es,
            });
          }

          setImages((prev) => prev.map((x) => x.id === currentId ? { ...x, uploading: false, progress: 100 } : x));
        }
      }

      // Redirigir a la propiedad recién creada
      router.push(`/${locale}/panel/propiedades/editar/${prop.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setSaving(false);
    }
  };

  const progressData = calculateProgress(form, images);
  const progressScore = progressData.score;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center"
            style={{
              borderRadius: "var(--p-radius)",
              background: "var(--p-surface)",
              border: "1px solid var(--p-border)",
              color: "var(--p-text-2)",
            }}
          >
            <ArrowLeft size={14} />
          </button>
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-[18px] font-semibold" style={{ color: "var(--p-text)" }}>
                Nueva propiedad
              </h2>
              <p className="text-[12px]" style={{ color: "var(--p-text-2)" }}>
                Completa la información para publicar
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
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium"
            style={{
              borderRadius: "var(--p-radius)",
              background: saving ? "var(--p-surface-3)" : "var(--p-accent)",
              color: saving ? "var(--p-text-2)" : "#0E0D0C",
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Save size={14} />
            {saving ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </div>



      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 text-[13px]"
          style={{
            borderRadius: "var(--p-radius)",
            background: "rgba(192,96,90,0.12)",
            border: "1px solid rgba(192,96,90,0.2)",
            color: "var(--p-red)",
          }}
        >
          {error}
        </motion.div>
      )}

      <div style={{ display: "flex", gap: 16, alignItems: "start", width: "100%" }}>
        {/* ── LEFT COLUMN ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* SECCIÓN: Clasificación */}
          <SectionCard title="Clasificación">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Operación</Label>
                <FormSelect
                  value={form.operation}
                  onChange={(val) => set("operation", val)}
                  options={[
                    { value: "venta", label: "Venta", disabled: isCombinationInconsistent(form.property_type, "venta") },
                    { value: "alquiler", label: "Alquiler", disabled: isCombinationInconsistent(form.property_type, "alquiler") },
                    { value: "vacacional", label: "Vacacional", disabled: isCombinationInconsistent(form.property_type, "vacacional") }
                  ].sort((a, b) => a.label.localeCompare(b.label))}
                />
              </div>
              <div>
                <Label>Tipo de inmueble</Label>
                <FormSelect
                  value={form.property_type}
                  onChange={(val) => set("property_type", val)}
                  options={["apartamento","casa","townhouse","anexo","edificio","galpon","habitacion","hacienda_finca","local","oficina","terreno_lote"].map((t) => ({
                    value: t,
                    label: capitalize(t),
                    disabled: isCombinationInconsistent(t, form.operation)
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
                    { value: "cerrada", label: "Cerrada" }
                  ].sort((a, b) => a.label.localeCompare(b.label))}
                />
              </div>
            </div>
            {/* Badges */}
            <div className="flex flex-wrap gap-4 mt-4">
              <Toggle checked={form.featured} onChange={(v) => set("featured", v)} label="Destacada" />
              <Toggle checked={form.exclusive} onChange={(v) => set("exclusive", v)} label="Exclusiva" />
              <Toggle checked={form.new_listing} onChange={(v) => set("new_listing", v)} label="Nueva" />
              <Toggle checked={form.price_reduced} onChange={(v) => set("price_reduced", v)} label="Precio reducido" />
            </div>
          </SectionCard>

          {/* SECCIÓN: Contenido */}
          <SectionCard title="Título y descripción">
            <div className="space-y-4">
              <div id="title_es">
                <Label>Título (Español)</Label>
                <input
                  value={form.title_es}
                  onChange={(e) => set("title_es", e.target.value)}
                  placeholder="Ej: Hermoso apartamento en El Parque..."
                  style={INPUT.base}
                  required
                />
              </div>
              <div id="description_es">
                <Label>Descripción</Label>
                <textarea
                  value={form.description_es}
                  onChange={(e) => set("description_es", e.target.value)}
                  placeholder="Describe la propiedad con detalle: características, entorno, accesos..."
                  style={INPUT.textarea}
                  rows={6}
                />
              </div>
            </div>
          </SectionCard>

          {/* SECCIÓN: Dimensiones */}
          <SectionCard title="Dimensiones y habitaciones">
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: "area_built", label: "m² construidos" },
                { key: "area_total", label: "m² totales" },
                { key: "bedrooms", label: "Habitaciones" },
                { key: "bathrooms", label: "Baños" },
                { key: "half_bathrooms", label: "Medios baños" },
                { key: "parking_spaces", label: "Estacionamientos" },
                { key: "floors", label: "Pisos del edificio" },
                { key: "floor_number", label: "Piso de la unidad" },
                { key: "year_built", label: "Año de construcción" },
              ].filter(({ key }) => {
                if (key === "bedrooms") return checkFieldApplies("bedrooms", form.property_type, form.operation);
                if (key === "bathrooms") return checkFieldApplies("bathrooms", form.property_type, form.operation);
                if (key === "half_bathrooms") return checkFieldApplies("half_bathrooms", form.property_type, form.operation);
                if (key === "parking_spaces") return checkFieldApplies("parking", form.property_type, form.operation);
                if (key === "floors") return checkFieldApplies("floors", form.property_type, form.operation);
                if (key === "floor_number") return checkFieldApplies("floor_number", form.property_type, form.operation);
                if (key === "year_built") return checkFieldApplies("year_built", form.property_type, form.operation);
                return true;
              }).map(({ key, label }) => {
                const isStepper = ["bedrooms", "bathrooms", "half_bathrooms", "parking_spaces", "floors", "floor_number"].includes(key);
                return (
                  <div key={key} id={key}>
                    <Label>{label}</Label>
                    {isStepper ? (
                      <NumberStepper
                        value={form[key as keyof FormData] as string}
                        onChange={(val) => set(key as keyof FormData, val)}
                        min={0}
                      />
                    ) : key === "year_built" ? (
                      <input
                        type="number"
                        value={form[key as keyof FormData] as string}
                        onChange={(e) => set(key as keyof FormData, e.target.value)}
                        placeholder="-"
                        style={INPUT.base}
                      />
                    ) : (
                      <FormattedNumberInput
                        value={form[key as keyof FormData] as string}
                        onChange={(val) => set(key as keyof FormData, val)}
                        placeholder="-"
                        style={INPUT.base}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* SECCIÓN: Imágenes */}
          <div id="images">
            <SectionCard title="Fotos (hasta 20)">
              <ImageDropzone
                images={images}
                onAdd={handleAddImages}
                onRemove={handleRemoveImage}
                onReorder={setImages}
                onSetCover={handleSetCover}
              />
            </SectionCard>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* SECCIÓN: Precio */}
          <SectionCard title="Precio">
            <div className="grid grid-cols-3 gap-4">
              <div id="price">
                <Label>Precio</Label>
                <FormattedNumberInput
                  value={form.price}
                  onChange={(val) => set("price", val)}
                  placeholder="0"
                  style={INPUT.base}
                  required
                />
              </div>
              <div id="price_currency">
                <Label>Moneda</Label>
                <FormSelect
                  value={form.price_currency}
                  onChange={(val) => set("price_currency", val)}
                  options={[
                    { value: "USD", label: "USD ($)" },
                    { value: "EUR", label: "EUR (€)" },
                    { value: "VES", label: "VES (Bs.)" }
                  ].sort((a, b) => a.label.localeCompare(b.label))}
                />
              </div>
              {checkFieldApplies("maintenance", form.property_type, form.operation) && (
                <div id="maintenance_fee">
                  <Label>Mantenimiento</Label>
                  <FormattedNumberInput
                    value={form.maintenance_fee}
                    onChange={(val) => set("maintenance_fee", val)}
                    placeholder="0"
                    style={INPUT.base}
                  />
                </div>
              )}
            </div>
            <div className="mt-3">
              <Toggle checked={form.price_negotiable} onChange={(v) => set("price_negotiable", v)} label="Precio negociable" />
            </div>
          </SectionCard>

          {/* SECCIÓN: Ubicación */}
          <SectionCard title="Ubicación">
            <div className="grid grid-cols-2 gap-4">
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
                    { value: "rangel", label: "Rangel" }
                  ].sort((a, b) => a.label.localeCompare(b.label))}
                />
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
              <div className="col-span-2">
                <Label>Dirección</Label>
                <input
                  value={form.address_es}
                  onChange={(e) => set("address_es", e.target.value)}
                  placeholder="Calle, edificio, referencia..."
                  style={INPUT.base}
                />
              </div>
              <div id="lat">
                <Label>Latitud</Label>
                <input
                  type="number"
                  step="any"
                  value={form.lat}
                  onChange={(e) => set("lat", e.target.value)}
                  placeholder="8.5933"
                  style={INPUT.base}
                />
              </div>
              <div id="lng">
                <Label>Longitud</Label>
                <input
                  type="number"
                  step="any"
                  value={form.lng}
                  onChange={(e) => set("lng", e.target.value)}
                  placeholder="-71.1440"
                  style={INPUT.base}
                />
              </div>
            </div>
          </SectionCard>

          {/* SECCIÓN: Amenidades */}
          <SectionCard title="Amenidades" defaultOpen={false}>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {[
                ["has_pool", "Piscina"],
                ["has_garden", "Jardín"],
                ["has_ac", "Aire acondicionado"],
                ["has_generator", "Planta eléctrica"],
                ["has_water_tank", "Tanque de agua"],
                ["has_security", "Seguridad"],
                ["has_elevator", "Ascensor"],
                ["allows_pets", "Acepta mascotas"],
                ["furnished", "Amoblado"],
                ["has_gym", "Gym"],
                ["has_jacuzzi", "Jacuzzi"],
                ["has_bbq", "BBQ"],
                ["has_laundry", "Lavandería"],
                ["has_balcony", "Balcón"],
                ["has_terrace", "Terraza"],
                ["has_solar_panels", "Paneles solares"],
              ].filter(([key]) => {
                if (key === "has_elevator") return checkFieldApplies("elevator", form.property_type, form.operation);
                if (key === "furnished") return checkFieldApplies("furnished", form.property_type, form.operation);
                return true;
              }).map(([key, label]) => (
                <div key={key} id={key}>
                  <Toggle
                    checked={!!form[key as keyof FormData]}
                    onChange={(v) => set(key as keyof FormData, v)}
                    label={label as string}
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          {/* SECCIÓN: Video */}
          <SectionCard title="Video y tour virtual" defaultOpen={false}>
            <div className="space-y-4">
              <div id="video_url">
                <Label>Enlace de YouTube o Vimeo</Label>
                <div className="relative">
                  <Video size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--p-text-3)" }} />
                  <input
                    value={form.video_url}
                    onChange={(e) => set("video_url", e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    style={{ ...INPUT.base, paddingLeft: "36px" }}
                  />
                </div>
              </div>
              <div id="virtual_tour_url">
                <Label>Tour virtual (Matterport u otro iframe)</Label>
                <div className="relative">
                  <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--p-text-3)" }} />
                  <input
                    value={form.virtual_tour_url}
                    onChange={(e) => set("virtual_tour_url", e.target.value)}
                    placeholder="https://matterport.com/..."
                    style={{ ...INPUT.base, paddingLeft: "36px" }}
                  />
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Botón submit bottom */}
      <div className="flex justify-end pt-2 pb-8">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 text-[13px] font-medium"
          style={{
            borderRadius: "var(--p-radius)",
            background: saving ? "var(--p-surface-3)" : "var(--p-accent)",
            color: saving ? "var(--p-text-2)" : "#0E0D0C",
          }}
        >
          <Save size={15} />
          {saving ? "Publicando..." : "Publicar propiedad"}
        </button>
      </div>
    </form>
  );
}
