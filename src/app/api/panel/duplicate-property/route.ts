import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service-role client to bypass RLS on insert (duplicate action)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
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
