# Contexto Técnico del Proyecto Knordica

<!-- ════════════════════════════════════════════════
     BLOQUE A — CONTEXTO DE REPOSITORIO
     Gestionado exclusivamente por context-repo.md
     ════════════════════════════════════════════════ -->

## Visión General

Knordica es una plataforma inmobiliaria avanzada construida con Next.js 16.2.9, Supabase y TypeScript que permite a agentes gestionar propiedades, crear listados detallados y conectar con clientes. La plataforma combina una interfaz de usuario rica con una arquitectura de backend robusta que soporta múltiples tipos de propiedades, operaciones y condiciones financieras.

La aplicación sigue un enfoque de componentes reutilizables con un sistema de formularios dinámicos que adapta los campos según el tipo de propiedad y operación seleccionada. El backend utiliza Supabase con políticas de seguridad a nivel de fila (RLS) para garantizar que los usuarios solo accedan a sus propios datos.

## Arquitectura del Sistema

### 1. Frontend

- **Framework**: Next.js 16.2.9 con App Router y Server Components
- **Estilos**: Tailwind CSS con personalizaciones y utilidades propias
- **Animaciones**: Framer Motion para transiciones suaves y efectos de arrastre
- **Tipado**: TypeScript completo en todo el códigobase
- **Internacionalización**: Soporte completo para español (es) e inglés (en)
- **Gestión de estado**: Zustand para store de filtros, panel y notificaciones
- **Componentes UI**: Componentes personalizados para formularios, selectores, botones y tarjetas

### 2. Backend

- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth con roles de usuario (admin, agent, client)
- **Políticas de seguridad**: Row Level Security (RLS) en todas las tablas críticas
- **APIs**: Endpoints REST para operaciones CRUD y funciones personalizadas
- **Migraciones**: Sistema de migraciones de base de datos con versionado
- **Funciones de base de datos**: Triggers y funciones personalizadas para lógica de negocio

### 3. Infraestructura

- **Despliegue**: Vercel para frontend, Supabase para backend
- **Almacenamiento**: Supabase Storage para imágenes de propiedades
- **Monitoreo**: Logs y métricas integradas con Supabase
- **Pruebas**: Mock data para desarrollo y pruebas unitarias

## Estructura de Directorios

```
knordica/
├── src/
│   ├── app/                    # Rutas de Next.js (App Router)
│   │   ├── [locale]/           # Rutas internacionales
│   │   │   ├── panel/          # Área de administración
│   │   │   │   ├── propiedades/
│   │   │   │   │   ├── editar/[id]/page.tsx  # Edición de propiedades
│   │   │   │   │   ├── nueva/page.tsx        # Creación de nuevas propiedades
│   │   │   │   │   └── page.tsx              # Lista de propiedades
│   │   │   │   └── ...         # Otras secciones del panel
│   │   │   └── ...             # Rutas del cliente
│   │   └── ...                 # Rutas públicas
│   ├── components/             # Componentes UI reutilizables
│   │   ├── panel/              # Componentes del panel de administración
│   │   │   └── PropertyForm.tsx # Formulario principal de propiedades
│   │   └── ...                 # Otros componentes
│   ├── lib/                    # Lógica de negocio y utilidades
│   │   ├── queries/            # Consultas a Supabase
│   │   │   ├── properties.ts   # Consultas de propiedades
│   │   │   ├── zones.ts        # Consultas de zonas
│   │   │   └── ...             # Otras consultas
│   │   ├── seo/                # Metadatos SEO y datos estructurados
│   │   │   ├── metadata.ts     # Generación de metadatos
│   │   │   └── structured-data.ts # Generación de JSON-LD
│   │   ├── supabase/           # Cliente Supabase
│   │   │   ├── client.ts       # Cliente cliente
│   │   │   ├── server.ts       # Cliente servidor
│   │   │   └── middleware.ts   # Middleware de sesión
│   │   ├── motion/             # Animaciones Framer Motion
│   │   │   └── variants.ts     # Variantes de animación
│   │   ├── utils/              # Utilidades
│   │   │   ├── cn.ts           # Combinación de clases CSS
│   │   │   └── format.ts       # Formateo de números, moneda, etc.
│   │   └── constants/          # Constantes de dominio
│   │       └── property.ts     # Valores permitidos para propiedades
│   ├── types/                  # Definiciones de tipos TypeScript
│   │   └── property.ts         # Interfaces de datos
│   ├── utils/                  # Lógica de negocio
│   │   ├── propertyCompleteness.ts # Cálculo de puntuación de completitud
│   │   └── propertyDiscrimination.ts # Lógica de discriminación de campos
│   └── mock-data.ts            # Datos de prueba para desarrollo
├── supabase/
│   └── migrations/             # Migraciones de base de datos
│       ├── 20260619_init.sql   # Esquema inicial
│       ├── 20260621_schema_v2.sql # Evolución del esquema
│       ├── 20260623_add_maintenance_fee.sql # Añade tarifa de mantenimiento
│       ├── 20260623_add_missing_form_columns.sql # Añade columnas faltantes
│       ├── 20260624_add_rls_write_policies.sql # Políticas RLS
│       ├── 20260624_adjust_schema_and_trigger.sql # Ajustes de esquema y trigger
│       └── 20260626_normalize_enum_values.sql # Normalización de valores
└── ...                         # Otros archivos del proyecto
```

## Esquema de Base de Datos

### 1. Tablas Principales

#### 1.1. `zones`

- `id` (UUID): Identificador único
- `name_es` (text): Nombre en español
- `name_en` (text): Nombre en inglés
- `description_es` (text): Descripción en español
- `description_en` (text): Descripción en inglés
- `lat` (double precision): Latitud
- `lng` (double precision): Longitud
- `created_at` (timestamp with time zone): Fecha de creación
- `updated_at` (timestamp with time zone): Fecha de actualización

#### 1.2. `agents`

- `id` (UUID): Identificador único
- `user_id` (UUID): Referencia a Supabase Auth
- `name` (text): Nombre completo
- `email` (text): Correo electrónico
- `phone` (text): Teléfono
- `role` (text): Rol (admin, agent)
- `created_at` (timestamp with time zone): Fecha de creación
- `updated_at` (timestamp with time zone): Fecha de actualización

#### 1.3. `properties`

