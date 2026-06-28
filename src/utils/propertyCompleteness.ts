import { isCombinationInconsistent } from "./propertyDiscrimination.ts";

export interface FieldScoreConfig {
  weight: number;                    // peso base
  group: 0 | 1 | 2 | 3 | 4 | 5;      // grupo de prioridad
  overrides?: Record<string, number>; // clave: `${type}_${op}`
}

export const SCORE_CONFIG: Record<string, FieldScoreConfig> = {
  // Clasificación base (operación y tipo de inmueble)
  operation: { weight: 15, group: 1 },
  property_type: { weight: 15, group: 1 },

  // Contenido
  title_es: { weight: 8, group: 1, overrides: { 'edificio_venta': 5, 'galpon_venta': 6, 'hacienda_finca_venta': 6, 'terreno_lote_venta': 6 } },
  description_es: { weight: 8, group: 1, overrides: { 'casa_vacacional': 8, 'galpon_venta': 6, 'hacienda_finca_venta': 6, 'terreno_lote_venta': 6 } },
  title_en: { weight: 2, group: 3, overrides: { 'casa_vacacional': 4, 'galpon_venta': 2, 'hacienda_finca_venta': 2, 'terreno_lote_venta': 2 } },
  description_en: { weight: 3, group: 3, overrides: { 'casa_vacacional': 5, 'galpon_venta': 2, 'hacienda_finca_venta': 2, 'terreno_lote_venta': 2 } },

  // Precio
  price: { weight: 15, group: 1, overrides: { 'casa_alquiler': 13, 'apartamento_alquiler': 13, 'anexo_alquiler': 13, 'edificio_alquiler': 13, 'galpon_venta': 16, 'galpon_alquiler': 14, 'hacienda_finca_venta': 14, 'hacienda_finca_alquiler': 13, 'local_alquiler': 13, 'terreno_lote_venta': 17 } },
  price_per_night: { weight: 15, group: 1 },
  price_weekend: { weight: 5, group: 1 },

  // Mantenimiento / Depósito
  maintenance_fee: { weight: 2, group: 1, overrides: { 'apartamento_venta': 3, 'apartamento_alquiler': 2, 'edificio_venta': 3, 'edificio_alquiler': 2, 'galpon_alquiler': 1.5, 'hacienda_finca_alquiler': 1.5, 'local_alquiler': 1.5 } },
  deposit_required: { weight: 2, group: 5 },
  deposit_amount: { weight: 2, group: 5 },

  // Vacacional hospedaje
  min_nights: { weight: 2, group: 1 },
  max_guests: { weight: 2, group: 1 },
  checkin_time: { weight: 2, group: 1 },
  checkout_time: { weight: 2, group: 1 },
  house_rules: { weight: 2, group: 1 },

  // Dimensiones
  area_built: { weight: 5, group: 2, overrides: { 'apartamento_venta': 6, 'anexo_venta': 12, 'anexo_alquiler': 6, 'galpon_venta': 8, 'hacienda_finca_venta': 5, 'hacienda_finca_alquiler': 5, 'local_venta': 9 } },
  area_total: { weight: 5, group: 2, overrides: { 'casa_alquiler': 4, 'casa_vacacional': 3, 'apartamento_venta': 4, 'galpon_venta': 6, 'hacienda_finca_venta': 5, 'hacienda_finca_alquiler': 5, 'local_venta': 5, 'terreno_lote_venta': 15 } },
  area_hectares: { weight: 6, group: 2, overrides: { 'hacienda_finca_venta': 6, 'hacienda_finca_alquiler': 5 } },

  // Habitáculos
  bedrooms: { weight: 4, group: 2, overrides: { 'anexo_alquiler': 3, 'hacienda_finca_venta': 3 } },
  bathrooms: { weight: 4, group: 2, overrides: { 'hacienda_finca_venta': 3 } },
  half_bathrooms: { weight: 1.5, group: 2, overrides: { 'casa_alquiler': 2.5, 'anexo_venta': 2.5 } },

  // Estacionamiento
  parking_spaces: { weight: 3, group: 2, overrides: { 'casa_vacacional': 2, 'habitacion_alquiler': 4, 'hacienda_finca_venta': 3, 'galpon_venta': 4 } },

  // Estructura
  total_floors: { weight: 3.5, group: 2, overrides: { 'apartamento_venta': 2, 'edificio_venta': 4, 'galpon_venta': 2.5, 'galpon_alquiler': 2, 'local_venta': 2.5 } },
  floor_number: { weight: 3.5, group: 2, overrides: { 'apartamento_venta': 2, 'local_venta': 2.5 } },
  has_elevator: { weight: 3.5, group: 2, overrides: { 'apartamento_venta': 2.5, 'apartamento_vacacional': 5, 'edificio_venta': 4, 'local_venta': 2.5 } },
  unit_count: { weight: 2.5, group: 2 },

  // Conservación
  year_built: { weight: 2.5, group: 2, overrides: { 'casa_vacacional': 2, 'anexo_alquiler': 1.5, 'galpon_venta': 2.5, 'galpon_alquiler': 2, 'hacienda_finca_venta': 1.5 } },
  condition: { weight: 2.5, group: 2, overrides: { 'casa_vacacional': 2, 'anexo_venta': 3.5, 'galpon_venta': 2.5, 'galpon_alquiler': 2, 'hacienda_finca_venta': 1.5 } },
  furnished: { weight: 1.5, group: 2, overrides: { 'casa_alquiler': 2.5, 'casa_vacacional': 2.5, 'apartamento_alquiler': 2.5, 'anexo_alquiler': 2.5, 'hacienda_finca_venta': 1.5 } },

  // Ubicación
  municipio: { weight: 5, group: 2 },
  zone_id: { weight: 5, group: 2, overrides: { 'casa_vacacional': 4, 'local_venta': 3 } },
  address_es: { weight: 3, group: 2, overrides: { 'anexo_venta': 4 } },
  address_en: { weight: 2, group: 2, overrides: { 'casa_vacacional': 5, 'apartamento_vacacional': 3, 'anexo_venta': 4, 'anexo_vacacional': 6, 'habitacion_vacacional': 7, 'edificio_venta': 3, 'galpon_venta': 5, 'hacienda_finca_venta': 3, 'terreno_lote_venta': 8 } },
  lat: { weight: 5, group: 2, overrides: { 'casa_vacacional': 4, 'anexo_venta': 6, 'galpon_venta': 6, 'terreno_lote_venta': 8 } }, // lat + lng evaluados juntos
  show_exact_location: { weight: 2, group: 2, overrides: { 'apartamento_vacacional': 3, 'anexo_vacacional': 6, 'habitacion_vacacional': 7, 'edificio_venta': 3, 'galpon_venta': 5, 'hacienda_finca_venta': 3, 'terreno_lote_venta': 8 } },

  // Servicios
  gas_type: { weight: 0.75, group: 4, overrides: { 'galpon_venta': 1.25 } },
  kitchen_type: { weight: 0.75, group: 4 },
  has_water_tank: { weight: 0.75, group: 4, overrides: { 'edificio_venta': 1.25, 'galpon_venta': 1.25, 'hacienda_finca_venta': 1.25 } },
  has_hot_water: { weight: 0.75, group: 4 },
  has_generator: { weight: 0.75, group: 4, overrides: { 'edificio_venta': 1.25, 'galpon_venta': 1.25, 'hacienda_finca_venta': 1.25 } },
  has_internet: { weight: 0.75, group: 4, overrides: { 'edificio_venta': 1.25, 'galpon_venta': 1.25, 'hacienda_finca_venta': 1.25 } },
  has_ac: { weight: 0.75, group: 4, overrides: { 'edificio_venta': 1.25 } },
  has_heating: { weight: 0.75, group: 4 },

  // Seguridad
  has_security_24h: { weight: 0.75, group: 4, overrides: { 'edificio_venta': 1.25, 'galpon_venta': 1.5, 'hacienda_finca_venta': 1.25, 'terreno_lote_venta': 1.5 } },
  has_electric_gate: { weight: 0.75, group: 4, overrides: { 'edificio_venta': 1.25, 'galpon_venta': 1.5, 'hacienda_finca_venta': 1.25 } },
  has_cctv: { weight: 0.75, group: 4, overrides: { 'edificio_venta': 1.25, 'galpon_venta': 1.5, 'hacienda_finca_venta': 1.25 } },
  has_electric_fence: { weight: 0.75, group: 4, overrides: { 'edificio_venta': 1.25, 'galpon_venta': 1.5, 'hacienda_finca_venta': 1.25, 'terreno_lote_venta': 1.5 } },
  has_intercom: { weight: 0.75, group: 4, overrides: { 'anexo_alquiler': 1.25, 'edificio_venta': 1.25 } },
  has_armored_door: { weight: 0.75, group: 4, overrides: { 'anexo_alquiler': 1.25, 'edificio_venta': 1.25 } },

  // Terrenos y Fincas
  topography: { weight: 3.5, group: 4, overrides: { 'galpon_venta': 2.5, 'hacienda_finca_venta': 3.5, 'terreno_lote_venta': 4.5 } },
  land_use: { weight: 3.5, group: 4, overrides: { 'galpon_venta': 2.5, 'terreno_lote_venta': 4.5 } },
  access_type: { weight: 3.5, group: 4, overrides: { 'galpon_venta': 3.5, 'hacienda_finca_venta': 4.5, 'terreno_lote_venta': 3.5 } },
  current_use: { weight: 3.5, group: 4, overrides: { 'hacienda_finca_venta': 3.5, 'terreno_lote_venta': 3.5 } },
  has_own_water: { weight: 4.5, group: 4, overrides: { 'hacienda_finca_venta': 5.5, 'terreno_lote_venta': 4.5 } },

  // Cohabitación
  bathroom_type: { weight: 2.5, group: 5, overrides: { 'anexo_alquiler': 2.5, 'habitacion_alquiler': 3 } },
  host_housing_type: { weight: 2.5, group: 5, overrides: { 'anexo_alquiler': 2.5, 'habitacion_alquiler': 3 } },
  cohabitation: { weight: 2.5, group: 5, overrides: { 'anexo_alquiler': 2.5, 'habitacion_alquiler': 3 } },
  occupants_count: { weight: 2.5, group: 5, overrides: { 'anexo_alquiler': 2.5, 'habitacion_alquiler': 3 } },
  gender_policy: { weight: 2.5, group: 5, overrides: { 'anexo_alquiler': 2.5, 'habitacion_alquiler': 3 } },
  allows_pets: { weight: 2.5, group: 5, overrides: { 'anexo_alquiler': 2.5, 'habitacion_alquiler': 3 } },
  allows_cooking: { weight: 2.5, group: 5, overrides: { 'anexo_alquiler': 2.5, 'habitacion_alquiler': 3 } },
  has_independent_entrance: { weight: 5, group: 5, overrides: { 'anexo_venta': 7, 'anexo_alquiler': 5, 'anexo_vacacional': 6, 'habitacion_vacacional': 6 } },
};

