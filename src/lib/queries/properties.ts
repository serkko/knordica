import { MOCK_PROPERTIES } from "../mock-data";
import type { PropertyCard, PropertyFilters, Property } from "@/types/property";
import { createClient as createBrowserClient } from "../supabase/client";

// Detect if we can use Supabase server-side or client-side
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

function getMockCoordinates(id: string, zoneLat: number | null, zoneLng: number | null) {
  if (!zoneLat || !zoneLng) return { lat: null, lng: null };
  let latOffset = 0;
  let lngOffset = 0;
  if (id === "prop-1") { latOffset = 0.002; lngOffset = -0.002; }
  else if (id === "prop-4") { latOffset = -0.002; lngOffset = 0.002; }
  else if (id === "prop-8") { latOffset = 0.001; lngOffset = 0.005; }
  else if (id === "prop-2") { latOffset = 0.002; lngOffset = 0.002; }
  else if (id === "prop-7") { latOffset = -0.002; lngOffset = -0.002; }
  else if (id === "prop-3") { latOffset = 0.002; lngOffset = -0.003; }
  else if (id === "prop-5") { latOffset = 0.001; lngOffset = -0.002; }
  else if (id === "prop-6") { latOffset = 0.002; lngOffset = -0.002; }
  return { lat: zoneLat + latOffset, lng: zoneLng + lngOffset };
}

