import { create } from "zustand";
import type { PropertyFilters, PropertyOperation, PropertyType } from "@/types/property";

type ViewMode = "grid" | "list" | "map";

interface FiltersState {
  filters: PropertyFilters;
  view: ViewMode;
  setFilters: (filters: PropertyFilters) => void;
  updateFilter: <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => void;
  resetFilters: () => void;
  setView: (view: ViewMode) => void;
  initializeFromUrl: (queryString: string) => void;
}

const initialFilters: PropertyFilters = {
  operacion: undefined,
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

// Helper to serialize filters object to URLSearchParams
function syncFiltersToUrl(filters: PropertyFilters) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, val]) => {
    if (val === undefined || val === null || val === "") return;
    if (Array.isArray(val)) {
      if (val.length > 0) params.set(key, val.join(","));
    } else {
      params.set(key, val.toString());
    }
  });

  const query = params.toString();
  const newUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
  window.history.replaceState(null, "", newUrl);
}

// Helper to parse query parameters into PropertyFilters
export function parseQueryString(queryString: string): PropertyFilters {
  const params = new URLSearchParams(queryString);
  const parsed: PropertyFilters = {};

  const op = params.get("operacion");
  if (op) parsed.operacion = op.split(",").filter(Boolean) as PropertyOperation[];

  const tipo = params.get("tipo");
  if (tipo) parsed.tipo = tipo.split(",").filter(Boolean) as PropertyType[];

  const zona = params.get("zona");
  if (zona) parsed.zona = zona.split(",").filter(Boolean);

  const pMin = params.get("precio_min");
  if (pMin) parsed.precio_min = parseInt(pMin, 10);

  const pMax = params.get("precio_max");
  if (pMax) parsed.precio_max = parseInt(pMax, 10);

  const hab = params.get("habitaciones");
  if (hab) parsed.habitaciones = hab.split(",").filter(Boolean).map(x => parseInt(x, 10));

  const ban = params.get("banos");
  if (ban) parsed.banos = ban.split(",").filter(Boolean).map(x => parseInt(x, 10));

  const minArea = params.get("min_area") || params.get("area_min");
  if (minArea) parsed.min_area = parseInt(minArea, 10);

  const maxArea = params.get("max_area") || params.get("area_max");
  if (maxArea) parsed.max_area = parseInt(maxArea, 10);

  const sort = params.get("sort");
  if (sort) parsed.sort = sort as any;

  const page = params.get("page");
  if (page) parsed.page = parseInt(page, 10);

  // Booleans
  if (params.get("has_pool") === "true") parsed.has_pool = true;
  if (params.get("has_ac") === "true") parsed.has_ac = true;
  if (params.get("has_generator") === "true") parsed.has_generator = true;
  if (params.get("has_security") === "true") parsed.has_security = true;
  if (params.get("has_elevator") === "true") parsed.has_elevator = true;
  if (params.get("allows_pets") === "true") parsed.allows_pets = true;
  if (params.get("furnished") === "true") parsed.furnished = true;
  if (params.get("destacadas") === "true") parsed.destacadas = true;
  if (params.get("nuevas") === "true") parsed.nuevas = true;

  return parsed;
}

export const useFiltersStore = create<FiltersState>((set) => ({
  filters: initialFilters,
  view: "grid",
  setFilters: (newFilters) =>
    set(() => {
      const filters = { ...initialFilters, ...newFilters };
      syncFiltersToUrl(filters);
      return { filters };
    }),
  updateFilter: (key, value) =>
    set((state) => {
      const filters = {
        ...state.filters,
        [key]: value,
        ...(key !== "page" ? { page: 1 } : {}),
      };
      syncFiltersToUrl(filters);
      return { filters };
    }),
  resetFilters: () =>
    set(() => {
      syncFiltersToUrl(initialFilters);
      return { filters: initialFilters };
    }),
  setView: (view) => set({ view }),
  initializeFromUrl: (queryString) =>
    set((state) => {
      const parsed = parseQueryString(queryString);
      return { filters: { ...state.filters, ...parsed } };
    }),
}));
