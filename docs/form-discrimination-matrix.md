# Matriz Completa de Discriminación de Campos y Lógica de Negocio

Este documento define la totalidad de los parámetros técnicos de la ficha de propiedades en Knordica Real Estate, y detalla la lógica de discriminación de campos para cada una de las 33 combinaciones posibles de **Tipo de Inmueble** × **Tipo de Operación**.

El objetivo es proveer una especificación formal y exhaustiva para que modelos de Inteligencia Artificial puedan auditar la consistencia lógica de la interfaz de carga y persistencia.

---

## Parte 1: Diccionario General de Parámetros

A continuación se describen los campos del formulario, su tipo de datos, su campo correspondiente en la base de datos de Supabase (tabla `properties` salvo indicación contraria) y su propósito general:

### 1. Clasificación y Gamificación
* **`operation`** (`TEXT`): Tipo de transacción comercial. Valores: `'venta'`, `'alquiler'` (largo plazo), `'vacacional'` (alojamiento turístico).
* **`property_type`** (`TEXT`): Tipología física del inmueble. Valores: `'casa'`, `'apartamento'`, `'townhouse'`, `'anexo'`, `'edificio'`, `'galpon'`, `'habitacion'`, `'hacienda_finca'`, `'local'`, `'oficina'`, `'terreno_lote'`.
* **`status`** (`TEXT`): Estado actual de la publicación en el portal. Valores: `'activa'`, `'reservada'`, `'vendida'`, `'alquilada'`, `'cerrada'`.
* **`featured`** (`BOOLEAN`): Indica si el inmueble tiene exposición prioritaria (destacado).
* **`exclusive`** (`BOOLEAN`): Indica si Knordica tiene la exclusividad de corretaje del inmueble.
* **`new_listing`** (`BOOLEAN`): Bandera temporal para listados agregados recientemente.
* **`price_reduced`** (`BOOLEAN`): Bandera para indicar que el precio bajó respecto al original.
* **`listing_badge`** (`TEXT`): Etiqueta comercial flotante (ej: "OPORTUNIDAD", "EXCLUSIVO").
* **`completeness_score`** (`INTEGER`): Puntuación autocalculada de completitud de datos (0-100%).

### 2. Contenido (Tabla `property_translations`)
* **`title_es` / `title_en`** (`TEXT`): Título público del inmueble en español e inglés.
* **`description_es` / `description_en`** (`TEXT`): Descripción comercial detallada del inmueble en español e inglés.

### 3. Precio y Finanzas
* **`price`** (`DECIMAL`): Precio de venta o canon de arrendamiento mensual base.
* **`price_currency`** (`TEXT`): Moneda de cobro (USD, EUR, VES).
* **`price_usd`** (`DECIMAL`): Precio de referencia convertido a dólares (Autocalculado, no es de entrada).
* **`price_negotiable`** (`BOOLEAN`): Indica si el propietario acepta ofertas o negociación sobre el precio.
* **`maintenance_fee`** (`DECIMAL`): Costo de la cuota mensual de condominio o mantenimiento (Opcional en casas/townhouses, y edificios en alquiler).
* **`maintenance_included`** (`BOOLEAN`): Especifica si el canon mensual de alquiler ya incluye el condominio (Solo aplica para `operation = 'alquiler'`).

### 4. Vacacional (Alojamiento Turístico)
* **`price_per_night`** (`DECIMAL`): Tarifa cobrada por noche estándar de hospedaje.
* **`price_weekend`** (`DECIMAL`): Tarifa cobrada por noche en fines de semana (Viernes a Domingo).
* **`min_nights`** (`INTEGER`): Estancia mínima de noches requerida para reservar.
* **`max_guests`** (`INTEGER`): Capacidad o aforo máximo de personas permitidas en la unidad.
* **`checkin_time`** (`TEXT` / `SELECT`): Hora acordada de entrada (de 08:00 a 20:00).
* **`checkout_time`** (`TEXT` / `SELECT`): Hora límite de salida (de 08:00 a 20:00).
* **`house_rules`** (`TEXT`): Reglas de convivencia (mascotas, ruidos, eventos).
* **`includes_breakfast`** (`BOOLEAN`): Indica si el hospedaje incluye desayuno.

### 5. Dimensiones y Habitáculos
* **`area_built`** (`DECIMAL`): Área interna de construcción techada en metros cuadrados ($m^2$).
* **`area_total`** (`DECIMAL`): Área total de la parcela, terreno o terreno común del lote en metros cuadrados ($m^2$).
* **`area_hectares`** (`DECIMAL`): Área total del terreno en hectáreas (para fincas rústicas y fundos; opcional para lotes de gran tamaño).
* **`bedrooms`** (`INTEGER`): Número de habitaciones o dormitorios independientes.
* **`bathrooms`** (`INTEGER`): Número de baños completos operativos.
* **`half_bathrooms`** (`INTEGER`): Número de medios baños (para visitas, sin ducha).
* **`parking_spaces`** (`INTEGER`): Cantidad de puestos de estacionamiento asignados.
* **`parking_covered`** (`BOOLEAN`): Indica si los puestos de estacionamiento son techados.

### 6. Estructura y Conservación
* **`total_floors`** (`INTEGER`): Cantidad total de pisos que posee el edificio o estructura del condominio.
* **`floor_number`** (`INTEGER`): Piso específico donde se encuentra la unidad inmobiliaria.
* **`year_built`** (`INTEGER`): Año calendario en el que se finalizó la construcción (ej: 2018).
* **`property_age`** (`INTEGER`): Edad transcurrida en años (Autocalculada como `Año Actual - year_built`, no es de entrada).
* **`unit_count`** (`INTEGER`): Número de unidades en la estructura completa (Campo pendiente exclusivo para edificios).
* **`condition`** (`TEXT`): Estado físico del inmueble (`'nuevo'`, `'excelente'`, `'bueno'`, `'por_remodelar'`, `'en_gris'`).
* **`furnished`** (`TEXT`): Nivel de amoblado (`'sin_muebles'`, `'semi_amueblado'`, `'completamente_amueblado'`).

