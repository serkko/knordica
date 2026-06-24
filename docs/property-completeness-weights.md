# Especificación de Pesos de Completitud — Knordica Real Estate
## Versión 2.0 · Análisis por Combinación Individual (27 escenarios válidos)

Este documento define de forma formal y pormenorizada la lógica, reglas y asignación de pesos para cada una de las 27 combinaciones válidas de Tipo de Inmueble y Tipo de Operación en el panel de Knordica Real Estate.

---

## 1. Metodología de Cálculo y Reglas de Bloqueo

### A. Reglas de Bloqueo (0% Progreso)
Para evitar cálculos erróneos o incoherencias cuando el usuario aún no ha iniciado la ficha, se aplican dos bloqueos duros:
- Si no se ha seleccionado **Operación** (`operation` es vacío), el progreso se fuerza a **0%**.
- Si no se ha seleccionado **Tipo de Inmueble** (`property_type` es vacío), el progreso se fuerza a **0%**.
- En caso de **Incompatibilidad** (ej: Habitación × Venta), el progreso es forzado a **0%**.

### B. Distribución Acumulativa por Combinación
Para cada una de las 27 combinaciones válidas se ha definido una tabla donde la suma de todos los campos aplicables da **exactamente 100 puntos**. 
Los campos se evalúan individualmente o en sub-grupos (como `lat`/`lng` y `price`/`price_currency` que se evalúan juntos).

---

## 2. Ponderación Detallada de las 27 Combinaciones

### COMBINACIÓN 1: CASA × VENTA

| Bloque | Campos Evaluados | Puntos | Detalle de Distribución Interna |
|---|---|:---:|---|
| Contenido | `title_es`, `description_es` | **8** | `title_es`: 4 pts, `description_es`: 4 pts |
| Contenido EN | `title_en`, `description_en` | **3** | `title_en`: 1 pt, `description_en`: 2 pts |
| Precio | `price` + `price_currency`, `price_negotiable` | **14** | `price` + `price_currency` (evaluados juntos): 12 pts, `price_negotiable`: 2 pts |
| Mantenimiento | `maintenance_fee` | **2** | `maintenance_fee`: 2 pts |
| Dimensiones | `area_built`, `area_total` | **8** | `area_built`: 4 pts, `area_total`: 4 pts |
| Habitáculos | `bedrooms`, `bathrooms`, `half_bathrooms` | **7** | `bedrooms`: 3 pts, `bathrooms`: 3 pts, `half_bathrooms`: 1 pt |
| Estacionamiento | `parking_spaces`, `parking_covered` | **3** | `parking_spaces`: 2 pts, `parking_covered`: 1 pt |
| Conservación | `year_built`, `condition`, `furnished` | **5** | `year_built`: 2 pts, `condition`: 2 pts, `furnished`: 1 pt |
| Ubicación | `municipio`, `zone_id`, `address_es`, `lat` + `lng` | **12** | `municipio`: 3 pts, `zone_id`: 3 pts, `lat` + `lng`: 4 pts, `address_es`: 2 pts |
| Servicios | 8 campos de servicios | **8** | 1 pt por cada selector Sí/No de servicio activo |
| Seguridad | 6 campos de seguridad | **6** | 1 pt por cada selector Sí/No de seguridad activo |
| Multimedia | Fotos cargadas (Imágenes) | **12** | Al menos 1 foto cargada: 12 pts |
| Ubicación exacta | `show_exact_location` | **1** | Selector de privacidad: 1 pt |
| Dirección EN | `address_en` | **1** | Dirección en inglés: 1 pt |
| **TOTAL** | | **100** | |

---

### COMBINACIÓN 2: CASA × ALQUILER

