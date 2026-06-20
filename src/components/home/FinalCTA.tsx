"use client";

import { motion } from "framer-motion";
import { MessageCircle, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/layout/LocaleProvider";

export function FinalCTA() {
  const { locale, dict } = useLocale();

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP || "584122423334";
  const whatsappMessage = encodeURIComponent(
    locale === "es"
      ? "Hola, estoy interesado en recibir asesoría sobre propiedades en Mérida."
      : "Hello, I am interested in receiving advice about properties in Mérida, Venezuela."
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <section className="section-y border-t border-[var(--border)] relative overflow-hidden bg-radial from-[var(--accent-dim)] via-transparent to-transparent">
      {/* Decorative gradient spot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-[var(--accent-glow)] filter blur-[120px] pointer-events-none select-none -z-10 opacity-60" />

      <div className="container-knordica">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto glass p-8 sm:p-12 md:p-16 rounded-sm border border-[var(--border-strong)] text-center shadow-[var(--shadow-lg)]"
        >
          <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-semibold font-display block mb-3">
            {dict.contact?.title || "Hablemos"}
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display tracking-tight text-[var(--text)] mb-6 max-w-2xl mx-auto leading-tight">
            {locale === "es"
              ? "¿Listo para encontrar tu propiedad ideal?"
              : "Ready to find your ideal property?"}
          </h2>

          <p className="text-sm sm:text-base text-[var(--text-2)] max-w-xl mx-auto mb-10 font-light leading-relaxed">
            {dict.contact?.subtitle ||
              "Cuéntanos qué estás buscando. Nuestro equipo estará en contacto contigo en menos de 24 horas."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* WhatsApp CTA */}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20ba59] border-0 text-white font-display uppercase tracking-wider text-xs h-12 px-8">
                <MessageCircle className="h-4.5 w-4.5 fill-current stroke-none" />
                <span>{dict.contact?.whatsapp || "Escribir por WhatsApp"}</span>
              </Button>
            </a>

            {/* Email Contact Page */}
            <Link href={`/${locale}/contacto`} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto font-display uppercase tracking-wider text-xs h-12 px-8">
                <Mail className="h-4 w-4" />
                <span>{locale === "es" ? "Formulario de contacto" : "Contact form"}</span>
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