### 7. Ubicación
* **`municipio`** (`TEXT`): Municipio del estado Mérida. Valores: `'libertador'`, `'campo_elias'`, `'santos_marquina'`, `'sucre'`, `'rangel'`.
* **`zone_id`** (`UUID`): Identificador relacional de la zona o urbanización específica (tabla `zones`).
* **`address_es` / `address_en`** (`TEXT`): Dirección detallada de la propiedad.
* **`lat` / `lng`** (`DECIMAL`): Coordenadas geográficas exactas.
* **`show_exact_location`** (`BOOLEAN`): Si es falso, el mapa público muestra un radio aproximado en vez del pin exacto.

### 8. Servicios Básicos y Confort
* **`gas_type`** (`TEXT`): Tipo de suministro de gas (`'bombona'`, `'directo'`, `'no_tiene'`).
* **`kitchen_type`** (`TEXT`): Tecnología de cocina instalada (`'gas'`, `'electrica'`, `'induccion'`, `'mixta'`).
* **`has_water_tank`** (`BOOLEAN`): Disponibilidad de tanque de agua auxiliar (aéreo/subterráneo).
* **`has_hot_water`** (`BOOLEAN`): Presencia de calentador de agua operativo.
* **`has_generator`** (`BOOLEAN`): Presencia de planta eléctrica o generador auxiliar.
* **`has_internet`** (`BOOLEAN`): Presencia de acometida física de internet (fibra/satélite).
* **`has_ac`** (`BOOLEAN`): Presencia de aire acondicionado.
* **`has_heating`** (`BOOLEAN`): Presencia de sistema de calefacción.
* **`has_elevator`** (`BOOLEAN`): Presencia de ascensor operativo en el edificio (Whitelist: apartamentos, edificios, locales y oficinas).

### 9. Seguridad Física
* **`has_security_24h`** (`BOOLEAN`): Servicio de vigilancia física 24 horas en el condominio o sector.
* **`has_electric_gate`** (`BOOLEAN`): Portón vehicular automatizado.
* **`has_cctv`** (`BOOLEAN`): Sistema de cámaras de seguridad perimetral.
* **`has_electric_fence`** (`BOOLEAN`): Cerco eléctrico de seguridad operativo (Aplicable a casas, townhouses, edificios, galpones, haciendas y terrenos).
* **`has_intercom`** (`BOOLEAN`): Citófono o intercomunicador hacia la calle/vigilancia.
* **`has_armored_door`** (`BOOLEAN`): Puerta principal de seguridad o blindada en la unidad.

### 10. Compartido / Cohabitación (Solo Habitaciones y Anexos en alquiler)
* **`bathroom_type`** (`TEXT`): Tipo de baño asignado (`'privado'`, `'compartido'`).
* **`host_housing_type`** (`TEXT`): Tipo de vivienda donde reside el anfitrión (`'casa'`, `'apartamento'`).
* **`cohabitation`** (`TEXT`): Régimen de cohabitación (`'solo_inquilinos'`, `'con_propietario'`).
* **`occupants_count`** (`INTEGER`): Número de personas que ya residen en la vivienda.
* **`gender_policy`** (`TEXT`): Política de género del espacio (`'mixto'`, `'solo_mujeres'`, `'solo_hombres'`).
* **`allows_pets`** (`BOOLEAN`): Permiso para tener mascotas en la habitación/anexo.
* **`allows_cooking`** (`BOOLEAN`): Permiso para hacer uso de la cocina de la vivienda.
* **`has_independent_entrance`** (`BOOLEAN`): Si el anexo o habitación cuenta con puerta directa a la calle (Aplicable en alquiler y vacacional).
* **`deposit_required`** (`BOOLEAN`): Requiere un depósito de garantía previo.
* **`deposit_amount`** (`DECIMAL`): Monto de dinero solicitado como depósito.

### 11. Parámetros de Terrenos y Fincas
* **`topography`** (`TEXT`): Relieve del suelo (`'plano'`, `'inclinado'`, `'irregular'`).
* **`land_use`** (`TEXT`): Clasificación urbana del suelo (residencial, comercial, industrial, agrícola).
* **`access_type`** (`TEXT`): Vía de acceso principal (`'asfalto'`, `'tierra'`, `'concreto'`).
* **`current_use`** (`TEXT`): Actividad actual del suelo (ej: ganadería, siembra, baldío).
* **`has_own_water`** (`BOOLEAN`): Presencia de manantial, pozo profundo, o río propio en la parcela.

---

## Parte 2: Matriz de Discriminación por Combinación (33 Escenarios)

A continuación se detallan las 33 combinaciones del sistema y la lista exacta de parámetros que **aplican** (es decir, campos que se deben pedir sin sombreado rojo), junto con la justificación específica de negocio para cada uno:

---

### COMBINACIÓN 1: CASA × VENTA

#### Campos Aplicables y Justificaciones:
1. **`operation`, `property_type`, `status`**: Control de publicación.
2. **`featured`, `exclusive`, `new_listing`, `price_reduced`, `listing_badge`, `completeness_score`**: Gamificación y marketing.
3. **`title_es`/`title_en`, `description_es`/`description_en`**: Textos descriptivos obligatorios para el portal.
4. **`price`, `price_currency`, `price_negotiable`**: Condiciones financieras de compraventa.
5. **`maintenance_fee`**: Opcional. Permite registrar gastos de condominio o vigilancia si la casa está en urbanización cerrada.
6. **`area_built`, `area_total`**: Área techada y tamaño de parcela (tasación).
7. **`bedrooms`, `bathrooms`, `half_bathrooms`**: Distribución familiar indispensable.
8. **`parking_spaces`, `parking_covered`**: Capacidad y tipo de garaje.
9. **`year_built`, `condition`, `furnished`**: Año, conservación y si incluye muebles.
10. **`municipio`, `zone_id`, `address_es`/`address_en`, `lat`, `lng`, `show_exact_location`**: Ubicación.
11. **`gas_type`, `kitchen_type`, `has_water_tank`, `has_hot_water`, `has_generator`, `has_internet`, `has_ac`, `has_heating`**: Servicios de confort.
12. **`has_security_24h`, `has_electric_gate`, `has_cctv`, `has_electric_fence`, `has_intercom`, `has_armored_door`**: Seguridad de la vivienda.

