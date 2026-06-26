# KNORDICA — PROJECT CONTEXT

**Basado en:** Análisis directo del repositorio (sin especulaciones)
**Última actualización:** Junio 2026
**Propósito:** Poner al corriente a cualquier modelo de IA para continuar el desarrollo sin perder contexto entre conversaciones.

---

## ORIENTACIÓN RÁPIDA

Knordica es un **portal inmobiliario premium** para Mérida, Venezuela.
Stack: **Next.js 16.2.9 · React 19 · TypeScript · Tailwind CSS 4 · Supabase**
Diseño: **modo oscuro por defecto**, tipografía premium, paleta mármol/champán/oro.
Routing: **App Router con `[locale]`** — soporte ES/EN en todas las páginas.
El repo vive en `C:\Github\knordica` y está público en GitHub en `serkko/knordica`.

---

## 1. STACK TECNOLÓGICO COMPLETO

### Core
| Tecnología | Versión | Rol |
|---|---|---|
| Next.js | 16.2.9 | Framework fullstack — App Router, RSC, API Routes |
| React | 19.2.4 | UI |
| TypeScript | ^5 | Tipado estático en todo el proyecto |
| Tailwind CSS | ^4 | Config vía `@theme` en `globals.css` — sin `tailwind.config.ts` |

### Backend / Datos
| Tecnología | Versión | Rol |
|---|---|---|
| @supabase/supabase-js | ^2.108.2 | PostgreSQL, Auth, Storage |
| @supabase/ssr | ^0.6.1 | Clientes server/browser diferenciados |
| TanStack Query | ^5.101.0 | Cache y fetching client-side (staleTime: 60s, retry: 1) |

### UI y Animaciones
| Tecnología | Versión | Rol |
|---|---|---|
| Framer Motion | ^12.40.0 | Animaciones — `ease` debe ser 4‑tuple tipado, no array libre |
| Lucide React | ^0.511.0 | Iconos (tree‑shaken) |
| Radix UI | varios | Primitivos accesibles: dialog, dropdown‑menu, select, slider, tooltip, label, separator |
| @studio-freight/react-lenis | ^0.0.47 | Smooth scroll global |

### Formularios y Validación
| Tecnología | Versión | Rol |
|---|---|---|
| React Hook Form | ^7.79.0 | Estado de formularios |
| Zod | ^3.25.76 | Schema validation |
| @hookform/resolvers | ^5.4.0 | Integración RHF + Zod |

### Drag & Drop
| Tecnología | Versión | Rol |
|---|---|---|
| @dnd-kit (core/sortable/utilities) | ^6/^10/^3 | Reordenar imágenes en PropertyForm |
| @hello-pangea/dnd | ^18.0.1 | DnD alternativo para listas |

### Mapas y Gráficas
| Tecnología | Versión | Rol |
|---|---|---|
| Leaflet | ^1.9.4 | Mapa interactivo — siempre cargado con `next/dynamic({ ssr: false })` |
| Recharts | ^2.15.4 | Gráficas KPI (line, area, bar) en el panel |

### Estado Global
| Tecnología | Versión | Rol |
|---|---|---|
| Zustand | ^5.0.14 | Stores: filtros, comparador, panel UI, toasts |

### Utilidades
| Tecnología | Versión | Rol |
|---|---|---|
| clsx | ^2.1.1 | Clases condicionales |
| tailwind-merge | ^3.6.0 | Merge sin conflictos — usado en `cn()` |
| date-fns | ^4.4.0 | Fechas |

---

## 2. DISEÑO Y SISTEMA VISUAL

### Modo
- **Default:** modo oscuro (`[data-theme="dark"]` en `<html>`)
- Toggle dark/light guardado en **cookie** (no localStorage — SSR‑safe)
- ThemeProvider detecta `prefers-color-scheme` y persiste preferencia

### Tipografías (auto‑hosted en `/public/fonts/`)
- **Cabinet Grotesk Variable** — display, headings, precios
- **Satoshi Variable** — body, labels, UI
- **No CDN**: las fuentes se sirven directamente desde el proyecto; `font-display` está configurado a `swap` en `globals.css`.

**Modo oscuro (default):**
```css
--color-bg:       #141210
--color-surface:  #1A1815
--color-text:     #E8E4DE
--color-primary:  #C4B49A    /* mármol cálido */
--color-gold:     #C9962A    /* oro principal */
--color-gold-hover: #D4A840
--accent:         var(--color-gold)
--border:         #353028
```

