"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { PropertyFilters, PropertyOperation, PropertyType } from "@/types/property";

export function useFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Compute filters synchronously from URL search parameters on every render
  const filters: PropertyFilters = {};

  const op = searchParams.get("operacion");
  if (op) {
    filters.operacion = op.split(",").filter(Boolean) as PropertyOperation[];
  }

  const tipo = searchParams.get("tipo");
  if (tipo) {
    filters.tipo = tipo.split(",").filter(Boolean) as PropertyType[];
  }

  const zona = searchParams.get("zona");
  if (zona) {
    filters.zona = zona.split(",").filter(Boolean);
  }

  const pMin = searchParams.get("precio_min");
  if (pMin) filters.precio_min = parseInt(pMin, 10);

  const pMax = searchParams.get("precio_max");
  if (pMax) filters.precio_max = parseInt(pMax, 10);

  const hab = searchParams.get("habitaciones");
  if (hab) {
    filters.habitaciones = hab.split(",").filter(Boolean).map(x => parseInt(x, 10));
  }

  const ban = searchParams.get("banos");
  if (ban) {
    filters.banos = ban.split(",").filter(Boolean).map(x => parseInt(x, 10));
  }

  const pool = searchParams.get("has_pool");
  if (pool === "true") filters.has_pool = true;

  const ac = searchParams.get("has_ac");
  if (ac === "true") filters.has_ac = true;

  const gen = searchParams.get("has_generator");
  if (gen === "true") filters.has_generator = true;

  const sec = searchParams.get("has_security");
  if (sec === "true") filters.has_security = true;

  const elev = searchParams.get("has_elevator");
  if (elev === "true") filters.has_elevator = true;

  const pets = searchParams.get("allows_pets");
  if (pets === "true") filters.allows_pets = true;

  const furn = searchParams.get("furnished");
  if (furn === "true") filters.furnished = true;

  const dest = searchParams.get("destacadas");
  if (dest === "true") filters.destacadas = true;

  const nue = searchParams.get("nuevas");
  if (nue === "true") filters.nuevas = true;

  const minArea = searchParams.get("min_area");
  if (minArea) filters.min_area = parseInt(minArea, 10);

  const maxArea = searchParams.get("max_area");
  if (maxArea) filters.max_area = parseInt(maxArea, 10);

  const mun = searchParams.get("municipio");
  if (mun) filters.municipio = mun;

  const sort = searchParams.get("sort");
  if (sort) filters.sort = sort as any;

  const page = searchParams.get("page");
  if (page) filters.page = parseInt(page, 10);

  // Update a single filter by replacing the query parameters in the URL
  const updateFilter = <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
      params.delete(key);
    } else if (Array.isArray(value)) {
      params.set(key, value.join(","));
    } else {
      params.set(key, value.toString());
    }

    // Reset page to 1 when any filter other than page changes
    if (key !== "page") {
      params.delete("page");
    }

    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  };

  // Reset all filters by replacing the URL with the clean pathname
  const resetFilters = () => {
    router.replace(pathname, { scroll: false });
  };

  return { filters, updateFilter, resetFilters };
}
