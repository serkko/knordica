"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BedDouble, Bath, Square, MapPin, GitCompare, 
  Car, Waves, Zap, Shield, Wind, PawPrint, Sofa, ArrowUpDown 
} from "lucide-react";
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

  // 3D Tilt interactive animation state
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    const rX = -(mouseY / height) * 12; // 12 degrees max tilt
    const rY = (mouseX / width) * 12;
    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

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
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: "preserve-3d",
          perspective: 1000
        }}
        animate={{
          rotateX,
          rotateY,
          scale: rotateX !== 0 || rotateY !== 0 ? 1.025 : 1,
          boxShadow: rotateX !== 0 || rotateY !== 0
            ? "0 30px 70px rgba(0,0,0,0.55), 0 0 35px var(--accent-glow)"
            : "0 4px 12px rgba(0,0,0,0.15)"
        }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
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
                "absolute top-4 right-4 z-20 h-8 w-8 rounded-sm flex items-center justify-center border transition-all cursor-pointer backdrop-blur-xs",
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
                  : property.operation === "alquiler"
                  ? dict.property?.operation?.alquiler || "Alquiler"
                  : locale === "es" ? "Vacacional" : "Vacation"}
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

              {/* Badge Nuevo Ingreso */}
              {property.new_listing && (
                <div className={cn(badgeTextClass, "px-2 py-1 rounded-sm bg-emerald-600/90 text-white backdrop-blur-[8px]")}>
                  {locale === 'es' ? 'Nuevo' : 'New'}
                </div>
              )}

              {/* Badge Precio Reducido */}
              {property.price_reduced && (
                <div className={cn(badgeTextClass, "px-2 py-1 rounded-sm bg-rose-700/90 text-white backdrop-blur-[8px]")}>
                  {locale === 'es' ? 'Precio ↓' : 'Price ↓'}
                </div>
              )}

              {/* Badge listing_badge texto libre */}
              {property.listing_badge && (
                <div className={cn(badgeTextClass, "px-2 py-1 rounded-sm bg-[var(--accent)]/90 text-black backdrop-blur-[8px]")}>
                  {property.listing_badge}
                </div>
              )}

              {/* Badge reservada/vendida/alquilada */}
              {property.status === 'reservada' && (
                <div className={cn(badgeTextClass, "px-2 py-1 rounded-sm bg-amber-700/90 text-white backdrop-blur-[8px]")}>
                  {locale === 'es' ? 'Reservada' : 'Reserved'}
                </div>
              )}
              {property.status === 'vendida' && (
                <div className={cn(badgeTextClass, "px-2 py-1 rounded-sm bg-red-900/90 text-white/80 backdrop-blur-[8px]")}>
                  {locale === 'es' ? 'Vendida' : 'Sold'}
                </div>
              )}
              {property.status === 'alquilada' && (
                <div className={cn(badgeTextClass, "px-2 py-1 rounded-sm bg-blue-800/90 text-white/80 backdrop-blur-[8px]")}>
                  {locale === 'es' ? 'Alquilada' : 'Rented'}
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
                <div className="flex flex-col items-start sm:items-end">
                  <div className="px-3 py-1.5 rounded-sm bg-[#0a0908]/85 backdrop-blur-[8px] font-display font-semibold text-[1.1rem] text-[#f0ede8] shadow-md">
                    {formattedPrice}
                    {property.price_negotiable && (
                      <span className="ml-1.5 text-[0.55rem] font-mono text-[var(--accent)] uppercase tracking-wider align-middle">
                        {locale === 'es' ? 'negociable' : 'negotiable'}
                      </span>
                    )}
                  </div>
                  {/* Precio/m² — solo si existe */}
                  {property.price_per_m2 && (
                    <div className="text-[0.6rem] font-mono text-white/50 leading-none mt-0.5">
                      ${property.price_per_m2.toLocaleString()}/m²
                    </div>
                  )}
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
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
      animate={{
        rotateX,
        rotateY,
        scale: rotateX !== 0 || rotateY !== 0 ? 1.025 : 1,
        boxShadow: rotateX !== 0 || rotateY !== 0
          ? "0 30px 70px rgba(0,0,0,0.55), 0 0 35px var(--accent-glow)"
          : "0 4px 12px rgba(0,0,0,0.15)"
      }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
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
                "absolute top-4 right-4 z-20 h-8 w-8 rounded-sm flex items-center justify-center border transition-all cursor-pointer backdrop-blur-xs",
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
                  : property.operation === "alquiler"
                  ? dict.property?.operation?.alquiler || "Alquiler"
                  : locale === "es" ? "Vacacional" : "Vacation"}
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

              {/* Badge Nuevo Ingreso */}
              {property.new_listing && (
                <div className={cn(badgeTextClass, "px-2 py-1 rounded-sm bg-emerald-600/90 text-white backdrop-blur-[8px]")}>
                  {locale === 'es' ? 'Nuevo' : 'New'}
                </div>
              )}

              {/* Badge Precio Reducido */}
              {property.price_reduced && (
                <div className={cn(badgeTextClass, "px-2 py-1 rounded-sm bg-rose-700/90 text-white backdrop-blur-[8px]")}>
                  {locale === 'es' ? 'Precio ↓' : 'Price ↓'}
                </div>
              )}

              {/* Badge listing_badge texto libre */}
              {property.listing_badge && (
                <div className={cn(badgeTextClass, "px-2 py-1 rounded-sm bg-[var(--accent)]/90 text-black backdrop-blur-[8px]")}>
                  {property.listing_badge}
                </div>
              )}

              {/* Badge reservada/vendida/alquilada */}
              {property.status === 'reservada' && (
                <div className={cn(badgeTextClass, "px-2 py-1 rounded-sm bg-amber-700/90 text-white backdrop-blur-[8px]")}>
                  {locale === 'es' ? 'Reservada' : 'Reserved'}
                </div>
              )}
              {property.status === 'vendida' && (
                <div className={cn(badgeTextClass, "px-2 py-1 rounded-sm bg-red-900/90 text-white/80 backdrop-blur-[8px]")}>
                  {locale === 'es' ? 'Vendida' : 'Sold'}
                </div>
              )}
              {property.status === 'alquilada' && (
                <div className={cn(badgeTextClass, "px-2 py-1 rounded-sm bg-blue-800/90 text-white/80 backdrop-blur-[8px]")}>
                  {locale === 'es' ? 'Alquilada' : 'Rented'}
                </div>
              )}
            </div>

            {/* Price Badge absolute bottom left flex layout */}
            <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-0.5">
              <div className="px-3 py-1.5 rounded-sm bg-[#0a0908]/85 backdrop-blur-[8px] font-display font-semibold text-[1.1rem] text-[#f0ede8] shadow-md">
                {formattedPrice}
                {property.price_negotiable && (
                  <span className="ml-1.5 text-[0.55rem] font-mono text-[var(--accent)] uppercase tracking-wider align-middle">
                    {locale === 'es' ? 'negociable' : 'negotiable'}
                  </span>
                )}
              </div>
              {property.price_per_m2 && (
                <div className="text-[0.6rem] font-mono text-white/45 leading-none px-1">
                  ${property.price_per_m2.toLocaleString()}/m²
                </div>
              )}
            </div>

            {/* 3D Glass shimmer overlay */}
            <div 
              className="absolute inset-0 pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.08) 100%)"
              }}
            />

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

              {/* Construction status chip */}
              {property.construction_status && property.construction_status !== 'terminado' && (
                <div className="mt-1">
                  {property.construction_status === 'en_planos' && (
                    <span className="text-[0.6rem] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-blue-900/40 text-blue-400 border border-blue-800/50">
                      {locale === 'es' ? 'En planos' : 'Pre-sale'}
                    </span>
                  )}
                  {property.construction_status === 'en_construccion' && (
                    <span className="text-[0.6rem] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-amber-900/40 text-amber-400 border border-amber-800/50">
                      {locale === 'es' ? 'En construcción' : 'Under construction'}
                    </span>
                  )}
                  {property.construction_status === 'entrega_inmediata' && (
                    <span className="text-[0.6rem] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-emerald-900/40 text-emerald-400 border border-emerald-800/50">
                      {locale === 'es' ? 'Entrega inmediata' : 'Move-in ready'}
                    </span>
                  )}
                </div>
              )}

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

              {/* Mini amenidades — solo las más premium, máximo 5 iconos */}
              {(() => {
                const amenities = ([
                  property.has_pool      && { icon: Waves,      label: locale === 'es' ? 'Piscina' : 'Pool' },
                  property.has_generator && { icon: Zap,        label: locale === 'es' ? 'Planta' : 'Generator' },
                  property.has_security  && { icon: Shield,     label: locale === 'es' ? 'Seguridad' : 'Security' },
                  property.has_elevator  && { icon: ArrowUpDown,label: locale === 'es' ? 'Ascensor' : 'Elevator' },
                  property.has_ac        && { icon: Wind,       label: locale === 'es' ? 'A/C' : 'A/C' },
                  property.allows_pets   && { icon: PawPrint,   label: locale === 'es' ? 'Mascotas' : 'Pets OK' },
                  property.furnished     && { icon: Sofa,       label: locale === 'es' ? 'Amueblado' : 'Furnished' },
                ].filter(Boolean) as { icon: any; label: string }[]).slice(0, 5);

                if (amenities.length === 0) return null;

                return (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border)]/40">
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
