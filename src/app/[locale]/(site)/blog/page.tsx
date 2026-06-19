import type { Metadata } from "next";
import Link from "next/link";
import { Clock, User, ArrowRight } from "lucide-react";
import { getBlogPosts } from "@/lib/queries/blog";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === "es";

  return {
    title: isEs ? "Editorial Inmobiliaria | Knordica" : "Real Estate Intelligence Blog | Knordica",
    description: isEs
      ? "Tendencias de mercado, guías de inversión y análisis técnico sobre el sector inmobiliario en Mérida, Venezuela."
      : "Market trends, investment guides, and technical real estate analysis in Mérida, Venezuela.",
  };
}

export default async function BlogPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  
  const posts = await getBlogPosts(locale as Locale);

  const getCategoryLabel = (cat: string) => {
    const cats: Record<string, string> = {
      mercado: locale === "es" ? "Mercado" : "Market",
      guias: locale === "es" ? "Guías" : "Guides",
      market: "Market",
      guides: "Guides",
    };
    return cats[cat] || cat;
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border)] pb-8 mb-12">
        <div className="container-knordica">
          <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-semibold font-display block mb-2">
            {locale === "es" ? "Editorial" : "Editorial Blog"}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-[var(--text)] leading-tight mb-2">
            {locale === "es" ? "Inteligencia inmobiliaria" : "Real estate intelligence"}
          </h1>
          <p className="text-sm md:text-base text-[var(--text-2)] font-light">
            {locale === "es" 
              ? "Tendencias de mercado, guías y análisis técnico sobre inversión en Mérida." 
              : "Market trends, buying guides, and technical analysis on investing in Mérida."}
          </p>
        </div>
      </header>

      {/* Grid */}
      <div className="container-knordica">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => {
            const formattedDate = new Date(post.published_at).toLocaleDateString(
              locale === "es" ? "es-VE" : "en-US",
              { year: "numeric", month: "long", day: "numeric" }
            );

            return (
              <Link key={post.id} href={`/${locale}/blog/${post.slug}`} className="group block">
                <Card className="h-full flex flex-col overflow-hidden border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] transition-all">
                  {/* Post Image */}
                  {post.cover_image_url && (
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-900 border-b border-[var(--border)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                      />
                    </div>
                  )}

                  {/* Body */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      {/* Meta Row */}
                      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] font-mono mb-4">
                        <Badge variant="accent" className="font-sans font-bold text-[9px] tracking-wider uppercase">
                          {getCategoryLabel(post.category)}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg md:text-xl font-bold font-display tracking-tight text-[var(--text)] leading-snug group-hover:text-[var(--accent)] transition-colors mb-3 line-clamp-2">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-xs md:text-sm text-[var(--text-2)] font-light leading-relaxed mb-6 line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Footer / Author */}
                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] mt-auto text-xs">
                      <div className="flex items-center gap-2 text-[var(--text-2)]">
                        <div className="h-6 w-6 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] font-bold text-[10px]">
                          {post.author_name.charAt(0)}
                        </div>
                        <span className="font-light">{post.author_name}</span>
                      </div>
                      
                      <span className="font-semibold uppercase tracking-wider font-display text-[var(--accent)] group-hover:text-[var(--text)] transition-colors flex items-center gap-1">
                        <span>{locale === "es" ? "Leer artículo" : "Read post"}</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
