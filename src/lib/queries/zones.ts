import { MOCK_ZONES } from "../mock-data";
import type { Zone } from "@/types/property";
import { createClient as createBrowserClient } from "../supabase/client";

async function getSupabaseClient() {
  if (typeof window === "undefined") {
    try {
      const { createClient } = await import("../supabase/server");
      return await createClient();
    } catch {
      return null;
    }
  } else {
    try {
      return createBrowserClient();
    } catch {
      return null;
    }
  }
}

export async function getZones(): Promise<Zone[]> {
  const supabase = await getSupabaseClient();

  if (supabase && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD") {
    try {
      const { data, error } = await supabase
        .from("zones")
        .select("*")
        .order("name_es", { ascending: true });

      if (!error && data) {
        return data as Zone[];
      }
      console.warn("Supabase zones query error, falling back to mock:", error);
    } catch (e) {
      console.warn("Supabase zones exception, falling back to mock:", e);
    }
  }

  return MOCK_ZONES;
}

export async function getFeaturedZones(): Promise<Zone[]> {
  const zones = await getZones();
  return zones.filter((z) => z.featured);
}
