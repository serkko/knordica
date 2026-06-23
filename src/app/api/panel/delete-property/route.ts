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

    const { ids } = await req.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "IDs de propiedades requeridos" }, { status: 400 });
    }

    // ── Delete child relations first using admin client ───────────────────
    await Promise.allSettled([
      supabaseAdmin.from("property_translations").delete().in("property_id", ids),
      supabaseAdmin.from("property_images").delete().in("property_id", ids),
      supabaseAdmin.from("property_videos").delete().in("property_id", ids),
      supabaseAdmin.from("property_features").delete().in("property_id", ids),
      supabaseAdmin.from("property_amenities").delete().in("property_id", ids),
      supabaseAdmin.from("property_characteristics").delete().in("property_id", ids),
      supabaseAdmin.from("property_locations").delete().in("property_id", ids),
    ]);

    // ── Finally delete properties ─────────────────────────────────────────
    const { error: deleteErr } = await supabaseAdmin
      .from("properties")
      .delete()
      .in("id", ids);

    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
