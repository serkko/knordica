"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useFiltersStore } from "@/store/filters.store";
import type { PropertyFilters, PropertyOperation, PropertyType } from "@/types/property";

export function useFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { filters, setFilters, updateFilter, resetFilters } = useFiltersStore();
  const isInitialSync = useRef(true);

  // Sync URL search parameters to Zustand store on mount/URL change
  useEffect(() => {
    if (!isInitialSync.current) return;

    const params: PropertyFilters = {};

    const op = searchParams.get("operacion");
    if (op === "venta" || op === "alquiler") {
      params.operacion = op as PropertyOperation;
    }

    const tipo = searchParams.get("tipo");
    if (tipo) params.tipo = tipo as PropertyType;

    const zona = searchParams.get("zona");
    if (zona) params.zona = zona;

    const pMin = searchParams.get("precio_min");
    if (pMin) params.precio_min = parseInt(pMin, 10);

    const pMax = searchParams.get("precio_max");
    if (pMax) params.precio_max = parseInt(pMax, 10);

    const hab = searchParams.get("habitaciones");
    if (hab) params.habitaciones = parseInt(hab, 10);

    const ban = searchParams.get("banos");
    if (ban) params.banos = parseInt(ban, 10);

    const aMin = searchParams.get("area_min");
    if (aMin) params.area_min = parseInt(aMin, 10);

    const aMax = searchParams.get("area_max");
    if (aMax) params.area_max = parseInt(aMax, 10);

    const sort = searchParams.get("sort");
    if (sort) params.sort = sort as any;

    const page = searchParams.get("page");
    if (page) params.page = parseInt(page, 10);

    if (Object.keys(params).length > 0) {
      setFilters(params);
    }
    isInitialSync.current = false;
  }, [searchParams, setFilters]);

  // Sync Zustand store changes to URL search parameters
  useEffect(() => {
    if (isInitialSync.current) return;

    const params = new URLSearchParams();

    if (filters.operacion) params.set("operacion", filters.operacion);
    if (filters.tipo) params.set("tipo", filters.tipo);
    if (filters.zona) params.set("zona", filters.zona);
    if (filters.precio_min) params.set("precio_min", filters.precio_min.toString());
    if (filters.precio_max) params.set("precio_max", filters.precio_max.toString());
    if (filters.habitaciones) params.set("habitaciones", filters.habitaciones.toString());
    if (filters.banos) params.set("banos", filters.banos.toString());
    if (filters.area_min) params.set("area_min", filters.area_min.toString());
    if (filters.area_max) params.set("area_max", filters.area_max.toString());
    if (filters.sort && filters.sort !== "recientes") params.set("sort", filters.sort);
    if (filters.page && filters.page > 1) params.set("page", filters.page.toString());

    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }, [filters, pathname, router]);

  return { filters, updateFilter, resetFilters };
}
