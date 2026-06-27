"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Nueva Propiedad — Create Mode
 *
 * This page creates a new empty property record in the database and immediately
 * redirects to the edit page (editar/[id]). The edit page (PropertyForm.tsx) is
 * the canonical, fully-featured form used for both creating and editing properties.
 *
 * Flow:
 *   Nueva → [INSERT empty property] → Editar/[newId]
 */
export default function NuevaPropiedadPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "es";
  const [error, setError] = useState("");

  useEffect(() => {
    async function createAndRedirect() {
      try {
        const supabase = createClient();

        // 1. Create the empty property record
        const { data: newProp, error: insertErr } = await supabase
          .from("properties")
          .insert({
            operation: "",
            property_type: "",
            status: "borrador",
            completeness_score: 0,
            featured: false,
            exclusive: false,
            new_listing: true,
            price_reduced: false,
            price_currency: "USD",
            show_exact_location: true,
            furnished: "sin_muebles",
          })
          .select("id")
          .single();

        if (insertErr || !newProp) {
          throw insertErr || new Error("No se pudo crear la propiedad");
        }

        // 2. Redirect to the edit page for the newly created property
        router.replace(`/${locale}/panel/propiedades/editar/${newProp.id}`);
      } catch (err: any) {
        setError(err.message || "Error al crear la propiedad");
      }
    }

    createAndRedirect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center p-12 min-h-[400px]"
      style={{ gap: 12 }}
    >
      {error ? (
        <>
          <div
            className="px-4 py-3 text-[13px]"
            style={{
              borderRadius: "var(--p-radius)",
              background: "rgba(192,96,90,0.12)",
              border: "1px solid rgba(192,96,90,0.2)",
              color: "var(--p-red)",
            }}
          >
            {error}
          </div>
          <button
            onClick={() => router.push(`/${locale}/panel/propiedades`)}
            className="px-4 py-2 text-[13px] font-medium cursor-pointer"
            style={{
              borderRadius: "var(--p-radius)",
              background: "var(--p-surface-2)",
              border: "1px solid var(--p-border)",
              color: "var(--p-text-2)",
            }}
          >
            Volver al listado
          </button>
        </>
      ) : (
        <>
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{
              borderColor: "rgba(255,255,255,0.1)",
              borderTopColor: "var(--p-accent)",
            }}
          />
          <p
            className="text-xs font-mono"
            style={{ color: "var(--p-text-3)" }}
          >
            Creando nueva propiedad...
          </p>
        </>
      )}
    </div>
  );
}
