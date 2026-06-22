"use client";

import React, { use, useState, useEffect } from "react";
import { usePanelRole } from "@/hooks/usePanelRole";
import { DataTable, Column } from "@/components/panel/DataTable";
import { UserCheck, ShieldAlert, CircleUser, ToggleLeft, ToggleRight } from "lucide-react";
import { Agent } from "@/types/property";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const MOCK_AGENTS: Agent[] = [
  {
    id: "a1",
    full_name: "Tomas Nordica",
    email: "tomas@knordica.com",
    phone: "+58 412 1111111",
    whatsapp: "+58 412 1111111",
    bio_es: "Lead advisor.",
    bio_en: "Lead advisor.",
    avatar_url: null,
    role: "admin",
    active: true,
  },
  {
    id: "a2",
    full_name: "Daniela Rangel",
    email: "daniela@knordica.com",
    phone: "+58 414 2222222",
    whatsapp: "+58 414 2222222",
    bio_es: "Asesora experta en zonas residenciales.",
    bio_en: "Advisor specializing in residential areas.",
    avatar_url: null,
    role: "agent",
    active: true,
  },
];

export default function AgentesAdminPage({ params }: PageProps) {
  const { locale } = use(params);
  const { role, loading: roleLoading } = usePanelRole();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { data, error } = await supabase.from("agents").select("*");

      if (error) {
        console.warn("agents table may not exist yet. Falling back to mock data.");
        setAgents(MOCK_AGENTS);
      } else if (data && data.length > 0) {
        setAgents(data);
      } else {
        setAgents(MOCK_AGENTS);
      }
    } catch {
      setAgents(MOCK_AGENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roleLoading) {
      loadAgents();
    }
  }, [role, roleLoading]);

  const toggleAgentActive = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;

    // Update local state
    setAgents(agents.map(a => a.id === id ? { ...a, active: nextStatus } : a));

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.from("agents").update({ active: nextStatus }).eq("id", id);
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<Agent>[] = [
    {
      key: "avatar_url",
      label_es: "Foto",
      label_en: "Photo",
      render: (item) => (
        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 border border-[var(--border)] flex items-center justify-center shrink-0">
          {item.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.avatar_url} alt={item.full_name} className="w-full h-full object-cover" />
          ) : (
            <CircleUser size={16} className="text-[var(--text-muted)]" />
          )}
        </div>
      ),
    },
    {
      key: "full_name",
      label_es: "Nombre completo",
      label_en: "Full Name",
      sortable: true,
      render: (item) => <span className="font-semibold text-white/90">{item.full_name}</span>,
    },
    {
      key: "email",
      label_es: "Correo",
      label_en: "Email",
      sortable: true,
      render: (item) => <span className="font-mono text-white/70">{item.email}</span>,
    },
    {
      key: "phone",
      label_es: "Teléfono",
      label_en: "Phone",
      render: (item) => <span className="font-mono">{item.phone || "—"}</span>,
    },
    {
      key: "role",
      label_es: "Rol",
      label_en: "Role",
      sortable: true,
      render: (item) => (
        <span
          className="inline-block px-1.5 py-0.5 rounded-xs text-[9px] font-bold uppercase tracking-wider font-display"
          style={{
            background: item.role === "admin" ? "rgba(201,150,42,0.1)" : "rgba(1,105,111,0.1)",
            color: item.role === "admin" ? "var(--color-gold)" : "var(--color-primary-hover, #D4C8B0)",
          }}
        >
          {item.role}
        </span>
      ),
    },
    {
      key: "active",
      label_es: "Estado",
      label_en: "Status",
      sortable: true,
      render: (item) => (
        <button
          onClick={() => toggleAgentActive(item.id, item.active)}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          {item.active ? (
            <>
              <ToggleRight size={18} className="text-emerald-400" />
              <span className="text-[10px] font-semibold text-emerald-400">
                {locale === "en" ? "Active" : "Activo"}
              </span>
            </>
          ) : (
            <>
              <ToggleLeft size={18} className="text-white/20" />
              <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                {locale === "en" ? "Inactive" : "Inactivo"}
              </span>
            </>
          )}
        </button>
      ),
    },
  ];

  if (roleLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "var(--accent)" }} />
        <p className="text-xs text-[var(--text-muted)] font-mono mt-3">
          {locale === "en" ? "Loading agents..." : "Cargando asesores..."}
        </p>
      </div>
    );
  }

  // Admin access validation
  if (role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center p-12 border rounded-sm text-center min-h-[300px] space-y-3"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
      >
        <span className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
          <ShieldAlert size={24} />
        </span>
        <h3 className="font-display font-bold text-base text-[var(--text)]">
          {locale === "en" ? "Access Denied" : "Acceso Denegado"}
        </h3>
        <p className="text-xs text-[var(--text-muted)] max-w-sm">
          {locale === "en"
            ? "Only administrative accounts have access to view and manage agency advisors."
            : "Solo las cuentas administrativas tienen acceso para gestionar los asesores de la agencia."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[var(--border)]">
        <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-[var(--text)]">
          {locale === "en" ? "Advisor Team" : "Equipo de Asesores"}
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {locale === "en" ? "Review status and toggle active properties limits for agency advisors." : "Monitorea el estatus, roles y visibilidad pública de tus asesores comerciales."}
        </p>
      </div>

      {/* Agents Table */}
      <DataTable
        columns={columns}
        data={agents}
        loading={loading}
        locale={locale}
        keyExtractor={(item) => item.id}
        searchKeys={["full_name", "email", "role"]}
      />
    </div>
  );
}