| Bloque | Campos Evaluados | Puntos | Detalle de Distribución Interna |
|---|---|:---:|---|
| Contenido | `title_es`, `description_es` | **8** | `title_es`: 4 pts, `description_es`: 4 pts |
| Contenido EN | `title_en`, `description_en` | **3** | `title_en`: 1 pt, `description_en`: 2 pts |
| Precio | `price` + `price_currency`, `price_negotiable` | **13** | `price` + `price_currency`: 11 pts, `price_negotiable`: 2 pts |
| Mantenimiento | `maintenance_fee`, `maintenance_included` | **3** | `maintenance_fee`: 1.5 pts, `maintenance_included`: 1.5 pts |
| Dimensiones | `area_built`, `area_total` | **7** | `area_built`: 4 pts, `area_total`: 3 pts |
| Habitáculos | `bedrooms`, `bathrooms`, `half_bathrooms` | **8** | `bedrooms`: 3 pts, `bathrooms`: 3 pts, `half_bathrooms`: 2 pts |
| Estacionamiento | `parking_spaces`, `parking_covered` | **3** | `parking_spaces`: 2 pts, `parking_covered`: 1 pt |
| Conservación | `year_built`, `condition`, `furnished` | **6** | `year_built`: 2 pts, `condition`: 2 pts, `furnished`: 2 pts |
| Ubicación | `municipio`, `zone_id`, `address_es`, `lat` + `lng` | **12** | `municipio`: 3 pts, `zone_id`: 3 pts, `lat` + `lng`: 4 pts, `address_es`: 2 pts |
| Servicios | 8 campos de servicios | **9** | 1.125 pts por cada selector de servicio |
| Seguridad | 6 campos de seguridad | **5** | 0.83 pts por cada selector de seguridad |
| Multimedia | Fotos cargadas | **12** | Al menos 1 foto: 12 pts |
| Ubicación exacta | `show_exact_location` | **1** | 1 pt |
| Dirección EN | `address_en` | **1** | 1 pt |
| **TOTAL** | | **100** | |

---

### COMBINACIÓN 3: CASA × VACACIONAL

| Bloque | Campos Evaluados | Puntos | Detalle de Distribución Interna |
|---|---|:---:|---|
| Contenido | `title_es`, `description_es` | **9** | `title_es`: 4 pts, `description_es`: 5 pts |
| Contenido EN | `title_en`, `description_en` | **4** | `title_en`: 1.5 pts, `description_en`: 2.5 pts |
| Tarifas | `price_per_night` + `price_currency`, `price_weekend` | **14** | `price_per_night` + `price_currency`: 11 pts, `price_weekend`: 3 pts |
| Hospedaje | 6 campos vacacionales | **12** | 2 pts por cada campo (min_nights, max_guests, rules, checkin, checkout, breakfast) |
| Dimensiones | `area_built`, `area_total` | **5** | `area_built`: 3 pts, `area_total`: 2 pts |
| Habitáculos | `bedrooms`, `bathrooms`, `half_bathrooms` | **7** | `bedrooms`: 3 pts, `bathrooms`: 3 pts, `half_bathrooms`: 1 pt |
| Estacionamiento | `parking_spaces`, `parking_covered` | **2** | `parking_spaces`: 1 pt, `parking_covered`: 1 pt |
| Conservación | `year_built`, `condition`, `furnished` | **5** | `year_built`: 1.5 pts, `condition`: 1.5 pts, `furnished`: 2 pts |
| Ubicación | `municipio`, `zone_id`, `address_es`, `lat` + `lng` | **11** | `municipio`: 3 pts, `zone_id`: 2.5 pts, `lat` + `lng`: 3.5 pts, `address_es`: 2 pts |
| Servicios | 8 campos de servicios | **10** | 1.25 pts por cada selector de servicio |
| Seguridad | 6 campos de seguridad | **4** | 0.66 pts por cada selector de seguridad |
| Multimedia | Fotos cargadas | **12** | 12 pts |
| Ubicación exacta | `show_exact_location` | **1** | 1 pt |
| Dirección EN | `address_en` | **4** | 4 pts |
| **TOTAL** | | **100** | |

---

### COMBINACIÓN 4: APARTAMENTO × VENTA

