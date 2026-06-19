"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useLocale } from "@/components/layout/LocaleProvider";
import { createClient } from "@/lib/supabase/client";
import { MOCK_ZONES, MOCK_PROPERTIES } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Building2, 
  DollarSign, 
  MapPin, 
  Image as ImageIcon,
  Sparkles,
  Check
} from "lucide-react";

// Form Schema
const propertySchema = zod.object({
  titleEs: zod.string().min(5, { message: "title_required" }),
  titleEn: zod.string().min(5, { message: "title_required" }),
  shortDescriptionEs: zod.string().min(10, { message: "desc_required" }),
  shortDescriptionEn: zod.string().min(10, { message: "desc_required" }),
  descriptionEs: zod.string().optional(),
  descriptionEn: zod.string().optional(),
  
  operation: zod.enum(["venta", "alquiler"]),
  propertyType: zod.enum(["casa", "apartamento", "local", "terreno", "finca", "oficina", "proyecto"]),
  status: zod.enum(["activa", "reservada", "vendida", "alquilada", "inactiva"]),
  
  price: zod.coerce.number().min(1, { message: "price_required" }),
  priceCurrency: zod.string().default("USD"),
  priceNegotiable: zod.boolean().default(false),
  
  areaTotal: zod.coerce.number().optional(),
  areaBuilt: zod.coerce.number().optional(),
  
  bedrooms: zod.coerce.number().optional(),
  bathrooms: zod.coerce.number().optional(),
  parkingSpaces: zod.coerce.number().optional(),
  
  zoneId: zod.string().min(1, { message: "zone_required" }),
  addressEs: zod.string().optional(),
  addressEn: zod.string().optional(),
  
  coverImageUrl: zod.string().url({ message: "url_invalid" }).or(zod.string().length(0)),
  galleryImages: zod.string().optional(), // Comma-separated URLs
  
  featured: zod.boolean().default(false),
  exclusive: zod.boolean().default(false),
  newListing: zod.boolean().default(false),
  priceReduced: zod.boolean().default(false),
});

type PropertyFormData = zod.infer<typeof propertySchema>;

interface PropertyFormProps {
  initialData?: any;
  propertyId?: string;
}

