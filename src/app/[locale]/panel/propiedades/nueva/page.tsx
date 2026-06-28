import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Nueva Propiedad — Create Mode (Server Component)
 *
 * This page creates a new empty property record in the database and immediately
 * redirects to the edit page (editar/[id]). The edit page (PropertyForm.tsx) is
 * the canonical, fully-featured form used for both creating and editing properties.
 *
 * Flow:
 *   Nueva → [INSERT empty property] → Editar/[newId]?new=true
 */
export default async function NuevaPropiedadPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            );
          } catch {
            // Server component — cookies set in middleware
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Generate unique slug: Borrador-YYYYMMDD-HHmmss
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const tempSlug = `Borrador-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  const { data: newProp, error: insertErr } = await supabase
    .from("properties")
    .insert({
      slug: tempSlug,
      // NOT NULL columns — placeholders until user fills the form
      operation: "venta",
      property_type: "apartamento",
      price: 0,
      status: "activa",
      completeness_score: 0,
      featured: false,
      exclusive: false,
      new_listing: true,
      price_reduced: false,
      price_currency: "USD",
      show_exact_location: false,
    })
    .select("id")
    .single();

  if (insertErr || !newProp) {
    redirect(`/${locale}/panel/propiedades?error=create_failed`);
  }

  redirect(`/${locale}/panel/propiedades/editar/${newProp.id}?new=true`);
}