| Bloque | Campos Evaluados | Puntos | Detalle de Distribución Interna |
|---|---|:---:|---|
| Contenido | `title_es`, `description_es` | **8** | `title_es`: 4 pts, `description_es`: 4 pts |
| Contenido EN | `title_en`, `description_en` | **3** | `title_en`: 1 pt, `description_en`: 2 pts |
| Precio | `price` + `price_currency`, `price_negotiable` | **14** | `price` + `price_currency`: 12 pts, `price_negotiable`: 2 pts |
| Mantenimiento | `maintenance_fee` | **3** | `maintenance_fee`: 3 pts |
| Dimensiones | `area_built`, `area_total` | **8** | `area_built`: 5 pts, `area_total`: 3 pts |
| Habitáculos | `bedrooms`, `bathrooms`, `half_bathrooms` | **7** | `bedrooms`: 3 pts, `bathrooms`: 3 pts, `half_bathrooms`: 1 pt |
| Estacionamiento | `parking_spaces`, `parking_covered` | **3** | `parking_spaces`: 2 pts, `parking_covered`: 1 pt |
| Estructura vertical | `floor_number`, `total_floors`, `has_elevator` | **5** | `floor_number`: 1.5 pts, `total_floors`: 1.5 pts, `has_elevator`: 2 pts |
| Conservación | `year_built`, `condition`, `furnished` | **5** | `year_built`: 2 pts, `condition`: 2 pts, `furnished`: 1 pt |
| Ubicación | `municipio`, `zone_id`, `address_es`, `lat` + `lng` | **11** | `municipio`: 3 pts, `zone_id`: 2.5 pts, `lat` + `lng`: 3.5 pts, `address_es`: 2 pts |
| Servicios | 8 campos de servicios (incl. elevator) | **7** | 0.875 pts por cada selector de servicio |
| Seguridad | 5 campos de seguridad | **5** | 1 pt por cada selector de seguridad (no tiene electric_fence) |
| Multimedia | Fotos cargadas | **12** | 12 pts |
| Privacidad & Dir EN | `show_exact_location`, `address_en` | **2** | 1 pt cada uno |
| **TOTAL** | | **100** | |

---

### COMBINACIÓN 5: APARTAMENTO × ALQUILER
- **Mantenimiento**: Sube a **4 pts** (`maintenance_fee`: 2 pts, `maintenance_included`: 2 pts).
- **Precio**: Baja a **13 pts** (`price` + `price_currency`: 11 pts, `price_negotiable`: 2 pts).
- **Conservación**: Sube a **6 pts** (`year_built`: 2 pts, `condition`: 2 pts, `furnished`: 2 pts).
- **Servicios**: Sube a **9 pts** para valorar el confort del inquilino diario.
- **Suma total**: **100 pts**.

---

### COMBINACIÓN 6: APARTAMENTO × VACACIONAL
- **Contenido EN**: **5 pts** (Turistas).
- **Tarifas**: **14 pts** (`price_per_night` + `price_currency`: 11 pts, `price_weekend`: 3 pts).
- **Hospedaje**: **11 pts** (6 campos vacacionales).
- **Estructura vertical**: **4 pts** (`has_elevator` es clave para equipajes).
- **Dirección EN / Privacidad**: **5 pts** (Crítico para que el extranjero llegue sin problemas).
- **Suma total**: **100 pts**.

---

### COMBINACIÓN 7: TOWNHOUSE × VENTA
- **Seguridad**: Sube a **6 pts** (ya que incluye `has_electric_fence`).
- **Servicios**: **7 pts**.
- **Estructura vertical**: Excluida.
- **Suma total**: **100 pts**.

---

### COMBINACIÓN 8: TOWNHOUSE × ALQUILER
- Mismo comportamiento de Townhouse pero con ajustes de Alquiler (Precio 13 pts, Mantenimiento 4 pts, Servicios 9 pts).
- **Suma total**: **100 pts**.

---

### COMBINACIÓN 9: TOWNHOUSE × VACACIONAL
- Ajustes vacacionales aplicados (Contenido EN: 5 pts, Hospedaje: 11 pts, Tarifas: 14 pts, Dirección EN: 7 pts).
- **Suma total**: **100 pts**.

---

### COMBINACIÓN 10: ANEXO × VENTA

