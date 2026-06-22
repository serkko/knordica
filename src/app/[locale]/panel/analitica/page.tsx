"use client";

import React, { use } from "react";
import { usePanelRole } from "@/hooks/usePanelRole";
import { useKPIData } from "@/hooks/useKPIData";
import { KPIChart } from "@/components/panel/KPIChart";
import { StatCard } from "@/components/panel/StatCard";
import { Building2, Eye, TrendingUp, DollarSign } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function AnaliticaPage({ params }: PageProps) {
  const { locale } = use(params);
  const { role, loading: roleLoading } = usePanelRole();
  const { stats, loading: statsLoading } = useKPIData();

  const loading = roleLoading || statsLoading;

  // Mock data for analytics
  const trafficData = [
    { month: locale === "en" ? "Jan" : "Ene", views: 4000, leads: 240 },
    { month: locale === "en" ? "Feb" : "Feb", views: 4500, leads: 290 },
    { month: locale === "en" ? "Mar" : "Mar", views: 5100, leads: 320 },
    { month: locale === "en" ? "Apr" : "Abr", views: 6000, leads: 400 },
    { month: locale === "en" ? "May" : "May", views: 7800, leads: 520 },
    { month: locale === "en" ? "Jun" : "Jun", views: 9500, leads: 640 },
  ];

  const typeDistribution = [
    { name: locale === "en" ? "Houses" : "Casas", quantity: 18 },
    { name: locale === "en" ? "Apartments" : "Apartamentos", quantity: 32 },
    { name: locale === "en" ? "Offices" : "Oficinas", quantity: 8 },
    { name: locale === "en" ? "Land" : "Terrenos", quantity: 12 },
  ];

  const salesVolume = [
    { name: "La Pedregosa", total: 1200000 },
    { name: "El Tapial", total: 850000 },
    { name: "Chorros Milla", total: 640000 },
    { name: "Av. Los Próceres", total: 1450000 },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-white/5 rounded-xs animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-[340px] bg-white/5 rounded-sm border border-[var(--border)] animate-pulse" />
          <div className="h-[340px] bg-white/5 rounded-sm border border-[var(--border)] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[var(--border)]">
        <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-[var(--text)]">
          {locale === "en" ? "Analytics Dashboard" : "Panel de Analítica y Métricas"}
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {locale === "en" ? "Global traffic trends, transaction volumes and sector distribution." : "Revisa las tendencias de tráfico, volumen de operaciones y zonas con mayor demanda."}
        </p>
      </div>

      {/* Top Stat Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={locale === "en" ? "Total Pageviews" : "Visitas Totales"}
          value={28400}
          change={14.8}
          icon={<Eye size={16} />}
        />
        <StatCard
          title={locale === "en" ? "Portfolio Value" : "Valor del Portafolio"}
          value={4850000}
          isCurrency
          change={5.2}
          icon={<DollarSign size={16} />}
        />
        <StatCard
          title={locale === "en" ? "Conversion Rate" : "Tasa de Conversión"}
          value={6.8}
          change={1.2}
          icon={<TrendingUp size={16} />}
        />
        <StatCard
          title={locale === "en" ? "Registered Listings" : "Inmuebles Activos"}
          value={70}
          change={3.4}
          icon={<Building2 size={16} />}
        />
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Web Traffic (views) */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className="text-xs font-semibold text-[var(--text-muted)] font-display uppercase tracking-widest">
            {locale === "en" ? "Monthly Page Views & Lead Capture" : "Visitas Web y Captación de Leads"}
          </h4>
          <KPIChart type="area" data={trafficData} locale={locale} xKey="month" yKey="views" height={320} />
        </div>

        {/* Sector Type Distribution */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-[var(--text-muted)] font-display uppercase tracking-widest">
            {locale === "en" ? "Property Type Share" : "Distribución por Tipo de Propiedad"}
          </h4>
          <KPIChart type="pie" data={typeDistribution} locale={locale} nameKey="name" yKey="quantity" height={320} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Sales Volume by zone */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-[var(--text-muted)] font-display uppercase tracking-widest">
            {locale === "en" ? "Portfolio Value by Zone ($ USD)" : "Valor del Portafolio por Zona ($ USD)"}
          </h4>
          <KPIChart type="bar" data={salesVolume} locale={locale} xKey="name" yKey="total" height={300} />
        </div>
      </div>
    </div>
  );
}