// Mapeo amigable en español de los campos para las sugerencias
const FIELD_LABELS: Record<string, string> = {
  operation: "Tipo de operación",
  property_type: "Tipo de inmueble",
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
  // 1. Bloqueo si falta operación o tipo de inmueble, o si hay incompatibilidad
  if (!type && !op) {
    const recommendations = [
      { label: "Seleccionar Tipo de Operación", weight: 15, field: "operation" },
      { label: "Seleccionar Tipo de Inmueble", weight: 15, field: "property_type" }
    ];
    return { score: 0, recommendations };
  }
  if (!op) {
    const recommendations = [
      { label: "Seleccionar Tipo de Operación", weight: 15, field: "operation" }
    ];
    return { score: 15, recommendations };
  }
  if (!type) {
    const recommendations = [
      { label: "Seleccionar Tipo de Inmueble", weight: 15, field: "property_type" }
    ];
    return { score: 15, recommendations };
  }
  if (isCombinationInconsistent(type, op)) {
    return { score: 0, recommendations: [{ label: "Corregir combinación inconsistente", weight: 15, field: "operation" }] };
  }

  let totalRestWeight = 0;
  let earnedRestWeight = 0;
  const recommendations: { label: string; weight: number; field: string }[] = [];
  const comboKey = `${type}_${op}`;

  // 2. Recorrer la configuración de campos para recolectar pesos de los aplicables
  const activeFields: { field: string; weight: number }[] = [];

  Object.entries(SCORE_CONFIG).forEach(([field, cfg]) => {
    if (cfg.group === 0) return; // Excluidos
    if (field === "operation" || field === "property_type") return; // Ignorar base de la parte restante

    // Determinar si aplica el campo en esta combinación específica
    const applies = checkAppliesFn(field);
    if (!applies) return;

    // Obtener peso (con overrides si existen)
    const weight = cfg.overrides?.[comboKey] ?? cfg.weight;
    if (weight === 0) return;

    activeFields.push({ field, weight });
    totalRestWeight += weight;
  });

  // Evaluar Imágenes (Fotos de la propiedad) -> Valor base de 10 pts (se agrega a total)
  const imagesWeight = 10;
  totalRestWeight += imagesWeight;

  // 3. Evaluar respuestas y acumular
  activeFields.forEach(({ field, weight }) => {
    if (field === "has_water_tank") {
      console.log(`[Completeness Test] Field: has_water_tank, Value: ${data.has_water_tank}, Type: ${typeof data.has_water_tank}, isAnswered: ${isAnswered(data.has_water_tank)}`);
    }

    // Caso especial 1: Precio y moneda (se evalúan juntos)
    if (field === "price") {
      const isPriceFilled = isAnswered(data.price) && isAnswered(data.price_currency);
      if (isPriceFilled) {
        earnedRestWeight += weight;
      } else {
        recommendations.push({ label: FIELD_LABELS.price || "Precio y Moneda", weight, field: "price" });
      }
      return;
    }

    if (field === "price_per_night") {
      const isVacationalPriceFilled = isAnswered(data.price_per_night) && isAnswered(data.price_currency);
      if (isVacationalPriceFilled) {
        earnedRestWeight += weight;
      } else {
        recommendations.push({ label: FIELD_LABELS.price_per_night || "Tarifa por noche", weight, field: "price_per_night" });
      }
      return;
    }

    // Caso especial 2: Coordenadas de ubicación (se evalúan juntos)
    if (field === "lat") {
      const isLocFilled = isAnswered(data.lat) && isAnswered(data.lng);
      if (isLocFilled) {
        earnedRestWeight += weight;
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
          earnedRestWeight += weight;
        } else {
          recommendations.push({ label: FIELD_LABELS.deposit_amount || "Monto de depósito", weight, field: "deposit_amount" });
        }
      } else if (data.deposit_required === false) {
        // Si no requiere depósito, gana los puntos de deposit_amount automáticamente,
        // pero no en un formulario recién creado donde solo se han seleccionado operación y tipo.
        const hasOtherAnswers = Object.keys(data).some(k => {
          if (["operation", "property_type", "status", "listing_badge", "completeness_score", "deposit_required", "min_nights", "checkin_time", "checkout_time"].includes(k)) {
            return false;
          }
          return isAnswered(data[k]);
        });
        if (hasOtherAnswers) {
          earnedRestWeight += weight;
        }
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

    const answered = isAnswered(val);
    if (answered) {
      earnedRestWeight += weight;
    } else {
      recommendations.push({ label: FIELD_LABELS[field] || field, weight, field });
    }
  });

  // Evaluar imágenes
  if (imagesLength > 0) {
    earnedRestWeight += imagesWeight;
  } else {
    recommendations.push({ label: FIELD_LABELS.images || "Fotos de la propiedad", weight: imagesWeight, field: "images" });
  }

  // 4. Calcular score: Clasificación base (30%) + Resto aplicable escalado a 70%
  const basePoints = 30; // Ya que ambos están rellenados para llegar a este punto
  const restPercent = totalRestWeight > 0 ? (earnedRestWeight / totalRestWeight) * 70 : 70;
  let score = Math.round(basePoints + restPercent);
  if (score === 100 && earnedRestWeight < totalRestWeight) {
    score = 99;
  }

  // Las sugerencias muestran el peso proporcional sobre los 70 puntos restantes
  const mappedRecommendations = recommendations.map(r => {
    const proportionalWeight = totalRestWeight > 0 ? (r.weight / totalRestWeight) * 70 : r.weight;
    return {
      label: r.label,
      weight: Math.round(proportionalWeight) || 1, // Garantizar mínimo 1% para sugerencias visibles
      field: r.field
    };
  });

  // Ordenar sugerencias por peso descendente
  mappedRecommendations.sort((a, b) => b.weight - a.weight);

  return { score, recommendations: mappedRecommendations };
}
