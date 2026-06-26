# Reporte de Mapeo: Formulario Completo vs. Base de Datos (Supabase Schema V2)

Este documento detalla la correspondencia entre los campos del estado del formulario (`FormData` / `INIT` en Next.js) y las columnas reales en la base de datos de Supabase (tablas `properties`, `property_translations`, `property_images` y `property_videos`), analizando su tipo, restricciones, y consistencia lógica.

---

## 1. Clasificación y Gamificación

| Campo Formulario | Columna DB (`properties`) | Tipo de Datos | Nullable | Valor por Defecto / Restricciones (CHECK) | Notas / Observaciones |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `operation` | `operation` | `TEXT` | No | `CHECK (operation IN ('venta', 'alquiler', 'vacacional'))` | Consistente. |
| `property_type` | `property_type` | `TEXT` | No | `CHECK (property_type IN ('casa', 'apartamento', 'townhouse', 'anexo', 'edificio', 'galpon', 'habitacion', 'hacienda_finca', 'local', 'oficina', 'terreno_lote'))` | Consistente. |
| `status` | `status` | `TEXT` | Sí | `DEFAULT 'activa' CHECK (status IN ('activa', 'vendida', 'alquilada', 'reservada', 'cerrada'))` | Consistente. El valor 'inactiva' de V1 se migró a 'cerrada'. |
| `listing_badge` | `listing_badge` | `TEXT` | Sí | `DEFAULT 'basico'` | Empleado para insignias comerciales ("oportunidad", "exclusivo"). |
| `completeness_score`| `completeness_score` | `INTEGER` | Sí | `DEFAULT 0` | Mide el porcentaje de completitud del registro. |
| `featured` | `featured` | `BOOLEAN` | Sí | `DEFAULT false` | Flag destacado. |
| `exclusive` | `exclusive` | `BOOLEAN` | Sí | `DEFAULT false` | Flag exclusiva. |
| `new_listing` | `new_listing` | `BOOLEAN` | Sí | `DEFAULT false` | Flag listado nuevo. |
| `price_reduced` | `price_reduced` | `BOOLEAN` | Sí | `DEFAULT false` | Flag precio reducido. |

---

## 2. Contenido (Multi-idioma)

| Campo Formulario | Columna DB (`property_translations`) | Tipo de Datos | Nullable | Relación / Clave Única | Notas / Observaciones |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `title_es` | `title` (donde `locale = 'es'`) | `TEXT` | No | `UNIQUE(property_id, locale)` | Título principal de la publicación. |
| `description_es`| `description` (donde `locale = 'es'`) | `TEXT` | Sí | `UNIQUE(property_id, locale)` | Descripción detallada en español. |
| `title_en` | `title` (donde `locale = 'en'`) | `TEXT` | No | `UNIQUE(property_id, locale)` | Si se deja vacío, el formulario replica el español. |
| `description_en`| `description` (donde `locale = 'en'`) | `TEXT` | Sí | `UNIQUE(property_id, locale)` | Descripción detallada en inglés. |

---

## 3. Precio y Condiciones Financieras

| Campo Formulario | Columna DB (`properties`) | Tipo de Datos | Nullable | Valor por Defecto / Notas |
| :--- | :--- | :--- | :--- | :--- |
| `price` | `price` | `DECIMAL(14,2)`| No | Precio base (venta o canon de arrendamiento). |
| `price_currency` | `price_currency` | `TEXT` | Sí | `DEFAULT 'USD'` | Moneda de cobro base. |
| `price_negotiable` | `price_negotiable` | `BOOLEAN` | Sí | `DEFAULT false` | Indica si el precio es flexible. |
| `price_usd` | `price_usd` | `DECIMAL(14,2)`| Sí | **Autocalculado:** No es de entrada en el formulario. Se calcula automáticamente en base al precio y tipo de cambio. |
| `maintenance_fee` | `maintenance_fee` | `DECIMAL(14,2)`| Sí | Cuota de mantenimiento/condominio mensual. |
| `maintenance_included`| `maintenance_included` | `BOOLEAN` | Sí | `DEFAULT false`. **Solo Alquiler:** Indica si el condominio está incluido en el canon de alquiler. Excluir siempre en venta y vacacional. |


