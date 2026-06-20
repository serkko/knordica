"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, Percent, Calendar, Calculator, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/layout/LocaleProvider";

const mortgageSchema = zod.object({
  price: zod.number().min(1000, { message: "price_min" }),
  downPayment: zod.number().min(0),
  interestRate: zod.number().min(0.1, { message: "interest_min" }).max(30),
  termYears: zod.number().min(1).max(40),
});

type MortgageFormData = zod.infer<typeof mortgageSchema>;

export default function MortgageCalculator() {
  const { locale } = useLocale();
  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState<{
    monthlyPayment: number;
    totalLoan: number;
    totalInterest: number;
    totalPaid: number;
    chartData: { year: number; balance: number; principalPaid: number; interestPaid: number }[];
    pieData: { name: string; value: number; color: string }[];
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
  } = useForm<MortgageFormData>({
    resolver: zodResolver(mortgageSchema),
    defaultValues: {
      price: 150000,
      downPayment: 30000,
      interestRate: 6.5,
      termYears: 20,
    },
  });

  const priceValue = watch("price");
  const downPaymentValue = watch("downPayment");

  // Keep down payment validated against price
  useEffect(() => {
    if (downPaymentValue > priceValue) {
      setValue("downPayment", Math.round(priceValue * 0.2));
    }
  }, [priceValue, setValue]);

  const calculateMortgage = (data: MortgageFormData) => {
    const loanAmount = data.price - data.downPayment;
    const monthlyRate = data.interestRate / 100 / 12;
    const totalPayments = data.termYears * 12;

    // Monthly payment formula
    let monthlyPayment = 0;
    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / totalPayments;
    } else {
      monthlyPayment =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
        (Math.pow(1 + monthlyRate, totalPayments) - 1);
    }

    const totalPaid = monthlyPayment * totalPayments;
    const totalInterest = totalPaid - loanAmount;

    // Amortization Schedule (aggregated by year)
    let balance = loanAmount;
    const chartData = [];
    
    // Year 0
    chartData.push({
      year: 0,
      balance: Math.round(balance),
      principalPaid: 0,
      interestPaid: 0,
    });

    let cumulativePrincipal = 0;
    let cumulativeInterest = 0;

    for (let year = 1; year <= data.termYears; year++) {
      let yearPrincipal = 0;
      let yearInterest = 0;

      for (let month = 1; month <= 12; month++) {
        const interestMonth = balance * monthlyRate;
        const principalMonth = monthlyPayment - interestMonth;

        balance = Math.max(0, balance - principalMonth);
        yearPrincipal += principalMonth;
        yearInterest += interestMonth;
      }

      cumulativePrincipal += yearPrincipal;
      cumulativeInterest += yearInterest;

      chartData.push({
        year,
        balance: Math.round(balance),
        principalPaid: Math.round(cumulativePrincipal),
        interestPaid: Math.round(cumulativeInterest),
      });
    }

    const pieData = [
      { name: locale === "es" ? "Préstamo (Capital)" : "Loan (Principal)", value: Math.round(loanAmount), color: "#C9A96E" },
      { name: locale === "es" ? "Intereses Totales" : "Total Interest", value: Math.round(totalInterest), color: "#2DD4BF" },
      { name: locale === "es" ? "Enganche (Inicial)" : "Down Payment", value: Math.round(data.downPayment), color: "#5C5A57" },
    ];

    setResult({
      monthlyPayment,
      totalLoan: loanAmount,
      totalInterest,
      totalPaid,
      chartData,
      pieData,
    });
  };

  // Run calculation once on load or when form loads
  useEffect(() => {
    calculateMortgage({
      price: 150000,
      downPayment: 30000,
      interestRate: 6.5,
      termYears: 20,
    });
  }, [mounted]);

  const onSubmit = (data: MortgageFormData) => {
    calculateMortgage(data);
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
      {/* Inputs panel */}
      <div className="lg:col-span-4 p-6 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass flex flex-col gap-5">
        <div>
          <h3 className="font-display font-bold text-base text-[var(--text)] flex items-center gap-2">
            <Calculator className="h-4 w-4 text-[var(--accent)]" />
            <span>{locale === "es" ? "Parámetros del préstamo" : "Loan Parameters"}</span>
          </h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Price */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
              {locale === "es" ? "Precio de propiedad (USD)" : "Property Price (USD)"}
            </label>
            <div className="relative">
              <DollarSign className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
              <input
                type="number"
                {...register("price", { valueAsNumber: true })}
                className="h-10 w-full pl-9 pr-4 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
              />
            </div>
            {errors.price && (
              <span className="text-[10px] text-[var(--danger)]">
                {locale === "es" ? "Monto mínimo es $1,000" : "Minimum price is $1,000"}
              </span>
            )}
          </div>

          {/* Down Payment */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
              {locale === "es" ? "Cuota Inicial / Enganche" : "Down Payment"}
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
            {/* Interest */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                {locale === "es" ? "Tasa Anual (%)" : "Annual Interest (%)"}
              </label>
              <div className="relative">
                <Percent className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
                <input
                  type="number"
                  step="0.01"
                  {...register("interestRate", { valueAsNumber: true })}
                  className="h-10 w-full pl-9 pr-4 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Years */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                {locale === "es" ? "Plazo (Años)" : "Term (Years)"}
              </label>
              <div className="relative">
                <Calendar className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
                <input
                  type="number"
                  {...register("termYears", { valueAsNumber: true })}
                  className="h-10 w-full pl-9 pr-4 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <Button type="submit" variant="primary" className="h-10 rounded-sm font-display text-xs uppercase tracking-wider mt-2">
            {locale === "es" ? "Calcular Hipoteca" : "Calculate Mortgage"}
          </Button>
        </form>
      </div>

      {/* Results panel */}
      {result && (
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Key Metric Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 border border-[var(--border)] bg-[var(--surface-2)]/40 rounded-sm flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display">
                {locale === "es" ? "Cuota Mensual" : "Monthly Payment"}
              </span>
              <span className="text-2xl font-bold font-display text-[var(--gold)] mt-2">
                {formattedValue(result.monthlyPayment)}
              </span>
            </div>

            <div className="p-5 border border-[var(--border)] bg-[var(--surface-2)]/40 rounded-sm flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display">
                {locale === "es" ? "Monto Financiado" : "Total Loan"}
              </span>
              <span className="text-lg font-bold font-display text-[var(--text)] mt-2">
                {formattedValue(result.totalLoan)}
              </span>
            </div>

            <div className="p-5 border border-[var(--border)] bg-[var(--surface-2)]/40 rounded-sm flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display">
                {locale === "es" ? "Total de Intereses" : "Total Interest Cost"}
              </span>
              <span className="text-lg font-bold font-display text-[var(--text)] mt-2">
                {formattedValue(result.totalInterest)}
              </span>
            </div>
          </div>

          {/* Graphics Split */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Amortization Area Chart */}
            <div className="md:col-span-7 border border-[var(--border)] p-5 bg-[var(--surface)]/30 rounded-sm glass">
              <h4 className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display mb-4">
                {locale === "es" ? "Estructura de amortización en el tiempo" : "Amortization schedule over time"}
              </h4>
              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.chartData}>
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
                    <Area
                      type="monotone"
                      dataKey="balance"
                      stackId="1"
                      stroke="var(--gold)"
                      fill="var(--accent-gold-dim)"
                      name={locale === "es" ? "Saldo de Deuda" : "Remaining Balance"}
                    />
                    <Area
                      type="monotone"
                      dataKey="principalPaid"
                      stackId="2"
                      stroke="var(--accent)"
                      fill="var(--accent-dim)"
                      name={locale === "es" ? "Capital Pagado" : "Principal Paid"}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart summary */}
            <div className="md:col-span-5 border border-[var(--border)] p-5 bg-[var(--surface)]/30 rounded-sm glass flex flex-col items-center">
              <h4 className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display mb-2 self-start">
                {locale === "es" ? "Distribución del costo total" : "Total cost distribution"}
              </h4>
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={result.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {result.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2 w-full text-xs">
                {result.pieData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between font-light">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-[var(--text-2)]">{item.name}</span>
                    </div>
                    <span className="font-bold text-[var(--text)]">{formattedValue(item.value)}</span>
                  </div>
                ))}
                <div className="border-t border-[var(--border)] pt-2 flex items-center justify-between text-xs font-bold text-[var(--text)]">
                  <span>{locale === "es" ? "Pago Total Estimado" : "Total Cost of Ownership"}</span>
                  <span>{formattedValue(result.totalPaid + (result.pieData[2]?.value ?? 0))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
