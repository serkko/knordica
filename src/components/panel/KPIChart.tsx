"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface DataPoint {
  label: string;
  value: number;
  value2?: number;
}

interface KPIChartProps {
  data: DataPoint[];
  title?: string;
  dataKey?: string;
  dataKey2?: string;
  color?: string;
  color2?: string;
  height?: number;
  locale?: string;
}

export function KPIChart({
  data,
  title,
  dataKey = "value",
  dataKey2,
  color = "var(--accent)",
  color2 = "var(--gold)",
  height = 200,
  locale = "es",
}: KPIChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div
        className="w-full rounded-sm animate-pulse bg-[var(--surface-2)]/30"
        style={{ height }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {title && (
        <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest font-display">
          {title}
        </h4>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="kg1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            {dataKey2 && (
              <linearGradient id="kg2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color2} stopOpacity={0.15} />
                <stop offset="95%" stopColor={color2} stopOpacity={0} />
              </linearGradient>
            )}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            strokeOpacity={0.5}
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              fontSize: "11px",
              color: "var(--text)",
            }}
            itemStyle={{ color: "var(--text)" }}
            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill="url(#kg1)"
            dot={false}
            isAnimationActive
          />
          {dataKey2 && (
            <Area
              type="monotone"
              dataKey={dataKey2}
              stroke={color2}
              strokeWidth={1.5}
              fill="url(#kg2)"
              dot={false}
              isAnimationActive
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