### Condicionales Vacacionales (`operation = 'vacacional'`)
| Campo Formulario | Columna DB (`properties`) | Tipo de Datos | Nullable | Valor por Defecto / Notas |
| :--- | :--- | :--- | :--- | :--- |
| `price_per_night` | `price_per_night` | `DECIMAL(10,2)`| Sí | Tarifa estándar por noche. |
| `price_weekend` | `price_weekend` | `DECIMAL(10,2)`| Sí | Tarifa de fin de semana por noche. |
| `min_nights` | `min_nights` | `INTEGER` | Sí | `DEFAULT 1` | Mínimo de noches requeridas para reservar. |
| `max_guests` | `max_guests` | `INTEGER` | Sí | Aforo máximo de huéspedes permitido. |
| `checkin_time` | `checkin_time` | `TEXT` | Sí | `DEFAULT '14:00'` | Hora de entrada acordada. |
| `checkout_time` | `checkout_time` | `TEXT` | Sí | `DEFAULT '11:00'` | Hora de salida límite. |
| `house_rules` | `house_rules` | `TEXT` | Sí | Reglas del inmueble. |
| `includes_breakfast`| `includes_breakfast` | `BOOLEAN` | Sí | `DEFAULT false` | Beneficios del hospedaje. |

### Condicionales Compartido / Habitación / Anexo
| Campo Formulario | Columna DB (`properties`) | Tipo de Datos | Nullable | Valor por Defecto / Notas |
| :--- | :--- | :--- | :--- | :--- |
| `deposit_required` | `deposit_required` | `BOOLEAN` | Sí | `DEFAULT false` | Indica si se pide fianza de garantía. |
| `deposit_amount` | `deposit_amount` | `DECIMAL(10,2)`| Sí | Monto total del depósito de garantía. |

---

## 4. Dimensiones, Habitáculos y Estructura

| Campo Formulario | Columna DB (`properties`) | Tipo de Datos | Nullable | Notas / Análisis de Consistencia |
| :--- | :--- | :--- | :--- | :--- |
| `area_built` | `area_built` | `DECIMAL(10,2)`| Sí | m² de construcción techada. |
| `area_total` | `area_total` | `DECIMAL(10,2)`| Sí | m² de terreno total / parcela. |
| `area_hectares` | `area_hectares` | `DECIMAL(10,2)`| Sí | Para fincas, hatos y haciendas (en hectáreas). |
| `bedrooms` | `bedrooms` | `INTEGER` | Sí | Número de dormitorios. |
| `bathrooms` | `bathrooms` | `INTEGER` | Sí | Baños completos. |
| `half_bathrooms` | `half_bathrooms` | `INTEGER` | Sí | Medios baños (visitas). |
| `parking_spaces` | `parking_spaces` | `INTEGER` | Sí | Puestos de estacionamiento. |
| `parking_covered` | `parking_covered` | `BOOLEAN` | Sí | `DEFAULT false` (si están techados). |
| `floors` | `total_floors` | `INTEGER` | Sí | **Nota de Mapeo Nominal:** En el formulario se llama `floors` pero se guarda en `total_floors`. |
| `floor_number` | `floor_number` | `INTEGER` | Sí | Piso en el que se ubica la unidad (apartamentos). |
| `year_built` | `year_built` | `INTEGER` | Sí | **Captura Directa:** Año calendario de construcción (ej: `2015`). Capturado en el formulario y guardado directamente en la DB. |
| `property_age` | `property_age` | `INTEGER` | Sí | **Derivación Automática:** Edad en años transcurridos. Derivada dinámicamente al guardar (`Año Actual - year_built`), NO es un campo de entrada. Almacenada para búsquedas y optimizaciones del catálogo. |
| `unit_count` | `unit_count` | `INTEGER` | Sí | **Campo Corporativo Pendiente:** Planificado para `property_type = 'edificio'` (número de unidades en el edificio). |
| `condition` | `condition` | `TEXT` | Sí | Conservación: 'nuevo', 'remodelado', 'buen_estado', 'a_remodelar'. |
| `furnished` | `furnished` | `TEXT` | Sí | `DEFAULT 'sin_muebles'`. Opciones: 'sin_muebles', 'parcial', 'completo'. |

