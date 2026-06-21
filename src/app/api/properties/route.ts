import { NextResponse } from "next/server";
import { getProperties } from "@/lib/queries/properties";
import type { PropertyFilters } from "@/types/property";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: PropertyFilters = {
      operacion: (searchParams.get("operacion") as any) || undefined,
      tipo: (searchParams.get("tipo") as any) || undefined,
      zona: searchParams.get("zona") || undefined,
      precio_min: searchParams.get("precio_min") ? parseInt(searchParams.get("precio_min")!, 10) : undefined,
      precio_max: searchParams.get("precio_max") ? parseInt(searchParams.get("precio_max")!, 10) : undefined,
      habitaciones: searchParams.get("habitaciones") ? parseInt(searchParams.get("habitaciones")!, 10) : undefined,
      banos: searchParams.get("banos") ? parseInt(searchParams.get("banos")!, 10) : undefined,
      area_min: searchParams.get("area_min") ? parseInt(searchParams.get("area_min")!, 10) : undefined,
      area_max: searchParams.get("area_max") ? parseInt(searchParams.get("area_max")!, 10) : undefined,
      sort: (searchParams.get("sort") as any) || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1,
      per_page: searchParams.get("per_page") ? parseInt(searchParams.get("per_page")!, 10) : 12,
    };

    const result = await getProperties(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in properties API route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
