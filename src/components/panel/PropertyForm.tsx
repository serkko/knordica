/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  DndContext,
  closestCorners,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { checkFieldApplies, isCombinationInconsistent } from "@/utils/propertyDiscrimination";
import { YesNoSelector } from "@/components/ui/YesNoSelector";
import { computeCompletenessScore } from "@/utils/propertyCompleteness";
import { useLenis } from "@/lib/lenis";
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
  ImageIcon as ImageIcon,
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
  has_elevator: boolean | null;
  has_water_tank: boolean | null;
  has_hot_water: boolean | null;
  has_generator: boolean | null;
  gas_type: string;
  has_internet: boolean | null;

  // Seguridad
  has_security_24h: boolean | null;
  has_electric_gate: boolean | null;
  has_cctv: boolean | null;
  has_electric_fence: boolean | null;
  has_intercom: boolean | null;
  has_armored_door: boolean | null;

  // Climatización
  has_ac: boolean | null;
  has_heating: boolean | null;
  kitchen_type: string;

  // Habitación y Anexo
  bathroom_type: string;
  host_housing_type: string;
  cohabitation: string;
  occupants_count: string;
  gender_policy: string;
  deposit_required: boolean | null;
  deposit_amount: string;
  allows_pets: boolean | null;
  allows_cooking: boolean | null;
  has_independent_entrance: boolean | null;

  // Terreno y Finca
  topography: string;
  land_use: string;
  access_type: string;
  current_use: string;
  has_own_water: boolean | null;

  // Media
  video_url: string;
  virtual_tour_url: string;
}

const INIT: FormData = {
  operation: "",
  property_type: "",
  status: "",
  listing_badge: "basico",
  completeness_score: "0",
  featured: false,
  exclusive: false,
  new_listing: false,
  price_reduced: false,
  title_es: "",
  description_es: "",
  title_en: "",
  description_en: "",
  price: "",
  price_currency: "",
  price_negotiable: false,
  price_usd: "",
  maintenance_fee: "",
  price_per_night: "",
  price_weekend: "",
  min_nights: "",
  max_guests: "",
  checkin_time: "",
  checkout_time: "",
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
  furnished: "",
  municipio: "",
  zone_id: "",
  address_es: "",
  address_en: "",
  lat: "",
  lng: "",
  show_exact_location: false,
  has_elevator: null,
  has_water_tank: null,
  has_hot_water: null,
  has_generator: null,
  gas_type: "",
  has_internet: null,
  has_security_24h: null,
  has_electric_gate: null,
  has_cctv: null,
  has_electric_fence: null,
  has_intercom: null,
  has_armored_door: null,
  has_ac: null,
  has_heating: null,
  kitchen_type: "",
  bathroom_type: "",
  host_housing_type: "",
  cohabitation: "",
  occupants_count: "",
  gender_policy: "",
  deposit_required: null,
  deposit_amount: "",
  allows_pets: null,
  allows_cooking: null,
  has_independent_entrance: null,
  topography: "",
  land_use: "",
  access_type: "",
  current_use: "",
  has_own_water: null,
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
                  onClick={() => { onChange(isActive ? "" : opt.value); setOpen(false); }}
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
                      onClick={() => { onChange(isActive ? "" : opt.value); setOpen(false); }}
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


// ── Title map for ghost card ──
const SECTION_TITLES: Record<string, string> = {
  "sec-clasificacion": "Clasificaci\u00f3n y Publicaci\u00f3n",
  "sec-contenido": "Contenido de la publicaci\u00f3n",
  "sec-precio": "Precio y Condiciones Financieras",
  "sec-dimensiones": "Dimensiones y Estructura",
  "sec-ubicacion": "Ubicaci\u00f3n",
  "sec-fotos": "Fotos de la propiedad",
  "sec-media": "Video y Tour Virtual",
  "sec-servicios": "Servicios, Amenidades y Seguridad",
  "sec-compartido": "Condiciones de Habitaci\u00f3n",
  "sec-terreno": "Par\u00e1metros de Terreno y Campo",
};

// ── Context: section open/close state shared across the DnD tree ──
// Avoids prop drilling through cloneElement which causes infinite render loops.
type SectionStateCtx = { getOpen: (id: string) => boolean; setOpen: (id: string, v: boolean) => void; };
const SectionStateContext = React.createContext<SectionStateCtx>({
  getOpen: () => true,
  setOpen: () => {},
});

// ── Ghost card shown in DragOverlay — only the header at 85% scale ──
function DragGhostCard({ sectionId }: { sectionId: string }) {
  return (
    <div
      style={{
        background: "var(--p-surface)",
        border: "1px solid var(--p-accent)",
        borderRadius: "var(--p-radius)",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
        transform: "scale(0.85)",
        transformOrigin: "top left",
        cursor: "grabbing",
        userSelect: "none",
        opacity: 0.96,
      }}
    >
      <GripVertical size={14} style={{ color: "var(--p-accent)", flexShrink: 0 }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--p-text)" }}>
        {SECTION_TITLES[sectionId] ?? sectionId}
      </span>
    </div>
  );
}

// ── Column droppable wrapper ──
function ColumnDroppable({ droppableId, children }: { droppableId: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });
  return (
    <div
      ref={setNodeRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        flex: 1,
        minHeight: 100,
        borderRadius: "var(--p-radius)",
        outline: isOver ? "2px dashed var(--p-accent)" : "2px dashed transparent",
        outlineOffset: 4,
        transition: "outline 150ms",
      }}
    >
      {children}
    </div>
  );
}

function SortableSectionItem({
  id,
  element,
  style,
  className,
}: {
  id: string;
  element: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      className={className}
      style={{
        transform: CSS.Transform.toString(transform),
        // Animate only transform — never height — eliminates the bubbly effect
        transition: transition ? "transform 250ms cubic-bezier(0.25, 0.8, 0.25, 1)" : undefined,
        // Keep ghost placeholder in layout but invisible
        visibility: isDragging ? "hidden" : "visible",
        position: "relative",
        ...style,
      }}
    >
      {React.cloneElement(element as React.ReactElement<any>, {
        dragHandleProps: listeners,
      })}
    </div>
  );
}

