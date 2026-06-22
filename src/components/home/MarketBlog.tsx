"use client";

import { motion, type Transition } from "framer-motion";
import { EASE_EXPO } from "@/lib/motion/variants";
import { ArrowRight, BookOpen, Calendar, User } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useLocale } from "@/components/layout/LocaleProvider";
import type { BlogPostCard } from "@/lib/queries/blog";

interface MarketBlogProps {
  posts: BlogPostCard[];
}

export function MarketBlog({ posts }: MarketBlogProps) {
  const { locale, dict } = useLocale();

  const getCategoryLabel = (cat: string) => {
    const categories: Record<string, string> = dict.blog?.categorias || {
      mercado: "Mercado",
      inversion: "Inversión",
      guias: "Guías",
      legal: "Legal",
      zonas: "Zonas",
      noticias: "Noticias",
    };
    return categories[cat] || cat;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(locale === "es" ? "es-VE" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: EASE_EXPO } as Transition,
    },
  };

  return (
    <section className="section-y border-t border-[var(--border)]">
      <div className="container-knordica">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16">
          <div className="max-w-2xl">
            <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-semibold font-display block mb-2">
              {dict.blog?.title || "Inteligencia de mercado"}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-[var(--text)]">
              {dict.blog?.subtitle || "Análisis, guías y perspectivas sobre el mercado inmobiliario de Mérida"}
            </h2>
          </div>
          <Link
            href={`/${locale}/blog`}
            className="group mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider font-display text-[var(--text-2)] hover:text-[var(--accent)] transition-colors"
          >
            <span>{dict.blog?.verTodos || "Ver todos los artículos"}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Blog Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {posts.map((post) => (
            <motion.div key={post.id} variants={itemVariants} className="h-full">
              <Link href={`/${locale}/blog/${post.slug}`} className="block h-full group">
                <Card className="h-full p-8 flex flex-col justify-between border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] transition-all">
                  <div>
                    {/* Meta category & date */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] font-medium mb-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-[var(--surface-2)] text-[var(--text-2)] uppercase font-mono tracking-wider">
                        <BookOpen className="h-3 w-3 text-[var(--accent)]" />
                        {getCategoryLabel(post.category)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.published_at)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-bold font-display tracking-tight text-[var(--text)] mb-3 group-hover:text-[var(--accent)] transition-colors">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-[var(--text-2)] leading-relaxed font-light mb-6">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Footer metadata */}
                  <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 mt-auto">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
                      <User className="h-3.5 w-3.5" />
                      <span>{post.author_name}</span>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider font-display text-[var(--text-2)] group-hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1">
                      {dict.blog?.leer || "Leer artículo"}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
