/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface KPIChartProps {
  data: Record<string, any>[];
  title?: string;
  type?: "area" | "bar" | "pie";
  xKey?: string;
  yKey?: string;
  nameKey?: string;
  color?: string;
  color2?: string;
  height?: number;
  locale?: string;
}

export function KPIChart({
  data,
  title,
  type = "area",
  xKey = "label",
  yKey = "value",
  nameKey = "name",
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

  const COLORS = [color, color2, "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"];

  return (
    <div className="flex flex-col gap-3">
      {title && (
        <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest font-display">
          {title}
        </h4>
      )}

      <ResponsiveContainer width="100%" height={height}>
        {type === "pie" ? (
          <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={height / 2.5}
              fill="#8884d8"
              dataKey={yKey}
              nameKey={nameKey}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                fontSize: "11px",
                color: "var(--text)",
              }}
            />
          </PieChart>
        ) : type === "bar" ? (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
            <XAxis
              dataKey={xKey}
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
            />
            <Bar dataKey={yKey} fill={color} radius={[2, 2, 0, 0]} />
          </BarChart>
        ) : (
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="kg1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
            <XAxis
              dataKey={xKey}
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
              dataKey={yKey}
              stroke={color}
              strokeWidth={2}
              fill="url(#kg1)"
              dot={false}
              isAnimationActive
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
