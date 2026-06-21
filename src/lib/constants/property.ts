// src/lib/constants/property.ts
// Fuente única de verdad para todos los valores del dominio Property

import type {
  PropertyOperation, PropertyType, PropertyStatus,
  PropertyCondition, FurnishedStatus, GasType,
  KitchenType, Municipio, FeatureCategory
} from "@/types/property";

export const PROPERTY_OPERATIONS: {
  value: PropertyOperation; label_es: string; label_en: string;
}[] = [
  { value: "venta",      label_es: "Venta",      label_en: "For Sale" },
  { value: "alquiler",   label_es: "Alquiler",   label_en: "For Rent" },
  { value: "vacacional", label_es: "Vacacional", label_en: "Vacation" },
];

export const PROPERTY_TYPES: {
  value: PropertyType; label_es: string; label_en: string; icon: string;
}[] = [
  { value: "casa",          label_es: "Casa",             label_en: "House",           icon: "Home" },
  { value: "apartamento",   label_es: "Apartamento",      label_en: "Apartment",       icon: "Building2" },
  { value: "townhouse",     label_es: "Townhouse",        label_en: "Townhouse",       icon: "Layers" },
  { value: "anexo",         label_es: "Anexo",            label_en: "Annex",           icon: "DoorOpen" },
  { value: "habitacion",    label_es: "Habitación",       label_en: "Room",            icon: "BedDouble" },
  { value: "edificio",      label_es: "Edificio",         label_en: "Building",        icon: "Building" },
  { value: "galpon",        label_es: "Galpón",           label_en: "Warehouse",       icon: "Warehouse" },
  { value: "hacienda_finca",label_es: "Hacienda / Finca", label_en: "Farm / Estate",   icon: "Tractor" },
  { value: "local",         label_es: "Local Comercial",  label_en: "Commercial Space",icon: "Store" },
  { value: "oficina",       label_es: "Oficina",          label_en: "Office",          icon: "Briefcase" },
  { value: "terreno_lote",  label_es: "Terreno / Lote",   label_en: "Land / Lot",      icon: "TreePine" },
];

export const PROPERTY_STATUSES: {
  value: PropertyStatus; label_es: string; label_en: string; color: string;
}[] = [
  { value: "activa",    label_es: "Activa",    label_en: "Active",    color: "green" },
  { value: "reservada", label_es: "Reservada", label_en: "Reserved",  color: "yellow" },
  { value: "vendida",   label_es: "Vendida",   label_en: "Sold",      color: "blue" },
  { value: "alquilada", label_es: "Alquilada", label_en: "Rented",    color: "blue" },
  { value: "cerrada",   label_es: "Cerrada",   label_en: "Closed",    color: "gray" },
];

export const PROPERTY_CONDITIONS: {
  value: PropertyCondition; label_es: string; label_en: string;
}[] = [
  { value: "nuevo",        label_es: "Nuevo",          label_en: "New" },
  { value: "remodelado",   label_es: "Remodelado",     label_en: "Renovated" },
  { value: "buen_estado",  label_es: "Buen estado",    label_en: "Good condition" },
  { value: "a_remodelar",  label_es: "A remodelar",    label_en: "Needs renovation" },
];

export const FURNISHED_OPTIONS: {
  value: FurnishedStatus; label_es: string; label_en: string;
}[] = [
  { value: "sin_muebles", label_es: "Sin muebles",          label_en: "Unfurnished" },
  { value: "parcial",     label_es: "Parcialmente amoblado", label_en: "Partially furnished" },
  { value: "completo",    label_es: "Completamente amoblado",label_en: "Fully furnished" },
];

export const GAS_TYPES: {
  value: GasType; label_es: string; label_en: string;
}[] = [
  { value: "central",   label_es: "Gas Central",  label_en: "Central Gas" },
  { value: "bombonas",  label_es: "Gas Bombonas", label_en: "Gas Cylinders" },
  { value: "ninguno",   label_es: "Sin gas",      label_en: "No gas" },
];

export const KITCHEN_TYPES: {
  value: KitchenType; label_es: string; label_en: string;
}[] = [
  { value: "electrica", label_es: "Eléctrica", label_en: "Electric" },
  { value: "gas",       label_es: "A gas",     label_en: "Gas" },
  { value: "ninguna",   label_es: "Sin cocina", label_en: "No kitchen" },
];

export const MUNICIPIOS: {
  value: Municipio; label_es: string;
}[] = [
  { value: "libertador",      label_es: "Municipio Libertador" },
  { value: "campo_elias",     label_es: "Campo Elías" },
  { value: "santos_marquina", label_es: "Santos Marquina" },
  { value: "sucre",           label_es: "Sucre" },
  { value: "rangel",          label_es: "Rangel" },
];