**Modo claro:**
```css
--color-bg:       #F4F2EE
--color-surface:  #F8F6F2
--color-text:     #111010
--color-primary:  #8A7D6E
--color-gold:     #A8864A
```

**Border Radius**
Todos los radios están unificados en **3px** — decisión de diseño deliberada para look angular premium.
```css
--radius-xs/sm/md/lg/xl/2xl/3xl: 3px
```

---

## 6. ESTRUCTURA DE CARPETAS

```
knordica/
├── docs/
│   ├── form-discrimination-matrix.md  ← Las 33 combinaciones tipo×operación (fuente de verdad)
│   ├── form-mapping.md                ← Mapeo formulario ↔ columnas DB
│   └── property-completeness-weights.md ← Pesos de completitud por combinación
│   ...
```
### Paleta de Colores (CSS Custom Properties)

**Modo oscuro (default):**
```css
--color-bg: #141210;
--color-surface: #1A1815;
--color-surface-2: #1F1D1A;
--color-surface-offset: #1C1A17;
--color-surface-offset-2: #232019;
--color-surface-dynamic: #2C2924;
--color-divider: #282420;
--color-border: #353028;
--color-text: #E8E4DE;
--color-text-muted: #9A9590;
--color-text-faint: #5C5854;
--color-text-inverse: #141210;
--color-primary: #C4B49A;
--color-primary-hover: #D4C8B0;
--color-primary-active: #E0D8C8;
--color-primary-highlight:#2A2620;
--color-gold: #C9962A;
--color-gold-hover: #D4A840;
--color-gold-active: #DFC060;
--color-gold-highlight: #2E2518;
```

**Modo claro:**
```css
--color-bg: #F4F2EE;
--color-surface: #F8F6F2;
--color-surface-2: #FDFCFA;
--color-surface-offset: #EAE7E1;
--color-surface-offset-2: #E0DDD6;
--color-surface-dynamic: #D5D1C8;
--color-divider: #CCC8BF;
--color-border: #BEB9AF;
--color-text: #111010;
--color-text-muted: #6E6B66;
--color-text-faint: #B0ACA6;
--color-text-inverse: #F4F2EE;
--color-primary: #8A7D6E;
--color-primary-hover: #6E6358;
--color-primary-active: #524A42;
--color-primary-highlight:#EDE9E3;
--color-gold: #A8864A;
--color-gold-hover: #8A6A32;
--color-gold-active: #6E5020;
--color-gold-highlight: #F0E8D8;
```

**Semantic Tokens**
```css
--danger: #c0392b;
--success: #10B981;
--warning: #F59E0B;
--info: #3B82F6;
```

**Border Radius** (unificado a 3 px)
```css
--radius-xs: 3px;
--radius-sm: 3px;
--radius-md: 3px;
--radius-lg: 3px;
--radius-xl: 3px;
--radius-2xl: 3px;
--radius-3xl: 3px;
```

---

## 9. CONFIGURACIÓN DE NEXT.JS

```typescript
const nextConfig: NextConfig = {
 experimental: {
 optimizePackageImports: ["lucide-react", "recharts", "@radix-ui/react-dialog",
 "@radix-ui/react-select", "@radix-ui/react-dropdown-menu"]
 },
 images: {
 formats: ["image/avif","image/webp"],
 deviceSizes: [640,750,828,1080,1200,1920,2048,3840],
 imageSizes: [16,32,48,64,96,128,256,384],
 remotePatterns: [{
 protocol: "https",
 hostname: "pvcbicsryyqgapibpbba.supabase.co",
 pathname: "/storage/v1/object/public/**"
 }]
 },
 // Silence Turbopack webpack custom configuration warning/error by defining an empty config
 turbopack: {},
 webpack: (config) => {
 config.resolve.fallback = { fs: false };
 return config;
 },
};
export default nextConfig;
```
---

---

## 5. TIPOS DEL DOMINIO

### Operaciones (3)
```typescript
type PropertyOperation = "venta" | "alquiler" | "vacacional";
```

---

## 8. LÓGICA DE DISCRIMINACIÓN DE CAMPOS

`checkFieldApplies(fieldOrGroup, type, operation)` en `propertyDiscrimination.ts`.

---

## 9. AUTOSAVE EN EL FORMULARIO

