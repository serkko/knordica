/**
 * Utilidades para la discriminación lógica de campos y validación de consistencia
 * en el formulario de propiedades de Knordica Real Estate.
 */

export const checkFieldApplies = (fieldOrGroup: string, type: string, op: string): boolean => {
  switch (fieldOrGroup) {
    case "vacational_section":
      return op === "vacacional";
    case "bedrooms":
      return !["terreno_lote", "local", "oficina", "galpon", "edificio"].includes(type);
    case "bathrooms":
    case "half_bathrooms":
    case "year_built":
    case "condition":
      return type !== "terreno_lote";
    case "furnished":
      return !["terreno_lote", "galpon", "edificio"].includes(type);
    case "has_elevator":
    case "elevator":
      return ["apartamento", "edificio", "local", "oficina"].includes(type);
    case "parking_spaces":
    case "parking":
      return !["anexo", "terreno_lote"].includes(type);

    case "floors":
      return ["apartamento", "oficina", "local", "edificio"].includes(type);
    case "maintenance":
      return op !== "vacacional" && (
        ["apartamento", "casa", "townhouse", "habitacion"].includes(type) ||
        (type === "edificio" && op === "alquiler")
      );
    case "area_hectares":
      return ["hacienda_finca", "terreno_lote"].includes(type);
    case "shared_section":
      return ["habitacion", "anexo"].includes(type) && op === "alquiler";
    case "has_independent_entrance":
      return ["habitacion", "anexo"].includes(type);
    case "land_section":
      return ["terreno_lote", "hacienda_finca"].includes(type);
    case "services_section":
    case "security_section":
      return type !== "terreno_lote";
    case "has_electric_fence":
      return ["casa", "townhouse", "edificio", "galpon", "hacienda_finca", "terreno_lote"].includes(type);
    case "floor_number":
      return ["apartamento", "oficina", "local"].includes(type);
    default:
      return true;
  }
};

export const isCombinationInconsistent = (type: string, op: string): boolean => {
  return (
    (op === "venta" && type === "habitacion") ||
    (op === "vacacional" && ["galpon", "local", "oficina", "terreno_lote", "edificio"].includes(type))
  );
};