export const FEATURE_CATEGORIES: {
  value: FeatureCategory; label_es: string; label_en: string;
}[] = [
  { value: "servicios_basicos", label_es: "Servicios Básicos", label_en: "Basic Services" },
  { value: "seguridad",         label_es: "Seguridad",         label_en: "Security" },
  { value: "amenidades",        label_es: "Amenidades",        label_en: "Amenities" },
  { value: "equipamiento",      label_es: "Equipamiento",      label_en: "Equipment" },
  { value: "habitacion",        label_es: "Habitación",        label_en: "Room" },
  { value: "vacacional",        label_es: "Vacacional",        label_en: "Vacation" },
  { value: "general",           label_es: "General",           label_en: "General" },
];

// Amenidades predefinidas para el formulario (JSONB array)
export const AMENITIES_OPTIONS: {
  value: string; label_es: string; label_en: string; icon: string;
}[] = [
  { value: "piscina",       label_es: "Piscina",            label_en: "Pool",            icon: "Waves" },
  { value: "gimnasio",      label_es: "Gimnasio",           label_en: "Gym",             icon: "Dumbbell" },
  { value: "salon_social",  label_es: "Salón Social",       label_en: "Social Hall",     icon: "Users" },
  { value: "bbq",           label_es: "Área de BBQ",        label_en: "BBQ Area",        icon: "Flame" },
  { value: "jardines",      label_es: "Jardines",           label_en: "Gardens",         icon: "Leaf" },
  { value: "cancha_tenis",  label_es: "Cancha de Tenis",    label_en: "Tennis Court",    icon: "Circle" },
  { value: "cancha_padel",  label_es: "Cancha de Pádel",    label_en: "Padel Court",     icon: "Zap" },
  { value: "area_juegos",   label_es: "Área Infantil",      label_en: "Kids Area",       icon: "Star" },
  { value: "spa",           label_es: "Spa",                label_en: "Spa",             icon: "Sparkles" },
  { value: "conserje",      label_es: "Conserje",           label_en: "Concierge",       icon: "UserCheck" },
];

// Inventario de muebles para el formulario (JSONB array)
export const FURNITURE_OPTIONS: {
  value: string; label_es: string; category: string; icon: string;
}[] = [
  // Dormitorio
  { value: "cama_individual",   label_es: "Cama Individual",   category: "dormitorio", icon: "BedSingle" },
  { value: "cama_matrimonial",  label_es: "Cama Matrimonial",  category: "dormitorio", icon: "BedDouble" },
  { value: "cama_king",         label_es: "Cama King",         category: "dormitorio", icon: "BedDouble" },
  { value: "armario",           label_es: "Armario/Closet",    category: "dormitorio", icon: "Package" },
  // Sala
  { value: "sofa",              label_es: "Sofá",              category: "sala",       icon: "Sofa" },
  { value: "tv",                label_es: "Televisor",         category: "sala",       icon: "Tv" },
  // Cocina
  { value: "nevera",            label_es: "Nevera",            category: "cocina",     icon: "Thermometer" },
  { value: "cocina_fogon",      label_es: "Cocina/Fogón",      category: "cocina",     icon: "Flame" },
  { value: "horno",             label_es: "Horno",             category: "cocina",     icon: "UtensilsCrossed" },
  { value: "microondas",        label_es: "Microondas",        category: "cocina",     icon: "Zap" },
  // Lavandería
  { value: "lavadora",          label_es: "Lavadora",          category: "lavanderia", icon: "WashingMachine" },
  { value: "secadora",          label_es: "Secadora",          category: "lavanderia", icon: "Wind" },
];

// Servicios incluidos (para habitaciones)
export const SERVICES_INCLUDED_OPTIONS: {
  value: string; label_es: string; icon: string;
}[] = [
  { value: "agua",     label_es: "Agua",     icon: "Droplets" },
  { value: "luz",      label_es: "Luz",      icon: "Zap" },
  { value: "internet", label_es: "Internet", icon: "Wifi" },
  { value: "gas",      label_es: "Gas",      icon: "Flame" },
];

// Servicios de la zona (para terrenos)
export const ZONE_SERVICES_OPTIONS: {
  value: string; label_es: string; icon: string;
}[] = [
  { value: "agua",     label_es: "Agua",     icon: "Droplets" },
  { value: "luz",      label_es: "Luz",      icon: "Zap" },
  { value: "cloacas",  label_es: "Cloacas",  icon: "ArrowDownToLine" },
  { value: "asfalto",  label_es: "Asfalto",  icon: "MapPin" },
];

export const LISTING_BADGES: {
  value: string; label_es: string; color: string;
}[] = [
  { value: "basico",    label_es: "Básico",    color: "gray" },
  { value: "completo",  label_es: "Completo",  color: "blue" },
  { value: "premium",   label_es: "Premium",   color: "gold" },
];