- **Intervalo:** 30 s (antes 15 s) – implementado en `PropertyForm.tsx`.
- **Debounce opcional:** 2 s al disparar manualmente (configurable vía `useAutoSave`).

---

## 10. COMPARADOR DE PROPIEDADES

- **Límite:** máximo 3 propiedades simultáneas (actualizado en `comparator.store.ts`).

---

## 11. NOTA IMPORTANTE PARA AGENTES AI

El `AGENTS.md` / `CLAUDE.md` del repo contiene:
> "This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code."

---

*Este archivo vive en el repo. Enriquecerlo después de cada sesión de desarrollo usando el prompt en `update-context.md`.*

**Modo oscuro (default):**
```css
--color-bg:       #141210
--color-surface:  #1A1815
--color-text:     #E8E4DE
--color-primary:  #C4B49A    /* mármol cálido */
--color-gold:     #C9962A    /* oro principal */
--color-gold-hover: #D4A840
--accent:         var(--color-gold)
--border:         #353028
```

**Modo claro:**
```css
--color-bg:       #F4F2EE
--color-surface:  #F8F6F2
--color-text:     #111010
--color-primary:  #8A7D6E
--color-gold:     #A8864A
```

**Border Radius**
Todos los radios están unificados en **3px** — decisión de diseño deliberada para look angular premium.
```css
--radius-xs/sm/md/lg/xl/2xl/3xl: 3px
```

### Tokens del Panel (backoffice)
Los componentes del panel usan prefijo `--p-*` para sus tokens internos.

### Clases Utilitarias Notables (`globals.css`)
- `.glass` — glassmorphism: `backdrop-blur(16px)`, borde border
- `.noise-overlay` — textura de ruido SVG fija (z-index 1, pointer‑events none)
- `.text-premium-label` — label uppercase, Satoshi, letter‑spacing 0.08em
- `.premium-price` — Cabinet Grotesk, font‑weight 600
- `.prop-form-two-col` — dos columnas en PropertyForm, colapsa a 1 col en móvil
- `.highlight-field-pulse` — animación verde para resaltar campo sugerido

### Animaciones (Framer Motion — `src/lib/motion/variants.ts`)
```typescript
// CRÍTICO: ease siempre como 4‑tuple tipado
export const EASE_EXPO   = [0.16, 1, 0.3, 1] as [number, number, number, number]
export const EASE_SMOOTH = [0.22, 1, 0.36, 1] as [number, number, number, number]
```

CSS keyframes disponibles: `fadeUp`, `fadeIn`, `meshShift`, `pulse-slow`, `spin-slow`

---

## 3. ESTRUCTURA DE CARPETAS

```
knordica/
├── docs/
│   ├── form-discrimination-matrix.md  ← Las 33 combinaciones tipo×operación (fuente de verdad)
│   ├── form-mapping.md                ← Mapeo formulario ↔ columnas DB
│   └── property-completeness-weights.md ← Pesos de completitud por combinación
├── public/
│   ├── fonts/         ← Cabinet Grotesk + Satoshi (woff2)
│   ├── images/properties/  ← p1.jpg a p10.jpg (mock)
│   └── hero.mp4
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (site)/      ← Páginas públicas
│   │   │   ├── (cliente)/   ← Portal cliente (protegido)
│   │   │   └── panel/       ← Panel admin/agente
│   │   ├── api/             ← Route Handlers
│   │   ├── globals.css      ← Sistema de diseño completo
│   │   └── favicon.ico
│   ├── components/
│   │   ├── ui/       ← Primitivos reutilizables
│   │   ├── layout/   ← Navbar, Footer, providers
│   │   ├── home/     ← Secciones de homepage
│   │   ├── property/ ← Catálogo público
│   │   ├── panel/    ← Backoffice
│   │   ├── forms/    ← Formularios autónomos
│   │   ├── map/      ← Leaflet
│   │   ├── tools/    ← Calculadoras
│   │   └── marketing/
│   ├── hooks/        ← Custom React hooks
│   ├── lib/
│   │   ├── supabase/ ← client.ts, server.ts, middleware.ts
│   │   ├── auth/
│   │   ├── queries/  ← properties, blog, zones, leads
│   │   ├── constants/← property.ts, zonas‑merida.ts
│   │   ├── utils/    ← cn.ts, format.ts
│   │   ├── seo/
│   │   ├── motion/   ← variants.ts
│   │   ├── lenis.tsx
│   │   └── mock-data.ts
│   ├── store/        ← Zustand stores
│   ├── types/        ← property.ts, panel.ts
│   └── utils/        ← propertyDiscrimination.ts, propertyCompleteness.ts
├── supabase/
│   └── migrations/   ← 8 archivos de migración
├── CLAUDE.md / AGENTS.md  ← Reglas para agentes AI
├── middleware.ts
├── next.config.ts
└── package.json
```

