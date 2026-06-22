"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { 
  BedDouble, Bath, Square, Car, MapPin, MessageCircle, Mail, Calendar,
  Sparkles, Phone, Maximize2, Layers, TreePine, ArrowUpDown, Archive,
  CalendarDays, Coins, Waves, Trees, Wind, Zap, Droplets, Shield,
  PawPrint, Sofa, Dumbbell, Flame, BookOpen, Tv2, Thermometer,
  Mountain, Sun, Check, Globe, ExternalLink, Languages,
  Home, Wine, X, Compass, DoorClosed, Heart, GitCompare
} from "lucide-react";
// Fallback for WashingMachine as it may not be in standard Lucide
import { Wind as WashingMachine } from "lucide-react";

import { useLocale } from "@/components/layout/LocaleProvider";
import { formatPrice, formatArea } from "@/lib/utils/format";
import { LeadForm } from "@/components/forms/LeadForm";
import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { PropertyGallery } from "./PropertyGallery";
import { PropertyShare } from "./PropertyShare";
import { useFavorites } from "@/hooks/useFavorites";
import { useComparatorStore } from "@/store/comparator.store";
import type { Property, PropertyType } from "@/types/property";
import { EASE_EXPO } from "@/lib/motion/variants";
import { cn } from "@/lib/utils/cn";

interface PropertyDetailProps {
  property: Property;
}

