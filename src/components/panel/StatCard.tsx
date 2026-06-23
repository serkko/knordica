/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  change?: number;
  sparkline?: number[];
  accentColor?: string;
  isCurrency?: boolean;
  currencyUnit?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  change,
  sparkline,
  accentColor = "var(--accent)",
  isCurrency = false,
  currencyUnit = "USD",
}: StatCardProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const activeTrend = trend ?? (typeof change === "number" ? {
    value: Math.abs(change),
    isPositive: change >= 0,
    label: "vs. mes anterior"
  } : undefined);

  const chartData = sparkline?.map((v) => ({ value: v })) ?? [];
  const gradId = `sg-${title.replace(/\s+/g, "").toLowerCase()}`;

  const displayValue = isCurrency
    ? `${currencyUnit} ${Number(value).toLocaleString()}`
    : value;

  return (
    <div className="p-5 border border-[var(--border)] rounded-sm bg-[var(--surface)] hover:border-[var(--border-strong)] transition-all flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display">
            {title}
          </span>
          <span className="text-2xl font-bold font-mono tracking-tight text-[var(--text)] mt-1 tabular-nums">
            {displayValue}
          </span>
        </div>
        <div
          className="h-9 w-9 border border-[var(--border)] rounded-sm flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in oklab, ${accentColor} 8%, var(--surface-2))` }}
        >
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 mt-1">
        {activeTrend && (
          <div className="flex flex-col gap-0.5">
            <span
              className={`flex items-center gap-0.5 text-xs font-bold ${
                activeTrend.isPositive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {activeTrend.isPositive ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {activeTrend.isPositive ? "+" : ""}{activeTrend.value}%
            </span>
            {activeTrend.label && (
              <span className="text-[10px] text-[var(--text-muted)]">{activeTrend.label}</span>
            )}
          </div>
        )}

        {chartData.length > 1 && (
          <div className="h-10 w-24 shrink-0">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={accentColor} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={accentColor}
                    strokeWidth={1.5}
                    fill={`url(#${gradId})`}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full animate-pulse rounded-xs bg-[var(--surface-2)]/30" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