- `id` (UUID): Identificador único
- `agent_id` (UUID): Referencia al agente propietario
- `operation` (text): Operación (venta, alquiler, vacacional)
- `property_type` (text): Tipo de propiedad (apartamento, casa, etc.)
- `status` (text): Estado (activa, reservada, vendida, alquilada, cerrada)
- `listing_badge` (text): Distintivo de listado (basico, destacado, premium)
- `featured` (boolean): Destacado
- `exclusive` (boolean): Exclusivo
- `new_listing` (boolean): Nueva lista
- `price_reduced` (boolean): Precio reducido
- `price` (numeric): Precio
- `price_currency` (text): Moneda del precio (USD, VES, etc.)
- `price_negotiable` (boolean): Precio negociable
- `price_usd` (numeric): Precio en USD
- `maintenance_fee` (numeric): Tarifa de mantenimiento
- `maintenance_fee_currency` (text): Moneda de la tarifa de mantenimiento
- `price_per_night` (numeric): Precio por noche
- `price_weekend` (numeric): Precio de fin de semana
- `min_nights` (integer): Noches mínimas
- `max_guests` (integer): Máximo de huéspedes
- `checkin_time` (text): Hora de check-in
- `checkout_time` (text): Hora de check-out
- `house_rules` (text): Reglas de la propiedad
- `includes_breakfast` (boolean): Incluye desayuno
- `area_built` (numeric): Área construida
- `area_total` (numeric): Área total
- `area_hectares` (numeric): Área en hectáreas
- `bedrooms` (integer): Dormitorios
- `bathrooms` (integer): Baños
- `half_bathrooms` (integer): Medios baños
- `parking_spaces` (integer): Espacios de estacionamiento
- `parking_covered` (boolean): Estacionamiento cubierto
- `total_floors` (integer): Total de pisos
- `floor_number` (integer): Número de piso
- `property_age` (integer): Edad de la propiedad (años)
- `year_built` (integer): Año de construcción
- `condition` (text): Condición (nuevo, excelente, buen_estado, por_remodelar, en_gris)
- `furnished` (text): Amueblado (no, parcial, completo)
- `municipio` (text): Municipio
- `zone_id` (UUID): Referencia a la zona
- `address_es` (text): Dirección en español
- `address_en` (text): Dirección en inglés
- `lat` (double precision): Latitud
- `lng` (double precision): Longitud
- `show_exact_location` (boolean): Mostrar ubicación exacta
- `has_elevator` (boolean): Ascensor
- `has_water_tank` (boolean): Tanque de agua
- `has_hot_water` (boolean): Agua caliente
- `has_generator` (boolean): Generador
- `gas_type` (text): Tipo de gas (natural, butano, propano)
- `has_internet` (boolean): Internet
- `has_security_24h` (boolean): Seguridad 24h
- `has_electric_gate` (boolean): Puerta eléctrica
- `has_cctv` (boolean): CCTV
- `has_electric_fence` (boolean): Valla eléctrica
- `has_intercom` (boolean): Intercomunicador
- `has_armored_door` (boolean): Puerta blindada
- `has_ac` (boolean): Aire acondicionado
- `has_heating` (boolean): Calefacción
- `kitchen_type` (text): Tipo de cocina (moderna, tradicional, americana)
- `bathroom_type` (text): Tipo de baño (común, privado, en suite)
- `host_housing_type` (text): Tipo de vivienda del anfitrión (mismo edificio, mismo piso, otro lugar)
- `cohabitation` (text): Convivencia (no, si, solo mujeres, solo hombres)
- `occupants_count` (integer): Número de ocupantes
- `gender_policy` (text): Política de género (mixto, mujeres, hombres)
- `deposit_required` (boolean): Depósito requerido
- `deposit_amount` (numeric): Monto del depósito
- `allows_pets` (boolean): Permite mascotas
- `allows_cooking` (boolean): Permite cocinar
- `has_independent_entrance` (boolean): Entrada independiente
- `topography` (text): Topografía (plano, colina, montaña)
- `land_use` (text): Uso del terreno (residencial, comercial, mixto)
- `access_type` (text): Tipo de acceso (asfalto, tierra, pavimento)
- `current_use` (text): Uso actual (residencial, comercial, vacacional)
- `has_own_water` (boolean): Agua propia
- `video_url` (text): URL del video
- `virtual_tour_url` (text): URL del tour virtual
- `completeness_score` (numeric): Puntuación de completitud (0-100)
- `created_at` (timestamp with time zone): Fecha de creación
- `updated_at` (timestamp with time zone): Fecha de actualización

#### 1.4. `property_translations`

- `id` (UUID): Identificador único
- `property_id` (UUID): Referencia a la propiedad
- `locale` (text): Localización (es, en)
- `title` (text): Título
- `description` (text): Descripción
- `created_at` (timestamp with time zone): Fecha de creación
- `updated_at` (timestamp with time zone): Fecha de actualización

#### 1.5. `property_images`

- `id` (UUID): Identificador único
- `property_id` (UUID): Referencia a la propiedad
- `url` (text): URL de la imagen
- `sort_order` (integer): Orden de clasificación
- `is_cover` (boolean): Imagen de portada
- `created_at` (timestamp with time zone): Fecha de creación
- `updated_at` (timestamp with time zone): Fecha de actualización

#### 1.6. `property_features`

- `id` (UUID): Identificador único
- `property_id` (UUID): Referencia a la propiedad
- `category` (text): Categoría (estructura, servicios, seguridad, etc.)
- `feature` (text): Característica
- `created_at` (timestamp with time zone): Fecha de creación
- `updated_at` (timestamp with time zone): Fecha de actualización

#### 1.7. `favorites`

- `id` (UUID): Identificador único
- `user_id` (UUID): Referencia al usuario
- `property_id` (UUID): Referencia a la propiedad
- `created_at` (timestamp with time zone): Fecha de creación

#### 1.8. `leads`

- `id` (UUID): Identificador único
- `property_id` (UUID): Referencia a la propiedad
- `name` (text): Nombre
- `email` (text): Correo electrónico
- `phone` (text): Teléfono
- `message` (text): Mensaje
- `status` (text): Estado (nuevo, contactado, convertido)
- `created_at` (timestamp with time zone): Fecha de creación
- `updated_at` (timestamp with time zone): Fecha de actualización

#### 1.9. `lead_notes`

- `id` (UUID): Identificador único
- `lead_id` (UUID): Referencia al lead
- `note` (text): Nota
- `created_by` (UUID): Usuario que creó la nota
- `created_at` (timestamp with time zone): Fecha de creación

#### 1.10. `appointments`

- `id` (UUID): Identificador único
- `property_id` (UUID): Referencia a la propiedad
- `user_id` (UUID): Referencia al usuario
- `agent_id` (UUID): Referencia al agente
- `date` (timestamp with time zone): Fecha y hora
- `notes` (text): Notas
- `status` (text): Estado (pendiente, confirmado, cancelado)
- `created_at` (timestamp with time zone): Fecha de creación
- `updated_at` (timestamp with time zone): Fecha de actualización

