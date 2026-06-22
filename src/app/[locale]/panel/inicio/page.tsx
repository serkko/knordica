"use client";

import React, { use } from "react";
import { usePanelRole } from "@/hooks/usePanelRole";
import { useKPIData } from "@/hooks/useKPIData";
import { StatCard } from "@/components/panel/StatCard";
import { KPIChart } from "@/components/panel/KPIChart";
import { DataTable, Column } from "@/components/panel/DataTable";
import { Building2, Eye, Users, DollarSign, Calendar, Clock, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function InicioPage({ params }: PageProps) {
  const { locale } = use(params);
  const { role, loading: roleLoading } = usePanelRole();
  const { stats, loading: statsLoading } = useKPIData();

  const loading = roleLoading || statsLoading;

  // Mock data for dashboard visualizations
  const viewsTrendData = [
    { name: locale === "en" ? "Jan" : "Ene", value: 400 },
    { name: locale === "en" ? "Feb" : "Feb", value: 600 },
    { name: locale === "en" ? "Mar" : "Mar", value: 550 },
    { name: locale === "en" ? "Apr" : "Abr", value: 900 },
    { name: locale === "en" ? "May" : "May", value: 1200 },
    { name: locale === "en" ? "Jun" : "Jun", value: 1500 },
  ];

  const distributionData = [
    { name: locale === "en" ? "Sale" : "Venta", value: 65 },
    { name: locale === "en" ? "Rent" : "Alquiler", value: 30 },
    { name: locale === "en" ? "Vacation" : "Vacacional", value: 5 },
  ];

  const mockRecentProperties = [
    { id: "1", title: "Villa de Lujo en La Pedregosa", type: "casa", price: 320000, views: 1240, date: "2026-06-20" },
    { id: "2", title: "Apartamento Premium El Tapial", type: "apartamento", price: 145000, views: 890, date: "2026-06-18" },
    { id: "3", title: "Terreno Comercial Av. Los Próceres", type: "terreno_lote", price: 85000, views: 420, date: "2026-06-15" },
  ];

  const propertyColumns: Column<typeof mockRecentProperties[0]>[] = [
    {
      key: "title",
      label_es: "Propiedad",
      label_en: "Property",
      render: (item) => <span className="font-semibold text-white/90">{item.title}</span>,
    },
    {
      key: "type",
      label_es: "Tipo",
      label_en: "Type",
      render: (item) => <span className="capitalize">{item.type.replace("_", " ")}</span>,
    },
    {
      key: "price",
      label_es: "Precio",
      label_en: "Price",
      render: (item) => <span className="font-mono">${item.price.toLocaleString()}</span>,
    },
    {
      key: "views",
      label_es: "Vistas",
      label_en: "Views",
      render: (item) => <span className="font-mono text-emerald-400">{item.views}</span>,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-white/5 rounded-xs animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-32 bg-white/5 rounded-sm border border-[var(--border)] animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[340px] bg-white/5 rounded-sm border border-[var(--border)] animate-pulse" />
          <div className="h-[340px] bg-white/5 rounded-sm border border-[var(--border)] animate-pulse" />
        </div>
      </div>
    );
  }

  // Define icons for stats
  const statIcons = {
    propiedades: <Building2 size={16} />,
    vistas: <Eye size={16} />,
    clientes: <Users size={16} />,
    portafolio: <DollarSign size={16} />,
  };

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold font-display tracking-tight text-[var(--text)]">
          {locale === "en" ? "Professional Workspace" : "Espacio de Trabajo Profesional"}
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {locale === "en"
            ? `Signed in as: ${role === "admin" ? "Administrator" : role === "senior" ? "Senior Advisor" : "Advisor"}`
            : `Sesión iniciada como: ${role === "admin" ? "Administrador" : role === "senior" ? "Asesor Senior" : "Asesor"}`}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const key = stat.key as keyof typeof statIcons;
          return (
            <StatCard
              key={stat.key}
              title={locale === "en" ? stat.title_en : stat.title_es}
              value={stat.value}
              isCurrency={stat.is_currency}
              change={stat.change}
              sparkline={stat.sparkline}
              icon={statIcons[key] || <Building2 size={16} />}
            />
          );
        })}
      </div>

      {/* Visualizations & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Analytics Line Chart */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className="text-xs font-semibold text-[var(--text-muted)] font-display uppercase tracking-widest">
            {locale === "en" ? "Performance / Traffic Trend (Views)" : "Rendimiento y Tráfico (Vistas)"}
          </h4>
          <KPIChart type="area" data={viewsTrendData} locale={locale} xKey="name" yKey="value" height={300} />
        </div>

        {/* Listings Distribution Pie Chart */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-[var(--text-muted)] font-display uppercase tracking-widest">
            {locale === "en" ? "Listings Distribution" : "Distribución de Portafolio"}
          </h4>
          <KPIChart type="pie" data={distributionData} locale={locale} nameKey="name" yKey="value" height={300} />
        </div>
      </div>

      {/* Recent Properties & Next Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent properties list */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className="text-xs font-semibold text-[var(--text-muted)] font-display uppercase tracking-widest">
            {locale === "en" ? "Recent Listings" : "Inmuebles Recientes"}
          </h4>
          <DataTable
            columns={propertyColumns}
            data={mockRecentProperties}
            locale={locale}
            keyExtractor={(item) => item.id}
            pageSize={3}
          />
        </div>

        {/* Agenda Events */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-[var(--text-muted)] font-display uppercase tracking-widest">
            {locale === "en" ? "Agenda / Today" : "Agenda de Hoy"}
          </h4>
          <div
            className="border rounded-sm p-4 space-y-4 min-h-[160px]"
            style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
          >
            <div className="flex gap-3 items-start border-b border-[var(--border)] pb-3">
              <span className="w-8 h-8 rounded-sm bg-[#01696f]/10 text-[#01696f] flex items-center justify-center shrink-0 mt-0.5">
                <Clock size={14} />
              </span>
              <div className="text-xs">
                <p className="font-semibold text-white/90">Visita: Apartamento El Tapial</p>
                <p className="text-[var(--text-muted)] mt-0.5">Cliente: Carlos Mendoza · 10:00 AM</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <span className="w-8 h-8 rounded-sm bg-[#C9962A]/10 text-[#C9962A] flex items-center justify-center shrink-0 mt-0.5">
                <Calendar size={14} />
              </span>
              <div className="text-xs">
                <p className="font-semibold text-white/90">Cierre de Firma Notaría</p>
                <p className="text-[var(--text-muted)] mt-0.5">Casa Pedregosa (Venta) · 02:30 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
