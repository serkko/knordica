"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BedDouble, Bath, Square, MapPin, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useLocale } from "@/components/layout/LocaleProvider";
import { formatPrice, formatArea } from "@/lib/utils/format";
import type { PropertyCard as PropertyCardType } from "@/types/property";

interface PropertyListProps {
  properties: PropertyCardType[];
}

export function PropertyList({ properties }: PropertyListProps) {
  const { locale, dict } = useLocale();

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 w-full"
    >
      {properties.map((property) => {
        const formattedPrice = formatPrice(property.price, property.price_currency, locale);
        const formattedArea = formatArea(property.area_total ?? property.area_built, locale);

        return (
          <motion.div key={property.id} variants={itemVariants} className="w-full">
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <Card className="overflow-hidden border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] transition-all flex flex-col md:flex-row h-auto md:h-[220px] group">
                {/* Left Side: Image */}
                <div className="relative w-full md:w-[280px] h-[200px] md:h-full shrink-0 overflow-hidden bg-zinc-900">
                  {/* Status Badges */}
                  <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5">
                    <Badge variant={property.operation === "venta" ? "gold" : "accent"}>
                      {property.operation === "venta"
                        ? dict.property?.operation?.venta || "Venta"
                        : dict.property?.operation?.alquiler || "Alquiler"}
                    </Badge>
                  </div>

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
                    </div>
                  )}
                </div>

                {/* Right Side: Content */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="flex flex-col gap-2">
                    {/* Zone & Pin */}
                    <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] font-medium">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>
                        {property.zone
                          ? locale === "es"
                            ? property.zone.name_es
                            : property.zone.name_en
                          : "Mérida"}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg md:text-xl font-bold font-display tracking-tight text-[var(--text)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                        <Link href={`/${locale}/propiedades/${property.slug}`}>
                          {property.title}
                        </Link>
                      </h3>
                      <span className="text-xl font-bold font-display text-[var(--gold)] shrink-0 hidden md:inline">
                        {formattedPrice}
                      </span>
                    </div>

                    {/* Excerpt */}
                    {property.short_description && (
                      <p className="text-xs md:text-sm text-[var(--text-2)] line-clamp-2 font-light leading-relaxed">
                        {property.short_description}
                      </p>
                    )}
                  </div>

                  {/* Actions & Metrics row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-4 mt-4">
                    {/* Metrics */}
                    <div className="flex gap-4 text-[var(--text-2)] text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <BedDouble className="h-4 w-4 text-[var(--text-muted)]" />
                        <span>
                          {property.bedrooms ?? "-"} {dict.property?.features?.habitaciones || "hab"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bath className="h-4 w-4 text-[var(--text-muted)]" />
                        <span>
                          {property.bathrooms ?? "-"} {dict.property?.features?.banos || "baños"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Square className="h-4 w-4 text-[var(--text-muted)]" />
                        <span>{formattedArea}</span>
                      </div>
                    </div>

                    {/* Price in Mobile & Action Link */}
                    <div className="flex items-center justify-between w-full md:w-auto mt-2 md:mt-0 gap-4">
                      <span className="text-lg font-bold font-display text-[var(--gold)] md:hidden">
                        {formattedPrice}
                      </span>
                      <Link
                        href={`/${locale}/propiedades/${property.slug}`}
                        className="text-xs font-semibold uppercase tracking-wider font-display text-[var(--text-2)] hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>{dict.common?.verMas || "Ver más"}</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
