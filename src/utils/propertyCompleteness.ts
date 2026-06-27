import { isCombinationInconsistent } from "./propertyDiscrimination";

export interface FieldScoreConfig {
  weight: number;                    // peso base
  group: 0 | 1 | 2 | 3 | 4 | 5;      // grupo de prioridad
  overrides?: Record<string, number>; // clave: `${type}_${op}`
}

export const SCORE_CONFIG: Record<string, FieldScoreConfig> = {
  // Contenido
  title_es: { weight: 4, group: 1, overrides: { 'edificio_venta': 3, 'galpon_venta': 3.5, 'hacienda_finca_venta': 3.5, 'terreno_lote_venta': 3.5 } },
  description_es: { weight: 4, group: 1, overrides: { 'casa_vacacional': 5, 'galpon_venta': 3.5, 'hacienda_finca_venta': 3.5, 'terreno_lote_venta': 3.5 } },
  title_en: { weight: 1, group: 3, overrides: { 'casa_vacacional': 1.5, 'galpon_venta': 1.5, 'hacienda_finca_venta': 1.5, 'terreno_lote_venta': 1.5 } },
  description_en: { weight: 2, group: 3, overrides: { 'casa_vacacional': 2.5, 'galpon_venta': 1.5, 'hacienda_finca_venta': 1.5, 'terreno_lote_venta': 1.5 } },

  // Precio
  price: { weight: 12, group: 1, overrides: { 'casa_alquiler': 11, 'apartamento_alquiler': 11, 'anexo_alquiler': 11, 'edificio_alquiler': 11, 'galpon_venta': 13, 'galpon_alquiler': 12, 'hacienda_finca_venta': 12, 'hacienda_finca_alquiler': 11, 'local_alquiler': 11, 'terreno_lote_venta': 14 } },
  price_negotiable: { weight: 2, group: 1 },
  price_per_night: { weight: 11, group: 1 },
  price_weekend: { weight: 3, group: 1 },

  // Mantenimiento / Depósito
  maintenance_fee: { weight: 2, group: 1, overrides: { 'apartamento_venta': 3, 'apartamento_alquiler': 2, 'edificio_venta': 3, 'edificio_alquiler': 2, 'galpon_alquiler': 1.5, 'hacienda_finca_alquiler': 1.5, 'local_alquiler': 1.5 } },
  maintenance_included: { weight: 2, group: 1, overrides: { 'casa_alquiler': 1.5, 'apartamento_alquiler': 2, 'galpon_alquiler': 1.5, 'hacienda_finca_alquiler': 1.5, 'local_alquiler': 1.5 } },
  deposit_required: { weight: 2, group: 5 },
  deposit_amount: { weight: 2, group: 5 },

  // Vacacional hospedaje
  min_nights: { weight: 2, group: 1 },
  max_guests: { weight: 2, group: 1 },
  checkin_time: { weight: 2, group: 1 },
  checkout_time: { weight: 2, group: 1 },
  house_rules: { weight: 2, group: 1 },
  includes_breakfast: { weight: 2, group: 1 },

  // Dimensiones
  area_built: { weight: 4, group: 2, overrides: { 'apartamento_venta': 5, 'anexo_venta': 10, 'anexo_alquiler': 5, 'galpon_venta': 7, 'hacienda_finca_venta': 4, 'hacienda_finca_alquiler': 4, 'local_venta': 8 } },
  area_total: { weight: 4, group: 2, overrides: { 'casa_alquiler': 3, 'casa_vacacional': 2, 'apartamento_venta': 3, 'galpon_venta': 5, 'hacienda_finca_venta': 4, 'hacienda_finca_alquiler': 4, 'local_venta': 4, 'terreno_lote_venta': 13 } },
  area_hectares: { weight: 5, group: 2, overrides: { 'hacienda_finca_venta': 5, 'hacienda_finca_alquiler': 4 } },

  // Habitáculos
  bedrooms: { weight: 3, group: 2, overrides: { 'anexo_alquiler': 2, 'hacienda_finca_venta': 2 } },
  bathrooms: { weight: 3, group: 2, overrides: { 'hacienda_finca_venta': 2 } },
  half_bathrooms: { weight: 1, group: 2, overrides: { 'casa_alquiler': 2, 'anexo_venta': 2 } },

  // Estacionamiento
  parking_spaces: { weight: 2, group: 2, overrides: { 'casa_vacacional': 1, 'habitacion_alquiler': 3, 'parking_spaces': 2, 'hacienda_finca_venta': 2, 'galpon_venta': 3 } },
  parking_covered: { weight: 1, group: 2, overrides: { 'casa_vacacional': 1, 'galpon_venta': 2 } },

  // Estructura
  total_floors: { weight: 3, group: 2, overrides: { 'apartamento_venta': 1.5, 'edificio_venta': 3, 'galpon_venta': 2, 'galpon_alquiler': 1.66, 'local_venta': 2 } },
  floor_number: { weight: 3, group: 2, overrides: { 'apartamento_venta': 1.5, 'local_venta': 2 } },
  has_elevator: { weight: 3, group: 2, overrides: { 'apartamento_venta': 2, 'apartamento_vacacional': 4, 'edificio_venta': 3, 'local_venta': 2 } },
  unit_count: { weight: 2, group: 2 },

  // Conservación
  year_built: { weight: 2, group: 2, overrides: { 'casa_vacacional': 1.5, 'anexo_alquiler': 1, 'galpon_venta': 2, 'galpon_alquiler': 1.66, 'hacienda_finca_venta': 1.33 } },
  condition: { weight: 2, group: 2, overrides: { 'casa_vacacional': 1.5, 'anexo_venta': 3, 'galpon_venta': 2, 'galpon_alquiler': 1.66, 'hacienda_finca_venta': 1.33 } },
  furnished: { weight: 1, group: 2, overrides: { 'casa_alquiler': 2, 'casa_vacacional': 2, 'apartamento_alquiler': 2, 'anexo_alquiler': 2, 'hacienda_finca_venta': 1.33 } },

  // Ubicación
  municipio: { weight: 3, group: 2 },
  zone_id: { weight: 3, group: 2, overrides: { 'casa_vacacional': 2.5, 'local_venta': 2 } },
  address_es: { weight: 2, group: 2, overrides: { 'anexo_venta': 3 } },
  address_en: { weight: 1, group: 2, overrides: { 'casa_vacacional': 4, 'apartamento_vacacional': 2.5, 'anexo_venta': 3, 'anexo_vacacional': 4.5, 'habitacion_vacacional': 5, 'edificio_venta': 2.5, 'galpon_venta': 3.5, 'hacienda_finca_venta': 2.5, 'terreno_lote_venta': 6.5 } },
  lat: { weight: 4, group: 2, overrides: { 'casa_vacacional': 3.5, 'anexo_venta': 5, 'galpon_venta': 5, 'terreno_lote_venta': 6.5 } }, // lat + lng evaluados juntos
  show_exact_location: { weight: 1, group: 2, overrides: { 'apartamento_vacacional': 2.5, 'anexo_vacacional': 4.5, 'habitacion_vacacional': 5, 'edificio_venta': 2.5, 'galpon_venta': 3.5, 'hacienda_finca_venta': 2.5, 'terreno_lote_venta': 6.5 } },

  // Servicios
  gas_type: { weight: 1, group: 4, overrides: { 'galpon_venta': 1.75 } },
  kitchen_type: { weight: 1, group: 4 },
  has_water_tank: { weight: 1, group: 4, overrides: { 'edificio_venta': 1.5, 'galpon_venta': 1.75, 'hacienda_finca_venta': 1.66 } },
  has_hot_water: { weight: 1, group: 4 },
  has_generator: { weight: 1, group: 4, overrides: { 'edificio_venta': 1.5, 'galpon_venta': 1.75, 'hacienda_finca_venta': 1.66 } },
  has_internet: { weight: 1, group: 4, overrides: { 'edificio_venta': 1.5, 'galpon_venta': 1.75, 'hacienda_finca_venta': 1.66 } },
  has_ac: { weight: 1, group: 4, overrides: { 'edificio_venta': 1.5 } },
  has_heating: { weight: 1, group: 4 },

  // Seguridad
  has_security_24h: { weight: 1, group: 4, overrides: { 'edificio_venta': 1.16, 'galpon_venta': 2, 'hacienda_finca_venta': 1.5, 'terreno_lote_venta': 2 } },
  has_electric_gate: { weight: 1, group: 4, overrides: { 'edificio_venta': 1.16, 'galpon_venta': 2, 'hacienda_finca_venta': 1.5 } },
  has_cctv: { weight: 1, group: 4, overrides: { 'edificio_venta': 1.16, 'galpon_venta': 2, 'hacienda_finca_venta': 1.5 } },
  has_electric_fence: { weight: 1, group: 4, overrides: { 'edificio_venta': 1.16, 'galpon_venta': 2, 'hacienda_finca_venta': 1.5, 'terreno_lote_venta': 2 } },
  has_intercom: { weight: 1, group: 4, overrides: { 'anexo_alquiler': 1.33, 'edificio_venta': 1.16 } },
  has_armored_door: { weight: 1, group: 4, overrides: { 'anexo_alquiler': 1.33, 'edificio_venta': 1.16 } },

  // Terrenos y Fincas
  topography: { weight: 3, group: 4, overrides: { 'galpon_venta': 2, 'hacienda_finca_venta': 3, 'terreno_lote_venta': 4 } },
  land_use: { weight: 3, group: 4, overrides: { 'galpon_venta': 2, 'terreno_lote_venta': 4 } },
  access_type: { weight: 3, group: 4, overrides: { 'galpon_venta': 3, 'hacienda_finca_venta': 4, 'terreno_lote_venta': 3 } },
  current_use: { weight: 3, group: 4, overrides: { 'hacienda_finca_venta': 3, 'terreno_lote_venta': 3 } },
  has_own_water: { weight: 4, group: 4, overrides: { 'hacienda_finca_venta': 5, 'terreno_lote_venta': 4 } },

  // Cohabitación
  bathroom_type: { weight: 2, group: 5, overrides: { 'anexo_alquiler': 2, 'habitacion_alquiler': 2.42 } },
  host_housing_type: { weight: 2, group: 5, overrides: { 'anexo_alquiler': 2, 'habitacion_alquiler': 2.42 } },
  cohabitation: { weight: 2, group: 5, overrides: { 'anexo_alquiler': 2, 'habitacion_alquiler': 2.42 } },
  occupants_count: { weight: 2, group: 5, overrides: { 'anexo_alquiler': 2, 'habitacion_alquiler': 2.42 } },
  gender_policy: { weight: 2, group: 5, overrides: { 'anexo_alquiler': 2, 'habitacion_alquiler': 2.42 } },
  allows_pets: { weight: 2, group: 5, overrides: { 'anexo_alquiler': 2, 'habitacion_alquiler': 2.42 } },
  allows_cooking: { weight: 2, group: 5, overrides: { 'anexo_alquiler': 2, 'habitacion_alquiler': 2.42 } },
  has_independent_entrance: { weight: 4, group: 5, overrides: { 'anexo_venta': 6, 'anexo_alquiler': 4, 'anexo_vacacional': 5, 'habitacion_vacacional': 5 } },
};