#### Campos Excluidos (Sombreado Rojo) y Motivo:
* **`maintenance_included`**: Solo aplica a alquiler.
* **Campos Vacacionales**: La venta es transaccional a largo plazo.
* **`floor_number`, `total_floors`, `has_elevator`**: Las casas son independientes y no tienen ascensor ni estructura vertical de edificio.
* **Campos Compartidos**: No es cohabitación ni alquiler de habitación.
* **Campos de Terreno/Fincas**: No es lote baldío ni producción rural.

---

### COMBINACIÓN 2: CASA × ALQUILER

#### Campos Aplicables y Justificaciones:
1. **`operation`, `property_type`, `status`, `featured`, `exclusive`, `new_listing`, `price_reduced`, `listing_badge`, `completeness_score`**: Control de publicación y marketing.
2. **`title_es`/`title_en`, `description_es`/`description_en`**: Textos bilingües.
3. **`price`, `price_currency`, `price_negotiable`**: Canon de arriendo mensual.
4. **`maintenance_fee`, `maintenance_included`**: Opcional. Gastos comunes y si están incluidos en el canon mensual.
5. **`area_built`, `area_total`**: Dimensiones de la casa y del terreno.
6. **`bedrooms`, `bathrooms`, `half_bathrooms`**: Habitabilidad necesaria para el inquilino.
7. **`parking_spaces`, `parking_covered`**: Puestos de estacionamiento.
8. **`year_built`, `condition`, `furnished`**: Estado y nivel de amoblado.
9. **`municipio`, `zone_id`, `address_es`/`address_en`, `lat`, `lng`, `show_exact_location`**: Ubicación.
10. **`gas_type`, `kitchen_type`, `has_water_tank`, `has_hot_water`, `has_generator`, `has_internet`, `has_ac`, `has_heating`**: Servicios de confort para el inquilino.
11. **`has_security_24h`, `has_electric_gate`, `has_cctv`, `has_electric_fence`, `has_intercom`, `has_armored_door`**: Seguridad.

#### Campos Excluidos (Sombreado Rojo) y Motivo:
* **Campos Vacacionales**: Alquiler a largo plazo.
* **`floor_number`, `total_floors`, `has_elevator`**: Estructura de edificio no aplica.
* **Campos Compartidos**: Alquiler de la casa entera (no cohabitación).
* **Campos de Terreno/Fincas**: Relieve agrícola no aplica.

---

### COMBINACIÓN 3: CASA × VACACIONAL

#### Campos Aplicables y Justificaciones:
1. **`operation`, `property_type`, `status`, `featured`, `exclusive`, `new_listing`, `price_reduced`, `listing_badge`, `completeness_score`**: Clasificación y mercadeo turístico.
2. **`title_es`/`title_en`, `description_es`/`description_en`**: Textos para huéspedes turísticos.
3. **`price_per_night`, `price_weekend`, `min_nights`, `max_guests`, `checkin_time`, `checkout_time`, `house_rules`, `includes_breakfast`**: Tarifas y normas específicas de alojamiento turístico.
4. **`area_built`, `area_total`**: Tamaño de la casa y parcela.
5. **`bedrooms`, `bathrooms`, `half_bathrooms`**: Distribución para huéspedes.
6. **`parking_spaces`, `parking_covered`**: Estacionamiento.
7. **`year_built`, `condition`, `furnished`**: Conservación y amoblado (vacacionales siempre deben ir amoblados).
8. **`municipio`, `zone_id`, `address_es`/`address_en`, `lat`, `lng`, `show_exact_location`**: Ubicación para huéspedes.
9. **`gas_type`, `kitchen_type`, `has_water_tank`, `has_hot_water`, `has_generator`, `has_internet`, `has_ac`, `has_heating`**: Confort turístico.
10. **`has_security_24h`, `has_electric_gate`, `has_cctv`, `has_electric_fence`, `has_intercom`, `has_armored_door`**: Seguridad.

#### Campos Excluidos (Sombreado Rojo) y Motivo:
* **`price`, `price_currency`, `price_negotiable`**: Reemplazados por tarifas de noche vacacionales.
* **`maintenance_fee`, `maintenance_included`**: El huésped no paga condominio mensual.
* **`floor_number`, `total_floors`, `has_elevator`**: Estructura vertical no aplica.
* **Campos Compartidos**: Hospedaje de la casa entera.
* **Campos de Terreno/Fincas**: Relieve agrícola no aplica.

---

### COMBINACIÓN 4: APARTAMENTO × VENTA

#### Campos Aplicables y Justificaciones:
1. **`operation`, `property_type`, `status`, `featured`, `exclusive`, `new_listing`, `price_reduced`, `listing_badge`, `completeness_score`**: Datos comerciales.
2. **`title_es`/`title_en`, `description_es`/`description_en`**: Textos promocionales.
3. **`price`, `price_currency`, `price_negotiable`**: Precio de venta.
4. **`maintenance_fee`**: Cuota de condominio mensual del edificio.
5. **`area_built`, `area_total`**: Área privada y porcentaje de terreno común.
6. **`bedrooms`, `bathrooms`, `half_bathrooms`**: Habitáculos interiores.
7. **`parking_spaces`, `parking_covered`**: Estacionamiento asignado.
8. **`floor_number`, `total_floors`, `has_elevator`**: Piso de la unidad, pisos del edificio y presencia de ascensor.
9. **`year_built`, `condition`, `furnished`**: Conservación y amoblado.
10. **`municipio`, `zone_id`, `address_es`/`address_en`, `lat`, `lng`, `show_exact_location`**: Ubicación.
11. **`gas_type`, `kitchen_type`, `has_water_tank`, `has_hot_water`, `has_generator`, `has_internet`, `has_ac`, `has_heating`**: Servicios de confort.
12. **`has_security_24h`, `has_electric_gate`, `has_cctv`, `has_intercom`, `has_armored_door`**: Seguridad.

#### Campos Excluidos (Sombreado Rojo) y Motivo:
* **`maintenance_included`**: No aplica condominio incluido en venta.
* **Campos Vacacionales**: Venta a largo plazo.
* **`has_electric_fence`**: Los apartamentos en pisos superiores no tienen cercos eléctricos individuales.
* **Campos Compartidos**: No es cohabitación estudiantil.
* **Campos de Terreno/Fincas**: No aplica relieve agrícola.

---

### COMBINACIÓN 5: APARTAMENTO × ALQUILER

