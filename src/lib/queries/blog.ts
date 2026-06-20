import { createClient as createBrowserClient } from "../supabase/client";

export interface BlogPostCard {
  id: string;
  slug: string;
  category: string;
  cover_image_url: string | null;
  published_at: string;
  featured: boolean;
  title: string;
  excerpt: string;
  author_name: string;
}

export interface BlogPostDetail extends BlogPostCard {
  content: string;
}

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

const MOCK_POSTS: BlogPostCard[] = [
  {
    id: "post-1",
    slug: "tendencias-inversion-inmobiliaria-merida-2026",
    category: "mercado",
    cover_image_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
    published_at: "2026-05-12T10:00:00Z",
    featured: true,
    title: "Tendencias de Inversión Inmobiliaria en Mérida, Venezuela 2026",
    excerpt: "Analizamos el crecimiento de la demanda residencial seleccionada y cuáles son las zonas con mayor plusvalía proyectada.",
    author_name: "María Fernanda Rodríguez",
  },
  {
    id: "post-2",
    slug: "guia-compra-propiedades-venezuela-desde-exterior",
    category: "guias",
    cover_image_url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80",
    published_at: "2026-06-02T14:30:00Z",
    featured: false,
    title: "Guía para Comprar Propiedades en Mérida desde el Exterior",
    excerpt: "Aspectos legales, transferencias seguras y cómo realizar todo el proceso a distancia con total seguridad jurídica.",
    author_name: "Carlos Valera",
  },
];

const MOCK_POSTS_EN: BlogPostCard[] = [
  {
    id: "post-1",
    slug: "tendencias-inversion-inmobiliaria-merida-2026",
    category: "market",
    cover_image_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
    published_at: "2026-05-12T10:00:00Z",
    featured: true,
    title: "Real Estate Investment Trends in Mérida, Venezuela 2026",
    excerpt: "We analyze the growth of selected residential demand and identify the neighborhoods with the highest projected appreciation.",
    author_name: "María Fernanda Rodríguez",
  },
  {
    id: "post-2",
    slug: "guia-compra-propiedades-venezuela-desde-exterior",
    category: "guides",
    cover_image_url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80",
    published_at: "2026-06-02T14:30:00Z",
    featured: false,
    title: "Guide to Buying Properties in Mérida, Venezuela from Abroad",
    excerpt: "Legal requirements, secure funds routing, and how to execute the entire process remotely with absolute peace of mind.",
    author_name: "Carlos Valera",
  },
];

export async function getBlogPosts(locale: "es" | "en" = "es"): Promise<BlogPostCard[]> {
  const supabase = await getSupabaseClient();

  if (supabase && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD") {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          id,
          slug,
          category,
          cover_image_url,
          published_at,
          featured,
          author:agents(full_name),
          translations:blog_post_translations(locale, title, excerpt)
        `)
        .eq("published", true)
        .order("published_at", { ascending: false });

      if (!error && data) {
        return data.map((post: any) => {
          const trans = post.translations?.find((t: any) => t.locale === locale) || 
                        post.translations?.[0] || 
                        { title: "", excerpt: "" };
          
          return {
            id: post.id,
            slug: post.slug,
            category: post.category,
            cover_image_url: post.cover_image_url,
            published_at: post.published_at,
            featured: post.featured,
            title: trans.title,
            excerpt: trans.excerpt,
            author_name: post.author?.full_name || "Knordica Editorial",
          };
        });
      }
    } catch (e) {
      console.warn("Supabase blog posts query exception, falling back to mock:", e);
    }
  }

  return locale === "en" ? MOCK_POSTS_EN : MOCK_POSTS;
}

export async function getBlogPostBySlug(slug: string, locale: "es" | "en" = "es"): Promise<BlogPostDetail | null> {
  const supabase = await getSupabaseClient();

  if (supabase && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD") {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          id,
          slug,
          category,
          cover_image_url,
          published_at,
          featured,
          author:agents(full_name),
          translations:blog_post_translations(locale, title, excerpt, content)
        `)
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (!error && data) {
        const trans = data.translations?.find((t: any) => t.locale === locale) || 
                      data.translations?.[0] || 
                      { title: "", excerpt: "", content: "" };

        return {
          id: data.id,
          slug: data.slug,
          category: data.category,
          cover_image_url: data.cover_image_url,
          published_at: data.published_at,
          featured: data.featured,
          title: trans.title,
          excerpt: trans.excerpt,
          content: trans.content,
          author_name: (Array.isArray(data.author) 
            ? (data.author[0] as any)?.full_name 
            : (data.author as any)?.full_name) || "Knordica Editorial",
        };
      }
    } catch (e) {
      console.warn("Supabase single blog post query exception, falling back to mock:", e);
    }
  }

  // Fallback to mock data
  const basePosts = locale === "en" ? MOCK_POSTS_EN : MOCK_POSTS;
  const found = basePosts.find((p) => p.slug === slug);
  if (!found) return null;

  const mockContentEs = `
# ${found.title}

El mercado inmobiliario en Mérida ha mostrado una resiliencia particular en el segmento residencial seleccionado. Con el retorno de capital de venezolanos en el exterior y nuevas inversiones locales, zonas clave están registrando un crecimiento sostenido de valor.

## Sectores de mayor crecimiento y plusvalía

1. **La Pedregosa**: Favorita por sus vistas y su clima fresco. Las propiedades con acabados modernos, plantas de energía autónomas y seguridad privada son las más cotizadas de la actualidad.
2. **El Encanto**: Destaca por sus grandes casas de campo integradas con la naturaleza andina, ideales para familias que buscan tranquilidad y contacto con la naturaleza.
3. **Las Tapias**: Presenta una fuerte plusvalía gracias al desarrollo residencial multifamiliar y comercial de los últimos años.

## Factores clave a considerar al invertir

- **Seguridad**: Los conjuntos cerrados con vigilancia privada permanente siguen liderando las preferencias de compra en todos los sectores residenciales de la región.
- **Autonomía de Servicios**: Contar con pozos de agua propios, tanques de gran almacenamiento y sistemas eléctricos auxiliares añade valor sustancial a cualquier propiedad.
- **Operación Financiera Segura**: Todas las transacciones se cotizan y liquidan en USD, ofreciendo estabilidad y transparencia al comprador y vendedor.
  `;

  const mockContentEn = `
# ${found.title}

Mérida's real estate market has shown notable resilience in the selected residential segment. Driven by capital returning from Venezuelans abroad and new local investment, key zones are recording sustained value growth.

## Fast Growing Sectors in the Venezuelan Andes

1. **La Pedregosa**: Preferred for its mountain views and cool climate. Properties featuring contemporary architecture, backup power systems, and private security are the most sought-after today.
2. **El Encanto**: Known for its spacious country estates nestled within the Andes nature, perfect for families looking for peaceful retreats and clean environments.
3. **Las Tapias**: Experiencing high capital gains due to major multifamily residential and modern commercial developments in recent years.

## Key Considerations for Investing

- **Private Security**: Gated communities with round-the-clock security guards remain the highest priority for buyers across the region.
- **Utility Independence**: Homes equipped with private water systems, large storage tanks, and solar or backup generators carry a massive added value.
- **Secure Financial Transactions**: All transactions are valued and closed in USD, offering full price stability and transaction clarity.
  `;

  return {
    ...found,
    content: locale === "en" ? mockContentEn : mockContentEs,
  };
}
