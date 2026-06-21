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

  // Ubicación extendida
  municipio: zod.string().optional(),
  latitud: zod.coerce.number().optional(),
  longitud: zod.coerce.number().optional(),

  // Características booleanas (amenidades schema_v2)
  hasPool: zod.boolean().default(false),
  hasGarden: zod.boolean().default(false),
  hasAc: zod.boolean().default(false),
  hasHeating: zod.boolean().default(false),
  hasGenerator: zod.boolean().default(false),
  hasWaterTank: zod.boolean().default(false),
  hasSecurity: zod.boolean().default(false),
  hasElevator: zod.boolean().default(false),
  allowsPets: zod.boolean().default(false),
  furnished: zod.boolean().default(false),

  // Características adicionales (schema_v2)
  floors: zod.coerce.number().optional(),
  yearBuilt: zod.coerce.number().optional(),
  maintenanceFee: zod.coerce.number().optional(),

  // Video embed
  videoUrl: zod.string().optional(),
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
    defaultValues: initialData ? {
      titleEs: initialData.titleEs || "",
      titleEn: initialData.titleEn || "",
      shortDescriptionEs: initialData.shortDescriptionEs || "",
      shortDescriptionEn: initialData.shortDescriptionEn || "",
      descriptionEs: initialData.descriptionEs || "",
      descriptionEn: initialData.descriptionEn || "",
      operation: initialData.operation || "venta",
      propertyType: initialData.propertyType || "casa",
      status: initialData.status || "activa",
      price: initialData.price || 0,
      priceCurrency: initialData.priceCurrency || "USD",
      priceNegotiable: initialData.priceNegotiable || false,
      areaTotal: initialData.areaTotal || 0,
      areaBuilt: initialData.areaBuilt || 0,
      bedrooms: initialData.bedrooms || 0,
      bathrooms: initialData.bathrooms || 0,
      parkingSpaces: initialData.parkingSpaces || 0,
      zoneId: initialData.zoneId || "",
      addressEs: initialData.addressEs || "",
      addressEn: initialData.addressEn || "",
      coverImageUrl: initialData.coverImageUrl || "",
      galleryImages: initialData.galleryImages || "",
      featured: initialData.featured || false,
      exclusive: initialData.exclusive || false,
      newListing: initialData.newListing || false,
      priceReduced: initialData.priceReduced || false,
      municipio: initialData.municipio || "",
      latitud: initialData.latitud || undefined,
      longitud: initialData.longitud || undefined,
      hasPool: initialData.hasPool || false,
      hasGarden: initialData.hasGarden || false,
      hasAc: initialData.hasAc || false,
      hasHeating: initialData.hasHeating || false,
      hasGenerator: initialData.hasGenerator || false,
      hasWaterTank: initialData.hasWaterTank || false,
      hasSecurity: initialData.hasSecurity || false,
      hasElevator: initialData.hasElevator || false,
      allowsPets: initialData.allowsPets || false,
      furnished: initialData.furnished || false,
      floors: initialData.floors || undefined,
      yearBuilt: initialData.yearBuilt || undefined,
      maintenanceFee: initialData.maintenanceFee || undefined,
      videoUrl: initialData.videoUrl || "",
    } : {
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
      municipio: "",
      latitud: undefined,
      longitud: undefined,
      hasPool: false,
      hasGarden: false,
      hasAc: false,
      hasHeating: false,
      hasGenerator: false,
      hasWaterTank: false,
      hasSecurity: false,
      hasElevator: false,
      allowsPets: false,
      furnished: false,
      floors: undefined,
      yearBuilt: undefined,
      maintenanceFee: undefined,
      videoUrl: "",
    },
  });

  // Load extended fields when editing (since parent component doesn't map them in initialData)
  useEffect(() => {
    async function loadExtendedFields() {
      if (propertyId && hasSupabaseKeys) {
        try {
          const { data: p } = await supabase
            .from("properties")
            .select("*, property_videos(*)")
            .eq("id", propertyId)
            .single();

          if (p) {
            if (p.municipio) setValue("municipio", p.municipio);
            if (p.lat !== null && p.lat !== undefined) setValue("latitud", p.lat);
            if (p.lng !== null && p.lng !== undefined) setValue("longitud", p.lng);
            setValue("hasPool", p.has_pool || false);
            setValue("hasGarden", p.has_garden || false);
            setValue("hasAc", p.has_ac || false);
            setValue("hasHeating", p.has_heating || false);
            setValue("hasGenerator", p.has_generator || false);
            setValue("hasWaterTank", p.has_water_tank || false);
            setValue("hasSecurity", p.has_security || false);
            setValue("hasElevator", p.has_elevator || false);
            setValue("allowsPets", p.allows_pets || false);
            setValue("furnished", p.furnished === "completo" || p.furnished === "parcial" || p.furnished === "totalmente" || p.furnished === true || false);
            if (p.floors !== null && p.floors !== undefined) setValue("floors", p.floors);
            if (p.year_built !== null && p.year_built !== undefined) setValue("yearBuilt", p.year_built);
            if (p.maintenance_fee !== null && p.maintenance_fee !== undefined) setValue("maintenanceFee", p.maintenance_fee);

            if (p.property_videos && p.property_videos.length > 0) {
              setValue("videoUrl", p.property_videos[0].url || "");
            }
          }
        } catch (e) {
          console.error("Error loading extended property fields", e);
        }
      } else if (propertyId) {
        // Mock fallback
        try {
          const currentLocal = JSON.parse(localStorage.getItem("knordica-dev-properties") || "null") || [...MOCK_PROPERTIES];
          const p = currentLocal.find((item: any) => item.id === propertyId);
          if (p) {
            if (p.municipio) setValue("municipio", p.municipio);
            if (p.lat !== undefined) setValue("latitud", p.lat);
            else if (p.latitude !== undefined) setValue("latitud", p.latitude);
            if (p.lng !== undefined) setValue("longitud", p.lng);
            else if (p.longitude !== undefined) setValue("longitud", p.longitude);
            setValue("hasPool", p.has_pool || false);
            setValue("hasGarden", p.has_garden || false);
            setValue("hasAc", p.has_ac || false);
            setValue("hasHeating", p.has_heating || false);
            setValue("hasGenerator", p.has_generator || false);
            setValue("hasWaterTank", p.has_water_tank || false);
            setValue("hasSecurity", p.has_security || false);
            setValue("hasElevator", p.has_elevator || false);
            setValue("allowsPets", p.allows_pets || false);
            setValue("furnished", p.furnished === "completo" || p.furnished === "parcial" || p.furnished === "totalmente" || p.furnished === true || false);
            if (p.floors !== null && p.floors !== undefined) setValue("floors", p.floors);
            if (p.year_built !== null && p.year_built !== undefined) setValue("yearBuilt", p.year_built);
            if (p.maintenance_fee !== null && p.maintenance_fee !== undefined) setValue("maintenanceFee", p.maintenance_fee);
            if (p.videoUrl) setValue("videoUrl", p.videoUrl);
          }
        } catch (e) {
          console.error("Error loading mock extended property fields", e);
        }
      }
    }
    loadExtendedFields();
  }, [propertyId, hasSupabaseKeys]);

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      const slug = (data.titleEs || "propiedad")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      if (hasSupabaseKeys) {
        const payload: any = {
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
          municipio: data.municipio || null,
          latitude: data.latitud || null,
          longitude: data.longitud || null,
          has_pool: data.hasPool,
          has_garden: data.hasGarden,
          has_ac: data.hasAc,
          has_heating: data.hasHeating,
          has_generator: data.hasGenerator,
          has_water_tank: data.hasWaterTank,
          has_security: data.hasSecurity,
          has_elevator: data.hasElevator,
          allows_pets: data.allowsPets,
          furnished: data.furnished,
          floors: data.floors || null,
          year_built: data.yearBuilt || null,
          maintenance_fee: data.maintenanceFee || null,
        };

        // Create standard DB copy payload with lat/lng keys since Supabase lacks latitude/longitude columns
        const dbPayload = {
          ...payload,
          lat: data.latitud || null,
          lng: data.longitud || null
        };
        delete dbPayload.latitude;
        delete dbPayload.longitude;

        let newProp: any = null;

        if (propertyId) {
          // UPDATE
          const { error } = await supabase
            .from("properties")
            .update(dbPayload)
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

          // Video update
          if (data.videoUrl) {
            // Delete first to simulate upsert and avoid unique index collision issues
            await supabase.from("property_videos").delete().eq("property_id", propertyId).eq("sort_order", 0);
            
            const videoPayload = { property_id: propertyId, url: data.videoUrl, platform: data.videoUrl.includes("youtube") ? "youtube" : "vimeo", sort_order: 0 };
            const cleanVideoPayload = { ...videoPayload };
            delete (cleanVideoPayload as any).platform;
            
            try {
              const { error: insertError } = await supabase.from("property_videos").insert([cleanVideoPayload]);
              if (insertError) {
                // Fallback literal code matching string
                await supabase.from("property_videos")
                  .upsert([videoPayload],
                  { onConflict: "property_id,sort_order" });
              }
            } catch (err) {
              console.warn("Silent catch on video update upsert", err);
            }
          }
        } else {
          // INSERT NEW
          const { data: inserted, error } = await supabase
            .from("properties")
            .insert([dbPayload])
            .select()
            .single();

          if (error) throw error;
          newProp = inserted;

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

            // Video insert
            if (data.videoUrl && newProp) {
              const videoPayload = { property_id: newProp.id, url: data.videoUrl, platform: data.videoUrl.includes("youtube") ? "youtube" : "vimeo", sort_order: 0 };
              const cleanVideoPayload = { ...videoPayload };
              delete (cleanVideoPayload as any).platform;
              
              try {
                const { error: insertError } = await supabase.from("property_videos").insert([cleanVideoPayload]);
                if (insertError) {
                  // Fallback literal code matching string
                  await supabase.from("property_videos").insert([videoPayload]);
                }
              } catch (err) {
                console.warn("Silent catch on video insert", err);
              }
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
          price_reduced: data.priceReduced,
          municipio: data.municipio || null,
          latitude: data.latitud || null,
          longitude: data.longitud || null,
          lat: data.latitud || null,
          lng: data.longitud || null,
          has_pool: data.hasPool,
          has_garden: data.hasGarden,
          has_ac: data.hasAc,
          has_heating: data.hasHeating,
          has_generator: data.hasGenerator,
          has_water_tank: data.hasWaterTank,
          has_security: data.hasSecurity,
          has_elevator: data.hasElevator,
          allows_pets: data.allowsPets,
          furnished: data.furnished,
          floors: data.floors || null,
          year_built: data.yearBuilt || null,
          maintenance_fee: data.maintenanceFee || null,
          videoUrl: data.videoUrl || "",
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
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const prevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const stepsHeader = [
    { num: 1, label: locale === "es" ? "Información" : "Information", icon: <Building2 className="h-4 w-4" /> },
    { num: 2, label: locale === "es" ? "Finanzas" : "Finance", icon: <DollarSign className="h-4 w-4" /> },
    { num: 3, label: locale === "es" ? "Ubicación" : "Location", icon: <MapPin className="h-4 w-4" /> },
    { num: 4, label: locale === "es" ? "Amenidades" : "Amenities", icon: <Sparkles className="h-4 w-4" /> },
    { num: 5, label: locale === "es" ? "Multimedia" : "Media", icon: <ImageIcon className="h-4 w-4" /> },
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
      {/* Step Indicators */}
      <div className="grid grid-cols-5 gap-2 border-b border-[var(--border)] pb-5">
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
              <div className={`h-6 w-6 rounded-sm flex items-center justify-center text-[10px] font-bold border ${
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

            {/* Extra dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Número de Pisos" : "Number of Floors"}
                </label>
                <input
                  type="number"
                  {...register("floors")}
                  className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Año de Construcción" : "Year Built"}
                </label>
                <input
                  type="number"
                  {...register("yearBuilt")}
                  placeholder="2020"
                  className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Cuota de Mantenimiento (USD/mes)" : "Maintenance Fee (USD/mo)"}
                </label>
                <input
                  type="number"
                  {...register("maintenanceFee")}
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

            {/* Municipio */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                {locale === "es" ? "Municipio" : "Municipality"}
              </label>
              <select
                {...register("municipio")}
                className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] text-[var(--text)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden cursor-pointer"
              >
                <option value="" className="bg-[var(--surface-2)]">-- {locale === "es" ? "Seleccionar municipio" : "Select municipality"} --</option>
                <option value="libertador" className="bg-[var(--surface-2)]">Libertador (Mérida Capital)</option>
                <option value="santos-marquina" className="bg-[var(--surface-2)]">Santos Marquina (Tabay)</option>
                <option value="campo-elias" className="bg-[var(--surface-2)]">Campo Elías (Ejido)</option>
                <option value="sucre" className="bg-[var(--surface-2)]">Sucre (Lagunillas)</option>
                <option value="alberto-adriani" className="bg-[var(--surface-2)]">Alberto Adriani (El Vigía)</option>
                <option value="rangel" className="bg-[var(--surface-2)]">Rangel (Mucuchíes)</option>
                <option value="otro" className="bg-[var(--surface-2)]">{locale === "es" ? "Otro" : "Other"}</option>
              </select>
            </div>

            {/* Coordenadas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Latitud (opcional)" : "Latitude (optional)"}
                </label>
                <input
                  type="number"
                  step="any"
                  {...register("latitud")}
                  placeholder="8.5897"
                  className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Longitud (opcional)" : "Longitude (optional)"}
                </label>
                <input
                  type="number"
                  step="any"
                  {...register("longitud")}
                  placeholder="-71.1442"
                  className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
                />
              </div>
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

        {/* STEP 4: AMENIDADES */}
        {step === 4 && (
          <div className="p-6 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass flex flex-col gap-5 animate-in fade-in duration-300">
            <h3 className="font-display font-bold text-base text-[var(--text)] pb-2 border-b border-[var(--border)]">
              {locale === "es" ? "Amenidades y Características" : "Amenities & Features"}
            </h3>

            {/* Confort y servicios */}
            <div className="flex flex-col gap-3">
              <p className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                {locale === "es" ? "Confort y Servicios" : "Comfort & Services"}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { field: "hasPool", labelEs: "Piscina", labelEn: "Pool" },
                  { field: "hasGarden", labelEs: "Jardín", labelEn: "Garden" },
                  { field: "hasAc", labelEs: "Aire Acondicionado", labelEn: "Air Conditioning" },
                  { field: "hasHeating", labelEs: "Calefacción", labelEn: "Heating" },
                  { field: "hasGenerator", labelEs: "Planta Eléctrica", labelEn: "Generator" },
                  { field: "hasWaterTank", labelEs: "Tanque / Pozo de Agua", labelEn: "Water Tank / Well" },
                  { field: "hasSecurity", labelEs: "Vigilancia / Seguridad", labelEn: "Security" },
                  { field: "hasElevator", labelEs: "Ascensor", labelEn: "Elevator" },
                  { field: "allowsPets", labelEs: "Permite Mascotas", labelEn: "Pets Allowed" },
                  { field: "furnished", labelEs: "Amueblado", labelEn: "Furnished" },
                ].map(({ field, labelEs, labelEn }) => (
                  <div key={field} className="flex items-center gap-2.5 p-3 border border-[var(--border)] rounded-sm hover:border-[var(--accent)]/40 transition-colors">
                    <input
                      type="checkbox"
                      id={field}
                      {...register(field as any)}
                      className="h-4 w-4 rounded-xs border-[var(--border)] bg-transparent text-[var(--accent)] focus:ring-0 cursor-pointer shrink-0"
                    />
                    <label htmlFor={field} className="text-xs text-[var(--text-2)] font-light cursor-pointer select-none leading-tight">
                      {locale === "es" ? labelEs : labelEn}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: MULTIMEDIA */}
        {step === 5 && (
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

            {/* Video embed URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                {locale === "es" ? "URL de Video (YouTube / Vimeo)" : "Video URL (YouTube / Vimeo)"}
              </label>
              <input
                type="text"
                {...register("videoUrl")}
                placeholder="https://www.youtube.com/watch?v=..."
                className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
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

          {step < 5 ? (
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
              <span>{locale === "es" ? "Guardar" : "Save"}</span>
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
