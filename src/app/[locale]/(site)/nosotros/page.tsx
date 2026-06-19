import type { Metadata } from "next";
import { User, Phone, Mail, Award, Target, Eye } from "lucide-react";
import { MOCK_AGENTS } from "@/lib/mock-data";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === "es";

  return {
    title: isEs ? "Sobre Nosotros | Knordica" : "About Us | Knordica",
    description: isEs
      ? "Conoce a Knordica, la firma inmobiliaria digital líder en Mérida, Venezuela. Descubre nuestra historia, equipo y filosofía."
      : "Meet Knordica, the leading digital real estate firm in Mérida, Venezuela. Discover our history, team, and philosophy.",
  };
}

export default async function NosotrosPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <div className="pt-24 pb-16 min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border)] pb-8 mb-12">
        <div className="container-knordica">
          <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-semibold font-display block mb-2">
            {locale === "es" ? "Quiénes Somos" : "Who We Are"}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-[var(--text)] leading-tight mb-2">
            {locale === "es" ? "El estándar digital de Mérida" : "Mérida's digital standard"}
          </h1>
          <p className="text-sm md:text-base text-[var(--text-2)] font-light">
            {locale === "es" 
              ? "Knordica es una firma inmobiliaria contemporánea comprometida con la excelencia visual y operativa." 
              : "Knordica is a contemporary real estate firm committed to visual and operational excellence."}
          </p>
        </div>
      </header>

      {/* Narrative Section */}
      <section className="container-knordica mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col gap-6 text-sm text-[var(--text-2)] font-light leading-relaxed">
            <p>
              {locale === "es" 
                ? "Nacimos en Mérida con una visión clara: romper con la informalidad del sector inmobiliario tradicional. Creemos que la adquisición o venta de un inmueble no es una simple transacción; es la materialización de un logro de vida o un paso estratégico de inversión."
                : "We were born in Mérida with a clear vision: to break away from the informality of traditional real estate. We believe that acquiring or selling a property is not a simple transaction; it is the materialization of a life achievement or a strategic investment step."}
            </p>
            <p>
              {locale === "es"
                ? "Por eso, nos aliamos con firmas líderes de diseño digital como Xelta Studios para construir una plataforma que ponga a Mérida en el mapa global. Cada listado que representamos recibe un tratamiento de primera clase, desde fotografías curadas y descripciones bilingües de rigor técnico, hasta análisis detallados de plusvalía y geolocalización interactiva."
                : "That's why we partnered with leading digital design firms like Xelta Studios to build a platform that puts Mérida on the global map. Every listing we represent receives first-class treatment, from curated photography and technically precise bilingual descriptions to detailed appreciation analysis and interactive geolocation."}
            </p>
          </div>
          
          <div className="lg:col-span-5 border border-[var(--border-strong)] p-8 rounded-sm bg-[var(--surface-2)]/30 glass relative overflow-hidden flex flex-col justify-center">
            <span className="text-[10px] tracking-widest text-[var(--accent)] font-semibold uppercase font-display block mb-1.5">
              Xelta Studios
            </span>
            <p className="text-xs font-mono text-[var(--text-2)] leading-relaxed italic">
              {locale === "es"
                ? "\"El diseño y la tecnología de Knordica fueron creados bajo el estándar visual premium de Xelta Studios, garantizando una experiencia interactiva sin fricciones, sofisticada y enfocada en el usuario.\""
                : "\"Knordica's design and technology were crafted under Xelta Studios' premium visual standard, ensuring a frictionless, sophisticated, and user-centric interactive experience.\""}
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="container-knordica mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border border-[var(--border)] bg-[var(--surface)]/50 rounded-sm flex flex-col gap-4">
            <div className="h-10 w-10 border border-[var(--border)] rounded-full flex items-center justify-center text-[var(--accent)] bg-[var(--accent-dim)] shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="font-display font-bold text-base text-[var(--text)]">
              {locale === "es" ? "Excelencia Curada" : "Curated Excellence"}
            </h3>
            <p className="text-xs text-[var(--text-2)] font-light leading-relaxed">
              {locale === "es"
                ? "No acumulamos listados de forma genérica. Filtramos y seleccionamos únicamente propiedades que cumplen con estándares de calidad y legalidad impecables."
                : "We do not accumulate listings generically. We filter and select only properties that meet impeccable standards of quality and legality."}
            </p>
          </div>

          <div className="p-6 border border-[var(--border)] bg-[var(--surface)]/50 rounded-sm flex flex-col gap-4">
            <div className="h-10 w-10 border border-[var(--border)] rounded-full flex items-center justify-center text-[var(--gold)] bg-[var(--accent-gold-dim)] shrink-0">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="font-display font-bold text-base text-[var(--text)]">
              {locale === "es" ? "Transparencia Total" : "Total Transparency"}
            </h3>
            <p className="text-xs text-[var(--text-2)] font-light leading-relaxed">
              {locale === "es"
                ? "Sin dobles discursos ni comisiones ocultas. Ofrecemos históricos de precios de mercado, geolocalización exacta y soporte jurídico completo en cada cierre."
                : "No double-talk or hidden commissions. We offer historical market prices, exact geolocation, and full legal support during every closing."}
            </p>
          </div>

          <div className="p-6 border border-[var(--border)] bg-[var(--surface)]/50 rounded-sm flex flex-col gap-4">
            <div className="h-10 w-10 border border-[var(--border)] rounded-full flex items-center justify-center text-[var(--accent)] bg-[var(--accent-dim)] shrink-0">
              <Eye className="h-5 w-5" />
            </div>
            <h3 className="font-display font-bold text-base text-[var(--text)]">
              {locale === "es" ? "Enfoque Global" : "Global Focus"}
            </h3>
            <p className="text-xs text-[var(--text-2)] font-light leading-relaxed">
              {locale === "es"
                ? "Atendemos al mercado internacional. Nuestra plataforma es 100% bilingüe y optimizada para procesar cierres notariales seguros desde el exterior."
                : "We cater to the international market. Our platform is 100% bilingual and optimized to process secure notary closings from abroad."}
            </p>
          </div>
        </div>
      </section>

      {/* Agents Section */}
      <section className="container-knordica">
        <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[var(--text)] mb-8 border-b border-[var(--border)] pb-4">
          {locale === "es" ? "Asesores Asociados" : "Associated Advisors"}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MOCK_AGENTS.map((agent) => (
            <div 
              key={agent.id}
              className="p-6 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass flex flex-col sm:flex-row gap-6 items-start"
            >
              {/* Agent Mock Avatar */}
              <div className="h-16 w-16 rounded-full border border-[var(--border-strong)] bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)] shrink-0 font-display font-bold text-lg">
                {agent.full_name.charAt(0)}
              </div>

              {/* Agent Details */}
              <div className="flex-1 flex flex-col gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-display font-bold text-base text-[var(--text)]">{agent.full_name}</h4>
                    <span className="text-[9px] uppercase tracking-widest text-[var(--accent)] font-semibold px-2 py-0.5 rounded-sm bg-[var(--accent-dim)] border border-[var(--border-accent)]">
                      {agent.role === "senior" ? "Senior" : "Agente"}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-2)] font-light">
                    {locale === "es" ? agent.bio_es : agent.bio_en}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-2)] font-mono">
                  {agent.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                      <span>{agent.phone}</span>
                    </div>
                  )}
                  {agent.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                      <span className="truncate max-w-[200px] sm:max-w-xs">{agent.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