| Bloque | Campos Evaluados | Puntos | Detalle de Distribución Interna |
|---|---|:---:|---|
| Contenido | `title_es`, `description_es` | **8** | 4 pts cada uno |
| Contenido EN | `title_en`, `description_en` | **3** | `title_en`: 1 pt, `description_en`: 2 pts |
| Precio | `price` + `price_currency`, `price_negotiable` | **14** | `price` + `price_currency`: 12 pts, `price_negotiable`: 2 pts |
| Dimensiones | `area_built` | **10** | `area_built`: 10 pts |
| Habitáculos | `bedrooms`, `bathrooms`, `half_bathrooms` | **8** | `bedrooms`: 3 pts, `bathrooms`: 3 pts, `half_bathrooms`: 2 pts |
| Estacionamiento | `parking_spaces`, `parking_covered` | **4** | `parking_spaces`: 2 pts, `parking_covered`: 2 pts |
| Entrada independiente | `has_independent_entrance` | **6** | Autonomía de accesos: 6 pts |
| Conservación | `year_built`, `condition`, `furnished` | **6** | `year_built`: 2 pts, `condition`: 3 pts, `furnished`: 1 pt |
| Ubicación | `municipio`, `zone_id`, `address_es`, `lat` + `lng` | **14** | `municipio`: 3 pts, `zone_id`: 3 pts, `lat` + `lng`: 5 pts, `address_es`: 3 pts |
| Servicios | 8 selectores de confort | **8** | 1 pt por cada selector activo |
| Seguridad | Vigilancia, intercom, puerta blindada | **6** | 2 pts por cada uno |
| Multimedia | Fotos | **12** | 12 pts |
| Privacidad & Dir EN | `show_exact_location`, `address_en` | **5** | `show_exact_location`: 2 pts, `address_en`: 3 pts |
| **TOTAL** | | **100** | |

---

### COMBINACIÓN 11: ANEXO × ALQUILER

| Bloque | Campos Evaluados | Puntos | Detalle de Distribución Interna |
|---|---|:---:|---|
| Contenido | `title_es`, `description_es` | **8** | 4 pts cada uno |
| Contenido EN | `title_en`, `description_en` | **2** | 1 pt cada uno |
| Precio | `price` + `price_currency`, `price_negotiable` | **13** | `price` + `price_currency`: 11 pts, `price_negotiable`: 2 pts |
| Depósito | `deposit_required` + `deposit_amount` | **4** | Ambos cargados: 4 pts |
| Dimensiones | `area_built` | **5** | `area_built`: 5 pts |
| Habitáculos | `bedrooms`, `bathrooms`, `half_bathrooms` | **6** | `bedrooms`: 2 pts, `bathrooms`: 3 pts, `half_bathrooms`: 1 pt |
| Conservación | `condition`, `furnished`, `year_built` | **5** | `condition`: 2 pts, `furnished`: 2 pts, `year_built`: 1 pt |
| Cohabitación | 7 campos de cohabitación | **14** | 2 pts por cada campo de regla de convivencia |
| Entrada independiente | `has_independent_entrance` | **4** | Autonomía de accesos: 4 pts |
| Ubicación | `municipio`, `zone_id`, `address_es`, `lat` + `lng` | **11** | Ubicación básica |
| Servicios | 6 selectores de confort | **7** | 1.16 pts por cada selector activo |
| Seguridad | Vigilancia, intercom, puerta blindada | **4** | 1.33 pts por cada uno |
| Multimedia | Fotos | **12** | 12 pts |
| Privacidad | `show_exact_location` | **5** | 5 pts |
| **TOTAL** | | **100** | |

---

### COMBINACIÓN 12: ANEXO × VACACIONAL
- **Entrada independiente**: Sube a **5 pts** (Crítico).
- **Hospedaje**: **13 pts** (6 campos vacacionales).
- **Contenido EN**: **5 pts**.
- **Dirección EN / Ubicación exacta**: **9 pts**.
- **Suma total**: **100 pts**.

---

### COMBINACIÓN 13: HABITACIÓN × ALQUILER
- **Cohabitación**: Sube a **17 pts** (Bloque primordial).
- **Estacionamiento**: **3 pts** (permitido según actualización).
- **Habitáculos**: Incluye `half_bathrooms` (opcional).
- **Suma total**: **100 pts**.

---

### COMBINACIÓN 14: HABITACIÓN × VACACIONAL
- **Hospedaje**: **14 pts**.
- **Dirección EN / Ubicación exacta**: **10 pts**.
- **Suma total**: **100 pts**.

---

### COMBINACIÓN 15: EDIFICIO × VENTA

