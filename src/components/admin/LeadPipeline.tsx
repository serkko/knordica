"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/layout/LocaleProvider";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  MessageSquare, 
  Phone, 
  Plus, 
  ArrowRight,
  TrendingUp, 
  CheckCircle2, 
  XCircle,
  Clock,
  User,
  Inbox
} from "lucide-react";

interface Lead {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  intent?: string;
  message?: string;
  status: string;
  created_at: string;
  property?: {
    id: string;
    slug: string;
    title: string;
    operation: string;
    price: number;
    price_currency: string;
  } | null;
}

interface LeadPipelineProps {
  leads: Lead[];
  onStatusChange: (leadId: string, newStatus: string) => void;
}

export function LeadPipeline({ leads, onStatusChange }: LeadPipelineProps) {
  const { locale } = useLocale();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const columns = [
    { id: "nuevo", title: locale === "es" ? "Nuevos" : "New", color: "border-blue-500/30 text-blue-400" },
    { id: "contactado", title: locale === "es" ? "Contactados" : "Contacted", color: "border-amber-500/30 text-amber-400" },
    { id: "visita", title: locale === "es" ? "Visitas" : "Visits", color: "border-[var(--accent)]/30 text-[var(--accent)]" },
    { id: "negociacion", title: locale === "es" ? "Negociación" : "Negotiation", color: "border-indigo-500/30 text-indigo-400" },
    { id: "cerrado", title: locale === "es" ? "Cerrados" : "Completed", color: "border-emerald-500/30 text-emerald-400" },
    { id: "perdido", title: locale === "es" ? "Perdidos" : "Cancelled", color: "border-red-500/30 text-red-400" },
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggingId(id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggingId;
    if (id) {
      onStatusChange(id, columnId);
    }
    setDraggingId(null);
    setDragOverColumn(null);
  };

  const getIntentIcon = (intent?: string) => {
    switch (intent) {
      case "agendar":
        return <Calendar className="h-3 w-3 text-[var(--gold)]" />;
      case "info":
        return <MessageSquare className="h-3 w-3 text-[var(--accent)]" />;
      default:
        return <User className="h-3 w-3 text-[var(--text-muted)]" />;
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 w-full -mx-6 px-6 md:mx-0 md:px-0 scrollbar-thin">
      {columns.map((col) => {
        const colLeads = leads.filter((lead) => lead.status === col.id);
        const isOver = dragOverColumn === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col gap-4 w-72 shrink-0 min-h-[500px] border border-[var(--border)] rounded-sm bg-[var(--surface)]/20 p-4 transition-all ${
              isOver ? "border-[var(--accent)] bg-[var(--surface-hover)]/30 scale-[1.01]" : ""
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <span className={`text-xs font-bold font-display uppercase tracking-widest ${col.color.split(" ")[1]}`}>
                {col.title}
              </span>
              <span className="px-2 py-0.5 rounded-full border border-[var(--border)] text-[10px] font-mono text-[var(--text-muted)] bg-[var(--surface-2)]">
                {colLeads.length}
              </span>
            </div>

            {/* Draggable Cards Stack */}
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[600px] scrollbar-none">
              <AnimatePresence initial={false}>
                {colLeads.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-[10px] text-[var(--text-muted)] font-mono border border-dashed border-[var(--border)] rounded-xs min-h-[100px]">
                    <Inbox className="h-4.5 w-4.5 mb-1.5 opacity-50" />
                    <span>{locale === "es" ? "Columna vacía" : "Empty column"}</span>
                  </div>
                ) : (
                  colLeads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onDragEnd={handleDragEnd}
                        className="p-4 border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] rounded-xs glass flex flex-col gap-3 cursor-grab active:cursor-grabbing transition-all select-none group"
                      >
                        {/* Top metadata */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-semibold font-display">
                            {getIntentIcon(lead.intent)}
                            <span>
                              {lead.intent === "agendar" 
                                ? (locale === "es" ? "Cita" : "Visit")
                                : lead.intent === "info"
                                ? (locale === "es" ? "Consulta" : "Inquiry")
                                : (locale === "es" ? "Contacto" : "Contact")}
                            </span>
                          </div>
                          <span className="text-[9px] text-[var(--text-muted)] font-mono font-light shrink-0">
                            {new Date(lead.created_at).toLocaleDateString(locale === "es" ? "es-VE" : "en-US", {
                              month: "short",
                              day: "numeric"
                            })}
                          </span>
                        </div>

                        {/* Lead Title / Name */}
                        <div>
                          <h5 className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                            <Link href={`/${locale}/admin/leads/${lead.id}`}>
                              {lead.full_name}
                            </Link>
                          </h5>
                          <span className="text-[10px] text-[var(--text-2)] font-light truncate max-w-[200px] block mt-0.5 font-mono">
                            {lead.email}
                          </span>
                        </div>

                        {/* Associated Property summary if any */}
                        {lead.property && (
                          <div className="p-2 border border-[var(--border)] bg-[var(--surface-2)]/30 rounded-xs flex flex-col gap-0.5">
                            <span className="text-[9px] font-bold text-[var(--text)] truncate">
                              {lead.property.title}
                            </span>
                            <div className="flex items-center justify-between text-[9px] text-[var(--text-muted)]">
                              <span className="uppercase">
                                {lead.property.operation === "venta" ? (locale === "es" ? "Venta" : "Sale") : (locale === "es" ? "Alquiler" : "Rent")}
                              </span>
                              <span className="font-bold text-[var(--gold)] font-mono">
                                {new Intl.NumberFormat("es-VE", {
                                  style: "currency",
                                  currency: lead.property.price_currency,
                                  maximumFractionDigits: 0
                                }).format(lead.property.price)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Bottom Quick Contacts */}
                        <div className="flex items-center justify-between border-t border-[var(--border)] pt-2 mt-1 gap-2">
                          <span className="text-[9px] text-[var(--text-muted)] font-mono">
                            #{lead.id.substring(0, 6)}
                          </span>
                          <div className="flex items-center gap-1">
                            {lead.phone && (
                              <a 
                                href={`tel:${lead.phone}`}
                                className="h-6 w-6 border border-[var(--border)] hover:bg-[var(--surface-hover)] rounded-xs flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
                                title={lead.phone}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Phone className="h-3 w-3" />
                              </a>
                            )}
                            <Link 
                              href={`/${locale}/admin/leads/${lead.id}`}
                              className="h-6 w-6 border border-[var(--border)] hover:bg-[var(--surface-hover)] rounded-xs flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] transition-all"
                              title="Ver detalles"
                            >
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