export async function getProperties(filters: PropertyFilters = {}): Promise<{
  data: PropertyCard[];
  count: number;
}> {
  const supabase = await getSupabaseClient();

  if (supabase && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD") {
    try {
      // Check total active properties in DB first. If less than 30, fallback to MOCK.
      const { count: totalDbCount } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("status", "activa");

      if (totalDbCount && totalDbCount >= 30) {
        let query = supabase
          .from("properties")
          .select(`
            id,
            slug,
            operation,
            property_type,
            status,
            featured,
            exclusive,
            new_listing,
            price_reduced,
            price,
            price_currency,
            area_total,
            area_built,
            bedrooms,
            bathrooms,
            parking_spaces,
            lat,
            lng,
            zone:zones(*),
            translations:property_translations(locale, title, short_description),
            images:property_images(id, url, alt_es, alt_en, is_cover, sort_order)
          `, { count: "exact" })
          .eq("status", "activa");

      if (filters.operacion) {
        query = query.eq("operation", filters.operacion);
      }
      if (filters.tipo) {
        query = query.eq("property_type", filters.tipo);
      }
      if (filters.zona) {
        query = query.eq("zone.slug", filters.zona);
      }
      if (filters.precio_min) {
        query = query.gte("price", filters.precio_min);
      }
      if (filters.precio_max) {
        query = query.lte("price", filters.precio_max);
      }
      if (filters.habitaciones) {
        query = query.gte("bedrooms", filters.habitaciones);
      }
      if (filters.banos) {
        query = query.gte("bathrooms", filters.banos);
      }
      if (filters.destacadas) {
        query = query.eq("featured", true);
      }
      if (filters.nuevas) {
        query = query.eq("new_listing", true);
      }

      // Sorting
      if (filters.sort) {
        if (filters.sort === "recientes") {
          query = query.order("created_at", { ascending: false });
        } else if (filters.sort === "precio_asc") {
          query = query.order("price", { ascending: true });
        } else if (filters.sort === "precio_desc") {
          query = query.order("price", { ascending: false });
        } else if (filters.sort === "area_desc") {
          query = query.order("area_total", { ascending: false });
        }
      } else {
        query = query.order("featured", { ascending: false }).order("created_at", { ascending: false });
      }

      // Pagination
      const page = filters.page ?? 1;
      const perPage = filters.per_page ?? 12;
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (!error && data && data.length > 0) {
        const locale = typeof window !== "undefined" && window.location.pathname.startsWith("/en") ? "en" : "es";
        
        const mappedData: PropertyCard[] = data.map((item: any) => {
          const trans = item.translations?.find((t: any) => t.locale === locale) || 
                        item.translations?.[0] || 
                        { title: "Propiedad sin título", short_description: "" };

          const coverImage = item.images?.find((img: any) => img.is_cover) || item.images?.[0] || null;

          return {
            id: item.id,
            slug: item.slug,
            operation: item.operation,
            property_type: item.property_type,
            status: item.status,
            featured: item.featured,
            exclusive: item.exclusive,
            new_listing: item.new_listing,
            price_reduced: item.price_reduced,
            price: Number(item.price),
            price_currency: item.price_currency || "USD",
            area_total: item.area_total,
            area_built: item.area_built,
            bedrooms: item.bedrooms,
            bathrooms: item.bathrooms,
            parking_spaces: item.parking_spaces,
            zone: item.zone,
            cover_image: coverImage,
            lat: item.lat ? Number(item.lat) : null,
            lng: item.lng ? Number(item.lng) : null,
            title: trans.title,
            short_description: trans.short_description,
          };
        });

        return { data: mappedData, count: count ?? mappedData.length };
      }
    }
    } catch (e) {
      console.warn("Supabase exception, falling back to mock:", e);
    }
  }

  // Fallback to local mock data
  let filtered = [...MOCK_PROPERTIES];

  if (filters.operacion) {
    filtered = filtered.filter((p) => p.operation === filters.operacion);
  }
  if (filters.tipo) {
    filtered = filtered.filter((p) => p.property_type === filters.tipo);
  }
  if (filters.zona) {
    filtered = filtered.filter((p) => p.zone?.slug === filters.zona);
  }
  if (filters.precio_min) {
    filtered = filtered.filter((p) => p.price >= filters.precio_min!);
  }
  if (filters.precio_max) {
    filtered = filtered.filter((p) => p.price <= filters.precio_max!);
  }
  if (filters.habitaciones) {
    filtered = filtered.filter((p) => (p.bedrooms ?? 0) >= filters.habitaciones!);
  }
  if (filters.banos) {
    filtered = filtered.filter((p) => (p.bathrooms ?? 0) >= filters.banos!);
  }
  if (filters.destacadas) {
    filtered = filtered.filter((p) => p.featured);
  }
  if (filters.nuevas) {
    filtered = filtered.filter((p) => p.new_listing);
  }
  if (filters.area_min) {
    filtered = filtered.filter((p) => (p.area_total ?? p.area_built ?? 0) >= filters.area_min!);
  }
  if (filters.area_max) {
    filtered = filtered.filter((p) => (p.area_total ?? p.area_built ?? 999999) <= filters.area_max!);
  }

  // Sorting
  if (filters.sort) {
    if (filters.sort === "precio_asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.sort === "precio_desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (filters.sort === "area_desc") {
      filtered.sort((a, b) => (b.area_total ?? 0) - (a.area_total ?? 0));
    }
  }

  const count = filtered.length;
  const page = filters.page ?? 1;
  const perPage = filters.per_page ?? 12;
  const from = (page - 1) * perPage;
  const to = from + perPage;
  const mappedFiltered = filtered.map((p) => {
    const coords = getMockCoordinates(p.id, p.zone?.lat ?? null, p.zone?.lng ?? null);
    return {
      ...p,
      lat: coords.lat,
      lng: coords.lng,
    };
  });

  return { data: mappedFiltered, count };
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const supabase = await getSupabaseClient();

  if (supabase && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD") {
    try {
      // Check total active properties in DB first. If less than 30, fallback to MOCK.
      const { count: totalDbCount } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("status", "activa");

      if (totalDbCount && totalDbCount >= 30) {
        const { data, error } = await supabase
          .from("properties")
          .select(`
            *,
            zone:zones(*),
            agent:agents(*),
            images:property_images(*),
            features:property_features(*),
            translations:property_translations(*)
          `)
          .eq("slug", slug)
          .single();

        if (!error && data) {
          return data as Property;
        }
      }
    } catch (e) {
      console.warn("Supabase exception, falling back to mock:", e);
    }
  }

  // Fallback
  const foundMock = MOCK_PROPERTIES.find((p) => p.slug === slug);
  if (!foundMock) return null;

  return {
    id: foundMock.id,
    slug: foundMock.slug,
    operation: foundMock.operation,
    property_type: foundMock.property_type,
    status: foundMock.status,
    featured: foundMock.featured,
    exclusive: foundMock.exclusive,
    new_listing: foundMock.new_listing,
    price_reduced: foundMock.price_reduced,
    price: foundMock.price,
    price_currency: foundMock.price_currency,
    price_negotiable: true,
    price_history: [],
    area_total: foundMock.area_total,
    area_built: foundMock.area_built,
    bedrooms: foundMock.bedrooms,
    bathrooms: foundMock.bathrooms,
    half_bathrooms: 0,
    parking_spaces: foundMock.parking_spaces,
    zone_id: foundMock.zone?.id || null,
    address_es: "Mérida, Venezuela",
    address_en: "Mérida, Venezuela",
    lat: getMockCoordinates(foundMock.id, foundMock.zone?.lat ?? null, foundMock.zone?.lng ?? null).lat,
    lng: getMockCoordinates(foundMock.id, foundMock.zone?.lat ?? null, foundMock.zone?.lng ?? null).lng,
    agent_id: "agent-1",
    meta_title_es: foundMock.title,
    meta_title_en: foundMock.title,
    meta_description_es: foundMock.short_description,
    meta_description_en: foundMock.short_description,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    zone: foundMock.zone || null,
    agent: null,
    images: foundMock.images || [],
    features: [
      { id: "f1", property_id: foundMock.id, category: "general", key: "clima", value_es: "Clima de montaña", value_en: "Mountain weather", icon: "cloud" },
      { id: "f2", property_id: foundMock.id, category: "seguridad", key: "vigilancia", value_es: "Vigilancia privada", value_en: "Private security", icon: "shield" }
    ]
  };
}
