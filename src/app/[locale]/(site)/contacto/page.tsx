import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === "es";

  return {
    title: isEs ? "Contacto | Knordica" : "Contact Us | Knordica",
    description: isEs
      ? "Ponte en contacto con el equipo de Knordica. Estamos aquí para ayudarte a comprar, vender o invertir en Mérida, Venezuela."
      : "Get in touch with the Knordica team. We are here to help you buy, sell, or invest in Mérida, Venezuela.",
  };
}

export default async function ContactoPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  const whatsappNumber = "584122423334";
  const whatsappMessage = encodeURIComponent(
    locale === "es"
      ? "Hola Knordica, deseo solicitar asesoría sobre sus servicios inmobiliarios."
      : "Hello Knordica, I would like to request advisory on your real estate services."
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="pt-24 pb-16 min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border)] pb-8 mb-12">
        <div className="container-knordica">
          <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-semibold font-display block mb-2">
            {dict.nav?.contacto || "Contacto"}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-[var(--text)] leading-tight mb-2">
            {locale === "es" ? "¿Hablamos de tu próxima propiedad?" : "Let's talk about your next property"}
          </h1>
          <p className="text-sm md:text-base text-[var(--text-2)] font-light">
            {locale === "es" 
              ? "Estamos listos para ayudarte. Escríbenos o visítanos en nuestras oficinas en Mérida." 
              : "We are ready to help you. Write to us or visit us at our offices in Mérida."}
          </p>
        </div>
      </header>

      {/* Main Grid */}
      <div className="container-knordica">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Info Side */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {/* Quick Contact Cards */}
            <div className="flex flex-col gap-6">
              {/* WhatsApp direct CTA */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 rounded-sm border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/35 transition-all group cursor-pointer"
              >
                <div className="h-10 w-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 shrink-0">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-semibold text-emerald-400 font-display mb-0.5">
                    WhatsApp Directo
                  </h4>
                  <p className="text-sm font-bold text-[var(--text)] font-mono group-hover:text-emerald-400 transition-colors">
                    +58 412 242 3334
                  </p>
                </div>
              </a>

              {/* Call */}
              <div className="flex items-center gap-4 p-5 rounded-sm border border-[var(--border)] bg-[var(--surface-2)]/30">
                <div className="h-10 w-10 border border-[var(--border)] rounded-full flex items-center justify-center text-[var(--text-muted)] shrink-0">
                  <Phone className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display mb-0.5">
                    {locale === "es" ? "Teléfono" : "Phone Number"}
                  </h4>
                  <p className="text-sm font-bold text-[var(--text)] font-mono">
                    +58 412 242 3334
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4 p-5 rounded-sm border border-[var(--border)] bg-[var(--surface-2)]/30">
                <div className="h-10 w-10 border border-[var(--border)] rounded-full flex items-center justify-center text-[var(--text-muted)] shrink-0">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display mb-0.5">
                    {locale === "es" ? "Correo Electrónico" : "Email Address"}
                  </h4>
                  <p className="text-sm font-bold text-[var(--text)] font-mono">
                    contacto@knordica.com
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-4 p-5 rounded-sm border border-[var(--border)] bg-[var(--surface-2)]/30">
                <div className="h-10 w-10 border border-[var(--border)] rounded-full flex items-center justify-center text-[var(--text-muted)] shrink-0">
                  <MapPin className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display mb-0.5">
                    {locale === "es" ? "Dirección" : "Office Address"}
                  </h4>
                  <p className="text-sm font-bold text-[var(--text)] leading-snug">
                    Av. Los Próceres, Centro Profesional Albarregas, Mérida, Venezuela
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-center gap-4 p-5 rounded-sm border border-[var(--border)] bg-[var(--surface-2)]/30">
                <div className="h-10 w-10 border border-[var(--border)] rounded-full flex items-center justify-center text-[var(--text-muted)] shrink-0">
                  <Clock className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display mb-0.5">
                    {locale === "es" ? "Horario de Atención" : "Business Hours"}
                  </h4>
                  <p className="text-sm font-bold text-[var(--text)] leading-snug">
                    {locale === "es" 
                      ? "Lunes a Viernes: 8:30 AM — 5:30 PM" 
                      : "Monday to Friday: 8:30 AM — 5:30 PM"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