#### 1.11. `blog_posts`

- `id` (UUID): Identificador único
- `title_es` (text): Título en español
- `title_en` (text): Título en inglés
- `content_es` (text): Contenido en español
- `content_en` (text): Contenido en inglés
- `slug` (text): Slug
- `excerpt_es` (text): Extracto en español
- `excerpt_en` (text): Extracto en inglés
- `cover_image` (text): Imagen de portada
- `author_id` (UUID): Referencia al autor
- `published_at` (timestamp with time zone): Fecha de publicación
- `status` (text): Estado (borrador, publicado)
- `created_at` (timestamp with time zone): Fecha de creación
- `updated_at` (timestamp with time zone): Fecha de actualización

### 2. Políticas de Seguridad (RLS)

Las políticas de seguridad a nivel de fila (RLS) se implementan en las tablas críticas para garantizar que los usuarios solo puedan acceder y modificar sus propios datos:

- `properties`: Los usuarios solo pueden ver y modificar propiedades donde `agent_id = auth.uid()`
- `property_translations`: Solo se pueden modificar traducciones de propiedades del usuario
- `property_images`: Solo se pueden modificar imágenes de propiedades del usuario
- `property_features`: Solo se pueden modificar características de propiedades del usuario

### 3. Triggers y Funciones de Base de Datos

#### 3.1. `update_completeness_score()`

Función que se ejecuta automáticamente cuando se actualiza una propiedad para recalcular la puntuación de completitud basada en los campos completados y sus pesos configurados.

```sql
CREATE OR REPLACE FUNCTION update_completeness_score()
RETURNS TRIGGER AS $$
DECLARE
    total_weight NUMERIC := 0;
    completed_weight NUMERIC := 0;
    field_name TEXT;
    field_value ANYELEMENT;
    field_config RECORD;
BEGIN
    -- Calcular peso total y completado
    FOR field_config IN SELECT field, weight FROM completeness_config LOOP
        field_name := field_config.field;
        EXECUTE 'SELECT $1.' || field_name INTO field_value USING NEW;
        
        total_weight := total_weight + field_config.weight;
        
        -- Verificar si el campo está completado
        IF field_value IS NOT NULL AND field_value != '' THEN
            -- Para campos booleanos, verificar que no sean NULL
            IF typeof(field_value) = 'boolean' THEN
                IF field_value THEN
                    completed_weight := completed_weight + field_config.weight;
                END IF;
            ELSE
                completed_weight := completed_weight + field_config.weight;
            END IF;
        END IF;
    END LOOP;
    
    -- Calcular puntuación de completitud
    IF total_weight > 0 THEN
        NEW.completeness_score := (completed_weight / total_weight) * 100;
    ELSE
        NEW.completeness_score := 0;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Constantes de Dominio

### 1. Operaciones de Propiedad

```typescript
export const PROPERTY_OPERATIONS = [
  "venta",
  "alquiler",
  "vacacional"
] as const;
```

### 2. Tipos de Propiedad

```typescript
export const PROPERTY_TYPES = [
  "apartamento",
  "casa",
  "townhouse",
  "anexo",
  "edificio",
  "galpon",
  "habitacion",
  "hacienda_finca",
  "local",
  "oficina",
  "terreno_lote"
] as const;
```

### 3. Estados de Propiedad

```typescript
export const PROPERTY_STATUSES = [
  "activa",
  "reservada",
  "vendida",
  "alquilada",
  "cerrada"
] as const;
```

### 4. Condiciones de Propiedad

```typescript
export const PROPERTY_CONDITIONS = [
  "nuevo",
  "excelente",
  "buen_estado",
  "por_remodelar",
  "en_gris"
] as const;
```

### 5. Opciones de Amueblado

```typescript
export const FURNISHED_OPTIONS = [
  "no",
  "parcial",
  "completo"
] as const;
```

### 6. Tipos de Gas

```typescript
export const GAS_TYPES = [
  "natural",
  "butano",
  "propano"
] as const;
```

### 7. Tipos de Cocina

```typescript
export const KITCHEN_TYPES = [
  "moderna",
  "tradicional",
  "americana"
] as const;
```

### 8. Municipios

```typescript
export const MUNICIPIOS = [
  "baruta",
  "chacao",
  "el_hilario",
  "la_guaira",
  "los_rodillos",
  "maturin",
  "merida",
  "petare",
  "santa_lucia",
  "vargas",
  "zulia"
] as const;
```

### 9. Categorías de Características

```typescript
export const FEATURE_CATEGORIES = [
  "estructura",
  "servicios",
  "seguridad",
  "comodidades",
  "medio_ambiente",
  "otros"
] as const;
```

### 10. Opciones de Amenidades

```typescript
export const AMENITIES_OPTIONS = [
  "piscina",
  "gimnasio",
  "jardin",
  "terraza",
  "balcon",
  "aire_acondicionado",
  "calefaccion",
  "lavanderia",
  "ascensor",
  "parque",
  "estacionamiento",
  "seguridad_24h",
  "cctv",
  "intercomunicador",
  "puerta_blindada",
  "agua_caliente",
  "tanque_de_agua",
  "generador",
  "internet",
  "puerta_electrica",
  "valla_electrica",
  "casa_de_cuidadores",
  "sala_de_juegos",
  "salon_de_fiestas",
  "parrilla",
  "cancha_deportiva"
] as const;
```

### 11. Opciones de Mobiliario

```typescript
export const FURNITURE_OPTIONS = [
  "sofa",
  "cama",
  "mesa",
  "silla",
  "armario",
  "televisor",
  "refrigerador",
  "horno",
  "microondas",
  "lavadora",
  "secadora",
  "aire_acondicionado",
  "calefaccion",
  "ventilador",
  "cortinas",
  "alfombra",
  "espejo",
  "lampara",
  "estanteria",
  "escritorio"
] as const;
```

### 12. Servicios Incluidos

```typescript
export const SERVICES_INCLUDED_OPTIONS = [
  "agua",
  "luz",
  "gas",
  "internet",
  "limpieza",
  "mantenimiento",
  "seguridad",
  "jardin",
  "piscina",
  "gimnasio",
  "estacionamiento",
  "cable",
  "telefono",
  "basura",
  "conserje"
] as const;
```

### 13. Servicios de Zona

```typescript
export const ZONE_SERVICES_OPTIONS = [
  "escuelas",
  "hospitales",
  "centros_comerciales",
  "parques",
  "transporte_publico",
  "supermercados",
  "farmacias",
  "restaurantes",
  "bancos",
  "estaciones_de_servicio",
  "centros_deportivos",
  "bibliotecas",
  "iglesias",
  "policias",
  "bomberos"
] as const;
```

### 14. Distintivos de Listado

```typescript
export const LISTING_BADGES = [
  "basico",
  "destacado",
  "premium"
] as const;
```

## Lógica de Discriminación de Campos

La lógica de discriminación de campos determina qué campos se muestran en el formulario según el tipo de propiedad y la operación seleccionada. Esta lógica se implementa en `src/utils/propertyDiscrimination.ts`.

```typescript
export const checkFieldApplies = (fieldOrGroup: string, type: string, op: string): boolean => {
  switch (fieldOrGroup) {
    case "maintenance_fee":
      return op === "renta" || op === "venta_renta";
    case "price_per_night":
    case "price_weekend":
    case "min_nights":
    case "max_guests":
    case "checkin_time":
    case "checkout_time":
    case "house_rules":
    case "includes_breakfast":
      return op === "renta" || op === "venta_renta";
    case "has_water_tank":
    case "has_hot_water":
    case "has_generator":
    case "gas_type":
    case "has_internet":
    case "has_security_24h":
    case "has_electric_gate":
    case "has_cctv":
    case "has_electric_fence":
    case "has_intercom":
    case "has_armored_door":
    case "has_ac":
    case "has_heating":
    case "kitchen_type":
    case "bathroom_type":
    case "host_housing_type":
    case "cohabitation":
    case "occupants_count":
    case "gender_policy":
    case "deposit_required":
    case "deposit_amount":
    case "allows_pets":
    case "allows_cooking":
    case "has_independent_entrance":
      return type === "apartamento" || type === "casa" || type === "townhouse" || type === "anexo" || type === "habitacion";
    case "topography":
    case "land_use":
    case "access_type":
    case "current_use":
    case "has_own_water":
    case "area_hectares":
      return type === "terreno_lote" || type === "hacienda_finca";
    case "area_built":
    case "area_total":
    case "bedrooms":
    case "bathrooms":
    case "half_bathrooms":
    case "parking_spaces":
    case "parking_covered":
    case "total_floors":
    case "floor_number":
    case "property_age":
    case "year_built":
    case "condition":
    case "furnished":
    case "municipio":
    case "zone_id":
    case "address_es":
    case "address_en":
    case "lat":
    case "lng":
    case "show_exact_location":
      return true;
    default:
      return false;
  }
};
```

La función `isCombinationInconsistent` valida combinaciones incompatibles:

```typescript
export const isCombinationInconsistent = (type: string, op: string): boolean => {
  // No se permite la operación "intercambio" con ciertos tipos de propiedad
  if (op === "intercambio" && (type === "terreno_lote" || type === "hacienda_finca")) {
    return true;
  }
  
  // No se permite la operación "venta" con propiedades que requieren renta
  if (op === "venta" && (type === "habitacion")) {
    return true;
  }
  
  return false;
};
```

## Sistema de Puntuación de Completitud

El sistema de puntuación de completitud evalúa cuán completa está una lista de propiedad y proporciona recomendaciones para mejorarla. Se implementa en `src/utils/propertyCompleteness.ts`.

### 1. Configuración de Puntuación

```typescript
export interface FieldScoreConfig {
  field: string;
  weight: number;
  required: boolean;
}

