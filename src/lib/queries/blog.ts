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
    cover_image_url: null,
    published_at: "2026-05-12T10:00:00Z",
    featured: true,
    title: "Tendencias de Inversión Inmobiliaria en Mérida 2026",
    excerpt: "Analizamos el crecimiento de la demanda residencial de alta gama y cuáles son las zonas con mayor plusvalía proyectada.",
    author_name: "María Fernanda Rodríguez",
  },
  {
    id: "post-2",
    slug: "guia-compra-propiedades-venezuela-desde-exterior",
    category: "guias",
    cover_image_url: null,
    published_at: "2026-06-02T14:30:00Z",
    featured: false,
    title: "Guía para Comprar Propiedades en Venezuela desde el Exterior",
    excerpt: "Aspectos legales, transferencias seguras y cómo realizar todo el proceso a distancia con total seguridad jurídica.",
    author_name: "Carlos Valera",
  },
];

const MOCK_POSTS_EN: BlogPostCard[] = [
  {
    id: "post-1",
    slug: "tendencias-inversion-inmobiliaria-merida-2026",
    category: "market",
    cover_image_url: null,
    published_at: "2026-05-12T10:00:00Z",
    featured: true,
    title: "Real Estate Investment Trends in Mérida 2026",
    excerpt: "We analyze the growth of high-end residential demand and identify the neighborhoods with the highest projected appreciation.",
    author_name: "María Fernanda Rodríguez",
  },
  {
    id: "post-2",
    slug: "guia-compra-propiedades-venezuela-desde-exterior",
    category: "guides",
    cover_image_url: null,
    published_at: "2026-06-02T14:30:00Z",
    featured: false,
    title: "Guide to Buying Properties in Venezuela from Abroad",
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
