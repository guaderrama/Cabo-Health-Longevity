# Blockers - Cabo Health Clinic

> Problemas que impiden avanzar. Documenta intentos de solución y estado actual.

---

## 🚨 Active Blockers (URGENTE)

### [Ninguno actualmente - Proyecto limpio ✅]

---

## ⚠️ In Progress (Investigando)

### [Ninguno actualmente]

---

## ✅ Resolved

### 2025-11-04: Documentación incorrecta (Next.js vs Vite)

**Fecha reportado:** 2025-11-04
**Fecha resuelto:** 2025-11-04
**Severidad:** 🟡 High
**Impacta a:** Desarrollo, contexto de IA, onboarding

**Problema:**
Archivos de memoria (.claude/memory/) contenían información incorrecta sobre el stack tecnológico. NOTES.md y DECISIONS.md mencionaban "Next.js 16" cuando el proyecto real usa "Vite + React 18".

**Impacto:**
- Claude recibía contexto incorrecto
- Posible generación de código incompatible
- Confusión sobre comandos (npm run dev en puerto 3000 vs 5173)
- Decisiones técnicas documentadas incorrectamente

**Solución:**
1. Identificado archivo correcto: CLAUDE-CABO-HEALTH.md (en Downloads)
2. Actualizado NOTES.md con información correcta
3. Corregido DECISIONS.md (Next.js → Vite)
4. Actualizado TODO.md con tareas específicas de Cabo Health
5. Mantenido BLOCKERS.md limpio

**Lección aprendida:**
- SIEMPRE verificar que CLAUDE.md en raíz del proyecto esté actualizado
- Archivos de memoria deben reflejar stack real
- Usar archivo específico del proyecto (CLAUDE-CABO-HEALTH.md)

**Archivos actualizados:**
- .claude/memory/NOTES.md ✅
- .claude/memory/TODO.md ✅
- .claude/memory/DECISIONS.md ✅
- .claude/memory/BLOCKERS.md ✅

---

## Template para Nuevos Blockers

```markdown
### [Título del Blocker]

**Fecha reportado:** YYYY-MM-DD
**Severidad:** 🔴 Critical | 🟡 High | 🟢 Medium
**Impacta a:** [Qué feature/funcionalidad bloquea]

**Problema:**
[Descripción clara del problema]

**Reproduce:**
1. Paso 1
2. Paso 2
3. Error ocurre

**Error message:**
```
[Pegar mensaje de error completo]
```

**Intentos de solución:**
- [ ] Intento 1: [Resultado]
- [ ] Intento 2: [Resultado]
- [ ] Intento 3: [Resultado]

**Siguiente paso:**
[Qué vamos a intentar ahora]

**Workaround temporal:**
[Si hay forma de evitar el problema temporalmente]

**Recursos:**
- Link 1: [Documentation relevante]
- Link 2: [GitHub issue similar]
- Link 3: [Stack Overflow]

**Assigned to:** [Persona trabajando en esto]
**Status:** 🔴 Blocked | 🟡 Investigating | 🟢 Has Workaround
```

---

## Example: Blocker Con Workaround (Template de Referencia)

### Puerto 5173 ocupado al iniciar Vite

**Fecha reportado:** [Ejemplo futuro]
**Severidad:** 🟢 Medium
**Impacta a:** Developer experience, no crítico

**Problema:**
Al correr `pnpm dev`, dice "Port 5173 already in use".

**Reproduce:**
1. Tener otra app Vite corriendo en 5173
2. `pnpm dev`
3. Error: EADDRINUSE

**Error message:**
```
Error: listen EADDRINUSE: address already in use :::5173
```

**Intentos de solución:**
- [x] Matar proceso manualmente con `lsof -ti:5173 | xargs kill -9`: Funciona
- [x] Cambiar puerto en vite.config.ts: Funciona pero inconsistente
- [ ] Auto-detect puerto libre: Investigando

**Workaround temporal:**
```bash
# Matar proceso en puerto 5173
lsof -ti:5173 | xargs kill -9

# O usar puerto diferente
pnpm dev -- --port 5174
```

**Siguiente paso:**
Implementar auto-detection de puerto en vite.config.ts si se vuelve recurrente.

**Status:** 🟢 Has Workaround

---

## Blockers Específicos de App Médica (Posibles)

### Ejemplos de blockers que podríamos encontrar:

1. **Supabase RLS no funciona correctamente**
   - Severidad: 🔴 Critical
   - Impacto: Seguridad de PHI comprometida
   - Acción: Detener desarrollo hasta resolver

2. **Validación Zod permite datos médicos inválidos**
   - Severidad: 🔴 Critical
   - Impacto: Integridad de datos de pacientes
   - Acción: Revisar todos los schemas

3. **Permisos de roles no funcionan (doctor puede ver todo)**
   - Severidad: 🔴 Critical
   - Impacto: HIPAA compliance violado
   - Acción: Arreglar inmediatamente

4. **Performance lenta al cargar lista de pacientes**
   - Severidad: 🟡 High
   - Impacto: UX para recepcionistas
   - Acción: Implementar paginación

---

## How to Use

### Al encontrar un blocker:
1. Documenta inmediatamente
2. Usa el template
3. Incluye TODOS los detalles
4. Anota intentos de solución
5. Actualiza status frecuentemente

### Qué documentar:
- ✅ Problemas que detienen desarrollo por >30 min
- ✅ Bugs críticos de producción
- ✅ Dependencias bloqueadas
- ✅ Issues con terceros (Supabase, APIs)
- ✅ **Problemas de seguridad (máxima prioridad en app médica)**
- ❌ Bugs normales (usa issue tracker de GitHub)

### Severity Guide:
- 🔴 **Critical:** Producción caída, seguridad comprometida, PHI en riesgo
- 🟡 **High:** Feature bloqueada, no hay workaround
- 🟢 **Medium:** Hay workaround, inconveniente pero no crítico

### Resolver un blocker:
1. Muévelo a "Resolved"
2. Documenta la solución exacta
3. Incluye lección aprendida
4. Referencia commit/PR si aplica

---

## Tips

- ✅ Documenta mientras investigas, no después
- ✅ Incluye comandos exactos y outputs completos
- ✅ Links a recursos útiles (Supabase docs, GitHub issues)
- ✅ Screenshots si ayudan
- ✅ Stack traces completos
- ✅ Versiones de dependencias relevantes
- ✅ **Para app médica: SIEMPRE reportar issues de seguridad inmediatamente**

---

## Dile a Claude

Para ayuda con blocker:
```
Lee .claude/memory/BLOCKERS.md y ayúdame a resolver [blocker X]
```

Para documentar nuevo:
```
Ayúdame a documentar este blocker en BLOCKERS.md:
[descripción del problema]
```

Para actualizar status:
```
Actualiza status de [blocker X] en BLOCKERS.md: [nueva info]
```