export const SCORE_CONFIG: FieldScoreConfig[] = [
  { field: "operation", weight: 5, required: true },
  { field: "property_type", weight: 5, required: true },
  { field: "status", weight: 5, required: true },
  { field: "listing_badge", weight: 5, required: false },
  { field: "title_es", weight: 5, required: true },
  { field: "title_en", weight: 5, required: true },
  { field: "description_es", weight: 10, required: true },
  { field: "description_en", weight: 10, required: true },
  { field: "price", weight: 5, required: true },
  { field: "price_currency", weight: 5, required: true },
  { field: "price_negotiable", weight: 5, required: false },
  { field: "price_usd", weight: 5, required: false },
  { field: "maintenance_fee", weight: 5, required: false },
  { field: "maintenance_fee_currency", weight: 5, required: false },
  { field: "price_per_night", weight: 5, required: false },
  { field: "price_weekend", weight: 5, required: false },
  { field: "min_nights", weight: 5, required: false },
  { field: "max_guests", weight: 5, required: false },
  { field: "checkin_time", weight: 5, required: false },
  { field: "checkout_time", weight: 5, required: false },
  { field: "house_rules", weight: 5, required: false },
  { field: "includes_breakfast", weight: 5, required: false },
  { field: "area_built", weight: 5, required: false },
  { field: "area_total", weight: 5, required: false },
  { field: "area_hectares", weight: 5, required: false },
  { field: "bedrooms", weight: 5, required: false },
  { field: "bathrooms", weight: 5, required: false },
  { field: "half_bathrooms", weight: 5, required: false },
  { field: "parking_spaces", weight: 5, required: false },
  { field: "parking_covered", weight: 5, required: false },
  { field: "total_floors", weight: 5, required: false },
  { field: "floor_number", weight: 5, required: false },
  { field: "property_age", weight: 5, required: false },
  { field: "year_built", weight: 5, required: false },
  { field: "condition", weight: 5, required: false },
  { field: "furnished", weight: 5, required: false },
  { field: "municipio", weight: 5, required: true },
  { field: "zone_id", weight: 5, required: true },
  { field: "address_es", weight: 5, required: true },
  { field: "address_en", weight: 5, required: true },
  { field: "lat", weight: 5, required: true },
  { field: "lng", weight: 5, required: true },
  { field: "show_exact_location", weight: 5, required: false },
  { field: "has_elevator", weight: 5, required: false },
  { field: "has_water_tank", weight: 5, required: false },
  { field: "has_hot_water", weight: 5, required: false },
  { field: "has_generator", weight: 5, required: false },
  { field: "gas_type", weight: 5, required: false },
  { field: "has_internet", weight: 5, required: false },
  { field: "has_security_24h", weight: 5, required: false },
  { field: "has_electric_gate", weight: 5, required: false },
  { field: "has_cctv", weight: 5, required: false },
  { field: "has_electric_fence", weight: 5, required: false },
  { field: "has_intercom", weight: 5, required: false },
  { field: "has_armored_door", weight: 5, required: false },
  { field: "has_ac", weight: 5, required: false },
  { field: "has_heating", weight: 5, required: false },
  { field: "kitchen_type", weight: 5, required: false },
  { field: "bathroom_type", weight: 5, required: false },
  { field: "host_housing_type", weight: 5, required: false },
  { field: "cohabitation", weight: 5, required: false },
  { field: "occupants_count", weight: 5, required: false },
  { field: "gender_policy", weight: 5, required: false },
  { field: "deposit_required", weight: 5, required: false },
  { field: "deposit_amount", weight: 5, required: false },
  { field: "allows_pets", weight: 5, required: false },
  { field: "allows_cooking", weight: 5, required: false },
  { field: "has_independent_entrance", weight: 5, required: false },
  { field: "topography", weight: 5, required: false },
  { field: "land_use", weight: 5, required: false },
  { field: "access_type", weight: 5, required: false },
  { field: "current_use", weight: 5, required: false },
  { field: "has_own_water", weight: 5, required: false },
  { field: "video_url", weight: 5, required: false },
  { field: "virtual_tour_url", weight: 5, required: false },
  { field: "images", weight: 10, required: true },
  { field: "features", weight: 10, required: false }
];
```

### 2. Cálculo de Puntuación

```typescript
export function computeCompletenessScore(
  data: Record<string, any>,
  images: PropertyImage[],
  features: PropertyFeature[]
): { score: number; recommendations: { label: string; weight: number; field: string }[] } {
  let totalWeight = 0;
  let completedWeight = 0;
  const recommendations: { label: string; weight: number; field: string }[] = [];

  Object.entries(SCORE_CONFIG).forEach(([field, cfg]) => {
    totalWeight += cfg.weight;
    
    if (field === "images") {
      if (images.length > 0) {
        completedWeight += cfg.weight;
      } else if (cfg.required) {
        recommendations.push({
          label: "Añade al menos una imagen de la propiedad",
          weight: cfg.weight,
          field: "images"
        });
      }
    } else if (field === "features") {
      if (features.length > 0) {
        completedWeight += cfg.weight;
      } else if (cfg.required) {
        recommendations.push({
          label: "Añade características relevantes a la propiedad",
          weight: cfg.weight,
          field: "features"
        });
      }
    } else {
      const value = data[field];
      if (value !== null && value !== undefined && value !== "" && value !== false) {
        completedWeight += cfg.weight;
      } else if (cfg.required) {
        const labelMap: Record<string, string> = {
          "operation": "Selecciona la operación de la propiedad",
          "property_type": "Selecciona el tipo de propiedad",
          "status": "Selecciona el estado de la propiedad",
          "title_es": "Añade un título en español",
          "title_en": "Añade un título en inglés",
          "description_es": "Añade una descripción en español",
          "description_en": "Añade una descripción en inglés",
          "price": "Añade el precio de la propiedad",
          "price_currency": "Selecciona la moneda del precio",
          "municipio": "Selecciona el municipio",
          "zone_id": "Selecciona la zona",
          "address_es": "Añade la dirección en español",
          "address_en": "Añade la dirección en inglés",
          "lat": "Añade la latitud",
          "lng": "Añade la longitud"
        };
        
        const label = labelMap[field] || `Completa el campo ${field}`;
        recommendations.push({
          label,
          weight: cfg.weight,
          field
        });
      }
    }
  });

  const score = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
  
  return {
    score,
    recommendations: recommendations.sort((a, b) => b.weight - a.weight)
  };
}
```

## Formulario de Propiedad (PropertyForm)

El componente principal de gestión de propiedades se encuentra en `src/components/panel/PropertyForm.tsx`. Este componente dinámico renderiza campos específicos según el tipo de propiedad y operación seleccionada.

### 1. Estructura del Formulario

El formulario está organizado en secciones lógicas:

1. **Clasificación y Publicación**: Operación, tipo de propiedad, estado, distintivo
2. **Contenido de la Publicación**: Títulos y descripciones en español e inglés
3. **Precio y Condiciones Financieras**: Precio, tarifas, condiciones
4. **Dimensiones y Estructura**: Área, habitaciones, baños, condiciones
5. **Fotos de la Propiedad**: Gestión de imágenes con arrastre y ordenamiento
6. **Ubicación**: Municipio, zona, dirección, coordenadas
7. **Servicios, Amenidades y Seguridad**: Características de servicios y seguridad
8. **Condiciones de Habitación**: Para propiedades compartidas
9. **Parámetros de Terreno y Campo**: Para terrenos y fincas
10. **Video y Tour Virtual**: URLs de video y tour virtual

### 2. Lógica de Renderizado Dinámico

```typescript
const sectionClasificacion = (
  <SectionCard title="Clasificación y Publicación" layoutId="sec-clasificacion">
    <div id="operation">
      <FormSelect
        value={form.operation}
        onChange={(val) => setForm({ ...form, operation: val })}
        options={PROPERTY_OPERATIONS.map((op) => ({
          value: op,
          label: t(`operations.${op}`)
        }))}
        placeholder={t("select_operation")}
      />
    </div>
    
    <div id="property_type">
      <FormSelect
        value={form.property_type}
        onChange={(val) => setForm({ ...form, property_type: val })}
        options={PROPERTY_TYPES.map((type) => ({
          value: type,
          label: t(`property_types.${type}`)
        }))}
        placeholder={t("select_property_type")}
      />
    </div>
    
    <div>
      <FormSelect
        value={form.status}
        onChange={(val) => setForm({ ...form, status: val })}
        options={PROPERTY_STATUSES.map((status) => ({
          value: status,
          label: t(`statuses.${status}`)
        }))}
        placeholder={t("select_status")}
      />
    </div>
    
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px 16px" }}>
      <Toggle
        checked={hasBadge("destacado")}
        onChange={(v) => toggleBadge("destacado", v)}
        label={t("listing_badges.destacado")}
      />
      <Toggle
        checked={hasBadge("premium")}
        onChange={(v) => toggleBadge("premium", v)}
        label={t("listing_badges.premium")}
      />
    </div>
  </SectionCard>
);
```

### 3. Gestión de Imágenes

```typescript
const sectionFotos = (
  <SectionCard 
    title="Fotos de la propiedad (hasta 20)" 
    layoutId="sec-fotos" 
    id="images" 
    warningText={imageWarning}
    onWarning={triggerToast}
  >
    <ImageDropzone 
      images={images} 
      onAdd={handleAddImages} 
      onRemove={handleRemoveImage} 
      onReorder={handleReorderImages} 
      onSetCover={handleSetCoverImage} 
    />
  </SectionCard>
);
```

### 4. Validación y Guardado Automático

```typescript
const handleAutosave = useCallback(async () => {
  if (!form.operation || !form.property_type) return;
  
  const { score, recommendations } = computeCompletenessScore(form, images, features);
  setCompletenessScore(score);
  setRecommendations(recommendations);
  
  // Guardar automáticamente cada 60 segundos
  if (isDirty) {
    try {
      const { data, error } = await supabase
        .from("properties")
        .upsert({
          id: propertyId,
          ...form,
          completeness_score: score,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Actualizar traducciones
      if (form.title_es || form.description_es) {
        await supabase
          .from("property_translations")
          .upsert({
            property_id: propertyId,
            locale: "es",
            title: form.title_es,
            description: form.description_es
          });
      }
      
      if (form.title_en || form.description_en) {
        await supabase
          .from("property_translations")
          .upsert({
            property_id: propertyId,
            locale: "en",
            title: form.title_en,
            description: form.description_en
          });
      }
      
      // Actualizar imágenes
      if (images.length > 0) {
        await Promise.all(
          images.map(async (img) => {
            if (img.id) {
              await supabase
                .from("property_images")
                .update({
                  sort_order: img.sort_order,
                  is_cover: img.is_cover
                })
                .eq("id", img.id);
            }
          })
        );
      }
      
      setIsDirty(false);
    } catch (err) {
      console.error("Error guardando automáticamente:", err);
    }
  }
}, [form, images, features, propertyId, isDirty]);
```

## Consultas a la Base de Datos

### 1. Consultas de Propiedades

```typescript
export async function getProperties(filters: PropertyFilters = {}): Promise<{
  data: PropertyCard[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const supabase = await getSupabaseClient();
  
  let query = supabase
    .from("properties")
    .select(
      "id, operation, property_type, status, listing_badge, featured, exclusive, new_listing, price_reduced, price, price_currency, price_negotiable, price_usd, maintenance_fee, maintenance_fee_currency, price_per_night, price_weekend, min_nights, max_guests, checkin_time, checkout_time, house_rules, includes_breakfast, area_built, area_total, area_hectares, bedrooms, bathrooms, half_bathrooms, parking_spaces, parking_covered, total_floors, floor_number, property_age, year_built, condition, furnished, municipio, zone_id, address_es, address_en, lat, lng, show_exact_location, has_elevator, has_water_tank, has_hot_water, has_generator, gas_type, has_internet, has_security_24h, has_electric_gate, has_cctv, has_electric_fence, has_intercom, has_armored_door, has_ac, has_heating, kitchen_type, bathroom_type, host_housing_type, cohabitation, occupants_count, gender_policy, deposit_required, deposit_amount, allows_pets, allows_cooking, has_independent_entrance, topography, land_use, access_type, current_use, has_own_water, video_url, virtual_tour_url, completeness_score, created_at, updated_at"
    )
    .order("created_at", { ascending: false });
  
  // Aplicar filtros
  if (filters.operation) {
    query = query.eq("operation", filters.operation);
  }
  
  if (filters.property_type) {
    query = query.eq("property_type", filters.property_type);
  }
  
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  
  if (filters.featured !== undefined) {
    query = query.eq("featured", filters.featured);
  }
  
  if (filters.exclusive !== undefined) {
    query = query.eq("exclusive", filters.exclusive);
  }
  
  if (filters.listing_badge) {
    query = query.eq("listing_badge", filters.listing_badge);
  }
  
  if (filters.municipio) {
    query = query.eq("municipio", filters.municipio);
  }
  
  if (filters.zone_id) {
    query = query.eq("zone_id", filters.zone_id);
  }
  
  // Paginación
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const offset = (page - 1) * limit;
  
  query = query.range(offset, offset + limit - 1);
  
  const { data, error, count } = await query;
  
  if (error) throw error;
  
  const mappedData: PropertyCard[] = data.map((item: any) => ({
    id: item.id,
    operation: item.operation,
    property_type: item.property_type,
    status: item.status,
    listing_badge: item.listing_badge,
    featured: item.featured,
    exclusive: item.exclusive,
    new_listing: item.new_listing,
    price_reduced: item.price_reduced,
    price: item.price,
    price_currency: item.price_currency,
    price_negotiable: item.price_negotiable,
    price_usd: item.price_usd,
    maintenance_fee: item.maintenance_fee,
    maintenance_fee_currency: item.maintenance_fee_currency,
    price_per_night: item.price_per_night,
    price_weekend: item.price_weekend,
    min_nights: item.min_nights,
    max_guests: item.max_guests,
    checkin_time: item.checkin_time,
    checkout_time: item.checkout_time,
    house_rules: item.house_rules,
    includes_breakfast: item.includes_breakfast,
    area_built: item.area_built,
    area_total: item.area_total,
    area_hectares: item.area_hectares,
    bedrooms: item.bedrooms,
    bathrooms: item.bathrooms,
    half_bathrooms: item.half_bathrooms,
    parking_spaces: item.parking_spaces,
    parking_covered: item.parking_covered,
    total_floors: item.total_floors,
    floor_number: item.floor_number,
    property_age: item.property_age,
    year_built: item.year_built,
    condition: item.condition,
    furnished: item.furnished,
    municipio: item.municipio,
    zone_id: item.zone_id,
    address_es: item.address_es,
    address_en: item.address_en,
    lat: item.lat,
    lng: item.lng,
    show_exact_location: item.show_exact_location,
    has_elevator: item.has_elevator,
    has_water_tank: item.has_water_tank,
    has_hot_water: item.has_hot_water,
    has_generator: item.has_generator,
    gas_type: item.gas_type,
    has_internet: item.has_internet,
    has_security_24h: item.has_security_24h,
    has_electric_gate: item.has_electric_gate,
    has_cctv: item.has_cctv,
    has_electric_fence: item.has_electric_fence,
    has_intercom: item.has_intercom,
    has_armored_door: item.has_armored_door,
    has_ac: item.has_ac,
    has_heating: item.has_heating,
    kitchen_type: item.kitchen_type,
    bathroom_type: item.bathroom_type,
    host_housing_type: item.host_housing_type,
    cohabitation: item.cohabitation,
    occupants_count: item.occupants_count,
    gender_policy: item.gender_policy,
    deposit_required: item.deposit_required,
    deposit_amount: item.deposit_amount,
    allows_pets: item.allows_pets,
    allows_cooking: item.allows_cooking,
    has_independent_entrance: item.has_independent_entrance,
    topography: item.topography,
    land_use: item.land_use,
    access_type: item.access_type,
    current_use: item.current_use,
    has_own_water: item.has_own_water,
    video_url: item.video_url,
    virtual_tour_url: item.virtual_tour_url,
    completeness_score: item.completeness_score,
    created_at: item.created_at,
    updated_at: item.updated_at
  }));
  
  return {
    data: mappedData,
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit)
  };
}
```

### 2. Consultas de Zonas

```typescript
export async function getZones(): Promise<Zone[]> {
  const supabase = await getSupabaseClient();
  
  const { data, error } = await supabase
    .from("zones")
    .select("id, name_es, name_en, description_es, description_en, lat, lng");
  
  if (error) throw error;
  
  return data as Zone[];
}
```

### 3. Consultas de Blog

```typescript
export async function getBlogPosts(locale: "es" | "en" = "es"): Promise<BlogPostCard[]> {
  const supabase = await getSupabaseClient();
  
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title_" + locale + ", excerpt_" + locale + ", cover_image, slug, published_at, author_id"
    )
    .eq("status", "publicado")
    .order("published_at", { ascending: false });
  
  if (error) throw error;
  
  return data.map((post: any) => ({
    id: post.id,
    title: post[`title_${locale}`],
    excerpt: post[`excerpt_${locale}`],
    coverImage: post.cover_image,
    slug: post.slug,
    publishedAt: post.published_at,
    authorId: post.author_id
  })) as BlogPostCard[];
}
```

## SEO y Datos Estructurados

### 1. Metadatos SEO

```typescript
export function generatePropertyMetadata({
  property,
  locale
}: GeneratePropertyMetadataOptions): Metadata {
  const title = property?.[`title_${locale}`] || "Propiedad en Knordica";
  const description = property?.[`description_${locale}`] || "Una propiedad impresionante en Knordica";
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://knordica.com/${locale}/propiedades/${property?.slug}`,
      images: [
        {
          url: property?.images?.[0]?.url || "/images/properties/p1.jpg",
          width: 1200,
          height: 630
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [property?.images?.[0]?.url || "/images/properties/p1.jpg"]
    }
  };
}
```

### 2. Datos Estructurados (JSON-LD)

```typescript
export function generatePropertyStructuredData({
  property,
  locale
}: StructuredDataOptions): any {
  if (!property) return null;
  
  const address = property[`address_${locale}`];
  const municipality = property.municipio;
  const zone = property.zone_id;
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property[`title_${locale}`],
    "description": property[`description_${locale}`],
    "url": `https://knordica.com/${locale}/propiedades/${property.slug}`,
    "image": property.images?.[0]?.url || "https://knordica.com/images/properties/p1.jpg",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": address,
      "addressLocality": municipality,
      "addressRegion": zone,
      "addressCountry": "VE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": property.lat,
      "longitude": property.lng
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": property.price_currency,
      "price": property.price,
      "availability": property.status === "publicado" ? "InStock" : "OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Knordica"
      }
    }
  };
  
  // Añadir características adicionales según el tipo de propiedad
  if (property.property_type === "apartamento" || property.property_type === "casa") {
    structuredData["numberOfRooms"] = property.bedrooms + property.bathrooms;
    structuredData["area"] = {
      "@type": "QuantitativeValue",
      "value": property.area_built,
      "unitText": "m²"
    };
  }
  
  if (property.property_type === "terreno_lote" || property.property_type === "hacienda_finca") {
    structuredData["area"] = {
      "@type": "QuantitativeValue",
      "value": property.area_hectares,
      "unitText": "ha"
    };
  }
  
  // Añadir características de servicios
  const amenities = [];
  if (property.has_elevator) amenities.push("ascensor");
  if (property.has_water_tank) amenities.push("tanque_de_agua");
  if (property.has_hot_water) amenities.push("agua_caliente");
  if (property.has_generator) amenities.push("generador");
  if (property.has_internet) amenities.push("internet");
  if (property.has_security_24h) amenities.push("seguridad_24h");
  if (property.has_electric_gate) amenities.push("puerta_electrica");
  if (property.has_cctv) amenities.push("cctv");
  if (property.has_electric_fence) amenities.push("valla_electrica");
  if (property.has_intercom) amenities.push("intercomunicador");
  if (property.has_armored_door) amenities.push("puerta_blindada");
  if (property.has_ac) amenities.push("aire_acondicionado");
  if (property.has_heating) amenities.push("calefaccion");
  if (property.has_independent_entrance) amenities.push("entrada_independiente");
  
  if (amenities.length > 0) {
    structuredData["amenities"] = amenities;
  }
  
  return structuredData;
}
```

## Cliente Supabase

### 1. Cliente Cliente

```typescript
export function createClient() {
  return createClientSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 2. Cliente Servidor

```typescript
export async function createClient() {
  const supabase = createClientSupabase(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // Establecer el rol de servicio para acceso completo
  supabase.auth.setAuth(process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  return supabase;
}
```

### 3. Middleware de Sesión

```typescript
export async function updateSession(request: NextRequest) {
  const supabase = createClientSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const {
    data: { session }
  } = await supabase.auth.getSession();
  
  if (session) {
    // Actualizar la sesión en las cookies
    const cookiesToSet = [
      {
        name: "sb-access-token",
        value: session.access_token,
        options: { httpOnly: true, secure: true, maxAge: 60 * 60 * 24 }
      },
      {
        name: "sb-refresh-token",
        value: session.refresh_token,
        options: { httpOnly: true, secure: true, maxAge: 60 * 60 * 24 }
      }
    ];
    
    setAll(cookiesToSet);
  }
}
```

## Utilidades

### 1. Formateo de Números y Moneda

```typescript
export function formatPrice(price: number, currency: string = "USD", locale: "es" | "en" = "es"): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(price);
}

export function formatArea(area: number | null | undefined, locale: "es" | "en" = "es"): string {
  if (area === null || area === undefined) return "";
  
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return `${formatter.format(area)} m²`;
}

export function formatNumber(num: number | null | undefined, locale: "es" | "en" = "es"): string {
  if (num === null || num === undefined) return "";
  
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(num);
}
```

### 2. Combinación de Clases CSS

```typescript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}
```

## Datos de Prueba (Mock Data)

Los datos de prueba se utilizan para el desarrollo y pruebas locales. Se encuentran en `src/lib/mock-data.ts` y contienen:

- Zonas de ejemplo
- Propiedades de ejemplo con todos los campos completos
- Testimonios de clientes
- Publicaciones de blog

Los datos de prueba permiten a los desarrolladores trabajar sin necesidad de una base de datos real y facilitan la prueba de diferentes escenarios.

## Integración de Framer Motion

Las animaciones se implementan mediante Framer Motion en componentes clave:

- Transiciones suaves entre páginas
- Animaciones de entrada y salida para componentes
- Efectos de arrastre en el formulario de propiedades
- Animaciones de carga para listas

Las variantes de animación se definen en `src/lib/motion/variants.ts` y se aplican a través de propiedades específicas en los componentes.

## Sistema de Notificaciones

El sistema de notificaciones utiliza Zustand para gestionar el estado de las notificaciones y se implementa en `src/store/toast.store.ts`. Las notificaciones se muestran cuando:

- Se guarda una propiedad
- Se elimina una propiedad
- Se duplica una propiedad
- Ocurre un error en el formulario

Las notificaciones tienen un temporizador de desaparición automática y pueden ser cerradas manualmente.

## Integración de i18n

La aplicación soporta internacionalización completa con:

- Diccionarios de traducción para español e inglés en `src/i18n/dictionaries/`
- Configuración de idioma en `src/i18n/config.ts`
- Función `get-dictionary.ts` para cargar diccionarios según el idioma
- Traducción de todos los textos del UI

El idioma se detecta automáticamente desde la URL (`/[locale]/`) y se aplica a todo el sistema.

## Pruebas y Calidad

La aplicación incluye:

- Pruebas unitarias para funciones de utilidad
- Pruebas de integración para componentes clave
- Pruebas de E2E para flujos de usuario
- Linting con ESLint
- Formateo con Prettier
- Tipado TypeScript estricto

## Despliegue y Mantenimiento

- Despliegue en Vercel para el frontend
- Despliegue en Supabase para el backend
- Actualizaciones automáticas de dependencias
- Monitoreo de errores con Sentry
- Backup de base de datos diario

## Mejoras Futuras

- Integración con Google Maps para mejor visualización de ubicaciones
- Sistema de recomendaciones de propiedades basado en historial de búsqueda
- Integración con WhatsApp para comunicación con clientes
- Sistema de reportes y análisis de ventas
- Aplicación móvil nativa

## Cambios Detectados

- **2026-06-19**: Esquema inicial de la base de datos con tablas para zonas, agentes, propiedades, traducciones, imágenes, características, favoritos, leads, notas de leads, citas y publicaciones de blog.
- **2026-06-21**: Evolución del esquema añadiendo nuevas columnas a la tabla `properties`: municipio, show_exact_location, price_usd, video_url, has_water_tank, has_hot_water, has_generator, gas_type, has_internet, has_security_24h, has_electric_gate, has_cctv, has_electric_fence, has_intercom, has_armored_door, floor_number, total_floors, has_elevator, property_age, condition, furnished, parking_covered, has_ac, has_heating, kitchen_type, furniture_inventory, amenities, bathroom_type, host_housing_type, cohabitation, occupants_count, gender_policy, deposit_required, deposit_amount, services_included, allows_pets, allows_cooking, has_independent_entrance, topography, land_use, zone_services, area_hectares, has_own_water, access_type, current_use, price_per_night, price_weekend, min_nights, max_guests, checkin_time, checkout_time, house_rules, includes_breakfast, completeness_score, listing_badge.
- **2026-06-23**: Añadidas columnas `maintenance_fee` y `maintenance_fee_currency` a la tabla `properties` para soportar tarifas de mantenimiento.
- **2026-06-23**: Añadidas columnas `virtual_tour_url` y `maintenance_fee_currency` para corregir inconsistencias en el formulario.
- **2026-06-24**: Implementadas políticas RLS para las tablas `properties`, `property_translations`, `property_images` y `property_features` para garantizar la seguridad de los datos.
- **2026-06-24**: Eliminados los valores por defecto de las columnas booleanas y actualizada la función de trigger para el cálculo de la puntuación de completitud.
- **2026-06-26**: Normalizados los valores de los enums para `condition`, `furnished` y `kitchen_type` para asegurar consistencia en los datos.

El sistema ha evolucionado desde una plataforma básica de listado de propiedades hasta una solución completa de gestión inmobiliaria con un sistema de puntuación de completitud, lógica de discriminación de campos y soporte multilingüe.

<!-- ════════════════════════════════════════════════
     BLOQUE B — CONTEXTO DE SESIÓN
     Gestionado exclusivamente por context-chat-dev.md
     ════════════════════════════════════════════════ -->

## Reglas de Negocio y Decisiones de Producto

- **Regla**: Score de Completitud al 99% si falta algún parámetro.
  - *Justificación*: El score de completitud nunca debe marcar 100% si hay parámetros sin responder, reservando el 100% únicamente para cuando la propiedad esté completamente rellenada.
  - *Decisión final*: Modificar `propertyCompleteness.ts` para aplicar un tope matemático estricto del 99% si se detecta cualquier recomendación pendiente.
  - *Alcance*: Formulario de nueva propiedad y edición de propiedad.

- **Regla**: Drag-and-Drop desactivado en favor de layout fijo.
  - *Justificación*: En React 19, el reordenamiento dinámico causaba loops infinitos de actualización de estado y colisiones de gestos en el acordeón de tarjetas.
  - *Decisión*: Reemplazar con flexbox estático de dos columnas en `PropertyForm`.

## Decisiones Técnicas Tomadas

- **DT-10: Edición quirúrgica de documentación de contexto**
  - *Qué se decidió*: Evitar regenerar `context.md` desde cero borrando secciones históricas. En su lugar, realizar reemplazos de contenido multilínea hiper-enfocados.
  - *Contexto*: El modelo borró accidentalmente el 90% de la base de conocimiento histórico de base de datos y lógica del formulario.
  - *Motivo*: Preservar la base de conocimiento acumulada por agentes previos y minimizar el desperdicio de tokens.
  - *Fecha*: 2026-06-28.

## Backlog Técnico Priorizado

- **Validación de Integración de Formularios** (🔴 Alta)
  - *Descripción*: Verificar que el unificado de PropertyForm opera sin errores en los endpoints de nueva/editar tras la unificación y el Fast-Forward merge a `main`.
  - *Archivos*: `src/components/panel/PropertyForm.tsx`, `src/app/[locale]/panel/propiedades/`.
  - *Notas*: Probar con un nuevo registro desde cero y guardar.

## Patrones a Evitar

- **Anti-patrón**: Sobreescribir archivos de documentación grandes (`context.md`) mediante herramientas de escritura destructivas (`write_to_file`) sin validar el contenido anterior.
  - *Por qué falla*: Elimina conocimiento histórico insustituible que el modelo no puede inferir solo leyendo el código actual.
  - *Qué hacer*: Usar `multi_replace_file_content` o `replace_file_content` para realizar parches controlados y específicos.

## Contexto de Sesión Activa

- **Qué se trabajó**: Restauración de `context.md` al estado original tras borrado destructivo. Corrección manual y quirúrgica de discrepancias críticas de constantes y versiones de framework.
- **En qué punto quedó**: Sincronización de constantes inmobiliarias (`PROPERTY_OPERATIONS`, `PROPERTY_STATUSES`, `PROPERTY_CONDITIONS`) y versión de Next.js.
- **Siguiente paso concreto**: Ejecutar validaciones en el entorno de desarrollo y continuar con las tareas del Backlog.
