import { create } from "zustand";
import type { PropertyFilters } from "@/types/property";

type ViewMode = "grid" | "list" | "map";

interface FiltersState {
  filters: PropertyFilters;
  view: ViewMode;
  setFilters: (filters: PropertyFilters) => void;
  updateFilter: <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => void;
  resetFilters: () => void;
  setView: (view: ViewMode) => void;
}

const initialFilters: PropertyFilters = {
  operacion: "venta",
  tipo: undefined,
  zona: undefined,
  precio_min: undefined,
  precio_max: undefined,
  habitaciones: undefined,
  banos: undefined,
  area_min: undefined,
  area_max: undefined,
  destacadas: undefined,
  nuevas: undefined,
  sort: "recientes",
  page: 1,
  per_page: 12,
};

export const useFiltersStore = create<FiltersState>((set) => ({
  filters: initialFilters,
  view: "grid",
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  updateFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
        // Reset page to 1 when any filter other than page changes
        ...(key !== "page" ? { page: 1 } : {}),
      },
    })),
  resetFilters: () => set({ filters: initialFilters }),
  setView: (view) => set({ view }),
}));