---

## 4. PÁGINAS Y RUTAS

### Grupo Público `(site)`
```
/[locale]/                    → Homepage
/[locale]/propiedades         → Catálogo con filtros
/[locale]/propiedades/[slug]  → Detalle de propiedad
/[locale]/mapa                → Leaflet interactive map
/[locale]/comparar            → Comparador (2‑4 propiedades)
/[locale]/contacto            → Formulario de contacto
/[locale]/nosotros            → About
/[locale]/login               → Auth (redirige por rol)
```

**Homepage — secciones en orden:**
```
Hero → FeaturedProperties → WhyKnordica → ZonesSection →
MapPreview → Testimonials → MarketBlog → FinalCTA
```

### Grupo Cliente `(cliente)` — protegido
```
/[locale]/cliente             → Dashboard cliente
/[locale]/cliente/perfil      → Editar perfil
/[locale]/cliente/favoritos   → Propiedades guardadas
/[locale]/cliente/solicitudes → Citas y requests
```

### Panel `panel` — admin/agente
```
/[locale]/panel/inicio             → KPIs + charts
/[locale]/panel/propiedades        → DataTable CRUD
/[locale]/panel/propiedades/nueva  → PropertyForm (crear)
/[locale]/panel/propiedades/editar/[id] → PropertyForm (editar)
/[locale]/panel/usuarios           → Gestión usuarios
/[locale]/panel/agentes            → Gestión agentes
/[locale]/panel/clientes           → CRM clientes
/[locale]/panel/agenda             → Calendario citas
/[locale]/panel/mensajes           → Inbox CRM
/[locale]/panel/blog               → Editor blog
/[locale]/panel/analitica          → Analytics
/[locale]/panel/configuracion      → Settings
/[locale]/panel/perfil             → Perfil usuario
```

### API Routes
```
GET  /api/properties                → Búsqueda/filtro de propiedades
POST /api/leads                     → Crear lead/consulta
POST /api/upload                    → Upload imagen/video a Supabase Storage
POST /api/revalidate                → Revalidar caché ISR
DELETE /api/panel/delete-property   → Eliminar propiedad
POST /api/panel/duplicate-property  → Duplicar propiedad con toda su data
```

---

## 5. TIPOS DEL DOMINIO

### Operaciones (3)
```typescript
type PropertyOperation = "venta" | "alquiler" | "vacacional";
```

### Tipos de inmueble (11)
```typescript
type PropertyType =
  | "casa"
  | "apartamento"
  | "townhouse"
  | "anexo"
  | "edificio"
  | "galpon"
  | "habitacion"
  | "hacienda_finca"
  | "local"
  | "oficina"
  | "terreno_lote";
```

### Status (5)
```typescript
type PropertyStatus = "activa" | "reservada" | "vendida" | "alquilada" | "cerrada";
```

### Moneda
```typescript
price_currency: TEXT  // DEFAULT 'USD' — valores: USD, EUR, VES
```

---

## 6. PROPERTY DISCRIMINATION LOGIC (CRÍTICO)

**Archivos clave:**
- `src/utils/propertyDiscrimination.ts` — función `checkFieldApplies(field, type, op)`
- `docs/form-discrimination-matrix.md` — fuente de verdad con las 33 combinaciones explicadas
- `docs/property-completeness-weights.md` — 27 combinaciones válidas con pesos

### Combinaciones INVÁLIDAS (6 bloqueadas)
```
habitacion   × venta      → BLOQUEADA (no se vende una habitación)
edificio     × vacacional → BLOQUEADA
galpon       × vacacional → BLOQUEADA
local        × vacacional → BLOQUEADA
oficina      × vacacional → BLOQUEADA
terreno_lote × vacacional → BLOQUEADA
```

### Combinaciones VÁLIDAS: 27 de 33 posibles

```
           VENTA  ALQUILER  VACACIONAL
casa         ✓       ✓          ✓
apartamento  ✓       ✓          ✓
townhouse    ✓       ✓          ✓
anexo        ✓       ✓          ✓
habitacion   ✗       ✓          ✓
edificio     ✓       ✓          ✗
galpon       ✓       ✓          ✗
hacienda_finca ✓    ✓          ✓
local        ✓       ✓          ✗
oficina      ✓       ✓          ✗
terreno_lote ✓       ✓          ✗
```

