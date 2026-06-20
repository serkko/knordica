import type { Metadata } from "next";
import { Suspense } from "react";
import { getFeaturedZones } from "@/lib/queries/zones";
import { CatalogContainer } from "@/components/property/CatalogContainer";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === "es";

  return {
    title: isEs
      ? "Catálogo de Propiedades en Mérida | Knordica"
      : "Property Catalog in Mérida | Knordica",
    description: isEs
      ? "Descubre nuestra selección de casas, apartamentos y locales comerciales en venta y alquiler en Mérida, Venezuela."
      : "Discover our curated selection of houses, apartments, and commercial spaces for sale and rent in Mérida, Venezuela.",
  };
}

export default async function CatalogPage({ params }: PageProps) {
  const { locale } = await params;
  
  // Load zones for filtering dropdown on server-side
  const [zones, dict] = await Promise.all([
    getFeaturedZones(),
    getDictionary(locale as Locale),
  ]);

  return (
    <div className="pt-24 min-h-screen">
      {/* Editorial Page Header */}
      <header className="border-b border-[var(--border)] pb-8 mb-4">
        <div className="container-knordica">
          <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-semibold font-display block mb-2">
            {dict.nav?.propiedades || "Propiedades"}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-[var(--text)] leading-tight mb-2">
            {dict.catalog?.title || "Propiedades disponibles"}
          </h1>
          <p className="text-sm md:text-base text-[var(--text-2)] font-light">
            {dict.catalog?.subtitle || "Propiedades seleccionadas en Mérida"}
          </p>
        </div>
      </header>

      {/* Main Interactive Catalog wrapper */}
      <Suspense fallback={
        <div className="container-knordica py-12 text-center text-xs text-[var(--text-muted)] font-mono">
          {locale === "es" ? "Cargando catálogo..." : "Loading catalog..."}
        </div>
      }>
        <CatalogContainer zones={zones} />
      </Suspense>
    </div>
  );
}