export function PropertyForm({ initialData, propertyId }: PropertyFormProps) {
  const { locale } = useLocale();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [zones, setZones] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();
  const hasSupabaseKeys = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD";

  // Load Zones
  useEffect(() => {
    async function loadZones() {
      if (hasSupabaseKeys) {
        const { data } = await supabase.from("zones").select("*");
        if (data && data.length > 0) {
          setZones(data);
          return;
        }
      }
      setZones(MOCK_ZONES);
    }
    loadZones();
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues: initialData || {
      titleEs: "",
      titleEn: "",
      shortDescriptionEs: "",
      shortDescriptionEn: "",
      descriptionEs: "",
      descriptionEn: "",
      operation: "venta",
      propertyType: "casa",
      status: "activa",
      price: 0,
      priceCurrency: "USD",
      priceNegotiable: false,
      areaTotal: 0,
      areaBuilt: 0,
      bedrooms: 0,
      bathrooms: 0,
      parkingSpaces: 0,
      zoneId: "",
      addressEs: "",
      addressEn: "",
      coverImageUrl: "",
      galleryImages: "",
      featured: false,
      exclusive: false,
      newListing: false,
      priceReduced: false,
    },
  });

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      const slug = (data.titleEs || "propiedad")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      if (hasSupabaseKeys) {
        const payload = {
          slug,
          operation: data.operation,
          property_type: data.propertyType,
          status: data.status,
          price: data.price,
          price_currency: data.priceCurrency,
          price_negotiable: data.priceNegotiable,
          area_total: data.areaTotal || null,
          area_built: data.areaBuilt || null,
          bedrooms: data.bedrooms || null,
          bathrooms: data.bathrooms || null,
          parking_spaces: data.parkingSpaces || null,
          zone_id: data.zoneId,
          address_es: data.addressEs || null,
          address_en: data.addressEn || null,
          featured: data.featured,
          exclusive: data.exclusive,
          new_listing: data.newListing,
          price_reduced: data.priceReduced,
        };

        if (propertyId) {
          // UPDATE
          const { error } = await supabase
            .from("properties")
            .update(payload)
            .eq("id", propertyId);

          if (error) throw error;

          // Update translations
          await supabase
            .from("property_translations")
            .upsert([
              { property_id: propertyId, locale: "es", title: data.titleEs, short_description: data.shortDescriptionEs, description: data.descriptionEs },
              { property_id: propertyId, locale: "en", title: data.titleEn, short_description: data.shortDescriptionEn, description: data.descriptionEn }
            ], { onConflict: "property_id,locale" });

          // Update cover image if any
          if (data.coverImageUrl) {
            // Delete old covers first
            await supabase.from("property_images").delete().eq("property_id", propertyId).eq("is_cover", true);
            await supabase.from("property_images").insert([
              { property_id: propertyId, url: data.coverImageUrl, is_cover: true, sort_order: 0 }
            ]);
          }
        } else {
          // INSERT NEW
          const { data: newProp, error } = await supabase
            .from("properties")
            .insert([payload])
            .select()
            .single();

          if (error) throw error;

          if (newProp) {
            // Insert translations
            await supabase
              .from("property_translations")
              .insert([
                { property_id: newProp.id, locale: "es", title: data.titleEs, short_description: data.shortDescriptionEs, description: data.descriptionEs },
                { property_id: newProp.id, locale: "en", title: data.titleEn, short_description: data.shortDescriptionEn, description: data.descriptionEn }
              ]);

            // Insert cover image
            if (data.coverImageUrl) {
              await supabase.from("property_images").insert([
                { property_id: newProp.id, url: data.coverImageUrl, is_cover: true, sort_order: 0 }
              ]);
            }
          }
        }
      } else {
        // Localstorage simulation
        const currentLocal = JSON.parse(localStorage.getItem("knordica-dev-properties") || "null") || [...MOCK_PROPERTIES];
        
        const zone = zones.find((z) => z.id === data.zoneId);

        const coverImageObj = data.coverImageUrl ? {
          id: Math.random().toString(36).substring(7),
          property_id: propertyId || "new-prop",
          url: data.coverImageUrl,
          alt_es: data.titleEs,
          alt_en: data.titleEn,
          sort_order: 0,
          is_cover: true
        } : null;

        const propertyPayload = {
          id: propertyId || `prop-${Math.random().toString(36).substring(5)}`,
          slug,
          operation: data.operation,
          property_type: data.propertyType,
          status: data.status,
          price: data.price,
          price_currency: data.priceCurrency,
          price_negotiable: data.priceNegotiable,
          area_total: data.areaTotal,
          area_built: data.areaBuilt,
          bedrooms: data.bedrooms || null,
          bathrooms: data.bathrooms || null,
          parking_spaces: data.parkingSpaces || null,
          zone: zone || MOCK_ZONES[0],
          title: data.titleEs,
          short_description: data.shortDescriptionEs,
          cover_image: coverImageObj,
          exclusive: data.exclusive,
          new_listing: data.newListing,
          featured: data.featured,
          price_reduced: data.priceReduced
        };

        if (propertyId) {
          const updated = currentLocal.map((p: any) => (p.id === propertyId ? propertyPayload : p));
          localStorage.setItem("knordica-dev-properties", JSON.stringify(updated));
        } else {
          currentLocal.unshift(propertyPayload);
          localStorage.setItem("knordica-dev-properties", JSON.stringify(currentLocal));
        }
      }

      router.push(`/${locale}/admin/propiedades`);
      router.refresh();
    } catch (e) {
      console.error("Submit property form error", e);
      alert(locale === "es" ? "Error al guardar los cambios de la propiedad." : "Error saving property changes.");
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const stepsHeader = [
    { num: 1, label: locale === "es" ? "Información" : "Information", icon: <Building2 className="h-4 w-4" /> },
    { num: 2, label: locale === "es" ? "Finanzas" : "Finance", icon: <DollarSign className="h-4 w-4" /> },
    { num: 3, label: locale === "es" ? "Ubicación" : "Location", icon: <MapPin className="h-4 w-4" /> },
    { num: 4, label: locale === "es" ? "Imágenes/SEO" : "Images/SEO", icon: <ImageIcon className="h-4 w-4" /> },
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
      {/* Step Indicators */}
      <div className="grid grid-cols-4 gap-2 border-b border-[var(--border)] pb-5">
        {stepsHeader.map((s) => {
          const isCompleted = step > s.num;
          const isActive = step === s.num;
          return (
            <div 
              key={s.num} 
              className={`flex flex-col md:flex-row items-center gap-2 pb-1 border-b-2 transition-all ${
                isActive 
                  ? "border-[var(--accent)] text-[var(--accent)]" 
                  : isCompleted 
                  ? "border-emerald-500/50 text-emerald-400" 
                  : "border-transparent text-[var(--text-muted)]"
              }`}
            >
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                isActive 
                  ? "border-[var(--accent)] bg-[var(--accent)]/10" 
                  : isCompleted 
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" 
                  : "border-[var(--border)] bg-[var(--surface-2)]"
              }`}>
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : s.num}
              </div>
              <span className="text-[10px] uppercase tracking-wider font-semibold font-display hidden sm:inline">
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Form shell */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        
        {/* STEP 1: INFO GENERAL */}
        {step === 1 && (
          <div className="p-6 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass flex flex-col gap-5 animate-in fade-in duration-300">
            <h3 className="font-display font-bold text-base text-[var(--text)] pb-2 border-b border-[var(--border)]">
              {locale === "es" ? "Información Básica" : "Basic Information"}
            </h3>

            {/* Title ES & EN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Título (Español)" : "Title (Spanish)"}
                </label>
                <input
                  type="text"
                  {...register("titleEs")}
                  className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
                />
                {errors.titleEs && <span className="text-[10px] text-[var(--danger)]">{locale === "es" ? "El título es obligatorio" : "Title is required"}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Título (Inglés)" : "Title (English)"}
                </label>
                <input
                  type="text"
                  {...register("titleEn")}
                  className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
                />
                {errors.titleEn && <span className="text-[10px] text-[var(--danger)]">{locale === "es" ? "El título es obligatorio" : "Title is required"}</span>}
              </div>
            </div>

            {/* Type & Operation & Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Tipo de Propiedad" : "Property Type"}
                </label>
                <select
                  {...register("propertyType")}
                  className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden cursor-pointer"
                >
                  <option value="casa" className="bg-[var(--surface-2)]">{locale === "es" ? "Casa" : "House"}</option>
                  <option value="apartamento" className="bg-[var(--surface-2)]">{locale === "es" ? "Apartamento" : "Apartment"}</option>
                  <option value="local" className="bg-[var(--surface-2)]">{locale === "es" ? "Local" : "Commercial"}</option>
                  <option value="terreno" className="bg-[var(--surface-2)]">{locale === "es" ? "Terreno" : "Land"}</option>
                  <option value="finca" className="bg-[var(--surface-2)]">{locale === "es" ? "Finca" : "Estate"}</option>
                  <option value="oficina" className="bg-[var(--surface-2)]">{locale === "es" ? "Oficina" : "Office"}</option>
                  <option value="proyecto" className="bg-[var(--surface-2)]">{locale === "es" ? "Proyecto" : "Project"}</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Tipo de Operación" : "Operation Type"}
                </label>
                <select
                  {...register("operation")}
                  className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden cursor-pointer"
                >
                  <option value="venta" className="bg-[var(--surface-2)]">{locale === "es" ? "Venta" : "For Sale"}</option>
                  <option value="alquiler" className="bg-[var(--surface-2)]">{locale === "es" ? "Alquiler" : "For Rent"}</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Estado de Disponibilidad" : "Availability Status"}
                </label>
                <select
                  {...register("status")}
                  className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden cursor-pointer"
                >
                  <option value="activa" className="bg-[var(--surface-2)]">{locale === "es" ? "Activa" : "Active"}</option>
                  <option value="reservada" className="bg-[var(--surface-2)]">{locale === "es" ? "Reservada" : "Reserved"}</option>
                  <option value="vendida" className="bg-[var(--surface-2)]">{locale === "es" ? "Vendida" : "Sold"}</option>
                  <option value="alquilada" className="bg-[var(--surface-2)]">{locale === "es" ? "Alquilada" : "Rented"}</option>
                  <option value="inactiva" className="bg-[var(--surface-2)]">{locale === "es" ? "Inactiva" : "Inactive"}</option>
                </select>
              </div>
            </div>

            {/* Short description ES & EN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Descripción Corta (Español)" : "Short Description (Spanish)"}
                </label>
                <textarea
                  rows={3}
                  {...register("shortDescriptionEs")}
                  className="px-3 py-2 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden resize-none"
                />
                {errors.shortDescriptionEs && <span className="text-[10px] text-[var(--danger)]">{locale === "es" ? "La descripción corta es obligatoria" : "Short description is required"}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Descripción Corta (Inglés)" : "Short Description (English)"}
                </label>
                <textarea
                  rows={3}
                  {...register("shortDescriptionEn")}
                  className="px-3 py-2 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden resize-none"
                />
                {errors.shortDescriptionEn && <span className="text-[10px] text-[var(--danger)]">{locale === "es" ? "La descripción corta es obligatoria" : "Short description is required"}</span>}
              </div>
            </div>

            {/* Long Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Detalle Completo (Español)" : "Full Description (Spanish)"}
                </label>
                <textarea
                  rows={5}
                  {...register("descriptionEs")}
                  className="px-3 py-2 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden resize-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Detalle Completo (Inglés)" : "Full Description (English)"}
                </label>
                <textarea
                  rows={5}
                  {...register("descriptionEn")}
                  className="px-3 py-2 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: FINANZAS Y DIMENSIONES */}
        {step === 2 && (
          <div className="p-6 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass flex flex-col gap-5 animate-in fade-in duration-300">
            <h3 className="font-display font-bold text-base text-[var(--text)] pb-2 border-b border-[var(--border)]">
              {locale === "es" ? "Valores Financieros y Áreas" : "Financials & Dimensions"}
            </h3>

            {/* Price & currency */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Precio de la Propiedad" : "Listing Price"}
                </label>
                <input
                  type="number"
                  {...register("price")}
                  className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
                />
                {errors.price && <span className="text-[10px] text-[var(--danger)]">{locale === "es" ? "Ingresa un precio válido" : "Enter a valid price"}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  Moneda
                </label>
                <select
                  {...register("priceCurrency")}
                  className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden cursor-pointer"
                >
                  <option value="USD" className="bg-[var(--surface-2)]">USD ($)</option>
                  <option value="EUR" className="bg-[var(--surface-2)]">EUR (€)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 mt-5">
                <input
                  type="checkbox"
                  id="priceNegotiable"
                  {...register("priceNegotiable")}
                  className="h-4 w-4 rounded-xs border-[var(--border)] bg-transparent text-[var(--accent)] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="priceNegotiable" className="text-xs text-[var(--text-2)] font-light cursor-pointer select-none">
                  {locale === "es" ? "Precio Negociable" : "Negotiable Price"}
                </label>
              </div>
            </div>

            {/* Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Área Total (m²)" : "Total Area (sqm)"}
                </label>
                <input
                  type="number"
                  {...register("areaTotal")}
                  className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Área Construida (m²)" : "Built Area (sqm)"}
                </label>
                <input
                  type="number"
                  {...register("areaBuilt")}
                  className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Rooms details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Habitaciones" : "Bedrooms"}
                </label>
                <input
                  type="number"
                  {...register("bedrooms")}
                  className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Baños" : "Bathrooms"}
                </label>
                <input
                  type="number"
                  {...register("bathrooms")}
                  className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Estacionamientos" : "Parking Spaces"}
                </label>
                <input
                  type="number"
                  {...register("parkingSpaces")}
                  className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: UBICACIÓN Y BANDERAS */}
        {step === 3 && (
          <div className="p-6 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass flex flex-col gap-5 animate-in fade-in duration-300">
            <h3 className="font-display font-bold text-base text-[var(--text)] pb-2 border-b border-[var(--border)]">
              {locale === "es" ? "Ubicación y Banderas Especiales" : "Location & Special Flags"}
            </h3>

            {/* Zone Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                {locale === "es" ? "Zona de Mérida" : "Mérida Zone"}
              </label>
              <select
                {...register("zoneId")}
                className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] text-[var(--text)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden cursor-pointer"
              >
                <option value="" className="bg-[var(--surface-2)]">-- Seleccionar zona --</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id} className="bg-[var(--surface-2)]">
                    {locale === "es" ? z.name_es : z.name_en || z.name_es}
                  </option>
                ))}
              </select>
              {errors.zoneId && <span className="text-[10px] text-[var(--danger)]">{locale === "es" ? "Debes elegir una zona" : "Selecting a zone is required"}</span>}
            </div>

            {/* Address ES & EN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Dirección (Español)" : "Address (Spanish)"}
                </label>
                <input
                  type="text"
                  {...register("addressEs")}
                  className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Dirección (Inglés)" : "Address (English)"}
                </label>
                <input
                  type="text"
                  {...register("addressEn")}
                  className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Special marketing flags */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  {...register("featured")}
                  className="h-4 w-4 rounded-xs border-[var(--border)] bg-transparent text-[var(--accent)] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="featured" className="text-xs text-[var(--text-2)] font-light cursor-pointer select-none">
                  {locale === "es" ? "Destacada" : "Featured"}
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="exclusive"
                  {...register("exclusive")}
                  className="h-4 w-4 rounded-xs border-[var(--border)] bg-transparent text-[var(--accent)] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="exclusive" className="text-xs text-[var(--text-2)] font-light cursor-pointer select-none">
                  {locale === "es" ? "Exclusiva" : "Exclusive"}
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="newListing"
                  {...register("newListing")}
                  className="h-4 w-4 rounded-xs border-[var(--border)] bg-transparent text-[var(--accent)] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="newListing" className="text-xs text-[var(--text-2)] font-light cursor-pointer select-none">
                  {locale === "es" ? "Nueva" : "New Listing"}
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="priceReduced"
                  {...register("priceReduced")}
                  className="h-4 w-4 rounded-xs border-[var(--border)] bg-transparent text-[var(--accent)] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="priceReduced" className="text-xs text-[var(--text-2)] font-light cursor-pointer select-none">
                  {locale === "es" ? "Precio Rebajado" : "Price Reduced"}
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: IMÁGENES Y SEO */}
        {step === 4 && (
          <div className="p-6 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass flex flex-col gap-5 animate-in fade-in duration-300">
            <h3 className="font-display font-bold text-base text-[var(--text)] pb-2 border-b border-[var(--border)]">
              {locale === "es" ? "Contenido Multimedia" : "Media Assets & Links"}
            </h3>

            {/* Cover Image URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                {locale === "es" ? "URL Imagen de Portada" : "Cover Image URL"}
              </label>
              <input
                type="text"
                {...register("coverImageUrl")}
                placeholder="https://images.unsplash.com/photo-..."
                className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
              />
              {errors.coverImageUrl && <span className="text-[10px] text-[var(--danger)]">{locale === "es" ? "Ingresa una URL válida" : "Enter a valid URL"}</span>}
            </div>

            {/* Gallery Images URLs */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                {locale === "es" ? "URLs Galería (Separadas por comas)" : "Gallery URLs (Comma-separated)"}
              </label>
              <textarea
                rows={3}
                {...register("galleryImages")}
                placeholder="https://image1.com, https://image2.com"
                className="px-3 py-2 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden resize-none"
              />
            </div>

            {/* Quick Helper */}
            <div className="p-4 border border-[var(--border)] bg-[var(--surface-2)]/30 rounded-xs flex gap-3 text-xs font-light text-[var(--text-2)] leading-relaxed">
              <Sparkles className="h-4.5 w-4.5 text-[var(--accent)] shrink-0 mt-0.5" />
              <p>
                {locale === "es"
                  ? "Para pruebas locales, puedes usar URLs de Unsplash o cualquier servicio CDN. Si tienes Supabase activado, las imágenes se vincularán directamente a las tablas de imágenes de la propiedad."
                  : "For local testing, you can use Unsplash URLs or any CDN service. If you have Supabase activated, images will link directly to the property images tables."}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 mt-2">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1 || submitting}
            className="h-10 px-4 rounded-sm text-xs font-display uppercase tracking-wider disabled:opacity-40"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            <span>{locale === "es" ? "Anterior" : "Back"}</span>
          </Button>

          {step < 4 ? (
            <Button
              variant="outline"
              onClick={nextStep}
              className="h-10 px-4 rounded-sm text-xs font-display uppercase tracking-wider"
            >
              <span>{locale === "es" ? "Siguiente" : "Next"}</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
              className="h-10 px-6 rounded-sm text-xs font-display uppercase tracking-wider"
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              <span>{locale === "es" ? "Guardar Propiedad" : "Save Listing"}</span>
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
