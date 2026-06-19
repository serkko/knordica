"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "@/components/layout/LocaleProvider";
import { createClient } from "@/lib/supabase/client";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { MOCK_PROPERTIES } from "@/lib/mock-data";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function EditarPropiedadPage() {
  const { locale } = useLocale();
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const hasSupabaseKeys = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD";

  useEffect(() => {
    async function loadProperty() {
      setLoading(true);
      try {
        if (hasSupabaseKeys) {
          const { data: p, error } = await supabase
            .from("properties")
            .select(`
              *,
              translations:property_translations(*),
              property_images(*)
            `)
            .eq("id", id)
            .single();

          if (!error && p) {
            const transEs = p.translations?.find((t: any) => t.locale === "es") || {};
            const transEn = p.translations?.find((t: any) => t.locale === "en") || {};
            const coverImg = p.property_images?.find((img: any) => img.is_cover) || p.property_images?.[0];
            const galleryList = p.property_images?.filter((img: any) => !img.is_cover).map((img: any) => img.url).join(", ") || "";

            setProperty({
              titleEs: transEs.title || "",
              titleEn: transEn.title || "",
              shortDescriptionEs: transEs.short_description || "",
              shortDescriptionEn: transEn.short_description || "",
              descriptionEs: transEs.description || "",
              descriptionEn: transEn.description || "",
              operation: p.operation || "venta",
              propertyType: p.property_type || "casa",
              status: p.status || "activa",
              price: Number(p.price) || 0,
              priceCurrency: p.price_currency || "USD",
              priceNegotiable: p.price_negotiable || false,
              areaTotal: p.area_total || 0,
              areaBuilt: p.area_built || 0,
              bedrooms: p.bedrooms || 0,
              bathrooms: p.bathrooms || 0,
              parkingSpaces: p.parking_spaces || 0,
              zoneId: p.zone_id || "",
              addressEs: p.address_es || "",
              addressEn: p.address_en || "",
              coverImageUrl: coverImg?.url || "",
              galleryImages: galleryList,
              featured: p.featured || false,
              exclusive: p.exclusive || false,
              newListing: p.new_listing || false,
              priceReduced: p.price_reduced || false,
            });
          }
        } else {
          // Local fallback properties list
          const currentLocal = JSON.parse(localStorage.getItem("knordica-dev-properties") || "null") || [...MOCK_PROPERTIES];
          const p = currentLocal.find((item: any) => item.id === id);

          if (p) {
            setProperty({
              titleEs: p.title || "",
              titleEn: p.title || "",
              shortDescriptionEs: p.short_description || "",
              shortDescriptionEn: p.short_description || "",
              descriptionEs: p.description || p.short_description || "",
              descriptionEn: p.description || p.short_description || "",
              operation: p.operation || "venta",
              propertyType: p.property_type || "casa",
              status: p.status || "activa",
              price: p.price || 0,
              priceCurrency: p.price_currency || "USD",
              priceNegotiable: p.price_negotiable || false,
              areaTotal: p.area_total || 0,
              areaBuilt: p.area_built || 0,
              bedrooms: p.bedrooms || 0,
              bathrooms: p.bathrooms || 0,
              parkingSpaces: p.parking_spaces || 0,
              zoneId: p.zone?.id || "",
              addressEs: p.address_es || "",
              addressEn: p.address_en || "",
              coverImageUrl: p.cover_image?.url || "",
              galleryImages: "",
              featured: p.featured || false,
              exclusive: p.exclusive || false,
              newListing: p.new_listing || false,
              priceReduced: p.price_reduced || false,
            });
          }
        }
      } catch (err) {
        console.error("Load property details error", err);
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 w-24 bg-[var(--surface-2)] rounded-xs border border-[var(--border)]" />
        <div className="h-64 bg-[var(--surface-2)] rounded-sm border border-[var(--border)]" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-[var(--border)] bg-[var(--surface)]/20 rounded-sm glass min-h-[300px]">
        <AlertCircle className="h-10 w-10 text-[var(--text-muted)] mb-4" />
        <h4 className="font-display font-bold text-base text-[var(--text)] mb-1">
          {locale === "es" ? "Propiedad no encontrada" : "Property not found"}
        </h4>
        <Link href={`/${locale}/admin/propiedades`} className="mt-4">
          <Button variant="outline" size="sm">
            {locale === "es" ? "Volver al catálogo" : "Back to properties"}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <Link
          href={`/${locale}/admin/propiedades`}
          className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{locale === "es" ? "Volver a propiedades" : "Back to properties"}</span>
        </Link>
        <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[var(--text)]">
          {locale === "es" ? "Editar Propiedad" : "Edit Property"}
        </h2>
        <p className="text-xs text-[var(--text-2)] font-light mt-1">
          {locale === "es"
            ? "Modifica los detalles correspondientes de la propiedad."
            : "Modify the corresponding property details."}
        </p>
      </div>

      {/* Form Workspace */}
      <div className="mt-2">
        <PropertyForm initialData={property} propertyId={id} />
      </div>
    </div>
  );
}
