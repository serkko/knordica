"use client";

import { useLocale } from "@/components/layout/LocaleProvider";
import { PropertyCard } from "./PropertyCard";
import type { PropertyCard as PropertyCardType } from "@/types/property";

interface RelatedPropertiesProps {
  properties: PropertyCardType[];
  currentPropertyId: string;
}

export function RelatedProperties({ properties, currentPropertyId }: RelatedPropertiesProps) {
  const { dict } = useLocale();

  // Filter out the current active property
  const filtered = properties
    .filter((p) => p.id !== currentPropertyId)
    .slice(0, 3);

  if (filtered.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 pt-12 border-t border-[var(--border)]">
      <h3 className="text-xl md:text-2xl font-bold font-display tracking-tight text-[var(--text)]">
        {dict.property?.detail?.similares || "Propiedades similares"}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
        {filtered.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
