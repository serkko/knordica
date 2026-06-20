"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BedDouble, Bath, Square, MapPin, GitCompare } from "lucide-react";
import { motion } from "framer-motion";
import { useLocale } from "@/components/layout/LocaleProvider";
import { useComparatorStore } from "@/store/comparator.store";
import type { PropertyCard as PropertyCardType } from "@/types/property";
import { cn } from "@/lib/utils/cn";

interface PropertyCardProps {
  property: PropertyCardType;
  isFeatured?: boolean;
}

export function PropertyCard({ property, isFeatured = false }: PropertyCardProps) {
  const { locale, dict } = useLocale();
  const { addProperty, removeProperty, isCompared } = useComparatorStore();
  const compared = isCompared(property.id);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isComparedActive = isMounted ? compared : false;

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (compared) {
      removeProperty(property.id);
    } else {
      addProperty(property);
    }
  };

  const formattedPrice = new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: property.price_currency || "USD",
    maximumFractionDigits: 0,
  }).format(property.price);

  const getPropertyTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      casa: locale === "es" ? "Casa" : "House",
      apartamento: locale === "es" ? "Apartamento" : "Apartment",
      local: locale === "es" ? "Local" : "Commercial",
      terreno: locale === "es" ? "Terreno" : "Land",
      finca: locale === "es" ? "Finca" : "Estate",
      oficina: locale === "es" ? "Oficina" : "Office",
      proyecto: locale === "es" ? "Proyecto" : "Project",
    };
    return types[type] || type;
  };

  const badgeTextClass = "font-body font-medium uppercase text-[0.65rem] tracking-[0.1em]";

  // --- FEATURED CARD DESIGN (index 0 / superimposed layout) ---
  if (isFeatured) {
    return (
      <motion.div
        whileHover={{ 
          y: -6,
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)"
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="h-full rounded-lg overflow-hidden"
      >
        <Link href={`/${locale}/propiedades/${property.slug}`} className="block h-full group">
          <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full h-full flex flex-col border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] transition-colors duration-200 rounded-lg overflow-hidden">
            
            {/* Cover Image */}
            {property.cover_image?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={property.cover_image.url}
                alt={property.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-106"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-radial from-zinc-800 to-zinc-950">
                <span className="text-[10px] tracking-widest text-[var(--accent)] font-semibold uppercase font-display mb-1">
                  Knordica
                </span>
              </div>
            )}

            {/* Gradient Overlay for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908]/95 via-[#0a0908]/50 to-transparent z-10" />

            {/* Compare Button */}
            <button
              onClick={handleCompareClick}
              className={cn(
                "absolute top-4 right-4 z-20 h-8 w-8 rounded-full flex items-center justify-center border transition-all cursor-pointer backdrop-blur-xs",
                isComparedActive
                  ? "bg-[var(--accent)] text-black border-[var(--accent)] shadow-[0_0_8px_var(--accent)]"
                  : "bg-black/50 text-white/70 border-white/20 hover:text-white hover:border-white hover:bg-black/75"
              )}
              title={isComparedActive ? "Quitar de comparar" : "Comparar propiedad"}
            >
              <GitCompare className="h-4 w-4" />
            </button>

            {/* Badges container */}
            <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-1.5 pointer-events-none">
              {/* Badge Operacion */}
              <div className={cn(
                badgeTextClass,
                "px-2 py-1 rounded-sm bg-[#0a0908]/75 backdrop-blur-[8px] text-[var(--accent)]"
              )}>
                {property.operation === "venta"
                  ? dict.property?.operation?.venta || "Venta"
                  : dict.property?.operation?.alquiler || "Alquiler"}
              </div>

              {/* Badge Exclusiva */}
              {property.exclusive && (
                <div className={cn(
                  badgeTextClass,
                  "px-2 py-1 rounded-sm bg-[var(--accent)] text-[#1a1714] font-semibold"
                )}>
                  {dict.property?.badge?.exclusiva || "Exclusiva"}
                </div>
              )}

              {/* Badge Destacada */}
              {property.featured && (
                <div 
                  className={cn(badgeTextClass, "px-2 py-1 rounded-sm")}
                  style={{
                    backgroundColor: "var(--color-gold-highlight)",
                    color: "var(--color-gold)",
                    border: "none"
                  }}
                >
                  {dict.property?.badge?.destacada || "Destacada"}
                </div>
              )}

              {/* Badge Disponible */}
              {property.status === "activa" && (
                <div 
                  className={cn(badgeTextClass, "px-2 py-1 rounded-sm")}
                  style={{
                    backgroundColor: "var(--color-primary-highlight)",
                    color: "var(--color-primary)",
                    border: "none"
                  }}
                >
                  {dict.property?.status?.activa || "Disponible"}
                </div>
              )}
            </div>

            {/* Superimposed Text content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="max-w-xl">
                {/* Title */}
                <h4 className="font-display font-normal text-base sm:text-lg md:text-xl text-white tracking-tight leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors duration-200">
                  {property.title}
                </h4>

                {/* Location Zone */}
                <div className="flex items-center gap-1 text-[0.75rem] text-[#8a8278] font-body mt-2">
                  <MapPin size={12} className="shrink-0" />
                  <span>
                    {property.zone
                      ? locale === "es"
                        ? property.zone.name_es
                        : property.zone.name_en
                      : "Mérida"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-2.5 shrink-0">
                {/* Price Overlay */}
                <div className="px-3 py-1.5 rounded-sm bg-[#0a0908]/85 backdrop-blur-[8px] font-display font-semibold text-[1.1rem] text-[#f0ede8] shadow-md">
                  {formattedPrice}
                </div>

                {/* Specs row */}
                <div className="flex items-center gap-2.5 text-[0.8rem] font-body font-medium text-[#f0ede8]">
                  <div className="flex items-center gap-1">
                    <BedDouble size={14} className="text-[#8a8278]" />
                    <span>{property.bedrooms ?? "-"}</span>
                  </div>
                  <span className="text-[#8a8278] text-[10px] select-none">·</span>
                  <div className="flex items-center gap-1">
                    <Bath size={14} className="text-[#8a8278]" />
                    <span>{property.bathrooms ?? "-"}</span>
                  </div>
                  <span className="text-[#8a8278] text-[10px] select-none">·</span>
                  <div className="flex items-center gap-1">
                    <Square size={14} className="text-[#8a8278]" />
                    <span>{property.area_total ?? property.area_built ?? "-"} m²</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Link>
      </motion.div>
    );
  }

  // --- STANDARD CARD DESIGN ---
  return (
    <motion.div
      whileHover={{ 
        y: -6,
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)"
      }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="h-full rounded-lg overflow-hidden"
    >
      <Link href={`/${locale}/propiedades/${property.slug}`} className="block h-full group">
        <div className="h-full flex flex-col border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] transition-colors duration-200 rounded-lg overflow-hidden">
          {/* Image ratio 4:3 fixed */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900 rounded-t-lg">
            {/* Compare Button */}
            <button
              onClick={handleCompareClick}
              className={cn(
                "absolute top-4 right-4 z-20 h-8 w-8 rounded-full flex items-center justify-center border transition-all cursor-pointer backdrop-blur-xs",
                isComparedActive
                  ? "bg-[var(--accent)] text-black border-[var(--accent)] shadow-[0_0_8px_var(--accent)]"
                  : "bg-black/50 text-white/70 border-white/20 hover:text-white hover:border-white hover:bg-black/75"
              )}
              title={isComparedActive ? "Quitar de comparar" : "Comparar propiedad"}
            >
              <GitCompare className="h-4 w-4" />
            </button>

            {/* Badges container */}
            <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-1.5 pointer-events-none">
              {/* Badge Operacion */}
              <div className={cn(
                badgeTextClass,
                "px-2 py-1 rounded-sm bg-[#0a0908]/75 backdrop-blur-[8px] text-[var(--accent)]"
              )}>
                {property.operation === "venta"
                  ? dict.property?.operation?.venta || "Venta"
                  : dict.property?.operation?.alquiler || "Alquiler"}
              </div>

              {/* Badge Exclusiva */}
              {property.exclusive && (
                <div className={cn(
                  badgeTextClass,
                  "px-2 py-1 rounded-sm bg-[var(--accent)] text-[#1a1714] font-semibold"
                )}>
                  {dict.property?.badge?.exclusiva || "Exclusiva"}
                </div>
              )}

              {/* Badge Destacada */}
              {property.featured && (
                <div 
                  className={cn(badgeTextClass, "px-2 py-1 rounded-sm")}
                  style={{
                    backgroundColor: "var(--color-gold-highlight)",
                    color: "var(--color-gold)",
                    border: "none"
                  }}
                >
                  {dict.property?.badge?.destacada || "Destacada"}
                </div>
              )}

              {/* Badge Disponible */}
              {property.status === "activa" && (
                <div 
                  className={cn(badgeTextClass, "px-2 py-1 rounded-sm")}
                  style={{
                    backgroundColor: "var(--color-primary-highlight)",
                    color: "var(--color-primary)",
                    border: "none"
                  }}
                >
                  {dict.property?.status?.activa || "Disponible"}
                </div>
              )}
            </div>

            {/* Price Badge absolute bottom left */}
            <div className="absolute bottom-4 left-4 z-20 px-3 py-1.5 rounded-sm bg-[#0a0908]/85 backdrop-blur-[8px] font-display font-semibold text-[1.1rem] text-[#f0ede8] shadow-md">
              {formattedPrice}
            </div>

            {/* Cover Image */}
            {property.cover_image?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={property.cover_image.url}
                alt={property.title}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-106"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-radial from-zinc-800 to-zinc-950">
                <span className="text-[10px] tracking-widest text-[var(--accent)] font-semibold uppercase font-display mb-1">
                  Knordica
                </span>
              </div>
            )}
          </div>

          {/* Card Body */}
          <div className="flex-1 p-5 flex flex-col justify-between gap-4">
            <div>
              {/* Title Cabinet Grotesk 400, 0.95rem, color text */}
              <h4 className="font-display font-normal text-[0.95rem] text-[var(--text)] tracking-tight leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors duration-200">
                {property.title}
              </h4>

              {/* Zone / Location Satoshi 400, 0.75rem, text-muted */}
              <div className="flex items-center gap-1 text-[0.75rem] text-[var(--text-muted)] font-body mt-2">
                <MapPin size={12} className="shrink-0" />
                <span>
                  {property.zone
                    ? locale === "es"
                      ? property.zone.name_es
                      : property.zone.name_en
                    : "Mérida"}
                </span>
              </div>
            </div>

            {/* Specs row separated by point · */}
            <div className="flex items-center gap-2.5 text-[0.8rem] font-body font-medium text-[var(--text-2)] border-t border-[var(--border)] pt-3.5">
              <div className="flex items-center gap-1">
                <BedDouble size={14} className="text-[var(--text-muted)]" />
                <span>{property.bedrooms ?? "-"}</span>
              </div>
              <span className="text-[var(--text-muted)] text-[10px] select-none">·</span>
              <div className="flex items-center gap-1">
                <Bath size={14} className="text-[var(--text-muted)]" />
                <span>{property.bathrooms ?? "-"}</span>
              </div>
              <span className="text-[var(--text-muted)] text-[10px] select-none">·</span>
              <div className="flex items-center gap-1">
                <Square size={14} className="text-[var(--text-muted)]" />
                <span>{property.area_total ?? property.area_built ?? "-"} m²</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
