"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { useFiltersStore } from "@/store/filters.store";
import { useLocale } from "@/components/layout/LocaleProvider";
import { cn } from "@/lib/utils/cn";
import { ZONAS_MERIDA } from "@/lib/constants/zonas-merida";
import {
  Trash2, SlidersHorizontal, Waves, Wind, Zap, Shield,
  ArrowUpDown, PawPrint, Sofa, Check, Search,
  Flame, Droplets, Sun, Camera, Compass, DoorClosed, Trees,
  Car, X, Mountain, ChevronDown, Dumbbell, UtensilsCrossed
} from "lucide-react";
import type { PropertyType, PropertyOperation, PropertyFilters as IPropertyFilters, PropertyCard } from "@/types/property";

const EASE_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];
const springTransition: Transition = { type: "spring", stiffness: 400, damping: 30 };

interface PropertyFiltersProps {
  zones: { id: string; slug: string; name_es: string; name_en: string }[];
  properties: PropertyCard[];
}

export function PropertyFilters({ zones, properties = [] }: PropertyFiltersProps) {
  const { locale } = useLocale();
  const { filters, updateFilter, resetFilters } = useFiltersStore();
  const [zonaSearch, setZonaSearch] = useState("");
  const [featSearch, setFeatSearch] = useState("");

  const availableOperations = useMemo(() =>
    [...new Set(properties.map(p => p.operation))],
    [properties]
  );

  const availableTypes = useMemo(() =>
    [...new Set(properties.map(p => p.property_type))],
    [properties]
  );

  const availableZones = useMemo(() =>
    [...new Set(properties.map(p => p.zone?.slug).filter(Boolean))],
    [properties]
  );

  // Para características booleanas (has_pool, has_ac, etc.)
  // Solo mostrar si AL MENOS 1 propiedad tiene ese campo en true
  const availableFeatures = useMemo(() => ({
    has_pool:       properties.some(p => p.has_pool),
    has_generator:  properties.some(p => p.has_generator),
    has_water_tank: properties.some(p => p.has_water_tank),
    has_ac:         properties.some(p => p.has_ac),
    furnished:      properties.some(p => p.furnished),
    allows_pets:    properties.some(p => p.allows_pets),
    has_security:   properties.some(p => p.has_security),
    has_elevator:   properties.some(p => p.has_elevator),
  }), [properties]);
  
  // Collapse state — sections are open by default
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCollapse = (sec: string) => {
    setCollapsed(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Limits for range sliders
  const PRICE_LIMITS = { min: 0, max: 1500000, step: 5000 };
  const AREA_LIMITS = { min: 0, max: 1500, step: 10 };

  // Local states for range sliders to ensure ultra-fluid dragging
  const [localPriceMin, setLocalPriceMin] = useState(filters.precio_min ?? PRICE_LIMITS.min);
  const [localPriceMax, setLocalPriceMax] = useState(filters.precio_max ?? PRICE_LIMITS.max);
  const [localAreaMin, setLocalAreaMin] = useState(filters.min_area ?? filters.area_min ?? AREA_LIMITS.min);
  const [localAreaMax, setLocalAreaMax] = useState(filters.max_area ?? filters.area_max ?? AREA_LIMITS.max);

  const priceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const areaTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize local state when global store filters change externally (like clear all or url updates)
  useEffect(() => {
    setLocalPriceMin(filters.precio_min ?? PRICE_LIMITS.min);
    setLocalPriceMax(filters.precio_max ?? PRICE_LIMITS.max);
  }, [filters.precio_min, filters.precio_max]);

  useEffect(() => {
    const extMin = filters.min_area ?? filters.area_min ?? AREA_LIMITS.min;
    const extMax = filters.max_area ?? filters.area_max ?? AREA_LIMITS.max;
    setLocalAreaMin(extMin);
    setLocalAreaMax(extMax);
  }, [filters.min_area, filters.area_min, filters.max_area, filters.area_max]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (priceTimeoutRef.current) clearTimeout(priceTimeoutRef.current);
      if (areaTimeoutRef.current) clearTimeout(areaTimeoutRef.current);
    };
  }, []);

  const priceMinPercent = (localPriceMin / PRICE_LIMITS.max) * 100;
  const priceMaxPercent = (localPriceMax / PRICE_LIMITS.max) * 100;
  const areaMinPercent = (localAreaMin / AREA_LIMITS.max) * 100;
  const areaMaxPercent = (localAreaMax / AREA_LIMITS.max) * 100;

  // Normalize search helper
  const normalize = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const allZonas = ZONAS_MERIDA.map((z) => {
    const fromDb = zones.find((db) => db.slug === z.slug);
    return fromDb ?? { id: z.slug, slug: z.slug, name_es: z.name_es, name_en: z.name_en };
  });

  const zonasFiltradas = zonaSearch.trim().length === 0
    ? allZonas
    : allZonas.filter((z) =>
        normalize(locale === "es" ? z.name_es : z.name_en).includes(normalize(zonaSearch))
      );

  // Multi-select Toggle Helpers
  const toggleFilterArray = <T,>(key: keyof IPropertyFilters, val: T) => {
    const current = (filters[key] as T[]) || [];
    if (current.includes(val)) {
      const next = current.filter((x) => x !== val);
      updateFilter(key, next.length > 0 ? (next as any) : undefined);
    } else {
      updateFilter(key, [...current, val] as any);
    }
  };

  const propertyTypes = [
    { value: "casa",           labelEs: "Casa",             labelEn: "House" },
    { value: "apartamento",    labelEs: "Apartamento",      labelEn: "Apartment" },
    { value: "townhouse",      labelEs: "Townhouse",        labelEn: "Townhouse" },
    { value: "local",          labelEs: "Local Comercial",  labelEn: "Commercial" },
    { value: "terreno_lote",   labelEs: "Terreno",          labelEn: "Land" },
    { value: "hacienda_finca", labelEs: "Finca / Hacienda", labelEn: "Farm" },
    { value: "oficina",        labelEs: "Oficina",          labelEn: "Office" },
    { value: "edificio",       labelEs: "Edificio",         labelEn: "Building" },
    { value: "galpon",         labelEs: "Galpón",           labelEn: "Warehouse" },
    { value: "habitacion",     labelEs: "Habitación",       labelEn: "Room" },
    { value: "anexo",          labelEs: "Anexo",            labelEn: "Annex" },
  ] as const;

  // Differentiated icons (Filtered to 10 key items)
  const caracteristicas: {
    key: keyof IPropertyFilters;
    icon: React.ElementType;
    es: string;
    en: string;
  }[] = [
    { key: "has_pool",                 icon: Waves,           es: "Piscina",               en: "Pool" },
    { key: "has_generator",            icon: Zap,             es: "Planta eléctrica",      en: "Generator" },
    { key: "has_water_tank",           icon: Droplets,        es: "Tanque de agua",        en: "Water tank" },
    { key: "has_ac",                   icon: Wind,            es: "Aire A/C",              en: "A/C" },
    { key: "furnished",                icon: Sofa,            es: "Amoblado",              en: "Furnished" },
    { key: "allows_pets",              icon: PawPrint,        es: "Mascotas",              en: "Pets OK" },
    { key: "has_security",             icon: Shield,          es: "Seguridad / vigilancia",en: "Security" },
    { key: "has_elevator",             icon: ArrowUpDown,     es: "Ascensor",              en: "Elevator" },
  ];

  const caractsFiltradas = featSearch.trim().length === 0
    ? caracteristicas
    : caracteristicas.filter((c) =>
        normalize(locale === "es" ? c.es : c.en).includes(normalize(featSearch))
      );

  const activeFilterCount = [
    filters.operacion, filters.tipo, filters.zona,
    filters.precio_min, filters.precio_max,
    filters.habitaciones, filters.banos,
    filters.min_area, filters.max_area,
    filters.has_pool, filters.has_ac, filters.has_generator,
    filters.has_water_tank, filters.has_security, filters.has_elevator,
    filters.allows_pets, filters.furnished, filters.destacadas, filters.nuevas,
    filters.has_gym, filters.has_bbq, filters.has_solar_panels, filters.has_internet,
    filters.has_terrace, filters.has_balcony, filters.has_garden,
    filters.has_jacuzzi, filters.parking_covered,
  ].filter(Boolean).length;

  const sectionClass = "flex flex-col gap-3 pb-5 border-b border-[var(--border)] overflow-hidden";
  const labelClass = "text-[9px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display";

  // Counts of active options per section
  const getSectionActiveCount = (sec: string) => {
    switch (sec) {
      case "busqueda": return filters.operacion?.length || 0;
      case "tipo": return filters.tipo?.length || 0;
      case "zona": return filters.zona?.length || 0;
      case "precio": return (filters.precio_min !== undefined ? 1 : 0) + (filters.precio_max !== undefined ? 1 : 0);
      case "superficie": return ((filters.min_area ?? filters.area_min) !== undefined ? 1 : 0) + ((filters.max_area ?? filters.area_max) !== undefined ? 1 : 0);
      case "habitaciones": return filters.habitaciones?.length || 0;
      case "banos": return filters.banos?.length || 0;
      case "features": return caracteristicas.filter(c => !!filters[c.key]).length;
      case "mostrar": return (filters.destacadas ? 1 : 0) + (filters.nuevas ? 1 : 0);
      default: return 0;
    }
  };
  
  // Custom Checkbox Row Component for uniform vertical presentation
  const CheckboxRow = ({
    isActive,
    onClick,
    label,
    icon: Icon,
  }: {
    isActive: boolean;
    onClick: () => void;
    label: string;
    icon?: React.ElementType;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 py-1.5 px-2 rounded hover:bg-[var(--surface-2)]/50 transition-colors text-left cursor-pointer group text-xs text-[var(--text-2)] hover:text-[var(--text)] font-light",
        isActive && "text-[var(--text)]"
      )}
    >
      <div
        className={cn(
          "h-4 w-4 rounded-sm border flex items-center justify-center shrink-0 transition-all duration-200",
          isActive 
            ? "border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]" 
            : "border-[var(--border-strong)] bg-transparent"
        )}
      >
        {isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Check className="h-3 w-3 stroke-[3]" />
          </motion.div>
        )}
      </div>
      {Icon && <Icon className="h-3.5 w-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />}
      <span className="truncate">{label}</span>
    </button>
  );

  const CollapsibleSection = ({
    id,
    label,
    children,
  }: {
    id: string;
    label: string;
    children: React.ReactNode;
  }) => {
    const isCollapsed = !!collapsed[id];
    const count = getSectionActiveCount(id);
    return (
      <div className={sectionClass}>
        <button
          type="button"
          onClick={() => toggleCollapse(id)}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group select-none"
        >
          <span className="flex items-center">
            <span className={labelClass}>{label}</span>
            {isCollapsed && count > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-2 h-4 min-w-4 px-1 rounded-full bg-[var(--accent)] text-black text-[9px] font-bold flex items-center justify-center font-mono"
              >
                {count}
              </motion.span>
            )}
          </span>
          <ChevronDown 
            className={cn(
              "h-3.5 w-3.5 text-[var(--text-muted)] group-hover:text-[var(--text)] transition-transform duration-300",
              isCollapsed ? "-rotate-90" : "rotate-0"
            )}
          />
        </button>
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE_EXPO }}
              className="overflow-hidden flex flex-col gap-2.5"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const AREA_LIMIT = { min: 0, max: 1500 };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: EASE_EXPO }}
      className="flex flex-col gap-5 p-5 border border-[var(--border)] bg-[var(--surface)] rounded-xl shadow-lg w-full max-w-sm sticky top-24"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--accent)]" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text)] font-display">
            {locale === "es" ? "Filtros" : "Filters"}
          </span>
          <AnimatePresence>
            {activeFilterCount > 0 && (
              <motion.span
                key="count"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={springTransition}
                className="flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-[var(--accent)] text-black text-[0.6rem] font-bold leading-none animate-pulse"
              >
                {activeFilterCount}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {activeFilterCount > 0 && (
            <motion.button
              key="clear"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              onClick={resetFilters}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 text-[0.65rem] text-[var(--text-muted)] hover:text-red-400 transition-colors cursor-pointer font-mono"
            >
              <Trash2 className="h-3 w-3" />
              <span>{locale === "es" ? "Limpiar" : "Clear"}</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* SECCIÓN 1 — Tipo de búsqueda */}
      <CollapsibleSection id="busqueda" label={locale === "es" ? "Tipo de búsqueda" : "Listing type"}>
        {(
          [
            { val: "venta",      es: "En venta",   en: "For sale" },
            { val: "alquiler",   es: "En alquiler",   en: "For rent" },
            { val: "vacacional", es: "Vacacional",  en: "Vacation" },
          ] as const
        )
          .filter(({ val }) => availableOperations.includes(val))
          .map(({ val, es, en }) => (
            <CheckboxRow
              key={val}
              isActive={(filters.operacion || []).includes(val)}
              onClick={() => toggleFilterArray("operacion", val)}
              label={locale === "es" ? es : en}
            />
          ))}
      </CollapsibleSection>

      {/* SECCIÓN 2 — Tipo de propiedad */}
      <CollapsibleSection id="tipo" label={locale === "es" ? "Tipo de propiedad" : "Property type"}>
        {propertyTypes
          .filter((t) => availableTypes.includes(t.value))
          .map((t) => (
            <CheckboxRow
              key={t.value}
              isActive={(filters.tipo || []).includes(t.value)}
              onClick={() => toggleFilterArray("tipo", t.value)}
              label={locale === "es" ? t.labelEs : t.labelEn}
            />
          ))}
      </CollapsibleSection>

      {/* SECCIÓN 3 — Zona con buscador completo */}
      <CollapsibleSection id="zona" label={locale === "es" ? "Zona" : "Zone"}>
        <div className="relative mb-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder={locale === "es" ? "Buscar zona..." : "Search zone..."}
            value={zonaSearch}
            onChange={(e) => setZonaSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-8 text-xs bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] rounded placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none transition-colors"
          />
          {zonaSearch && (
            <button
              onClick={() => setZonaSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors h-4 w-4 flex items-center justify-center cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          {zonasFiltradas
            .filter((z) => availableZones.includes(z.slug))
            .map((z) => {
              const label = locale === "es" ? z.name_es : z.name_en;
              const isActive = (filters.zona || []).includes(z.slug);
              return (
                <CheckboxRow
                  key={z.slug}
                  isActive={isActive}
                  onClick={() => toggleFilterArray("zona", z.slug)}
                  label={label}
                />
              );
            })}
          {zonasFiltradas.filter((z) => availableZones.includes(z.slug)).length === 0 && (
            <p className="px-2 py-1 text-xs text-[var(--text-muted)] italic">
              {locale === "es" ? "Sin resultados" : "No results"}
            </p>
          )}
        </div>
      </CollapsibleSection>

      {/* SECCIÓN 4 — Precio Sliders */}
      <CollapsibleSection id="precio" label={locale === "es" ? "Precio (USD)" : "Price (USD)"}>
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-[10px] font-mono text-[var(--accent)]">
            {localPriceMin > 0 ? `$${localPriceMin.toLocaleString()}` : "$0"} - {localPriceMax < PRICE_LIMITS.max ? `$${localPriceMax.toLocaleString()}` : "∞"}
          </span>
        </div>

        <div className="relative w-full h-6 mt-1 flex items-center px-1">
          <div className="absolute left-0 right-0 h-1 bg-[var(--border)] rounded" />
          <div 
            className="absolute h-1 bg-[var(--accent)] rounded" 
            style={{ 
              left: `${priceMinPercent}%`, 
              right: `${100 - priceMaxPercent}%` 
            }} 
          />
          <input
            type="range"
            min={PRICE_LIMITS.min}
            max={PRICE_LIMITS.max}
            step={PRICE_LIMITS.step}
            value={localPriceMin}
            onChange={(e) => {
              const val = Math.min(Number(e.target.value), localPriceMax - PRICE_LIMITS.step);
              setLocalPriceMin(val);
              if (priceTimeoutRef.current) clearTimeout(priceTimeoutRef.current);
              priceTimeoutRef.current = setTimeout(() => {
                updateFilter("precio_min", val === PRICE_LIMITS.min ? undefined : val);
              }, 250);
            }}
            className="absolute left-0 right-0 w-full appearance-none bg-transparent pointer-events-none h-1 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--accent)] [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:cursor-pointer"
          />
          <input
            type="range"
            min={PRICE_LIMITS.min}
            max={PRICE_LIMITS.max}
            step={PRICE_LIMITS.step}
            value={localPriceMax}
            onChange={(e) => {
              const val = Math.max(Number(e.target.value), localPriceMin + PRICE_LIMITS.step);
              setLocalPriceMax(val);
              if (priceTimeoutRef.current) clearTimeout(priceTimeoutRef.current);
              priceTimeoutRef.current = setTimeout(() => {
                updateFilter("precio_max", val === PRICE_LIMITS.max ? undefined : val);
              }, 250);
            }}
            className="absolute left-0 right-0 w-full appearance-none bg-transparent pointer-events-none h-1 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--accent)] [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-1">
          {(["precio_min", "precio_max"] as const).map((field) => (
            <input
              key={field}
              type="number"
              placeholder={
                field === "precio_min"
                  ? locale === "es" ? "Mínimo" : "Min"
                  : locale === "es" ? "Máximo" : "Max"
              }
              value={filters[field] ?? ""}
              onChange={(e) =>
                updateFilter(field, e.target.value === "" ? undefined : Number(e.target.value))
              }
              className="h-8 w-full px-2.5 text-xs bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] rounded focus:border-[var(--accent)] focus:outline-none transition-colors"
            />
          ))}
        </div>
      </CollapsibleSection>

      {/* SECCIÓN 5 — Superficie Sliders */}
      <CollapsibleSection id="superficie" label={locale === "es" ? "Superficie (m²)" : "Area (sqm)"}>
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-[10px] font-mono text-[var(--accent)]">
            {localAreaMin} m² - {localAreaMax} m²
          </span>
        </div>

        <div className="relative w-full h-6 mt-1 flex items-center px-1">
          <div className="absolute left-0 right-0 h-1 bg-[var(--border)] rounded" />
          <div 
            className="absolute h-1 bg-[var(--accent)] rounded" 
            style={{ 
              left: `${areaMinPercent}%`, 
              right: `${100 - areaMaxPercent}%` 
            }} 
          />
          <input
            type="range"
            min={AREA_LIMITS.min}
            max={AREA_LIMITS.max}
            step={AREA_LIMITS.step}
            value={localAreaMin}
            onChange={(e) => {
              const val = Math.min(Number(e.target.value), localAreaMax - AREA_LIMITS.step);
              setLocalAreaMin(val);
              if (areaTimeoutRef.current) clearTimeout(areaTimeoutRef.current);
              areaTimeoutRef.current = setTimeout(() => {
                updateFilter("min_area", val === AREA_LIMITS.min ? undefined : val);
              }, 250);
            }}
            className="absolute left-0 right-0 w-full appearance-none bg-transparent pointer-events-none h-1 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--accent)] [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:cursor-pointer"
          />
          <input
            type="range"
            min={AREA_LIMITS.min}
            max={AREA_LIMITS.max}
            step={AREA_LIMITS.step}
            value={localAreaMax}
            onChange={(e) => {
              const val = Math.max(Number(e.target.value), localAreaMin + AREA_LIMITS.step);
              setLocalAreaMax(val);
              if (areaTimeoutRef.current) clearTimeout(areaTimeoutRef.current);
              areaTimeoutRef.current = setTimeout(() => {
                updateFilter("max_area", val === AREA_LIMITS.max ? undefined : val);
              }, 250);
            }}
            className="absolute left-0 right-0 w-full appearance-none bg-transparent pointer-events-none h-1 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--accent)] [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-1">
          {(["min_area", "max_area"] as const).map((field) => (
            <input
              key={field}
              type="number"
              placeholder={
                field === "min_area"
                  ? locale === "es" ? "Mín" : "Min"
                  : locale === "es" ? "Máx" : "Max"
              }
              value={filters[field] ?? ""}
              onChange={(e) =>
                updateFilter(field, e.target.value === "" ? undefined : Number(e.target.value))
              }
              className="h-8 w-full px-2.5 text-xs bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] rounded focus:border-[var(--accent)] focus:outline-none transition-colors"
            />
          ))}
        </div>
      </CollapsibleSection>

      {/* SECCIÓN 6 — Habitaciones */}
      <CollapsibleSection id="habitaciones" label={locale === "es" ? "Habitaciones" : "Bedrooms"}>
        <div className="flex gap-1">
          {([1, 2, 3, 4] as const).map((val) => {
            const isActive = (filters.habitaciones || []).includes(val);
            return (
              <button
                key={val}
                type="button"
                onClick={() => toggleFilterArray("habitaciones", val)}
                className={cn(
                  "flex-1 h-8 rounded border transition-all text-xs font-mono font-medium flex items-center justify-center cursor-pointer",
                  isActive 
                    ? "bg-[var(--accent-dim)] border-[var(--accent)] text-[var(--accent)]" 
                    : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]"
                )}
              >
                {val === 4 ? "4+" : val}
              </button>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* SECCIÓN 7 — Baños */}
      <CollapsibleSection id="banos" label={locale === "es" ? "Baños" : "Bathrooms"}>
        <div className="flex gap-1">
          {([1, 2, 3, 4] as const).map((val) => {
            const isActive = (filters.banos || []).includes(val);
            return (
              <button
                key={val}
                type="button"
                onClick={() => toggleFilterArray("banos", val)}
                className={cn(
                  "flex-1 h-8 rounded border transition-all text-xs font-mono font-medium flex items-center justify-center cursor-pointer",
                  isActive 
                    ? "bg-[var(--accent-dim)] border-[var(--accent)] text-[var(--accent)]" 
                    : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]"
                )}
              >
                {val === 4 ? "4+" : val}
              </button>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* SECCIÓN 8 — Características con buscador */}
      <CollapsibleSection id="features" label={locale === "es" ? "Características" : "Features"}>
        <div className="relative mb-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder={locale === "es" ? "Buscar..." : "Search..."}
            value={featSearch}
            onChange={(e) => setFeatSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-8 text-xs bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] rounded placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none transition-colors"
          />
          {featSearch && (
            <button
              onClick={() => setFeatSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors h-4 w-4 flex items-center justify-center cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          {caractsFiltradas
            .filter(({ key }) => !!availableFeatures[key as keyof typeof availableFeatures])
            .map(({ key, icon: Icon, es, en }) => {
              const isActive = !!filters[key];
              return (
                <CheckboxRow
                  key={key}
                  isActive={isActive}
                  onClick={() => updateFilter(key, isActive ? undefined : (true as any))}
                  label={locale === "es" ? es : en}
                  icon={Icon}
                />
              );
            })}
        </div>
      </CollapsibleSection>

      {/* SECCIÓN 9 — Mostrar solo */}
      <CollapsibleSection id="mostrar" label={locale === "es" ? "Mostrar solo" : "Show only"}>
        {(
          [
            { key: "destacadas", es: "Propiedades destacadas", en: "Featured properties" },
            { key: "nuevas",     es: "Nuevos ingresos",        en: "New listings" },
          ] as const
        ).map(({ key, es, en }) => {
          const isActive = !!filters[key];
          return (
            <CheckboxRow
              key={key}
              isActive={isActive}
              onClick={() => updateFilter(key, isActive ? undefined : (true as any))}
              label={locale === "es" ? es : en}
            />
          );
        })}
      </CollapsibleSection>
    </motion.div>
  );
}
