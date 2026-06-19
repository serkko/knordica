import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { MOCK_PROPERTIES } from "@/lib/mock-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://knordica.com";
  const locales = ["es", "en"];
  const staticRoutes = ["", "/propiedades", "/mapa", "/contacto", "/nosotros", "/blog", "/herramientas", "/login"];

  // 1. Generate Static Pages URLs
  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const route of staticRoutes) {
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: route === "" ? 1.0 : 0.8,
      });
    }
  }

  // 2. Fetch dynamic properties from Supabase (or fallback to Mock)
  const hasSupabaseKeys = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD";

  let propertySlugs: string[] = [];
  let blogSlugs: string[] = [];

  if (hasSupabaseKeys) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: props } = await supabase
        .from("properties")
        .select("slug")
        .eq("status", "activa");
      
      if (props) {
        propertySlugs = props.map((p) => p.slug);
      }

      const { data: posts } = await supabase
        .from("blog_posts")
        .select("slug")
        .eq("published", true);

      if (posts) {
        blogSlugs = posts.map((p) => p.slug);
      }
    } catch (e) {
      console.error("Error fetching sitemap dynamic paths:", e);
    }
  } else {
    // Development fallback
    propertySlugs = MOCK_PROPERTIES.map((p) => p.slug);
    blogSlugs = ["tendencias-mercado-merida-2026", "guia-comprar-propiedad-venezuela"];
  }

  // Add Dynamic Properties URLs
  for (const slug of propertySlugs) {
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/propiedades/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  // Add Dynamic Blog Posts URLs
  for (const slug of blogSlugs) {
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  return sitemapEntries;
}
