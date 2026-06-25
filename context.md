# Knordica — context.md
> Generado: 2026-06-25. Actualizar en cada sesión de trabajo.

---

## Análisis de Consistencia (modo actualización)

### Qué cambió respecto al contexto anterior
1. **Sistema DnD del PropertyForm** — Se atravesaron tres arquitecturas en esta conversación:
   - `framer-motion Reorder` → descartado (solo cálculos 1D)
   - `@hello-pangea/dnd` → descartado (no maneja wrap de altura variable)
   - `@dnd-kit` con `rectSortingStrategy` en lista única → descartado (forzaba alineación, gaps)
   - **Estado final**: `@dnd-kit` con dos `SortableContext` independientes (left + right), cada uno con `verticalListSortingStrategy`
2. **Bug loop infinito resuelto** — `useSensor` creaba objetos nuevos en cada render. Fix: constantes de módulo.
3. **Estado open/closed del SectionCard** — Antes completamente local. Ahora controlado: `sectionOpenState` en `PropertyForm`.
4. **Ghost card del DragOverlay** — Reemplazado `DragGhostCard` (mini header) por el `SectionCard` completo con `pointerEvents: none`.
5. **Animación spring** — Cambiado de `ease-out` a `cubic-bezier(0.34, 1.56, 0.64, 1)` (overshoot bubbly).

### Contradicciones detectadas y resueltas
- Contexto previo documentaba `rectSortingStrategy` + flex-wrap como arquitectura DnD. Reemplazado por dos columnas verticales independientes.
- Usuario cambió de opinión sobre tamaño del ghost: 85% escala → tamaño exacto. Documentado en §10 y §7.

### Secciones afectadas en cascada
- §4 (PropertyForm), §7 (Decisiones), §8 (Errores), §9 (Backlog), §10 (Patrones a Evitar)

### Información eliminada
- Referencias a `rectSortingStrategy` y `orderedSectionIds` (arquitectura reemplazada)
- `DragGhostCard` descartado

---

## 1. Identidad del Proyecto

**Knordica** es una plataforma inmobiliaria SaaS orientada al mercado venezolano (foco inicial: Mérida, Venezuela), para inmobiliarias y agentes independientes. Tiene dos frentes: **sitio público** para compradores/inquilinos, y **panel privado** para agentes/administradores.

**Problema**: Las inmobiliarias venezolanas operan con herramientas fragmentadas (WhatsApp, hojas de cálculo). Knordica centraliza listados, leads, agenda y analítica con gamificación de completitud de publicaciones.

**Mercado**: Venezuela / Latinoamérica. Idiomas: ES (default) + EN.

### Mapa de la plataforma

#### Sitio público `/(site)`
| Ruta | Descripción | Estado |
|------|-------------|--------|
| `/` | Home — hero, destacadas, zonas | ✅ |
| `/propiedades` | Listado filtrable | ✅ |
| `/propiedades/[slug]` | Ficha de propiedad | ✅ |
| `/mapa` | Mapa con Leaflet | ✅ |
| `/favoritos` | Guardados (auth) | ✅ |
| `/comparar` | Comparador | ⏳ |
| `/herramientas` | Calculadoras | ⏳ |
| `/blog` | Blog | ⏳ |
| `/nosotros` | Institucional | ⏳ |
| `/contacto` | Formulario | ⏳ |
| `/login` | Auth | ✅ |

#### Panel `/panel`
| Ruta | Descripción | Roles | Estado |
|------|-------------|-------|--------|
| `/panel/inicio` | Dashboard KPIs | todos | ✅ |
| `/panel/propiedades` | Listado + gestión | agent, senior, admin | ✅ |
| `/panel/propiedades/nueva` | Crear propiedad | agent, senior, admin | ✅ |
| `/panel/propiedades/editar/[id]` | Editar propiedad | agent, senior, admin | ✅ |
| `/panel/clientes` | CRM leads | agent, senior, admin | ⏳ |
| `/panel/agenda` | Citas | agent, senior, admin | ⏳ |
| `/panel/estadisticas` | Analítica | agent, senior, admin | ⏳ |
| `/panel/favoritos` | Favoritos usuario | user | ⏳ |
| `/panel/mensajes` | Mensajería | user | ⏳ |
| `/panel/perfil` | Perfil | todos | ⏳ |
| `/panel/agentes` | Gestión agentes | admin | ⏳ |
| `/panel/usuarios` | Gestión usuarios | admin | ✅ básico |
| `/panel/blog` | Editor blog | admin | ⏳ |
| `/panel/analitica` | Analítica avanzada | admin | ⏳ |
| `/panel/configuracion` | Ajustes sitio | admin | ⏳ |

