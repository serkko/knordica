"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import MortgageCalculator from "@/components/tools/MortgageCalculator";
import InvestmentCalculator from "@/components/tools/InvestmentCalculator";
import { useLocale } from "@/components/layout/LocaleProvider";
import { Calculator, TrendingUp } from "lucide-react";

type ToolTab = "mortgage" | "investment";

export default function ToolsContainer() {
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<ToolTab>("mortgage");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "mortgage" || tabParam === "investment") {
      setActiveTab(tabParam as ToolTab);
    }
  }, [searchParams]);

  const tabs = [
    {
      id: "mortgage" as ToolTab,
      label: locale === "es" ? "Hipoteca" : "Mortgage",
      icon: <Calculator className="h-4 w-4" />,
    },
    {
      id: "investment" as ToolTab,
      label: locale === "es" ? "Inversión y Plusvalía" : "Investment ROI",
      icon: <TrendingUp className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Tab Navigation Bar */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-wider font-semibold font-display border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-[var(--text-2)] hover:text-[var(--text)] hover:border-[var(--border-strong)]"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Active Panel View */}
      <div className="animate-in fade-in duration-300">
        {activeTab === "mortgage" && <MortgageCalculator />}
        {activeTab === "investment" && <InvestmentCalculator />}
      </div>
    </div>
  );
}
