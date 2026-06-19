import type { Metadata } from "next";
import ToolsContainer from "./ToolsContainer";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === "es";

  return {
    title: isEs ? "Herramientas Financieras | Knordica" : "Financial Tools | Knordica",
    description: isEs
      ? "Calculadora hipotecaria, proyecciones de rendimiento de inversión y comparador de propiedades de lujo en Mérida, Venezuela."
      : "Mortgage calculator, investment yield projections, and luxury property comparator in Mérida, Venezuela.",
  };
}

export default async function HerramientasPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <div className="pt-24 pb-16 min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border)] pb-8 mb-12">
        <div className="container-knordica">
          <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-semibold font-display block mb-2">
            {locale === "es" ? "Herramientas" : "Financial Tools"}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-[var(--text)] leading-tight mb-2">
            {locale === "es" ? "Decisiones con respaldo técnico" : "Data-driven decisions"}
          </h1>
          <p className="text-sm md:text-base text-[var(--text-2)] font-light">
            {locale === "es" 
              ? "Calcula cuotas, proyecta plusvalía y compara propiedades de forma precisa." 
              : "Calculate payments, project capital appreciation, and compare listings accurately."}
          </p>
        </div>
      </header>

      {/* Tools Wrapper Component */}
      <div className="container-knordica">
        <ToolsContainer />
      </div>
    </div>
  );
}
