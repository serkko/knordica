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
            price_negotiable,
            area_total,
            area_built,
            area_hectares,
            bedrooms,
            bathrooms,
            half_bathrooms,
            parking_spaces,
            parking_covered,
            lat,
            lng,
            municipio,
            show_exact_location,
            has_water_tank,
            has_generator,
            has_ac,
            has_internet,
            has_security_24h,
            furnished,
            condition,
            floor_number,
            amenities,
            listing_badge,
            completeness_score,
            video_url,
            price_per_night,
            min_nights,
            max_guests,
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
      if (filters.municipio) {
        query = query.eq("municipio", filters.municipio);
      }
      if (filters.furnished) {
        query = query.eq("furnished", filters.furnished);
      }
      if (filters.has_ac) {
        query = query.eq("has_ac", true);
      }
      if (filters.has_generator) {
        query = query.eq("has_generator", true);
      }
      if (filters.allows_pets) {
        query = query.eq("allows_pets", true);
      }
      if (filters.has_pool) {
        query = query.contains("amenities", ["piscina"]);
      }
      if (filters.min_area) {
        query = query.gte("area_built", filters.min_area);
      }
      if (filters.max_area) {
        query = query.lte("area_built", filters.max_area);
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
            
            // New schema_v2 fields
            listing_badge: item.listing_badge,
            has_generator: item.has_generator,
            has_water_tank: item.has_water_tank,
            has_ac: item.has_ac,
            furnished: item.furnished,
            municipio: item.municipio,
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
            videos:property_videos(*),
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
  // Fallback
  const foundMock = MOCK_PROPERTIES.find((p) => p.slug === slug);
  if (!foundMock) return null;

  const idNum = parseInt(foundMock.id.replace(/\D/g, "")) || 1;

  // High quality images gallery (ensure we have 3-5 images for each category)
  const categoryImages: Record<string, string[]> = {
    casa: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80"
    ],
    apartamento: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80"
    ],
    local: [
      "https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80"
    ],
    default: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"
    ]
  };

  const selectedImages = (categoryImages[foundMock.property_type] || categoryImages.default) as string[];
  
  let propertyImages = (foundMock as any).images || [];
  if (propertyImages.length < 4) {
    const existingUrls = propertyImages.map((img: any) => img.url);
    const extraImages = selectedImages
      .filter((url) => !existingUrls.includes(url))
      .map((url, i) => ({
        id: `${foundMock.id}-extra-img-${i}`,
        property_id: foundMock.id,
        url,
        alt_es: `Imagen adicional ${i + 1} de ${foundMock.title}`,
        alt_en: `Additional image ${i + 1} of ${foundMock.title}`,
        sort_order: propertyImages.length + i,
        is_cover: propertyImages.length === 0 && i === 0
      }));
    propertyImages = [...propertyImages, ...extraImages];
  }

  const constructionStatusOptions: ('terminado' | 'en_planos' | 'en_construccion' | 'entrega_inmediata')[] = ['terminado', 'en_planos', 'en_construccion', 'entrega_inmediata'];
  const construction_status = constructionStatusOptions[idNum % 4];

  const maintenance_fee = foundMock.property_type === 'terreno' ? null : (50 + (idNum % 5) * 35);
  const price_per_m2 = foundMock.area_built ? Math.round(foundMock.price / foundMock.area_built) : null;

  const descEs = (foundMock as any).description || `Esta espectacular propiedad de tipo ${foundMock.property_type} se encuentra ubicada en la prestigiosa zona de ${foundMock.zone?.name_es || 'Mérida'}. Con un área de construcción de ${foundMock.area_built || foundMock.area_total || 150}m² y un diseño arquitectónico contemporáneo, ofrece una excelente calidad de vida. Dispone de ${foundMock.bedrooms || 3} amplias habitaciones, ${foundMock.bathrooms || 2} baños de primera, y ${foundMock.parking_spaces || 2} cómodos puestos de estacionamiento. Se caracteriza por sus finos acabados, espectacular vista a la Sierra Nevada, y cercanía a los principales servicios de la zona. Ideal para familias o inversores que buscan valor a largo plazo.`;

  const descEn = (foundMock as any).description_en || `This spectacular ${foundMock.property_type} type property is located in the prestigious area of ${foundMock.zone?.name_en || 'Mérida'}. With a construction area of ${foundMock.area_built || foundMock.area_total || 150}sqm and a contemporary architectural design, it offers an excellent quality of life. It features ${foundMock.bedrooms || 3} spacious bedrooms, ${foundMock.bathrooms || 2} premium bathrooms, and ${foundMock.parking_spaces || 2} comfortable parking spaces. Characterized by its fine finishes, spectacular views of the Sierra Nevada mountains, and proximity to key local amenities. Ideal for families or investors seeking long-term value.`;

  return {
    id: foundMock.id,
    slug: foundMock.slug,
    operation: foundMock.operation || "venta",
    property_type: foundMock.property_type || "casa",
    status: (idNum % 10 === 0) ? "reservada" : (idNum % 10 === 9) ? "vendida" : "activa",
    featured: foundMock.featured || (idNum % 3 === 0),
    exclusive: foundMock.exclusive || (idNum % 4 === 0),
    new_listing: foundMock.new_listing || (idNum % 5 === 0),
    price_reduced: foundMock.price_reduced || (idNum % 6 === 0),
    price_negotiable: idNum % 2 === 0,
    listing_badge: (idNum % 5 === 0) ? "OPORTUNIDAD" : (idNum % 5 === 1) ? "ÚLTIMA UNIDAD" : (idNum % 5 === 2) ? "EXCLUSIVO" : null,
    completeness_score: 75 + (idNum % 25),
    
    price: foundMock.price,
    price_currency: foundMock.price_currency || "USD",
    price_per_m2,
    maintenance_fee,
    maintenance_fee_currency: "USD",

    area_built: foundMock.area_built || (foundMock.property_type === 'terreno' ? null : 150),
    area_total: foundMock.area_total || (foundMock.property_type === 'terreno' ? 800 : 250),
    area_hectares: foundMock.property_type === 'finca' ? 2.5 : null,
    floors: foundMock.property_type === 'casa' ? 2 : 1,
    floor_number: foundMock.property_type === 'apartamento' ? (3 + (idNum % 5)) : null,

    bedrooms: foundMock.bedrooms || (foundMock.property_type === 'terreno' ? null : 3),
    bathrooms: foundMock.bathrooms || (foundMock.property_type === 'terreno' ? null : 2),
    half_bathrooms: (foundMock.property_type === 'terreno' || foundMock.property_type === 'local') ? null : 1,
    parking_spaces: foundMock.parking_spaces || (foundMock.property_type === 'terreno' ? null : 2),
    service_rooms: (idNum % 3 === 0 && foundMock.property_type === 'casa') ? 1 : null,
    storage_rooms: (idNum % 2 === 0 && foundMock.property_type !== 'terreno') ? 1 : null,

    year_built: 2010 + (idNum % 14),
    construction_status,

    has_pool: idNum % 3 === 0,
    has_garden: idNum % 2 === 0,
    has_ac: idNum % 2 === 1,
    has_generator: idNum % 4 === 0,
    has_water_tank: true,
    has_security: idNum % 3 !== 0,
    has_elevator: foundMock.property_type === 'apartamento' && idNum % 2 === 0,
    allows_pets: idNum % 3 !== 1,
    furnished: idNum % 4 === 1,
    has_gym: idNum % 5 === 0,
    has_jacuzzi: idNum % 6 === 0,
    has_bbq: idNum % 4 === 0,
    has_laundry: idNum % 2 === 0,
    has_study: idNum % 5 === 1,
    has_cinema: idNum % 10 === 0,
    has_wine_cellar: idNum % 12 === 0,
    has_sauna: idNum % 8 === 0,
    has_terrace: idNum % 3 === 1,
    has_balcony: foundMock.property_type === 'apartamento',
    has_solar_panels: idNum % 9 === 0,

    address_es: (foundMock as any).address_es || `${foundMock.title}, Mérida, Venezuela`,
    address_en: (foundMock as any).address_en || `${foundMock.title}, Mérida, Venezuela`,
    municipio: (idNum % 3 === 0) ? "libertador" : (idNum % 3 === 1) ? "campo-elias" : "santos-marquina",
    lat: getMockCoordinates(foundMock.id, foundMock.zone?.lat ?? null, foundMock.zone?.lng ?? null).lat,
    lng: getMockCoordinates(foundMock.id, foundMock.zone?.lat ?? null, foundMock.zone?.lng ?? null).lng,
    zone: foundMock.zone || null,

    images: propertyImages,
    videos: [
      {
        id: `${foundMock.id}-vid-1`,
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        platform: "youtube",
        title_es: "Recorrido en Video",
        title_en: "Video Walkthrough",
        thumbnail_url: null
      }
    ],
    virtual_tour_url: idNum % 2 === 0 ? "https://my.matterport.com/show/?m=sxK15C9mG2Y" : null,
    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",

    agent_id: "agent-1",
    agent: {
      id: "agent-1",
      full_name: "Carlos Valera",
      email: "carlos@knordica.com",
      phone: "+58 412 242 3334",
      whatsapp: "5804122423334",
      avatar_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80",
      title: "Asesor Senior",
      bio_es: "Especialista en propiedades residenciales seleccionadas. 10 años en el mercado inmobiliario de los Andes venezolanos.",
      bio_en: "Specialist in selected residential properties. 10 years in the Venezuelan Andes real estate market.",
      languages: ["Español", "Inglés"]
    },

    translations: [
      { locale: "es", title: foundMock.title, description: descEs, short_description: foundMock.short_description },
      { locale: "en", title: foundMock.title, description: descEn, short_description: foundMock.short_description }
    ],
    features: [
      { id: `${foundMock.id}-feat-1`, key: "Clima", value_es: "Clima de montaña templado", value_en: "Mild mountain weather", icon: "cloud", group: "extras" },
      { id: `${foundMock.id}-feat-2`, key: "Vigilancia", value_es: "Vigilancia privada nocturna", value_en: "Private night watch", icon: "shield", group: "legal" },
      { id: `${foundMock.id}-feat-3`, key: "Agua", value_es: "Acceso a pozo natural", value_en: "Natural well water access", icon: "droplet", group: "servicios" }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString()
  } as any as Property;
}
