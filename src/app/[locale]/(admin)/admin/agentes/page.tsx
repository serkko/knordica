"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/layout/LocaleProvider";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/admin/DataTable";
import { MOCK_AGENTS } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Users, 
  Plus, 
  Trash2, 
  Mail, 
  Phone, 
  Sparkles,
  ToggleLeft,
  ToggleRight,
  UserPlus
} from "lucide-react";

export default function AdminAgentes() {
  const { locale } = useLocale();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Add Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("agent");

  const supabase = createClient();
  const hasSupabaseKeys = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD";

  const loadAgents = async () => {
    setLoading(true);
    try {
      if (hasSupabaseKeys) {
        const { data, error } = await supabase
          .from("agents")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data) {
          setAgents(data);
        }
      } else {
        const localAgents = JSON.parse(localStorage.getItem("knordica-dev-agents") || "null");
        if (localAgents) {
          setAgents(localAgents);
        } else {
          setAgents(MOCK_AGENTS);
        }
      }
    } catch (e) {
      console.error("Load agents error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    // Optimistic Update
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !currentStatus } : a))
    );

    if (hasSupabaseKeys) {
      await supabase.from("agents").update({ active: !currentStatus }).eq("id", id);
    } else {
      const localAgents = JSON.parse(localStorage.getItem("knordica-dev-agents") || "null") || MOCK_AGENTS;
      const updated = localAgents.map((a: any) => (a.id === id ? { ...a, active: !currentStatus } : a));
      localStorage.setItem("knordica-dev-agents", JSON.stringify(updated));
    }
  };

  const handleDeleteAgent = async (id: string) => {
    const confirmDelete = window.confirm(
      locale === "es"
        ? "¿Estás seguro de que deseas eliminar este agente?"
        : "Are you sure you want to delete this agent?"
    );
    if (!confirmDelete) return;

    if (hasSupabaseKeys) {
      const { error } = await supabase.from("agents").delete().eq("id", id);
      if (!error) loadAgents();
    } else {
      const localAgents = JSON.parse(localStorage.getItem("knordica-dev-agents") || "null") || MOCK_AGENTS;
      const updated = localAgents.filter((a: any) => a.id !== id);
      localStorage.setItem("knordica-dev-agents", JSON.stringify(updated));
      setAgents(updated);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    if (hasSupabaseKeys) {
      const { error } = await supabase.from("agents").insert([
        {
          full_name: fullName,
          email,
          phone,
          role,
          active: true,
        },
      ]);
      if (!error) {
        loadAgents();
        setShowAddForm(false);
        setFullName("");
        setEmail("");
        setPhone("");
      } else {
        alert("Error creating agent in database");
      }
    } else {
      const newAgent = {
        id: `agent-${Math.random().toString(36).substring(5)}`,
        full_name: fullName,
        email,
        phone,
        role,
        active: true,
        whatsapp: phone.replace(/[^0-9]/g, ""),
        created_at: new Date().toISOString()
      };

      const localAgents = JSON.parse(localStorage.getItem("knordica-dev-agents") || "null") || [...MOCK_AGENTS];
      localAgents.unshift(newAgent);
      localStorage.setItem("knordica-dev-agents", JSON.stringify(localAgents));
      
      setAgents(localAgents);
      setShowAddForm(false);
      setFullName("");
      setEmail("");
      setPhone("");
    }
  };

  const getRoleBadge = (role: string) => {
    const roles: Record<string, { label: string; style: "gold" | "accent" | "outline" }> = {
      admin: { label: locale === "es" ? "Administrador" : "Administrator", style: "gold" },
      senior: { label: locale === "es" ? "Asesor Senior" : "Senior Advisor", style: "accent" },
      agent: { label: locale === "es" ? "Asesor" : "Advisor", style: "outline" },
    };
    const config = roles[role] || { label: role, style: "outline" };
    return <Badge variant={config.style}>{config.label}</Badge>;
  };

  const columns = [
    {
      key: "full_name",
      header: locale === "es" ? "Agente" : "Agent Name",
      sortable: true,
      render: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center font-display font-bold text-xs text-[var(--accent)] shrink-0">
            {item.full_name.charAt(0).toUpperCase()}
          </div>
          <span className="font-bold text-[var(--text)]">{item.full_name}</span>
        </div>
      ),
    },
    {
      key: "contact",
      header: locale === "es" ? "Contacto" : "Contact",
      render: (item: any) => (
        <div className="flex flex-col gap-0.5 font-mono text-[10px]">
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3 text-[var(--text-muted)] shrink-0" />
            <span>{item.email}</span>
          </span>
          {item.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-[var(--text-muted)] shrink-0" />
              <span>{item.phone}</span>
            </span>
          )}
        </div>
      ),
    },
    {
      key: "role",
      header: "Rol",
      sortable: true,
      render: (item: any) => getRoleBadge(item.role),
    },
    {
      key: "active",
      header: "Estado",
      sortable: true,
      render: (item: any) => (
        <button
          onClick={() => handleToggleActive(item.id, item.active)}
          className="flex items-center gap-1 text-xs cursor-pointer hover:opacity-85"
        >
          {item.active ? (
            <div className="flex items-center gap-1 text-emerald-400">
              <ToggleRight className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>{locale === "es" ? "Activo" : "Active"}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[var(--text-muted)]">
              <ToggleLeft className="h-5 w-5 text-[var(--text-muted)] shrink-0" />
              <span>{locale === "es" ? "Inactivo" : "Inactive"}</span>
            </div>
          )}
        </button>
      ),
    },
    {
      key: "actions",
      header: locale === "es" ? "Acciones" : "Actions",
      render: (item: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDeleteAgent(item.id)}
          className="h-8 w-8 p-0 border border-[var(--border)] text-[var(--text-muted)] hover:text-red-400 hover:border-red-500/30 rounded-xs flex items-center justify-center cursor-pointer"
          title="Eliminar asesor"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
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
            <span className="text-[var(--accent)]">{locale === "es" ? "Agentes" : "Agents"}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[var(--text)]">
            {locale === "es" ? "Equipo de Asesores" : "Team & Agents"}
          </h2>
          <p className="text-xs text-[var(--text-2)] font-light mt-1">
            {locale === "es"
              ? "Gestiona los agentes inmobiliarios activos, asigna roles de administración y edita información de contacto."
              : "Manage active real estate agents, assign administrative roles, and edit contact information."}
          </p>
        </div>

        <Button 
          variant={showAddForm ? "outline" : "primary"}
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs uppercase tracking-wider font-display h-10 px-5 rounded-sm shrink-0"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          <span>{showAddForm ? (locale === "es" ? "Cancelar" : "Cancel") : (locale === "es" ? "Nuevo Asesor" : "New Agent")}</span>
        </Button>
      </div>

      {/* Add Agent Form */}
      {showAddForm && (
        <form onSubmit={handleCreateAgent} className="p-6 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass grid grid-cols-1 sm:grid-cols-4 gap-4 items-end animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
              {locale === "es" ? "Nombre Completo" : "Full Name"}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
              {locale === "es" ? "WhatsApp" : "Phone"}
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+58 412..."
              className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                Rol
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] text-[var(--text)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden cursor-pointer"
              >
                <option value="agent" className="bg-[var(--surface-2)]">{locale === "es" ? "Asesor" : "Advisor"}</option>
                <option value="senior" className="bg-[var(--surface-2)]">{locale === "es" ? "Senior" : "Senior Advisor"}</option>
                <option value="admin" className="bg-[var(--surface-2)]">{locale === "es" ? "Admin" : "Administrator"}</option>
              </select>
            </div>
            <Button type="submit" variant="primary" className="h-10 px-4 rounded-sm shrink-0">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {/* Main Table view */}
      {loading ? (
        <div className="p-8 border border-[var(--border)] bg-[var(--surface)] animate-pulse rounded-sm min-h-[300px]" />
      ) : (
        <DataTable
          columns={columns}
          data={agents}
          searchPlaceholder={locale === "es" ? "Buscar por nombre, email..." : "Search by name, email..."}
          searchKeys={["full_name", "email"]}
        />
      )}

      {/* Security note block */}
      <div className="p-4 border border-[var(--border)] bg-[var(--surface-2)]/30 rounded-sm flex items-start gap-3">
        <Sparkles className="h-4.5 w-4.5 text-[var(--accent)] shrink-0 mt-0.5" />
        <span className="text-[11px] text-[var(--text-muted)] leading-relaxed">
          {locale === "es"
            ? "Para permitir que un asesor nuevo acceda al Panel de Administración CRM, asegúrate de que registre una cuenta con el mismo correo electrónico configurado en este listado y de asignarle un rol de 'Administrador' o 'Asesor Senior'."
            : "To allow a new advisor to access the Admin CRM Panel, make sure they register an account with the same email address configured in this list and assign them an 'Administrator' or 'Senior Advisor' role."}
        </span>
      </div>
    </div>
  );
}
