"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/layout/LocaleProvider";
import { createClient } from "@/lib/supabase/client";
import { MOCK_PROPERTIES } from "@/lib/mock-data";
import { CalendarRange, MapPin, Calendar, Clock, MessageSquare, ExternalLink, Inbox, CheckCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

interface LeadItem {
  id: string;
  property_id?: string;
  intent?: string;
  message?: string;
  created_at: string;
  status?: string;
  property?: {
    id: string;
    slug: string;
    title: string;
    operation: string;
    price: number;
    price_currency: string;
    cover_image?: any;
  } | null;
}

export default function ClienteSolicitudes() {
  const { locale, dict } = useLocale();
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchLeads() {
      setLoading(true);
      const hasSupabaseKeys = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD";
      let fetchedLeads: LeadItem[] = [];

      try {
        if (hasSupabaseKeys) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user && user.email) {
            const { data, error } = await supabase
              .from("leads")
              .select(`
                id,
                property_id,
                intent,
                message,
                created_at,
                status,
                property:properties(
                  id,
                  slug,
                  title,
                  operation,
                  price,
                  price_currency,
                  property_images(url, is_cover)
                )
              `)
              .eq("email", user.email)
              .order("created_at", { ascending: false });

            if (!error && data) {
              fetchedLeads = data.map((item: any) => {
                const coverImgObj = item.property?.property_images?.find((img: any) => img.is_cover) || 
                                   item.property?.property_images?.[0];
                return {
                  id: item.id,
                  property_id: item.property_id,
                  intent: item.intent,
                  message: item.message,
                  created_at: item.created_at,
                  status: item.status,
                  property: item.property ? {
                    id: item.property.id,
                    slug: item.property.slug,
                    title: item.property.title,
                    operation: item.property.operation,
                    price: Number(item.property.price),
                    price_currency: item.property.price_currency || "USD",
                    cover_image: coverImgObj ? { url: coverImgObj.url } : null
                  } : null
                };
              });
            }
          }
        } else {
          // LocalStorage Fallback
          const devLeads = JSON.parse(localStorage.getItem("knordica-dev-leads") || "[]");
          devLeads.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          
          fetchedLeads = devLeads.map((lead: any) => {
            const property = MOCK_PROPERTIES.find((p) => p.id === lead.property_id);
            return {
              id: lead.id,
              property_id: lead.property_id,
              intent: lead.intent,
              message: lead.message,
              created_at: lead.created_at,
              status: lead.status || "nuevo",
              property: property ? {
                id: property.id,
                slug: property.slug,
                title: property.title,
                operation: property.operation,
                price: property.price,
                price_currency: property.price_currency,
                cover_image: property.cover_image ? { url: property.cover_image.url } : null
              } : null
            };
          });
        }
      } catch (err) {
        console.error("Error loading leads", err);
      } finally {
        setLeads(fetchedLeads);
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  const getStatusBadge = (status?: string) => {
    const statuses: Record<string, { label: string; style: string }> = {
      nuevo: {
        label: locale === "es" ? "Recibida" : "Received",
        style: "border-blue-500/20 bg-blue-500/5 text-blue-400",
      },
      contactado: {
        label: locale === "es" ? "En Proceso" : "In Progress",
        style: "border-amber-500/20 bg-amber-500/5 text-amber-400",
      },
      visita: {
        label: locale === "es" ? "Cita Agendada" : "Visit Scheduled",
        style: "border-[var(--accent)]/20 bg-[var(--accent)]/5 text-[var(--accent)]",
      },
      negociacion: {
        label: locale === "es" ? "Negociación" : "Negotiation",
        style: "border-indigo-500/20 bg-indigo-500/5 text-indigo-400",
      },
      cerrado: {
        label: locale === "es" ? "Completada" : "Completed",
        style: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
      },
      perdido: {
        label: locale === "es" ? "Cancelada" : "Cancelled",
        style: "border-red-500/20 bg-red-500/5 text-red-400",
      },
    };

    const config = statuses[status || "nuevo"] || {
      label: locale === "es" ? "Recibida" : "Received",
      style: "border-blue-500/20 bg-blue-500/5 text-blue-400",
    };
    
    return (
      <span className={`px-2 py-0.5 border text-[10px] font-medium rounded-sm uppercase tracking-wider font-display ${config.style}`}>
        {config.label}
      </span>
    );
  };

  const getIntentLabel = (intent?: string) => {
    const intents: Record<string, string> = {
      agendar: locale === "es" ? "Solicitud de Cita" : "Tour Request",
      info: locale === "es" ? "Solicitud de Información" : "Information Request",
      comprar: locale === "es" ? "Intención de Compra" : "Purchase Intent",
      alquilar: locale === "es" ? "Intención de Alquiler" : "Rental Intent",
    };
    return intents[intent || ""] || (locale === "es" ? "Contacto" : "Contact Inquiry");
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display mb-1">
          <Link href={`/${locale}/cliente`} className="hover:text-[var(--accent)] transition-colors">
            {locale === "es" ? "Panel" : "Dashboard"}
          </Link>
          <span>/</span>
          <span className="text-[var(--accent)]">{locale === "es" ? "Solicitudes" : "Inquiries"}</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[var(--text)]">
          {locale === "es" ? "Citas y Solicitudes" : "Bookings & Inquiries"}
        </h2>
        <p className="text-xs text-[var(--text-2)] font-light mt-1">
          {locale === "es"
            ? "Historial de solicitudes de visitas guiadas y consultas enviadas a nuestros asesores."
            : "History of guided tour requests and consultations sent to our advisors."}
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-5 border border-[var(--border)] bg-[var(--surface)] animate-pulse rounded-sm min-h-[120px]" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center text-center p-12 border border-[var(--border)] bg-[var(--surface)]/30 rounded-sm glass min-h-[350px]"
        >
          <div className="h-16 w-16 rounded-full border border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)] mb-4">
            <Inbox className="h-6 w-6" />
          </div>
          <h4 className="font-display font-bold text-base text-[var(--text)] mb-2">
            {locale === "es" ? "No tienes solicitudes activas" : "No active inquiries yet"}
          </h4>
          <p className="text-xs text-[var(--text-2)] max-w-sm font-light leading-relaxed mb-6">
            {locale === "es"
              ? "Cuando solicites información o agendes una cita en alguna propiedad, aparecerá listada aquí para que puedas hacer seguimiento."
              : "When you request information or schedule a tour on a property, it will appear here so you can keep track of it."}
          </p>
          <Link href={`/${locale}/propiedades`}>
            <Button variant="primary" className="text-xs uppercase tracking-wider font-display h-10 px-6 rounded-sm">
              <span>{locale === "es" ? "Buscar Propiedades" : "Browse Properties"}</span>
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {leads.map((lead) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-5 sm:p-6 border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] rounded-sm glass flex flex-col gap-4 transition-all"
              >
                {/* Top Row: Type and Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-display text-[var(--text)]">
                      {getIntentLabel(lead.intent)}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      #{lead.id.substring(0, 8)}
                    </span>
                  </div>
                  <div>
                    {getStatusBadge(lead.status)}
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  {/* Inquiry details */}
                  <div className="md:col-span-2 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-light">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {new Date(lead.created_at).toLocaleDateString(locale === "es" ? "es-VE" : "en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>

                    {lead.message && (
                      <div className="p-3 border border-[var(--border)] bg-[var(--surface-2)]/50 rounded-sm text-xs text-[var(--text-2)] font-light leading-relaxed flex items-start gap-2.5">
                        <MessageSquare className="h-4 w-4 text-[var(--text-muted)] shrink-0 mt-0.5" />
                        <span className="whitespace-pre-wrap">{lead.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Associated Property (if any) */}
                  {lead.property && (
                    <div className="border border-[var(--border)] bg-[var(--surface-2)]/30 rounded-sm p-3 flex gap-3 group">
                      {lead.property.cover_image?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={lead.property.cover_image.url}
                          alt={lead.property.title}
                          className="h-16 w-16 rounded-xs object-cover bg-zinc-900 shrink-0 border border-[var(--border)]"
                        />
                      )}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h5 className="text-xs font-bold font-display text-[var(--text)] group-hover:text-[var(--accent)] transition-colors truncate">
                            <Link href={`/${locale}/propiedades/${lead.property.slug}`} className="flex items-center gap-1">
                              <span>{lead.property.title}</span>
                              <ExternalLink className="h-2.5 w-2.5 inline shrink-0 text-[var(--text-muted)]" />
                            </Link>
                          </h5>
                          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                            {lead.property.operation === "venta" ? (locale === "es" ? "Venta" : "For Sale") : (locale === "es" ? "Alquiler" : "For Rent")}
                          </span>
                        </div>
                        <span className="text-xs font-bold font-display text-[var(--gold)] mt-1">
                          {new Intl.NumberFormat("es-VE", {
                            style: "currency",
                            currency: lead.property.price_currency,
                            maximumFractionDigits: 0
                          }).format(lead.property.price)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer status information */}
                <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--text-muted)] border-t border-[var(--border)] pt-3 font-light leading-normal">
                  <Info className="h-3 w-3 text-[var(--accent)] shrink-0" />
                  <span>
                    {lead.status === "nuevo" && (locale === "es" 
                      ? "Nuestros asesores están revisando tu solicitud. Te contactaremos pronto." 
                      : "Our advisors are reviewing your inquiry. We will contact you soon.")}
                    {lead.status === "visita" && (locale === "es" 
                      ? "Tu cita ha sido agendada. Un asesor te esperará en la fecha y hora indicadas." 
                      : "Your visit has been scheduled. An advisor will meet you at the specified time.")}
                    {lead.status === "contactado" && (locale === "es" 
                      ? "Un asesor se encuentra gestionando tu solicitud en este momento." 
                      : "An advisor is currently handling your inquiry.")}
                    {lead.status === "negociacion" && (locale === "es" 
                      ? "Estás en proceso de negociación para esta propiedad." 
                      : "You are currently negotiating for this property.")}
                    {lead.status === "cerrado" && (locale === "es" 
                      ? "Esta solicitud se ha marcado como completada con éxito." 
                      : "This request has been successfully closed.")}
                    {lead.status === "perdido" && (locale === "es" 
                      ? "Esta solicitud fue cancelada o descartada." 
                      : "This request was cancelled or archived.")}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
