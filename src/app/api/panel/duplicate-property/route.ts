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
      .insert({ ...rest, slug: newSlug, featured: false, exclusive: false })
      .select()
      .single();

    if (insertErr || !inserted) {
      return NextResponse.json({ error: insertErr?.message ?? "Error al insertar" }, { status: 400 });
    }

    const newId = inserted.id;

    // ── 3. Fetch all children in parallel ──────────────────────────────────
    const [
      { data: translations },
      { data: images },
      { data: videos },
      { data: features },
      { data: amenities },
      { data: characteristics },
      { data: locations }
    ] = await Promise.all([
      supabaseAdmin.from("property_translations").select("*").eq("property_id", sourceId),
      supabaseAdmin.from("property_images").select("*").eq("property_id", sourceId),
      supabaseAdmin.from("property_videos").select("*").eq("property_id", sourceId),
      supabaseAdmin.from("property_features").select("*").eq("property_id", sourceId),
      supabaseAdmin.from("property_amenities").select("*").eq("property_id", sourceId),
      supabaseAdmin.from("property_characteristics").select("*").eq("property_id", sourceId),
      supabaseAdmin.from("property_locations").select("*").eq("property_id", sourceId),
    ]);

    // ── 4. Insert all children in parallel with modified titles ────────────
    const insertPromises: any[] = [];

    if (translations?.length) {
      insertPromises.push(
        supabaseAdmin.from("property_translations").insert(
          translations.map(({ id: _i, property_id: _p, ...t }) => ({
            ...t,
            title: `${t.title || ""} (Copia)`,
            property_id: newId,
          }))
        )
      );
    }

    if (images?.length) {
      insertPromises.push(
        supabaseAdmin.from("property_images").insert(
          images.map(({ id: _i, property_id: _p, created_at: _ca, ...img }) => ({
            ...img,
            property_id: newId,
          }))
        )
      );
    }

    if (videos?.length) {
      insertPromises.push(
        supabaseAdmin.from("property_videos").insert(
          videos.map(({ id: _i, property_id: _p, created_at: _ca, ...v }) => ({
            ...v,
            property_id: newId,
          }))
        )
      );
    }

    if (features?.length) {
      insertPromises.push(
        supabaseAdmin.from("property_features").insert(
          features.map(({ id: _i, property_id: _p, created_at: _ca, ...f }) => ({
            ...f,
            property_id: newId,
          }))
        )
      );
    }

    if (amenities?.length) {
      insertPromises.push(
        supabaseAdmin.from("property_amenities").insert(
          amenities.map(({ id: _i, property_id: _p, created_at: _ca, ...a }) => ({
            ...a,
            property_id: newId,
          }))
        )
      );
    }

    if (characteristics?.length) {
      insertPromises.push(
        supabaseAdmin.from("property_characteristics").insert(
          characteristics.map(({ id: _i, property_id: _p, created_at: _ca, ...c }) => ({
            ...c,
            property_id: newId,
          }))
        )
      );
    }

    if (locations?.length) {
      insertPromises.push(
        supabaseAdmin.from("property_locations").insert(
          locations.map(({ id: _i, property_id: _p, ...loc }) => ({
            ...loc,
            property_id: newId,
          }))
        )
      );
    }

    await Promise.all(insertPromises);

    return NextResponse.json({ ok: true, id: newId });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
