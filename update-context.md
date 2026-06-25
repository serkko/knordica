# update-context.md
## Prompt de Generación y Actualización de Contexto — Proyecto Knordica

Analiza la conversación completa de este chat y produce (o actualiza) el archivo `context.md` del proyecto Knordica.

***

### Modo de operación

- Si `context.md` **no existe aún**: genéralo completo leyendo toda la conversación desde el inicio.
- Si `context.md` **ya existe** (fue pegado al inicio de este chat): úsalo como base. Antes de escribir la versión actualizada, realiza un **análisis de consistencia** entre lo que ya estaba documentado y lo que se trabajó en la sesión actual. Detecta contradicciones, decisiones que se reemplazaron, lógica que quedó obsoleta. Solo entonces produce la versión nueva.

***

### Reglas de producción

1. **No elimines información previa** salvo que haya sido explícita y deliberadamente contradicha por una decisión nueva en la conversación. Si algo fue reemplazado, documenta qué era antes y por qué cambió.
2. **Nunca escribas texto decorativo** — sin introducciones, sin conclusiones, sin frases de relleno. Solo contenido técnico accionable.
3. **Detecta y resuelve contradicciones** antes de escribir. Si en la sesión nueva se tomó una decisión que entra en conflicto con algo documentado, analiza cuál prevalece y documenta el razonamiento. No dejes contradicciones silenciosas en el documento.
4. **Mantén cohesión lógica entre secciones**. Un cambio en arquitectura puede afectar el estado de módulos, las tareas pendientes y los patrones a evitar — actualiza todas las secciones afectadas, no solo la obvia.
5. **Usa Markdown estricto** con headers numerados. Cada sección debe poder leerse de forma independiente.
6. **Objetivo final**: un modelo nuevo leyendo únicamente `context.md` debe poder continuar el trabajo sin leer el chat original y sin hacer preguntas sobre decisiones ya tomadas.

***

### Estructura obligatoria del documento context.md

Produce exactamente estas secciones, en este orden, con este nivel de detalle:

***

#### 1. Identidad del Proyecto

Qué es Knordica (propósito, audiencia, mercado geográfico), el problema que resuelve, y el alcance total del producto. Incluye el mapa completo de la plataforma: todas las secciones, páginas, roles de usuario y funcionalidades planeadas o en desarrollo — no solo lo que se ha tocado recientemente. Este mapa debe actualizarse siempre que se agregue o descarte una funcionalidad.

***

#### 2. Stack y Arquitectura Técnica

- Framework y versión exacta del frontend
- Base de datos: plataforma, tablas existentes con sus campos, tipos de datos y relaciones relevantes
- Servicios externos integrados o planificados (auth, storage, email, pagos, mapas, etc.)
- Estructura de carpetas del proyecto (nivel relevante, no exhaustivo)
- Convenciones de nomenclatura: archivos, componentes, variables, tablas, campos
- Patrones de arquitectura acordados (cómo se manejan estados, formularios, rutas, permisos, etc.)

***

#### 3. Roles y Permisos

Todos los roles de usuario del sistema (visitante, agente, admin, etc.), qué puede hacer cada uno, qué vistas o acciones están restringidas por rol, y cómo se implementa el control de acceso técnicamente.

***

#### 4. Estado del Proyecto por Módulo

Lista completa de todos los módulos y funcionalidades del producto. Para cada uno:

- **Estado**: `✅ completo` / `🔄 en progreso` / `⏳ pendiente` / `🚫 bloqueado` / `❌ descartado`
- **Descripción técnica** de qué existe actualmente
- **Qué falta** (si aplica): detalle suficiente para ejecutarlo sin preguntar
- **Archivos principales involucrados** (si se conocen)
- **Dependencias** con otros módulos (si aplica)

***

#### 5. Reglas de Negocio y Decisiones de Producto

Todas las reglas que gobiernan el comportamiento del sistema. Para cada una:

- **Regla**: enunciado claro y preciso
- **Justificación**: por qué existe esta regla
- **Decisión final**: incluyendo si fue debatida y cómo se resolvió
- **Alcance**: a qué partes del sistema aplica

Incluye las reglas que fueron propuestas y rechazadas, con el motivo del rechazo. Esto evita que futuras sesiones vuelvan a proponer lo mismo.

***

#### 6. Lógica de Discriminación de Campos (Matriz de Combinaciones)

*(Sección específica de Knordica — se mantiene siempre que el módulo de listings esté activo)*

Para cada una de las 33 combinaciones de `property_type × operation`:

- Tipo de inmueble y operación
- Lista de campos aplicables con justificación breve
- Lista de campos excluidos con motivo
- Estado de implementación: `✅ implementado` / `⏳ pendiente` / `🔄 en revisión`
- Inconsistencias detectadas y su estado: `✅ resuelta` / `⏳ pendiente` / `🚫 descartada con justificación`

Las combinaciones marcadas como incompatibles (15, 18, 19, 27, 30, 33) deben documentar el comportamiento UI esperado.

***

#### 7. Decisiones Técnicas Tomadas

Decisiones de implementación que no deben cuestionarse en sesiones futuras. Para cada una:

- **Decisión**: qué se decidió hacer (o no hacer)
- **Contexto**: qué problema resolvía o qué alternativas se evaluaron
- **Motivo**: por qué se eligió esta opción
- **Fecha aproximada** de la decisión

***

#### 8. Errores Encontrados y Soluciones

Problemas técnicos encontrados durante el desarrollo. Para cada uno:

- **Descripción** del error o problema
- **Causa raíz** identificada
- **Solución aplicada** (con detalle técnico)
- **Archivos modificados**
- **Estado**: `✅ resuelto` / `🔄 workaround temporal` / `⏳ pendiente`

***

#### 9. Backlog Técnico Priorizado

Lista de tareas pendientes ordenadas por prioridad. Para cada tarea:

- **Descripción técnica** suficiente para ejecutarla sin ambigüedad
- **Archivos o componentes** involucrados (si se conocen)
- **Dependencias** con otras tareas
- **Prioridad**: `🔴 alta` / `🟡 media` / `🟢 baja`
- **Notas** sobre edge cases conocidos o decisiones previas relevantes

***

#### 10. Patrones a Evitar

Anti-patrones identificados específicamente en este proyecto: enfoques que no funcionaron, errores recurrentes, trampas conocidas del stack, decisiones que generaron deuda técnica. Para cada uno: descripción del patrón incorrecto → por qué falla en este contexto → qué hacer en su lugar.

***

#### 11. Contexto de Sesión Activa

- Qué se estaba trabajando en la sesión más reciente
- En qué punto exacto quedó
- Cuál es el siguiente paso inmediato y concreto
- Cualquier decisión pendiente que requiere respuesta antes de continuar

***

### Análisis de consistencia (solo en modo actualización)

Antes de escribir la versión actualizada, produce un bloque separado titulado **"## Análisis de Consistencia"** que liste:

1. **Qué cambió** respecto a la versión anterior y por qué
2. **Contradicciones detectadas** entre el contexto anterior y la sesión nueva, y cómo se resolvieron
3. **Secciones afectadas en cascada** por los cambios de esta sesión
4. **Información eliminada** y la razón

Este bloque va **antes** del documento `context.md` final en tu respuesta, para que yo pueda revisar el razonamiento antes de guardar el archivo.