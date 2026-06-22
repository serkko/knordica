"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BedDouble, Bath, Square, MapPin, GitCompare, Heart,
  Car, Waves, Zap, Shield, Wind, PawPrint, Sofa, ArrowUpDown 
} from "lucide-react";
import { motion } from "framer-motion";
import { useLocale } from "@/components/layout/LocaleProvider";
import { useComparatorStore } from "@/store/comparator.store";
import { useFavorites } from "@/hooks/useFavorites";
import type { PropertyCard as PropertyCardType } from "@/types/property";
import { cn } from "@/lib/utils/cn";
import { EASE_EXPO } from "@/lib/motion/variants";

interface PropertyCardProps {
  property: PropertyCardType;
  isFeatured?: boolean;
}

export function PropertyCard({ property, isFeatured = false }: PropertyCardProps) {
  const { locale, dict } = useLocale();
  const { addProperty, removeProperty, isCompared } = useComparatorStore();
  const { isFavorite, toggleFavorite } = useFavorites();
  const compared = isCompared(property.id);
  const favorite = isFavorite(property.id);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isComparedActive = isMounted ? compared : false;
  const isFavoriteActive = isMounted ? favorite : false;

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (compared) {
      removeProperty(property.id);
    } else {
      addProperty(property);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(property);
  };

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

  // ── Consolidated badge styles ──
  // Compact padding and slightly smaller font to not cover the image too much
  const badgeClass = "text-[8px] font-bold font-display uppercase tracking-widest px-2 py-0.5 rounded shadow-md border";

  const operationBadge = ({
    venta:      { label: locale === "es" ? "En Venta"   : "For Sale",  className: "bg-amber-500 text-black border-amber-400 font-bold" },
    alquiler:   { label: locale === "es" ? "Alquiler"   : "For Rent",  className: "bg-blue-700 text-white border-blue-600 font-semibold shadow-md" },
    vacacional: { label: locale === "es" ? "Vacacional" : "Vacation",  className: "bg-emerald-700 text-white border-emerald-600 font-semibold shadow-md" },
  } as Record<string, {label: string; className: string}>)[property.operation] ?? { label: property.operation, className: "bg-zinc-800 text-zinc-100 border-zinc-650" };

  const nivel2Badge = (() => {
    if (property.price_reduced) return { label: locale === "es" ? "Precio ↓" : "Price ↓",   className: "bg-rose-700 text-white border-rose-600 font-semibold shadow-md" };
    if (property.exclusive)     return { label: locale === "es" ? "Exclusiva" : "Exclusive", className: "bg-purple-700 text-white border-purple-600 font-semibold shadow-md" };
    if (property.featured)      return { label: locale === "es" ? "Destacada" : "Featured",  className: "bg-amber-600 text-white border-amber-500 font-semibold shadow-md" };
    if (property.new_listing)   return { label: locale === "es" ? "Nuevo"    : "New",        className: "bg-sky-700 text-white border-sky-600 font-semibold shadow-md" };
    return null;
  })();

  const statusBadge = property.status !== "activa" ? ({
    reservada: { label: locale === "es" ? "Reservada" : "Reserved", className: "bg-orange-600 text-white border-orange-500 font-semibold shadow-md" },
    vendida:   { label: locale === "es" ? "Vendida"   : "Sold",     className: "bg-zinc-800 text-white border-zinc-600 font-semibold shadow-md" },
    alquilada: { label: locale === "es" ? "Alquilada" : "Rented",   className: "bg-zinc-800 text-white border-zinc-600 font-semibold shadow-md" },
    cerrada:   { label: locale === "es" ? "Cerrada"   : "Closed",   className: "bg-zinc-800 text-white border-zinc-600 font-semibold shadow-md" },
  } as Record<string, {label: string; className: string}>)[property.status] ?? null : null;

  // --- FEATURED CARD DESIGN (index 0 / superimposed layout) ---
  if (isFeatured) {
    return (
      <motion.div
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ duration: 0.45, ease: EASE_EXPO }}
        className="h-full rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] transition-all duration-300 shadow-lg hover:shadow-2xl relative"
      >
        <Link href={`/${locale}/propiedades/${property.slug}`} className="block h-full group">
          <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full h-full flex flex-col overflow-hidden">
            
            {/* Cover Image */}
            {property.cover_image?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={property.cover_image.url}
                alt={property.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-radial from-zinc-800 to-zinc-950">
                <span className="text-[10px] tracking-widest text-[var(--accent)] font-semibold uppercase font-display mb-1">
                  Knordica
                </span>
              </div>
            )}

            {/* Gradient Overlay for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908]/95 via-[#0a0908]/40 to-transparent z-10 pointer-events-none" />

            {/* Action Buttons Container (Top Right) */}
            <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
              {/* Compare Button */}
              <button
                onClick={handleCompareClick}
                className={cn(
                  "h-8 w-8 rounded-sm flex items-center justify-center border transition-all cursor-pointer backdrop-blur-xs",
                  isComparedActive
                    ? "bg-[var(--accent)] text-black border-[var(--accent)] shadow-[0_0_8px_var(--accent)]"
                    : "bg-black/45 border border-white/15 text-white hover:bg-[var(--accent)] hover:text-black hover:border-[var(--accent)]"
                )}
                title={isComparedActive ? "Quitar de comparar" : "Comparar propiedad"}
              >
                <GitCompare className="h-3.5 w-3.5" />
              </button>

              {/* Favorite Button */}
              <button
                onClick={handleFavoriteClick}
                className={cn(
                  "h-8 w-8 rounded-sm flex items-center justify-center border transition-all cursor-pointer backdrop-blur-xs",
                  isFavoriteActive
                    ? "bg-red-500 text-white border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                    : "bg-black/45 border border-white/15 text-white hover:bg-red-500 hover:text-white hover:border-red-500"
                )}
                title={isFavoriteActive ? "Quitar de favoritos" : "Guardar en favoritos"}
              >
                <Heart className={cn("h-3.5 w-3.5", isFavoriteActive && "fill-current")} />
              </button>
            </div>

            {/* Badges container */}
            <div className="absolute top-2.5 left-2.5 z-20 flex flex-wrap gap-1.5 pointer-events-none">
              <span className={cn(badgeClass, operationBadge.className)}>
                {operationBadge.label}
              </span>
              {nivel2Badge && (
                <span className={cn(badgeClass, nivel2Badge.className)}>
                  {nivel2Badge.label}
                </span>
              )}
              {statusBadge && (
                <span className={cn(badgeClass, statusBadge.className)}>
                  {statusBadge.label}
                </span>
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
                <div className="flex items-center gap-1 text-[0.75rem] text-[#b3aaa0] font-body mt-2">
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
                <div className="flex flex-col items-start sm:items-end">
                  <div className="px-3 py-1.5 rounded-sm bg-[#0a0908]/85 backdrop-blur-[8px] border border-white/5 shadow-md">
                    <span className="text-xl font-bold text-white tracking-tight font-display drop-shadow-sm">
                      USD {property.price.toLocaleString("es-VE")}
                    </span>
                    {property.price_negotiable && (
                      <span className="ml-1.5 text-[0.55rem] font-mono text-[var(--accent)] uppercase tracking-wider align-middle">
                        {locale === 'es' ? 'negociable' : 'negotiable'}
                      </span>
                    )}
                  </div>
                  {/* Precio/m² */}
                  {property.price_per_m2 && (
                    <div className="text-[0.6rem] font-mono text-white/60 leading-none mt-1">
                      ${property.price_per_m2.toLocaleString()}/m²
                    </div>
                  )}
                </div>

                {/* Specs row */}
                <div className="flex items-center gap-2.5 text-[0.8rem] font-body font-medium text-[#f0ede8]">
                  <div className="flex items-center gap-1">
                    <BedDouble size={14} className="text-[#b3aaa0]" />
                    <span>{property.bedrooms ?? "-"}</span>
                  </div>
                  <span className="text-[#b3aaa0] text-[10px] select-none">·</span>
                  <div className="flex items-center gap-1">
                    <Bath size={14} className="text-[#b3aaa0]" />
                    <span>{property.bathrooms ?? "-"}</span>
                  </div>
                  <span className="text-[#b3aaa0] text-[10px] select-none">·</span>
                  <div className="flex items-center gap-1">
                    <Square size={14} className="text-[#b3aaa0]" />
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
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.45, ease: EASE_EXPO }}
      className="h-full rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] transition-all duration-300 shadow-md hover:shadow-2xl relative"
    >
      <Link href={`/${locale}/propiedades/${property.slug}`} className="block h-full group">
        <div className="h-full flex flex-col">
          {/* Image ratio 4:3 fixed */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900 rounded-t-lg">
            
            {/* Action Buttons Container (Top Right) */}
            <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
              {/* Compare Button */}
              <button
                onClick={handleCompareClick}
                className={cn(
                  "h-8 w-8 rounded-sm flex items-center justify-center border transition-all cursor-pointer backdrop-blur-xs",
                  isComparedActive
                    ? "bg-[var(--accent)] text-black border-[var(--accent)] shadow-[0_0_8px_var(--accent)]"
                    : "bg-black/45 border border-white/15 text-white hover:bg-[var(--accent)] hover:text-black hover:border-[var(--accent)]"
                )}
                title={isComparedActive ? "Quitar de comparar" : "Comparar propiedad"}
              >
                <GitCompare className="h-3.5 w-3.5" />
              </button>

              {/* Favorite Button */}
              <button
                onClick={handleFavoriteClick}
                className={cn(
                  "h-8 w-8 rounded-sm flex items-center justify-center border transition-all cursor-pointer backdrop-blur-xs",
                  isFavoriteActive
                    ? "bg-red-500 text-white border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                    : "bg-black/45 border border-white/15 text-white hover:bg-red-500 hover:text-white hover:border-red-500"
                )}
                title={isFavoriteActive ? "Quitar de favoritos" : "Guardar en favoritos"}
              >
                <Heart className={cn("h-3.5 w-3.5", isFavoriteActive && "fill-current")} />
              </button>
            </div>

            {/* Badges container */}
            <div className="absolute top-2.5 left-2.5 z-20 flex flex-wrap gap-1 pointer-events-none">
              <span className={cn(badgeClass, operationBadge.className)}>
                {operationBadge.label}
              </span>
              {nivel2Badge && (
                <span className={cn(badgeClass, nivel2Badge.className)}>
                  {nivel2Badge.label}
                </span>
              )}
              {statusBadge && (
                <span className={cn(badgeClass, statusBadge.className)}>
                  {statusBadge.label}
                </span>
              )}
            </div>

            {/* Price Badge absolute bottom left */}
            <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-0.5 pointer-events-none">
              <div className="px-3 py-1.5 rounded-sm bg-[#0a0908]/85 backdrop-blur-[8px] border border-white/5 shadow-md">
                <span className="text-xl font-bold text-white tracking-tight font-display drop-shadow-sm">
                  USD {property.price.toLocaleString("es-VE")}
                </span>
                {property.price_negotiable && (
                  <span className="ml-1.5 text-[0.55rem] font-mono text-[var(--accent)] uppercase tracking-wider align-middle">
                    {locale === 'es' ? 'negociable' : 'negotiable'}
                  </span>
                )}
              </div>
              {property.price_per_m2 && (
                <div className="text-[0.6rem] font-mono text-white/70 leading-none px-1">
                  ${property.price_per_m2.toLocaleString()}/m²
                </div>
              )}
            </div>

            {/* Cover Image */}
            {property.cover_image?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={property.cover_image.url}
                alt={property.title}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
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
              {/* Title */}
              <h4 className="font-display font-normal text-[0.95rem] text-[var(--text)] tracking-tight leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors duration-200">
                {property.title}
              </h4>

              {/* Construction status chip */}
              {property.construction_status && property.construction_status !== 'terminado' && (
                <div className="mt-1.5">
                  {property.construction_status === 'en_planos' && (
                    <span className="text-[0.6rem] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-blue-900/10 text-blue-500 border border-blue-500/20">
                      {locale === 'es' ? 'En planos' : 'Pre-sale'}
                    </span>
                  )}
                  {property.construction_status === 'en_construccion' && (
                    <span className="text-[0.6rem] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-amber-900/10 text-amber-500 border border-amber-500/20">
                      {locale === 'es' ? 'En construcción' : 'Under construction'}
                    </span>
                  )}
                  {property.construction_status === 'entrega_inmediata' && (
                    <span className="text-[0.6rem] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-emerald-900/10 text-emerald-500 border border-emerald-500/20">
                      {locale === 'es' ? 'Entrega inmediata' : 'Move-in ready'}
                    </span>
                  )}
                </div>
              )}

              {/* Zone / Location */}
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

            <div className="flex flex-col gap-2">
              {/* Specs row */}
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.8rem] font-body font-medium text-[var(--text-2)] border-t border-[var(--border)] pt-3.5">
                
                {property.bedrooms != null && (
                  <div className="flex items-center gap-1">
                    <BedDouble size={14} className="text-[var(--text-muted)]" />
                    <span>{property.bedrooms}</span>
                  </div>
                )}
                
                {property.bedrooms != null && property.bathrooms != null && (
                  <span className="text-[var(--text-muted)] text-[10px] select-none">·</span>
                )}
                
                {property.bathrooms != null && (
                  <div className="flex items-center gap-1">
                    <Bath size={14} className="text-[var(--text-muted)]" />
                    <span>{property.bathrooms}</span>
                  </div>
                )}
                
                {property.parking_spaces != null && property.parking_spaces > 0 && (
                  <>
                    <span className="text-[var(--text-muted)] text-[10px] select-none">·</span>
                    <div className="flex items-center gap-1">
                      <Car size={14} className="text-[var(--text-muted)]" />
                      <span>{property.parking_spaces}</span>
                    </div>
                  </>
                )}
                
                {(property.area_total ?? property.area_built) != null && (
                  <>
                    <span className="text-[var(--text-muted)] text-[10px] select-none">·</span>
                    <div className="flex items-center gap-1">
                      <Square size={14} className="text-[var(--text-muted)]" />
                      <span>{(property.area_total ?? property.area_built)} m²</span>
                    </div>
                  </>
                )}
              </div>

              {/* Mini amenidades */}
              {(() => {
                const amenities = ([
                  property.has_pool      && { icon: Waves,      label: locale === 'es' ? 'Piscina' : 'Pool' },
                  property.has_generator && { icon: Zap,        label: locale === 'es' ? 'Planta' : 'Generator' },
                  property.has_security  && { icon: Shield,     label: locale === 'es' ? 'Seguridad' : 'Security' },
                  property.has_elevator  && { icon: ArrowUpDown,label: locale === 'es' ? 'Ascensor' : 'Elevator' },
                  property.has_ac        && { icon: Wind,       label: locale === 'es' ? 'A/C' : 'A/C' },
                  property.allows_pets   && { icon: PawPrint,   label: locale === 'es' ? 'Mascotas' : 'Pets OK' },
                  property.furnished     && { icon: Sofa,       label: locale === 'es' ? 'Amoblado' : 'Furnished' },
                ].filter(Boolean) as { icon: any; label: string }[]).slice(0, 5);

                if (amenities.length === 0) return null;

                return (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[var(--border)]/40">
                    {amenities.map((a, i) => {
                      const Icon = a!.icon;
                      return (
                        <div
                          key={i}
                          title={a!.label}
                          className="flex items-center gap-1 text-[0.65rem] text-[var(--text-muted)] font-body 
                            px-1.5 py-0.5 rounded-sm border border-[var(--border)] bg-[var(--surface-1)]"
                        >
                          <Icon size={10} className="shrink-0" />
                          <span>{a!.label}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
