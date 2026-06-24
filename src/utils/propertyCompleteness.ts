export interface FieldScoreConfig {
  weight: number;                    // peso base
  group: 0 | 1 | 2 | 3 | 4 | 5;      // grupo de prioridad
  overrides?: Record<string, number>; // clave: `${type}_${op}`
}

export const SCORE_CONFIG: Record<string, FieldScoreConfig> = {
  // Críticos (Grupo 1)
  title_es:         { weight: 12, group: 1 },
  price:            { weight: 13, group: 1 },
  price_per_night:  { weight: 13, group: 1 },
  municipio:        { weight: 8,  group: 1 },
  zone_id:          { weight: 6,  group: 1 },
  status:           { weight: 5,  group: 1 },

  // Importantes (Grupo 2)
  description_es:   { weight: 8,  group: 2 },
  bedrooms:         { weight: 7,  group: 2, overrides: { 'galpon_venta': 0, 'edificio_venta': 0, 'galpon_alquiler': 0, 'edificio_alquiler': 0 } },
  bathrooms:        { weight: 5,  group: 2 },
  condition:        { weight: 5,  group: 2 },
  furnished: {
    weight: 3, group: 2,
    overrides: {
      'habitacion_alquiler': 8,
      'anexo_alquiler':      7,
      'casa_vacacional':     10,
      'apartamento_vacacional': 10,
    }
  },
  lat:              { weight: 4,  group: 2 },  // lat+lng se evalúan juntos
  year_built:       { weight: 4,  group: 2 },
  price_currency:   { weight: 5,  group: 2 },
  area_built:       { weight: 7,  group: 2 },
  area_total:       { weight: 5,  group: 2 },

  // Complementarios (Grupo 3)
  description_en:   { weight: 3,  group: 3 },
  title_en:         { weight: 2,  group: 3 },
  half_bathrooms:   { weight: 2,  group: 3 },
  parking_spaces:   { weight: 3,  group: 3 },
  address_es:       { weight: 3,  group: 3 },
  gas_type:         { weight: 3,  group: 3 },
  kitchen_type: {
    weight: 3, group: 3,
    overrides: { 'habitacion_alquiler': 5, 'casa_vacacional': 5, 'apartamento_vacacional': 5 }
  },
  area_hectares: {
    weight: 2, group: 3,
    overrides: { 'hacienda_finca_venta': 9, 'hacienda_finca_alquiler': 7 }
  },

  // Si/No descriptivos (Grupo 4)
  has_water_tank:   { weight: 2,  group: 4 },
  has_hot_water:    { weight: 2,  group: 4 },
  has_generator:    { weight: 2,  group: 4, overrides: { 'casa_vacacional': 3, 'apartamento_vacacional': 3 } },
  has_internet:     { weight: 2,  group: 4 },
  has_ac:           { weight: 1,  group: 4 },
  has_heating:      { weight: 2,  group: 4 },
  has_elevator:     { weight: 2,  group: 4 },
  has_security_24h: { weight: 1,  group: 4 },
  has_electric_gate:{ weight: 1,  group: 4 },
  has_cctv:         { weight: 1,  group: 4 },
  has_electric_fence:{ weight: 1, group: 4 },
  has_intercom:     { weight: 1,  group: 4 },
  has_armored_door: { weight: 1,  group: 4 },
  has_own_water:    { weight: 2,  group: 4 },
  has_independent_entrance: { weight: 3, group: 4 },

  // Cohabitación (Grupo 5)
  bathroom_type:    { weight: 4,  group: 5 },
  cohabitation:     { weight: 4,  group: 5 },
  gender_policy:    { weight: 3,  group: 5 },
  occupants_count:  { weight: 3,  group: 5 },
  deposit_amount:   { weight: 3,  group: 5 },
  allows_pets:      { weight: 2,  group: 5 },
  allows_cooking:   { weight: 2,  group: 5 },
  host_housing_type: { weight: 4, group: 5 },

  // Excluidos del score (Grupo 0)
  featured:         { weight: 0, group: 0 },
  exclusive:        { weight: 0, group: 0 },
  price_negotiable: { weight: 0, group: 0 },
  price_usd:        { weight: 0, group: 0 },
  property_age:     { weight: 0, group: 0 },
  show_exact_location: { weight: 0, group: 0 },
  new_listing:      { weight: 0, group: 0 },
  price_reduced:    { weight: 0, group: 0 },
  listing_badge:    { weight: 0, group: 0 },
  parking_covered:  { weight: 0, group: 0 },
  maintenance_included: { weight: 0, group: 0 },
  deposit_required: { weight: 0, group: 0 },
  includes_breakfast: { weight: 0, group: 0 },
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
  maintenance_fee: "Monto de condominio",
  area_built: "Área de construcción",
  area_total: "Área total de terreno",
  area_hectares: "Área en hectáreas",
  bedrooms: "Número de habitaciones",
  bathrooms: "Número de baños",
  half_bathrooms: "Medios baños",
  parking_spaces: "Puestos de estacionamiento",
  floor_number: "Número de piso",
  floors: "Total de pisos",
  year_built: "Año de construcción",
  condition: "Estado de conservación",
  furnished: "Amoblado",
  municipio: "Municipio",
  zone_id: "Zona / Sector",
  address_es: "Dirección",
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
  video_url: "Video de la propiedad",
  virtual_tour_url: "Tour virtual 3D",
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
): { score: number; recommendations: { label: string; weight: number }[] } {
  let totalWeight = 0;
  let earnedWeight = 0;
  const recommendations: { label: string; weight: number }[] = [];

  const comboKey = `${type}_${op}`;

  // Recorrer todos los campos de configuración
  Object.entries(SCORE_CONFIG).forEach(([field, cfg]) => {
    if (cfg.group === 0) return; // Excluidos

    // Determinar si aplica el campo en esta combinación específica
    let applies = false;
    if (cfg.group === 5) {
      // Cohabitación: aplica para anexo/habitación en alquiler
      applies = ["habitacion", "anexo"].includes(type) && op === "alquiler";
    } else if (field === "area_hectares") {
      applies = type === "hacienda_finca";
    } else if (["topography", "land_use", "access_type", "current_use", "has_own_water"].includes(field)) {
      applies = ["terreno_lote", "hacienda_finca"].includes(type);
    } else if (field === "price_per_night" || field === "price_weekend" || field === "min_nights" || field === "max_guests") {
      applies = op === "vacacional";
    } else if (field === "price") {
      applies = op !== "vacacional";
    } else {
      // Para los demás campos, preguntar a la función de discriminación
      applies = checkAppliesFn(field);
    }

    if (!applies) return;

    const weight = cfg.overrides?.[comboKey] ?? cfg.weight;
    if (weight === 0) return; // Si el override lo excluye

    totalWeight += weight;

    // Caso especial para coordenadas de ubicación
    if (field === "lat") {
      const isLocFilled = isAnswered(data.lat) && isAnswered(data.lng);
      if (isLocFilled) {
        earnedWeight += weight;
      } else {
        recommendations.push({ label: FIELD_LABELS.lat || "Ubicación en mapa", weight });
      }
      return;
    }

    // Caso general de campos normales
    const val = data[field];
    if (isAnswered(val)) {
      earnedWeight += weight;
    } else {
      recommendations.push({ label: FIELD_LABELS[field] || field, weight });
    }
  });

  // Evaluar Imágenes (Fotos de la propiedad)
  totalWeight += 15;
  if (imagesLength > 0) {
    earnedWeight += 15;
  } else {
    recommendations.push({ label: FIELD_LABELS.images || "Fotos de la propiedad", weight: 15 });
  }

  const score = totalWeight === 0 ? 0 : Math.round((earnedWeight / totalWeight) * 100);

  // Convert raw weights to actual percentage contribution to the total score
  const mappedRecommendations = recommendations.map(r => ({
    label: r.label,
    weight: totalWeight === 0 ? 0 : Math.max(1, Math.round((r.weight / totalWeight) * 100))
  }));

  // Ordenar sugerencias por peso descendente
  mappedRecommendations.sort((a, b) => b.weight - a.weight);

  return { score, recommendations: mappedRecommendations };
}
