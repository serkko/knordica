/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// Service-role client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet: any[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }: any) =>
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

    const { sourceId, newSlug } = await req.json();
    if (!sourceId || !newSlug) {
      return NextResponse.json({ error: "sourceId y newSlug son requeridos" }, { status: 400 });
    }

    // ── 1. Fetch the source property ───────────────────────────────────────
    const { data: source, error: srcErr } = await supabaseAdmin
      .from("properties")
      .select("*")
      .eq("id", sourceId)
      .single();

    if (srcErr || !source) {
      return NextResponse.json({ error: srcErr?.message ?? "Propiedad no encontrada" }, { status: 404 });
    }

    // ── 2. Insert the new property ─────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, created_at: _ca, updated_at: _ua, slug: _slug, ...rest } = source;
    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("properties")
      .insert({ ...rest, slug: newSlug, user_id: user.id, featured: false, exclusive: false })
      .select()
      .single();

    if (insertErr || !inserted) {
      return NextResponse.json({ error: insertErr?.message ?? "Error al insertar" }, { status: 400 });
    }

    const newId = inserted.id;

    // ── 3. Copy all translations ───────────────────────────────────────────
    const { data: translations } = await supabaseAdmin
      .from("property_translations")
      .select("*")
      .eq("property_id", sourceId);

    if (translations?.length) {
      await supabaseAdmin.from("property_translations").insert(
        translations.map(({ id: _i, property_id: _p, ...t }) => ({
          ...t,
          property_id: newId,
        }))
      );
    }

    // ── 4. Copy images ─────────────────────────────────────────────────────
    const { data: images } = await supabaseAdmin
      .from("property_images")
      .select("*")
      .eq("property_id", sourceId);

    if (images?.length) {
      await supabaseAdmin.from("property_images").insert(
        images.map(({ id: _i, property_id: _p, created_at: _ca, ...img }) => ({
          ...img,
          property_id: newId,
        }))
      );
    }

    // ── 5. Copy videos ─────────────────────────────────────────────────────
    const { data: videos } = await supabaseAdmin
      .from("property_videos")
      .select("*")
      .eq("property_id", sourceId)
      .maybeSingle()
      .then(() => supabaseAdmin.from("property_videos").select("*").eq("property_id", sourceId));

    if (videos?.length) {
      await supabaseAdmin.from("property_videos").insert(
        videos.map(({ id: _i, property_id: _p, created_at: _ca, ...v }) => ({
          ...v,
          property_id: newId,
        }))
      );
    }

    // ── 6. Copy features / amenities ──────────────────────────────────────
    const featureTables = ["property_features", "property_amenities", "property_characteristics"];
    await Promise.allSettled(
      featureTables.map(async (table) => {
        const { data: rows } = await supabaseAdmin
          .from(table)
          .select("*")
          .eq("property_id", sourceId);
        if (rows?.length) {
          await supabaseAdmin.from(table).insert(
            rows.map(({ id: _i, property_id: _p, created_at: _ca, ...row }) => ({
              ...row,
              property_id: newId,
            }))
          );
        }
      })
    );

    // ── 7. Copy location data if stored separately ─────────────────────────
    const { data: locationRows } = await supabaseAdmin
      .from("property_locations")
      .select("*")
      .eq("property_id", sourceId);

    if (locationRows?.length) {
      await supabaseAdmin.from("property_locations").insert(
        locationRows.map(({ id: _i, property_id: _p, ...loc }) => ({
          ...loc,
          property_id: newId,
        }))
      );
    }

    return NextResponse.json({ ok: true, id: newId });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