---

## 2. Stack y Arquitectura Técnica

### Framework
- **Next.js 16.2.9** (App Router, Turbopack en dev) + **React 19.2.4** + TypeScript 5
- TailwindCSS 4 (solo utilidades — el panel usa CSS custom properties)

### Base de datos
**Supabase** (Project ID: `pvcbicsryyqgapibpbba`). RLS activo en todas las tablas.

#### Tabla `properties`
```
id UUID PK, slug TEXT UNIQUE
operation TEXT CHECK(venta|alquiler|vacacional)
property_type TEXT CHECK(casa|apartamento|townhouse|anexo|edificio|galpon|
                          habitacion|hacienda_finca|local|oficina|terreno_lote)
status TEXT CHECK(activa|vendida|alquilada|reservada|cerrada)
featured BOOL, exclusive BOOL, new_listing BOOL, price_reduced BOOL
price DECIMAL(14,2), price_currency TEXT, price_negotiable BOOL, price_history JSONB, price_usd DECIMAL(14,2)
area_total DECIMAL(10,2), area_built DECIMAL(10,2), area_hectares DECIMAL(10,2)
bedrooms INT, bathrooms INT, half_bathrooms INT, parking_spaces INT, parking_covered BOOL
zone_id UUID FK→zones, address_es TEXT, address_en TEXT
lat DECIMAL(10,8), lng DECIMAL(11,8), municipio TEXT, show_exact_location BOOL
agent_id UUID FK→agents
meta_title_es TEXT, meta_title_en TEXT, meta_description_es TEXT, meta_description_en TEXT
-- Servicios básicos (DEFAULT NULL, no false)
has_water_tank BOOL, has_hot_water BOOL, has_generator BOOL, gas_type TEXT, has_internet BOOL
-- Seguridad (DEFAULT NULL)
has_security_24h BOOL, has_electric_gate BOOL, has_cctv BOOL
has_electric_fence BOOL, has_intercom BOOL, has_armored_door BOOL
-- Estructura
floor_number INT, total_floors INT, has_elevator BOOL, property_age INT, year_built INT
condition TEXT, furnished TEXT, has_ac BOOL, has_heating BOOL
kitchen_type TEXT, furniture_inventory JSONB, amenities JSONB
-- Habitación/Anexo
bathroom_type TEXT, host_housing_type TEXT, cohabitation TEXT, occupants_count INT
gender_policy TEXT, deposit_required BOOL, deposit_amount DECIMAL(10,2)
services_included JSONB, allows_pets BOOL, allows_cooking BOOL, has_independent_entrance BOOL
-- Terreno/Finca
topography TEXT, land_use TEXT, zone_services JSONB, has_own_water BOOL, access_type TEXT, current_use TEXT
-- Vacacional
price_per_night DECIMAL(10,2), price_weekend DECIMAL(10,2), min_nights INT, max_guests INT
checkin_time TEXT, checkout_time TEXT, house_rules TEXT, includes_breakfast BOOL
-- Gamificación
completeness_score INT DEFAULT 0, listing_badge TEXT DEFAULT 'basico'
-- Media
video_url TEXT, virtual_tour_url TEXT
-- Financiero
maintenance_fee DECIMAL, maintenance_fee_currency TEXT DEFAULT 'USD', maintenance_included BOOL
created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ, published_at TIMESTAMPTZ
```

**CRÍTICO**: Los booleans descriptivos (`has_water_tank`, `has_hot_water`, etc.) tienen `DEFAULT NULL`, no `DEFAULT false`. Cambiado en migración `20260624_adjust_schema_and_trigger.sql`.

#### Tabla `property_translations`
```
id UUID PK, property_id UUID FK→properties ON DELETE CASCADE
locale TEXT (es|en), title TEXT, description TEXT, short_description TEXT
UNIQUE(property_id, locale)
```

#### Tabla `property_images`
```
id UUID PK, property_id UUID FK→properties ON DELETE CASCADE
url TEXT, alt_es TEXT, alt_en TEXT, sort_order INT, is_cover BOOL, created_at TIMESTAMPTZ
```

