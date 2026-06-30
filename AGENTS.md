<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# PENDING: Database RLS / Autosave Resolution
- **Status**: ACTIVE / RESOLVED.
- **Context**: The autosave timer inside [PropertyForm.tsx](file:///c:/Github/knordica/src/components/panel/PropertyForm.tsx) has been reactivated to run every 1 minute.
- **Verification**: Database query confirmed that the user profile `zsoftuser@gmail.com` (UUID: `af54a9c7-5b60-41a0-81d2-f17eb4b862ab`) is successfully registered with the `admin` role in the `agents` table. RLS write permissions are active and aligned.

# STATUS: Drag-and-Drop Disabled
- **Decision**: The dynamic two-column Drag-and-Drop feature in `PropertyForm` was deactivated and replaced with a stable, fixed two-column layout.
- **Rationale**:
  1. Under React 19, re-registering event listeners and state syncing within the grid rendered IIFE path triggered "Maximum update depth exceeded" loops.
  2. Drag handle triggers clashed with click toggles on cards, causing accordion panels to open/close unexpectedly.
  3. Dynamic content blocks (with variable heights and fields) made drop animations and order calculations behave erratically.
- **Current Layout**: Displayed as a static two-column flexbox container. Drag handles are hidden since `dragHandleProps` is not passed to `SectionCard`.

# GIT OPERATIONS RULE
- **Rule**: No proponer ni ejecutar comandos de terminal para git commit o push (los cuales fuerzan una decisión de aprobación en la UI de comandos) a menos que el usuario lo solicite primero de forma explícita en el chat de texto. Si el trabajo está listo, simplemente consúltalo al final del mensaje en el chat.