---

## 5. Ubicación

| Campo Formulario | Columna DB (`properties`) | Tipo de Datos | Nullable | Valor por Defecto / Notas |
| :--- | :--- | :--- | :--- | :--- |
| `municipio` | `municipio` | `TEXT` | Sí | 'libertador', 'campo_elias', 'santos_marquina', 'sucre', 'rangel'. |
| `zone_id` | `zone_id` | `UUID` | Sí | `FOREIGN KEY` referenciando `zones(id)`. |
| `address_es` | `address_es` | `TEXT` | Sí | Dirección pública detallada en español. |
| `address_en` | `address_en` | `TEXT` | Sí | Dirección detallada en inglés. |
| `lat` | `lat` | `DECIMAL(10,8)`| Sí | Latitud geográfica exacta. |
| `lng` | `lng` | `DECIMAL(11,8)`| Sí | Longitud geográfica exacta. |
| `show_exact_location`| `show_exact_location` | `BOOLEAN` | Sí | `DEFAULT true`. Oculta el pin exacto al público si se desmarca. |

---

## 6. Servicios y Confort

| Campo Formulario | Columna DB (`properties`) | Tipo de Datos | Nullable | Valor por Defecto / Notas |
| :--- | :--- | :--- | :--- | :--- |
| `has_water_tank` | `has_water_tank` | `BOOLEAN` | Sí | `DEFAULT false` (Tanque de agua). |
| `has_hot_water` | `has_hot_water` | `BOOLEAN` | Sí | `DEFAULT false` (Calentador operativo). |
| `has_generator` | `has_generator` | `BOOLEAN` | Sí | `DEFAULT false` (Planta eléctrica). |
| `gas_type` | `gas_type` | `TEXT` | Sí | Opciones: 'central', 'bombonas', 'ninguno'. |
| `has_internet` | `has_internet` | `BOOLEAN` | Sí | `DEFAULT false` (Fibra óptica/Wifi). |
| `has_ac` | `has_ac` | `BOOLEAN` | Sí | `DEFAULT false` (Aire acondicionado). |
| `has_heating` | `has_heating` | `BOOLEAN` | Sí | `DEFAULT false` (Calefacción). |
| `has_elevator` | `has_elevator` | `BOOLEAN` | Sí | `DEFAULT false` (Ascensor operativo). |
| `kitchen_type` | `kitchen_type` | `TEXT` | Sí | Opciones: 'electrica', 'gas', 'ninguna'. |

---

## 7. Seguridad Física

| Campo Formulario | Columna DB (`properties`) | Tipo de Datos | Nullable | Valor por Defecto / Notas |
| :--- | :--- | :--- | :--- | :--- |
| `has_security_24h` | `has_security_24h` | `BOOLEAN` | Sí | `DEFAULT false` (Vigilancia física). |
| `has_electric_gate`| `has_electric_gate`| `BOOLEAN` | Sí | `DEFAULT false` (Acceso vehicular automatizado). |
| `has_cctv` | `has_cctv` | `BOOLEAN` | Sí | `DEFAULT false` (Cámaras de vigilancia). |
| `has_electric_fence`| `has_electric_fence`| `BOOLEAN` | Sí | `DEFAULT false` (Cerco eléctrico operativo). |
| `has_intercom` | `has_intercom` | `BOOLEAN` | Sí | `DEFAULT false` (Intercomunicador). |
| `has_armored_door` | `has_armored_door` | `BOOLEAN` | Sí | `DEFAULT false` (Puerta blindada). |

---

## 8. Parámetros de Cohabitación (Habitación/Anexo)