| Bloque | Campos Evaluados | Puntos | Detalle de Distribución Interna |
|---|---|:---:|---|
| Contenido | `title_es`, `description_es` | **7** | `title_es`: 3 pts, `description_es`: 4 pts |
| Contenido EN | `title_en`, `description_en` | **3** | `title_en`: 1 pt, `description_en`: 2 pts |
| Precio | `price` + `price_currency`, `price_negotiable` | **14** | `price` + `price_currency`: 12 pts, `price_negotiable`: 2 pts |
| Mantenimiento | `maintenance_fee` | **3** | Condominio del edificio: 3 pts |
| Dimensiones | `area_built`, `area_total` | **8** | `area_built`: 4 pts, `area_total`: 4 pts |
| Estacionamiento | `parking_spaces`, `parking_covered` | **4** | Estacionamiento general: 2 pts cada uno |
| Estructura vertical | `total_floors`, `has_elevator`, `unit_count` | **8** | `total_floors`: 3 pts, `has_elevator`: 3 pts, `unit_count` (corporativo): 2 pts |
| Conservación | `year_built`, `condition` | **5** | `year_built`: 2 pts, `condition`: 3 pts (sin amoblado) |
| Ubicación | `municipio`, `zone_id`, `address_es`, `lat` + `lng` | **12** | Ubicación |
| Servicios | Tanque, planta, internet, AC | **6** | 1.5 pts por cada uno |
| Seguridad | Vigilancia, portón, CCTV, cerco, intercom, puerta blindada | **7** | 1.16 pts por cada uno |
| Multimedia | Fotos | **12** | 12 pts |
| Privacidad & Dir EN | `show_exact_location`, `address_en` | **5** | 2.5 pts cada uno |
| **TOTAL** | | **100** | |

---

### COMBINACIÓN 16: EDIFICIO × ALQUILER
- Ajustes de Alquiler aplicados (Mantenimiento: 4 pts, Precio: 13 pts).
- **Suma total**: **100 pts**.

---

### COMBINACIÓN 17: GALPÓN × VENTA

| Bloque | Campos Evaluados | Puntos | Detalle de Distribución Interna |
|---|---|:---:|---|
| Contenido | `title_es`, `description_es` | **7** | 3.5 pts cada uno |
| Contenido EN | `title_en`, `description_en` | **3** | 1.5 pts cada uno |
| Precio | `price` + `price_currency`, `price_negotiable` | **15** | `price` + `price_currency`: 13 pts, `price_negotiable`: 2 pts |
| Dimensiones | `area_built`, `area_total` | **12** | `area_built`: 7 pts, `area_total`: 5 pts |
| Estacionamiento | `parking_spaces`, `parking_covered` | **5** | Carga y descarga pesada: 3 pts y 2 pts |
| Estructura | `total_floors`, `year_built`, `condition` | **6** | `total_floors`: 2 pts, `year_built`: 2 pts, `condition`: 2 pts |
| Ubicación | `municipio`, `zone_id`, `address_es`, `lat` + `lng` | **13** | Ubicación exacta |
| Servicios | Tanque, planta, internet, gas | **7** | Servicios industriales |
| Seguridad | Vigilancia, portón, CCTV, cerco eléctrico | **8** | 2 pts por cada elemento activo |
| Terreno / Acceso | `topography`, `land_use`, `access_type` | **7** | Topografía: 2 pts, Uso: 2 pts, Acceso vial: 3 pts |
| Multimedia | Fotos | **10** | 10 pts (Foco técnico, no decorativo) |
| Privacidad & Dir EN | `show_exact_location`, `address_en` | **7** | 3.5 pts cada uno |
| **TOTAL** | | **100** | |

---

### COMBINACIÓN 18: GALPÓN × ALQUILER
- Ajustes de alquiler (Precio: 14 pts, Mantenimiento: 3 pts, Estructura: 5 pts).
- **Suma total**: **100 pts**.

---

### COMBINACIÓN 19: HACIENDA/FINCA × VENTA