### Reglas de Discriminación por Campo (`checkFieldApplies`)
```typescript
// Solo vacacional
"price_per_night", "price_weekend", "min_nights", "max_guests", "checkin_time", "checkout_time", "house_rules", "includes_breakfast"
  → op === "vacacional"

// Solo NO vacacional
"price"  → op !== "vacacional"

// No en terreno_lote, local, oficina, galpon, edificio
"bedrooms"  → !["terreno_lote","local","oficina","galpon","edificio"].includes(type);

// No en terreno_lote
"bathrooms", "half_bathrooms", "year_built", "condition"
  → type !== "terreno_lote";

// No en terreno_lote, galpon, edificio
"furnished" → !["terreno_lote","galpon","edificio"].includes(type);

// Solo en edificios/verticales
"has_elevator" → ["apartamento","edificio","local","oficina","townhouse"].includes(type);

// No en terreno
"parking_spaces" → type !== "terreno_lote";

// ... (continúa con el resto de los casos) ...
```

---

## 7. HOOKS — PERSONALIZADOS
| Hook | Propósito |
|---|---|
| `useProperties` | Fetch propiedades con React Query |
| `useFilters` | Sync filtros con Zustand store |
| `useFavorites` | Add/remove favoritos (Zustand) |
| `useReveal` | Scroll‑triggered animations |
| `useSmartScroll` | Hide/show Navbar en scroll |
| `useAutoSave` | Debounced auto‑save (30 s por defecto) |
| `usePanelRole` | Rol y permisos del usuario en panel |
| `useKPIData` | Fetch métricas KPI del panel |

---

## 8. ZUSTAND STORES
| Store | Contenido principal |
|---|---|
| `filters.store.ts` | Filtros del catálogo (precio, zona, tipo, amenidades…) |
| `comparator.store.ts` | Propiedades seleccionadas para comparar (max 3) |
| `panelStore.ts` | User info, sidebarOpen, rol |
| `toast.store.ts` | Cola de notificaciones |

---

## 9. CONVENCIONES DE CÓDIGO
```
Componentes React:  PascalCase         PropertyCard.tsx
Hooks:             camelCase + use      useFilters.ts
Tipos/interfaces:  PascalCase          PropertyFilters
Constantes:        SCREAMING_SNAKE     EASE_EXPO, PROPERTY_TYPES
Variables/func:    camelCase           getVisibleFields()
Rutas URL:         kebab-case español  /propiedades, /nosotros
CSS variables:     kebab-case          --color-gold, --p-green
```

**Import alias:** `@/*` → `src/*`

**Client vs Server:**
- Server por default (layouts, páginas)
- Client: todos los UI primitivos, Navbar, PropertyForm, PropertyFilters, Leaflet maps
- Mapas: siempre `next/dynamic({ ssr: false })`

---

## 10. BASE DE DATOS (Supabase)

**Project ID:** `pvcbicsryyqgapibpbba`
**URL:** `https://pvcbicsryyqgapibpbba.supabase.co`

**Tablas principales:** `properties`, `property_translations`, `property_images`, `zones`, `leads`

**Nota de mapeo:** El campo `floors` en el formulario se guarda en DB como `total_floors`.

**Moneda:** `price_currency DEFAULT 'USD'` — valores: USD, EUR, VES

**Migraciones en orden:**
1. `20260619_init.sql` — Schema inicial
2. `20260619_seed.sql` — Seed de propiedades
3. `20260621_schema_v2.sql` — Expansión schema v2
4. `20260623_add_maintenance_fee.sql`
5. `20260623_add_missing_form_columns.sql`
6. `20260623_add_year_built.sql`
7. `20260624_add_rls_write_policies.sql`
8. `20260624_adjust_schema_and_trigger.sql`

---

