"use client";

import { useFilters } from "@/hooks/useFilters";
import { useLocale } from "@/components/layout/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { Trash2, SlidersHorizontal } from "lucide-react";
import type { Zone, PropertyType, PropertyOperation } from "@/types/property";

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

  const propertyTypes: { value: PropertyType; labelEs: string; labelEn: string }[] = [
    { value: "casa", labelEs: "Casa", labelEn: "House" },
    { value: "apartamento", labelEs: "Apartamento", labelEn: "Apartment" },
    { value: "local", labelEs: "Local Comercial", labelEn: "Commercial Space" },
    { value: "terreno", labelEs: "Terreno", labelEn: "Land" },
    { value: "finca", labelEs: "Finca", labelEn: "Estate" },
    { value: "oficina", labelEs: "Oficina", labelEn: "Office" },
    { value: "proyecto", labelEs: "Proyecto", labelEn: "Project" },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[var(--accent)]" />
          <h3 className="font-display font-bold tracking-tight text-base uppercase text-[var(--text)]">
            {dict.catalog?.filters?.title || "Filtros"}
          </h3>
        </div>
        <button
          onClick={resetFilters}
          className="text-xs font-semibold uppercase tracking-wider font-display text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>{dict.catalog?.filters?.clearAll || "Limpiar"}</span>
        </button>
      </div>

      {/* Operación */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
          {dict.catalog?.filters?.operacion || "Operación"}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => updateFilter("operacion", "venta")}
            className={`h-10 text-xs font-semibold uppercase tracking-wider font-display border rounded-sm transition-all cursor-pointer ${
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
            className={`h-10 text-xs font-semibold uppercase tracking-wider font-display border rounded-sm transition-all cursor-pointer ${
              filters.operacion === "alquiler"
                ? "bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]"
                : "bg-transparent text-[var(--text-2)] border-[var(--border)] hover:border-[var(--border-strong)]"
            }`}
          >
            {dict.property?.operation?.alquiler || "Alquiler"}
          </button>
        </div>
      </div>

      {/* Tipo */}
      <div className="flex flex-col gap-2">
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

      {/* Zona */}
      <div className="flex flex-col gap-2">
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

      {/* Precio */}
      <div className="flex flex-col gap-2">
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

      {/* Habitaciones */}
      <div className="flex flex-col gap-2">
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

      {/* Baños */}
      <div className="flex flex-col gap-2">
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
    </div>
  );
}