| Bloque | Campos Evaluados | Puntos | Detalle de Distribución Interna |
|---|---|:---:|---|
| Contenido | `title_es`, `description_es` | **7** | 3.5 pts cada uno |
| Contenido EN | `title_en`, `description_en` | **3** | 1.5 pts cada uno |
| Precio | `price` + `price_currency`, `price_negotiable` | **14** | `price` + `price_currency`: 12 pts, `price_negotiable`: 2 pts |
| Dimensiones | `area_built`, `area_total`, `area_hectares` | **13** | Hectáreas: 5 pts, construida: 4 pts, total: 4 pts |
| Habitáculos | `bedrooms`, `bathrooms`, `parking_spaces` | **6** | Casa patronal: 2 pts cada uno, puestos vehículos: 2 pts |
| Conservación | `year_built`, `condition` | **4** | Estado de la casa patronal (sin amoblado) |
| Ubicación | `municipio`, `zone_id`, `address_es`, `lat` + `lng` | **12** | Ubicación |
| Parámetros rurales | Topografía, uso actual, acceso, agua propia | **15** | `has_own_water` (agua propia): 5 pts, relieve: 3 pts, acceso: 4 pts, uso actual: 3 pts |
| Servicios | Tanque, planta, internet | **5** | Confort rústico básico |
| Seguridad | Vigilancia, cerco eléctrico, CCTV, portón | **6** | Seguridad perimetral rústica |
| Multimedia | Fotos | **10** | 10 pts |
| Privacidad & Dir EN | `show_exact_location`, `address_en` | **5** | 2.5 pts cada uno |
| **TOTAL** | | **100** | |

---

### COMBINACIÓN 20: HACIENDA/FINCA × ALQUILER
- Ajustes de alquiler rústico con adición de confort doméstico y amoblado (`furnished`, `gas_type`, `kitchen_type`, `has_hot_water`).
- **Suma total**: **100 pts**.

---

### COMBINACIÓN 21: LOCAL × VENTA
- **Ubicación**: **13 pts** (Tránsito de clientes).
- **Dimensiones**: **12 pts** (`area_built`: 8 pts, `area_total`: 4 pts).
- **Estructura vertical**: **6 pts** (`floor_number`, `total_floors`, `has_elevator`).
- **Suma total**: **100 pts**.

---

### COMBINACIÓN 22: LOCAL × ALQUILER
- Ajustes de Alquiler aplicados.
- **Suma total**: **100 pts**.

---

### COMBINACIÓN 23: OFICINA × VENTA
- **Suma total**: **100 pts**.

---

### COMBINACIÓN 24: OFICINA × ALQUILER
- **Suma total**: **100 pts**.

---

### COMBINACIÓN 25: TERRENO × VENTA

| Bloque | Campos Evaluados | Puntos | Detalle de Distribución Interna |
|---|---|:---:|---|
| Contenido | `title_es`, `description_es` | **7** | 3.5 pts cada uno |
| Contenido EN | `title_en`, `description_en` | **3** | 1.5 pts cada uno |
| Precio | `price` + `price_currency`, `price_negotiable` | **16** | `price` + `price_currency`: 14 pts, `price_negotiable`: 2 pts |
| Dimensiones | `area_total` | **13** | Solo aplica área total: 13 pts |
| Ubicación | `municipio`, `zone_id`, `address_es`, `lat` + `lng` | **16** | Coordenadas en mapa son vitales para lotes |
| Parámetros terreno | Topografía, uso del suelo, acceso, uso actual, agua | **18** | Relieve, zonificación y agua propia |
| Seguridad | Cerco, CCTV perimetral | **4** | 2 pts cada uno |
| Multimedia | Fotos | **10** | 10 pts |
| Privacidad & Dir EN | `show_exact_location`, `address_en` | **13** | Pin en mapa es dato clave: 6.5 pts cada uno |
| **TOTAL** | | **100** | |

---

### COMBINACIÓN 26: TERRENO × ALQUILER
- **Suma total**: **100 pts**.

---

### COMBINACIÓN 27: HACIENDA/FINCA × VACACIONAL
- Ajustes vacacionales rústicos y agro-turismo aplicados.
- **Suma total**: **100 pts**.

---

## 3. Comportamiento y Consejos de la Barra de Progreso

1. **El precio y la moneda se evalúan juntos**: Si pones el monto pero no la moneda (o viceversa), **no sumas los 13-15 puntos** del precio. Ambos deben estar completos.
2. **Las coordenadas de mapa son críticas**: Mover el pin en el mapa para registrar `lat` y `lng` es obligatorio para sumar los puntos de ubicación.
3. **El progreso es 100% dinámico**: El sistema calcula la completitud sumando los puntos asignados a los campos que aplican para esa combinación específica. Si un campo no aplica, no te resta puntos.