#### Tabla `property_features`
```
id UUID PK, property_id UUID FK→properties ON DELETE CASCADE
category TEXT CHECK(servicios_basicos|seguridad|amenidades|equipamiento|habitacion|vacacional|general)
key TEXT, value_es TEXT, value_en TEXT, icon TEXT
```

#### Tabla `property_videos`
```
id UUID PK, property_id UUID FK→properties ON DELETE CASCADE
url TEXT, title_es TEXT, title_en TEXT, sort_order INT, created_at TIMESTAMPTZ
```

#### Tabla `agents`
```
id UUID PK, user_id UUID FK→auth.users
full_name TEXT, email TEXT UNIQUE, phone TEXT, whatsapp TEXT
bio_es TEXT, bio_en TEXT, avatar_url TEXT
role TEXT DEFAULT 'agent' (agent|senior|admin), active BOOL DEFAULT true, created_at TIMESTAMPTZ
```

#### Otras tablas
- `zones`: Zonas geográficas. Campos: id, slug, name_es, name_en, lat, lng, cover_image_url, featured
- `leads`: CRM. Pipeline: nuevo→contactado→visita→negociacion→cerrado|perdido
- `lead_notes`, `appointments`: Notas y citas de leads
- `favorites`: user_id + property_id UNIQUE
- `blog_posts` + `blog_post_translations`: Blog bilingüe
- `testimonials`, `site_settings`

#### Trigger de completitud
`trg_properties_completeness` — BEFORE INSERT OR UPDATE en `properties`. Versión actual: **trusts the client score** — valida y clampea `completeness_score` (0–100), asigna `listing_badge` solo si el badge es NULL/basico/completo/premium. El cálculo real lo hace el frontend con `computeCompletenessScore()`.

### Servicios externos
| Servicio | Propósito | Estado |
|----------|-----------|--------|
| Supabase Auth | Auth | ✅ |
| Supabase Storage | Imágenes | ✅ |
| Leaflet | Mapa interactivo | ✅ |
| @studio-freight/react-lenis | Smooth scroll | ✅ |
| Recharts | Gráficos KPI | ✅ |

### Estructura de carpetas
```
src/
  app/[locale]/
    (site)/          ← Sitio público
    (cliente)/       ← Área cliente (favoritos, mensajes)
    panel/           ← Panel de gestión
      layout.tsx     ← CSS tokens, sidebar, topbar
      propiedades/
        page.tsx     ← Lista (75KB)
        editar/[id]/
        nueva/
    layout.tsx
    api/leads/, panel/, properties/, revalidate/, upload/
  components/
    panel/
      PropertyForm.tsx        ← Formulario principal (2800 líneas)
      PropertyForm.backup.tsx ← Backup antes del DnD refactor
      PanelSidebar.tsx, PanelTopbar.tsx, DataTable.tsx, KPIChart.tsx, StatCard.tsx
    ui/YesNoSelector.tsx      ← Selector tri-estado (true/false/null)
  hooks/
    usePanelRole.ts, useAutoSave.ts, useFavorites.ts, useFilters.ts
    useKPIData.ts, useProperties.ts, useReveal.ts, useSmartScroll.ts
  utils/
    propertyDiscrimination.ts  ← checkFieldApplies(), isCombinationInconsistent()
    propertyCompleteness.ts    ← computeCompletenessScore(), SCORE_CONFIG
  lib/supabase/, lenis.tsx, constants/, motion/, queries/, seo/, utils/
  i18n/config.ts  ← defaultLocale: 'es', locales: ['es','en']
  store/panelStore.ts  ← Zustand: userRole, userId, setUser
  types/panel.ts  ← PanelRole = 'user'|'agent'|'senior'|'admin'
supabase/migrations/  ← 8 migraciones cronológicas
```

### Convenciones
- Rutas: kebab-case en español
- Componentes: PascalCase `.tsx`
- Hooks: `use` prefix camelCase
- DB fields: snake_case
- CSS panel: custom properties `--p-` (`--p-accent`, `--p-surface`, `--p-radius` = 3px)
- Tokens del panel: `<style>` inline en `PanelLayout` con `:root`

### Patrones arquitectónicos
- **Formularios**: `useState<FormData>`, NO react-hook-form en el panel
- **Auth**: `usePanelRole()` → Zustand, NO React context
- **Fetch**: Supabase client directo, @tanstack/react-query instalado pero no usado en panel
- **i18n**: Prefijo `[locale]` manual, detección por Accept-Language en middleware (sin next-intl)