## 11. VARIABLES DE ENTORNO
```bash
NEXT_PUBLIC_SUPABASE_URL=https://pvcbicsryyqgapibpbba.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 12. next.config.ts
```typescript
const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "@radix-ui/react-dialog",
                          "@radix-ui/react-select", "@radix-ui/react-dropdown-menu"]
  },
  images: {
    formats: ["image/avif","image/webp"],
    deviceSizes: [640,750,828,1080,1200,1920,2048,3840],
    imageSizes: [16,32,48,64,96,128,256,384],
    remotePatterns: [{
      protocol: "https",
      hostname: "pvcbicsryyqgapibpbba.supabase.co",
      pathname: "/storage/v1/object/public/**"
    }]
  },
  // Silence Turbopack webpack custom configuration warning/error by defining an empty config
  turbopack: {},
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
};
export default nextConfig;
```

---

## 13. NOTA IMPORTANTE PARA AGENTES AI

El `AGENTS.md` / `CLAUDE.md` del repo contiene:
> "This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code."

Antes de escribir cualquier código Next.js, revisar las guías del propio `node_modules`.

---

*Este archivo vive en el repo. Enriquecerlo después de cada sesión de desarrollo usando el prompt en `update-context.md`.*

---

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
- Contexto previo documentaba `rectSortingStrategy` + flex‑wrap como arquitectura DnD. Reemplazado por dos columnas verticales independientes.
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
property_type TEXT CHECK(casa|apartamento|townhouse|anexo|edificio|galpon|habitacion|hacienda_finca|local|oficina|terreno_lote)
status TEXT CHECK(activa|vendida|alquilada|reservada|cerrada)
featured BOOL, exclusive BOOL, new_listing BOOL, price_reduced BOOL
price DECIMAL(14,2), price_currency TEXT, price_negotiable BOOL, price_history JSONB, price_usd DECIMAL(14,2)
area_total DECIMAL(10,2), area_built DECIMAL(10,2), area_hectares DECIMAL(10,2)
bedrooms INT, bathrooms INT, half_bathrooms INT, parking_spaces INT, parking_covered BOOL
zone_id UUID FK→zones, address_es TEXT, address_en TEXT
lat DECIMAL(10,8), lng DECIMAL(11,8), municipio TEXT, show_exact_location BOOL
agent_id UUID FK→agents
... (otros campos) ...
``` 

---

## 3. Servicios externos
| Servicio | Propósito | Estado |
|----------|-----------|--------|
| Supabase Auth | Auth | ✅ |
| Supabase Storage | Imágenes | ✅ |
| Leaflet | Mapa interactivo | ✅ |
| @studio-freight/react-lenis | Smooth scroll | ✅ |
| Recharts | Gráficas KPI | ✅ |

---

## 4. Estructura de carpetas
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
    ui/YesNoSelector.tsx      ← Selector tri‑estado (true/false/null)
  hooks/
    usePanelRole.ts, useAutoSave.ts, useFavorites.ts, useFilters.ts, useKPIData.ts, useProperties.ts, useReveal.ts, useSmartScroll.ts
  utils/
    propertyDiscrimination.ts  ← checkFieldApplies(), isCombinationInconsistent()
    propertyCompleteness.ts    ← computeCompletenessScore(), SCORE_CONFIG
  lib/supabase/, lenis.tsx, constants/, motion/, queries/, seo/, utils/
  i18n/config.ts  ← defaultLocale: 'es', locales: ['es','en']
  store/panelStore.ts  ← Zustand: userRole, userId, setUser
  types/panel.ts  ← PanelRole = 'user'|'agent'|'senior'|'admin'