// Mapeo amigable en español de los campos para las sugerencias
const FIELD_LABELS: Record<string, string> = {
  title_es: "Título en Español",
  title_en: "Título en Inglés",
  description_es: "Descripción en Español",
  description_en: "Descripción en Inglés",
  price: "Precio de la propiedad",
  price_currency: "Moneda de la publicación",
  price_per_night: "Precio por noche",
  price_weekend: "Precio de fin de semana",
  min_nights: "Mínimo de noches",
  max_guests: "Huéspedes máximos",
  maintenance_fee: "Cuota de condominio",
  area_built: "Área de construcción",
  area_total: "Área total de terreno",
  area_hectares: "Área en hectáreas",
  bedrooms: "Número de habitaciones",
  bathrooms: "Número de baños",
  half_bathrooms: "Medios baños",
  parking_spaces: "Puestos de estacionamiento",
  total_floors: "Total de pisos",
  floor_number: "Número de piso",
  year_built: "Año de construcción",
  condition: "Estado de conservación",
  furnished: "Amoblado",
  municipio: "Municipio",
  zone_id: "Zona / Sector",
  address_es: "Dirección",
  address_en: "Dirección en Inglés",
  lat: "Ubicación en mapa (Lat/Lng)",
  gas_type: "Tipo de suministro de gas",
  kitchen_type: "Tipo de cocina",
  bathroom_type: "Tipo de baño",
  host_housing_type: "Vivienda del anfitrión",
  cohabitation: "Régimen de cohabitación",
  gender_policy: "Política de género",
  occupants_count: "Cantidad de ocupantes",
  deposit_amount: "Monto de depósito",
  allows_pets: "Acepta mascotas",
  allows_cooking: "Permite cocinar",
  topography: "Topografía del terreno",
  land_use: "Uso de suelo",
  access_type: "Tipo de acceso vial",
  current_use: "Uso actual del terreno",
  images: "Fotos de la propiedad",
  has_water_tank: "Tanque de agua",
  has_hot_water: "Agua caliente",
  has_generator: "Planta eléctrica",
  has_internet: "Servicio de internet",
  has_ac: "Aire acondicionado",
  has_heating: "Calefacción",
  has_elevator: "Ascensor en edificio",
  has_security_24h: "Seguridad 24 horas",
  has_electric_gate: "Portón eléctrico",
  has_cctv: "Cámaras de seguridad (CCTV)",
  has_electric_fence: "Cerco eléctrico",
  has_intercom: "Intercomunicador",
  has_armored_door: "Puerta blindada",
  has_own_water: "Agua propia (pozo/manantial)",
  has_independent_entrance: "Entrada independiente",
  status: "Estado del anuncio",
  unit_count: "Número de unidades del edificio",
  show_exact_location: "Mostrar ubicación exacta",
  parking_covered: "Estacionamiento techado",
  price_negotiable: "Precio negociable",
  maintenance_included: "Mantenimiento incluido",
  house_rules: "Normas de la casa",
  includes_breakfast: "Incluye desayuno",
  deposit_required: "Requiere depósito",
};

