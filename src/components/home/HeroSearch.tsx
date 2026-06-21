"use client";

import { useReducer, useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/components/layout/LocaleProvider";
import { 
  Search, 
  Home, 
  Building2, 
  Layers, 
  Store, 
  TreePine, 
  Settings2, 
  X, 
  ChevronDown, 
  Loader2, 
  Check, 
  Car, 
  Waves, 
  Shield, 
  Zap, 
  Droplets, 
  Trees, 
  Wind, 
  ArrowUpDown 
} from "lucide-react";

type TipoPropiedad = 'todos' | 'casa' | 'apartamento' | 'townhouse' | 'local-comercial' | 'terreno';
type ModoOperacion = 'compra' | 'alquiler';

interface SearchState {
  modo: ModoOperacion;
  tipo: TipoPropiedad;
  zona: string | null;
  precioMin: number | null;
  precioMax: number | null;
  habitaciones: number | '4+';
  banos: number | '4+';
  areaMin: number | null;
  areaMax: number | null;
  caracteristicas: string[];
}

type Action =
  | { type: 'SET_MODO'; payload: ModoOperacion }
  | { type: 'SET_TIPO'; payload: TipoPropiedad }
  | { type: 'SET_ZONA'; payload: string | null }
  | { type: 'SET_PRECIO_MIN'; payload: number | null }
  | { type: 'SET_PRECIO_MAX'; payload: number | null }
  | { type: 'SET_HABITACIONES'; payload: number | '4+' }
  | { type: 'SET_BANOS'; payload: number | '4+' }
  | { type: 'SET_AREA_MIN'; payload: number | null }
  | { type: 'SET_AREA_MAX'; payload: number | null }
  | { type: 'TOGGLE_CARACTERISTICA'; payload: string }
  | { type: 'RESET' };

const initialState: SearchState = {
  modo: 'compra',
  tipo: 'todos',
  zona: null,
  precioMin: null,
  precioMax: null,
  habitaciones: 1,
  banos: 1,
  areaMin: null,
  areaMax: null,
  caracteristicas: [],
};

function searchReducer(state: SearchState, action: Action): SearchState {
  switch (action.type) {
    case 'SET_MODO':
      return { ...state, modo: action.payload };
    case 'SET_TIPO':
      return { ...state, tipo: action.payload };
    case 'SET_ZONA':
      return { ...state, zona: action.payload };
    case 'SET_PRECIO_MIN':
      return { ...state, precioMin: action.payload };
    case 'SET_PRECIO_MAX':
      return { ...state, precioMax: action.payload };
    case 'SET_HABITACIONES':
      return { ...state, habitaciones: action.payload };
    case 'SET_BANOS':
      return { ...state, banos: action.payload };
    case 'SET_AREA_MIN':
      return { ...state, areaMin: action.payload };
    case 'SET_AREA_MAX':
      return { ...state, areaMax: action.payload };
    case 'TOGGLE_CARACTERISTICA':
      const exists = state.caracteristicas.includes(action.payload);
      return {
        ...state,
        caracteristicas: exists
          ? state.caracteristicas.filter((c) => c !== action.payload)
          : [...state.caracteristicas, action.payload],
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const SECTORES = [
  "El Encanto",
  "La Floresta",
  "La Pedregosa",
  "Los Chorros",
  "Loma de Los Pájaros",
  "El Vallecito",
  "Pueblo Nuevo",
  "Ejido",
  "Tabay",
  "Mucuchíes",
  "El Vigía",
  "Mérida Centro"
];

const PRECIOS_PREDEFINIDOS = [50000, 100000, 200000, 500000];

export function HeroSearch({ zones }: { zones?: any[] } = {}) {
  const router = useRouter();
  const { locale, dict } = useLocale();
  const [state, dispatch] = useReducer(searchReducer, initialState);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'tipo' | 'zona' | 'precioMax' | 'precioMin' | 'precioMaxExp' | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [zoneSearch, setZoneSearch] = useState("");
  const [_, startTransition] = useTransition();

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRefContains(event.target as Node)) {
        return;
      }
      setActiveDropdown(null);
    }
    
    function dropdownRefContains(target: Node) {
      return containerRef.current && containerRef.current.contains(target);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setActiveDropdown(null);
    setIsExpanded(false);

    setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams();
        params.set("operacion", state.modo === "compra" ? "venta" : "alquiler");
        
        if (state.tipo && state.tipo !== "todos") {
          params.set("tipo", state.tipo);
        }
        
        if (state.zona) {
          const zoneSlug = state.zona.toLowerCase().replace(/ /g, "-").replace(/[áéíóú]/g, (c) => {
            const map: Record<string, string> = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u' };
            return map[c] || c;
          });
          params.set("zona", zoneSlug);
        }
        
        if (state.precioMax) params.set("precio_max", state.precioMax.toString());
        if (state.precioMin) params.set("precio_min", state.precioMin.toString());
        
        if (state.habitaciones) {
          const val = state.habitaciones === "4+" ? 4 : state.habitaciones;
          params.set("habitaciones", val.toString());
        }
        if (state.banos) {
          const val = state.banos === "4+" ? 4 : state.banos;
          params.set("banos", val.toString());
        }
        
        if (state.areaMin) params.set("area_min", state.areaMin.toString());
        if (state.areaMax) params.set("area_max", state.areaMax.toString());
        
        if (state.caracteristicas.length > 0) {
          params.set("caracteristicas", state.caracteristicas.join(","));
        }

        router.push(`/${locale}/propiedades?${params.toString()}`);
        setIsSearching(false);
      });
    }, 500);
  };

  const getTipoLabel = (tipo: TipoPropiedad) => {
    const labels: Record<TipoPropiedad, string> = {
      todos: locale === "es" ? "Todos los tipos" : "All types",
      casa: locale === "es" ? "Casa" : "House",
      apartamento: locale === "es" ? "Apartamento" : "Apartment",
      townhouse: locale === "es" ? "Townhouse" : "Townhouse",
      'local-comercial': locale === "es" ? "Local Comercial" : "Commercial Space",
      terreno: locale === "es" ? "Terreno" : "Land",
    };
    return labels[tipo];
  };

  const filteredSectores = SECTORES.filter((s) =>
    s.toLowerCase().includes(zoneSearch.toLowerCase())
  );

  const incrementStepper = (type: 'habitaciones' | 'banos') => {
    const current = state[type];
    if (current === '4+') return;
    if (current === 3) {
      dispatch({ type: type === 'habitaciones' ? 'SET_HABITACIONES' : 'SET_BANOS', payload: '4+' });
    } else {
      dispatch({ type: type === 'habitaciones' ? 'SET_HABITACIONES' : 'SET_BANOS', payload: (current as number) + 1 });
    }
  };

  const decrementStepper = (type: 'habitaciones' | 'banos') => {
    const current = state[type];
    if (current === '4+') {
      dispatch({ type: type === 'habitaciones' ? 'SET_HABITACIONES' : 'SET_BANOS', payload: 3 });
    } else if (current > 0) {
      dispatch({ type: type === 'habitaciones' ? 'SET_HABITACIONES' : 'SET_BANOS', payload: (current as number) - 1 });
    }
  };

  const handleFieldClick = (dropdownType: 'tipo' | 'zona' | 'precioMax' | 'precioMin' | 'precioMaxExp') => {
    setIsExpanded(true);
    setActiveDropdown(activeDropdown === dropdownType ? null : dropdownType);
  };

  return (
    <div ref={containerRef} className="w-full max-w-5xl relative z-20 select-none flex flex-col gap-0">
      <form 
        onSubmit={handleSearchSubmit} 
        className="w-full flex flex-col gap-0"
        style={{
          opacity: isSearching ? 0.5 : 1,
          pointerEvents: isSearching ? 'none' : 'auto',
        }}
      >
        
        {/* 1. TABS (COMPRAR / ALQUILAR) */}
        <div className="flex gap-2 self-start bg-black/45 backdrop-blur-md p-1 border border-white/10 rounded-lg relative z-20 mb-2">
          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_MODO', payload: 'compra' })}
            className="relative px-6 py-2.5 rounded-md text-xs uppercase tracking-wider font-semibold font-display transition-colors duration-300 cursor-pointer"
            style={{
              color: state.modo === 'compra' ? '#000000' : 'rgba(255,255,255,0.7)',
            }}
          >
            {state.modo === 'compra' && (
              <motion.div
                layoutId="tab-indicator"
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                className="absolute inset-0 rounded-md bg-[#C9A84C] -z-10"
              />
            )}
            <span className="relative z-10">{locale === "es" ? "COMPRAR" : "BUY"}</span>
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_MODO', payload: 'alquiler' })}
            className="relative px-6 py-2.5 rounded-md text-xs uppercase tracking-wider font-semibold font-display transition-colors duration-300 cursor-pointer"
            style={{
              color: state.modo === 'alquiler' ? '#000000' : 'rgba(255,255,255,0.7)',
            }}
          >
            {state.modo === 'alquiler' && (
              <motion.div
                layoutId="tab-indicator"
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                className="absolute inset-0 rounded-md bg-[#C9A84C] -z-10"
              />
            )}
            <span className="relative z-10">{locale === "es" ? "ALQUILAR" : "RENT"}</span>
          </button>
        </div>

        {/* 2. BARRA COMPACTA */}
        <div 
          className="grid grid-cols-1 md:grid-cols-[1.1fr_1.1fr_0.9fr_auto] gap-0 items-center overflow-visible w-full"
          style={{
            background: 'rgba(15, 13, 11, 0.72)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(201, 168, 76, 0.18)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset',
          }}
        >
          {/* Campo 1: Tipo de propiedad */}
          <div className="relative w-full h-full border-b md:border-b-0 md:border-r border-white/10">
            <button
              type="button"
              onClick={() => handleFieldClick('tipo')}
              aria-expanded={activeDropdown === 'tipo'}
              aria-haspopup="listbox"
              className="w-full h-20 px-6 flex flex-col justify-center text-left hover:bg-white/[0.04] transition-colors duration-180 cursor-pointer rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
              style={{
                background: activeDropdown === 'tipo' ? 'rgba(201,168,76,0.08)' : 'transparent',
                borderBottom: activeDropdown === 'tipo' ? '2px solid #C9A84C' : 'none',
              }}
            >
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[#C9A84C] mb-1">
                {locale === "es" ? "TIPO DE PROPIEDAD" : "PROPERTY TYPE"}
              </span>
              <span className="text-sm font-medium text-white/90 truncate">
                {getTipoLabel(state.tipo)}
              </span>
            </button>

            {/* Dropdown Tipo de propiedad */}
            <AnimatePresence>
              {activeDropdown === 'tipo' && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute p-2 overflow-y-auto max-h-72"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    zIndex: 50,
                    minWidth: '280px',
                    background: 'rgba(18, 16, 13, 0.96)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(201, 168, 76, 0.15)',
                    borderRadius: '12px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset',
                  }}
                  role="listbox"
                >
                  {([
                    { value: 'todos', label_es: 'Todos los tipos', label_en: 'All types', desc_es: 'Buscar sin restricción', desc_en: 'Search without limits', icon: Layers },
                    { value: 'casa', label_es: '🏠 Casa', label_en: '🏠 House', desc_es: 'Quintas, villas y residencias familiares', desc_en: 'Estates, villas, and family homes', icon: Home },
                    { value: 'apartamento', label_es: '🏢 Apartamento', label_en: '🏢 Apartment', desc_es: 'Apartamentos y penthouses urbanos', desc_en: 'Condos, flats, and urban penthouses', icon: Building2 },
                    { value: 'townhouse', label_es: '🏘️ Townhouse', label_en: '🏘️ Townhouse', desc_es: 'Complejos pareados con jardines', desc_en: 'Row houses and duplexes with lawns', icon: Layers },
                    { value: 'local-comercial', label_es: '🏪 Local Comercial', label_en: '🏪 Commercial', desc_es: 'Locales y oficinas comerciales', desc_en: 'Strategic shops and office spaces', icon: Store },
                    { value: 'terreno', label_es: '🌿 Terreno', label_en: '🌿 Land', desc_es: 'Lotes y parcelas en Mérida', desc_en: 'Plots of land ready to construct', icon: TreePine }
                  ] as const).map((opt) => {
                    const isSelected = state.tipo === opt.value;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          dispatch({ type: 'SET_TIPO', payload: opt.value });
                          setActiveDropdown(null);
                        }}
                        role="option"
                        aria-selected={isSelected}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-left transition-colors duration-120 hover:bg-[rgba(201,168,76,0.08)] cursor-pointer mb-0.5 last:mb-0"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-[#C9A84C]/80" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white/95" style={{ color: isSelected ? '#C9A84C' : undefined }}>
                              {locale === "es" ? opt.label_es : opt.label_en}
                            </span>
                            <span className="text-xs text-white/40">
                              {locale === "es" ? opt.desc_es : opt.desc_en}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-[#C9A84C]" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Campo 2: Zona / Sector */}
          <div className="relative w-full h-full border-b md:border-b-0 md:border-r border-white/10">
            <button
              type="button"
              onClick={() => handleFieldClick('zona')}
              aria-expanded={activeDropdown === 'zona'}
              aria-haspopup="listbox"
              className="w-full h-20 px-6 flex flex-col justify-center text-left hover:bg-white/[0.04] transition-colors duration-180 cursor-pointer"
              style={{
                background: activeDropdown === 'zona' ? 'rgba(201,168,76,0.08)' : 'transparent',
                borderBottom: activeDropdown === 'zona' ? '2px solid #C9A84C' : 'none',
              }}
            >
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[#C9A84C] mb-1">
                {locale === "es" ? "ZONA / SECTOR" : "ZONE / NEIGHBORHOOD"}
              </span>
              <div className="flex items-center justify-between w-full">
                {state.zona ? (
                  <span className="inline-flex items-center gap-1 bg-[#C9A84C]/15 border border-[#C9A84C]/30 text-[#C9A84C] text-xs font-semibold px-2 py-0.5 rounded-sm">
                    {state.zona}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-white" 
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: 'SET_ZONA', payload: null });
                      }}
                    />
                  </span>
                ) : (
                  <span className="text-sm font-medium text-white/90">
                    {locale === "es" ? "Todas las zonas" : "All zones"}
                  </span>
                )}
              </div>
            </button>

            {/* Dropdown Zona / Sector */}
            <AnimatePresence>
              {activeDropdown === 'zona' && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="p-3 flex flex-col gap-2"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    zIndex: 50,
                    minWidth: '280px',
                    background: 'rgba(18, 16, 13, 0.96)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(201, 168, 76, 0.15)',
                    borderRadius: '12px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset',
                  }}
                >
                  <div className="relative flex items-center">
                    <Search className="absolute left-3 h-3.5 w-3.5 text-white/40" />
                    <input
                      type="text"
                      placeholder={locale === "es" ? "Buscar zona..." : "Search zone..."}
                      value={zoneSearch}
                      onChange={(e) => setZoneSearch(e.target.value)}
                      className="w-full h-9 pl-9 pr-4 text-xs text-white bg-white/[0.05] border border-white/10 rounded-lg focus:outline-hidden focus:border-[#C9A84C]/50"
                    />
                  </div>

                  <div className="max-h-52 overflow-y-auto flex flex-col pr-1">
                    <button
                      type="button"
                      onClick={() => {
                        dispatch({ type: 'SET_ZONA', payload: null });
                        setActiveDropdown(null);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs font-semibold text-white/70 hover:bg-white/[0.04] transition-colors"
                    >
                      <span>{locale === "es" ? "Todas las zonas" : "All zones"}</span>
                      {!state.zona && <Check className="h-3.5 w-3.5 text-[#C9A84C]" />}
                    </button>
                    
                    {filteredSectores.map((sec) => {
                      const isSelected = state.zona === sec;
                      return (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => {
                            dispatch({ type: 'SET_ZONA', payload: sec });
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs text-white/80 hover:bg-[rgba(201,168,76,0.08)] transition-colors duration-120"
                        >
                          <span style={{ color: isSelected ? '#C9A84C' : undefined, fontWeight: isSelected ? 600 : undefined }}>
                            {sec}
                          </span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-[#C9A84C]" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Campo 3: Precio Máx */}
          <div className="relative w-full h-full">
            <button
              type="button"
              onClick={() => handleFieldClick('precioMax')}
              aria-expanded={activeDropdown === 'precioMax'}
              aria-haspopup="listbox"
              className="w-full h-20 px-6 flex flex-col justify-center text-left hover:bg-white/[0.04] transition-colors duration-180 cursor-pointer"
              style={{
                background: activeDropdown === 'precioMax' ? 'rgba(201,168,76,0.08)' : 'transparent',
                borderBottom: activeDropdown === 'precioMax' ? '2px solid #C9A84C' : 'none',
              }}
            >
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[#C9A84C] mb-1">
                {locale === "es" ? "PRECIO MÁXIMO" : "MAX PRICE"}
              </span>
              <span className="text-sm font-medium text-white/90 truncate">
                {state.precioMax ? `$${state.precioMax.toLocaleString()}` : (locale === "es" ? "Sin límite" : "No limit")}
              </span>
            </button>

            {/* Dropdown Precio Máx */}
            <AnimatePresence>
              {activeDropdown === 'precioMax' && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="p-4 flex flex-col gap-3"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    zIndex: 50,
                    minWidth: '280px',
                    background: 'rgba(18, 16, 13, 0.96)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(201, 168, 76, 0.15)',
                    borderRadius: '12px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset',
                  }}
                >
                  <div className="text-[10px] uppercase tracking-widest font-semibold text-white/45 mb-1">
                    {locale === "es" ? "Selección rápida" : "Quick Selection"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PRECIOS_PREDEFINIDOS.map((price) => {
                      const isSelected = state.precioMax === price;
                      return (
                        <button
                          key={price}
                          type="button"
                          onClick={() => {
                            dispatch({ type: 'SET_PRECIO_MAX', payload: price });
                            setActiveDropdown(null);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                          style={{
                            borderColor: isSelected ? '#C9A84C' : 'rgba(255,255,255,0.15)',
                            background: isSelected ? 'rgba(201,168,76,0.12)' : 'transparent',
                            color: isSelected ? '#C9A84C' : 'rgba(255,255,255,0.8)',
                          }}
                        >
                          ${(price / 1000)}K
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        dispatch({ type: 'SET_PRECIO_MAX', payload: null });
                        setActiveDropdown(null);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                      style={{
                        borderColor: state.precioMax === null ? '#C9A84C' : 'rgba(255,255,255,0.15)',
                        background: state.precioMax === null ? 'rgba(201,168,76,0.12)' : 'transparent',
                        color: state.precioMax === null ? '#C9A84C' : 'rgba(255,255,255,0.8)',
                      }}
                    >
                      {locale === "es" ? "Sin límite" : "No limit"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Botón Buscar */}
          <div className="p-3 w-full h-full flex items-center justify-center min-w-[180px]">
            <button
              type="submit"
              disabled={isSearching}
              className="relative overflow-hidden h-14 w-full text-black font-bold uppercase text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md rounded-xl active:scale-95 group"
              style={{
                background: '#C9A84C',
                fontFamily: "var(--font-display)",
              }}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin text-black" />
              ) : (
                <Search className="h-4 w-4 text-black transition-transform duration-300 group-hover:scale-110" />
              )}
              <span>
                {isSearching 
                  ? "..." 
                  : (dict.hero?.searchBtn || (locale === "es" ? "Buscar" : "Search"))}
              </span>
            </button>
          </div>
        </div>

        {/* 3. FILA DEL TRIGGER "FILTROS AVANZADOS" */}
        <div className="flex justify-between items-center mt-3 px-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-xs font-medium text-white/50 hover:text-white cursor-pointer bg-transparent border-0 outline-hidden"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <Settings2 className="h-3.5 w-3.5 text-[#C9A84C]" />
            </motion.div>
            <span>{locale === "es" ? "⚙ Filtros avanzados" : "⚙ Advanced filters"}</span>
          </button>
        </div>

        {/* 4. PANEL EXPANDIDO */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
              className="w-full overflow-hidden mt-3 relative z-25"
              aria-hidden={!isExpanded}
            >
              <div 
                className="w-full flex flex-col gap-6 p-6 sm:p-8"
                style={{
                  background: 'rgba(15, 13, 11, 0.94)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(201, 168, 76, 0.18)',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                }}
              >
                {/* FILA 1: Precio y Superficie */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                  
                  {/* Precio Min dropdown */}
                  <div className="flex flex-col gap-1.5 relative">
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-[#C9A84C]">
                      {locale === "es" ? "PRECIO MÍNIMO" : "MIN PRICE"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === 'precioMin' ? null : 'precioMin')}
                      className="w-full h-11 px-4 text-xs font-semibold text-white/80 bg-white/[0.02] border border-white/10 rounded-lg text-left flex items-center justify-between cursor-pointer"
                    >
                      <span>{state.precioMin ? `$${state.precioMin.toLocaleString()}` : (locale === "es" ? "Mínimo" : "Min") }</span>
                      <ChevronDown className="h-3.5 w-3.5 text-white/40" />
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === 'precioMin' && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.97 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          className="absolute p-2 max-h-52 overflow-y-auto"
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            left: 0,
                            zIndex: 50,
                            minWidth: '280px',
                            background: 'rgba(18, 16, 13, 0.96)',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(201, 168, 76, 0.15)',
                            borderRadius: '12px',
                          }}
                        >
                          {[0, 10000, 20000, 30000, 50000, 80000, 100000, 150000, 200000].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => {
                                dispatch({ type: 'SET_PRECIO_MIN', payload: val === 0 ? null : val });
                                setActiveDropdown(null);
                              }}
                              className="w-full px-3 py-2 text-xs text-white/80 text-left hover:bg-[rgba(201,168,76,0.08)] rounded-lg"
                            >
                              {val === 0 ? (locale === "es" ? "Cualquiera" : "Any") : `$${val.toLocaleString()}`}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Precio Max dropdown */}
                  <div className="flex flex-col gap-1.5 relative">
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-[#C9A84C]">
                      {locale === "es" ? "PRECIO MÁXIMO" : "MAX PRICE"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === 'precioMaxExp' ? null : 'precioMaxExp')}
                      className="w-full h-11 px-4 text-xs font-semibold text-white/80 bg-white/[0.02] border border-white/10 rounded-lg text-left flex items-center justify-between cursor-pointer"
                    >
                      <span>{state.precioMax ? `$${state.precioMax.toLocaleString()}` : (locale === "es" ? "Máximo" : "Max") }</span>
                      <ChevronDown className="h-3.5 w-3.5 text-white/40" />
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === 'precioMaxExp' && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.97 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          className="absolute p-2 max-h-52 overflow-y-auto"
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            left: 0,
                            zIndex: 50,
                            minWidth: '280px',
                            background: 'rgba(18, 16, 13, 0.96)',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(201, 168, 76, 0.15)',
                            borderRadius: '12px',
                          }}
                        >
                          {[0, 50000, 100000, 200000, 300000, 500000, 1000000].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => {
                                dispatch({ type: 'SET_PRECIO_MAX', payload: val === 0 ? null : val });
                                setActiveDropdown(null);
                              }}
                              className="w-full px-3 py-2 text-xs text-white/80 text-left hover:bg-[rgba(201,168,76,0.08)] rounded-lg"
                            >
                              {val === 0 ? (locale === "es" ? "Sin límite" : "No limit") : `$${val.toLocaleString()}`}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Superficie Min Input */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-[#C9A84C]">
                      {locale === "es" ? "SUPERFICIE MÍN (m²)" : "MIN AREA (m²)"}
                    </span>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={state.areaMin || ""}
                      onChange={(e) => dispatch({ type: 'SET_AREA_MIN', payload: e.target.value ? Number(e.target.value) : null })}
                      className="w-full h-11 px-4 text-xs text-white bg-white/[0.02] border border-white/10 rounded-lg focus:outline-hidden focus:border-[#C9A84C]/50"
                    />
                  </div>

                  {/* Superficie Max Input */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-[#C9A84C]">
                      {locale === "es" ? "SUPERFICIE MÁX (m²)" : "MAX AREA (m²)"}
                    </span>
                    <input
                      type="number"
                      placeholder="e.g. 300"
                      value={state.areaMax || ""}
                      onChange={(e) => dispatch({ type: 'SET_AREA_MAX', payload: e.target.value ? Number(e.target.value) : null })}
                      className="w-full h-11 px-4 text-xs text-white bg-white/[0.02] border border-white/10 rounded-lg focus:outline-hidden focus:border-[#C9A84C]/50"
                    />
                  </div>
                </div>

                {/* FILA 2: Habitaciones y Baños con stepper premium */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {/* Stepper Habitaciones */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-[#C9A84C]" id="rooms-stepper-label">
                      {locale === "es" ? "HABITACIONES" : "BEDROOMS"}
                    </span>
                    <div 
                      className="flex items-center gap-1.5 p-1 bg-white/[0.02] border border-white/10 rounded-lg self-start"
                      role="group"
                      aria-labelledby="rooms-stepper-label"
                    >
                      <button
                        type="button"
                        onClick={() => decrementStepper('habitaciones')}
                        aria-label="Disminuir habitaciones"
                        className="h-9 w-9 flex items-center justify-center text-white/70 hover:text-white rounded-md hover:bg-white/[0.06] cursor-pointer font-bold border-0 bg-transparent"
                      >
                        −
                      </button>
                      <div className="flex items-center gap-1">
                        {([1, 2, 3, '4+'] as const).map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => dispatch({ type: 'SET_HABITACIONES', payload: n })}
                            aria-label={`${n} habitaciones`}
                            className="relative h-9 px-4 text-xs font-semibold rounded-md transition-colors duration-200 cursor-pointer border-0 bg-transparent"
                            style={{
                              color: state.habitaciones === n ? '#000000' : 'rgba(255,255,255,0.7)',
                            }}
                          >
                            {state.habitaciones === n && (
                              <motion.div
                                layoutId="hab-indicator"
                                className="absolute inset-0 bg-[#C9A84C] rounded-md"
                                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                              />
                            )}
                            <span className="relative z-10">{n}</span>
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => incrementStepper('habitaciones')}
                        aria-label="Aumentar habitaciones"
                        className="h-9 w-9 flex items-center justify-center text-white/70 hover:text-white rounded-md hover:bg-white/[0.06] cursor-pointer font-bold border-0 bg-transparent"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Stepper Baños */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-[#C9A84C]" id="baths-stepper-label">
                      {locale === "es" ? "BAÑOS" : "BATHROOMS"}
                    </span>
                    <div 
                      className="flex items-center gap-1.5 p-1 bg-white/[0.02] border border-white/10 rounded-lg self-start"
                      role="group"
                      aria-labelledby="baths-stepper-label"
                    >
                      <button
                        type="button"
                        onClick={() => decrementStepper('banos')}
                        aria-label="Disminuir baños"
                        className="h-9 w-9 flex items-center justify-center text-white/70 hover:text-white rounded-md hover:bg-white/[0.06] cursor-pointer font-bold border-0 bg-transparent"
                      >
                        −
                      </button>
                      <div className="flex items-center gap-1">
                        {([1, 2, 3, '4+'] as const).map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => dispatch({ type: 'SET_BANOS', payload: n })}
                            aria-label={`${n} baños`}
                            className="relative h-9 px-4 text-xs font-semibold rounded-md transition-colors duration-200 cursor-pointer border-0 bg-transparent"
                            style={{
                              color: state.banos === n ? '#000000' : 'rgba(255,255,255,0.7)',
                            }}
                          >
                            {state.banos === n && (
                              <motion.div
                                layoutId="ban-indicator"
                                className="absolute inset-0 bg-[#C9A84C] rounded-md"
                                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                              />
                            )}
                            <span className="relative z-10">{n}</span>
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => incrementStepper('banos')}
                        aria-label="Aumentar baños"
                        className="h-9 w-9 flex items-center justify-center text-white/70 hover:text-white rounded-md hover:bg-white/[0.06] cursor-pointer font-bold border-0 bg-transparent"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* FILA 3: CARACTERÍSTICAS Y EQUIPAMIENTO */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-[#C9A84C]">
                    {locale === "es" ? "CARACTERÍSTICAS Y EQUIPAMIENTO" : "AMENITIES & FEATURES"}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {([
                      { id: 'estacionamiento', label_es: 'Estacionamiento', label_en: 'Parking', icon: Car },
                      { id: 'piscina', label_es: 'Piscina', label_en: 'Pool', icon: Waves },
                      { id: 'seguridad', label_es: 'Vigilancia / Seguridad', label_en: 'Security', icon: Shield },
                      { id: 'planta-electrica', label_es: 'Planta Eléctrica', label_en: 'Power Generator', icon: Zap },
                      { id: 'tanque-agua', label_es: 'Tanque / Pozo de Agua', label_en: 'Water Well', icon: Droplets },
                      { id: 'jardin', label_es: 'Jardín', label_en: 'Garden', icon: Trees },
                      { id: 'aire-acondicionado', label_es: 'Aire Acondicionado', label_en: 'A/C', icon: Wind },
                      { id: 'ascensor', label_es: 'Ascensor', label_en: 'Elevator', icon: ArrowUpDown }
                    ] as const).map((chip) => {
                      const isActive = state.caracteristicas.includes(chip.id);
                      const Icon = chip.icon;
                      return (
                        <motion.button
                          key={chip.id}
                          type="button"
                          onClick={() => dispatch({ type: 'TOGGLE_CARACTERISTICA', payload: chip.id })}
                          whileTap={{ scale: 0.95 }}
                          aria-pressed={isActive}
                          animate={{
                            borderColor: isActive ? '#C9A84C' : 'rgba(255,255,255,0.15)',
                            backgroundColor: isActive ? 'rgba(201,168,76,0.12)' : 'transparent',
                            color: isActive ? '#C9A84C' : 'rgba(255,255,255,0.7)',
                          }}
                          transition={{ duration: 0.15 }}
                          className="px-4 py-2.5 rounded-lg text-xs font-medium border flex items-center gap-2 cursor-pointer transition-colors duration-150 bg-transparent"
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <span>{locale === "es" ? chip.label_es : chip.label_en}</span>
                          {isActive && <Check className="h-3.5 w-3.5 shrink-0 text-[#C9A84C] ml-1" />}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5. ZONAS POPULARES (SIEMPRE visible, en el flujo vertical principal) */}
        <div className="flex flex-wrap items-center gap-2 mt-4 px-1 relative z-10">
          <span className="text-[10px] text-[#C9A84C] uppercase font-semibold font-display tracking-widest">
            {locale === "es" ? "ZONAS POPULARES:" : "POPULAR AREAS:"}
          </span>
          {["El Encanto", "La Floresta", "La Pedregosa"].map((z) => {
            const isSelected = state.zona === z;
            return (
              <motion.button
                key={z}
                type="button"
                onClick={() => dispatch({ type: 'SET_ZONA', payload: isSelected ? null : z })}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-3 py-1 rounded-md text-[10px] font-semibold tracking-wider transition-all duration-200 border cursor-pointer bg-transparent"
                style={{
                  borderColor: isSelected ? '#C9A84C' : 'rgba(255,255,255,0.1)',
                  background: isSelected ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.02)',
                  color: isSelected ? '#C9A84C' : 'rgba(255,255,255,0.6)',
                }}
              >
                {z}
              </motion.button>
            );
          })}
        </div>

      </form>
    </div>
  );
}