export function PropertyDetail({ property }: PropertyDetailProps) {
  const { locale, dict } = useLocale();
  const [activeTab, setActiveTab] = useState<"contact" | "visit">("contact");
  const [activeVideoTab, setActiveVideoTab] = useState<number>(0);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addProperty, removeProperty, isCompared } = useComparatorStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const trans = property.translations?.find((t) => t.locale === locale) ||
    property.translations?.[0] || {
      title: property.slug,
      description: "",
      short_description: "",
    };

  const favActive = isMounted && isFavorite(property.id);
  const compareActive = isMounted && isCompared(property.id);

  const handleFavoriteClick = () => {
    const cardProperty = {
      id: property.id,
      slug: property.slug,
      operation: property.operation,
      property_type: property.property_type as PropertyType,
      status: property.status,
      featured: property.featured,
      exclusive: property.exclusive,
      new_listing: property.new_listing,
      price_reduced: property.price_reduced,
      price: property.price,
      price_currency: property.price_currency,
      area_total: property.area_total,
      area_built: property.area_built,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      parking_spaces: property.parking_spaces,
      zone: property.zone,
      cover_image: property.images?.[0] || null,
      title: trans.title,
      short_description: trans.short_description,
      listing_badge: property.listing_badge,
      has_generator: property.has_generator,
      has_water_tank: property.has_water_tank,
      has_ac: property.has_ac,
      furnished: property.furnished,
      municipio: property.municipio,
    };
    toggleFavorite(cardProperty);
  };

  const handleCompareClick = () => {
    const cardProperty = {
      id: property.id,
      slug: property.slug,
      operation: property.operation,
      property_type: property.property_type as PropertyType,
      status: property.status,
      featured: property.featured,
      exclusive: property.exclusive,
      new_listing: property.new_listing,
      price_reduced: property.price_reduced,
      price: property.price,
      price_currency: property.price_currency,
      area_total: property.area_total,
      area_built: property.area_built,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      parking_spaces: property.parking_spaces,
      zone: property.zone,
      cover_image: property.images?.[0] || null,
      title: trans.title,
      short_description: trans.short_description,
      listing_badge: property.listing_badge,
      has_generator: property.has_generator,
      has_water_tank: property.has_water_tank,
      has_ac: property.has_ac,
      furnished: property.furnished,
      municipio: property.municipio,
    };
    if (compareActive) {
      removeProperty(property.id);
    } else {
      addProperty(cardProperty);
    }
  };

  const formattedPrice = formatPrice(property.price, property.price_currency, locale);

  const getPropertyTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      casa: locale === "es" ? "Casa" : "House",
      apartamento: locale === "es" ? "Apartamento" : "Apartment",
      local: locale === "es" ? "Local" : "Commercial",
      terreno: locale === "es" ? "Terreno" : "Land",
      finca: locale === "es" ? "Finca" : "Estate",
      oficina: locale === "es" ? "Oficina" : "Office",
      proyecto: locale === "es" ? "Proyecto" : "Project",
      townhouse: locale === "es" ? "Townhouse" : "Townhouse",
      penthouse: locale === "es" ? "Penthouse" : "Penthouse",
      terreno_lote: locale === "es" ? "Terreno / Lote" : "Land / Lot",
      edificio: locale === "es" ? "Edificio" : "Building",
      galpon: locale === "es" ? "Galpón" : "Industrial Warehouse",
      habitacion: locale === "es" ? "Habitación" : "Room",
      hacienda_finca: locale === "es" ? "Hacienda / Finca" : "Hacienda / Estate",
      anexo: locale === "es" ? "Anexo" : "Annex",
    };
    return types[type] || type;
  };

  function getEmbedUrl(url: string): string {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?color=C9A84C&title=0`;
    return url;
  }

  // ── Consolidated badge styles ──
  const badgeClass = "text-[9px] font-bold font-display uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-sm border border-transparent";

  // Status Banner render
  const renderStatusBanner = () => {
    const status = property.status;
    if (status === "activa" || !status) return null;

    let styles = "";
    let text = "";

    if (status === "reservada") {
      styles = "bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20";
      text = locale === "es" 
        ? "RESERVADA — Esta propiedad ya tiene una reserva activa. Contáctanos para alternativas similares."
        : "RESERVED — This property has an active reservation. Contact us for similar alternatives.";
    } else if (status === "vendida") {
      styles = "bg-zinc-855/80 text-zinc-500 dark:text-zinc-400 border border-zinc-700/50";
      text = locale === "es" 
        ? "VENDIDA — Esta propiedad ya no está disponible." 
        : "SOLD — This property is no longer available.";
    } else if (status === "alquilada") {
      styles = "bg-zinc-855/80 text-zinc-500 dark:text-zinc-400 border border-zinc-700/50";
      text = locale === "es" 
        ? "ALQUILADA — Esta unidad está ocupada actualmente." 
        : "RENTED — This unit is currently occupied.";
    } else {
      return null;
    }

    return (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_EXPO }}
        className={`w-full ${styles} border rounded-sm p-4 text-center font-mono text-[10px] tracking-wider uppercase mb-6`}
      >
        {text}
      </motion.div>
    );
  };

  // WhatsApp connection config
  const whatsappNumber = property.agent?.whatsapp || "584122423334";
  const whatsappMessage = encodeURIComponent(
    locale === "es"
      ? `Hola ${property.agent?.full_name || "asesor"}, estoy interesado en la propiedad: ${trans.title} (${formattedPrice}).`
      : `Hello ${property.agent?.full_name || "advisor"}, I am interested in the property: ${trans.title} (${formattedPrice}).`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  // Badges chips configuration
  const badges = [
    property.exclusive && { label: locale === 'es' ? 'EXCLUSIVA' : 'EXCLUSIVE', className: 'bg-purple-700 text-white border border-purple-600 font-semibold shadow-md' },
    property.new_listing && { label: locale === 'es' ? 'NUEVO INGRESO' : 'NEW LISTING', className: 'bg-sky-700 text-white border border-sky-600 font-semibold shadow-md' },
    property.price_reduced && { label: locale === 'es' ? 'PRECIO REDUCIDO' : 'PRICE REDUCED', className: 'bg-rose-700 text-white border border-rose-600 font-semibold shadow-md' },
    property.listing_badge && { label: property.listing_badge, className: 'bg-amber-600 text-white border border-amber-500 font-semibold shadow-md' },
  ].filter(Boolean) as { label: string; className: string }[];

  // Construction status chip
  const renderConstructionChip = () => {
    if (!property.construction_status || property.construction_status === "terminado") return null;

    let className = "";
    let label = "";

    if (property.construction_status === "en_planos") {
      className = "bg-blue-900/10 text-blue-500 border-blue-500/20";
      label = locale === "es" ? "EN PLANOS" : "IN PLANS";
    } else if (property.construction_status === "en_construccion") {
      className = "bg-amber-900/10 text-amber-500 border-amber-500/20";
      label = locale === "es" ? "EN CONSTRUCCIÓN" : "UNDER CONSTRUCTION";
    } else if (property.construction_status === "entrega_inmediata") {
      className = "bg-emerald-900/10 text-emerald-500 border-emerald-500/20";
      label = locale === "es" ? "ENTREGA INMEDIATA" : "IMMEDIATE DELIVERY";
    }

    return (
      <span className={cn(badgeClass, className)}>
        {label}
      </span>
    );
  };

  // Specs grid mapping
  const specs = [
    property.bedrooms && { icon: BedDouble, label: locale === "es" ? "Habitaciones" : "Bedrooms", value: String(property.bedrooms) },
    property.bathrooms && { icon: Bath, label: locale === "es" ? "Baños completos" : "Bathrooms", value: String(property.bathrooms) },
    property.half_bathrooms && { icon: Droplets, label: locale === "es" ? "Medios baños" : "Half Bathrooms", value: String(property.half_bathrooms) },
    property.parking_spaces && { icon: Car, label: locale === "es" ? "Estacionamientos" : "Parking", value: String(property.parking_spaces) },
    property.area_built && { icon: Square, label: locale === "es" ? "Área construida" : "Built Area", value: formatArea(property.area_built, locale) },
    property.area_total && { icon: Maximize2, label: locale === "es" ? "Área total" : "Total Area", value: formatArea(property.area_total, locale) },
    property.area_hectares && property.area_hectares > 0 && { icon: TreePine, label: locale === "es" ? "Hectáreas" : "Hectares", value: `${property.area_hectares} ha` },
    property.floors && { icon: Layers, label: locale === "es" ? "Pisos" : "Floors", value: String(property.floors) },
    property.floor_number && property.property_type === "apartamento" && { icon: ArrowUpDown, label: locale === "es" ? "Piso" : "Floor", value: locale === "es" ? `Piso ${property.floor_number}` : `Floor ${property.floor_number}` },
    property.service_rooms && { icon: Home, label: locale === "es" ? "Cuartos de servicio" : "Service Rooms", value: String(property.service_rooms) },
    property.storage_rooms && { icon: Archive, label: locale === "es" ? "Depósitos" : "Storage", value: String(property.storage_rooms) },
    property.year_built && { icon: CalendarDays, label: locale === "es" ? "Año de construcción" : "Year Built", value: String(property.year_built) },
    property.maintenance_fee && { icon: Coins, label: locale === "es" ? "Condominio" : "Maintenance", value: `$${property.maintenance_fee}/${locale === "es" ? "mes" : "mo"}` },
  ].filter(Boolean) as { icon: any; label: string; value: string }[];

  // Amenities list matching bool columns
  const amenitiesList = [
    { icon: Waves, labelEs: "Piscina", labelEn: "Pool", value: property.has_pool },
    { icon: Trees, labelEs: "Jardín", labelEn: "Garden", value: property.has_garden },
    { icon: Wind, labelEs: "Aire Acondicionado", labelEn: "Air Conditioning", value: property.has_ac },
    { icon: Zap, labelEs: "Planta Eléctrica", labelEn: "Generator", value: property.has_generator },
    { icon: Droplets, labelEs: "Tanque de Agua", labelEn: "Water Tank", value: property.has_water_tank },
    { icon: Shield, labelEs: "Seguridad / Vigilancia", labelEn: "Security", value: property.has_security },
    { icon: ArrowUpDown, labelEs: "Ascensor", labelEn: "Elevator", value: property.has_elevator },
    { icon: PawPrint, labelEs: "Acepta Mascotas", labelEn: "Pet Friendly", value: property.allows_pets },
    { icon: Sofa, labelEs: "Amoblado", labelEn: "Furnished", value: property.furnished },
    { icon: Dumbbell, labelEs: "Gimnasio", labelEn: "Gym", value: property.has_gym },
    { icon: Sparkles, labelEs: "Jacuzzi / Spa", labelEn: "Jacuzzi / Spa", value: property.has_jacuzzi },
    { icon: Flame, labelEs: "Área BBQ", labelEn: "BBQ Area", value: property.has_bbq },
    { icon: WashingMachine, labelEs: "Lavandería", labelEn: "Laundry Room", value: property.has_laundry },
    { icon: BookOpen, labelEs: "Estudio / Biblioteca", labelEn: "Study Room", value: property.has_study },
    { icon: Tv2, labelEs: "Sala de Cine", labelEn: "Home Theater", value: property.has_cinema },
    { icon: Wine, labelEs: "Cava de Vinos", labelEn: "Wine Cellar", value: property.has_wine_cellar },
    { icon: Thermometer, labelEs: "Sauna", labelEn: "Sauna", value: property.has_sauna },
    { icon: Mountain, labelEs: "Terraza", labelEn: "Terrace", value: property.has_terrace },
    { icon: Compass, labelEs: "Balcón", labelEn: "Balcony", value: property.has_balcony },
    { icon: Sun, labelEs: "Paneles Solares", labelEn: "Solar Panels", value: property.has_solar_panels },
  ];

  const activeAmenities = amenitiesList.filter((a) => a.value);

  // Video embeds handling
  const allVideos: { url: string; title: string }[] = [];
  if (property.video_url) {
    allVideos.push({ url: property.video_url, title: locale === "es" ? "Video Principal" : "Main Video" });
  }
  if (property.videos && property.videos.length > 0) {
    property.videos.forEach((vid, i) => {
      allVideos.push({ 
        url: vid.url, 
        title: (locale === "es" ? vid.title_es : vid.title_en) || `${locale === "es" ? "Video" : "Video"} ${i + 1}` 
      });
    });
  }

  // Features grouped mapping
  const groupedFeatures: Record<string, typeof property.features> = {};
  if (property.features && property.features.length > 0) {
    property.features.forEach((feat) => {
      const g = feat.group || "default";
      if (!groupedFeatures[g]) groupedFeatures[g] = [];
      groupedFeatures[g].push(feat);
    });
  }

  const getGroupLabel = (group: string) => {
    if (group === "default") return "";
    if (group === "legal") return locale === "es" ? "Aspectos Legales" : "Legal Aspects";
    if (group === "servicios") return locale === "es" ? "Servicios Públicos" : "Public Services";
    if (group === "extras") return locale === "es" ? "Extras y Detalles" : "Extras & Details";
    return group;
  };

  const getOperationLabel = () => {
    if (property.operation === "venta") {
      return dict.property?.operation?.venta || "Venta";
    }
    if (property.operation === "alquiler") {
      return dict.property?.operation?.alquiler || "Alquiler";
    }
    if (property.operation === "vacacional") {
      return dict.property?.operation?.vacacional || "Vacacional";
    }
    return property.operation;
  };

  const operationBadgeStyle = () => {
    if (property.operation === "venta") return "bg-[var(--accent)] text-black border-[var(--accent)]";
    if (property.operation === "alquiler") return "bg-[var(--surface-2)] text-[var(--text)] border-[var(--border)]";
    return "bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--border-accent)]";
  };

  // Framer Motion variants for stagger entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      }
    }
  };

  const itemFadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.75, ease: EASE_EXPO }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8"
    >
      {/* SECCIÓN 0 — STATUS BANNER */}
      {renderStatusBanner()}

      {/* SECCIÓN 1 — GALERÍA */}
      <motion.div variants={itemFadeUp} className="relative rounded-xl overflow-hidden shadow-2xl border border-[var(--border)]">
        {badges.length > 0 && (
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
            {badges.map((b, idx) => (
              <motion.span 
                initial={{ opacity: 0, scale: 0.9, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.2 + idx * 0.1, ease: EASE_EXPO }}
                key={idx} 
                className={cn(badgeClass, b.className, "backdrop-blur-md shadow-lg")}
              >
                {b.label}
              </motion.span>
            ))}
          </div>
        )}
        <PropertyGallery images={property.images || []} title={trans.title} />
      </motion.div>

      {/* Grid Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side (Col span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* SECCIÓN 2 — CABECERA */}
          <motion.div variants={itemFadeUp} className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-[var(--border)]">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn(badgeClass, operationBadgeStyle(), "shadow-sm")}>
                  {getOperationLabel()}
                </span>
                <span className={cn(badgeClass, "bg-[var(--surface-2)] text-[var(--text)] border-[var(--border)]")}>
                  {getPropertyTypeLabel(property.property_type)}
                </span>
                {renderConstructionChip()}
                {property.price_negotiable && (
                  <span className={cn(badgeClass, "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20")}>
                    {locale === "es" ? "PRECIO NEGOCIABLE" : "NEGOTIABLE PRICE"}
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-[2.2rem] font-light font-display tracking-tight text-[var(--text)] leading-snug" style={{ letterSpacing: "-0.03em" }}>
                {trans.title}
              </h1>

              <div className="flex flex-col gap-1.5 text-xs text-[var(--text-2)] font-light">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[var(--accent)]" />
                  <span>
                    {locale === "es"
                      ? property.address_es || property.zone?.name_es
                      : property.address_en || property.zone?.name_en}
                  </span>
                </div>
                {property.municipio && (
                  <span className="text-[10px] font-mono text-[var(--text-muted)] pl-6 uppercase tracking-widest">
                    Mun. {property.municipio.replace("-", " ")}
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0 flex sm:flex-col items-start sm:items-end gap-2 bg-[var(--surface-1)] sm:bg-transparent p-4 sm:p-0 rounded-lg border border-[var(--border)] sm:border-0">
              <div className="flex flex-col sm:items-end gap-1">
                <span className="text-2xl md:text-[2rem] font-semibold font-display text-[var(--accent)] tracking-tight">
                  {formattedPrice}
                </span>
                {property.price_per_m2 && (
                  <span className="text-xs text-[var(--text-muted)] font-mono">
                    (${property.price_per_m2.toLocaleString()}/m²)
                  </span>
                )}
              </div>
              {property.maintenance_fee && (
                <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
                  + {property.maintenance_fee} {property.maintenance_fee_currency || "USD"} / {locale === "es" ? "Mes Condominio" : "Mo Maintenance"}
                </p>
              )}
              <div className="mt-2 w-full sm:w-auto flex flex-wrap items-center gap-2">
                <PropertyShare slug={property.slug} title={trans.title} />

                {/* Favorite button */}
                <button
                  onClick={handleFavoriteClick}
                  className={cn(
                    "h-9 px-4 rounded-sm border text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 backdrop-blur-xs",
                    favActive
                      ? "bg-red-500 text-white border-red-500 shadow-md"
                      : "bg-[var(--surface-2)]/30 border-[var(--border)] text-[var(--text-2)] hover:border-red-500 hover:text-red-500"
                  )}
                >
                  <Heart className={cn("h-3.5 w-3.5", favActive && "fill-current")} />
                  <span>{favActive ? (locale === "es" ? "Guardado" : "Saved") : (locale === "es" ? "Favorito" : "Favorite")}</span>
                </button>

                {/* Compare button */}
                <button
                  onClick={handleCompareClick}
                  className={cn(
                    "h-9 px-4 rounded-sm border text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 backdrop-blur-xs",
                    compareActive
                      ? "bg-[var(--accent)] text-black border-[var(--accent)] shadow-md"
                      : "bg-[var(--surface-2)]/30 border-[var(--border)] text-[var(--text-2)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  )}
                >
                  <GitCompare className="h-3.5 w-3.5" />
                  <span>{compareActive ? (locale === "es" ? "Comparando" : "Comparing") : (locale === "es" ? "Comparar" : "Compare")}</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* SECCIÓN 3 — SPECS GRID */}
          {specs.length > 0 && (
            <motion.div 
              variants={itemFadeUp}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 p-6 border border-[var(--border)] bg-[var(--surface-1)] rounded-xl shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-dim)] opacity-10 rounded-full blur-3xl pointer-events-none" />
              {specs.map((s, idx) => {
                const IconComponent = s.icon;
                return (
                  <motion.div 
                    key={idx}
                    whileHover={{ y: -3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="flex items-center gap-3.5 p-1 transition-all duration-200"
                  >
                    <IconComponent className="h-6 w-6 text-[var(--accent)] shrink-0" />
                    <div className="flex flex-col justify-center">
                      <span className="text-[0.65rem] uppercase tracking-wider text-[var(--text-muted)] font-semibold font-body leading-none">
                        {s.label}
                      </span>
                      <span className="text-sm font-semibold font-display text-[var(--text)] mt-1.5 leading-none">
                        {s.value}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* SECCIÓN 4 — DESCRIPCIÓN */}
          <motion.div variants={itemFadeUp} className="flex flex-col gap-4">
            <h3 className="text-lg font-bold font-display tracking-tight text-[var(--text)] flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              {dict.property?.detail?.descripcion || "Descripción"}
            </h3>
            <p className="text-sm md:text-[15px] text-[var(--text-2)] leading-relaxed font-light whitespace-pre-line max-w-[70ch]">
              {trans.description || trans.short_description || (locale === "es" ? "Sin descripción disponible." : "No description available.")}
            </p>
          </motion.div>

          {/* SECCIÓN 5 — AMENIDADES */}
          {activeAmenities.length > 0 && (
            <motion.div variants={itemFadeUp} className="flex flex-col gap-5 border-t border-[var(--border)] pt-8">
              <h3 className="text-lg font-bold font-display tracking-tight text-[var(--text)] flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                {locale === "es" ? "Amenidades y Equipamiento" : "Amenities & Features"}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {activeAmenities.map((am) => {
                  const IconComponent = am.icon;
                  return (
                    <motion.div 
                      key={am.labelEs} 
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center gap-3 px-3.5 py-2.5 border border-[var(--border-accent)] bg-[var(--accent-dim)]/30 hover:bg-[var(--accent-dim)]/50 rounded transition-colors duration-200 text-xs text-[var(--accent)] font-medium"
                    >
                      <IconComponent className="h-4 w-4 shrink-0" />
                      <span className="font-body text-[11px] uppercase tracking-wider">{locale === "es" ? am.labelEs : am.labelEn}</span>
                      <Check className="h-3.5 w-3.5 ml-auto shrink-0 opacity-80" />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* SECCIÓN 6 — VIDEO */}
          {allVideos.length > 0 && (
            <motion.div variants={itemFadeUp} className="flex flex-col gap-5 border-t border-[var(--border)] pt-8">
              <h3 className="text-lg font-bold font-display tracking-tight text-[var(--text)] flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                {locale === "es" ? "Video de la Propiedad" : "Property Video"}
              </h3>
              
              {allVideos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                  {allVideos.map((vid, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveVideoTab(idx)}
                      className={`px-4 py-2 text-xs font-mono rounded border shrink-0 transition-all cursor-pointer ${
                        activeVideoTab === idx 
                          ? "bg-[var(--accent-dim)] border-[var(--accent)] text-[var(--accent)] font-semibold shadow-sm" 
                          : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)]"
                      }`}
                    >
                      {vid.title}
                    </button>
                  ))}
                </div>
              )}

              <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface-2)] shadow-lg">
                <iframe
                  src={getEmbedUrl(allVideos[activeVideoTab]?.url || "")}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                  title={trans.title}
                />
              </div>
            </motion.div>
          )}

          {/* SECCIÓN 7 — TOUR VIRTUAL */}
          {property.virtual_tour_url && (
            <motion.div variants={itemFadeUp} className="flex flex-col gap-4 border-t border-[var(--border)] pt-8">
              <h3 className="text-lg font-bold font-display tracking-tight text-[var(--text)] flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                {locale === "es" ? "Tour Virtual 360°" : "360° Virtual Tour"}
              </h3>
              <a
                href={property.virtual_tour_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-5 border border-[var(--border)] hover:border-[var(--accent)] bg-[var(--surface-2)]/50 rounded-xl transition-all duration-300 hover:bg-[var(--accent-dim)]/20 shadow-sm"
              >
                <div className="h-12 w-12 border border-[var(--border)] rounded flex items-center justify-center text-[var(--accent)] shrink-0 bg-[var(--surface-1)]">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text)] font-display group-hover:text-[var(--accent)] transition-colors duration-200">
                    {locale === 'es' ? 'Explorar Tour Virtual' : 'Explore Virtual Tour'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] font-mono mt-1">
                    {locale === 'es' ? 'Abre en nueva ventana' : 'Opens in new window'}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-[var(--text-muted)] ml-auto group-hover:text-[var(--accent)] transition-colors duration-200" />
              </a>
            </motion.div>
          )}

          {/* SECCIÓN 8 — CARACTERÍSTICAS TÉCNICAS */}
          {property.features && property.features.length > 0 && (
            <motion.div variants={itemFadeUp} className="flex flex-col gap-6 border-t border-[var(--border)] pt-8">
              <h3 className="text-lg font-bold font-display tracking-tight text-[var(--text)] flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                {dict.property?.detail?.caracteristicas || "Detalles adicionales"}
              </h3>
              
              <div className="flex flex-col gap-6">
                {Object.keys(groupedFeatures).map((groupKey) => {
                  const label = getGroupLabel(groupKey);
                  return (
                    <div key={groupKey} className="flex flex-col gap-3">
                      {label && (
                        <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold font-display border-b border-[var(--border)] pb-2">
                          {label}
                        </p>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {(groupedFeatures[groupKey] || []).map((feat) => (
                          <div key={feat.id} className="flex items-start gap-2.5 text-sm text-[var(--text-2)] font-light p-2 rounded hover:bg-[var(--surface-2)]/30 transition-colors duration-150">
                            <Sparkles className="h-4 w-4 text-[var(--accent)] mt-0.5 shrink-0" />
                            <span>
                              <span className="font-semibold text-[var(--text)]">{feat.key}:</span>{" "}
                              {locale === "es" ? feat.value_es : feat.value_en}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* SECCIÓN 9 — MAPA */}
          <motion.div variants={itemFadeUp} className="flex flex-col gap-5 border-t border-[var(--border)] pt-8">
            <h3 className="text-lg font-bold font-display tracking-tight text-[var(--text)] flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              {dict.property?.detail?.ubicacion || "Ubicación"}
            </h3>
            <div 
              onClick={() => setIsMapModalOpen(true)}
              className="h-[300px] w-full border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--surface-2)] relative shadow-lg group cursor-pointer"
            >
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,var(--border-strong)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-strong)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
                <div className="h-14 w-14 rounded-full bg-[var(--accent-dim)]/50 border border-[var(--border-accent)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-7 w-7 text-[var(--accent)]" />
                </div>
                <p className="text-sm font-semibold text-[var(--text)] mt-4 max-w-[80%]">
                  {locale === "es" ? property.address_es : property.address_en}
                </p>
              </div>

              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-[10px] font-mono text-[var(--accent)] bg-[var(--surface-1)] px-3 py-2 rounded border border-[var(--border)] shadow-md font-semibold pointer-events-none">
                <Maximize2 className="h-3 w-3" />
                {locale === 'es' ? 'Ver mapa expandido' : 'Open expanded map'}
              </div>
            </div>
          </motion.div>
        </div>

        {/* SIDEBAR DERECHO — AGENTE (col-span-4, sticky) */}
        <motion.div 
          variants={itemFadeUp}
          className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-6"
        >
          <div className="p-6 border border-[var(--border)] bg-[var(--surface-2)] rounded-xl flex flex-col gap-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-dim)] opacity-5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-4">
              {property.agent?.avatar_url ? (
                <img
                  src={property.agent.avatar_url}
                  alt={property.agent.full_name}
                  className="h-14 w-14 rounded object-cover border border-[var(--border)] shrink-0 shadow-sm"
                />
              ) : (
                <div className="h-14 w-14 rounded border border-[var(--border)] bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--accent)] font-display font-semibold text-xl shrink-0">
                  {property.agent?.full_name ? property.agent.full_name[0] : "A"}
                </div>
              )}
              <div>
                <p className="text-[0.65rem] uppercase tracking-wider text-[var(--text-muted)] font-semibold font-body leading-none">
                  {locale === "es" ? "Asesor asignado" : "Assigned Advisor"}
                </p>
                <h4 className="text-base font-semibold font-display text-[var(--text)] leading-tight mt-2">
                  {property.agent?.full_name || "Asesor Inmobiliario Knordica"}
                </h4>
                {property.agent?.title && (
                  <p className="text-xs text-[var(--text-muted)] font-light mt-1">
                    {property.agent.title}
                  </p>
                )}
                {property.agent?.languages && property.agent.languages.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Languages className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      {property.agent.languages.join(" · ")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {(property.agent?.bio_es || property.agent?.bio_en) && (
              <p className="text-xs text-[var(--text-2)] font-light leading-relaxed border-t border-[var(--border)] pt-4">
                {locale === "es" ? property.agent.bio_es : property.agent.bio_en}
              </p>
            )}

            <div className="flex flex-col gap-3">
              {/* WhatsApp direct connect CTA */}
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] transition-all text-white text-xs font-bold uppercase tracking-wider h-11 rounded shadow-md hover:shadow-[#25D366]/20 cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 fill-current stroke-none" />
                  <span>{dict.property?.detail?.whatsapp || "Escribir por WhatsApp"}</span>
                </motion.button>
              </a>

              {/* Call CTA */}
              {property.agent?.phone && (
                <a href={`tel:${property.agent.phone}`} className="w-full">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text)] text-xs font-bold uppercase tracking-wider h-10 rounded cursor-pointer transition-all bg-[var(--surface-1)] hover:bg-[var(--surface-elevated)]"
                  >
                    <Phone className="h-4 w-4 text-[var(--text-muted)]" />
                    <span>{locale === "es" ? "Llamar" : "Call"}</span>
                  </motion.button>
                </a>
              )}

              {/* Email CTA */}
              {property.agent?.email && (
                <a href={`mailto:${property.agent.email}?subject=${encodeURIComponent(trans.title)}`} className="w-full">
                  <button className="w-full flex items-center justify-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent)] text-xs uppercase tracking-wider h-9 cursor-pointer transition-colors">
                    <Mail className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    <span className="truncate max-w-[200px]">{property.agent.email}</span>
                  </button>
                </a>
              )}
            </div>
          </div>

          {/* Switchable Contact Form Tabs */}
          <div className="flex flex-col gap-4">
            <div className="flex border-b border-[var(--border)] relative">
              <button
                onClick={() => setActiveTab("contact")}
                className={`flex-1 pb-3 text-xs font-semibold uppercase tracking-wider font-display transition-all cursor-pointer relative ${
                  activeTab === "contact" ? "text-[var(--text)]" : "text-[var(--text-muted)] hover:text-[var(--text-2)]"
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {locale === "es" ? "Contactar" : "Contact"}
                </span>
                {activeTab === "contact" && (
                  <motion.span 
                    layoutId="activeTabLine" 
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent)]" 
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("visit")}
                className={`flex-1 pb-3 text-xs font-semibold uppercase tracking-wider font-display transition-all cursor-pointer relative ${
                  activeTab === "visit" ? "text-[var(--text)]" : "text-[var(--text-muted)] hover:text-[var(--text-2)]"
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {locale === "es" ? "Agendar Visita" : "Schedule"}
                </span>
                {activeTab === "visit" && (
                  <motion.span 
                    layoutId="activeTabLine" 
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent)]" 
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            </div>

            <div className="bg-[var(--surface-1)] p-4 rounded-xl border border-[var(--border)] shadow-sm min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: EASE_EXPO }}
                >
                  {activeTab === "contact" ? (
                    <LeadForm propertyId={property.id} agentId={property.agent_id || undefined} />
                  ) : (
                    <AppointmentForm propertyId={property.id} agentId={property.agent_id || undefined} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* MAP EXPANDED MODAL */}
      <AnimatePresence>
        {isMapModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
            onClick={() => setIsMapModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: EASE_EXPO }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl h-[80vh] rounded-2xl overflow-hidden bg-[var(--surface)] border border-[var(--border)] shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-1)]">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[var(--accent)]" />
                  <span className="text-sm font-semibold font-display text-[var(--text)]">
                    {locale === "es" ? "Ubicación detallada" : "Detailed Location"}
                  </span>
                </div>
                <button
                  onClick={() => setIsMapModalOpen(false)}
                  className="h-8 w-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--border-strong)] transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Map body */}
              <div className="flex-1 bg-[var(--surface-2)] relative">
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,var(--border-strong)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-strong)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                
                {/* Embedded google maps or interactive placeholder */}
                <iframe
                  src={`https://maps.google.com/maps?q=${property.lat || 8.59},${property.lng || -71.14}&z=16&t=m&iwloc=addr&output=embed`}
                  className="absolute inset-0 w-full h-full border-0 filter invert-[90%] hue-rotate-[180deg]"
                  allowFullScreen
                  loading="lazy"
                  title={trans.title}
                />
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-1)] flex items-center justify-between gap-3 text-xs">
                <span className="text-[var(--text-2)] font-light font-body">
                  {locale === "es" ? property.address_es : property.address_en}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INDICADOR DE COMPLETENESS (solo en desarrollo) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 left-4 z-50 bg-black/85 text-white text-xs font-mono px-3 py-2 rounded-sm border border-white/20 shadow-lg pointer-events-none">
          <span className="text-[var(--accent)] font-semibold">COMPLETENESS:</span>{" "}
          {property.completeness_score ?? "?"}%
        </div>
      )}
    </motion.div>
  );
}