#### Campos Aplicables y Justificaciones:
1. **`operation`, `property_type`, `status`, `featured`, `exclusive`, `new_listing`, `price_reduced`, `listing_badge`, `completeness_score`**: Control de publicación.
2. **`title_es`/`title_en`, `description_es`/`description_en`**: Textos promocionales.
3. **`price`, `price_currency`, `price_negotiable`**: Canon mensual de alquiler.
4. **`maintenance_fee`, `maintenance_included`**: Cuota de condominio y si está incluida en el arriendo.
5. **`area_built`, `area_total`**: Área privada.
6. **`bedrooms`, `bathrooms`, `half_bathrooms`**: Habitáculos.
7. **`parking_spaces`, `parking_covered`**: Estacionamiento.
8. **`floor_number`, `total_floors`, `has_elevator`**: Pisos y ascensor.
9. **`year_built`, `condition`, `furnished`**: Estado y nivel de amoblado.
10. **`municipio`, `zone_id`, `address_es`/`address_en`, `lat`, `lng`, `show_exact_location`**: Ubicación.
11. **`gas_type`, `kitchen_type`, `has_water_tank`, `has_hot_water`, `has_generator`, `has_internet`, `has_ac`, `has_heating`**: Confort del apartamento.
12. **`has_security_24h`, `has_electric_gate`, `has_cctv`, `has_intercom`, `has_armored_door`**: Seguridad de la unidad.

#### Campos Excluidos (Sombreado Rojo) y Motivo:
* **Campos Vacacionales**: Alquiler a largo plazo.
* **`has_electric_fence`**: Cerco eléctrico no aplica a la unidad individual.
* **Campos Compartidos**: Se arrienda completo (no cohabitación).
* **Campos de Terreno/Fincas**: No aplica relieve rural.

---

### COMBINACIÓN 6: APARTAMENTO × VACACIONAL

#### Campos Aplicables y Justificaciones:
1. **`operation`, `property_type`, `status`, `featured`, `exclusive`, `new_listing`, `price_reduced`, `listing_badge`, `completeness_score`**: Clasificación turística.
2. **`title_es`/`title_en`, `description_es`/`description_en`**: Textos comerciales.
3. **`price_per_night`, `price_weekend`, `min_nights`, `max_guests`, `checkin_time`, `checkout_time`, `house_rules`, `includes_breakfast`**: Tarifas y normas de hospedaje por noches.
4. **`area_built`, `area_total`**: Área interna.
5. **`bedrooms`, `bathrooms`, `half_bathrooms`**: Distribución para huéspedes.
6. **`parking_spaces`, `parking_covered`**: Puestos asignados.
7. **`floor_number`, `total_floors`, `has_elevator`**: Ubicación vertical y ascensor (accesibilidad de turistas).
8. **`year_built`, `condition`, `furnished`**: Conservación y amoblado completo.
9. **`municipio`, `zone_id`, `address_es`/`address_en`, `lat`, `lng`, `show_exact_location`**: Ubicación.
10. **`gas_type`, `kitchen_type`, `has_water_tank`, `has_hot_water`, `has_generator`, `has_internet`, `has_ac`, `has_heating`**: Confort turístico.
11. **`has_security_24h`, `has_electric_gate`, `has_cctv`, `has_intercom`, `has_armored_door`**: Seguridad.

#### Campos Excluidos (Sombreado Rojo) y Motivo:
* **`price`, `price_currency`, `price_negotiable`**: Reemplazado por tarifas vacacionales por noche.
* **`maintenance_fee`, `maintenance_included`**: El huésped no paga condominio mensual.
* **`has_electric_fence`**: Cerco eléctrico no aplica a nivel de unidad individual.
* **Campos Compartidos**: Se renta completo (no es compartido con anfitrión).
* **Campos de Terreno/Fincas**: No aplica relieve de campo.

---

### COMBINACIÓN 7: TOWNHOUSE × VENTA
*(Misma lógica que Casa en Venta)*
* **Campos Aplicables:** Clasificación, marketing, bilingüe, venta estándar, mantenimiento/condominio (opcional para conjuntos privados), área construida/total, distribución familiar, puestos de estacionamiento, antigüedad, conservación, amoblado, ubicación, servicios de confort y seguridad física (incluye cerco eléctrico perimetral).
* **Campos Excluidos (Sombreado Rojo):** Condominio incluido, campos vacacionales, campos de pisos verticales (`floor_number`, `total_floors`, `has_elevator`), parámetros compartidos y parámetros rústicos.

---

### COMBINACIÓN 8: TOWNHOUSE × ALQUILER
*(Misma lógica que Casa en Alquiler)*
* **Campos Aplicables:** Clasificación, marketing, bilingüe, arriendo mensual base, condominio mensual/condominio incluido (opcional), dimensiones, habitáculos, estacionamiento, conservación, amoblado, ubicación, confort y seguridad (incluye cerco eléctrico).
* **Campos Excluidos (Sombreado Rojo):** Vacacionales, pisos verticales, compartidos y rústicos.

---

### COMBINACIÓN 9: TOWNHOUSE × VACACIONAL
*(Misma lógica que Casa Vacacional)*
* **Campos Aplicables:** Clasificación, marketing, bilingüe, tarifas vacacionales, dimensiones, habitáculos, estacionamientos, amoblado completo, ubicación, servicios de confort y seguridad.
* **Campos Excluidos (Sombreado Rojo):** Precios de venta/arriendo base, condominios, pisos verticales, compartidos y rústicos.

---

### COMBINACIÓN 10: ANEXO × VENTA
*(Venta de estructura catastrada independientemente)*
* **Campos Aplicables:** Clasificación, marketing, bilingüe, venta estándar, área construida, habitaciones/baños básicos, antigüedad, conservación, amoblado, ubicación, confort básico, y entrada independiente (`has_independent_entrance`).
* **Campos Excluidos (Sombreado Rojo):** Cuotas de condominio formal, vacacionales, pisos verticales (`floor_number`, `total_floors`, `has_elevator`), campos de cohabitación (no hay convivencia en una venta) y terrenos.

---

### COMBINACIÓN 11: ANEXO × ALQUILER

