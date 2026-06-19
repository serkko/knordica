"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/layout/LocaleProvider";
import { createClient } from "@/lib/supabase/client";
import { LeadPipeline } from "@/components/admin/LeadPipeline";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MOCK_PROPERTIES } from "@/lib/mock-data";
import { 
  Users, 
  KanbanSquare, 
  TableProperties, 
  Eye, 
  Trash2, 
  Mail, 
  Phone,
  Sparkles,
  ArrowUpRight
} from "lucide-react";

export default function AdminLeads() {
  const { locale } = useLocale();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const supabase = createClient();

  const loadLeads = async () => {
    setLoading(true);
    const hasSupabaseKeys = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD";

    let fetchedLeads: any[] = [];
    try {
      if (hasSupabaseKeys) {
        const { data, error } = await supabase
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
          .order("created_at", { ascending: false });

        if (!error && data) {
          fetchedLeads = data.map((l: any) => ({
            id: l.id,
            full_name: l.full_name,
            email: l.email || "",
            phone: l.phone || "",
            whatsapp: l.whatsapp || "",
            intent: l.intent || "info",
            message: l.message || "",
            status: l.status || "nuevo",
            created_at: l.created_at,
            property: l.property ? {
              id: l.property.id,
              slug: l.property.slug,
              title: l.property.title,
              operation: l.property.operation,
              price: Number(l.property.price),
              price_currency: l.property.price_currency || "USD"
            } : null
          }));
        }
      } else {
        // Fallback Local Storage
        const devLeads = JSON.parse(localStorage.getItem("knordica-dev-leads") || "[]");
        fetchedLeads = devLeads.map((l: any) => {
          const property = MOCK_PROPERTIES.find((p) => p.id === l.property_id);
          return {
            id: l.id,
            full_name: l.full_name,
            email: l.email || l.phone || "demo@knordica.com",
            phone: l.phone || "",
            whatsapp: l.whatsapp || l.phone || "",
            intent: l.intent || "info",
            message: l.message || "",
            status: l.status || "nuevo",
            created_at: l.created_at || new Date().toISOString(),
            property: property ? {
              id: property.id,
              slug: property.slug,
              title: property.title,
              operation: property.operation,
              price: property.price,
              price_currency: property.price_currency
            } : null
          };
        });
        
        // Sort descending
        fetchedLeads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
    } catch (e) {
      console.error("Load leads error", e);
    } finally {
      setLeads(fetchedLeads);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    const hasSupabaseKeys = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD";

    // Optimistic Update
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead))
    );

    if (hasSupabaseKeys) {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus })
        .eq("id", leadId);

      if (error) {
        alert(locale === "es" ? "Error al actualizar estado en la base de datos." : "Error updating lead status.");
        loadLeads(); // rollback
      }
    } else {
      // Local storage fallback
      const devLeads = JSON.parse(localStorage.getItem("knordica-dev-leads") || "[]");
      const updated = devLeads.map((l: any) => (l.id === leadId ? { ...l, status: newStatus } : l));
      localStorage.setItem("knordica-dev-leads", JSON.stringify(updated));
    }
  };

  const handleDeleteLead = async (id: string) => {
    const confirmDelete = window.confirm(
      locale === "es"
        ? "¿Estás seguro de que deseas eliminar este prospecto? Esta acción no se puede deshacer."
        : "Are you sure you want to delete this lead? This action cannot be undone."
    );
    if (!confirmDelete) return;

    const hasSupabaseKeys = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD";

    if (hasSupabaseKeys) {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) {
        alert(locale === "es" ? "Error al eliminar el prospecto." : "Error deleting lead.");
      } else {
        loadLeads();
      }
    } else {
      // Local storage fallback
      const devLeads = JSON.parse(localStorage.getItem("knordica-dev-leads") || "[]");
      const updated = devLeads.filter((l: any) => l.id !== id);
      localStorage.setItem("knordica-dev-leads", JSON.stringify(updated));
      setLeads((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string; style: "success" | "accent" | "gold" | "outline" }> = {
      nuevo: { label: locale === "es" ? "Recibido" : "New", style: "accent" },
      contactado: { label: locale === "es" ? "En Proceso" : "In Progress", style: "gold" },
      visita: { label: locale === "es" ? "Cita" : "Visit", style: "gold" },
      negociacion: { label: locale === "es" ? "Negociación" : "Negotiation", style: "gold" },
      cerrado: { label: locale === "es" ? "Cerrado" : "Completed", style: "success" },
      perdido: { label: locale === "es" ? "Cancelado" : "Cancelled", style: "outline" },
    };
    const config = statuses[status] || { label: status, style: "outline" };
    return <Badge variant={config.style}>{config.label}</Badge>;
  };

  const getIntentLabel = (intent: string) => {
    const intents: Record<string, string> = {
      agendar: locale === "es" ? "Cita de Visita" : "Tour Booking",
      info: locale === "es" ? "Información" : "Inquiry",
      comprar: locale === "es" ? "Comprar" : "Purchase",
      alquilar: locale === "es" ? "Alquilar" : "Rental",
    };
    return intents[intent] || intent;
  };

  // Columns definition for Table view
  const tableColumns = [
    {
      key: "full_name",
      header: locale === "es" ? "Nombre" : "Client Name",
      sortable: true,
      render: (item: any) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-[var(--text)]">{item.full_name}</span>
          <span className="text-[10px] text-[var(--text-muted)] font-mono">#{item.id.substring(0, 8)}</span>
        </div>
      ),
    },
    {
      key: "contact",
      header: locale === "es" ? "Contacto" : "Contact Details",
      render: (item: any) => (
        <div className="flex flex-col gap-1 text-[11px] font-mono">
          {item.email && (
            <span className="flex items-center gap-1 text-[var(--text-2)]">
              <Mail className="h-3 w-3 text-[var(--text-muted)] shrink-0" />
              <span>{item.email}</span>
            </span>
          )}
          {item.phone && (
            <span className="flex items-center gap-1 text-[var(--text-2)]">
              <Phone className="h-3 w-3 text-[var(--text-muted)] shrink-0" />
              <span>{item.phone}</span>
            </span>
          )}
        </div>
      ),
    },
    {
      key: "intent",
      header: locale === "es" ? "Intención" : "Interest",
      sortable: true,
      render: (item: any) => <span>{getIntentLabel(item.intent)}</span>,
    },
    {
      key: "property.title",
      header: locale === "es" ? "Propiedad Asociada" : "Associated Property",
      sortable: true,
      render: (item: any) => (
        item.property ? (
          <Link 
            href={`/${locale}/propiedades/${item.property.slug}`} 
            target="_blank"
            className="hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1 font-semibold"
          >
            <span>{item.property.title}</span>
            <ArrowUpRight className="h-3 w-3 text-[var(--text-muted)] shrink-0" />
          </Link>
        ) : (
          <span className="text-[var(--text-muted)] font-light">-</span>
        )
      ),
    },
    {
      key: "created_at",
      header: locale === "es" ? "Fecha" : "Date",
      sortable: true,
      render: (item: any) => (
        <span>
          {new Date(item.created_at).toLocaleDateString(locale === "es" ? "es-VE" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
          })}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (item: any) => getStatusBadge(item.status),
    },
    {
      key: "actions",
      header: locale === "es" ? "Acciones" : "Actions",
      render: (item: any) => (
        <div className="flex items-center gap-1.5">
          <Link href={`/${locale}/admin/leads/${item.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] rounded-xs flex items-center justify-center cursor-pointer"
              title="Ver detalles"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteLead(item.id)}
            className="h-8 w-8 p-0 border border-[var(--border)] text-[var(--text-muted)] hover:text-red-400 hover:border-red-500/30 rounded-xs flex items-center justify-center cursor-pointer"
            title="Eliminar prospecto"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display mb-1">
            <Link href={`/${locale}/admin`} className="hover:text-[var(--accent)] transition-colors">
              {locale === "es" ? "Resumen" : "Dashboard"}
            </Link>
            <span>/</span>
            <span className="text-[var(--accent)]">{locale === "es" ? "Prospectos" : "Leads"}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[var(--text)]">
            {locale === "es" ? "CRM y Prospectos" : "CRM & Leads Management"}
          </h2>
          <p className="text-xs text-[var(--text-2)] font-light mt-1">
            {locale === "es"
              ? "Administra los contactos de clientes, gestiona el estado de negociación y registra el interés por propiedades."
              : "Manage client contacts, track negotiation status, and register property interest."}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center border border-[var(--border)] rounded-sm overflow-hidden p-0.5 bg-[var(--surface-2)]/30 shrink-0">
          <Button
            variant={viewMode === "kanban" ? "primary" : "outline"}
            size="sm"
            onClick={() => setViewMode("kanban")}
            className={`h-8 px-3 rounded-xs font-display uppercase tracking-wider text-[10px] ${
              viewMode === "kanban" 
                ? "bg-[var(--accent)] text-white border-transparent" 
                : "border-transparent text-[var(--text-2)] bg-transparent hover:text-[var(--text)]"
            }`}
          >
            <KanbanSquare className="h-3.5 w-3.5 mr-1" />
            <span>Kanban</span>
          </Button>
          <Button
            variant={viewMode === "table" ? "primary" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
            className={`h-8 px-3 rounded-xs font-display uppercase tracking-wider text-[10px] ${
              viewMode === "table" 
                ? "bg-[var(--accent)] text-white border-transparent" 
                : "border-transparent text-[var(--text-2)] bg-transparent hover:text-[var(--text)]"
            }`}
          >
            <TableProperties className="h-3.5 w-3.5 mr-1" />
            <span>{locale === "es" ? "Tabla" : "Table"}</span>
          </Button>
        </div>
      </div>

      {/* Main View content */}
      {loading ? (
        <div className="p-8 border border-[var(--border)] bg-[var(--surface)] animate-pulse rounded-sm min-h-[300px]" />
      ) : viewMode === "kanban" ? (
        <LeadPipeline leads={leads} onStatusChange={handleStatusChange} />
      ) : (
        <DataTable
          columns={tableColumns}
          data={leads}
          searchPlaceholder={locale === "es" ? "Buscar por nombre, email, intención..." : "Search by name, email, interest..."}
          searchKeys={["full_name", "email", "intent", "message"]}
        />
      )}

      {/* Tips Banner */}
      <div className="p-4 border border-[var(--border)] bg-[var(--surface-2)]/30 rounded-sm flex items-start gap-3">
        <Sparkles className="h-4.5 w-4.5 text-[var(--accent)] shrink-0 mt-0.5" />
        <span className="text-[11px] text-[var(--text-muted)] leading-relaxed">
          {locale === "es"
            ? "En la vista Kanban, arrastra cualquier tarjeta a una columna diferente para actualizar su estado de forma inmediata. Al hacerlo, el cliente verá reflejado el estado de su solicitud en su portal privado en tiempo real."
            : "In the Kanban view, drag any card to a different column to update its status instantly. Doing so will reflect the status of the request in the customer's private portal in real time."}
        </span>
      </div>
    </div>
  );
}
