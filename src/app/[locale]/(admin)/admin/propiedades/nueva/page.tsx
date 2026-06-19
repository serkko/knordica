import Link from "next/link";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { ArrowLeft } from "lucide-react";

interface NuevaPropiedadProps {
  params: Promise<{ locale: string }>;
}

export default async function NuevaPropiedadPage({ params }: NuevaPropiedadProps) {
  const { locale } = await params;

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
          {locale === "es" ? "Publicar Nueva Propiedad" : "Add New Property"}
        </h2>
        <p className="text-xs text-[var(--text-2)] font-light mt-1">
          {locale === "es"
            ? "Completa el formulario en 4 pasos para agregar una propiedad al catálogo."
            : "Complete the 4-step form to add a new listing to the catalog."}
        </p>
      </div>

      {/* Form Workspace */}
      <div className="mt-2">
        <PropertyForm />
      </div>
    </div>
  );
}