#### Campos Aplicables y Justificaciones:
1. **`operation`, `property_type`, `status`, `featured`, `exclusive`, `new_listing`, `price_reduced`, `listing_badge`, `completeness_score`**: Control de arrendamiento.
2. **`title_es`/`title_en`, `description_es`/`description_en`**: Textos descriptivos.
3. **`price`, `price_currency`, `price_negotiable`**: Canon mensual de alquiler del anexo.
4. **`area_built`**: Área de la unidad.
5. **`bedrooms`, `bathrooms`**: Habitáculos para inquilinos.
6. **`year_built`, `condition`, `furnished`**: Estado y nivel de amoblado.
7. **`municipio`, `zone_id`, `address_es`/`address_en`, `lat`, `lng`, `show_exact_location`**: Ubicación.
8. **`gas_type`, `kitchen_type`, `has_water_tank`, `has_hot_water`, `has_generator`, `has_internet`, `has_ac`**: Confort básico.
9. **`bathroom_type`, `host_housing_type`, `cohabitation`, `occupants_count`, `gender_policy`, `allows_pets`, `allows_cooking`, `deposit_required`, `deposit_amount`**: Parámetros de cohabitación críticos. Se requiere regular la convivencia con el anfitrión principal de la casa.
10. **`has_independent_entrance`**: Indicado fuera del bloque de cohabitación (sección Servicios). Relevante tanto en alquiler como en vacacional: el inquilino debe saber si accede a su unidad directamente desde la calle o pasando por zonas comunes de la vivienda principal.

#### Campos Excluidos (Sombreado Rojo) y Motivo:
* **`maintenance_fee`, `maintenance_included`**: No hay condominio formal de edificio.
* **Campos Vacacionales**: Alquiler a largo plazo.
* **`floor_number`, `total_floors`, `has_elevator`**: Estructura vertical no aplica.
* **Campos de Terreno/Fincas**: Relieve rural no aplica.

---

### COMBINACIÓN 12: ANEXO × VACACIONAL

#### Campos Aplicables y Justificaciones:
1. **`operation`, `property_type`, `status`, `featured`, `exclusive`, `new_listing`, `price_reduced`, `listing_badge`, `completeness_score`**: Clasificación turística.
2. **`title_es`/`title_en`, `description_es`/`description_en`**: Textos promocionales.
3. **`price_per_night`, `price_weekend`, `min_nights`, `max_guests`, `checkin_time`, `checkout_time`, `house_rules`, `includes_breakfast`, `price_currency`**: Tarifas, normas y moneda específica de cobro de alojamiento turístico.
4. **`area_built`**: Área de la unidad.
5. **`bedrooms`, `bathrooms`**: Distribución para huéspedes.
6. **`year_built`, `condition`, `furnished`**: Conservación y amoblado completo (obligatorio).
7. **`municipio`, `zone_id`, `address_es`/`address_en`, `lat`, `lng`, `show_exact_location`**: Ubicación exacta.
8. **`gas_type`, `kitchen_type`, `has_water_tank`, `has_hot_water`, `has_generator`, `has_internet`, `has_ac`**: Confort vacacional.
9. **`has_independent_entrance`**: **Crítico.** El huésped vacacional debe saber si cuenta con puerta directa a la calle o si debe pasar por la casa principal (accesibilidad y privacidad).

#### Campos Excluidos (Sombreado Rojo) y Motivo:
* **`price`, `price_negotiable`**: Reemplazado por tarifas de noche vacacionales (el canon mensual no aplica).
* **`maintenance_fee`, `maintenance_included`**: El huésped no paga condominio.
* **`floor_number`, `total_floors`, `has_elevator`**: Estructura vertical no aplica.
* **Campos de Co-habitación (`gender_policy`, `bathroom_type`, `cohabitation` etc.)**: Excluidos. Al ser estadías turísticas de la unidad completa, las políticas de cohabitación de largo plazo no aplican.
* **Campos de Terreno/Fincas**: No aplica relieve agrícola.

---

### COMBINACIÓN 13: EDIFICIO × VENTA

#### Campos Aplicables y Justificaciones:
1. **`operation`, `property_type`, `status`, `featured`, `exclusive`, `new_listing`, `price_reduced`, `listing_badge`, `completeness_score`**: Control comercial para venta corporativa o institucional.
2. **`title_es`/`title_en`, `description_es`/`description_en`**: Textos promocionales del edificio.
3. **`price`, `price_currency`, `price_negotiable`**: Precio de venta del edificio completo.
4. **`area_built`, `area_total`**: Área total construida y tamaño de parcela (tasación corporativa).
5. **`parking_spaces`**: Capacidad total del estacionamiento.
6. **`total_floors`, `has_elevator`**: Altura y presencia de ascensores.
7. **`year_built`, `condition`**: Antigüedad e integridad estructural.
8. **`municipio`, `zone_id`, `address_es`/`address_en`, `lat`, `lng`, `show_exact_location`**: Ubicación.
9. **`has_water_tank`, `has_generator`, `has_internet`**: Infraestructura centralizada.
10. **`has_security_24h`, `has_electric_gate`, `has_cctv`, `has_electric_fence`**: Seguridad física del perímetro.

#### Campos Excluidos (Sombreado Rojo) y Motivo:
* **`maintenance_fee`, `maintenance_included`**: Al vender el edificio completo no hay condominio mensual preexistente.
* **Campos Vacacionales**: Venta de estructura completa corporativa.
* **`bedrooms`, `bathrooms`, `half_bathrooms`**: No aplica la distribución interna de una sola unidad (el edificio tiene múltiples unidades internas e inventarios variados).
* **`floor_number`**: El edificio incluye todos los pisos.
* **`furnished`**: La estructura del edificio no se cataloga como amoblada.
* **Campos Compartidos**: Cohabitación estudiantil no aplica.
* **Campos de Terreno/Fincas**: Estructura comercial perimetral.

---

### COMBINACIÓN 14: EDIFICIO × ALQUILER