---

## 3. Roles y Permisos

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| `user` | Cliente/comprador | Solo área cliente |
| `agent` | Agente inmobiliario | Propiedades, Clientes, Agenda, Stats |
| `senior` | Agente senior | = agent + blog |
| `admin` | Administrador | Total |

### Resolución de rol
1. `user.user_metadata.role` de Supabase Auth
2. Si no → query a `agents` por `user_id`
3. Si no está en agents → `'user'` por defecto
4. Cacheado en Zustand `panelStore`

### RLS
- Lectura pública: `zones`, agentes activos, propiedades (activa|reservada|vendida|alquilada), imágenes, traducciones, features, blog publicado, testimonios
- Escritura: solo agentes/admins en properties, translations, images, features, videos
- Favoritos: solo el propio usuario
- Leads: INSERT público, SELECT/UPDATE solo agentes/admins
- Blog: gestión solo senior/admin

### Control de acceso en panel
- `PanelLayout` → `usePanelRole()` — spinner hasta resolver
- `PanelSidebar` filtra `NAV_ITEMS` por `item.roles.includes(role)`
- Sin middleware de redirección por rol (solo por sesión)

---

## 4. Estado del Proyecto por Módulo

### 4.1 PropertyForm — Edición/Creación de Propiedades
**Estado**: 🔄 en progreso — funcional, DnD en refinamiento

**Descripción actual**:
- Formulario único ~2800 líneas en `PropertyForm.tsx`
- Carga datos de propiedad desde Supabase al montar
- Guarda en `properties`, `property_translations`, `property_images` sincrónicamente
- Autosave cada 30s (hook `useAutoSave.ts`) si hay delta
- Barra de progreso `ProgressBar` con score calculado en cliente
- Secciones reorganizables con DnD (`@dnd-kit`)
- `ScrollToField`: clic en recomendaciones → Lenis scroll + highlight de sección

**Secciones del formulario** (IDs DOM invariantes):
| ID | Título | Visible |
|----|--------|---------|
| `sec-clasificacion` | Clasificación y Publicación | Siempre |
| `sec-contenido` | Contenido de la publicación | Siempre |
| `sec-precio` | Precio y Condiciones Financieras | Siempre |
| `sec-dimensiones` | Dimensiones y Estructura | Siempre |
| `sec-ubicacion` | Ubicación | Siempre |
| `sec-fotos` | Fotos de la propiedad (hasta 20) | Siempre |
| `sec-media` | Video y Tour Virtual | Siempre |
| `sec-servicios` | Servicios, Amenidades y Seguridad | type ≠ terreno_lote |
| `sec-compartido` | Condiciones de Habitación | habitacion/anexo + alquiler |
| `sec-terreno` | Parámetros de Terreno y Campo | terreno_lote/hacienda_finca |

**Arquitectura DnD actual**:
- `DndContext` con `closestCorners`
- Dos columnas independientes: `leftColumnIds[]` y `rightColumnIds[]`
- Cada columna: `SortableContext` + `verticalListSortingStrategy`
- `ColumnDroppable` (`useDroppable`) = zona de drop entre columnas
- `SortableSectionItem`: aplica `useSortable`, propaga `dragHandleProps`, `open`, `onOpenChange`
- `DragOverlay`: `SectionCard` completo a tamaño/estado reales, `pointerEvents: none`
- Sensores: constantes de módulo `POINTER_SENSOR_OPTIONS` / `KEYBOARD_SENSOR_OPTIONS`
- Animación vecinos: `transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)` (spring overshoot)

**Estado open/closed**:
- `sectionOpenState: Record<string, boolean>` en `PropertyForm`
- `SectionCard` modo controlado (`open` prop) y no controlado (`defaultOpen`)
- Overlay recibe `open` real al momento de iniciar el drag

**Qué falta**:
- Persistencia del orden de secciones (se resetea al recargar)
- Validación antes de guardar
- Posible jerkiness en cross-column drag (pendiente prueba)

**Archivos**:
- `src/components/panel/PropertyForm.tsx`
- `src/utils/propertyDiscrimination.ts`
- `src/utils/propertyCompleteness.ts`

