"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/layout/LocaleProvider";
import type { Zone } from "@/types/property";

interface HeroSearchProps {
  zones: Zone[];
}

export function HeroSearch({ zones }: HeroSearchProps) {
  const router = useRouter();
  const { locale, dict } = useLocale();
  
  const [operation, setOperation] = useState<"venta" | "alquiler">("venta");
  const [type, setType] = useState<string>("");
  const [zone, setZone] = useState<string>("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("operacion", operation);
    if (type) params.set("tipo", type);
    if (zone) params.set("zona", zone);

    router.push(`/${locale}/propiedades?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-4xl p-1.5 flex flex-col md:flex-row gap-2 shadow-2xl md:h-14 items-center"
      style={{
        backgroundColor: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
        {/* Operación */}
        <div className="flex flex-col justify-center px-3 border-b sm:border-b-0 sm:border-r border-[var(--color-divider)] pb-2 sm:pb-0">
          <label className="text-[9px] uppercase tracking-wider font-semibold text-[var(--text-muted)] font-display mb-0.5">
            {dict.hero?.operacion?.label || "Operación"}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOperation("venta")}
              className={`text-sm font-medium transition-colors cursor-pointer ${
                operation === "venta"
                  ? "text-[var(--accent)] font-semibold"
                  : "text-[var(--text-2)] hover:text-[var(--text)]"
              }`}
            >
              {dict.hero?.operacion?.venta || "Venta"}
            </button>
            <span className="text-[var(--border-strong)]">/</span>
            <button
              type="button"
              onClick={() => setOperation("alquiler")}
              className={`text-sm font-medium transition-colors cursor-pointer ${
                operation === "alquiler"
                  ? "text-[var(--accent)] font-semibold"
                  : "text-[var(--text-2)] hover:text-[var(--text)]"
              }`}
            >
              {dict.hero?.operacion?.alquiler || "Alquiler"}
            </button>
          </div>
        </div>

        {/* Tipo de Propiedad */}
        <div className="flex flex-col justify-center px-3 border-b sm:border-b-0 sm:border-r border-[var(--color-divider)] pb-2 sm:pb-0">
          <label className="text-[9px] uppercase tracking-wider font-semibold text-[var(--text-muted)] font-display mb-0.5">
            {dict.hero?.tipo?.label || "Tipo"}
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            suppressHydrationWarning
            className="bg-transparent text-sm text-[var(--color-text)] border-0 p-0 focus:ring-0 focus:outline-hidden cursor-pointer w-full font-medium"
          >
            <option value="" className="bg-[var(--color-surface-2)] text-[var(--color-text)]">
              {dict.hero?.tipo?.todos || "Todos los tipos"}
            </option>
            <option value="casa" className="bg-[var(--color-surface-2)] text-[var(--color-text)]">
              {locale === "es" ? "Casa" : "House"}
            </option>
            <option value="apartamento" className="bg-[var(--color-surface-2)] text-[var(--color-text)]">
              {locale === "es" ? "Apartamento" : "Apartment"}
            </option>
            <option value="local" className="bg-[var(--color-surface-2)] text-[var(--color-text)]">
              {locale === "es" ? "Local Comercial" : "Commercial Space"}
            </option>
            <option value="terreno" className="bg-[var(--color-surface-2)] text-[var(--color-text)]">
              {locale === "es" ? "Terreno" : "Land"}
            </option>
            <option value="finca" className="bg-[var(--color-surface-2)] text-[var(--color-text)]">
              {locale === "es" ? "Finca" : "Estate"}
            </option>
            <option value="oficina" className="bg-[var(--color-surface-2)] text-[var(--color-text)]">
              {locale === "es" ? "Oficina" : "Office"}
            </option>
          </select>
        </div>

        {/* Zona */}
        <div className="flex flex-col justify-center px-3 pb-2 sm:pb-0">
          <label className="text-[9px] uppercase tracking-wider font-semibold text-[var(--text-muted)] font-display mb-0.5">
            {dict.hero?.zona?.label || "Zona"}
          </label>
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            suppressHydrationWarning
            className="bg-transparent text-sm text-[var(--color-text)] border-0 p-0 focus:ring-0 focus:outline-hidden cursor-pointer w-full font-medium"
          >
            <option value="" className="bg-[var(--color-surface-2)] text-[var(--color-text)]">
              {dict.hero?.zona?.todas || "Todas las zonas"}
            </option>
            {zones.map((z) => (
              <option key={z.id} value={z.slug} className="bg-[var(--color-surface-2)] text-[var(--color-text)]">
                {locale === "es" ? z.name_es : z.name_en}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button 
        type="submit" 
        variant="primary" 
        className="h-11 md:h-11 w-full md:w-32 rounded-lg shrink-0 font-display text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-0 transition-colors duration-300"
        style={{
          backgroundColor: "var(--color-gold)",
          color: "var(--color-text-inverse)",
          backgroundImage: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--color-gold-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--color-gold)";
        }}
      >
        <Search className="h-4 w-4" />
        <span>{dict.hero?.searchBtn || "Buscar"}</span>
      </Button>
    </form>
  );
}
