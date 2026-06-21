"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Building2, DollarSign, ChevronDown, Check, Car, Droplet, Shield, Zap, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/components/layout/LocaleProvider";
import type { Zone } from "@/types/property";
import { cn } from "@/lib/utils/cn";

interface HeroSearchProps {
  zones: Zone[];
}

interface DropdownOption {
  value: string;
  label_es: string;
  label_en: string;
  desc_es: string;
  desc_en: string;
}

interface CustomDropdownProps {
  label: string;
  value: string;
  placeholder: string;
  options: DropdownOption[];
  onChange: (val: string) => void;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

// Fully custom premium dropdown component with descriptive options (solid background for maximum contrast)
function CustomDropdown({
  label,
  value,
  placeholder,
  options,
  onChange,
  icon,
  isOpen,
  onToggle
}: CustomDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { locale } = useLocale();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onToggle]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption 
    ? (locale === "es" ? selectedOption.label_es : selectedOption.label_en) 
    : placeholder;

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => onToggle(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between text-left px-5 py-3 border rounded-sm focus:outline-hidden transition-all duration-300 cursor-pointer h-16",
          isOpen 
            ? "bg-white/[0.08] border-[var(--color-gold)] shadow-[0_0_12px_rgba(201,150,42,0.2)]" 
            : "bg-white/[0.02] border-white/10 hover:bg-white/[0.04] hover:border-white/20"
        )}
        style={{
          fontFamily: "var(--font-body)",
        }}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={cn("transition-colors duration-300 shrink-0", isOpen ? "text-[var(--color-gold)]" : "text-white/40")}>
            {icon}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] uppercase tracking-widest font-semibold text-white/45 select-none leading-none mb-1">
              {label}
            </span>
            <span className="text-[13px] font-medium text-white tracking-wide truncate">
              {displayValue}
            </span>
          </div>
        </div>
        <ChevronDown 
          size={14} 
          className={cn("text-white/40 transition-transform duration-300 shrink-0 ml-2", isOpen && "rotate-180 text-[var(--color-gold)]")} 
        />
      </button>

      {/* Dropdown Options List - Solid opaque dark background to prevent bleed */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 mt-2 z-50 overflow-hidden bg-[#161412] border border-[var(--color-gold)]/40 rounded-sm shadow-2xl p-2 max-h-72 overflow-y-auto"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              const title = locale === "es" ? opt.label_es : opt.label_en;
              const desc = locale === "es" ? opt.desc_es : opt.desc_en;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    onToggle(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3.5 py-2.5 rounded-sm text-left transition-all duration-150 cursor-pointer mb-0.5 last:mb-0",
                    isSelected 
                      ? "bg-[var(--color-gold)] text-black font-semibold" 
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className={cn("text-[12.5px] tracking-wide truncate", isSelected ? "text-black font-semibold" : "text-white")}>
                      {title}
                    </span>
                    <span className={cn("text-[10px] mt-0.5 truncate", isSelected ? "text-black/60" : "text-white/40")}>
                      {desc}
                    </span>
                  </div>
                  {isSelected && <Check size={14} className="text-black shrink-0 ml-2" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HeroSearch({ zones }: HeroSearchProps) {
  const router = useRouter();
  const { locale, dict } = useLocale();
  
  const [operation, setOperation] = useState<"venta" | "alquiler">("venta");
  const [type, setType] = useState<string>("");
  const [zone, setZone] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  
  // Advanced filters state
  const [priceMin, setPriceMin] = useState<string>("");
  const [areaMin, setAreaMin] = useState<string>("");
  const [areaMax, setAreaMax] = useState<string>("");
  const [bedrooms, setBedrooms] = useState<number | undefined>(undefined);
  const [bathrooms, setBathrooms] = useState<number | undefined>(undefined);

  // Premium Amenities
  const [parking, setParking] = useState(false);
  const [pool, setPool] = useState(false);
  const [security, setSecurity] = useState(false);
  const [generator, setGenerator] = useState(false);
  const [waterTank, setWaterTank] = useState(false);
  
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const defaultSectors = [
    { slug: "el-arenal", name_es: "El Arenal", name_en: "El Arenal" },
    { slug: "la-pedregosa", name_es: "La Pedregosa", name_en: "La Pedregosa" },
    { slug: "los-chorros", name_es: "Los Chorros", name_en: "Los Chorros" },
    { slug: "mucuchies", name_es: "Mucuchíes", name_en: "Mucuchíes" },
    { slug: "el-vigia", name_es: "El Vigía", name_en: "El Vigía" },
    { slug: "centro-historico", name_es: "Centro Histórico", name_en: "Historical Center" },
    { slug: "ejido", name_es: "Ejido", name_en: "Ejido" },
  ];

  const activeZones = zones && zones.length > 0 ? zones : defaultSectors;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setActiveDropdown(null);

    setTimeout(() => {
      setIsSearching(false);
      const params = new URLSearchParams();
      params.set("operacion", operation);
      if (type) params.set("tipo", type);
      if (zone && zone !== "all") params.set("zona", zone);
      if (priceMax) {
        if (priceMax === "500000_plus") {
          params.set("precio_min", "500000");
        } else {
          params.set("precio_max", priceMax);
        }
      }
      
      // Advanced params redirection
      if (priceMin) params.set("precio_min", priceMin);
      if (areaMin) params.set("area_min", areaMin);
      if (areaMax) params.set("area_max", areaMax);
      if (bedrooms !== undefined) params.set("habitaciones", bedrooms.toString());
      if (bathrooms !== undefined) params.set("banos", bathrooms.toString());

      // Amenities redirection
      if (parking) params.set("estacionamiento", "true");
      if (pool) params.set("piscina", "true");
      if (security) params.set("seguridad", "true");
      if (generator) params.set("planta_electrica", "true");
      if (waterTank) params.set("tanque_agua", "true");

      router.push(`/${locale}/propiedades?${params.toString()}`);
    }, 400);
  };

  const getTypes = (): DropdownOption[] => {
    return [
      { value: "", label_es: "Todos los tipos", label_en: "All types", desc_es: "Mostrar todas las categorías", desc_en: "Show all property categories" },
      { value: "casa", label_es: "Casa", label_en: "House", desc_es: "Quintas, villas y residencias familiares", desc_en: "Estates, villas, and family homes" },
      { value: "apartamento", label_es: "Apartamento", label_en: "Apartment", desc_es: "Apartamentos y penthouses urbanos", desc_en: "Condos, flats, and urban penthouses" },
      { value: "townhouse", label_es: "Townhouse", label_en: "Townhouse", desc_es: "Complejos pareados con jardines", desc_en: "Row houses and duplexes with lawns" },
      { value: "local", label_es: "Local Comercial", label_en: "Commercial Space", desc_es: "Locales y tiendas estratégicas", desc_en: "Strategic shops and commercial spaces" },
      { value: "terreno", label_es: "Terreno", label_en: "Land", desc_es: "Lotes listos para edificar", desc_en: "Plots of land ready to construct" },
      { value: "oficina", label_es: "Oficina", label_en: "Office", desc_es: "Oficinas y consultorios ejecutivos", desc_en: "Executive suites and workspaces" },
    ];
  };

  const getZonesOptions = (): DropdownOption[] => {
    const list: DropdownOption[] = [
      { value: "", label_es: "Todas las zonas", label_en: "All zones", desc_es: "Cualquier sector en Mérida", desc_en: "Any neighborhood in Merida" }
    ];
    activeZones.forEach((z: any) => {
      const desc_es = z.description_es || "Hermoso sector en los Andes";
      const desc_en = z.description_en || "Scenic neighborhood in the Andes";
      list.push({
        value: z.slug,
        label_es: z.name_es,
        label_en: z.name_en,
        desc_es: desc_es,
        desc_en: desc_en,
      });
    });
    return list;
  };

  const getPrices = (): DropdownOption[] => {
    return [
      { value: "", label_es: "Sin límite", label_en: "No limit", desc_es: "Ver todas las ofertas disponibles", desc_en: "View all active budgets" },
      { value: "50000", label_es: "Hasta $50.000", label_en: "Up to $50,000", desc_es: "Lotes de tierra y gama inicial", desc_en: "Land plots and starting portfolio" },
      { value: "100000", label_es: "Hasta $100.000", label_en: "Up to $100,000", desc_es: "Apartamentos y quintas residenciales", desc_en: "Apartments and standard houses" },
      { value: "200000", label_es: "Hasta $200.000", label_en: "Up to $200,000", desc_es: "Propiedades premium y townhouses", desc_en: "Premium townhouses and properties" },
      { value: "500000", label_es: "Hasta $500.000", label_en: "Up to $500,000", desc_es: "Haciendas exclusivas y grandes locales", desc_en: "Exclusive estates and prime offices" },
      { value: "500000_plus", label_es: "Más de $500.000", label_en: "Over $500,000", desc_es: "Propiedades de altísima gama", desc_en: "Ultra high-end properties" },
    ];
  };

  return (
    <div className="w-full max-w-5xl flex flex-col gap-5 relative">
      {/* 1. Operation Tabs with Framer Motion Sliding Indicator */}
      <div className="flex gap-1.5 self-start bg-black/40 backdrop-blur-md p-1 border border-white/5 rounded-sm relative">
        <button
          type="button"
          onClick={() => setOperation("venta")}
          className={cn(
            "relative z-10 px-6 py-2.5 rounded-sm text-[11px] uppercase tracking-wider font-semibold font-display transition-colors duration-300 cursor-pointer",
            operation === "venta" ? "text-black" : "text-white/60 hover:text-white"
          )}
        >
          {operation === "venta" && (
            <motion.div
              layoutId="searchActiveTab"
              className="absolute inset-0 bg-[var(--color-gold)] rounded-sm -z-10"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          {locale === "es" ? "Comprar" : "Buy"}
        </button>
        <button
          type="button"
          onClick={() => setOperation("alquiler")}
          className={cn(
            "relative z-10 px-6 py-2.5 rounded-sm text-[11px] uppercase tracking-wider font-semibold font-display transition-colors duration-300 cursor-pointer",
            operation === "alquiler" ? "text-black" : "text-white/60 hover:text-white"
          )}
        >
          {operation === "alquiler" && (
            <motion.div
              layoutId="searchActiveTab"
              className="absolute inset-0 bg-[var(--color-gold)] rounded-sm -z-10"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          {locale === "es" ? "Alquilar" : "Rent"}
        </button>
      </div>

      <motion.form
        onSubmit={handleSearch}
        animate={{ scale: isSearching ? 0.99 : 1 }}
        transition={{ duration: 0.15 }}
        className={cn(
          "w-full flex flex-col gap-6 p-6 sm:p-8 border rounded-sm bg-[#161412]/95 backdrop-blur-2xl transition-all duration-500 relative",
          activeDropdown 
            ? "border-[var(--color-gold)]/50 shadow-[0_32px_64px_rgba(0,0,0,0.85),_0_0_30px_rgba(201,150,42,0.15)]" 
            : "border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.7)]"
        )}
      >
        {/* ROW 1: Selections (Habitaciones, Baños, Superficie, Precio Min) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5 items-end w-full">
          {/* Min Price Select */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-[9px] uppercase tracking-widest font-semibold text-white/45">
              {locale === "es" ? "Precio mínimo" : "Min Price"}
            </span>
            <select
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="h-11 px-3 text-xs bg-white/[0.02] border border-white/10 text-white rounded-sm focus:border-[var(--color-gold)] focus:outline-hidden cursor-pointer w-full transition-all duration-200"
            >
              <option value="" className="bg-[#161412]">{locale === "es" ? "Cualquiera" : "Any"}</option>
              <option value="10000" className="bg-[#161412]">$10,000</option>
              <option value="20000" className="bg-[#161412]">$20,000</option>
              <option value="30000" className="bg-[#161412]">$30,000</option>
              <option value="50000" className="bg-[#161412]">$50,000</option>
              <option value="80000" className="bg-[#161412]">$80,000</option>
              <option value="100000" className="bg-[#161412]">$100,000</option>
              <option value="150000" className="bg-[#161412]">$150,000</option>
              <option value="200000" className="bg-[#161412]">$200,000</option>
              <option value="300000" className="bg-[#161412]">$300,000</option>
            </select>
          </div>

          {/* Area Min Input */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-[9px] uppercase tracking-widest font-semibold text-white/45">
              {locale === "es" ? "Superficie Mín (m²)" : "Min Area (m²)"}
            </span>
            <input
              type="number"
              placeholder="Min"
              value={areaMin}
              onChange={(e) => setAreaMin(e.target.value)}
              className="h-11 px-3 text-xs bg-white/[0.02] border border-white/10 text-white rounded-sm focus:border-[var(--color-gold)] focus:outline-hidden w-full transition-all duration-200 placeholder:text-white/20"
            />
          </div>

          {/* Area Max Input */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-[9px] uppercase tracking-widest font-semibold text-white/45">
              {locale === "es" ? "Superficie Máx (m²)" : "Max Area (m²)"}
            </span>
            <input
              type="number"
              placeholder="Max"
              value={areaMax}
              onChange={(e) => setAreaMax(e.target.value)}
              className="h-11 px-3 text-xs bg-white/[0.02] border border-white/10 text-white rounded-sm focus:border-[var(--color-gold)] focus:outline-hidden w-full transition-all duration-200 placeholder:text-white/20"
            />
          </div>

          {/* Bedrooms button group */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-[9px] uppercase tracking-widest font-semibold text-white/45">
              {locale === "es" ? "Habitaciones" : "Bedrooms"}
            </span>
            <div className="grid grid-cols-5 gap-1 w-full">
              <button
                type="button"
                onClick={() => setBedrooms(undefined)}
                className={cn(
                  "h-11 text-xs font-mono border rounded-sm transition-all cursor-pointer",
                  bedrooms === undefined
                    ? "bg-[var(--color-gold)] text-black font-semibold border-[var(--color-gold)]"
                    : "bg-transparent text-white/60 border-white/10 hover:border-white/20"
                )}
              >
                -
              </button>
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setBedrooms(num)}
                  className={cn(
                    "h-11 text-xs font-mono border rounded-sm transition-all cursor-pointer",
                    bedrooms === num
                      ? "bg-[var(--color-gold)] text-black font-semibold border-[var(--color-gold)]"
                      : "bg-transparent text-white/60 border-white/10 hover:border-white/20"
                  )}
                >
                  {num === 4 ? "4+" : num}
                </button>
              ))}
            </div>
          </div>

          {/* Bathrooms button group */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-[9px] uppercase tracking-widest font-semibold text-white/45">
              {locale === "es" ? "Baños" : "Bathrooms"}
            </span>
            <div className="grid grid-cols-5 gap-1 w-full">
              <button
                type="button"
                onClick={() => setBathrooms(undefined)}
                className={cn(
                  "h-11 text-xs font-mono border rounded-sm transition-all cursor-pointer",
                  bathrooms === undefined
                    ? "bg-[var(--color-gold)] text-black font-semibold border-[var(--color-gold)]"
                    : "bg-transparent text-white/60 border-white/10 hover:border-white/20"
                )}
              >
                -
              </button>
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setBathrooms(num)}
                  className={cn(
                    "h-11 text-xs font-mono border rounded-sm transition-all cursor-pointer",
                    bathrooms === num
                      ? "bg-[var(--color-gold)] text-black font-semibold border-[var(--color-gold)]"
                      : "bg-transparent text-white/60 border-white/10 hover:border-white/20"
                  )}
                >
                  {num === 4 ? "4+" : num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AMENITIES ROW: Premium luxuries tailored for high-end search */}
        <div className="border-t border-white/5 pt-5 pb-1 w-full">
          <div className="text-[10px] uppercase tracking-widest font-semibold text-white/45 mb-3 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-[var(--color-gold)] shrink-0 animate-pulse" />
            {locale === "es" ? "Características y equipamiento" : "Premium amenities & features"}
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setParking(!parking)}
              className={cn(
                "px-4 py-2 rounded-sm text-xs font-medium transition-all duration-200 border cursor-pointer flex items-center gap-2",
                parking
                  ? "bg-[var(--color-gold)] text-black border-[var(--color-gold)] font-semibold shadow-[0_0_8px_rgba(201,150,42,0.15)]"
                  : "bg-white/2 text-white/60 border-white/10 hover:text-white hover:border-white/20"
              )}
            >
              <Car className="h-3.5 w-3.5 shrink-0" />
              {locale === "es" ? "Estacionamiento" : "Parking"}
            </button>
            <button
              type="button"
              onClick={() => setPool(!pool)}
              className={cn(
                "px-4 py-2 rounded-sm text-xs font-medium transition-all duration-200 border cursor-pointer flex items-center gap-2",
                pool
                  ? "bg-[var(--color-gold)] text-black border-[var(--color-gold)] font-semibold shadow-[0_0_8px_rgba(201,150,42,0.15)]"
                  : "bg-white/2 text-white/60 border-white/10 hover:text-white hover:border-white/20"
              )}
            >
              <Droplet className="h-3.5 w-3.5 shrink-0" />
              {locale === "es" ? "Piscina" : "Pool"}
            </button>
            <button
              type="button"
              onClick={() => setSecurity(!security)}
              className={cn(
                "px-4 py-2 rounded-sm text-xs font-medium transition-all duration-200 border cursor-pointer flex items-center gap-2",
                security
                  ? "bg-[var(--color-gold)] text-black border-[var(--color-gold)] font-semibold shadow-[0_0_8px_rgba(201,150,42,0.15)]"
                  : "bg-white/2 text-white/60 border-white/10 hover:text-white hover:border-white/20"
              )}
            >
              <Shield className="h-3.5 w-3.5 shrink-0" />
              {locale === "es" ? "Vigilancia / Seguridad" : "Security"}
            </button>
            <button
              type="button"
              onClick={() => setGenerator(!generator)}
              className={cn(
                "px-4 py-2 rounded-sm text-xs font-medium transition-all duration-200 border cursor-pointer flex items-center gap-2",
                generator
                  ? "bg-[var(--color-gold)] text-black border-[var(--color-gold)] font-semibold shadow-[0_0_8px_rgba(201,150,42,0.15)]"
                  : "bg-white/2 text-white/60 border-white/10 hover:text-white hover:border-white/20"
              )}
            >
              <Zap className="h-3.5 w-3.5 shrink-0" />
              {locale === "es" ? "Planta Eléctrica" : "Generator"}
            </button>
            <button
              type="button"
              onClick={() => setWaterTank(!waterTank)}
              className={cn(
                "px-4 py-2 rounded-sm text-xs font-medium transition-all duration-200 border cursor-pointer flex items-center gap-2",
                waterTank
                  ? "bg-[var(--color-gold)] text-black border-[var(--color-gold)] font-semibold shadow-[0_0_8px_rgba(201,150,42,0.15)]"
                  : "bg-white/2 text-white/60 border-white/10 hover:text-white hover:border-white/20"
              )}
            >
              <Droplet className="h-3.5 w-3.5 shrink-0" />
              {locale === "es" ? "Tanque / Pozo de Agua" : "Water Tank"}
            </button>
          </div>
        </div>

        {/* ROW 2: Custom Dropdowns and Buscar button */}
        <div className="border-t border-white/5 pt-5 grid grid-cols-1 md:grid-cols-4 gap-5 items-end w-full">
          <CustomDropdown
            label={locale === "es" ? "Tipo de Propiedad" : "Property Type"}
            value={type}
            placeholder={locale === "es" ? "Todos los tipos" : "All types"}
            options={getTypes()}
            onChange={setType}
            icon={<Building2 className="h-5 w-5" />}
            isOpen={activeDropdown === "type"}
            onToggle={(open) => setActiveDropdown(open ? "type" : null)}
          />

          <CustomDropdown
            label={locale === "es" ? "Zona / Sector" : "Zone / Neighborhood"}
            value={zone}
            placeholder={locale === "es" ? "Todas las zonas" : "All zones"}
            options={getZonesOptions()}
            onChange={setZone}
            icon={<MapPin className="h-5 w-5" />}
            isOpen={activeDropdown === "zone"}
            onToggle={(open) => setActiveDropdown(open ? "zone" : null)}
          />

          <CustomDropdown
            label={locale === "es" ? "Precio Máximo" : "Max Price"}
            value={priceMax}
            placeholder={locale === "es" ? "Sin límite" : "No limit"}
            options={getPrices()}
            onChange={setPriceMax}
            icon={<DollarSign className="h-5 w-5" />}
            isOpen={activeDropdown === "priceMax"}
            onToggle={(open) => setActiveDropdown(open ? "priceMax" : null)}
          />

          {/* Submit Search Button */}
          <div className="w-full">
            <button
              type="submit"
              disabled={isSearching}
              className="relative overflow-hidden h-16 w-full bg-[var(--color-gold)] text-black rounded-sm font-semibold tracking-wider uppercase text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md border-0 active:scale-95 group hover:bg-[var(--color-gold-hover)]"
              style={{
                fontFamily: "var(--font-display)",
              }}
            >
              {/* Slide Shimmer beam */}
              <span className="absolute inset-0 w-1/2 h-full bg-white/20 transform -skew-x-12 -translate-x-full transition-transform duration-1000 ease-out group-hover:translate-x-[250%]" />
              
              <Search className={cn("h-5 w-5 shrink-0 transition-transform duration-300", isSearching ? "animate-spin" : "group-hover:scale-110")} />
              <span>
                {isSearching 
                  ? "..." 
                  : (dict.hero?.searchBtn || (locale === "es" ? "Buscar Propiedades" : "Search Properties"))}
              </span>
            </button>
          </div>
        </div>
      </motion.form>

      {/* 3. Recommended Suggestion Tags (UX Polish) */}
      <div className="flex flex-wrap items-center gap-2 mt-1 px-1">
        <span className="text-[10px] text-white/40 uppercase font-semibold font-display tracking-wider">
          {locale === "es" ? "Zonas populares:" : "Popular areas:"}
        </span>
        {activeZones.slice(0, 3).map((z) => (
          <button
            key={z.slug}
            type="button"
            onClick={() => setZone(z.slug)}
            className={cn(
              "px-2.5 py-0.5 rounded-sm text-[10px] font-medium transition-all duration-200 border cursor-pointer",
              zone === z.slug
                ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)] border-[var(--color-gold)]"
                : "bg-white/2 text-white/50 border-white/5 hover:text-white hover:border-white/20 hover:bg-white/5"
            )}
          >
            {locale === "es" ? z.name_es : z.name_en}
          </button>
        ))}
      </div>
    </div>
  );
}
