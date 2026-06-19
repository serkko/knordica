"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  chartData?: { value: number }[];
  chartColor?: string;
}

export function MetricsCard({
  title,
  value,
  icon,
  trend,
  chartData,
  chartColor = "var(--accent)",
}: MetricsCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card className="p-6 border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] transition-all flex flex-col gap-4">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display">
            {title}
          </span>
          <h3 className="text-2xl font-bold font-mono tracking-tight text-[var(--text)] mt-1">
            {value}
          </h3>
        </div>
        <div className="h-10 w-10 border border-[var(--border)] rounded-sm flex items-center justify-center bg-[var(--surface-2)] shrink-0 text-[var(--text-2)]">
          {icon}
        </div>
      </div>

      {/* Bottom row: Trend & Sparkline */}
      <div className="flex items-end justify-between gap-4 mt-2">
        {/* Trend Info */}
        {trend && (
          <div className="flex flex-col gap-0.5">
            <span className={`flex items-center gap-0.5 text-xs font-bold ${
              trend.isPositive ? "text-emerald-400" : "text-red-400"
            }`}>
              {trend.isPositive ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
            {trend.label && (
              <span className="text-[10px] text-[var(--text-muted)] font-light">
                {trend.label}
              </span>
            )}
          </div>
        )}

        {/* Sparkline Spark Chart */}
        {chartData && chartData.length > 0 && (
          <div className="h-12 w-28 shrink-0">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`grad-${title.replace(/\s+/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={chartColor}
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill={`url(#grad-${title.replace(/\s+/g, "")})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-[var(--surface-2)]/30 animate-pulse rounded-xs" />
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
