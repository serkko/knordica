"use client";

import { useState } from "react";
import MortgageCalculator from "@/components/tools/MortgageCalculator";
import InvestmentCalculator from "@/components/tools/InvestmentCalculator";
import PropertyComparator from "@/components/tools/PropertyComparator";
import { useComparatorStore } from "@/store/comparator.store";
import { useLocale } from "@/components/layout/LocaleProvider";
import { Calculator, TrendingUp, GitCompare } from "lucide-react";

type ToolTab = "mortgage" | "investment" | "compare";

export default function ToolsContainer() {
  const { locale } = useLocale();
  const [activeTab, setActiveTab] = useState<ToolTab>("mortgage");
  const { selectedProperties } = useComparatorStore();

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
    {
      id: "compare" as ToolTab,
      label: locale === "es" ? "Comparador" : "Compare List",
      icon: <GitCompare className="h-4 w-4" />,
      badge: selectedProperties.length > 0 ? selectedProperties.length : undefined,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Premium Tab Bar */}
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
            {tab.badge !== undefined && (
              <span className="h-5 min-w-5 px-1.5 rounded-full text-[9px] font-mono font-bold bg-[var(--accent)] text-black flex items-center justify-center">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active Panel View */}
      <div className="animate-in fade-in duration-300">
        {activeTab === "mortgage" && <MortgageCalculator />}
        {activeTab === "investment" && <InvestmentCalculator />}
        {activeTab === "compare" && <PropertyComparator />}
      </div>
    </div>
  );
}
