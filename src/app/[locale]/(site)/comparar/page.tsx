"use client";

import PropertyComparator from "@/components/tools/PropertyComparator";
import { useLocale } from "@/components/layout/LocaleProvider";

export default function CompararPage() {
  const { locale } = useLocale();

  return (
    <div className="pt-24 pb-16 min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border)] pb-8 mb-12">
        <div className="container-knordica">
          <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-semibold font-display block mb-2">
            {locale === "es" ? "Comparar" : "Compare"}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-[var(--text)] leading-tight mb-2">
            {locale === "es" ? "Comparador de Inmuebles" : "Property Comparison"}
          </h1>
          <p className="text-sm md:text-base text-[var(--text-2)] font-light">
            {locale === "es"
              ? "Analiza características en paralelo para tomar la mejor decisión de inversión."
              : "Analyze features side-by-side to make the best investment decision."}
          </p>
        </div>
      </header>

      {/* Main Table */}
      <div className="container-knordica">
        <PropertyComparator />
      </div>
    </div>
  );
}
