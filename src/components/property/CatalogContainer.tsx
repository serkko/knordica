"use client";

import { useFilters } from "@/hooks/useFilters";
import { useProperties } from "@/hooks/useProperties";
import { useFiltersStore } from "@/store/filters.store";
import { useLocale } from "@/components/layout/LocaleProvider";
import { PropertyGrid } from "./PropertyGrid";
import { PropertyList } from "./PropertyList";
import { PropertyGridSkeleton } from "./PropertySkeleton";
import { Button } from "@/components/ui/Button";
import { LayoutGrid, List, SlidersHorizontal, AlertCircle } from "lucide-react";
import { useState } from "react";
import { PropertyFilters } from "./PropertyFilters";
import type { Zone } from "@/types/property";

interface CatalogContainerProps {
  zones: Zone[];
}

export function CatalogContainer({ zones }: CatalogContainerProps) {
  const { locale, dict } = useLocale();
  const { filters, updateFilter, resetFilters } = useFilters();
  const { view, setView } = useFiltersStore();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { data, isLoading } = useProperties(filters);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilter("sort", e.target.value as any);
  };

  const handlePageChange = (newPage: number) => {
    updateFilter("page", newPage);
  };

  const totalPages = data ? Math.ceil(data.count / (filters.per_page ?? 12)) : 1;

  return (
    <div className="container-knordica py-12">
      {/* Mobile Filters Trigger Row */}
      <div className="flex md:hidden items-center justify-between gap-4 mb-6">
        <Button
          variant="secondary"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex-1 flex items-center justify-center gap-2 h-10 border border-[var(--border)] rounded-sm"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>{dict.catalog?.filters?.title || "Filtros"}</span>
        </Button>
      </div>

      {/* Mobile Filters Modal/Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-[85%] max-w-sm h-full bg-[var(--bg)] p-6 overflow-y-auto border-l border-[var(--border-strong)] flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold tracking-tight text-lg text-[var(--text)]">
                {dict.catalog?.filters?.title || "Filtros"}
              </h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-xs font-semibold uppercase tracking-wider text-[var(--text-2)] hover:text-[var(--text)]"
              >
                {dict.common?.cerrar || "Cerrar"}
              </button>
            </div>
            <PropertyFilters zones={zones} />
          </div>
        </div>
      )}

      {/* Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Sidebar Filters Desktop */}
        <aside className="hidden md:block md:col-span-4 lg:col-span-3 sticky top-24">
          <PropertyFilters zones={zones} />
        </aside>

        {/* Content Side */}
        <div className="md:col-span-8 lg:col-span-9 flex flex-col gap-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
            <p className="text-xs text-[var(--text-2)] font-light font-mono">
              {isLoading ? (
                dict.common?.cargar || "Cargando..."
              ) : (
                <>
                  {data?.count || 0}{" "}
                  {locale === "es" ? "propiedades encontradas" : "properties found"}
                </>
              )}
            </p>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              {/* Sort selector */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display shrink-0">
                  {dict.catalog?.sort?.label || "Ordenar"}
                </span>
                <select
                  value={filters.sort || "recientes"}
                  onChange={handleSortChange}
                  suppressHydrationWarning
                  className="h-9 px-2 text-xs bg-transparent border border-[var(--border)] text-[var(--text)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden cursor-pointer"
                >
                  <option value="recientes" className="bg-[var(--surface-2)]">
                    {dict.catalog?.sort?.recientes || "Más recientes"}
                  </option>
                  <option value="precio_asc" className="bg-[var(--surface-2)]">
                    {dict.catalog?.sort?.precio_asc || "Menor precio"}
                  </option>
                  <option value="precio_desc" className="bg-[var(--surface-2)]">
                    {dict.catalog?.sort?.precio_desc || "Mayor precio"}
                  </option>
                </select>
              </div>

              {/* View Layout Toggle */}
              <div className="flex items-center gap-1 border border-[var(--border)] rounded-sm p-1 bg-[var(--surface)]">
                <button
                  onClick={() => setView("grid")}
                  className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
                    view === "grid"
                      ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-2)]"
                  }`}
                  title={dict.catalog?.views?.grid || "Cuadrícula"}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
                    view === "list"
                      ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-2)]"
                  }`}
                  title={dict.catalog?.views?.list || "Lista"}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Grid/List */}
          {isLoading ? (
            <PropertyGridSkeleton count={6} />
          ) : !data || data.data.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center text-center py-20 px-6 border border-[var(--border)] rounded-sm glass">
              <AlertCircle className="h-10 w-10 text-[var(--text-muted)] mb-4" />
              <h4 className="font-display font-bold text-lg text-[var(--text)] mb-2">
                {dict.catalog?.empty?.title || "Sin propiedades"}
              </h4>
              <p className="text-sm text-[var(--text-2)] max-w-sm font-light leading-relaxed mb-6">
                {dict.catalog?.empty?.description ||
                  "No encontramos propiedades con los filtros actuales. Intenta ajustar la búsqueda."}
              </p>
              <Button onClick={resetFilters} variant="outline" size="sm">
                {dict.catalog?.empty?.cta || "Ver todas"}
              </Button>
            </div>
          ) : view === "grid" ? (
            <PropertyGrid properties={data.data} />
          ) : (
            <PropertyList properties={data.data} />
          )}

          {/* Pagination Controls */}
          {!isLoading && data && totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-8 border-t border-[var(--border)] mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page === 1}
                onClick={() => handlePageChange((filters.page ?? 1) - 1)}
                className="cursor-pointer"
              >
                {dict.common?.anterior || "Anterior"}
              </Button>
              <span className="text-xs font-mono text-[var(--text-2)]">
                {filters.page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page === totalPages}
                onClick={() => handlePageChange((filters.page ?? 1) + 1)}
                className="cursor-pointer"
              >
                {dict.common?.siguiente || "Siguiente"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