#### Campos Aplicables y Justificaciones:
1. **`operation`, `property_type`, `status`, `featured`, `exclusive`, `new_listing`, `price_reduced`, `listing_badge`, `completeness_score`**: Control comercial de arriendo corporativo.
2. **`title_es`/`title_en`, `description_es`/`description_en`**: Textos bilingües.
3. **`price`, `price_currency`, `price_negotiable`**: Canon mensual del edificio.
4. **`maintenance_fee`, `maintenance_included`**: Opcional. Gastos de administración y si están incluidos en el canon total.
5. **`area_built`, `area_total`**: Dimensiones estructurales.
6. **`parking_spaces`**: Capacidad del garaje comercial.
7. **`total_floors`, `has_elevator`**: Pisos y ascensores.
8. **`year_built`, `condition`**: Integridad física.
9. **`municipio`, `zone_id`, `address_es`/`address_en`, `lat`, `lng`, `show_exact_location`**: Ubicación.
10. **`has_water_tank`, `has_generator`, `has_internet`**: Servicios comerciales.
11. **`has_security_24h`, `has_electric_gate`, `has_cctv`, `has_electric_fence`**: Seguridad del perímetro del edificio.

#### Campos Excluidos (Sombreado Rojo) y Motivo:
* Same as Edificio × Venta.

---

### COMBINACIÓN 15: EDIFICIO × VACACIONAL
> [!CAUTION]
> **Inconsistencia Lógica / Combinación Incompatible:**
> No se permite la publicación de edificios enteros para alquiler vacacional por noches de forma nativa.
> **Comportamiento UI:** La opción `Vacacional` en el selector de operaciones quedará inhabilitada si el tipo es `Edificio`. Si ya está cargada de esta manera en la base de datos, se mostrará una advertencia informativa arriba del formulario indicando la inconsistencia, pero permitirá editar otros campos y guardar sin bloqueos.

---

### COMBINACIÓN 16: GALPON × VENTA

#### Campos Aplicables y Justificaciones:
1. **`operation`, `property_type`, `status`, `featured`, `exclusive`, `new_listing`, `price_reduced`, `listing_badge`, `completeness_score`**: Datos corporativos.
2. **`title_es`/`title_en`, `description_es`/`description_en`**: Textos de uso industrial/almacén.
3. **`price`, `price_currency`, `price_negotiable`**: Precio de venta.
4. **`area_built`, `area_total`**: Área útil techada y patio de maniobras.
5. **`bathrooms`**: Baños para personal operativo.
6. **`parking_spaces`**: Puestos para carga pesada.
7. **`year_built`, `condition`**: Antigüedad e integridad estructural (techos, bases).
8. **`municipio`, `zone_id`, `address_es`/`address_en`, `lat`, `lng`, `show_exact_location`**: Ubicación.
9. **`gas_type`, `has_water_tank`, `has_generator`, `has_internet`**: Servicios industriales básicos.
10. **`has_security_24h`, `has_electric_gate`, `has_cctv`, `has_electric_fence`**: Seguridad física indispensable para proteger mercancía.

#### Campos Excluidos (Sombreado Rojo) y Motivo:
* **`maintenance_fee`, `maintenance_included`**: Los galpones industriales independientes no pagan condominio.
* **Campos Vacacionales**: Uso industrial, no habitacional.
* **`bedrooms`, `half_bathrooms`**: No son viviendas residenciales (solo baños comunes).
* **`floor_number`, `total_floors`, `has_elevator`**: Estructura de galpón a doble altura, no aplica propiedad vertical.
* **`furnished`**: No aplica nivel de amoblado habitacional.
* **Campos Compartidos**: Cohabitación residencial no aplica.
* **Campos de Terreno/Fincas**: No aplica relieve agrícola.

---

### COMBINACIÓN 17: GALPON × ALQUILER
*(Misma lógica que Galpón en Venta)*
* **Campos Aplicables:** Clasificación, marketing, bilingüe, arriendo mensual base, área techada, patio de maniobras, baños comunes, puestos de carga pesada, antigüedad, conservación, ubicación geográfica, servicios y seguridad perimetral (incluye cerco eléctrico).
* **Campos Excluidos (Sombreado Rojo):** Condominio de edificio, vacacionales, habitaciones, pisos verticales, amoblado y cohabitación.

---

### COMBINACIÓN 18: GALPON × VACACIONAL
> [!CAUTION]
> **Inconsistencia Lógica / Combinación Incompatible:**
> Un galpón industrial no se alquila turísticamente por noches.
> **Comportamiento UI:** La opción `Vacacional` quedará inhabilitada en el selector. Alerta informativa si viene preexistente en la base de datos.

---

### COMBINACIÓN 19: HABITACION × VENTA
> [!CAUTION]
> **Inconsistencia Lógica / Combinación Incompatible:**
> Una habitación individual dentro de una vivienda no se vende por separado (no posee registro de propiedad horizontal individual).
> **Comportamiento UI:** La opción `Venta` quedará inhabilitada si el tipo es `Habitación`. Alerta informativa si viene preexistente.

---

### COMBINACIÓN 20: HABITACION × ALQUILER

#### Campos Aplicables y Justificaciones:
1. **`operation`, `property_type`, `status`, `featured`, `exclusive`, `new_listing`, `price_reduced`, `listing_badge`, `completeness_score`**: Control de publicación.
2. **`title_es`/`title_en`, `description_es`/`description_en`**: Textos de alquiler compartido (ej. estudiantes).
3. **`price`, `price_currency`, `price_negotiable`**: Canon mensual de la habitación.
4. **`area_built`**: Área de la habitación privada.
5. **`bedrooms`, `bathrooms`**: Dormitorio privado (1) y si el baño es privado o común.
6. **`year_built`, `condition`, `furnished`**: Estado y nivel de amoblado de la habitación (normalmente se arriendan amobladas).
7. **`municipio`, `zone_id`, `address_es`/`address_en`, `lat`, `lng`, `show_exact_location`**: Ubicación.
8. **`gas_type`, `kitchen_type`, `has_water_tank`, `has_hot_water`, `has_internet`, `has_ac`**: Confort de la vivienda común.
9. **`bathroom_type`, `host_housing_type`, `cohabitation`, `occupants_count`, `gender_policy`, `allows_pets`, `allows_cooking`, `deposit_required`, `deposit_amount`**: Parámetros de cohabitación críticos para regular la convivencia diaria con el anfitrión u otros inquilinos.
10. **`has_independent_entrance`**: Indicado fuera del bloque de cohabitación (sección Servicios del formulario). El potencial inquilino debe saber si accede a la habitación directamente desde la calle o a través de las áreas privadas del propietario.

