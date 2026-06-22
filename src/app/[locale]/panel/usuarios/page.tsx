"use client";

import React, { use, useState, useEffect } from "react";
import { usePanelRole } from "@/hooks/usePanelRole";
import { DataTable, Column } from "@/components/panel/DataTable";
import { ShieldAlert, Users, Calendar, Mail, Key } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

const MOCK_USERS: UserProfile[] = [
  { id: "u1", email: "carlos.mendoza@email.com", full_name: "Carlos Mendoza", role: "user", created_at: "2026-06-15" },
  { id: "u2", email: "marcelo.gomez@email.com", full_name: "Marcelo Gómez", role: "user", created_at: "2026-06-12" },
  { id: "u3", email: "daniela@knordica.com", full_name: "Daniela Rangel", role: "agent", created_at: "2026-05-10" },
  { id: "u4", email: "tomas@knordica.com", full_name: "Tomas Nordica", role: "admin", created_at: "2026-05-01" },
];

export default function UsuariosPage({ params }: PageProps) {
  const { locale } = use(params);
  const { role, loading: roleLoading } = usePanelRole();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      // Query profiles or agents
      const { data, error } = await supabase.from("agents").select("user_id, email, full_name, role, created_at");

      if (error) {
        console.warn("agents table loading error, falling back to mock users.");
        setUsers(MOCK_USERS);
      } else if (data && data.length > 0) {
        const mapped = data.map((item: any) => ({
          id: item.user_id,
          email: item.email || "N/A",
          full_name: item.full_name || "Usuario",
          role: item.role || "user",
          created_at: item.created_at ? item.created_at.split("T")[0] : "—",
        }));
        setUsers(mapped);
      } else {
        setUsers(MOCK_USERS);
      }
    } catch {
      setUsers(MOCK_USERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roleLoading) {
      loadUsers();
    }
  }, [role, roleLoading]);

  const handleChangeRole = async (userId: string, nextRole: string) => {
    // Update local state
    setUsers(users.map(u => u.id === userId ? { ...u, role: nextRole } : u));

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase
        .from("agents")
        .update({ role: nextRole })
        .eq("user_id", userId);
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<UserProfile>[] = [
    {
      key: "full_name",
      label_es: "Nombre completo",
      label_en: "Full Name",
      sortable: true,
      render: (item) => <span className="font-semibold text-white/90">{item.full_name}</span>,
    },
    {
      key: "email",
      label_es: "Correo electrónico",
      label_en: "Email Address",
      sortable: true,
      render: (item) => <span className="font-mono text-white/70">{item.email}</span>,
    },
    {
      key: "created_at",
      label_es: "Fecha Registro",
      label_en: "Signup Date",
      sortable: true,
      render: (item) => <span className="font-mono text-white/50">{item.created_at}</span>,
    },
    {
      key: "role",
      label_es: "Rol / Permisos",
      label_en: "Role / Permissions",
      render: (item) => (
        <select
          value={item.role}
          onChange={(e) => handleChangeRole(item.id, e.target.value)}
          className="px-2 py-1 text-[11px] font-semibold rounded-sm border bg-[var(--surface-2)] outline-none cursor-pointer"
          style={{ borderColor: "var(--border)", color: "var(--text)" }}
        >
          <option value="user">{locale === "en" ? "User" : "Usuario"}</option>
          <option value="agent">{locale === "en" ? "Advisor / Agent" : "Asesor"}</option>
          <option value="senior">{locale === "en" ? "Senior Advisor" : "Asesor Senior"}</option>
          <option value="admin">{locale === "en" ? "Administrator" : "Administrador"}</option>
        </select>
      ),
    },
  ];

  if (roleLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "var(--accent)" }} />
        <p className="text-xs text-[var(--text-muted)] font-mono mt-3">
          {locale === "en" ? "Loading users..." : "Cargando usuarios..."}
        </p>
      </div>
    );
  }

  // Admin validation
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
            ? "Only administrative accounts have access to view and change system user permissions."
            : "Solo las cuentas administrativas tienen acceso para ver y cambiar permisos de usuarios."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[var(--border)]">
        <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-[var(--text)]">
          {locale === "en" ? "User Management" : "Gestión de Usuarios"}
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {locale === "en" ? "Manage user roles and assign administrative/advisor access levels." : "Modifica el rol de los usuarios del sistema para habilitar el acceso al panel profesional."}
        </p>
      </div>

      {/* Users table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        locale={locale}
        keyExtractor={(item) => item.id}
        searchKeys={["full_name", "email", "role"]}
      />
    </div>
  );
}