### 4.2 Panel de Listado de Propiedades
**Estado**: ✅ funcional — `src/app/[locale]/panel/propiedades/page.tsx` (75KB)
- Tabla con ordenamiento, filtros, búsqueda de texto
- Acciones inline: activar/desactivar, duplicar, eliminar
- Batch select, dropdown de status editable inline

### 4.3 Dashboard
**Estado**: 🔄 en progreso — estructura existe, datos parciales. KPIs de propiedades por status y leads recientes funcionan.

### 4.4 Sitio Público
**Estado**: 🔄 en progreso — Home, listado filtrable, ficha, mapa, favoritos funcionan. Comparador/calculadoras/blog pendientes.

### 4.5 CRM / Leads / Agenda
**Estado**: ⏳ pendiente — schema DB completo, UI no implementada

### 4.6 Blog / Usuarios / Admin
**Estado**: ⏳ pendiente — schema DB existe, UI básica o inexistente

---

## 5. Reglas de Negocio y Decisiones de Producto

### Tipos de propiedad válidos
`casa`, `apartamento`, `townhouse`, `anexo`, `edificio`, `galpon`, `habitacion`, `hacienda_finca`, `local`, `oficina`, `terreno_lote`

### Operaciones válidas
`venta`, `alquiler`, `vacacional`

### Combinaciones incompatibles (UI muestra advertencia, no bloquea)
- `venta` + `habitacion`
- `vacacional` + cualquiera de: `galpon`, `local`, `oficina`, `terreno_lote`, `edificio`

### Badge de calidad
- `basico`: 0–40%, `completo`: 41–70%, `premium`: >70%
- El trigger sobreescribe badge SOLO si es uno de los tres estándares. Badges personalizados son inmunes.

### Score de completitud
- Calculado en cliente por `computeCompletenessScore()` con `SCORE_CONFIG`
- Enviado al server como `completeness_score`
- Trigger solo valida rango (0-100) y asigna badge

### Booleans de servicios/seguridad
`null` = sin responder, NO `false`. `YesNoSelector` maneja tres estados. Corregido en `20260624_adjust_schema_and_trigger.sql`.

### Precio vacacional
`price` no aplica para `vacacional`. Usar `price_per_night`. La DB tiene `price NOT NULL` — enviar `0` si es vacacional.

### Imágenes
- Máximo 20 por propiedad
- Portada: `is_cover: true` en `property_images`
- Upload via `/api/upload` a Supabase Storage
- Eliminaciones acumuladas en `removedImages[]`, borradas en batch al guardar

### Scroll to field (ProgressBar — INVARIANTE CRÍTICO)
1. Evento `expand-section-card` con `detail.layoutId`
2. `SectionCard` escucha y se abre si está cerrado
3. Lenis scroll suave al elemento
4. Highlight CSS

Los IDs DOM de secciones (`sec-clasificacion`, etc.) y `layoutId` de `SectionCard` NO PUEDEN CAMBIAR.

---

## 6. Lógica de Discriminación de Campos

`checkFieldApplies(fieldOrGroup, type, operation)` en `propertyDiscrimination.ts`.

| Condición | Campos/Grupos afectados |
|-----------|------------------------|
| `op === 'vacacional'` | `price_per_night`, `price_weekend`, `min_nights`, `max_guests`, `checkin_time`, `checkout_time`, `house_rules`, `includes_breakfast` |
| `op !== 'vacacional'` | `price` |
| `type NOT IN [terreno_lote, local, oficina, galpon, edificio]` | `bedrooms` |
| `type !== terreno_lote` | `bathrooms`, `half_bathrooms`, `year_built`, `condition` |
| `type NOT IN [terreno_lote, galpon, edificio]` | `furnished` |
| `type IN [apartamento, edificio, local, oficina, townhouse]` | `has_elevator` |
| `type !== terreno_lote` | `parking_spaces` |
| `type === edificio` | `unit_count` |
| `type IN [apartamento, oficina, local, edificio]` | `floors` |
| `type IN [apartamento, edificio, local, oficina, townhouse]` | `total_floors` |
| `op !== vacacional AND type IN [apartamento, casa, townhouse, habitacion] OR (edificio+alquiler)` | `maintenance_fee` |
| `type IN [hacienda_finca]` | `area_hectares` |
| `type IN [hacienda_finca, terreno_lote]` | `topography`, `land_use`, `access_type`, `current_use`, `has_own_water` |
| `type IN [habitacion, anexo] AND op === alquiler` | sección `shared_section` |
| `op === alquiler` | `deposit_required`, `deposit_amount` |
| `type IN [habitacion, anexo]` | `has_independent_entrance` |
| `type IN [terreno_lote, hacienda_finca]` | sección `land_section` |
| `type !== terreno_lote` | `services_section`, `security_section` |
| `type IN [casa, townhouse, edificio, galpon, hacienda_finca, terreno_lote]` | `has_electric_fence` |
| `type IN [apartamento, oficina, local]` | `floor_number` |

