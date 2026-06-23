import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// Service-role client to bypass RLS on insert
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user from the session cookie
    const cookieStore = await cookies();
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      slug, operation, property_type, price, price_currency,
      area_built, area_total, bedrooms, bathrooms, parking_spaces,
      municipio, featured, exclusive, title,
    } = body;

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("properties")
      .insert({
        slug,
        operation,
        property_type,
        status: "activa",
        price,
        price_currency: price_currency ?? "USD",
        area_built: area_built ?? null,
        area_total: area_total ?? null,
        bedrooms: bedrooms ?? null,
        bathrooms: bathrooms ?? null,
        parking_spaces: parking_spaces ?? null,
        municipio: municipio ?? null,
        featured: featured ?? false,
        exclusive: exclusive ?? false,
        user_id: user.id,
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 400 });
    }

    if (inserted) {
      await supabaseAdmin.from("property_translations").insert({
        property_id: inserted.id,
        locale: "es",
        title: title ?? "Sin título",
        description: null,
        short_description: null,
      });
    }

    return NextResponse.json({ ok: true, id: inserted?.id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
