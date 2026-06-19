"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { DollarSign, Percent, Calculator, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/layout/LocaleProvider";

const investmentSchema = zod.object({
  price: zod.number().min(1000, { message: "price_min" }),
  monthlyRent: zod.number().min(0),
  downPayment: zod.number().min(0),
  appreciationRate: zod.number().min(0).max(25),
  expensesRate: zod.number().min(0).max(30), // % of rental income
});

type InvestmentFormData = zod.infer<typeof investmentSchema>;

export default function InvestmentCalculator() {
  const { locale } = useLocale();
  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState<{
    capRate: number;
    cashOnCash: number;
    year10Value: number;
    totalRentalIncome: number;
    netReturnPercent: number;
    chartData: { year: number; propertyValue: number; rentalProfit: number; totalEquity: number }[];
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      price: 200000,
      monthlyRent: 1200,
      downPayment: 60000,
      appreciationRate: 4.5,
      expensesRate: 15,
    },
  });

  const priceValue = watch("price");
  const downPaymentValue = watch("downPayment");

  // Keep down payment validated against price
  useEffect(() => {
    if (downPaymentValue > priceValue) {
      setValue("downPayment", priceValue);
    }
  }, [priceValue, setValue]);

  const calculateInvestment = (data: InvestmentFormData) => {
    const annualRentalIncome = data.monthlyRent * 12;
    const annualExpenses = annualRentalIncome * (data.expensesRate / 100);
    const netOperatingIncome = annualRentalIncome - annualExpenses;

    // Cap Rate = NOI / Price
    const capRate = data.price > 0 ? (netOperatingIncome / data.price) * 100 : 0;

    // Cash on Cash Return = NOI / Down Payment (assuming cash purchase or basic simplified downpayment leverage)
    const initialInvestment = data.downPayment;
    const cashOnCash = initialInvestment > 0 ? (netOperatingIncome / initialInvestment) * 100 : 0;

    // Projections over 10 years
    let propertyValue = data.price;
    let cumulativeRentalProfit = 0;
    const chartData = [];

    // Year 0
    chartData.push({
      year: 0,
      propertyValue: Math.round(propertyValue),
      rentalProfit: 0,
      totalEquity: Math.round(propertyValue),
    });

    for (let year = 1; year <= 10; year++) {
      // Apply appreciation
      propertyValue = propertyValue * (1 + data.appreciationRate / 100);

      // Rent appreciation (simulated at 2% yearly)
      const yearRent = annualRentalIncome * Math.pow(1.02, year - 1);
      const yearExpenses = yearRent * (data.expensesRate / 100);
      const yearNOI = yearRent - yearExpenses;

      cumulativeRentalProfit += yearNOI;

      chartData.push({
        year,
        propertyValue: Math.round(propertyValue),
        rentalProfit: Math.round(cumulativeRentalProfit),
        totalEquity: Math.round(propertyValue + cumulativeRentalProfit),
      });
    }

    const year10Value = chartData[10]?.propertyValue ?? data.price;
    const totalEarnings = (year10Value - data.price) + cumulativeRentalProfit;
    const netReturnPercent = initialInvestment > 0 ? (totalEarnings / initialInvestment) * 100 : 0;

    setResult({
      capRate,
      cashOnCash,
      year10Value,
      totalRentalIncome: cumulativeRentalProfit,
      netReturnPercent,
      chartData,
    });
  };

  useEffect(() => {
    calculateInvestment({
      price: 200000,
      monthlyRent: 1200,
      downPayment: 60000,
      appreciationRate: 4.5,
      expensesRate: 15,
    });
  }, [mounted]);

  const onSubmit = (data: InvestmentFormData) => {
    calculateInvestment(data);
  };

  const formattedValue = (val: number) => {
    return new Intl.NumberFormat(locale === "es" ? "es-VE" : "en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (!mounted) {
    return <div className="h-96 w-full animate-pulse bg-[var(--surface-2)] border border-[var(--border)] rounded-sm" />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Inputs */}
      <div className="lg:col-span-4 p-6 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass flex flex-col gap-5">
        <div>
          <h3 className="font-display font-bold text-base text-[var(--text)] flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--accent)]" />
            <span>{locale === "es" ? "Parámetros de inversión" : "Investment Specs"}</span>
          </h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Price */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
              {locale === "es" ? "Precio de compra (USD)" : "Purchase Price (USD)"}
            </label>
            <div className="relative">
              <DollarSign className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
              <input
                type="number"
                {...register("price", { valueAsNumber: true })}
                className="h-10 w-full pl-9 pr-4 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Monthly Rent */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
              {locale === "es" ? "Renta mensual estimada" : "Est. Monthly Rent"}
            </label>
            <div className="relative">
              <DollarSign className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
              <input
                type="number"
                {...register("monthlyRent", { valueAsNumber: true })}
                className="h-10 w-full pl-9 pr-4 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Initial Investment */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
              {locale === "es" ? "Capital Inicial Invertido" : "Initial Capital Invested"}
            </label>
            <div className="relative">
              <DollarSign className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
              <input
                type="number"
                {...register("downPayment", { valueAsNumber: true })}
                className="h-10 w-full pl-9 pr-4 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Appreciation */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                {locale === "es" ? "Plusvalía Anual (%)" : "Appreciation (%)"}
              </label>
              <div className="relative">
                <Percent className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
                <input
                  type="number"
                  step="0.1"
                  {...register("appreciationRate", { valueAsNumber: true })}
                  className="h-10 w-full pl-9 pr-4 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Expenses */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                {locale === "es" ? "Gastos Anuales (%)" : "Expenses (%)"}
              </label>
              <div className="relative">
                <Percent className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
                <input
                  type="number"
                  {...register("expensesRate", { valueAsNumber: true })}
                  className="h-10 w-full pl-9 pr-4 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <Button type="submit" variant="primary" className="h-10 rounded-sm font-display text-xs uppercase tracking-wider mt-2">
            {locale === "es" ? "Calcular Rendimiento" : "Calculate Returns"}
          </Button>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 border border-[var(--border)] bg-[var(--surface-2)]/40 rounded-sm flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display">
                Cap Rate (Tasa de Retorno)
              </span>
              <span className="text-xl font-bold font-display text-[var(--accent)] mt-2">
                {result.capRate.toFixed(2)}%
              </span>
            </div>

            <div className="p-5 border border-[var(--border)] bg-[var(--surface-2)]/40 rounded-sm flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display">
                Cash-on-Cash Return
              </span>
              <span className="text-xl font-bold font-display text-[var(--accent)] mt-2">
                {result.cashOnCash.toFixed(2)}%
              </span>
            </div>

            <div className="p-5 border border-[var(--border)] bg-[var(--surface-2)]/40 rounded-sm flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display">
                {locale === "es" ? "Retorno Neto a 10 Años" : "10-Year Net Return"}
              </span>
              <span className="text-xl font-bold font-display text-[var(--gold)] mt-2">
                {result.netReturnPercent.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Projection breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border border-[var(--border)] bg-[var(--surface)]/30 rounded-sm flex justify-between items-center text-xs">
              <span className="font-light text-[var(--text-2)]">
                {locale === "es" ? "Valor de propiedad (Año 10)" : "Property Value (Year 10)"}
              </span>
              <span className="font-bold text-[var(--text)]">{formattedValue(result.year10Value)}</span>
            </div>
            <div className="p-4 border border-[var(--border)] bg-[var(--surface)]/30 rounded-sm flex justify-between items-center text-xs">
              <span className="font-light text-[var(--text-2)]">
                {locale === "es" ? "Ganancia Acumulada por Rentas" : "Cumulative Rental Profits"}
              </span>
              <span className="font-bold text-[var(--text)]">{formattedValue(result.totalRentalIncome)}</span>
            </div>
          </div>

          {/* Bar Chart representing Capital Appreciation + Rental Income growth */}
          <div className="border border-[var(--border)] p-5 bg-[var(--surface)]/30 rounded-sm glass">
            <h4 className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display mb-4">
              {locale === "es" ? "Proyección de crecimiento del capital total" : "Projected total equity growth"}
            </h4>
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.chartData}>
                  <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={10}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#17171b",
                      borderColor: "var(--border-strong)",
                      color: "var(--text)",
                      fontFamily: "var(--font-body)",
                    }}
                    formatter={(val: any) => [formattedValue(Number(val)), ""]}
                  />
                  <ReferenceLine y={priceValue} stroke="var(--border-strong)" strokeDasharray="3 3" />
                  <Bar
                    dataKey="propertyValue"
                    fill="var(--gold)"
                    name={locale === "es" ? "Valor Inmueble" : "Property Value"}
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="rentalProfit"
                    fill="var(--accent)"
                    name={locale === "es" ? "Ganancia de Renta" : "Rental Profits"}
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
