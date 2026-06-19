"use client";

import Link from "next/link";
import { GitCompare, X, Eye, ArrowRightLeft, Square, BedDouble, Bath, Car } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useComparatorStore } from "@/store/comparator.store";
import { useLocale } from "@/components/layout/LocaleProvider";

export default function PropertyComparator() {
  const { locale, dict } = useLocale();
  const { selectedProperties, removeProperty, clearComparator } = useComparatorStore();

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

  const formattedPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (selectedProperties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 px-6 border border-[var(--border)] rounded-sm bg-[var(--surface)]/30 glass max-w-xl mx-auto">
        <GitCompare className="h-12 w-12 text-[var(--text-muted)] mb-5" />
        <h3 className="font-display font-bold text-lg text-[var(--text)] mb-2">
          {locale === "es" ? "Comparador de propiedades vacío" : "Property Comparator is Empty"}
        </h3>
        <p className="text-xs md:text-sm text-[var(--text-2)] font-light leading-relaxed mb-8">
          {locale === "es"
            ? "Navega en el catálogo de propiedades y presiona el ícono de comparación en las tarjetas para añadir hasta 3 listados."
            : "Browse the property catalog and click the comparison icon on the cards to add up to 3 listings."}
        </p>
        <Link href={`/${locale}/propiedades`}>
          <Button variant="primary" size="sm">
            {locale === "es" ? "Explorar Propiedades" : "Explore Properties"}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Action Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
        <p className="text-xs text-[var(--text-2)] font-light font-mono">
          {locale === "es"
            ? `Comparando ${selectedProperties.length} de 3 propiedades máximo`
            : `Comparing ${selectedProperties.length} of 3 properties max`}
        </p>
        <button
          onClick={clearComparator}
          className="text-[10px] font-display font-semibold uppercase tracking-wider text-[var(--danger)] hover:underline cursor-pointer"
        >
          {locale === "es" ? "Limpiar comparador" : "Clear list"}
        </button>
      </div>

      {/* Comparison Grid Table */}
      <div className="overflow-x-auto border border-[var(--border)] rounded-sm bg-[var(--surface)]/50 glass">
        <table className="w-full min-w-[600px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--background-alt)]/50">
              <th className="p-4 font-display font-bold uppercase tracking-wider text-[var(--text-muted)] text-[10px] w-1/4">
                {locale === "es" ? "Características" : "Specs"}
              </th>
              {selectedProperties.map((p) => (
                <th key={p.id} className="p-4 relative w-1/4 group border-l border-[var(--border)]">
                  {/* Remove Button */}
                  <button
                    onClick={() => removeProperty(p.id)}
                    className="absolute top-2 right-2 h-6 w-6 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-2)] hover:text-[var(--danger)] flex items-center justify-center cursor-pointer transition-colors"
                    title={locale === "es" ? "Quitar" : "Remove"}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>

                  {/* Thumbnail Card */}
                  <div className="mt-4 flex flex-col gap-3">
                    <div className="aspect-[16/10] w-full rounded-sm overflow-hidden bg-zinc-900 border border-[var(--border)]">
                      {p.cover_image?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.cover_image.url} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-mono text-[9px] text-[var(--text-muted)]">
                          NO IMAGE
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-[var(--accent)] font-semibold font-display">
                        {p.operation}
                      </span>
                      <h4 className="font-display font-bold text-sm text-[var(--text)] line-clamp-1 mt-0.5">
                        {p.title}
                      </h4>
                      <p className="font-bold text-[var(--gold)] mt-1">{formattedPrice(p.price, p.price_currency)}</p>
                    </div>
                  </div>
                </th>
              ))}
              {/* Fill remaining space to match 3 columns if needed */}
              {selectedProperties.length < 3 &&
                Array.from({ length: 3 - selectedProperties.length }).map((_, idx) => (
                  <th key={idx} className="p-4 border-l border-[var(--border)] bg-zinc-950/20 text-center w-1/4">
                    <div className="h-full flex flex-col items-center justify-center py-12 text-[var(--text-muted)] font-mono text-[10px] tracking-wider select-none">
                      <ArrowRightLeft className="h-6 w-6 opacity-30 mb-2" />
                      <span>{locale === "es" ? "Vacío" : "Empty Slot"}</span>
                    </div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] text-[var(--text-2)]">
            {/* Tipo de Propiedad */}
            <tr>
              <td className="p-4 font-semibold font-display text-[var(--text)]">
                {locale === "es" ? "Tipo de inmueble" : "Property Type"}
              </td>
              {selectedProperties.map((p) => (
                <td key={p.id} className="p-4 border-l border-[var(--border)]">
                  {getPropertyTypeLabel(p.property_type)}
                </td>
              ))}
              {selectedProperties.length < 3 &&
                Array.from({ length: 3 - selectedProperties.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-[var(--border)] bg-zinc-950/10"></td>
                ))}
            </tr>

            {/* Zona */}
            <tr>
              <td className="p-4 font-semibold font-display text-[var(--text)]">
                {locale === "es" ? "Ubicación / Sector" : "Zone / Neighborhood"}
              </td>
              {selectedProperties.map((p) => (
                <td key={p.id} className="p-4 border-l border-[var(--border)]">
                  {p.zone ? (locale === "es" ? p.zone.name_es : p.zone.name_en) : "Mérida"}
                </td>
              ))}
              {selectedProperties.length < 3 &&
                Array.from({ length: 3 - selectedProperties.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-[var(--border)] bg-zinc-950/10"></td>
                ))}
            </tr>

            {/* Área Total */}
            <tr>
              <td className="p-4 font-semibold font-display text-[var(--text)]">
                {locale === "es" ? "Área de Terreno / Total" : "Total Area"}
              </td>
              {selectedProperties.map((p) => (
                <td key={p.id} className="p-4 border-l border-[var(--border)] font-mono">
                  {p.area_total ? `${p.area_total} m²` : "-"}
                </td>
              ))}
              {selectedProperties.length < 3 &&
                Array.from({ length: 3 - selectedProperties.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-[var(--border)] bg-zinc-950/10"></td>
                ))}
            </tr>

            {/* Área Construida */}
            <tr>
              <td className="p-4 font-semibold font-display text-[var(--text)]">
                {locale === "es" ? "Área de Construcción" : "Built Area"}
              </td>
              {selectedProperties.map((p) => (
                <td key={p.id} className="p-4 border-l border-[var(--border)] font-mono">
                  {p.area_built ? `${p.area_built} m²` : "-"}
                </td>
              ))}
              {selectedProperties.length < 3 &&
                Array.from({ length: 3 - selectedProperties.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-[var(--border)] bg-zinc-950/10"></td>
                ))}
            </tr>

            {/* Habitaciones */}
            <tr>
              <td className="p-4 font-semibold font-display text-[var(--text)]">
                {locale === "es" ? "Habitaciones" : "Bedrooms"}
              </td>
              {selectedProperties.map((p) => (
                <td key={p.id} className="p-4 border-l border-[var(--border)]">
                  {p.bedrooms !== null ? (
                    <div className="flex items-center gap-1.5">
                      <BedDouble className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                      <span>{p.bedrooms}</span>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
              ))}
              {selectedProperties.length < 3 &&
                Array.from({ length: 3 - selectedProperties.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-[var(--border)] bg-zinc-950/10"></td>
                ))}
            </tr>

            {/* Baños */}
            <tr>
              <td className="p-4 font-semibold font-display text-[var(--text)]">
                {locale === "es" ? "Baños" : "Bathrooms"}
              </td>
              {selectedProperties.map((p) => (
                <td key={p.id} className="p-4 border-l border-[var(--border)]">
                  {p.bathrooms !== null ? (
                    <div className="flex items-center gap-1.5">
                      <Bath className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                      <span>{p.bathrooms}</span>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
              ))}
              {selectedProperties.length < 3 &&
                Array.from({ length: 3 - selectedProperties.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-[var(--border)] bg-zinc-950/10"></td>
                ))}
            </tr>

            {/* Puestos de estacionamiento */}
            <tr>
              <td className="p-4 font-semibold font-display text-[var(--text)]">
                {locale === "es" ? "Estacionamientos" : "Parking Spaces"}
              </td>
              {selectedProperties.map((p) => (
                <td key={p.id} className="p-4 border-l border-[var(--border)]">
                  {p.parking_spaces !== null ? (
                    <div className="flex items-center gap-1.5">
                      <Car className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                      <span>{p.parking_spaces}</span>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
              ))}
              {selectedProperties.length < 3 &&
                Array.from({ length: 3 - selectedProperties.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-[var(--border)] bg-zinc-950/10"></td>
                ))}
            </tr>

            {/* Ficha de Detalles */}
            <tr>
              <td className="p-4 font-semibold font-display text-[var(--text)]">
                {locale === "es" ? "Acción" : "Actions"}
              </td>
              {selectedProperties.map((p) => (
                <td key={p.id} className="p-4 border-l border-[var(--border)]">
                  <Link href={`/${locale}/propiedades/${p.slug}`}>
                    <Button variant="outline" size="sm" className="h-8 text-[10px] w-full flex items-center justify-center gap-1.5">
                      <Eye className="h-3 w-3" />
                      <span>{locale === "es" ? "Ver propiedad" : "View property"}</span>
                    </Button>
                  </Link>
                </td>
              ))}
              {selectedProperties.length < 3 &&
                Array.from({ length: 3 - selectedProperties.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-[var(--border)] bg-zinc-950/10"></td>
                ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
