"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "@/components/layout/LocaleProvider";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MOCK_PROPERTIES } from "@/lib/mock-data";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MessageSquare, 
  Calendar, 
  User, 
  ExternalLink,
  Plus,
  Send,
  Flag,
  CheckCircle,
  AlertCircle,
  Briefcase
} from "lucide-react";

interface Note {
  id: string;
  lead_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export default function AdminLeadDetalle() {
  const { locale } = useLocale();
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [lead, setLead] = useState<any>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingNote, setSubmittingNote] = useState(false);
  const [updatingField, setUpdatingField] = useState(false);

  const supabase = createClient();
  const hasSupabaseKeys = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD";

  const loadLeadDetails = async () => {
    setLoading(true);
    try {
      if (hasSupabaseKeys) {
        // Fetch Lead from DB
        const { data: leadData, error: leadError } = await supabase
          .from("leads")
          .select(`
            *,
            property:properties(
              id,
              slug,
              title,
              operation,
              price,
              price_currency
            )
          `)
          .eq("id", id)
          .single();

        if (leadData) {
          setLead({
            ...leadData,
            property: leadData.property ? {
              id: leadData.property.id,
              slug: leadData.property.slug,
              title: leadData.property.title,
              operation: leadData.property.operation,
              price: Number(leadData.property.price),
              price_currency: leadData.property.price_currency || "USD"
            } : null
          });

          // Fetch Notes
          const { data: notesData } = await supabase
            .from("lead_notes")
            .select(`
              id,
              lead_id,
              content,
              created_at,
              author:agents(full_name)
            `)
            .eq("lead_id", id)
            .order("created_at", { ascending: false });

          if (notesData) {
            setNotes(
              notesData.map((n: any) => ({
                id: n.id,
                lead_id: n.lead_id,
                author_name: n.author?.full_name || "Asesor",
                content: n.content,
                created_at: n.created_at,
              }))
            );
          }
        }
      } else {
        // Local fallback
        const devLeads = JSON.parse(localStorage.getItem("knordica-dev-leads") || "[]");
        const foundLead = devLeads.find((l: any) => l.id === id);

        if (foundLead) {
          const property = MOCK_PROPERTIES.find((p) => p.id === foundLead.property_id);
          setLead({
            ...foundLead,
            email: foundLead.email || "demo@knordica.com",
            phone: foundLead.phone || "",
            whatsapp: foundLead.whatsapp || "",
            intent: foundLead.intent || "info",
            message: foundLead.message || "",
            status: foundLead.status || "nuevo",
            priority: foundLead.priority || "media",
            created_at: foundLead.created_at || new Date().toISOString(),
            property: property ? {
              id: property.id,
              slug: property.slug,
              title: property.title,
              operation: property.operation,
              price: property.price,
              price_currency: property.price_currency
            } : null
          });

          // Load local notes
          const allNotes = JSON.parse(localStorage.getItem("knordica-dev-lead-notes") || "[]");
          const leadNotes = allNotes.filter((n: Note) => n.lead_id === id);
          leadNotes.sort((a: Note, b: Note) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setNotes(leadNotes);
        }
      }
    } catch (e) {
      console.error("Load lead details error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeadDetails();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!lead) return;
    setUpdatingField(true);
    
    // Optimistic Update
    setLead((prev: any) => ({ ...prev, status: newStatus }));

    if (hasSupabaseKeys) {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) {
        alert("Error updating status");
        loadLeadDetails();
      }
    } else {
      const devLeads = JSON.parse(localStorage.getItem("knordica-dev-leads") || "[]");
      const updated = devLeads.map((l: any) => (l.id === id ? { ...l, status: newStatus } : l));
      localStorage.setItem("knordica-dev-leads", JSON.stringify(updated));
    }
    setUpdatingField(false);
  };

  const handleUpdatePriority = async (newPriority: string) => {
    if (!lead) return;
    setUpdatingField(true);
    
    // Optimistic Update
    setLead((prev: any) => ({ ...prev, priority: newPriority }));

    if (hasSupabaseKeys) {
      const { error } = await supabase
        .from("leads")
        .update({ priority: newPriority })
        .eq("id", id);
      if (error) {
        alert("Error updating priority");
        loadLeadDetails();
      }
    } else {
      const devLeads = JSON.parse(localStorage.getItem("knordica-dev-leads") || "[]");
      const updated = devLeads.map((l: any) => (l.id === id ? { ...l, priority: newPriority } : l));
      localStorage.setItem("knordica-dev-leads", JSON.stringify(updated));
    }
    setUpdatingField(false);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !lead) return;
    setSubmittingNote(true);

    const noteText = newNote.trim();

    if (hasSupabaseKeys) {
      // Get current agent/user
      const { data: { user } } = await supabase.auth.getUser();
      let authorId: string | null = null;
      
      if (user) {
        const { data: agent } = await supabase
          .from("agents")
          .select("id")
          .eq("user_id", user.id)
          .single();
        if (agent) authorId = agent.id;
      }

      const { data, error } = await supabase
        .from("lead_notes")
        .insert([
          {
            lead_id: id,
            author_id: authorId,
            content: noteText
          }
        ])
        .select(`
          id,
          lead_id,
          content,
          created_at,
          author:agents(full_name)
        `)
        .single();

      if (!error && data) {
        const mappedNote: Note = {
          id: data.id,
          lead_id: data.lead_id,
          author_name: (data.author as any)?.full_name || "Asesor",
          content: data.content,
          created_at: data.created_at
        };
        setNotes((prev) => [mappedNote, ...prev]);
        setNewNote("");
      } else {
        alert("Error creating note in database");
      }
    } else {
      // Local fallback note creation
      const newLocalNote: Note = {
        id: Math.random().toString(36).substring(7),
        lead_id: id,
        author_name: "Asesor Knordica (Demo)",
        content: noteText,
        created_at: new Date().toISOString()
      };

      const allNotes = JSON.parse(localStorage.getItem("knordica-dev-lead-notes") || "[]");
      allNotes.push(newLocalNote);
      localStorage.setItem("knordica-dev-lead-notes", JSON.stringify(allNotes));

      setNotes((prev) => [newLocalNote, ...prev]);
      setNewNote("");
    }
    setSubmittingNote(false);
  };

  const getIntentLabel = (intent: string) => {
    const intents: Record<string, string> = {
      agendar: locale === "es" ? "Agendar Visita" : "Tour Booking",
      info: locale === "es" ? "Solicitar Información" : "Information Inquiry",
      comprar: locale === "es" ? "Intención de Compra" : "Purchase Interest",
      alquilar: locale === "es" ? "Intención de Alquiler" : "Rental Interest",
    };
    return intents[intent] || intent;
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 w-24 bg-[var(--surface-2)] rounded-xs border border-[var(--border)]" />
        <div className="h-44 bg-[var(--surface-2)] rounded-sm border border-[var(--border)]" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-[var(--border)] bg-[var(--surface)]/20 rounded-sm glass min-h-[300px]">
        <AlertCircle className="h-10 w-10 text-[var(--text-muted)] mb-4" />
        <h4 className="font-display font-bold text-base text-[var(--text)] mb-1">
          {locale === "es" ? "Prospecto no encontrado" : "Lead not found"}
        </h4>
        <Link href={`/${locale}/admin/leads`} className="mt-4">
          <Button variant="outline" size="sm">
            {locale === "es" ? "Volver al CRM" : "Back to CRM"}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Back Link */}
      <div>
        <Link 
          href={`/${locale}/admin/leads`}
          className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{locale === "es" ? "Volver al CRM" : "Back to CRM"}</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[var(--text)]">
              {lead.full_name}
            </h2>
            <p className="text-xs text-[var(--text-2)] font-light mt-1">
              {locale === "es" ? "Detalle completo del prospecto y seguimiento." : "Full lead details and interactions timeline."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--text-muted)] font-mono">ID: #{lead.id.substring(0, 8)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Lead Data (1 col) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Metadata Card */}
          <div className="p-6 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass flex flex-col gap-5">
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-[var(--text-muted)] pb-2 border-b border-[var(--border)]">
              {locale === "es" ? "Información del Lead" : "Lead Details"}
            </h4>

