"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useFilters } from "@/hooks/useFilters";
import { useProperties } from "@/hooks/useProperties";
import { useLocale } from "@/components/layout/LocaleProvider";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyFilters } from "@/components/property/PropertyFilters";
import { Button } from "@/components/ui/Button";
import { SlidersHorizontal, Map as MapIcon, List as ListIcon, AlertCircle, RefreshCw } from "lucide-react";
import type { Zone, PropertyCard as PropertyCardType } from "@/types/property";

// Dynamically import map component with SSR disabled
const PropertyMap = dynamic(() => import("./PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-zinc-950 flex flex-col items-center justify-center text-[var(--text-muted)] font-mono text-[10px] tracking-widest">
      <span className="animate-pulse">CONECTANDO MAPA DIGITAL...</span>
    </div>
  ),
});

interface MapSearchPageProps {
  zones: Zone[];
}

export default function MapSearchPage({ zones }: MapSearchPageProps) {
  const { locale, dict } = useLocale();
  const { filters, updateFilter, resetFilters } = useFilters();
  const { data, isLoading, refetch } = useProperties({ ...filters, per_page: 50 }); // Fetch more for map view
  
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"map" | "list">("map");
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  const activeProperties = data?.data || [];

  return (
    <div className="relative flex flex-col h-[calc(100vh-64px)] sm:h-[calc(100vh-72px)] overflow-hidden bg-[var(--background)]">
      {/* Top Floating Filter Bar */}
      <div className="z-10 flex items-center justify-between gap-4 px-4 py-3 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFiltersDrawer(true)}
            className="flex items-center gap-2 border border-[var(--border)] h-9 px-3 text-xs"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>{dict.catalog?.filters?.title || "Filtros"}</span>
          </Button>

          {/* Quick counts */}
          <span className="hidden sm:inline-block text-[11px] font-mono text-[var(--text-muted)]">
            {isLoading ? (
              <span className="animate-pulse">{dict.common?.cargar || "Cargando..."}</span>
            ) : (
              `${activeProperties.length} ${locale === "es" ? "propiedades en esta vista" : "properties in this view"}`
            )}
          </span>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-9 w-9 p-0 flex items-center justify-center border border-[var(--border)]"
            title={locale === "es" ? "Actualizar" : "Refresh"}
          >
            <RefreshCw className="h-3.5 w-3.5 text-[var(--text-2)]" />
          </Button>

          {/* Mobile view toggler */}
          <div className="flex sm:hidden border border-[var(--border)] rounded-sm p-0.5 bg-[var(--surface)]">
            <button
              onClick={() => setMobileView("map")}
              className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
                mobileView === "map"
                  ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                  : "text-[var(--text-muted)]"
              }`}
            >
              <MapIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMobileView("list")}
              className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
                mobileView === "list"
                  ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                  : "text-[var(--text-muted)]"
              }`}
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Split */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Sidebar Listings (Visible on desktop always, on mobile when 'list' view active) */}
        <aside
          className={`${
            mobileView === "list" ? "flex" : "hidden"
          } sm:flex flex-col w-full sm:w-[420px] h-full border-r border-[var(--border)] bg-[var(--background-alt)] shrink-0 overflow-hidden relative z-5`}
        >
          {/* Properties list scroll container */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {isLoading ? (
              // Simple side skeleton loaders
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-72 w-full bg-[var(--surface)] rounded-sm animate-pulse border border-[var(--border)]" />
              ))
            ) : activeProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 px-4">
                <AlertCircle className="h-8 w-8 text-[var(--text-muted)] mb-3" />
                <h4 className="font-display font-semibold text-sm text-[var(--text)] mb-1">
                  {dict.catalog?.empty?.title || "Sin resultados"}
                </h4>
                <p className="text-xs text-[var(--text-2)] font-light leading-relaxed mb-4">
                  {dict.catalog?.empty?.description || "Intenta cambiar o limpiar tus filtros de búsqueda."}
                </p>
                <Button onClick={resetFilters} variant="outline" size="sm" className="text-xs">
                  {dict.catalog?.empty?.cta || "Ver todas"}
                </Button>
              </div>
            ) : (
              activeProperties.map((property) => (
                <div
                  key={property.id}
                  onMouseEnter={() => setHoveredPropertyId(property.id)}
                  onMouseLeave={() => setHoveredPropertyId(null)}
                  className="transition-opacity duration-200"
                  style={{
                    opacity: hoveredPropertyId && hoveredPropertyId !== property.id ? 0.65 : 1,
                  }}
                >
                  <PropertyCard property={property} />
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Map Canvas (Visible on desktop, on mobile when 'map' view active) */}
        <main
          className={`${
            mobileView === "map" ? "block" : "hidden"
          } sm:block flex-1 h-full relative z-0`}
        >
          <PropertyMap
            properties={activeProperties}
            hoveredPropertyId={hoveredPropertyId}
            onMarkerClick={(property) => setHoveredPropertyId(property.id)}
          />
        </main>
      </div>

      {/* Floating Filter Drawer Modal (Both mobile and desktop) */}
      {showFiltersDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-[85%] max-w-sm h-full bg-[var(--bg)] p-6 overflow-y-auto border-l border-[var(--border-strong)] flex flex-col gap-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold tracking-tight text-lg text-[var(--text)]">
                {dict.catalog?.filters?.title || "Filtros"}
              </h3>
              <button
                onClick={() => setShowFiltersDrawer(false)}
                className="text-xs font-semibold uppercase tracking-wider text-[var(--text-2)] hover:text-[var(--text)] cursor-pointer"
              >
                {dict.common?.cerrar || "Cerrar"}
              </button>
            </div>
            {/* Reused filters */}
            <PropertyFilters zones={zones} />
            <Button onClick={() => setShowFiltersDrawer(false)} className="w-full mt-auto">
              {locale === "es" ? "Aplicar Filtros" : "Apply Filters"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
