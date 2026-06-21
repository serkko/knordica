import { useQuery } from "@tanstack/react-query";
import type { PropertyFilters, PropertyCard } from "@/types/property";

export function useProperties(filters: PropertyFilters) {
  const queryParams = new URLSearchParams();
  if (filters.operacion) queryParams.set("operacion", filters.operacion);
  if (filters.tipo) queryParams.set("tipo", filters.tipo);
  if (filters.zona) queryParams.set("zona", filters.zona);
  if (filters.precio_min) queryParams.set("precio_min", filters.precio_min.toString());
  if (filters.precio_max) queryParams.set("precio_max", filters.precio_max.toString());
  if (filters.habitaciones) queryParams.set("habitaciones", filters.habitaciones.toString());
  if (filters.banos) queryParams.set("banos", filters.banos.toString());
  if (filters.area_min) queryParams.set("area_min", filters.area_min.toString());
  if (filters.area_max) queryParams.set("area_max", filters.area_max.toString());
  if (filters.sort) queryParams.set("sort", filters.sort);
  if (filters.page) queryParams.set("page", filters.page.toString());
  if (filters.per_page) queryParams.set("per_page", filters.per_page.toString());

  // Nuevos filtros booleanos
  if (filters.has_pool)       queryParams.set("has_pool", "true");
  if (filters.has_ac)         queryParams.set("has_ac", "true");
  if (filters.has_generator)  queryParams.set("has_generator", "true");
  if (filters.has_security)   queryParams.set("has_security", "true");
  if (filters.has_elevator)   queryParams.set("has_elevator", "true");
  if (filters.allows_pets)    queryParams.set("allows_pets", "true");
  if (filters.furnished)      queryParams.set("furnished", "true");
  if (filters.destacadas)     queryParams.set("destacadas", "true");
  if (filters.nuevas)         queryParams.set("nuevas", "true");
  if (filters.min_area)       queryParams.set("min_area", filters.min_area.toString());
  if (filters.max_area)       queryParams.set("max_area", filters.max_area.toString());
  if (filters.municipio)      queryParams.set("municipio", filters.municipio);

  return useQuery<{ data: PropertyCard[]; count: number }>({
    queryKey: ["properties", filters],
    queryFn: async () => {
      const res = await fetch(`/api/properties?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    },
  });
}