### Variables de sección dinámica en PropertyForm
```typescript
const hasServices    = checkFieldApplies("services_section", type, op); // type !== terreno_lote
const hasSecurity    = checkFieldApplies("security_section", type, op); // type !== terreno_lote
const hasShared      = checkFieldApplies("shared_section",   type, op); // habitacion/anexo + alquiler
const hasLandSection = checkFieldApplies("land_section",     type, op); // terreno_lote/hacienda_finca
```

---

## 7. Decisiones Técnicas Tomadas

### DT-01: PropertyForm como componente monolítico (~2800 líneas)
Evita prop-drilling complejo. La lógica de discriminación es cohesiva en un lugar. Aceptado como trade-off. (Junio 2026)

### DT-02: `useState<FormData>` en PropertyForm — NO react-hook-form
La discriminación condicional específica hace que los esquemas de validación genéricos sean más complicados. (Junio 2026)

### DT-03: Score de completitud calculado en el cliente
Intento de replicar en PL/pgSQL resultó en scores incorrectos (sin discriminación type×op). El cliente tiene la lógica completa; trigger solo valida. (2026-06-24)

### DT-04: @dnd-kit con dos SortableContext verticales independientes
Evaluadas y descartadas: `framer-motion Reorder` (1D), `@hello-pangea/dnd` (no maneja wrap variable), `rectSortingStrategy` único (alineación forzada). (2026-06-24/25)

### DT-05: Sensores DnD como constantes de módulo
`useSensor` usa `useMemo([sensor, options])`. Objeto literal inline siempre nuevo → loop infinito. Fix: constantes `POINTER_SENSOR_OPTIONS` y `KEYBOARD_SENSOR_OPTIONS` a nivel de módulo. (2026-06-25)

### DT-06: Estado open/closed de SectionCard levantado a PropertyForm
`DragOverlay` monta nuevo React tree en portal. Sin estado levantado, el overlay siempre renderiza con `defaultOpen`. Fix: `sectionOpenState` en PropertyForm, `SectionCard` en modo controlado. (2026-06-25)

### DT-07: DragOverlay renderiza SectionCard completo con `pointerEvents: none`
Usuario rechazó explícitamente `DragGhostCard` (85% escala). Quiere tamaño y estado exactos durante el drag. `pointerEvents: none` previene interacciones accidentales. (2026-06-25)

### DT-08: i18n manual con prefijo de ruta (sin next-intl)
Contenido multiidioma viene de DB (`property_translations`). Detección por Accept-Language en middleware. (Junio 2026)

---

## 8. Errores Encontrados y Soluciones

### E-01: `onMove` prop inválido ✅
`framer-motion Reorder` pasaba `onMove` a divs nativos. Solución: migrar a `@dnd-kit`.

### E-02: Loop infinito de renders ✅
**Causa**: `useSensor(PointerSensor, { activationConstraint: { distance: 8 } })` — literal inline nuevo en cada render → `useSensors` devuelve nuevo array → `DndContext` re-registra sensors → loop.
**Fix**:
```typescript
const POINTER_SENSOR_OPTIONS = { activationConstraint: { distance: 8 } } as const;
const KEYBOARD_SENSOR_OPTIONS = { coordinateGetter: sortableKeyboardCoordinates } as const;
```
Archivo: `PropertyForm.tsx`

### E-03: SectionCard se expande al arrastrar ✅
**Causa**: `DragOverlay` monta nuevo tree. `SectionCard` solo tenía `useState(defaultOpen)` → siempre arrancaba con `defaultOpen=true`.
**Fix**: `sectionOpenState` en `PropertyForm`, `SectionCard` modo controlado (`open` + `onOpenChange`).

### E-04: Booleans de servicios guardados como `false` en vez de `null` ✅
**Fix**: Migración `20260624_adjust_schema_and_trigger.sql` eliminó DEFAULTs falsos.

