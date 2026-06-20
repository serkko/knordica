"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { useLocale } from "@/components/layout/LocaleProvider";
import type { Zone } from "@/types/property";

interface HeroSearchProps {
  zones: Zone[];
}

export function HeroSearch({ zones }: HeroSearchProps) {
  const router = useRouter();
  const { locale, dict } = useLocale();
  
  const [type, setType] = useState<string>("");
  const [zone, setZone] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [isPressed, setIsPressed] = useState(false);

  const defaultSectors = [
    { slug: "el-arenal", name_es: "El Arenal", name_en: "El Arenal" },
    { slug: "la-pedregosa", name_es: "La Pedregosa", name_en: "La Pedregosa" },
    { slug: "los-chorros", name_es: "Los Chorros", name_en: "Los Chorros" },
    { slug: "mucuchies", name_es: "Mucuchíes", name_en: "Mucuchíes" },
    { slug: "el-vigia", name_es: "El Vigía", name_en: "El Vigía" },
    { slug: "centro-historico", name_es: "Centro histórico", name_en: "Historical Center" },
    { slug: "ejido", name_es: "Ejido", name_en: "Ejido" },
  ];

  const activeZones = zones && zones.length > 0 ? zones : defaultSectors;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPressed(true);

    setTimeout(() => {
      setIsPressed(false);
      const params = new URLSearchParams();
      params.set("operacion", "venta"); // Default operation type
      if (type) params.set("tipo", type);
      if (zone && zone !== "all") params.set("zona", zone);
      if (priceMax) params.set("precio_max", priceMax);

      router.push(`/${locale}/propiedades?${params.toString()}`);
    }, 150);
  };

  const getTypes = () => {
    return [
      { value: "casa", label: locale === "es" ? "Casa" : "House" },
      { value: "apartamento", label: locale === "es" ? "Apartamento" : "Apartment" },
      { value: "townhouse", label: locale === "es" ? "Townhouse" : "Townhouse" },
      { value: "local", label: locale === "es" ? "Local Comercial" : "Commercial Space" },
      { value: "terreno", label: locale === "es" ? "Terreno" : "Land" },
      { value: "oficina", label: locale === "es" ? "Oficina" : "Office" },
    ];
  };

  const getPrices = () => {
    return [
      { value: "50000", label: locale === "es" ? "Hasta $50.000" : "Up to $50,000" },
      { value: "100000", label: locale === "es" ? "Hasta $100.000" : "Up to $100,000" },
      { value: "200000", label: locale === "es" ? "Hasta $200.000" : "Up to $200,000" },
      { value: "500000", label: locale === "es" ? "Hasta $500.000" : "Up to $500,000" },
      { value: "500001", label: locale === "es" ? "Más de $500.000" : "More than $500,000" },
    ];
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes search-shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .btn-shimmer-hover {
          position: relative;
          overflow: hidden;
        }
        .btn-shimmer-hover::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.2) 50%,
            transparent 100%
          );
          pointer-events: none;
        }
        .btn-shimmer-hover:hover::after {
          animation: search-shimmer 0.6s ease forwards;
        }
      `}} />

      <motion.form
        onSubmit={handleSearch}
        animate={{ scale: isPressed ? 0.98 : 1 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-4xl flex flex-col md:flex-row gap-2 items-center"
        style={{
          background: "oklch(0.12 0.01 60 / 0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(168, 134, 74, 0.25)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-3)",
          boxShadow: "0 8px 32px oklch(0.05 0.01 60 / 0.4)",
        }}
      >
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
          {/* Tipo de propiedad */}
          <div 
            className="flex flex-col justify-center px-4 py-2 border-b-2 border-b-transparent focus-within:border-b-[var(--color-gold)] transition-all duration-200"
            style={{
              borderRight: "1px solid rgba(237, 233, 227, 0.1)",
              fontFamily: "var(--font-body)"
            }}
          >
            <label className="text-[9px] uppercase tracking-wider font-semibold text-white/50 font-display mb-0.5 select-none">
              {dict.hero?.tipo?.label || (locale === "es" ? "Tipo de propiedad" : "Property type")}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-transparent text-sm text-[#FDFCFA] border-0 p-0 focus:ring-0 focus:outline-hidden cursor-pointer w-full font-medium"
            >
              <option value="" className="bg-[#1c1b19] text-[#FDFCFA]">
                {dict.hero?.tipo?.todos || (locale === "es" ? "Todos los tipos" : "All types")}
              </option>
              {getTypes().map((t) => (
                <option key={t.value} value={t.value} className="bg-[#1c1b19] text-[#FDFCFA]">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Zona/Sector */}
          <div 
            className="flex flex-col justify-center px-4 py-2 border-b-2 border-b-transparent focus-within:border-b-[var(--color-gold)] transition-all duration-200"
            style={{
              borderRight: "1px solid rgba(237, 233, 227, 0.1)",
              fontFamily: "var(--font-body)"
            }}
          >
            <label className="text-[9px] uppercase tracking-wider font-semibold text-white/50 font-display mb-0.5 select-none">
              {dict.hero?.zona?.label || (locale === "es" ? "Zona/Sector" : "Zone/Sector")}
            </label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="bg-transparent text-sm text-[#FDFCFA] border-0 p-0 focus:ring-0 focus:outline-hidden cursor-pointer w-full font-medium"
            >
              <option value="all" className="bg-[#1c1b19] text-[#FDFCFA]">
                {dict.hero?.zona?.todas || (locale === "es" ? "Todas las zonas" : "All zones")}
              </option>
              {activeZones.map((z) => (
                <option key={z.slug} value={z.slug} className="bg-[#1c1b19] text-[#FDFCFA]">
                  {locale === "es" ? z.name_es : z.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Precio máx */}
          <div 
            className="flex flex-col justify-center px-4 py-2 border-b-2 border-b-transparent focus-within:border-b-[var(--color-gold)] transition-all duration-200"
            style={{
              fontFamily: "var(--font-body)"
            }}
          >
            <label className="text-[9px] uppercase tracking-wider font-semibold text-white/50 font-display mb-0.5 select-none">
              {locale === "es" ? "Precio máx" : "Max price"}
            </label>
            <select
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="bg-transparent text-sm text-[#FDFCFA] border-0 p-0 focus:ring-0 focus:outline-hidden cursor-pointer w-full font-medium"
            >
              <option value="" className="bg-[#1c1b19] text-[#FDFCFA]">
                {locale === "es" ? "Sin límite" : "No limit"}
              </option>
              {getPrices().map((p) => (
                <option key={p.value} value={p.value} className="bg-[#1c1b19] text-[#FDFCFA]">
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit search button */}
        <button
          type="submit"
          className="btn-shimmer-hover h-12 w-full md:w-auto md:px-8 bg-[var(--color-gold)] text-[var(--color-text-inverse)] rounded-[var(--radius-lg)] font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:bg-[var(--color-gold-hover)] border-0"
        >
          <Search className="h-4 w-4" />
          <span>{dict.hero?.searchBtn || (locale === "es" ? "Buscar" : "Search")}</span>
        </button>
      </motion.form>
    </>
  );
}
