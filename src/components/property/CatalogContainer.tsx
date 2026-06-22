"use client";

import { useProperties } from "@/hooks/useProperties";
import { useFiltersStore } from "@/store/filters.store";
import { useLocale } from "@/components/layout/LocaleProvider";
import { PropertyGrid } from "./PropertyGrid";
import { PropertyList } from "./PropertyList";
import { PropertyGridSkeleton } from "./PropertySkeleton";
import { Button } from "@/components/ui/Button";
import { LayoutGrid, List, SlidersHorizontal, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { PropertyFilters } from "./PropertyFilters";
import type { Zone } from "@/types/property";

interface CatalogContainerProps {
  zones: Zone[];
}

export function CatalogContainer({ zones }: CatalogContainerProps) {
  const { locale, dict } = useLocale();
  const { filters, updateFilter, resetFilters, initializeFromUrl, view, setView } = useFiltersStore();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Initialize filters once on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      initializeFromUrl(window.location.search);
    }
  }, [initializeFromUrl]);

  const { data, isLoading, isFetching } = useProperties(filters);
  const showSkeleton = isLoading && !data;
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

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
            <PropertyFilters zones={zones} properties={data?.data || []} />
          </div>
        </div>
      )}

      {/* Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Sidebar Filters Desktop */}
        <aside className="hidden md:block md:col-span-4 lg:col-span-3 sticky top-24">
          <PropertyFilters zones={zones} properties={data?.data || []} />
        </aside>

        {/* Content Side */}
        <div className="md:col-span-8 lg:col-span-9 flex flex-col gap-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <p className="text-xs text-[var(--text-2)] font-light font-mono">
                {showSkeleton ? (
                  dict.common?.cargar || "Cargando..."
                ) : (
                  <>
                    {data?.count || 0}{" "}
                    {locale === "es" ? "propiedades encontradas" : "properties found"}
                  </>
                )}
              </p>
              {isFetching && !showSkeleton && (
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-ping" />
              )}
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              {/* Sort selector */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display shrink-0">
                  {dict.catalog?.sort?.label || "Ordenar"}
                </span>
                <select
                  value={filters.sort || "recientes"}
                  onChange={handleSortChange}
                  className="h-8 pl-2 pr-8 text-xs bg-transparent border border-[var(--border)] rounded-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none transition-colors"
                >
                  <option value="recientes" className="bg-[var(--surface-1)]">
                    {dict.catalog?.sort?.recientes || "Más recientes"}
                  </option>
                  <option value="precio_asc" className="bg-[var(--surface-1)]">
                    {dict.catalog?.sort?.precio_asc || "Menor precio"}
                  </option>
                  <option value="precio_desc" className="bg-[var(--surface-1)]">
                    {dict.catalog?.sort?.precio_desc || "Mayor precio"}
                  </option>
                  <option value="area_desc" className="bg-[var(--surface-1)]">
                    {dict.catalog?.sort?.area_desc || "Mayor área"}
                  </option>
                </select>
              </div>

              {/* View switchers */}
              <div className="flex items-center border border-[var(--border)] rounded-sm overflow-hidden p-0.5">
                <button
                  onClick={() => setView("grid")}
                  className={cn(
                    "p-1.5 rounded-sm transition-colors cursor-pointer",
                    view === "grid"
                      ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  )}
                  title="Cuadrícula"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={cn(
                    "p-1.5 rounded-sm transition-colors cursor-pointer",
                    view === "list"
                      ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  )}
                  title="Lista"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Grid / List */}
          <div className={cn("transition-all duration-300", isFetching && !showSkeleton ? "opacity-75" : "opacity-100")}>
            {showSkeleton ? (
              <PropertyGridSkeleton />
            ) : !data || data.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 border border-[var(--border)] border-dashed rounded-lg bg-[var(--surface-1)]">
                <AlertCircle className="h-8 w-8 text-[var(--text-muted)] mb-3" />
                <h3 className="text-sm font-semibold text-[var(--text)]">
                  {dict.catalog?.empty?.title || "Sin propiedades"}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1 text-center max-w-sm font-light">
                  {dict.catalog?.empty?.description ||
                    "No encontramos propiedades con los filtros actuales."}
                </p>
                {activeFilterCount > 0 && (
                  <Button
                    variant="secondary"
                    onClick={resetFilters}
                    className="mt-4 text-xs font-semibold h-8 uppercase tracking-wider"
                  >
                    {dict.catalog?.filters?.clearAll || "Limpiar filtros"}
                  </Button>
                )}
              </div>
            ) : view === "grid" ? (
              <PropertyGrid properties={data.data} />
            ) : (
              <PropertyList properties={data.data} />
            )}
          </div>

          {/* Pagination Controls */}
          {data && data.count > (filters.per_page ?? 12) && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-[var(--border)]">
              <Button
                variant="secondary"
                disabled={filters.page === 1}
                onClick={() => handlePageChange((filters.page ?? 1) - 1)}
                className="h-8 px-3 text-xs font-semibold uppercase tracking-wider"
              >
                {locale === "es" ? "Anterior" : "Prev"}
              </Button>
              <span className="text-xs font-mono text-[var(--text-2)]">
                {filters.page ?? 1} / {totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={filters.page === totalPages}
                onClick={() => handlePageChange((filters.page ?? 1) + 1)}
                className="h-8 px-3 text-xs font-semibold uppercase tracking-wider"
              >
                {locale === "es" ? "Siguiente" : "Next"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Utility to join classes conditionally (copied inline to avoid imports issues)
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
