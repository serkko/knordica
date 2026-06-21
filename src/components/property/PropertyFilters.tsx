"use client";

import { useFilters } from "@/hooks/useFilters";
import { useLocale } from "@/components/layout/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import {
  Trash2,
  SlidersHorizontal,
  Waves,
  Wind,
  Zap,
  Shield,
  ArrowUpDown,
  PawPrint,
  Sofa,
  Check
} from "lucide-react";
import type { Zone, PropertyType, PropertyFilters as IPropertyFilters } from "@/types/property";

interface PropertyFiltersProps {
  zones: Zone[];
}

export function PropertyFilters({ zones }: PropertyFiltersProps) {
  const { locale, dict } = useLocale();
  const { filters, updateFilter, resetFilters } = useFilters();

  const handlePriceChange = (field: "precio_min" | "precio_max", val: string) => {
    const num = val === "" ? undefined : parseInt(val, 10);
    updateFilter(field, num);
  };

  const selectCount = (field: "habitaciones" | "banos", count: number | undefined) => {
    updateFilter(field, count);
  };

  const propertyTypes = [
    { value: "casa",          labelEs: "Casa",              labelEn: "House" },
    { value: "apartamento",   labelEs: "Apartamento",       labelEn: "Apartment" },
    { value: "townhouse",     labelEs: "Townhouse",         labelEn: "Townhouse" },
    { value: "local",         labelEs: "Local Comercial",   labelEn: "Commercial" },
    { value: "terreno_lote",  labelEs: "Terreno",           labelEn: "Land" },
    { value: "hacienda_finca",labelEs: "Finca / Hacienda",  labelEn: "Farm" },
    { value: "oficina",       labelEs: "Oficina",           labelEn: "Office" },
    { value: "edificio",      labelEs: "Edificio",          labelEn: "Building" },
    { value: "galpon",        labelEs: "Galpón",            labelEn: "Warehouse" },
    { value: "habitacion",    labelEs: "Habitación",        labelEn: "Room" },
    { value: "anexo",         labelEs: "Anexo",             labelEn: "Annex" },
  ] as const;

  // Calcular filtros activos (excluir sort, page, per_page)
  const activeFilterCount = [
    filters.operacion,
    filters.tipo,
    filters.zona,
    filters.precio_min,
    filters.precio_max,
    filters.habitaciones,
    filters.banos,
    filters.min_area,
    filters.max_area,
    filters.has_pool,
    filters.has_ac,
    filters.has_generator,
    filters.has_security,
    filters.has_elevator,
    filters.allows_pets,
    filters.furnished,
    filters.destacadas,
    filters.nuevas,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6 p-6 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass">
      {/* ENCABEZADO */}
      <div className="flex items-center justify-between mb-1 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[var(--accent)]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text)] font-display">
            {locale === "es" ? "Filtros" : "Filters"}
          </span>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-[var(--accent)] text-black text-[0.6rem] font-bold font-mono leading-none">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-[0.65rem] text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors cursor-pointer font-body"
          >
            <Trash2 className="h-3 w-3" />
            <span>{locale === "es" ? "Limpiar" : "Clear"}</span>
          </button>
        )}
      </div>

      {/* SECCIÓN 1 — Operación */}
      <div className="flex flex-col gap-2 pb-5 border-b border-[var(--border)]">
        <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
          {dict.catalog?.filters?.operacion || "Operación"}
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => updateFilter("operacion", undefined)}
            className={`h-10 text-[10px] font-semibold uppercase tracking-wider font-display border rounded-sm transition-all cursor-pointer ${
              filters.operacion === undefined
                ? "bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]"
                : "bg-transparent text-[var(--text-2)] border-[var(--border)] hover:border-[var(--border-strong)]"
            }`}
          >
            {locale === "es" ? "Todas" : "All"}
          </button>
          <button
            type="button"
            onClick={() => updateFilter("operacion", "venta")}
            className={`h-10 text-[10px] font-semibold uppercase tracking-wider font-display border rounded-sm transition-all cursor-pointer ${
              filters.operacion === "venta"
                ? "bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]"
                : "bg-transparent text-[var(--text-2)] border-[var(--border)] hover:border-[var(--border-strong)]"
            }`}
          >
            {dict.property?.operation?.venta || "Venta"}
          </button>
          <button
            type="button"
            onClick={() => updateFilter("operacion", "alquiler")}
            className={`h-10 text-[10px] font-semibold uppercase tracking-wider font-display border rounded-sm transition-all cursor-pointer ${
              filters.operacion === "alquiler"
                ? "bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]"
                : "bg-transparent text-[var(--text-2)] border-[var(--border)] hover:border-[var(--border-strong)]"
            }`}
          >
            {dict.property?.operation?.alquiler || "Alquiler"}
          </button>
        </div>
      </div>

      {/* SECCIÓN 2 — Tipo de propiedad */}
      <div className="flex flex-col gap-2 pb-5 border-b border-[var(--border)]">
        <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
          {dict.catalog?.filters?.tipo || "Tipo de propiedad"}
        </label>
        <select
          value={filters.tipo || ""}
          onChange={(e) => updateFilter("tipo", (e.target.value || undefined) as PropertyType | undefined)}
          suppressHydrationWarning
          className="h-10 w-full px-3 text-xs bg-transparent border border-[var(--border)] text-[var(--text)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden cursor-pointer"
        >
          <option value="" className="bg-[var(--surface-2)]">
            {locale === "es" ? "Todos los tipos" : "All property types"}
          </option>
          {propertyTypes.map((t) => (
            <option key={t.value} value={t.value} className="bg-[var(--surface-2)]">
              {locale === "es" ? t.labelEs : t.labelEn}
            </option>
          ))}
        </select>
      </div>

      {/* SECCIÓN 3 — Zona */}
      <div className="flex flex-col gap-2 pb-5 border-b border-[var(--border)]">
        <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
          {dict.catalog?.filters?.zona || "Zona"}
        </label>
        <select
          value={filters.zona || ""}
          onChange={(e) => updateFilter("zona", e.target.value || undefined)}
          suppressHydrationWarning
          className="h-10 w-full px-3 text-xs bg-transparent border border-[var(--border)] text-[var(--text)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden cursor-pointer"
        >
          <option value="" className="bg-[var(--surface-2)]">
            {locale === "es" ? "Todas las zonas" : "All zones"}
          </option>
          {zones.map((z) => (
            <option key={z.id} value={z.slug} className="bg-[var(--surface-2)]">
              {locale === "es" ? z.name_es : z.name_en}
            </option>
          ))}
        </select>
      </div>

      {/* SECCIÓN 4 — Precio */}
      <div className="flex flex-col gap-2 pb-5 border-b border-[var(--border)]">
        <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
          {dict.catalog?.filters?.precio || "Rango de precio (USD)"}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder={locale === "es" ? "Mínimo" : "Min price"}
            value={filters.precio_min ?? ""}
            onChange={(e) => handlePriceChange("precio_min", e.target.value)}
            suppressHydrationWarning
            className="h-10 w-full px-3 text-xs bg-transparent border border-[var(--border)] text-[var(--text)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <input
            type="number"
            placeholder={locale === "es" ? "Máximo" : "Max price"}
            value={filters.precio_max ?? ""}
            onChange={(e) => handlePriceChange("precio_max", e.target.value)}
            suppressHydrationWarning
            className="h-10 w-full px-3 text-xs bg-transparent border border-[var(--border)] text-[var(--text)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>

      {/* SECCIÓN 5 — Superficie */}
      <div className="flex flex-col gap-3 pb-5 border-b border-[var(--border)]">
        <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display">
          {locale === 'es' ? 'Superficie (m²)' : 'Area (sqm)'}
        </span>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={locale === 'es' ? 'Mín' : 'Min'}
            value={filters.min_area ?? ''}
            onChange={e => updateFilter('min_area', e.target.value === '' ? undefined : Number(e.target.value))}
            className="w-full h-9 px-3 text-xs bg-transparent border border-[var(--border)] text-[var(--text)] rounded-sm placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <input
            type="number"
            placeholder={locale === 'es' ? 'Máx' : 'Max'}
            value={filters.max_area ?? ''}
            onChange={e => updateFilter('max_area', e.target.value === '' ? undefined : Number(e.target.value))}
            className="w-full h-9 px-3 text-xs bg-transparent border border-[var(--border)] text-[var(--text)] rounded-sm placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>

      {/* SECCIÓN 6 — Habitaciones */}
      <div className="flex flex-col gap-2 pb-5 border-b border-[var(--border)]">
        <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
          {dict.catalog?.filters?.habitaciones || "Habitaciones"}
        </label>
        <div className="grid grid-cols-5 gap-1">
          <button
            type="button"
            onClick={() => selectCount("habitaciones", undefined)}
            className={`h-8 text-xs font-mono border rounded-sm transition-all cursor-pointer ${
              filters.habitaciones === undefined
                ? "bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]"
                : "bg-transparent text-[var(--text-2)] border-[var(--border)] hover:border-[var(--border-strong)]"
            }`}
          >
            {locale === "es" ? "Cual" : "Any"}
          </button>
          {[1, 2, 3, "4+"].map((num, i) => {
            const val = i === 3 ? 4 : (num as number);
            return (
              <button
                key={i}
                type="button"
                onClick={() => selectCount("habitaciones", val)}
                className={`h-8 text-xs font-mono border rounded-sm transition-all cursor-pointer ${
                  filters.habitaciones === val
                    ? "bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]"
                    : "bg-transparent text-[var(--text-2)] border-[var(--border)] hover:border-[var(--border-strong)]"
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 7 — Baños */}
      <div className="flex flex-col gap-2 pb-5 border-b border-[var(--border)]">
        <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
          {dict.catalog?.filters?.banos || "Baños"}
        </label>
        <div className="grid grid-cols-5 gap-1">
          <button
            type="button"
            onClick={() => selectCount("banos", undefined)}
            className={`h-8 text-xs font-mono border rounded-sm transition-all cursor-pointer ${
              filters.banos === undefined
                ? "bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]"
                : "bg-transparent text-[var(--text-2)] border-[var(--border)] hover:border-[var(--border-strong)]"
            }`}
          >
            {locale === "es" ? "Cual" : "Any"}
          </button>
          {[1, 2, 3, "4+"].map((num, i) => {
            const val = i === 3 ? 4 : (num as number);
            return (
              <button
                key={i}
                type="button"
                onClick={() => selectCount("banos", val)}
                className={`h-8 text-xs font-mono border rounded-sm transition-all cursor-pointer ${
                  filters.banos === val
                    ? "bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]"
                    : "bg-transparent text-[var(--text-2)] border-[var(--border)] hover:border-[var(--border-strong)]"
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 8 — Características */}
      <div className="flex flex-col gap-3 pb-5 border-b border-[var(--border)]">
        <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display">
          {locale === 'es' ? 'Características' : 'Features'}
        </span>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'has_pool',      icon: Waves,      es: 'Piscina',     en: 'Pool' },
            { key: 'has_ac',        icon: Wind,       es: 'Aire A/C',    en: 'A/C' },
            { key: 'has_generator', icon: Zap,        es: 'Planta',      en: 'Generator' },
            { key: 'has_security',  icon: Shield,     es: 'Seguridad',   en: 'Security' },
            { key: 'has_elevator',  icon: ArrowUpDown,es: 'Ascensor',    en: 'Elevator' },
            { key: 'allows_pets',   icon: PawPrint,   es: 'Mascotas',    en: 'Pets OK' },
            { key: 'furnished',     icon: Sofa,       es: 'Amueblado',   en: 'Furnished' },
          ].map(({ key, icon: Icon, es, en }) => {
            const isActive = !!filters[key as keyof IPropertyFilters];
            return (
              <button
                key={key}
                type="button"
                onClick={() => updateFilter(key as any, isActive ? undefined : true)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-[0.65rem] font-medium border transition-all duration-150 cursor-pointer',
                  isActive
                    ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]'
                    : 'border-[var(--border)] bg-transparent text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-2)]'
                )}
              >
                <Icon className="h-3 w-3 shrink-0" />
                <span>{locale === 'es' ? es : en}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 9 — Mostrar solo */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display">
          {locale === 'es' ? 'Mostrar solo' : 'Show only'}
        </span>
        <div className="flex flex-col gap-2">
          {[
            { key: 'destacadas', es: '⭐ Propiedades destacadas', en: '⭐ Featured properties' },
            { key: 'nuevas',     es: '🆕 Nuevos ingresos',       en: '🆕 New listings' },
          ].map(({ key, es, en }) => {
            const isActive = !!filters[key as keyof IPropertyFilters];
            return (
              <button
                key={key}
                type="button"
                onClick={() => updateFilter(key as any, isActive ? undefined : true)}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-sm text-xs border transition-all duration-150 cursor-pointer text-left',
                  isActive
                    ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]'
                    : 'border-[var(--border)] bg-transparent text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-2)]'
                )}
              >
                <span className="font-body">{locale === 'es' ? es : en}</span>
                <div className={cn(
                  'h-4 w-4 rounded-xs border flex items-center justify-center transition-all',
                  isActive 
                    ? 'bg-[var(--accent)] border-[var(--accent)]' 
                    : 'bg-transparent border-[var(--border-strong)]'
                )}>
                  {isActive && <Check className="h-2.5 w-2.5 text-black" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