| Campo Formulario | Columna DB (`properties`) | Tipo de Datos | Nullable | Valor por Defecto / Notas |
| :--- | :--- | :--- | :--- | :--- |
| `bathroom_type` | `bathroom_type` | `TEXT` | Sí | Opciones: 'privado', 'compartido'. |
| `host_housing_type`| `host_housing_type`| `TEXT` | Sí | Tipo de estructura: 'casa', 'apartamento'. |
| `cohabitation` | `cohabitation` | `TEXT` | Sí | Opciones: 'solo_inquilinos', 'con_propietario'. |
| `occupants_count` | `occupants_count` | `INTEGER` | Sí | Cantidad de personas que habitan el espacio. |
| `gender_policy` | `gender_policy` | `TEXT` | Sí | Opciones: 'mixto', 'solo_mujeres', 'solo_hombres'. |
| `allows_pets` | `allows_pets` | `BOOLEAN` | Sí | `DEFAULT false` (Permiso para mascotas). |
| `allows_cooking` | `allows_cooking` | `BOOLEAN` | Sí | `DEFAULT true` (Uso de cocina). |
| `has_independent_entrance`| `has_independent_entrance`| `BOOLEAN` | Sí | `DEFAULT false` (Entrada privada a la unidad). |

---

## 9. Terrenos y Fincas

| Campo Formulario | Columna DB (`properties`) | Tipo de Datos | Nullable | Valor por Defecto / Notas |
| :--- | :--- | :--- | :--- | :--- |
| `topography` | `topography` | `TEXT` | Sí | Opciones: 'plano', 'inclinado', 'irregular'. |
| `land_use` | `land_use` | `TEXT` | Sí | Opciones: 'residencial', 'comercial', 'industrial', 'agricola'. |
| `access_type` | `access_type` | `TEXT` | Sí | Opciones: 'asfalto', 'tierra', 'concreto'. |
| `current_use` | `current_use` | `TEXT` | Sí | Uso actual (ej. siembra, ganadería, desocupado). |
| `has_own_water` | `has_own_water` | `BOOLEAN` | Sí | `DEFAULT false` (Tanque/Pozo propio). |

---

## 10. Multimedia y Control de Archivos

### A. Imágenes de Propiedades (`property_images`)
Esta tabla almacena las fotografías de la propiedad subidas por los agentes y gestiona el orden de visualización y la portada principal del listado.

| Campo Formulario | Columna DB (`property_images`) | Tipo de Datos | Nullable | Valor por Defecto / Notas |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `id` | `UUID` | No | Generado automáticamente. |
| `property_id` | `property_id` | `UUID` | No | Clave foránea referenciando `properties(id)` (`ON DELETE CASCADE`). |
| `url` | `url` | `TEXT` | No | Enlace público del archivo en el bucket `property-images` de Supabase Storage. |
| `is_cover` | `is_cover` | `BOOLEAN` | No | `DEFAULT false`. Indica si la imagen es la portada del listado (solo una por propiedad puede ser `true`). |
| `sort_order` | `sort_order` | `INTEGER` | No | `DEFAULT 0`. Índice de ordenación para la galería. Controlado por drag-and-drop en la UI. |
| `alt_es` / `alt_en` | `alt_es` / `alt_en` | `TEXT` | Sí | Texto alternativo para SEO y accesibilidad (por defecto se usa el título del inmueble). |

#### Flujo de Carga y Sincronización de Imágenes:
1. **Selección en UI:** El usuario selecciona archivos mediante la zona de arrastre (`ImageDropzone`). Se crean objetos en el estado local con URLs temporales (`URL.createObjectURL(file)`) para la previsualización inmediata.
2. **Reordenación y Portada:** El usuario puede reordenar las fotos mediante `Reorder.Group` (Framer Motion) y marcar una foto como favorita/portada (lo que establece `isCover: true` y remueve el flag de las demás).
3. **Persistencia (Guardado):**
   - **Imágenes Eliminadas:** Las imágenes eliminadas en la UI que ya existían en la base de datos se acumulan en un array `removedImages` y se borran en lote de Supabase mediante `.delete().in("id", removedImages)`.
   - **Nuevas Imágenes (Carga al Storage):** Cada archivo nuevo se sube al bucket de Supabase `property-images` bajo la ruta estructurada: `properties/${propertyId}/${Date.now()}-${index}.${extension}`. Al finalizar con éxito, se genera su URL pública y se inserta el registro en la tabla `property_images` con su respectivo orden.
   - **Imágenes Existentes (Actualización de Orden):** Las imágenes que ya existían actualizan su orden (`sort_order`) y su flag de portada (`is_cover`) en base a su nueva posición en el array en el momento del guardado.

