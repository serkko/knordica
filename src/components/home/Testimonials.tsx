"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useLocale } from "@/components/layout/LocaleProvider";

interface Testimonial {
  id: string;
  author_name: string;
  author_title: string;
  quote_es: string;
  quote_en: string;
  rating: number;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  const { locale, dict } = useLocale();

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
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="section-y border-t border-[var(--border)] bg-[var(--bg-alt)]/50 relative overflow-hidden">
      <div className="container-knordica">
        {/* Section Header */}
        <div className="max-w-2xl mb-12 md:mb-16">
          <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-semibold font-display block mb-2">
            {dict.testimonials?.title || "Lo que dicen nuestros clientes"}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-[var(--text)]">
            {dict.testimonials?.subtitle || "Experiencias reales de personas que confiaron en Knordica"}
          </h2>
        </div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {testimonials.map((t) => {
            const quote = locale === "es" ? t.quote_es : t.quote_en;

            return (
              <motion.div key={t.id} variants={itemVariants} className="h-full">
                <Card className="h-full p-8 flex flex-col justify-between border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] transition-all relative overflow-hidden group">
                  {/* Decorative Quote Icon in background */}
                  <div className="absolute top-6 right-6 text-[var(--border-strong)] opacity-20 group-hover:scale-110 transition-transform">
                    <Quote className="h-8 w-8" />
                  </div>

                  <div>
                    {/* Rating stars */}
                    <div className="flex gap-1 mb-6">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-[var(--gold)] text-[var(--gold)]" />
                      ))}
                    </div>

                    {/* Quote text */}
                    <p className="text-sm md:text-base text-[var(--text-2)] italic leading-relaxed font-light mb-8">
                      &ldquo;{quote}&rdquo;
                    </p>
                  </div>

                  {/* Author metadata */}
                  <div>
                    <h4 className="text-base font-bold font-display tracking-tight text-[var(--text)]">
                      {t.author_name}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
                      {t.author_title}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