supabase/migrations/  ← 8 migraciones cronológicas
```

---

## 5. Convenciones
- Rutas: kebab‑case en español
- Componentes: PascalCase `.tsx`
- Hooks: `use` prefix camelCase
- DB fields: snake_case
- CSS panel: custom properties `--p-` (`--p-accent`, `--p-surface`, `--p-radius` = 3px)
- Tokens del panel: `<style>` inline en `PanelLayout` con `:root`

---

## 6. Patrones arquitectónicos
- **Formularios**: `useState<FormData>`, NO react‑hook‑form en el panel
- **Auth**: `usePanelRole()` → Zustand, NO React context
- **Fetch**: Supabase client directo, @tanstack/react-query instalado pero no usado en panel
- **i18n**: Prefijo `[locale]` manual, detección por Accept‑Language en middleware (sin next‑intl)

---

## 7. Reglas de Negocio y Decisiones de Producto

### Tipos de propiedad válidos
`casa`, `apartamento`, `townhouse`, `anexo`, `edificio`, `galpon`, `habitacion`, `hacienda_finca`, `local`, `oficina`, `terreno_lote`

### Operaciones válidas
`venta`, `alquiler`, `vacacional`

### Combinaciones incompatibles (UI muestra advertencia, no bloquea)
- `venta` + `habitacion`
- `vacacional` + cualquiera de: `galpon`, `local`, `oficina`, `terreno_lote`, `edificio`

### Badge de calidad
- `basico`: 0–40 %, `completo`: 41–70 %, `premium`: >70 %
- El trigger sobreescribe badge SOLO si es uno de los tres estándares. Badges personalizados son inmunes.

### Score de completitud
- Calculado en cliente por `computeCompletenessScore()` con `SCORE_CONFIG`
- Enviado al server como `completeness_score`
- Trigger solo valida rango (0‑100) y asigna badge

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

Los IDs DOM de secciones (`sec‑clasificacion`, etc.) y `layoutId` de `SectionCard` **NO PUEDEN CAMBIAR**.

---

## 8. Lógica de Discriminación de Campos

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

---

## 9. Decisiones Técnicas Tomadas

### DT‑01: PropertyForm como componente monolítico (~2800 líneas)
Evita prop‑drilling complejo. La lógica de discriminación es cohesiva en un lugar. Aceptado como trade‑off. (Junio 2026)

### DT‑02: `useState<FormData>` en PropertyForm — **NO** react‑hook‑form
La discriminación condicional específica hace que los esquemas de validación genéricos sean más complicados. (Junio 2026)

### DT‑03: Score de completitud calculado en el cliente
Intento de replicar en PL/pgSQL resultó en scores incorrectos (sin discriminación type×op). El cliente tiene la lógica completa; trigger solo valida. (2026‑06‑24)

### DT‑04: @dnd‑kit con dos SortableContext verticales independientes
Evaluadas y descartadas: `framer-motion Reorder` (1D), `@hello-pangea/dnd` (no maneja wrap variable), `rectSortingStrategy` único (alineación forzada). (2026‑06‑24/25)

### DT‑05: Sensores DnD como constantes de módulo
`useSensor` usa `useMemo([sensor, options])`. Objeto literal inline siempre nuevo → loop infinito. Fix: constantes `POINTER_SENSOR_OPTIONS` y `KEYBOARD_SENSOR_OPTIONS` a nivel de módulo. (2026‑06‑25)

### DT‑06: Estado `open/closed` de SectionCard levantado a PropertyForm
`DragOverlay` monta nuevo React tree en portal. Sin estado levantado, el overlay siempre renderiza con `defaultOpen`. Fix: `sectionOpenState` en PropertyForm, `SectionCard` en modo controlado. (2026‑06‑25)

### DT‑07: DragOverlay renderiza SectionCard completo
Usuario rechazó explícitamente `DragGhostCard` (85 % escala). Quiere tamaño y estado exactos durante el drag. `pointerEvents: none` previene interacciones accidentales. (2026‑06‑25)

### DT‑08: i18n manual con prefijo de ruta (sin next‑intl)
Contenido multiidioma viene de DB (`property_translations`). Detección por Accept‑Language en middleware. (Junio 2026)

---

## 10. Errores Encontrados y Soluciones

### E‑01: `onMove` prop inválido ✅
`framer-motion Reorder` pasaba `onMove` a divs nativos. Solución: migrar a `@dnd-kit`.

### E‑02: Loop infinito de renders ✅
**Causa**: `useSensor(PointerSensor, { activationConstraint: { distance: 8 } })` — literal inline nuevo en cada render → `useSensors` devuelve nuevo array → `DndContext` re‑registra sensors → loop.
**Fix**:
```typescript
const POINTER_SENSOR_OPTIONS = { activationConstraint: { distance: 8 } } as const;
const KEYBOARD_SENSOR_OPTIONS = { coordinateGetter: sortableKeyboardCoordinates } as const;
```
Archivo: `PropertyForm.tsx`

### E‑03: SectionCard se expande al arrastrar ✅
**Causa**: `DragOverlay` monta nuevo tree. `SectionCard` solo tenía `useState(defaultOpen)` → siempre arrancaba con `defaultOpen=true`.
**Fix**: `sectionOpenState` en `PropertyForm`, `SectionCard` modo controlado (`open` + `onOpenChange`).

### E‑04: Booleans de servicios guardados como `false` en vez de `null` ✅
**Fix**: Migración `20260624_adjust_schema_and_trigger.sql` eliminó DEFAULTs falsos.

### E‑05: Trigger recalculaba score incorrecto ✅
**Fix**: Trigger refactorizado para solo clampar y asignar badge en base al score del cliente.

### E‑06: RLS impedía escritura del panel ✅
**Causa**: Solo existían políticas de lectura.
**Fix**: Migración `20260624_add_rls_write_policies.sql` agregó políticas de escritura para agentes/admins.

---

## 11. Backlog Técnico Priorizado

### 🔴 Alta
- **B‑01: Persistencia del orden de secciones** — DnD resetea al recargar. Opciones: `localStorage` (simple) o columna `sections_order JSONB` en `agents` (cross‑device).
- **B‑02: Validación antes de guardar** — Sin validación de campos requeridos. Debe mostrar errores por campo.
- **B‑03: Verificar flujo de creación `/nueva`** — Confirmar que `PropertyForm` funciona correctamente en modo creación (generación de `propertyId` previa al submit).

### 🟡 Media
- **B‑04: CRM de Leads** — UI en `/panel/clientes`. Lista, pipeline kanban, notas, asignación.
- **B‑05: Agenda y citas** — UI en `/panel/agenda`. Calendar view + CRUD.
- **B‑06: Comparador de propiedades** — Ruta existe, UI no implementada.
- **B‑07: Drop animation del DragOverlay** — Pulir animación de retorno al soltar el tile.
- **B‑08: YesNoSelector estado null más claro** — El estado "sin responder" necesita mayor claridad visual.

### 🟢 Baja
- **B‑09: Blog** — Editor MDX, preview, publicación.
- **B‑10: Calculadoras financieras** — Hipoteca, rentabilidad.
- **B‑11: Analítica avanzada** — Métricas de vistas, favoritos, leads por propiedad.
- **B‑12: Testimonios en home** — Tabla existe, componente UI pendiente.

---

## 12. Patrones a Evitar

### PA‑01: Sensor options como literales inline en `useSensor`
❌ `useSensor(PointerSensor, { activationConstraint: { distance: 8 } })` en render → loop infinito
✅ Constantes a nivel de módulo: `const OPTIONS = { ... } as const;`

### PA‑02: Estado de SectionCard local cuando el DragOverlay lo necesita
❌ Solo `useState(defaultOpen)` en `SectionCard` → overlay siempre abre al `defaultOpen`
✅ Levantar estado al padre, pasar como prop controlada

### PA‑03: DragOverlay sin `pointerEvents: none`
❌ Interacciones accidentales en campos mientras se arrastra
✅ `<div style={{ pointerEvents: "none" }}>` envolviendo el overlay

### PA‑04: `rectSortingStrategy` con flex‑wrap para dos columnas
❌ Alturas variables → cálculos 2D incorrectos → comportamiento errático
✅ Dos `SortableContext` independientes con `verticalListSortingStrategy`

### PA‑05: Scaling del DragOverlay
❌ Ghost card al 85 % — rechazado explícitamente por el usuario
✅ Sin `transform: scale()`. Tamaño natural.

### PA‑06: Duplicar scoring en PL/pgSQL
❌ Divergencias con lógica type×op del cliente
✅ Cliente calcula, trigger solo valida rango y asigna badge

### PA‑07: `framer-motion Reorder` para DnD de secciones
❌ Solo cálculos 1D, no maneja grid 2D con alturas variables
✅ `@dnd-kit` con dos columnas verticales independientes

---

## 13. Contexto de Sesión Activa

### Qué se trabajó (2026‑06‑25)
1. Migración DnD a dos columnas independientes (`leftColumnIds` + `rightColumnIds`)
2. Fix loop infinito (sensor options estables)
3. Estado `open/closed` controlado para DragOverlay
4. Animación spring/bubbly `cubic‑bezier(0.34, 1.56, 0.64, 1)`
5. DragOverlay muestra `SectionCard` completo a tamaño y estado reales

### En qué punto quedó
- Build compilando correctamente (`npm run build` ✅)
- Dev server corriendo en `localhost:3000`
- Usuario no ha dado feedback visual tras los últimos cambios

### Siguiente paso
Esperar feedback del usuario sobre UX del drag. Si aceptable:
1. **B‑01** — persistencia del orden (localStorage primero)
2. **B‑02** — validación antes de guardar

### Decisiones pendientes
- Persistencia del orden: `localStorage` (por dispositivo) vs columna en `agents` (cross‑device)?
- Formulario de nueva propiedad: ¿igual al de edición o wizard paso‑a‑paso?