#### Campos Excluidos (Sombreado Rojo) y Motivo:
* **`maintenance_fee`, `maintenance_included`**: El inquilino no paga condominio formal de edificio.
* **Campos Vacacionales**: Alquiler a largo plazo.
* **`floor_number`, `total_floors`, `has_elevator`**: Estructura de edificio no aplica a nivel de habitación individual.
* **Campos de Terreno/Fincas**: No aplica relieve agrícola.

---

### COMBINACIÓN 21: HABITACION × VACACIONAL

#### Campos Aplicables y Justificaciones:
1. **`operation`, `property_type`, `status`, `featured`, `exclusive`, `new_listing`, `price_reduced`, `listing_badge`, `completeness_score`**: Clasificación turística.
2. **`title_es`/`title_en`, `description_es`/`description_en`**: Textos de promoción turística.
3. **`price_per_night`, `price_weekend`, `min_nights`, `max_guests`, `checkin_time`, `checkout_time`, `house_rules`, `includes_breakfast`**: Tarifas y normas de hospedaje vacacional por noches.
4. **`area_built`**: Área de la habitación.
5. **`bedrooms`, `bathrooms`**: Habitación (1) y baño disponible.
6. **`year_built`, `condition`, `furnished`**: Conservación y amoblado completo (obligatorio).
7. **`municipio`, `zone_id`, `address_es`/`address_en`, `lat`, `lng`, `show_exact_location`**: Ubicación.
8. **`gas_type`, `kitchen_type`, `has_water_tank`, `has_hot_water`, `has_internet`, `has_ac`**: Confort vacacional.
9. **`has_independent_entrance`**: **Crítico.** El turista debe saber si la habitación tiene entrada privada o si requiere pasar por las áreas privadas del propietario.

#### Campos Excluidos (Sombreado Rojo) y Motivo:
* **`price`, `price_currency`, `price_negotiable`**: Reemplazado por tarifas vacacionales.
* **`maintenance_fee`, `maintenance_included`**: No paga condominio.
* **`floor_number`, `total_floors`, `has_elevator`**: Estructura de edificio no aplica.
* **Campos de Co-habitación (`gender_policy`, `cohabitation` etc.)**: Excluidos. Los parámetros de convivencia de largo plazo o políticas de inquilinos mixtos no aplican para hospedajes temporales.
* **Campos de Terreno/Fincas**: No aplica relieve rural.

---

### COMBINACIÓN 22: HACIENDA_FINCA × VENTA

#### Campos Aplicables y Justificaciones:
1. **`operation`, `property_type`, `status`, `featured`, `exclusive`, `new_listing`, `price_reduced`, `listing_badge`, `completeness_score`**: Control de finca rural.
2. **`title_es`/`title_en`, `description_es`/`description_en`**: Textos promocionales agrícolas/pecuarios.
3. **`price`, `price_currency`, `price_negotiable`**: Precio de venta de la finca.
4. **`area_built`, `area_total`, `area_hectares`**: Área construida (casa patronal, establos), m² totales y tamaño total en Hectáreas (dato crítico de producción).
5. **`bedrooms`, `bathrooms`**: Distribución de la casa patronal o de obreros.
6. **`year_built`, `condition`**: Antigüedad y conservación estructural.
7. **`municipio`, `zone_id`, `address_es`/`address_en`, `lat`, `lng`, `show_exact_location`**: Ubicación.
8. **`has_water_tank`, `has_generator`, `has_internet`**: Servicios de confort rural.
9. **`topography`, `land_use`, `access_type`, `current_use`, `has_own_water`**: Parámetros rústicos y relieve (clave para viabilidad de siembra, ganadería y acceso de maquinaria).

#### Campos Excluidos (Sombreado Rojo) y Motivo:
* **`maintenance_fee`, `maintenance_included`**: Las fincas rústicas no pagan condominio.
* **Campos Vacacionales**: Venta a largo plazo.
* **`floor_number`, `total_floors`, `has_elevator`**: Estructura vertical de edificio no aplica en el campo.
* **`furnished`**: El mobiliario habitacional no se cataloga en la venta de fincas agrícolas.
* **Campos Compartidos**: Cohabitación estudiantil no aplica.

---

### COMBINACIÓN 23: HACIENDA_FINCA × ALQUILER

#### Campos Aplicables y Justificaciones:
* **Mismo relieve que Hacienda en Venta** con la siguiente adición importante:
* **`furnished`**: **Aplicable.** Una finca o hacienda que se arrienda por temporadas largas o como explotación rural puede incluir mobiliario en la casa patronal.

#### Campos Excluidos (Sombreado Rojo) y Motivo:
* Condominio de edificio, vacacionales, pisos verticales y cohabitación.

---

### COMBINACIÓN 24: HACIENDA_FINCA × VACACIONAL
*(Agro-turismo / Alojamiento rural)*
* **Campos Aplicables:** Clasificación, marketing, bilingüe, tarifas vacacionales (por noche/fin de semana, checkin, checkout), área construida, total y hectáreas de recreación, habitaciones/baños para huéspedes, conservación y amoblado completo de la casa patronal, confort turístico (tanque, generador, internet, calefacción), parámetros rústicos y acceso.
* **Campos Excluidos (Sombreado Rojo):** Precios base de venta/arriendo, condominio mensual, pisos verticales y cohabitación.

---

### COMBINACIÓN 25: LOCAL × VENTA

#### Campos Aplicables y Justificaciones:
1. **`operation`, `property_type`, `status`, `featured`, `exclusive`, `new_listing`, `price_reduced`, `listing_badge`, `completeness_score`**: Datos comerciales.
2. **`title_es`/`title_en`, `description_es`/`description_en`**: Textos comerciales.
3. **`price`, `price_currency`, `price_negotiable`**: Precio de venta.
4. **`maintenance_fee`**: Condominio mensual (indispensable si está en Centro Comercial).
5. **`area_built`, `area_total`**: Área útil del local.
6. **`bathrooms`**: Baños para clientes y empleados.
7. **`parking_spaces`**: Estacionamiento comercial.
8. **`floor_number`, `total_floors`, `has_elevator`**: Ubicación en el centro comercial y ascensor.
9. **`year_built`, `condition`**: Antigüedad e integridad estructural.
10. **`municipio`, `zone_id`, `address_es`/`address_en`, `lat`, `lng`, `show_exact_location`**: Ubicación.
11. **`gas_type`, `kitchen_type`, `has_water_tank`, `has_generator`, `has_internet`, `has_ac`**: Servicios comerciales.
12. **`has_security_24h`, `has_electric_gate`, `has_cctv`, `has_intercom`, `has_armored_door`**: Seguridad comercial.

