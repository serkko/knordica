"use client";

import Link from "next/link";
import { BedDouble, Bath, Square, MapPin, ArrowUpRight, GitCompare } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useLocale } from "@/components/layout/LocaleProvider";
import { useComparatorStore } from "@/store/comparator.store";
import type { PropertyCard as PropertyCardType } from "@/types/property";

interface PropertyCardProps {
  property: PropertyCardType;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { locale, dict } = useLocale();
  const { addProperty, removeProperty, isCompared } = useComparatorStore();
  const compared = isCompared(property.id);

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

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Link href={`/${locale}/propiedades/${property.slug}`} className="block h-full">
        <Card className="h-full flex flex-col overflow-hidden group border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] transition-all">
          {/* Card Image Wrapper */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
            {/* Compare Button */}
            <button
              onClick={handleCompareClick}
              className={`absolute top-4 right-4 z-10 h-8 w-8 rounded-full flex items-center justify-center border transition-all cursor-pointer backdrop-blur-xs ${
                compared
                  ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-[0_0_8px_var(--accent)]"
                  : "bg-black/50 text-white/70 border-white/20 hover:text-white hover:border-white hover:bg-black/75"
              }`}
              title={compared ? "Quitar de comparar" : "Comparar propiedad"}
            >
              <GitCompare className="h-4 w-4" />
            </button>

            {/* Status Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5">
              <Badge variant={property.operation === "venta" ? "gold" : "accent"}>
                {property.operation === "venta"
                  ? dict.property?.operation?.venta || "Venta"
                  : dict.property?.operation?.alquiler || "Alquiler"}
              </Badge>

              {property.exclusive && (
                <Badge variant="accent">
                  {dict.property?.badge?.exclusiva || "Exclusiva"}
                </Badge>
              )}

              {property.new_listing && (
                <Badge variant="success">
                  {dict.property?.badge?.nueva || "Nueva"}
                </Badge>
              )}
            </div>

            {/* Placeholder/Actual image */}
            {property.cover_image?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={property.cover_image.url}
                alt={property.title}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            ) : (
              // Default Geometric Placeholder
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-radial from-zinc-800 to-zinc-950">
                <span className="text-[10px] tracking-widest text-[var(--accent)] font-semibold uppercase font-display mb-1">
                  Knordica
                </span>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  {getPropertyTypeLabel(property.property_type)}
                </span>
                <div className="absolute bottom-4 right-4 h-6 w-6 border border-[var(--border-strong)] rounded-full flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:border-[var(--accent)] transition-colors">
                  <ArrowUpRight className="h-3 w-3" />
                </div>
              </div>
            )}
          </div>

          {/* Card Body */}
          <div className="flex-1 p-5 flex flex-col justify-between">
            <div>
              {/* Zone and Location */}
              <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] font-medium mb-2.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {property.zone
                    ? locale === "es"
                      ? property.zone.name_es
                      : property.zone.name_en
                    : "Mérida"}
                </span>
              </div>

              {/* Title */}
              <h4 className="text-base font-bold text-[var(--text)] tracking-tight leading-snug mb-2 font-display group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                {property.title}
              </h4>

              {/* Description */}
              {property.short_description && (
                <p className="text-xs text-[var(--text-2)] line-clamp-2 mb-4 leading-relaxed font-light">
                  {property.short_description}
                </p>
              )}
            </div>

            <div>
              {/* Features Row */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-[var(--border)] mb-4 text-[var(--text-2)] text-xs">
                <div className="flex items-center gap-1.5 justify-center">
                  <BedDouble className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <span>
                    {property.bedrooms ?? "-"} {dict.property?.features?.habitaciones || "hab"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 justify-center">
                  <Bath className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <span>
                    {property.bathrooms ?? "-"} {dict.property?.features?.banos || "baños"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 justify-center">
                  <Square className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <span>
                    {property.area_total ?? property.area_built ?? "-"}{" "}
                    {dict.property?.features?.area || "m²"}
                  </span>
                </div>
              </div>

              {/* Price & Details Link */}
              <div className="flex items-center justify-between mt-2 pt-1">
                <span className="text-lg font-bold font-display text-[var(--gold)]">
                  {formattedPrice}
                </span>
                <div
                  className="text-xs font-semibold uppercase tracking-wider font-display text-[var(--text-2)] group-hover:text-[var(--accent)] transition-colors flex items-center gap-1"
                >
                  <span>{dict.common?.verMas || "Ver más"}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