            {/* Email & Phone */}
            <div className="flex flex-col gap-4 text-xs font-light">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-[var(--text-muted)] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="block text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-display font-semibold">
                    Email
                  </span>
                  <a href={`mailto:${lead.email}`} className="text-[var(--text)] hover:text-[var(--accent)] transition-colors truncate block">
                    {lead.email}
                  </a>
                </div>
              </div>

              {lead.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-[var(--text-muted)] shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-display font-semibold">
                      {locale === "es" ? "Teléfono" : "Phone"}
                    </span>
                    <a href={`tel:${lead.phone}`} className="text-[var(--text)] hover:text-[var(--accent)] transition-colors">
                      {lead.phone}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-[var(--text-muted)] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-display font-semibold">
                    {locale === "es" ? "Fecha de Ingreso" : "Joined"}
                  </span>
                  <span className="text-[var(--text)]">
                    {new Date(lead.created_at).toLocaleDateString(locale === "es" ? "es-VE" : "en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="h-4 w-4 text-[var(--text-muted)] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-display font-semibold">
                    {locale === "es" ? "Intención de Contacto" : "Interest Intent"}
                  </span>
                  <span className="text-[var(--text)]">
                    {getIntentLabel(lead.intent)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Priority Control */}
          <div className="p-6 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass flex flex-col gap-4">
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-[var(--text-muted)] pb-2 border-b border-[var(--border)]">
              {locale === "es" ? "Flujo de Trabajo" : "Workflow Control"}
            </h4>

            {/* Status Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                {locale === "es" ? "Etapa del Pipeline" : "Pipeline Stage"}
              </label>
              <select
                value={lead.status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
                disabled={updatingField}
                className="h-10 w-full px-3 text-xs bg-transparent border border-[var(--border)] text-[var(--text)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden cursor-pointer"
              >
                <option value="nuevo" className="bg-[var(--surface-2)]">{locale === "es" ? "Recibido (Nuevo)" : "Received (New)"}</option>
                <option value="contactado" className="bg-[var(--surface-2)]">{locale === "es" ? "Contactado" : "Contacted"}</option>
                <option value="visita" className="bg-[var(--surface-2)]">{locale === "es" ? "Cita Agendada" : "Visit Scheduled"}</option>
                <option value="negociacion" className="bg-[var(--surface-2)]">{locale === "es" ? "En Negociación" : "Negotiation"}</option>
                <option value="cerrado" className="bg-[var(--surface-2)]">{locale === "es" ? "Completado (Cerrado)" : "Completed (Won)"}</option>
                <option value="perdido" className="bg-[var(--surface-2)]">{locale === "es" ? "Cancelado (Perdido)" : "Cancelled (Lost)"}</option>
              </select>
            </div>

            {/* Priority Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                {locale === "es" ? "Prioridad" : "Priority"}
              </label>
              <select
                value={lead.priority || "media"}
                onChange={(e) => handleUpdatePriority(e.target.value)}
                disabled={updatingField}
                className="h-10 w-full px-3 text-xs bg-transparent border border-[var(--border)] text-[var(--text)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden cursor-pointer"
              >
                <option value="baja" className="bg-[var(--surface-2)]">{locale === "es" ? "Baja" : "Low"}</option>
                <option value="media" className="bg-[var(--surface-2)]">{locale === "es" ? "Media" : "Medium"}</option>
                <option value="alta" className="bg-[var(--surface-2)]">{locale === "es" ? "Alta" : "High"}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Inquiries & Interactions (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Associated Property and Original Message */}
          <div className="p-6 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass flex flex-col gap-5">
            {lead.property && (
              <div>
                <h4 className="font-display font-bold text-xs uppercase tracking-widest text-[var(--text-muted)] pb-2 border-b border-[var(--border)] mb-3">
                  {locale === "es" ? "Propiedad Solicitada" : "Associated Listing"}
                </h4>
                <div className="p-4 border border-[var(--border)] bg-[var(--surface-2)]/30 rounded-xs flex items-center justify-between gap-4">
                  <div>
                    <h5 className="text-sm font-bold text-[var(--text)]">
                      {lead.property.title}
                    </h5>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
                      {lead.property.operation === "venta" ? (locale === "es" ? "Venta" : "Sale") : (locale === "es" ? "Alquiler" : "Rent")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold font-display text-[var(--gold)]">
                      {new Intl.NumberFormat("es-VE", {
                        style: "currency",
                        currency: lead.property.price_currency,
                        maximumFractionDigits: 0
                      }).format(lead.property.price)}
                    </span>
                    <Link href={`/${locale}/propiedades/${lead.property.slug}`} target="_blank">
                      <Button variant="outline" size="sm" className="h-8 rounded-xs px-3">
                        <span>{locale === "es" ? "Ver Ficha" : "View"}</span>
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {lead.message && (
              <div>
                <h4 className="font-display font-bold text-xs uppercase tracking-widest text-[var(--text-muted)] pb-2 border-b border-[var(--border)] mb-3">
                  {locale === "es" ? "Mensaje Original" : "Original Inquiry Message"}
                </h4>
                <div className="p-4 border border-[var(--border)] bg-[var(--surface-2)]/50 text-xs text-[var(--text-2)] font-light leading-relaxed rounded-xs whitespace-pre-wrap">
                  {lead.message}
                </div>
              </div>
            )}
          </div>

          {/* Follow-up Notes Timeline */}
          <div className="p-6 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass flex flex-col gap-6">
            <div>
              <h3 className="font-display font-bold text-base text-[var(--text)] mb-1">
                {locale === "es" ? "Bitácora de Seguimiento" : "Activity Log & Notes"}
              </h3>
              <p className="text-xs text-[var(--text-2)] font-light">
                {locale === "es" 
                  ? "Registra llamadas, correos o acuerdos logrados con el cliente." 
                  : "Register calls, emails, or agreements made with the client."}
              </p>
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={locale === "es" ? "Añadir comentario de seguimiento..." : "Add a follow-up comment..."}
                disabled={submittingNote}
                className="h-10 flex-1 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
              />
              <Button type="submit" variant="primary" isLoading={submittingNote} className="h-10 px-4 rounded-sm">
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>

            {/* Notes Timeline Stack */}
            <div className="flex flex-col gap-4 relative pl-4 border-l border-[var(--border)] ml-2 mt-2">
              {notes.length === 0 ? (
                <div className="text-xs text-[var(--text-muted)] font-light font-mono py-2">
                  {locale === "es" ? "Sin notas de seguimiento registradas." : "No follow-up notes registered."}
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="relative flex flex-col gap-1.5 pb-2">
                    {/* Timeline bullet dot */}
                    <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface-hover)]" />
                    
                    <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono">
                      <span className="font-bold text-[var(--text)]">{note.author_name}</span>
                      <span>
                        {new Date(note.created_at).toLocaleDateString(locale === "es" ? "es-VE" : "en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                    <p className="text-xs font-light text-[var(--text-2)] bg-[var(--surface-2)]/30 border border-[var(--border)] p-3 rounded-xs leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
