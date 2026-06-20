"use client";

import { useState } from "react";
import { BedDouble, Bath, Square, Car, MapPin, MessageCircle, Mail, Calendar, Sparkles } from "lucide-react";
import { useLocale } from "@/components/layout/LocaleProvider";
import { formatPrice, formatArea } from "@/lib/utils/format";
import { LeadForm } from "@/components/forms/LeadForm";
import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { PropertyGallery } from "./PropertyGallery";
import { PropertyShare } from "./PropertyShare";
import type { Property } from "@/types/property";

interface PropertyDetailProps {
  property: Property;
}

export function PropertyDetail({ property }: PropertyDetailProps) {
  const { locale, dict } = useLocale();
  const [activeTab, setActiveTab] = useState<"contact" | "visit">("contact");

  const trans = property.translations?.find((t) => t.locale === locale) ||
    property.translations?.[0] || {
      title: property.slug,
      description: "",
      short_description: "",
    };

  const formattedPrice = formatPrice(property.price, property.price_currency, locale);
  const formattedAreaBuilt = formatArea(property.area_built, locale);

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

  const getFeatureIcon = (iconName: string | null) => {
    switch (iconName) {
      case "cloud": return <Sparkles className="h-4 w-4 text-[var(--accent)]" />;
      default: return <Sparkles className="h-4 w-4 text-[var(--accent)]" />;
    }
  };

  // WhatsApp connection config
  const whatsappNumber = property.agent?.whatsapp || "584122423334";
  const whatsappMessage = encodeURIComponent(
    locale === "es"
      ? `Hola ${property.agent?.full_name || "asesor"}, estoy interesado en la propiedad: ${trans.title} (${formattedPrice}).`
      : `Hello ${property.agent?.full_name || "advisor"}, I am interested in the property: ${trans.title} (${formattedPrice}).`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="flex flex-col gap-8">
      {/* Dynamic Gallery */}
      <PropertyGallery images={property.images || []} title={trans.title} />

      {/* Grid Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side (65% width equivalent in 12-col grid = col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Header titles and Share */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[rgba(255,255,255,0.08)]">
            <div className="flex flex-col gap-2">
              {/* Operation type & Tag */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-semibold font-display px-2 py-0.5 rounded-sm bg-[var(--accent-dim)] border border-[var(--border-accent)]">
                  {property.operation === "venta"
                    ? dict.property?.operation?.venta || "Venta"
                    : dict.property?.operation?.alquiler || "Alquiler"}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  {getPropertyTypeLabel(property.property_type)}
                </span>
              </div>

              {/* Title (SEO h1) */}
              <h1 className="text-2xl md:text-[2rem] font-light font-display tracking-tight text-[var(--text)] leading-snug" style={{ letterSpacing: "-0.03em" }}>
                {trans.title}
              </h1>

              {/* Location pin */}
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-2)] font-light">
                <MapPin className="h-4 w-4 text-[var(--text-muted)]" />
                <span>
                  {locale === "es"
                    ? property.address_es || property.zone?.name_es
                    : property.address_en || property.zone?.name_en}
                </span>
              </div>
            </div>

            {/* Share and Action */}
            <div className="shrink-0 flex sm:flex-col items-start sm:items-end gap-2">
              <span className="text-2xl md:text-[1.8rem] font-semibold font-display text-[var(--accent)] tracking-tight">
                {formattedPrice}
              </span>
              <PropertyShare slug={property.slug} title={trans.title} />
            </div>
          </div>

          {/* Features Row Grid (2x2) */}
          <div className="grid grid-cols-2 gap-6 p-6 border border-[rgba(255,255,255,0.08)] bg-[var(--surface-1)] rounded-xl">
            {/* Rooms */}
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 border border-[rgba(255,255,255,0.08)] rounded-full flex items-center justify-center text-[var(--text-2)] shrink-0 bg-[var(--surface-2)]">
                <BedDouble className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[0.65rem] uppercase tracking-wider text-[var(--text-muted)] font-medium font-body">
                  {locale === "es" ? "Habitaciones" : "Bedrooms"}
                </span>
                <span className="text-[1.4rem] font-medium font-display text-[var(--text)] mt-0.5 leading-none">
                  {property.bedrooms ?? "-"}
                </span>
              </div>
            </div>

            {/* Baths */}
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 border border-[rgba(255,255,255,0.08)] rounded-full flex items-center justify-center text-[var(--text-2)] shrink-0 bg-[var(--surface-2)]">
                <Bath className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[0.65rem] uppercase tracking-wider text-[var(--text-muted)] font-medium font-body">
                  {locale === "es" ? "Baños" : "Bathrooms"}
                </span>
                <span className="text-[1.4rem] font-medium font-display text-[var(--text)] mt-0.5 leading-none">
                  {property.bathrooms ?? "-"}
                </span>
              </div>
            </div>

            {/* Area */}
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 border border-[rgba(255,255,255,0.08)] rounded-full flex items-center justify-center text-[var(--text-2)] shrink-0 bg-[var(--surface-2)]">
                <Square className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[0.65rem] uppercase tracking-wider text-[var(--text-muted)] font-medium font-body">
                  {locale === "es" ? "Área construida" : "Built area"}
                </span>
                <span className="text-[1.4rem] font-medium font-display text-[var(--text)] mt-0.5 leading-none">
                  {formattedAreaBuilt}
                </span>
              </div>
            </div>

            {/* Parking */}
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 border border-[rgba(255,255,255,0.08)] rounded-full flex items-center justify-center text-[var(--text-2)] shrink-0 bg-[var(--surface-2)]">
                <Car className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[0.65rem] uppercase tracking-wider text-[var(--text-muted)] font-medium font-body">
                  {locale === "es" ? "Estacionamientos" : "Parking"}
                </span>
                <span className="text-[1.4rem] font-medium font-display text-[var(--text)] mt-0.5 leading-none">
                  {property.parking_spaces ?? "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-3 my-2">
            <h3 className="text-lg font-bold font-display tracking-tight text-[var(--text)]">
              {dict.property?.detail?.descripcion || "Descripción"}
            </h3>
            <p className="text-sm md:text-base text-[var(--text-2)] leading-relaxed font-light whitespace-pre-line max-w-[60ch]">
              {trans.description || trans.short_description || (locale === "es" ? "Sin descripción disponible." : "No description available.")}
            </p>
          </div>

          {/* Technical features & details */}
          {property.features && property.features.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-[rgba(255,255,255,0.08)] pt-6">
              <h3 className="text-lg font-bold font-display tracking-tight text-[var(--text)]">
                {dict.property?.detail?.caracteristicas || "Detalles adicionales"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {property.features.map((feat) => (
                  <div key={feat.id} className="flex items-center gap-2 text-sm text-[var(--text-2)] font-light">
                    {getFeatureIcon(feat.icon)}
                    <span className="font-semibold">{locale === "es" ? feat.key : feat.key}:</span>
                    <span>{locale === "es" ? feat.value_es : feat.value_en}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map Section */}
          <div className="flex flex-col gap-4 border-t border-[rgba(255,255,255,0.08)] pt-6">
            <h3 className="text-lg font-bold font-display tracking-tight text-[var(--text)]">
              {dict.property?.detail?.ubicacion || "Ubicación"}
            </h3>
            <div className="h-[280px] w-full border border-[rgba(255,255,255,0.08)] rounded-lg overflow-hidden bg-[var(--surface-2)] relative">
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,var(--border-strong)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-strong)_1px,transparent_1px)] bg-[size:16px_16px]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <MapPin className="h-8 w-8 text-[var(--accent)] mb-2" />
                <p className="text-sm font-bold text-[var(--text)]">
                  {locale === "es" ? property.address_es : property.address_en}
                </p>
                <p className="text-[10px] font-mono text-[var(--text-muted)] mt-1">
                  [ LAT: {property.lat || "8.59"} | LNG: {property.lng || "-71.14"} ]
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side (Sticky Agent panel, 35% width equivalent = col-span-4) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-6">
          {/* Agent info summary card */}
          <div className="p-6 border border-[rgba(255,255,255,0.08)] bg-[var(--surface-2)] rounded-xl flex flex-col gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              {/* Avatar placeholder */}
              <div className="h-12 w-12 rounded-full border border-[rgba(255,255,255,0.08)] bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--accent)] font-display font-semibold shrink-0">
                {property.agent?.full_name ? property.agent.full_name[0] : "A"}
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-wider text-[var(--text-muted)] font-medium font-body">
                  {locale === "es" ? "Asesor asignado" : "Assigned Advisor"}
                </p>
                <h4 className="text-base font-semibold font-display tracking-tight text-[var(--text)] mt-0.5 leading-tight">
                  {property.agent?.full_name || "Asesor Inmobiliario Knordica"}
                </h4>
              </div>
            </div>

            {/* Quick Whatsapp direct connect CTA */}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
              <button className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] transition-all text-white text-xs font-bold uppercase tracking-wider h-11 rounded-lg cursor-pointer shadow-md hover:shadow-[#25D366]/10">
                <MessageCircle className="h-4 w-4 fill-current stroke-none animate-pulse" />
                <span>{dict.property?.detail?.whatsapp || "Escribir por WhatsApp"}</span>
              </button>
            </a>
          </div>

          {/* Form switch tabs */}
          <div className="flex flex-col gap-4">
            <div className="flex border-b border-[rgba(255,255,255,0.08)]">
              <button
                onClick={() => setActiveTab("contact")}
                className={`flex-1 pb-3 text-xs font-semibold uppercase tracking-wider font-display border-b-2 transition-all cursor-pointer ${
                  activeTab === "contact"
                    ? "border-[var(--accent)] text-[var(--text)]"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-2)]"
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {locale === "es" ? "Contactar" : "Contact"}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("visit")}
                className={`flex-1 pb-3 text-xs font-semibold uppercase tracking-wider font-display border-b-2 transition-all cursor-pointer ${
                  activeTab === "visit"
                    ? "border-[var(--accent)] text-[var(--text)]"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-2)]"
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {locale === "es" ? "Agendar Visita" : "Schedule"}
                </span>
              </button>
            </div>

            {activeTab === "contact" ? (
              <LeadForm propertyId={property.id} agentId={property.agent_id || undefined} />
            ) : (
              <AppointmentForm propertyId={property.id} agentId={property.agent_id || undefined} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