---

## 11. Videos de Propiedades (`property_videos`)
Esta tabla permite adjuntar múltiples videos de recorridos virtuales o tomas aéreas a la propiedad.

| Campo Formulario | Columna DB (`property_videos`) | Tipo de Datos | Nullable | Valor por Defecto / Notas |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `id` | `UUID` | No | Generado automáticamente. |
| `property_id` | `property_id` | `UUID` | No | Clave foránea referenciando `properties(id)` (`ON DELETE CASCADE`). |
| `url` | `url` | `TEXT` | No | URL del video (enlace de YouTube, Vimeo, o archivo directo). |
| `title_es` / `title_en` | `title_es` / `title_en` | `TEXT` | Sí | Título descriptivo del video en español e inglés. |
| `sort_order` | `sort_order` | `INTEGER` | No | `DEFAULT 0`. Orden de reproducción si hay varios. |

---

## 12. Consistencia y Resoluciones de Diseño

1. **Uso de `year_built` y `property_age` en coexistencia:**
   - **Decisión:** Para garantizar la mejor experiencia, el formulario captura y edita el **Año de construcción** (`year_built`) en lugar de pedir la edad relativa. Al guardar, el sistema calcula de manera transparente `property_age = Año Actual - year_built` y guarda ambos valores en la base de datos.
   - **Beneficios:** 
     - **Intuición:** El agente no tiene que calcular la edad mentalmente.
     - **Durabilidad:** La base de datos es inmune al paso del tiempo (la edad guardada de forma estática se desactualiza cada año nuevo, pero si se cuenta con `year_built` podemos recalcularla dinámicamente si es necesario, mientras se mantiene `property_age` para búsquedas indexadas ultra rápidas).

2. **Diferencias de Nombres (`floors` vs. `total_floors`):**
   - El estado del frontend maneja `floors` para almacenar la cantidad total de pisos del edificio, pero en la tabla `properties` la columna correspondiente es `total_floors`. Realizamos el mapeo explícito en el formulario al guardar. Se mantendrá una issue para normalizarlo en futuras refactorizaciones.

3. **Mobiliario (Amoblado):**
   - **Glosario:** Se normaliza el término comercial en español a **Amoblado** en lugar de *Amueblado* en la interfaz de usuario. En la base de datos, el valor de la columna `furnished` mantiene la codificación estándar (`sin_muebles`, `semi_amueblado`, `completamente_amueblado`) para evitar romper consultas de bases de datos legadas, pero es mapeado en el frontend.

---

## 13. Lógica de Discriminación Dinámica de Campos

Para evitar la fatiga cognitiva del agente inmobiliario al rellenar el formulario de más de 80 campos, se implementa una **discriminación lógica en tiempo real** basada en dos variables clave: **Tipo de Inmueble (`property_type`)** y **Tipo de Operación (`operation`)**.

Toda la lógica de discriminación está centralizada en `src/utils/propertyDiscrimination.ts` mediante dos funciones puras:
- **`checkFieldApplies(fieldOrGroup, type, op)`**: Determina si un campo/sección aplica para la combinación actual.
- **`isCombinationInconsistent(type, op)`**: Devuelve `true` para las 6 combinaciones inválidas (bloquea opciones en los selectores).

### A. Clasificación de Variables Determinantes

1. **Variables Físicas (`property_type`):**
   * **Residencial Completo:** `casa`, `apartamento`, `townhouse`.
   * **Residencial Compartido:** `habitacion`, `anexo`.
   * **Comercial / Profesional:** `local`, `oficina`, `edificio`, `galpon`.
   * **Rural / Hato:** `hacienda_finca`.
   * **Terreno Baldío:** `terreno_lote`.