function SectionCard({
  title,
  children,
  defaultOpen = true,
  layoutId,
  style = {},
  id,
  dragHandleProps,
  open: openProp,
  onOpenChange,
  warningText = "",
  onWarning,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  layoutId?: string;
  style?: React.CSSProperties;
  id?: string;
  dragHandleProps?: Record<string, unknown>;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  warningText?: string;
  onWarning?: (msg: string) => void;
}) {
  const disabled = !!warningText;

  // Read open state from context (set by PropertyForm's lifted state)
  const sectionCtx = React.useContext(SectionStateContext);
  const contextOpen = layoutId ? sectionCtx.getOpen(layoutId) : undefined;

  // Prefer: direct openProp > context > internal default
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = openProp !== undefined ? openProp : (contextOpen !== undefined ? contextOpen : internalOpen);

  const toggleOpen = useCallback(() => {
    if (disabled) {
      onWarning?.(warningText);
      return;
    }
    const next = !isOpen;
    // Update context state (the canonical source for DnD sections)
    if (layoutId) sectionCtx.setOpen(layoutId, next);
    // Also update internal state for sections used outside DnD context
    if (openProp === undefined && contextOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }, [isOpen, layoutId, sectionCtx, openProp, contextOpen, onOpenChange, disabled, warningText, onWarning]);

  // Stable ref for onOpenChange in event listener to avoid re-registering
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  useEffect(() => {
    if (!layoutId) return;
    const handleExpand = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.layoutId === layoutId) {
        sectionCtx.setOpen(layoutId, true);
        if (openProp === undefined && contextOpen === undefined) setInternalOpen(true);
        onOpenChangeRef.current?.(true);
      }
    };
    window.addEventListener("expand-section-card", handleExpand);
    return () => window.removeEventListener("expand-section-card", handleExpand);
  // sectionCtx is stable (createContext default + useMemo in PropertyForm)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutId]);

  const handleDisabledClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onWarning?.(warningText);
  };

  return (
    <div
      id={id || layoutId}
      style={{
        background: "var(--p-surface)",
        border: "1px solid var(--p-border)",
        borderRadius: "var(--p-radius)",
        overflow: isOpen ? "visible" : "hidden",
        ...style,
      }}
      onClick={disabled ? handleDisabledClick : undefined}
    >
      <div
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer select-none"
        onClick={toggleOpen}
        style={{ borderBottom: isOpen ? "1px solid var(--p-border)" : "none" }}
      >
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            style={{ cursor: "grab", display: "flex", alignItems: "center", paddingRight: 10, color: "var(--p-text-3)", flexShrink: 0 }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => {
              (dragHandleProps as any).onPointerDown?.(e);
              e.stopPropagation();
            }}
          >
            <GripVertical size={14} />
          </div>
        )}
        <div className="flex-1 flex items-center justify-start text-left min-w-0">
          <span className="text-[13px] font-semibold truncate" style={{ color: "var(--p-text)" }}>
            {title}
          </span>
        </div>
        <div className="p-1 text-white/40 hover:text-white/80 transition-colors">
          {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="p-5">
              <div style={disabled ? { opacity: 0.45, pointerEvents: "none", userSelect: "none" } : undefined}>
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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

// ── ImageIcon aliased to avoi// ── Segmented Progress Bar (Framer Motion) ──
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
    // 1. Close the dropdown menu immediately
    setIsOpen(false);

    // 2. Identify the target element - dynamically find element by ID or input attributes
    let target: HTMLElement | null = null;

    // Explicit custom mapping logic for special wrapper fields to ensure we highlight the correct layout input
    const specFields: Record<string, string> = {
      operation: "operation",
      property_type: "property_type",
      topography: "topography",
      access_type: "access_type",
      land_use: "land_use",
      current_use: "current_use",
      gas_type: "gas_type",
      kitchen_type: "kitchen_type",
      bathroom_type: "bathroom_type",
      host_housing_type: "host_housing_type",
      cohabitation: "cohabitation",
      gender_policy: "gender_policy",
      deposit_required: "deposit_required",
      allows_pets: "allows_pets",
      allows_cooking: "allows_cooking",
      has_independent_entrance: "has_independent_entrance",
      has_own_water: "has_own_water"
    };

    if (specFields[field]) {
      // Find inside custom styled structures or name selector
      target = document.getElementById(specFields[field]) ||
        document.querySelector(`[name="${specFields[field]}"]`) ||
        document.querySelector(`[id^="${specFields[field]}"]`) as HTMLElement;
    }

    if (!target) {
      target = document.getElementById(field);
    }
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
      // 3. Find parent SectionCard layoutId to expand it if closed
      const sectionCard = target.closest('[id^="sec-"]');
      if (sectionCard && sectionCard.id) {
        window.dispatchEvent(
          new CustomEvent("expand-section-card", {
            detail: { layoutId: sectionCard.id }
          })
        );
      }

      // 4. Wait a brief moment for the expansion animation layout height calculation, then scroll/focus/pulse using Lenis
      setTimeout(() => {
        const rect = target!.getBoundingClientRect();
        const absoluteElementTop = rect.top + window.scrollY;
        // Posicionar el elemento en el centro de la pantalla
        const targetPosition = absoluteElementTop - (window.innerHeight / 2) + (rect.height / 2);
        // Encontrar el contenedor específico del parámetro.
        // Si el elemento objetivo (input/select) tiene un contenedor directo de tipo div, lo usamos.
        // Evitamos subir hasta divs contenedores de grid o secciones grandes.
        let container = target!;
        if (target!.id && document.getElementById(target!.id)) {
          // Si el input tiene ID (ej: title_es) y hay un div con ese id envolviéndolo, ese es el wrapper del parámetro
          const wrapperDiv = document.getElementById(target!.id)?.closest("div");
          if (wrapperDiv && (wrapperDiv as any) !== target!.closest("form") && (wrapperDiv as any) !== target!.closest('[id^="sec-"]')) {
            container = wrapperDiv;
          }
        } else {
          container = target!.closest("div") || target!;
        }
      
        // If container is an inner wrapper without an ID and its parent holds the <Label>,
        // promote container to that parent so the highlight includes the label text.
        if (container && !container.id && container.parentElement && container.parentElement.querySelector("label")) {
          container = container.parentElement;
        }
      
        if (lenis) {
          const currentPos = window.scrollY;
          const distance = Math.abs(targetPosition - currentPos);

          if (distance > 1200) {
            // Teletransporte: Salta directamente cerca del objetivo y hace un aterrizaje suave instantáneo
            const jumpTarget = targetPosition > currentPos ? targetPosition - 400 : targetPosition + 400;
            lenis.scrollTo(jumpTarget, { immediate: true });
            setTimeout(() => {
              lenis.scrollTo(targetPosition, {
                duration: 0.5,
                easing: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
              });
            }, 50);
          } else {
            // Scroll suave Lenis ultra rápido
            lenis.scrollTo(targetPosition, {
              duration: 0.5,
              easing: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
            });
          }
        } else {
          // Fallback manual rápido
          window.scrollTo({ top: targetPosition, behavior: "smooth" });
        }

        // Aplicar el nuevo sombreado verde neon de alta visibilidad al contenedor del parámetro completo
        container.classList.add("highlight-field-pulse");

        if (typeof (target as any).focus === "function") {
          (target as any).focus({ preventScroll: true });
        }

        setTimeout(() => {
          container.classList.remove("highlight-field-pulse");
        }, 3000);
      }, 350);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col justify-center select-none animate-fade-in"
      style={{ display: "flex", flexDirection: "column", gap: "3px", width: "180px", padding: "10px 12px", marginRight: "6px", cursor: "pointer", borderRadius: "8px" }}
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

      {isOpen && (
        <div style={{ position: "absolute", top: "100%", left: 0, width: "100%", height: "20px", zIndex: 99998, background: "transparent" }} />
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full right-0 p-5 rounded-xl shadow-2xl text-[11px] w-[480px] z-[99999] text-white leading-normal"
            style={{
              background: "rgba(15, 15, 15, 0.98)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 10px 35px -10px rgba(0,0,0,0.95)",
              transformOrigin: "top right",
              pointerEvents: "auto",
              marginTop: "0px", // Removes the gap to prevent accidental mouseleave triggers
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
                  className="space-y-2"
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

// ── Stable sensor config (module-level = never recreated on render) ──
const POINTER_SENSOR_OPTIONS = { activationConstraint: { distance: 8 } } as const;
const KEYBOARD_SENSOR_OPTIONS = { coordinateGetter: sortableKeyboardCoordinates } as const;

// ── PropertyForm props ──
interface PropertyFormProps {
  locale: string;
  propertyId: string;
  isNew?: boolean;
}

export function PropertyForm({ locale, propertyId, isNew = false }: PropertyFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INIT);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [zonesList, setZonesList] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [toast, setToast] = useState<{ message: string; id: string } | null>(null);

  const triggerToast = useCallback((message: string) => {
    setToast({ message, id: Math.random().toString() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  // ── Autosave state ──
  const [autosaving, setAutosaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [secondsSinceSave, setSecondsSinceSave] = useState(0);
  const savedSnapshotRef = useRef<{ form: FormData; imageIds: string[] } | null>(null);
  const formRef = useRef(form);
  const imagesRef = useRef(images);
  formRef.current = form;
  imagesRef.current = images;

  // ── Two-column DnD state (left/right independent stacks) ──
  const [leftColumnIds, setLeftColumnIds] = useState<string[]>([]);
  const [rightColumnIds, setRightColumnIds] = useState<string[]>([]);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Lifted open/closed state for each section (so DragOverlay can mirror it)
  const [sectionOpenState, setSectionOpenState] = useState<Record<string, boolean>>({
    "sec-clasificacion": true, "sec-contenido": true, "sec-precio": true,
    "sec-dimensiones": true, "sec-ubicacion": true, "sec-fotos": true,
    "sec-media": true, "sec-servicios": true, "sec-compartido": true, "sec-terreno": true,
  });
  const sectionOpenRef = useRef(sectionOpenState);
  // Keep ref in sync only when the state actually changes to avoid render loops
  useEffect(() => {
    sectionOpenRef.current = sectionOpenState;
  }, [sectionOpenState]);
  const setSecOpen = useCallback((id: string, v: boolean) => {
    setSectionOpenState(prev => ({ ...prev, [id]: v }));
  }, []);

  // Stable context value — only changes when sectionOpenState changes
  const sectionStateCtxValue = React.useMemo<SectionStateCtx>(() => ({
    getOpen: (id: string) => sectionOpenState[id] ?? true,
    setOpen: setSecOpen,
  }), [sectionOpenState, setSecOpen]);

  // Refs for stable access inside drag callbacks (no stale closures)
  const leftRef = useRef<string[]>([]);
  const rightRef = useRef<string[]>([]);
  const dragSnapshotRef = useRef<{ left: string[]; right: string[] } | null>(null);
  leftRef.current = leftColumnIds;
  rightRef.current = rightColumnIds;

  // Sensors using module-level stable options (avoids infinite render loops)
  const sensors = useSensors(
    useSensor(PointerSensor, POINTER_SENSOR_OPTIONS),
    useSensor(KeyboardSensor, KEYBOARD_SENSOR_OPTIONS),
  );

  // Calculate and sync sections when loading finishes or dynamic sections changes
  const variant = getLayoutVariant(form.property_type, form.operation);
  const isVacacional = variant === "vacacional";
  const isLand = variant === "land";
  const isShared = variant === "shared";
  const hasServices = !!(form.property_type && form.operation && checkFieldApplies("services_section", form.property_type, form.operation));
  const hasSecurity = !!(form.property_type && form.operation && checkFieldApplies("security_section", form.property_type, form.operation));
  const hasShared = !!(form.property_type && form.operation && checkFieldApplies("shared_section", form.property_type, form.operation));
  const hasLandSection = !!(form.property_type && form.operation && checkFieldApplies("land_section", form.property_type, form.operation));
  const hasDimensions = !!(form.property_type && form.operation);
  const hasMedia = !!(form.property_type && form.operation);

  // Sync two-column state when sections activate/deactivate
  useEffect(() => {
    if (loading) return;

    const defaultLeft = ["sec-clasificacion", "sec-contenido", "sec-dimensiones", "sec-fotos"];
    const defaultRight = ["sec-precio", "sec-ubicacion", "sec-servicios", "sec-compartido", "sec-terreno", "sec-media"];

    const active = new Set<string>([
      "sec-clasificacion", "sec-contenido", "sec-precio", "sec-dimensiones",
      "sec-ubicacion", "sec-fotos", "sec-media",
    ]);
    if (hasShared) active.add("sec-compartido");
    if (hasLandSection) active.add("sec-terreno");
    if (hasServices || hasSecurity) active.add("sec-servicios");

    // Use ref values to avoid stale closure
    const curLeft = leftRef.current.filter(id => active.has(id));
    const curRight = rightRef.current.filter(id => active.has(id));

    // Add any newly active sections in their default column
    const insertOrdered = (arr: string[], id: string, defaultOrder: string[]) => {
      const targetIdx = defaultOrder.indexOf(id);
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        if (item && defaultOrder.indexOf(item) > targetIdx) { arr.splice(i, 0, id); return; }
      }
      arr.push(id);
    };

    [...active].forEach(id => {
      if (!curLeft.includes(id) && !curRight.includes(id)) {
        if (defaultLeft.includes(id)) insertOrdered(curLeft, id, defaultLeft);
        else insertOrdered(curRight, id, defaultRight);
      }
    });

    setLeftColumnIds([...curLeft]);
    setRightColumnIds([...curRight]);
  }, [loading, form.property_type, form.operation, hasShared, hasLandSection, hasServices, hasSecurity]);

  // Drag handlers
  const handleDragStart = useCallback((e: DragStartEvent) => {
    const id = e.active.id as string;
    setActiveDragId(id);
    dragSnapshotRef.current = { left: [...leftRef.current], right: [...rightRef.current] };
  }, []);

  const handleDragOver = useCallback((e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;
    const aid = active.id as string;
    const oid = over.id as string;
    const L = leftRef.current;
    const R = rightRef.current;
    const inLeft = L.includes(aid);
    const overL = L.includes(oid) || oid === "droppable-left";
    const overR = R.includes(oid) || oid === "droppable-right";
    if (!overL && !overR) return;

    if (inLeft && overR) {
      // left → right
      const idx = oid === "droppable-right" ? R.length : Math.max(0, R.indexOf(oid));
      const newR = [...R.filter(id => id !== aid)]; newR.splice(idx, 0, aid);
      setLeftColumnIds(L.filter(id => id !== aid));
      setRightColumnIds(newR);
    } else if (!inLeft && overL) {
      // right → left
      const idx = oid === "droppable-left" ? L.length : Math.max(0, L.indexOf(oid));
      const newL = [...L.filter(id => id !== aid)]; newL.splice(idx, 0, aid);
      setRightColumnIds(R.filter(id => id !== aid));
      setLeftColumnIds(newL);
    } else if (inLeft && overL && aid !== oid) {
      // within left
      const o = L.indexOf(aid), n = L.indexOf(oid);
      if (o !== -1 && n !== -1) setLeftColumnIds(arrayMove(L, o, n));
    } else if (!inLeft && overR && aid !== oid) {
      // within right
      const o = R.indexOf(aid), n = R.indexOf(oid);
      if (o !== -1 && n !== -1) setRightColumnIds(arrayMove(R, o, n));
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    setActiveDragId(null);
    dragSnapshotRef.current = null;
  }, []);

  const handleDragCancel = useCallback(() => {
    if (dragSnapshotRef.current) {
      setLeftColumnIds(dragSnapshotRef.current.left);
      setRightColumnIds(dragSnapshotRef.current.right);
    }
    setActiveDragId(null);
  }, []);

  const set = (key: keyof FormData, val: any) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const toggleBadge = (badge: string, checked: boolean) => {
    let badges = form.listing_badge ? form.listing_badge.split(",").map(b => b.trim()).filter(Boolean) : [];
    if (checked) {
      if (!badges.includes(badge)) badges.push(badge);
    } else {
      badges = badges.filter(b => b !== badge);
    }
    set("listing_badge", badges.length > 0 ? badges.join(",") : "basico");
  };

  const hasBadge = (badge: string): boolean => {
    if (!form.listing_badge) return false;
    return form.listing_badge.split(",").map(b => b.trim()).includes(badge);
  };

  const checkApplies = (fieldOrGroup: string): boolean => {
    if (!form.property_type || !form.operation) {
      const UNIVERSAL_FIELDS = [
        "title_es", "description_es", "title_en", "description_en",
        "price", "price_currency",
        "lat", "lng", "address_es", "address_en", "zone_id", "municipio",
        "images", "status", "listing_badge", "featured", "exclusive", "show_exact_location"
      ];
      return UNIVERSAL_FIELDS.includes(fieldOrGroup);
    }
    return checkFieldApplies(fieldOrGroup, form.property_type, form.operation);
  };

  const calculateProgress = (f: FormData, imgs: any[]): { score: number; recommendations: { label: string; weight: number; field: string }[] } => {
    return computeCompletenessScore(f, f.property_type, f.operation, imgs.length, checkApplies);
  };

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
          operation: isNew ? "" : (prop.operation ?? ""),
          property_type: isNew ? "" : (prop.property_type ?? ""),
          status: isNew ? "borrador" : (prop.status ?? ""),
          listing_badge: prop.listing_badge ?? "basico",
          completeness_score: isNew ? "0" : (prop.completeness_score?.toString() ?? "0"),
          featured: !!prop.featured,
          exclusive: !!prop.exclusive,
          new_listing: isNew ? false : !!prop.new_listing,
          price_reduced: !!prop.price_reduced,
          title_es: transEs.title || "",
          description_es: transEs.description || "",
          title_en: transEn.title || "",
          description_en: transEn.description || "",
          price: isNew ? "" : (prop.price && Number(prop.price) !== 0 ? prop.price.toString() : ""),
          price_currency: isNew ? "" : (prop.price_currency ?? ""),
          price_negotiable: !!prop.price_negotiable,
          price_usd: prop.price_usd?.toString() || "",
          maintenance_fee: prop.maintenance_fee?.toString() || "",
          price_per_night: prop.price_per_night?.toString() || "",
          price_weekend: prop.price_weekend?.toString() || "",
          min_nights: isNew ? "" : (prop.min_nights?.toString() || ""),
          max_guests: isNew ? "" : (prop.max_guests?.toString() || ""),
          checkin_time: isNew ? "" : (prop.checkin_time || ""),
          checkout_time: isNew ? "" : (prop.checkout_time || ""),
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
          furnished: isNew ? "" : (prop.furnished ?? ""),
          municipio: prop.municipio || "",
          zone_id: prop.zone_id || "",
          address_es: prop.address_es || "",
          address_en: prop.address_en || "",
          lat: prop.lat?.toString() || "",
          lng: prop.lng?.toString() || "",
          show_exact_location: isNew ? false : !!prop.show_exact_location,
          has_elevator: prop.has_elevator === null ? null : !!prop.has_elevator,
          has_water_tank: prop.has_water_tank === null ? null : !!prop.has_water_tank,
          has_hot_water: prop.has_hot_water === null ? null : !!prop.has_hot_water,
          has_generator: prop.has_generator === null ? null : !!prop.has_generator,
          gas_type: prop.gas_type || "",
          has_internet: prop.has_internet === null ? null : !!prop.has_internet,
          has_security_24h: prop.has_security_24h === null ? null : !!prop.has_security_24h,
          has_electric_gate: prop.has_electric_gate === null ? null : !!prop.has_electric_gate,
          has_cctv: prop.has_cctv === null ? null : !!prop.has_cctv,
          has_electric_fence: prop.has_electric_fence === null ? null : !!prop.has_electric_fence,
          has_intercom: prop.has_intercom === null ? null : !!prop.has_intercom,
          has_armored_door: prop.has_armored_door === null ? null : !!prop.has_armored_door,
          has_ac: prop.has_ac === null ? null : !!prop.has_ac,
          has_heating: prop.has_heating === null ? null : !!prop.has_heating,
          kitchen_type: prop.kitchen_type || "",
          bathroom_type: prop.bathroom_type || "",
          host_housing_type: prop.host_housing_type || "",
          cohabitation: prop.cohabitation || "",
          occupants_count: prop.occupants_count?.toString() || "",
          gender_policy: prop.gender_policy || "",
          deposit_required: isNew ? null : (prop.deposit_required === null ? null : !!prop.deposit_required),
          deposit_amount: prop.deposit_amount?.toString() || "",
          allows_pets: prop.allows_pets === null ? null : !!prop.allows_pets,
          allows_cooking: prop.allows_cooking === null ? null : !!prop.allows_cooking,
          has_independent_entrance: prop.has_independent_entrance === null ? null : !!prop.has_independent_entrance,
          topography: prop.topography || "",
          land_use: prop.land_use || "",
          access_type: prop.access_type || "",
          current_use: prop.current_use || "",
          has_own_water: prop.has_own_water === null ? null : !!prop.has_own_water,
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
  }, [propertyId, isNew]);

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

  // ── Autosave handler (silent) ──
  const handleAutosave = useCallback(async () => {
    const currentForm = formRef.current;
    const currentImages = imagesRef.current;
    const snapshot = savedSnapshotRef.current;

    // Check if dirty by comparing JSON of form fields and image IDs
    const currentImageIds = currentImages.map(i => i.id).join(",");
    const isDirty = !snapshot ||
      JSON.stringify(currentForm) !== JSON.stringify(snapshot.form) ||
      currentImageIds !== snapshot.imageIds.join(",");

    if (!isDirty) return;
    if (!currentForm.operation || !currentForm.property_type) return;

    setAutosaving(true);
    try {
      const supabase = createClient();
      const { score: currentProgress } = computeCompletenessScore(
        currentForm,
        currentForm.property_type,
        currentForm.operation,
        currentImages.length,
        (f) => checkFieldApplies(f, currentForm.property_type, currentForm.operation)
      );
      const { error: propErr } = await supabase
        .from("properties")
        .update({
          operation: currentForm.operation,
          property_type: currentForm.property_type,
          status: currentForm.status,
          price: parseFloat(currentForm.price) || 0,
          price_currency: currentForm.price_currency,
          price_negotiable: currentForm.price_negotiable,
          price_usd: currentForm.price_usd ? parseFloat(currentForm.price_usd) : null,
          maintenance_fee: currentForm.maintenance_fee ? parseFloat(currentForm.maintenance_fee) : null,
          price_per_night: currentForm.price_per_night ? parseFloat(currentForm.price_per_night) : null,
          price_weekend: currentForm.price_weekend ? parseFloat(currentForm.price_weekend) : null,
          min_nights: currentForm.min_nights ? parseInt(currentForm.min_nights) : 1,
          max_guests: currentForm.max_guests ? parseInt(currentForm.max_guests) : null,
          checkin_time: currentForm.checkin_time || null,
          checkout_time: currentForm.checkout_time || null,
          house_rules: currentForm.house_rules || null,
          includes_breakfast: currentForm.includes_breakfast,
          area_built: currentForm.area_built ? parseFloat(currentForm.area_built) : null,
          area_total: currentForm.area_total ? parseFloat(currentForm.area_total) : null,
          area_hectares: currentForm.area_hectares ? parseFloat(currentForm.area_hectares) : null,
          bedrooms: currentForm.bedrooms ? parseInt(currentForm.bedrooms) : null,
          bathrooms: currentForm.bathrooms ? parseInt(currentForm.bathrooms) : null,
          half_bathrooms: currentForm.half_bathrooms ? parseInt(currentForm.half_bathrooms) : null,
          parking_spaces: currentForm.parking_spaces ? parseInt(currentForm.parking_spaces) : null,
          parking_covered: currentForm.parking_covered,
          total_floors: currentForm.floors ? parseInt(currentForm.floors) : null,
          floor_number: currentForm.floor_number ? parseInt(currentForm.floor_number) : null,
          year_built: currentForm.year_built ? parseInt(currentForm.year_built) : null,
          property_age: currentForm.year_built ? (new Date().getFullYear() - parseInt(currentForm.year_built)) : null,
          condition: currentForm.condition || null,
          furnished: currentForm.furnished || "sin_muebles",
          municipio: currentForm.municipio || null,
          zone_id: currentForm.zone_id || null,
          address_es: currentForm.address_es || null,
          address_en: currentForm.address_en || null,
          lat: currentForm.lat ? parseFloat(currentForm.lat) : null,
          lng: currentForm.lng ? parseFloat(currentForm.lng) : null,
          show_exact_location: currentForm.show_exact_location,
          has_elevator: currentForm.has_elevator,
          has_water_tank: currentForm.has_water_tank,
          has_hot_water: currentForm.has_hot_water,
          has_generator: currentForm.has_generator,
          gas_type: currentForm.gas_type || null,
          has_internet: currentForm.has_internet,
          has_security_24h: currentForm.has_security_24h,
          has_electric_gate: currentForm.has_electric_gate,
          has_cctv: currentForm.has_cctv,
          has_electric_fence: currentForm.has_electric_fence,
          has_intercom: currentForm.has_intercom,
          has_armored_door: currentForm.has_armored_door,
          has_ac: currentForm.has_ac,
          has_heating: currentForm.has_heating,
          kitchen_type: currentForm.kitchen_type || null,
          bathroom_type: currentForm.bathroom_type || null,
          host_housing_type: currentForm.host_housing_type || null,
          cohabitation: currentForm.cohabitation || null,
          occupants_count: currentForm.occupants_count ? parseInt(currentForm.occupants_count) : null,
          gender_policy: currentForm.gender_policy || null,
          deposit_required: currentForm.deposit_required,
          deposit_amount: currentForm.deposit_amount ? parseFloat(currentForm.deposit_amount) : null,
          allows_pets: currentForm.allows_pets,
          allows_cooking: currentForm.allows_cooking,
          has_independent_entrance: currentForm.has_independent_entrance,
          topography: currentForm.topography || null,
          land_use: currentForm.land_use || null,
          access_type: currentForm.access_type || null,
          current_use: currentForm.current_use || null,
          has_own_water: currentForm.has_own_water,
          video_url: currentForm.video_url || null,
          virtual_tour_url: currentForm.virtual_tour_url || null,
          listing_badge: currentForm.listing_badge || "basico",
          completeness_score: currentProgress,
          updated_at: new Date().toISOString(),
        })
        .eq("id", propertyId);

      if (!propErr) {
        // Upsert translations
        const { error: transErr } = await supabase.from("property_translations").upsert([
          { property_id: propertyId, locale: "es", title: currentForm.title_es, description: currentForm.description_es || null },
          { property_id: propertyId, locale: "en", title: currentForm.title_en || currentForm.title_es, description: currentForm.description_en || null },
        ], { onConflict: "property_id,locale" });
        if (transErr) throw transErr;

        // Update snapshot
        savedSnapshotRef.current = {
          form: { ...currentForm },
          imageIds: currentImages.map(i => i.id),
        };
        setLastSavedAt(new Date());
        setSecondsSinceSave(0);
      }
    } catch {
      // Silent fail — autosave errors don't block the user
    } finally {
      setAutosaving(false);
    }
  }, [propertyId]);

  // ── AUTOSAVE CONFIGURATION ──
  // The autosave timer is scheduled to run every 1 minute (60,000 ms).
  // NOTE: The user profile "zsoftuser@gmail.com" (UUID: af54a9c7-5b60-41a0-81d2-f17eb4b862ab)
  // is verified as an "admin" in the "agents" table. Database write permissions should be fully functional.
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(handleAutosave, 60000);
    return () => clearInterval(interval);
  }, [loading, handleAutosave]);

  // ── Tick counter: update "X seconds ago" every second ──
  useEffect(() => {
    if (!lastSavedAt) return;
    const tick = setInterval(() => {
      setSecondsSinceSave(Math.floor((Date.now() - lastSavedAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [lastSavedAt]);

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.operation || !form.property_type) {
      setError("Por favor, selecciona primero la Operación y el Tipo de Inmueble.");
      return;
    }
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
          has_elevator: form.has_elevator,
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
          updated_at: new Date().toISOString(),
        })
        .eq("id", propertyId);
      if (propErr) throw propErr;
      const { error: transErr } = await supabase.from("property_translations").upsert([
        { property_id: propertyId, locale: "es", title: form.title_es, description: form.description_es || null },
        { property_id: propertyId, locale: "en", title: form.title_en || form.title_es, description: form.description_en || null },
      ], { onConflict: "property_id,locale" });
      if (transErr) throw transErr;
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
      // After explicit save, update the snapshot so autosave doesn't re-save immediately
      savedSnapshotRef.current = {
        form: { ...form },
        imageIds: images.map(i => i.id),
      };
      setLastSavedAt(new Date());
      setSecondsSinceSave(0);
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

  // ─── SECTION COMPONENTS ───────────────────────────────────────────────────

  // Clasificación — always in left column now
  const sectionClasificacion = (
    <SectionCard title="Clasificación y Publicación" layoutId="sec-clasificacion">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        <div id="operation">
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
        <div id="property_type">
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
      </div>

      <div style={{ borderTop: "1px solid var(--p-border)", marginTop: "16px", paddingTop: "12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px 16px" }}>
          <Toggle checked={form.featured} onChange={(v) => set("featured", v)} label="Destacada" />
          <Toggle checked={form.exclusive} onChange={(v) => set("exclusive", v)} label="Exclusiva" />
          <Toggle checked={form.price_reduced} onChange={(v) => set("price_reduced", v)} label="Precio reducido" />
          <Toggle
            checked={hasBadge("oportunidad")}
            onChange={(v) => toggleBadge("oportunidad", v)}
            label="Oportunidad"
          />
          <Toggle
            checked={hasBadge("ultima_unidad")}
            onChange={(v) => toggleBadge("ultima_unidad", v)}
            label="Última Unidad"
          />
        </div>
      </div>
    </SectionCard>
  );

  // Contenido multi-idioma — always left
  const sectionContenido = (
    <SectionCard title="Contenido de la publicación" layoutId="sec-contenido" warningText={!form.operation && !form.property_type ? "Selecciona Operación y Tipo de inmueble" : !form.operation ? "Selecciona Tipo de Operación" : !form.property_type ? "Selecciona Tipo de Inmueble" : ""} onWarning={triggerToast}>
      <div className="space-y-6">
        {/* Sección en Español */}
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Publicación en Español</div>
          <div>
            <Label>Título (Español)</Label>
            <input id="title_es" value={form.title_es} onChange={(e) => set("title_es", e.target.value)} placeholder="Ej: Apartamento duplex en La Pedregosa" style={INPUT.base} required />
          </div>
          <div>
            <Label>Descripción (Español)</Label>
            <textarea id="description_es" value={form.description_es} onChange={(e) => set("description_es", e.target.value)} placeholder="Descripción en español..." style={INPUT.textarea} rows={6} />
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--p-border)", paddingTop: "16px" }} className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Publicación en Inglés (Opcional)</div>
          <div>
            <Label>Título (Inglés)</Label>
            <input id="title_en" value={form.title_en} onChange={(e) => set("title_en", e.target.value)} placeholder="Ej: Duplex apartment in La Pedregosa" style={INPUT.base} />
          </div>
          <div>
            <Label>Descripción (Inglés)</Label>
            <textarea id="description_en" value={form.description_en} onChange={(e) => set("description_en", e.target.value)} placeholder="Description in English..." style={INPUT.textarea} rows={6} />
          </div>
        </div>
      </div>
    </SectionCard>
  );

  // Precio — left
  const sectionPrecio = (
    <SectionCard title={isVacacional ? "Precio Base y Tarifas" : "Precio y Condiciones Financieras"} layoutId="sec-precio" warningText={!form.operation && !form.property_type ? "Selecciona Operación y Tipo de inmueble" : !form.operation ? "Selecciona Tipo de Operación" : !form.property_type ? "Selecciona Tipo de Inmueble" : ""} onWarning={triggerToast}>
      {isVacacional ? (
        <div className="space-y-4">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px" }}>
            <div id="price_per_night">
              <Label>Precio por noche (USD)</Label>
              <FormattedNumberInput value={form.price_per_night} onChange={(val) => set("price_per_night", val)} style={INPUT.base} />
            </div>
            <div id="price_weekend">
              <Label>Tarifa fines de semana</Label>
              <FormattedNumberInput value={form.price_weekend} onChange={(val) => set("price_weekend", val)} style={INPUT.base} />
            </div>
            <div id="price">
              <Label>Precio base (referencia)</Label>
              <FormattedNumberInput value={form.price} onChange={(val) => set("price", val)} style={INPUT.base} />
            </div>
            <div id="price_currency">
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
            <div id="min_nights">
              <Label>Mínimo de noches</Label>
              <NumberStepper value={form.min_nights} onChange={(val) => set("min_nights", val)} min={1} />
            </div>
            <div id="max_guests">
              <Label>Máximo de huéspedes</Label>
              <NumberStepper value={form.max_guests} onChange={(val) => set("max_guests", val)} min={1} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div id="checkin_time">
              <Label>Hora Check-in</Label>
              <FormSelect
                value={form.checkin_time}
                onChange={(val) => set("checkin_time", val)}
                options={["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"].map(t => ({ value: t, label: t }))}
              />
            </div>
            <div id="checkout_time">
              <Label>Hora Check-out</Label>
              <FormSelect
                value={form.checkout_time}
                onChange={(val) => set("checkout_time", val)}
                options={["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"].map(t => ({ value: t, label: t }))}
              />
            </div>
          </div>
          <div id="house_rules">
            <Label>Normas de la casa / House Rules</Label>
            <textarea value={form.house_rules} onChange={(e) => set("house_rules", e.target.value)} placeholder="Normas de convivencia, políticas de ruido..." style={INPUT.textarea} />
          </div>
          <div id="includes_breakfast">
            <Toggle checked={form.includes_breakfast} onChange={(v) => set("includes_breakfast", v)} label="Incluye desayuno" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px" }}>
            <div id="price">
              <Label>{form.operation === "alquiler" ? "Canon mensual" : "Precio base"}</Label>
              <FormattedNumberInput value={form.price} onChange={(val) => set("price", val)} style={INPUT.base} required />
            </div>
            <div id="price_currency">
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
              <div id="maintenance_fee">
                <Label>Cuota de condominio</Label>
                <FormattedNumberInput value={form.maintenance_fee} onChange={(val) => set("maintenance_fee", val)} style={INPUT.base} />
              </div>
            )}
            {form.operation === "alquiler" && form.deposit_required && (
              <div id="deposit_amount">
                <Label>Monto depósito (USD)</Label>
                <FormattedNumberInput value={form.deposit_amount} onChange={(val) => set("deposit_amount", val)} style={INPUT.base} />
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <Toggle checked={form.price_negotiable} onChange={(v) => set("price_negotiable", v)} label="Precio negociable" />
            {form.operation === "alquiler" && (
              <div id="deposit_required">
                <Toggle checked={!!form.deposit_required} onChange={(v) => {
                  set("deposit_required", v);
                  if (!v) set("deposit_amount", "");
                }} label="Requiere depósito" />
              </div>
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
          <div id="area_built">
            <Label>Área construida (m²)</Label>
            <FormattedNumberInput value={form.area_built} onChange={(val) => set("area_built", val)} style={INPUT.base} />
          </div>
        )}
        <div id="area_total">
          <Label>Área total terreno (m²)</Label>
          <FormattedNumberInput value={form.area_total} onChange={(val) => set("area_total", val)} style={INPUT.base} />
        </div>
        {checkApplies("area_hectares") && (
          <div id="area_hectares">
            <Label>Área en hectáreas</Label>
            <FormattedNumberInput value={form.area_hectares} onChange={(val) => set("area_hectares", val)} style={INPUT.base} />
          </div>
        )}
        {checkApplies("bedrooms") && (
          <div id="bedrooms">
            <Label>Habitaciones</Label>
            <NumberStepper value={form.bedrooms} onChange={(val) => set("bedrooms", val)} min={0} />
          </div>
        )}
        {checkApplies("bathrooms") && (
          <div id="bathrooms">
            <Label>Baños completos</Label>
            <NumberStepper value={form.bathrooms} onChange={(val) => set("bathrooms", val)} min={0} />
          </div>
        )}
        {checkApplies("half_bathrooms") && (
          <div id="half_bathrooms">
            <Label>Medios baños</Label>
            <NumberStepper value={form.half_bathrooms} onChange={(val) => set("half_bathrooms", val)} min={0} />
          </div>
        )}
        {checkApplies("parking") && (
          <div id="parking_spaces">
            <Label>Estacionamientos</Label>
            <NumberStepper value={form.parking_spaces} onChange={(val) => set("parking_spaces", val)} min={0} />
          </div>
        )}
        {checkApplies("floor_number") && (
          <div id="floor_number">
            <Label>Número de piso</Label>
            <NumberStepper value={form.floor_number} onChange={(val) => set("floor_number", val)} min={0} />
          </div>
        )}
        {checkApplies("floors") && (
          <div id="total_floors">
            <Label>Pisos totales</Label>
            <NumberStepper value={form.floors} onChange={(val) => set("floors", val)} min={0} />
          </div>
        )}
        {checkApplies("year_built") && (
          <div id="year_built">
            <Label>Año de construcción</Label>
            <input type="number" value={form.year_built} onChange={(e) => set("year_built", e.target.value)} placeholder="Ej: 2015" style={INPUT.base} />
          </div>
        )}
        {checkApplies("condition") && (
          <div id="condition">
            <Label>Estado de conservación</Label>
            <FormSelect
              value={form.condition}
              onChange={(val) => set("condition", val)}
              placeholder="Seleccionar..."
              options={[
                { value: "nuevo", label: "Nuevo / A estrenar" },
                { value: "excelente", label: "Excelente" },
                { value: "buen_estado", label: "Buen estado" },
                { value: "por_remodelar", label: "Por remodelar" },
                { value: "en_gris", label: "En obra gris" },
              ]}
            />
          </div>
        )}
        {checkApplies("furnished") && (
          <div id="furnished">
            <Label>Mobiliario</Label>
            <FormSelect
              value={form.furnished}
              onChange={(val) => set("furnished", val)}
              options={[
                { value: "sin_muebles", label: "Sin muebles" },
                { value: "semi_amoblado", label: "Semi amoblado" },
                { value: "amoblado", label: "Amoblado" },
              ]}
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
    <SectionCard title="Fotos de la propiedad (hasta 20)" layoutId="sec-fotos" id="images" warningText={!form.operation && !form.property_type ? "Selecciona Operación y Tipo de inmueble" : !form.operation ? "Selecciona Tipo de Operación" : !form.property_type ? "Selecciona Tipo de Inmueble" : ""} onWarning={triggerToast}>
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
    <SectionCard title="Ubicación" layoutId="sec-ubicacion" warningText={!form.operation && !form.property_type ? "Selecciona Operación y Tipo de inmueble" : !form.operation ? "Selecciona Tipo de Operación" : !form.property_type ? "Selecciona Tipo de Inmueble" : ""} onWarning={triggerToast}>
      <div className="space-y-3">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div id="municipio">
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
          <div id="zone_id">
            <Label>Zona / Sector</Label>
            <SearchableFormSelect
              value={form.zone_id}
              onChange={(val) => set("zone_id", val)}
              placeholder="Seleccionar zona..."
              options={zonesList}
            />
          </div>
        </div>
        <div>
          <Label>Dirección (Español)</Label>
          <input id="address_es" value={form.address_es} onChange={(e) => set("address_es", e.target.value)} placeholder="Calle, edificio..." style={INPUT.base} />
        </div>
        <div>
          <Label>Dirección (Inglés)</Label>
          <input id="address_en" value={form.address_en} onChange={(e) => set("address_en", e.target.value)} placeholder="Street name, reference..." style={INPUT.base} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <Label>Latitud</Label>
            <input id="lat" type="number" step="any" value={form.lat} onChange={(e) => set("lat", e.target.value)} placeholder="8.59" style={INPUT.base} />
          </div>
          <div>
            <Label>Longitud</Label>
            <input id="lng" type="number" step="any" value={form.lng} onChange={(e) => set("lng", e.target.value)} placeholder="-71.14" style={INPUT.base} />
          </div>
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
                    { value: "central", label: "Gas central" },
                    { value: "no_tiene", label: "No tiene" },
                  ]}
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
              <div id="has_water_tank"><YesNoSelector value={form.has_water_tank} onChange={(v) => set("has_water_tank", v)} label="Tanque de agua" /></div>
              <div id="has_hot_water"><YesNoSelector value={form.has_hot_water} onChange={(v) => set("has_hot_water", v)} label="Agua caliente" /></div>
              <div id="has_generator"><YesNoSelector value={form.has_generator} onChange={(v) => set("has_generator", v)} label="Generador" /></div>
              <div id="has_internet"><YesNoSelector value={form.has_internet} onChange={(v) => set("has_internet", v)} label="Internet" /></div>
              <div id="has_ac"><YesNoSelector value={form.has_ac} onChange={(v) => set("has_ac", v)} label="Aire acondicionado" /></div>
              <div id="has_heating"><YesNoSelector value={form.has_heating} onChange={(v) => set("has_heating", v)} label="Calefacción" /></div>
              {checkApplies("elevator") && (
                <div id="has_elevator"><YesNoSelector value={form.has_elevator} onChange={(v) => set("has_elevator", v)} label="Ascensor" /></div>
              )}
              {checkApplies("has_independent_entrance") && !hasShared && (
                <div id="has_independent_entrance"><YesNoSelector value={form.has_independent_entrance} onChange={(v) => set("has_independent_entrance", v)} label="Entrada independiente" /></div>
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
              <div id="has_security_24h"><YesNoSelector value={form.has_security_24h} onChange={(v) => set("has_security_24h", v)} label="Seguridad 24h" /></div>
              <div id="has_electric_gate"><YesNoSelector value={form.has_electric_gate} onChange={(v) => set("has_electric_gate", v)} label="Portón eléctrico" /></div>
              <div id="has_cctv"><YesNoSelector value={form.has_cctv} onChange={(v) => set("has_cctv", v)} label="CCTV / Cámaras" /></div>
              {checkApplies("has_electric_fence") && (
                <div id="has_electric_fence"><YesNoSelector value={form.has_electric_fence} onChange={(v) => set("has_electric_fence", v)} label="Cerco eléctrico" /></div>
              )}
              <div id="has_intercom"><YesNoSelector value={form.has_intercom} onChange={(v) => set("has_intercom", v)} label="Intercomunicador" /></div>
              <div id="has_armored_door"><YesNoSelector value={form.has_armored_door} onChange={(v) => set("has_armored_door", v)} label="Puerta blindada" /></div>
            </div>
          </>
        )}
      </div>
    </SectionCard>
  ) : null;

  // Compartido/Habitación — shared variant only
  const sectionCompartido = hasShared ? (
    <SectionCard title="Condiciones de Habitación" layoutId="sec-compartido" defaultOpen={true}>
      <div className="space-y-4">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px 16px" }}>
          <div id="bathroom_type">
            <Label>Tipo de baño</Label>
            <FormSelect value={form.bathroom_type} onChange={(val) => set("bathroom_type", val)} placeholder="Seleccionar..." options={[{ value: "privado", label: "Baño privado" }, { value: "compartido", label: "Baño compartido" }].sort((a, b) => a.label.localeCompare(b.label))} />
          </div>
          <div id="host_housing_type">
            <Label>Vivienda del anfitrión</Label>
            <FormSelect value={form.host_housing_type} onChange={(val) => set("host_housing_type", val)} placeholder="Seleccionar..." options={[{ value: "casa", label: "Casa" }, { value: "apartamento", label: "Apartamento" }].sort((a, b) => a.label.localeCompare(b.label))} />
          </div>
          <div id="cohabitation">
            <Label>Cohabitación</Label>
            <FormSelect value={form.cohabitation} onChange={(val) => set("cohabitation", val)} placeholder="Seleccionar..." options={[{ value: "solo_inquilinos", label: "Solo inquilinos" }, { value: "con_propietario", label: "Con propietario" }].sort((a, b) => a.label.localeCompare(b.label))} />
          </div>
          <div id="gender_policy">
            <Label>Política de género</Label>
            <FormSelect value={form.gender_policy} onChange={(val) => set("gender_policy", val)} placeholder="Seleccionar..." options={[{ value: "mixto", label: "Mixto" }, { value: "solo_mujeres", label: "Solo mujeres" }, { value: "solo_hombres", label: "Solo hombres" }].sort((a, b) => a.label.localeCompare(b.label))} />
          </div>
          <div id="occupants_count">
            <Label>Ocupantes actuales</Label>
            <NumberStepper value={form.occupants_count} onChange={(val) => set("occupants_count", val)} min={0} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "10px 16px", borderTop: "1px solid var(--p-border)", paddingTop: "12px" }}>
          <div id="allows_pets"><YesNoSelector value={form.allows_pets} onChange={(v) => set("allows_pets", v)} label="Acepta mascotas" /></div>
          <div id="allows_cooking"><YesNoSelector value={form.allows_cooking} onChange={(v) => set("allows_cooking", v)} label="Permite cocinar" /></div>
          <div id="has_independent_entrance_shared"><YesNoSelector value={form.has_independent_entrance} onChange={(v) => set("has_independent_entrance", v)} label="Entrada independiente" /></div>
        </div>
      </div>
    </SectionCard>
  ) : null;

  // Terreno y Campo — right for hacienda, main for land
  const sectionTerreno = hasLandSection ? (
    <SectionCard title="Parámetros de Terreno y Campo" layoutId="sec-terreno" defaultOpen={true}>
      <div style={{ display: "grid", gridTemplateColumns: isLand ? "repeat(3, 1fr)" : "repeat(2, 1fr)", gap: "12px 16px" }}>
        <div id="topography">
          <Label>Topografía</Label>
          <FormSelect value={form.topography} onChange={(val) => set("topography", val)} placeholder="Seleccionar..." options={[{ value: "plano", label: "Plano" }, { value: "inclinado", label: "Semi-inclinado" }, { value: "irregular", label: "Irregular / Quebrado" }].sort((a, b) => a.label.localeCompare(b.label))} />
        </div>
        <div id="access_type">
          <Label>Vía de acceso</Label>
          <FormSelect value={form.access_type} onChange={(val) => set("access_type", val)} placeholder="Seleccionar..." options={[{ value: "asfalto", label: "Asfalto / Pavimento" }, { value: "tierra", label: "Tierra / Granzón" }, { value: "concreto", label: "Concreto" }].sort((a, b) => a.label.localeCompare(b.label))} />
        </div>
        <div id="land_use">
          <Label>Uso del suelo</Label>
          <input id="land_use_input" value={form.land_use} onChange={(e) => set("land_use", e.target.value)} placeholder="Ej: Residencial, Agrícola" style={INPUT.base} />
        </div>
        <div id="current_use">
          <Label>Uso actual</Label>
          <input id="current_use_input" value={form.current_use} onChange={(e) => set("current_use", e.target.value)} placeholder="Ej: Cultivo, Vacío" style={INPUT.base} />
        </div>
        {isLand && (
          <div>
            <Label>Área en hectáreas</Label>
            <FormattedNumberInput value={form.area_hectares} onChange={(val) => set("area_hectares", val)} style={INPUT.base} />
          </div>
        )}
        <div id="has_own_water" style={{ display: "flex", alignItems: "center", minHeight: "38px", paddingTop: "14px" }}>
          <YesNoSelector value={form.has_own_water} onChange={(v) => set("has_own_water", v)} label="Agua propia (Manantial / Pozo)" />
        </div>
      </div>
    </SectionCard>
  ) : null;

  // Media — right
  const sectionMedia = (
    <SectionCard title="Video y Tour Virtual" layoutId="sec-media" defaultOpen={true}>
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
  {/* Header with high stacking priority to ensure its dropdown overlays main columns */}
  <div className="flex items-center justify-between mb-6" style={{ position: "relative", zIndex: 10000 }}>
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
  <div className="flex items-center gap-2 flex-wrap">
  <p className="text-[12px]" style={{ color: "var(--p-text-2)" }}>
  Modifica la información y fotos de la publicación
  </p>
  {!loading && (autosaving || lastSavedAt) && (
  <span className="text-[11px] italic font-normal text-[var(--p-text-3)]" style={{ color: "var(--p-text-3)", fontStyle: "italic" }}>
  {autosaving ? (
  "• Guardando..."
  ) : lastSavedAt ? (
  `• Guardado hace ${secondsSinceSave < 60 ? "<1min" : `${Math.floor(secondsSinceSave / 60)}min`}`
  ) : null}
  </span>
  )}
  </div>
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
   
  {/* ─── Fixed Static Two-Column Layout (Drag and Drop disabled) ─── */}
  {(() => {
    const activeSections: React.ReactNode[] = [];
    activeSections.push(sectionClasificacion);
    activeSections.push(sectionContenido);
    activeSections.push(sectionPrecio);
    activeSections.push(sectionUbicacion);
    activeSections.push(sectionFotos);
    if (hasDimensions) activeSections.push(sectionDimensiones);
    if (hasLandSection) activeSections.push(sectionTerreno);
    if (hasServices || hasSecurity) activeSections.push(sectionServiciosSeguridad);
    if (hasShared) activeSections.push(sectionCompartido);
    if (hasMedia) activeSections.push(sectionMedia);

    const leftColumnSections: React.ReactNode[] = [];
    const rightColumnSections: React.ReactNode[] = [];
    activeSections.forEach((sec, idx) => {
      const elementWithKey = React.isValidElement(sec)
        ? React.cloneElement(sec, { key: `sec-${idx}` })
        : sec;
      if (idx % 2 === 0) {
        leftColumnSections.push(elementWithKey);
      } else {
        rightColumnSections.push(elementWithKey);
      }
    });

    return (
      <div style={{ display: "flex", gap: 16, alignItems: "start", width: "100%" }}>
        {/* ── LEFT COLUMN ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {leftColumnSections}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {rightColumnSections}
        </div>
      </div>
    );
  })()}

      {/* Bottom actions */}
      <div className="flex justify-between pt-6 pb-8 mt-4">
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
      </div>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              background: "rgba(30, 30, 32, 0.95)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(212, 146, 74, 0.3)",
              borderRadius: "12px",
              boxShadow: "0 16px 36px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 146, 74, 0.1)",
              maxWidth: "380px",
              pointerEvents: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: "50%", background: "rgba(212, 146, 74, 0.12)", flexShrink: 0 }}>
              <span style={{ color: "#D4924A", fontSize: 13, fontWeight: "bold" }}>⚠️</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: "12px", fontWeight: 500, color: "var(--p-text)", lineHeight: "1.4" }}>
                {toast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              style={{ background: "none", border: "none", color: "var(--p-text-3)", cursor: "pointer", fontSize: 12, padding: 4 }}
            >
              ✕
            </button>
            {/* Countdown animation bar */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 3.5, ease: "linear" }}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                height: "3px",
                background: "#D4924A",
                borderBottomLeftRadius: "12px",
                borderBottomRightRadius: "12px",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
