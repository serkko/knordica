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