### E-05: Trigger recalculaba score incorrecto ✅
**Fix**: Trigger refactorizado para solo clampar y asignar badge en base al score del cliente.

### E-06: RLS impedía escritura del panel ✅
**Causa**: Solo existían políticas de lectura.
**Fix**: Migración `20260624_add_rls_write_policies.sql` agregó políticas de escritura para agentes/admins.

---

## 9. Backlog Técnico Priorizado

### 🔴 Alta

**B-01: Persistencia del orden de secciones**
- DnD resetea al recargar. Opciones: `localStorage` (simple) o columna `sections_order JSONB` en `agents` (cross-device).
- Archivos: `PropertyForm.tsx`, posiblemente tabla `agents`

**B-02: Validación antes de guardar**
- Sin validación de campos requeridos. Debe mostrar errores por campo.

**B-03: Verificar flujo de creación `/nueva`**
- Confirmar que `PropertyForm` funciona correctamente en modo creación (generación de `propertyId` previa al submit).

### 🟡 Media

**B-04: CRM de Leads** — UI en `/panel/clientes`. Lista, pipeline kanban, notas, asignación.

**B-05: Agenda y citas** — UI en `/panel/agenda`. Calendar view + CRUD.

**B-06: Comparador de propiedades** — Ruta existe, UI no implementada.

**B-07: Drop animation del DragOverlay** — Pulir animación de retorno al soltar el tile.

**B-08: YesNoSelector estado null más claro** — El estado "sin responder" necesita mayor claridad visual.

### 🟢 Baja

**B-09: Blog** — Editor MDX, preview, publicación.

**B-10: Calculadoras financieras** — Hipoteca, rentabilidad.

**B-11: Analítica avanzada** — Métricas de vistas, favoritos, leads por propiedad.

**B-12: Testimonios en home** — Tabla existe, componente UI pendiente.

---

## 10. Patrones a Evitar

### PA-01: Sensor options como literales inline en useSensor
❌ `useSensor(PointerSensor, { activationConstraint: { distance: 8 } })` en render → loop infinito
✅ Constantes a nivel de módulo: `const OPTIONS = { ... } as const;`

### PA-02: Estado de SectionCard local cuando el DragOverlay lo necesita
❌ Solo `useState(defaultOpen)` en `SectionCard` → overlay siempre abre al `defaultOpen`
✅ Levantar estado al padre, pasar como prop controlada

### PA-03: DragOverlay sin `pointerEvents: none`
❌ Interacciones accidentales en campos mientras se arrastra
✅ `<div style={{ pointerEvents: "none" }}>` envolviendo el overlay

### PA-04: `rectSortingStrategy` con flex-wrap para dos columnas
❌ Alturas variables → cálculos 2D incorrectos → comportamiento errático
✅ Dos `SortableContext` independientes con `verticalListSortingStrategy`

### PA-05: Scaling del DragOverlay
❌ Ghost card al 85% — rechazado explícitamente por el usuario
✅ Sin `transform: scale()`. Tamaño natural.

### PA-06: Duplicar scoring en PL/pgSQL
❌ Divergencias con lógica type×op del cliente
✅ Cliente calcula, trigger solo valida rango y asigna badge

### PA-07: `framer-motion Reorder` para DnD de secciones
❌ Solo cálculos 1D, no maneja grilla 2D con alturas variables
✅ `@dnd-kit` con dos columnas verticales independientes

---

## 11. Contexto de Sesión Activa

### Qué se trabajó (2026-06-25)
1. Migración DnD a dos columnas independientes (`leftColumnIds` + `rightColumnIds`)
2. Fix loop infinito (sensor options estables)
3. Estado `open/closed` controlado para DragOverlay
4. Animación spring/bubbly `cubic-bezier(0.34, 1.56, 0.64, 1)`
5. DragOverlay muestra `SectionCard` completo a tamaño y estado reales

### En qué punto quedó
- Build compilando correctamente (`npm run build` ✅)
- Dev server corriendo en `localhost:3000`
- Usuario no ha dado feedback visual tras los últimos cambios

### Siguiente paso
Esperar feedback del usuario sobre UX del drag. Si aceptable:
1. **B-01** — persistencia del orden (localStorage primero)
2. **B-02** — validación antes de guardar

### Decisiones pendientes
- Persistencia del orden: `localStorage` (por dispositivo) vs columna en `agents` (cross-device)?
- Formulario de nueva propiedad: igual al de edición o wizard paso-a-paso?