#### Campos Excluidos (Sombreado Rojo) y Motivo:
* **`maintenance_included`**: No aplica condominio incluido en venta.
* **Campos Vacacionales**: Publicación comercial.
* **`bedrooms`, `half_bathrooms`**: No es vivienda residencial.
* **`furnished`**: No se cataloga como amoblado residencial.
* **Campos Compartidos**: Cohabitación residencial no aplica.
* **Campos de Terreno/Fincas**: No aplica relieve agrícola.

---

### COMBINACIÓN 26: LOCAL × ALQUILER
*(Misma lógica que Local en Venta, con una diferencia clave)*
* **Campos Aplicables:** Clasificación, marketing, bilingüe, arriendo mensual base (`price`, `price_currency`, `price_negotiable`), condominio mensual (`maintenance_fee`) **y condominio incluido en el canon (`maintenance_included`)** — esta última es la diferencia respecto a la venta, donde condominio incluido no aplica —, área útil comercial, baños comunes, puestos de estacionamiento, pisos y ascensor, antigüedad, conservación, ubicación, confort y seguridad.
* **Campos Excluidos (Sombreado Rojo):** Vacacionales, habitaciones, amoblado residencial, cohabitación y rústicos.

---

### COMBINACIÓN 27: LOCAL × VACACIONAL
> [!CAUTION]
> **Inconsistencia Lógica / Combinación Incompatible:**
> Un local comercial no se alquila turísticamente por noches.
> **Comportamiento UI:** Opción `Vacacional` inhabilitada en el selector. Alerta informativa si viene preexistente.

---

### COMBINACIÓN 28: OFICINA × VENTA
*(Misma lógica que Local en Venta)*
* **Campos Aplicables:** Clasificación, marketing, bilingüe, venta estándar, condominio del edificio de oficinas, área útil, baños, estacionamientos, ubicación vertical, ascensor, antigüedad, conservación, ubicación, confort y seguridad.
* **Campos Excluidos (Sombreado Rojo):** Condominio incluido, vacacionales, habitaciones, amoblado habitacional, cohabitación y parámetros rústicos.

---

### COMBINACIÓN 29: OFICINA × ALQUILER
*(Misma lógica que Local en Alquiler)*
* **Campos Aplicables:** Clasificación, marketing, arriendo base, condominio mensual, condominio incluido, área útil, baños, estacionamientos, ubicación vertical, ascensor, antigüedad, conservación, ubicación, confort corporativo y seguridad de oficinas.
* **Campos Excluidos (Sombreado Rojo):** Vacacionales, habitaciones, amoblado residencial, cohabitación y rústicos.

---

### COMBINACIÓN 30: OFICINA × VACACIONAL
> [!CAUTION]
> **Inconsistencia Lógica / Combinación Incompatible:**
> Una oficina no se alquila turísticamente por noches.
> **Comportamiento UI:** Opción `Vacacional` inhabilitada en el selector. Alerta informativa si viene preexistente.

---

### COMBINACIÓN 31: TERRENO_LOTE × VENTA

#### Campos Aplicables y Justificaciones:
1. **`operation`, `property_type`, `status`, `featured`, `exclusive`, `new_listing`, `price_reduced`, `listing_badge`, `completeness_score`**: Control de parcelas.
2. **`title_es`/`title_en`, `description_es`/`description_en`**: Textos promocionales del terreno.
3. **`price`, `price_currency`, `price_negotiable`**: Precio de venta del terreno.
4. **`area_total`**: Área total de la parcela (dato principal de tasación).
5. **`area_hectares`**: **Opcional.** Aplicable únicamente para parcelas rurales de gran tamaño.
6. **`municipio`, `zone_id`, `address_es`/`address_en`, `lat`, `lng`, `show_exact_location`**: Ubicación.
7. **`topography`, `land_use`, `access_type`, `current_use`, `has_own_water`**: Relieve (viabilidad de construcción y servicios).
8. **`has_security_24h`, `has_electric_fence`**: Seguridad perimetral del lote (si está cercado o en urbanización privada).

#### Campos Excluidos (Sombreado Rojo) y Motivo:
* **`maintenance_fee`, `maintenance_included`**: Los lotes baldíos no pagan cuota de condominio mensual de edificio.
* **`area_built`**: No hay construcción física.
* **`bedrooms`, `bathrooms`, `half_bathrooms`, `parking_spaces`, `parking_covered`**: Habitáculos y puestos de garaje techados no aplican.
* **`floor_number`, `total_floors`, `has_elevator`**: Estructura de edificio no aplica.
* **`year_built`, `condition`, `furnished`**: Estado de construcción y mobiliario no aplican.
* **Campos Vacacionales**: Lote de tierra no se alquila temporalmente a turistas.
* **Campos Compartidos**: No hay cohabitación en un lote vacío.

---

### COMBINACIÓN 32: TERRENO_LOTE × ALQUILER
*(Misma lógica que Terreno en Venta)*
* **Campos Aplicables:** Clasificación, marketing, bilingüe, arriendo mensual base, área total, `area_hectares` (opcional para parcelas rurales), ubicación, topografía, uso del suelo, acceso, uso actual, agua propia (`has_own_water`) y seguridad perimetral (`has_security_24h`, `has_electric_fence`).
* **Campos Excluidos (Sombreado Rojo):** Condominios, área construida, habitaciones/baños, pisos, ascensor, conservación, amoblado, vacacionales y cohabitación.

---

### COMBINACIÓN 33: TERRENO_LOTE × VACACIONAL
> [!CAUTION]
> **Inconsistencia Lógica / Combinación Incompatible:**
> Un lote baldío sin estructura no se arrienda para alojamiento vacacional.
> **Comportamiento UI:** Opción `Vacacional` inhabilitada en el selector. Alerta informativa si viene preexistente.
