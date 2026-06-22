"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/layout/LocaleProvider";
import { createClient } from "@/lib/supabase/client";
import { MetricsCard } from "@/components/admin/MetricsCard";
import { MOCK_PROPERTIES } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import {
  Building2,
  Users,
  Calendar,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Inbox,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";

interface Lead {
  id: string;
  full_name: string;
  intent: string;
  created_at: string;
  status: string;
}

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function AdminDashboard() {
  const { locale } = useLocale();
  const [mounted, setMounted] = useState(false);
  const [kpis, setKpis] = useState({
    properties: 0,
    leads: 0,
    appointments: 0,
    conversions: 0,
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);

    async function loadStats() {
      const hasSupabaseKeys =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD";

      if (hasSupabaseKeys) {
        try {
          const { count: propCount } = await supabase
            .from("properties")
            .select("*", { count: "exact", head: true });

          const { count: leadCount } = await supabase
            .from("leads")
            .select("*", { count: "exact", head: true });

          const { count: apptCount } = await supabase
            .from("appointments")
            .select("*", { count: "exact", head: true });

          setKpis({
            properties: propCount || 0,
            leads: leadCount || 0,
            appointments: apptCount || 0,
            conversions: leadCount
              ? Math.round(((apptCount || 0) / leadCount) * 100)
              : 0,
          });

          const { data: leads } = await supabase
            .from("leads")
            .select("id, full_name, intent, created_at, status")
            .order("created_at", { ascending: false })
            .limit(4);

          if (leads) setRecentLeads(leads as Lead[]);
        } catch (e) {
          console.error("Supabase load stats error", e);
        }
      } else {
        const devLeads = JSON.parse(
          localStorage.getItem("knordica-dev-leads") || "[]"
        );

        setKpis({
          properties: MOCK_PROPERTIES.length,
          leads: devLeads.length || 18,
          appointments: devLeads.filter((l: Lead) => l.intent === "agendar").length || 4,
          conversions: devLeads.length
            ? Math.round(
                (devLeads.filter((l: Lead) => l.intent === "agendar").length /
                  devLeads.length) *
                  100
              )
            : 22,
        });

        const mappedRecent: Lead[] = devLeads.slice(0, 4).map((l: Lead) => ({
          id: l.id,
          full_name: l.full_name,
          intent: l.intent,
          created_at: l.created_at,
          status: l.status || "nuevo",
        }));

        if (mappedRecent.length > 0) {
          setRecentLeads(mappedRecent);
        } else {
          setRecentLeads([
            {
              id: "lead-1",
              full_name: "Alejandro Mora",
              intent: "agendar",
              created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
              status: "visita",
            },
            {
              id: "lead-2",
              full_name: "Valentina Torres",
              intent: "info",
              created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
              status: "nuevo",
            },
            {
              id: "lead-3",
              full_name: "Roberto Sánchez",
              intent: "comprar",
              created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
              status: "contactado",
            },
            {
              id: "lead-4",
              full_name: "Isabella Gómez",
              intent: "agendar",
              created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
              status: "cerrado",
            },
          ]);
        }
      }
    }

    loadStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartData = [
    { name: locale === "es" ? "Ene" : "Jan", leads: 4, visits: 1 },
    { name: locale === "es" ? "Feb" : "Feb", leads: 7, visits: 2 },
    { name: locale === "es" ? "Mar" : "Mar", leads: 12, visits: 3 },
    { name: locale === "es" ? "Abr" : "Apr", leads: 15, visits: 5 },
    { name: locale === "es" ? "May" : "May", leads: 18, visits: 7 },
    {
      name: locale === "es" ? "Jun" : "Jun",
      leads: kpis.leads || 24,
      visits: kpis.appointments || 9,
    },
  ];

  const sparklineData1 = [
    { value: 10 }, { value: 12 }, { value: 11 }, { value: 14 },
    { value: 13 }, { value: 15 }, { value: kpis.properties },
  ];
  const sparklineData2 = [
    { value: 20 }, { value: 28 }, { value: 25 }, { value: 34 },
    { value: 40 }, { value: 45 }, { value: kpis.leads },
  ];
  const sparklineData3 = [
    { value: 2 }, { value: 3 }, { value: 2 }, { value: 5 },
    { value: 4 }, { value: 6 }, { value: kpis.appointments },
  ];
  const sparklineData4 = [
    { value: 15 }, { value: 16 }, { value: 18 }, { value: 17 },
    { value: 19 }, { value: 18 }, { value: kpis.conversions },
  ];

  const getIntentLabel = (intent: string) => {
    const intents: Record<string, string> = {
      agendar: locale === "es" ? "Cita de Visita" : "Tour Booking",
      info: locale === "es" ? "Información" : "Inquiry",
      comprar: locale === "es" ? "Compra" : "Purchase",
      alquilar: locale === "es" ? "Alquiler" : "Rental",
    };
    return intents[intent] || (locale === "es" ? "Contacto" : "Contact");
  };

  const getStatusBadgeClass = (status: string) => {
    const badges: Record<string, string> = {
      nuevo: "border-blue-500/20 bg-blue-500/5 text-blue-400",
      contactado: "border-amber-500/20 bg-amber-500/5 text-amber-400",
      visita: "border-[var(--accent)]/20 bg-[var(--accent)]/5 text-[var(--accent)]",
      cerrado: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
      perdido: "border-red-500/20 bg-red-500/5 text-red-400",
    };
    return badges[status] || "border-zinc-500/20 bg-zinc-500/5 text-zinc-400";
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-10"
    >
      {/* Welcome Row */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-semibold font-display block mb-1">
            {locale === "es" ? "SISTEMA CRM DE AGENTES" : "AGENT CRM SYSTEM"}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[var(--text)]">
            {locale === "es" ? "Resumen General" : "Dashboard Overview"}
          </h2>
          <p className="text-xs text-[var(--text-2)] font-light mt-1">
            {locale === "es"
              ? "Monitorea la actividad del mercado de Mérida, gestiona leads y coordina visitas."
              : "Monitor Mérida market activity, manage leads, and coordinate visits."}
          </p>
        </div>

        <Link href={`/${locale}/admin/propiedades/nueva`}>
          <Button
            variant="primary"
            className="text-xs uppercase tracking-wider font-display h-10 px-5 rounded-sm shrink-0"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>{locale === "es" ? "Nueva Propiedad" : "Add Property"}</span>
          </Button>
        </Link>
      </motion.div>

      {/* KPI Cards Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <MetricsCard
          title={locale === "es" ? "Propiedades en Catálogo" : "Active Listings"}
          value={kpis.properties}
          icon={<Building2 className="h-5 w-5" />}
          trend={{
            value: 8,
            isPositive: true,
            label: locale === "es" ? "vs mes anterior" : "vs last month",
          }}
          chartData={sparklineData1}
          chartColor="var(--accent)"
        />
        <MetricsCard
          title={locale === "es" ? "Prospectos Totales" : "Total Leads"}
          value={kpis.leads}
          icon={<Users className="h-5 w-5" />}
          trend={{
            value: 24,
            isPositive: true,
            label: locale === "es" ? "vs mes anterior" : "vs last month",
          }}
          chartData={sparklineData2}
          chartColor="var(--accent)"
        />
        <MetricsCard
          title={locale === "es" ? "Visitas Agendadas" : "Visits Scheduled"}
          value={kpis.appointments}
          icon={<Calendar className="h-5 w-5" />}
          trend={{
            value: 12,
            isPositive: true,
            label: locale === "es" ? "vs mes anterior" : "vs last month",
          }}
          chartData={sparklineData3}
          chartColor="var(--gold)"
        />
        <MetricsCard
          title={locale === "es" ? "Tasa de Conversión" : "Conversion Rate"}
          value={`${kpis.conversions}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{
            value: 2,
            isPositive: true,
            label: locale === "es" ? "vs mes anterior" : "vs last month",
          }}
          chartData={sparklineData4}
          chartColor="var(--accent)"
        />
      </motion.div>

      {/* Chart + Recent Leads */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Performance Chart */}
        <div className="lg:col-span-2 border border-[var(--border)] bg-[var(--surface)] p-6 rounded-sm glass flex flex-col gap-6">
          <div>
            <h4 className="font-display font-bold text-base text-[var(--text)] mb-1">
              {locale === "es"
                ? "Registro de Clientes e Interacciones"
                : "Customer Registrations & Interactions"}
            </h4>
            <p className="text-xs text-[var(--text-2)] font-light">
              {locale === "es"
                ? "Progresión de leads recibidos y citas de visitas concretadas."
                : "Progression of leads received and visit appointments completed."}
            </p>
          </div>

          <div className="h-80 w-full text-xs font-mono">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis dataKey="name" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface-hover)",
                      borderColor: "var(--border-strong)",
                      borderRadius: "4px",
                      color: "var(--text)",
                    }}
                  />
                  <Bar
                    dataKey="leads"
                    name={locale === "es" ? "Contactos" : "Leads"}
                    fill="var(--accent)"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="visits"
                    name={locale === "es" ? "Citas" : "Visits"}
                    fill="var(--gold)"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-[var(--surface-2)]/30 animate-pulse rounded-sm" />
            )}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="lg:col-span-1 border border-[var(--border)] bg-[var(--surface)] p-6 rounded-sm glass flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-base text-[var(--text)]">
              {locale === "es" ? "Prospectos Recientes" : "Recent Leads"}
            </h4>
            <Link
              href={`/${locale}/admin/leads`}
              className="text-[10px] uppercase font-bold tracking-wider font-display text-[var(--text-2)] hover:text-[var(--accent)] transition-colors flex items-center gap-1"
            >
              <span>{locale === "es" ? "Ver CRM" : "View CRM"}</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {recentLeads.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-xs text-[var(--text-muted)] font-mono border border-dashed border-[var(--border)] rounded-sm">
                <Inbox className="h-6 w-6 mb-2" />
                <span>
                  {locale === "es"
                    ? "Sin prospectos registrados"
                    : "No registered leads"}
                </span>
              </div>
            ) : (
              recentLeads.map((lead, i) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                  className="p-3.5 border border-[var(--border)] bg-[var(--surface-2)]/30 rounded-xs flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text)] truncate max-w-[120px]">
                      {lead.full_name}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 border text-[8px] font-bold rounded-xs uppercase tracking-wider font-display ${getStatusBadgeClass(lead.status)}`}
                    >
                      {lead.status === "visita"
                        ? locale === "es"
                          ? "Cita"
                          : "Visit"
                        : lead.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                    <span className="font-light truncate max-w-[110px]">
                      {getIntentLabel(lead.intent)}
                    </span>
                    <span className="font-mono font-light shrink-0">
                      {new Date(lead.created_at).toLocaleDateString(
                        locale === "es" ? "es-VE" : "en-US",
                        { month: "short", day: "numeric" }
                      )}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          {
            href: `/${locale}/admin/propiedades/nueva`,
            label: locale === "es" ? "Nueva Propiedad" : "New Property",
            sub: locale === "es" ? "Añadir al catálogo" : "Add to catalog",
            color: "border-[var(--accent)]/20 bg-[var(--accent)]/5 text-[var(--accent)]",
          },
          {
            href: `/${locale}/admin/leads`,
            label: locale === "es" ? "Ver Pipeline CRM" : "View CRM Pipeline",
            sub: locale === "es" ? "Gestionar prospectos" : "Manage prospects",
            color: "border-[var(--gold)]/20 bg-[var(--gold)]/5 text-[var(--gold)]",
          },
          {
            href: `/${locale}/admin/blog`,
            label: locale === "es" ? "Editor de Blog" : "Blog Editor",
            sub: locale === "es" ? "Publicar artículos" : "Publish articles",
            color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
          },
        ].map((action) => (
          <motion.div
            key={action.href}
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <Link
              href={action.href}
              className={`group flex items-center justify-between p-4 border rounded-sm transition-all hover:shadow-md ${action.color}`}
            >
              <div>
                <p className="text-xs font-bold font-display">{action.label}</p>
                <p className="text-[10px] opacity-70 mt-0.5 font-light">{action.sub}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