export function isAnswered(value: unknown): boolean {
  return value !== null && value !== undefined && value !== '';
}

export function computeCompletenessScore(
  data: Record<string, any>,
  type: string,
  op: string,
  imagesLength: number,
  checkAppliesFn: (fieldOrGroup: string) => boolean
): { score: number; recommendations: { label: string; weight: number; field: string }[] } {
  // 1. Bloqueo al 0% si falta operación o tipo de inmueble, o si hay incompatibilidad
  if (!type || !op || isCombinationInconsistent(type, op)) {
    return { score: 0, recommendations: [] };
  }

  let totalWeight = 0;
  let earnedWeight = 0;
  const recommendations: { label: string; weight: number; field: string }[] = [];
  const comboKey = `${type}_${op}`;

  // 2. Recorrer la configuración de campos para recolectar pesos de los aplicables
  const activeFields: { field: string; weight: number }[] = [];

  Object.entries(SCORE_CONFIG).forEach(([field, cfg]) => {
    if (cfg.group === 0) return; // Excluidos

    // Determinar si aplica el campo en esta combinación específica
    const applies = checkAppliesFn(field);
    if (!applies) return;

    // Obtener peso (con overrides si existen)
    const weight = cfg.overrides?.[comboKey] ?? cfg.weight;
    if (weight === 0) return;

    activeFields.push({ field, weight });
    totalWeight += weight;
  });

  // Evaluar Imágenes (Fotos de la propiedad) -> Valor base de 12 pts (se agrega a total)
  const imagesWeight = 12;
  totalWeight += imagesWeight;

  // 3. Evaluar respuestas y acumular
  activeFields.forEach(({ field, weight }) => {
    // Caso especial 1: Precio y moneda (se evalúan juntos)
    if (field === "price") {
      const isPriceFilled = isAnswered(data.price) && isAnswered(data.price_currency);
      if (isPriceFilled) {
        earnedWeight += weight;
      } else {
        recommendations.push({ label: FIELD_LABELS.price || "Precio y Moneda", weight, field: "price" });
      }
      return;
    }

    if (field === "price_per_night") {
      const isVacationalPriceFilled = isAnswered(data.price_per_night) && isAnswered(data.price_currency);
      if (isVacationalPriceFilled) {
        earnedWeight += weight;
      } else {
        recommendations.push({ label: FIELD_LABELS.price_per_night || "Tarifa por noche", weight, field: "price_per_night" });
      }
      return;
    }

    // Caso especial 2: Coordenadas de ubicación (se evalúan juntos)
    if (field === "lat") {
      const isLocFilled = isAnswered(data.lat) && isAnswered(data.lng);
      if (isLocFilled) {
        earnedWeight += weight;
      } else {
        recommendations.push({ label: FIELD_LABELS.lat || "Ubicación en mapa", weight, field: "lat" });
      }
      return;
    }

    // Caso especial 3: Depósito (se evalúa junto)
    if (field === "deposit_amount") {
      // Solo si requiere depósito, evaluamos el monto
      if (data.deposit_required === true) {
        if (isAnswered(data.deposit_amount)) {
          earnedWeight += weight;
        } else {
          recommendations.push({ label: FIELD_LABELS.deposit_amount || "Monto de depósito", weight, field: "deposit_amount" });
        }
      } else if (data.deposit_required === false) {
        // Si explícitamente no requiere depósito, se gana el peso automáticamente
        earnedWeight += weight;
      } else {
        recommendations.push({ label: "Especificar si requiere depósito", weight, field: "deposit_required" });
      }
      return;
    }

    // Caso general de campos normales
    let val = data[field];

    // Mapeo cruzado de campos de interfaz visual y base de datos
    if (field === "total_floors" && val === undefined) {
      val = data.floors;
    }

    if (isAnswered(val)) {
      earnedWeight += weight;
    } else {
      recommendations.push({ label: FIELD_LABELS[field] || field, weight, field });
    }
  });

  // Evaluar imágenes
  if (imagesLength > 0) {
    earnedWeight += imagesWeight;
  } else {
    recommendations.push({ label: FIELD_LABELS.images || "Fotos de la propiedad", weight: imagesWeight, field: "images" });
  }

  // 4. Lógica de normalización dinámica: El total de los aplicables se escala exactamente a 100%
  const score = totalWeight === 0 ? 0 : Math.round((earnedWeight / totalWeight) * 100);

  // Normalizar los pesos de las recomendaciones para ofrecer con precisión los puntos adicionales en la UI
  const mappedRecommendations = recommendations.map(r => ({
    label: r.label,
    weight: totalWeight === 0 ? 0 : Math.max(1, Math.round((r.weight / totalWeight) * 100)),
    field: r.field
  }));

  // Ordenar sugerencias por peso descendente
  mappedRecommendations.sort((a, b) => b.weight - a.weight);

  return { score, recommendations: mappedRecommendations };
}