2. **Variables Financieras (`operation`):**
   * **Transacción Clásica:** `venta`, `alquiler`.
   * **Alojamiento Temporal:** `vacacional`.

---

### B. Matriz de Visibilidad de Secciones y Campos

#### 1. Datos Financieros Vacacionales
* **Campos:** `price_per_night`, `price_weekend`, `min_nights`, `max_guests`, `checkin_time`, `checkout_time`, `house_rules`, `includes_breakfast`.
* **Condición de Visibilidad:** `operation === 'vacacional'`. 
* *Nota:* Si el inmueble se vende o se alquila a largo plazo, esta sección completa se oculta.

#### 2. Habitáculos y Distribución Interna
* **Campos:** `bedrooms`, `bathrooms`, `half_bathrooms`, `parking_spaces`, `parking_covered`.
* **Condición de Visibilidad `bedrooms`:** `property_type NOT IN ('terreno_lote', 'local', 'oficina', 'galpon', 'edificio')`.
* **Condición de Visibilidad `bathrooms` / `half_bathrooms`:** `property_type !== 'terreno_lote'`.
* **Condición de Visibilidad `parking`:** `property_type NOT IN ('habitacion', 'anexo', 'terreno_lote')`.
* *Detalle:* Los terrenos no tienen dormitorios ni baños. Para locales, oficinas, galpones y edificios se oculta `bedrooms` y `half_bathrooms` (no son viviendas residenciales con habitaciones), mostrando únicamente `bathrooms` y `parking_spaces`.

#### 3. Estructura Vertical y Ascensores
* **Campos:** `floor_number`, `total_floors` (floors), `has_elevator`.
* **Condición de Visibilidad:** `property_type IN ('apartamento', 'oficina', 'local', 'edificio')`.
* *Detalle:* Para una `casa` o `terreno_lote` no tiene sentido pedir el número de piso de la unidad.

#### 4. Parámetros de Compartido (Cohabitación)
* **Campos del bloque `shared_section`:** `bathroom_type` (privado/compartido), `host_housing_type`, `cohabitation`, `occupants_count`, `gender_policy`, `allows_pets`, `allows_cooking`, `deposit_required`, `deposit_amount`.
* **Condición de Visibilidad del bloque:** `property_type IN ('habitacion', 'anexo')` **y** `operation === 'alquiler'` (excluye vacacional).
* **`has_independent_entrance` — Campo independiente:** Se muestra **fuera** del bloque compartido (en la sección de Servicios), condicionado por `property_type IN ('habitacion', 'anexo')` y `operation !== 'venta'`. Esto permite mostrarlo también en vacacional (habitación o anexo), donde los parámetros de cohabitación de largo plazo no aplican pero la entrada independiente sí es relevante para el huésped.

#### 5. Parámetros Rústicos y Terreno
* **Campos:** `topography`, `land_use`, `access_type`, `current_use`, `has_own_water`, `area_hectares` (solo para `hacienda_finca`).
* **Condición de Visibilidad:** `property_type IN ('terreno_lote', 'hacienda_finca')`.
* *Detalle:* La topografía y la vía de acceso (tierra/asfalto) son determinantes para fincas y lotes baldíos, pero innecesarias en apartamentos de zona urbana.

#### 6. Servicios Básicos y Confort del Inmueble
* **Campos:** `has_water_tank`, `has_hot_water`, `has_generator`, `gas_type`, `has_internet`, `has_ac`, `has_heating`, `kitchen_type`, `furnished` (Mobiliario).
* **Condición de Visibilidad:** `property_type !== 'terreno_lote'`.
* *Detalle:* Todos los servicios se ocultan para terrenos baldíos, ya que no poseen construcción física.

---

### C. Beneficio de la Solución Propuesta

* **Cero Frustración:** El usuario solo ve los campos que son lógicamente necesarios para el tipo de negocio que está registrando.
* **Integridad del Modelo:** Los datos no se destruyen al alternar entre tipos de inmuebles accidentalmente antes de hacer clic en "Guardar".
* **Consistencia en Base de Datos:** La base de datos guarda la información completa de la ficha técnica permitiendo búsquedas estructuradas precisas.

