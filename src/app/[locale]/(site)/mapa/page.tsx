import type { Metadata } from "next";
import { Suspense } from "react";
import { getFeaturedZones } from "@/lib/queries/zones";
import MapSearchPage from "@/components/map/MapSearchPage";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === "es";

  return {
    title: isEs
      ? "Búsqueda por Mapa | Knordica"
      : "Map Property Search | Knordica",
    description: isEs
      ? "Navega de forma interactiva y encuentra propiedades seleccionadas en venta y alquiler en los Andes venezolanos."
      : "Browse interactively and find curated properties for sale and rent in the Venezuelan Andes.",
  };
}

export default async function MapPage({ params }: PageProps) {
  const { locale } = await params;
  
  // Pre-load zones for filters on the server side
  const zones = await getFeaturedZones();

  return (
    <div className="pt-16 sm:pt-[72px]">
      <Suspense
        fallback={
          <div className="h-[calc(100vh-72px)] bg-zinc-950 flex flex-col items-center justify-center text-xs text-[var(--text-muted)] font-mono">
            {locale === "es" ? "Cargando mapa interactivo..." : "Loading interactive map..."}
          </div>
        }
      >
        <MapSearchPage zones={zones} />
      </Suspense>
    </div>
  );
}
