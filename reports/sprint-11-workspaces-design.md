# Sprint 11 — Espacios de trabajo participantes

**Fecha diseño:** 23 jul 2026  
**Estado:** ✅ **Aprobado** (23 jul 2026)  
**Uso piloto:** taller facilitador **lun 28 jul 2026** (presencial; trabajo **entre sesiones**)  
**Meta producto:** módulo vendible en Pro, sin subir costos infra de forma significativa.

---

## 1. Resumen ejecutivo

Nuevo módulo **Espacio de trabajo** (distinto del taller “diseño de sesión” actual):

- El **facilitador** arma un panel con bloques (preguntas, tablas, instrucciones).
- Comparte **código/enlace** (`/p/CODIGO` o ruta dedicada).
- **Participantes** se registran (nombre + email + contraseña), quedan en lista de inscripcos.
- El facilitador **asigna grupos** (tipo salas Zoom): crea N grupos con nombre/número y asigna personas.
- Participantes responden secciones **individuales** y **grupales** (un **editor** por grupo en lo grupal; resto solo lectura).
- Facilitador ve **panel en vivo**: inscripcos, grupos, avance, respuestas, agregados, **imprimir** resumen.
- **Pausar** o **archivar** cierra acceso participantes.
- Participante **no ve** el resto de KitPOP (shell acotado + nombre del taller).

---

## 2. Decisiones cerradas (stakeholder)

| Tema | Decisión |
|------|----------|
| Grupos | Facilitador crea cantidad/nombres al crear el espacio; asigna inscritos manualmente |
| Inscripción | Nombre + email + contraseña vía enlace/código del taller |
| Email confirm | **Auto Confirm** (Supabase) — confirmado |
| Un grupo por persona | Sí |
| Grupal | Un **editor** por grupo; demás solo visualizan respuesta grupal |
| Visibilidad | Solo respuestas propias (individual) + grupal de su grupo |
| Cierre | **Pausar** (temporal) + **Archivar** (definitivo) |
| Tipos de campo lunes | Texto corto/largo, alternativa única/múltiple, V/F, tabla, Likert 1–5, solo lectura |
| Tablas | Facilitador define columnas; **filas fijas** o **expandibles** por bloque (default: expandibles) — confirmado |
| Navegación | Facilitador elige por espacio o por sección: **libre** vs **secuencial obligatorio** |
| Plantilla en vivo | **Editable el mismo día** aunque haya participantes (con reglas — §6) |
| Reset password | Flujo estándar Supabase “olvidé contraseña” (no panel facilitador) |
| Panel lunes | Inscritos, % avance, respuestas texto, agregados alternativas, imprimir |
| Participantes Pro | **Hasta 50** por espacio incluido en Pro |
| Uploads | **Fase 11b** (opcional lunes) |
| Datos | Confidenciales → aviso privacidad + retención al archivar |
| UX participante | `/p/CODIGO` → registro/login → espacio; **título del taller** visible; solo ES |

---

## 3. Modelo conceptual

```
Espacio de trabajo (workspace)
├── Metadatos: título, descripción, estado (borrador | abierto | pausado | archivado)
├── Código de acceso (6 chars, reutiliza patrón access_codes o extensión)
├── Grupos[] (nombre, número, editor_user_id nullable)
├── Secciones[] (orden, tipo, alcance individual|grupal, bloqueo secuencial)
│   └── config JSON (opciones, columnas tabla, filas fijas, etc.)
├── Inscripciones[] (user_id, display_name, group_id nullable, joined_at)
└── Respuestas[] (section_id, user_id | group_id, payload JSON, updated_at)
```

### Estados del espacio

| Estado | Facilitador | Participante |
|--------|-------------|--------------|
| `draft` | Edita plantilla | No accede |
| `open` | Panel + edición | Accede y responde |
| `paused` | Ve todo | Mensaje “Espacio pausado” |
| `archived` | Solo lectura/export | Sin acceso |

---

## 4. Tipos de bloque (editor facilitador)

| `type` | UI participante | Agregado facilitador |
|--------|-----------------|----------------------|
| `info` | Markdown/HTML instrucciones | — |
| `text_short` | Input una línea | Lista respuestas |
| `text_long` | Textarea | Lista respuestas |
| `single_choice` | Radio | Conteo por opción |
| `multi_choice` | Checkboxes | Conteo por opción |
| `boolean` | Sí / No | % Sí |
| `likert` | 1–5 (reutilizar UX encuesta) | Media / distribución |
| `table` | Grid editable | Por fila o export tabla |

**Tabla — config facilitador:**

- `columns`: `[{ key, label, type: text|date|... }]`
- `row_mode`: `fixed` (N filas vacías) | `expandable` (botón “Agregar fila”)
- Alcance: individual (cada uno su tabla) o grupal (editor edita una tabla del grupo)

---

## 5. Flujos

### 5.1 Facilitador — crear espacio

1. Perfil / Talleres → **Nuevo espacio de trabajo**
2. Título + nombre visible (branding)
3. Crear **grupos** (ej. “Grupo 1”…“Grupo 8”) — cantidad libre
4. Añadir **secciones** (drag orden), configurar tipo y alcance
5. Opciones globales: navegación libre/secuencial; pausar/archivar
6. **Publicar** → genera código + enlace + QR (opcional fase 2)
7. Estado → `open`

### 5.2 Participante — inscripción

1. Abre `/p/{code}` (o `/espacio/{code}`)
2. Si no tiene cuenta: **Registro** (nombre, email, contraseña) → metadata `workspace_id`, `role: participant`
3. Si tiene cuenta: **Login**
4. Pantalla “Esperando asignación de grupo” hasta que facilitador asigne (o mensaje amigable)
5. Tras asignación: ve secciones individuales + grupal de su grupo
6. En sección grupal: si es **editor**, edita/envía; si no, solo lectura de la respuesta grupal

**Editor de grupo (MVP lunes):** facilitador designa editor al asignar grupo (dropdown en panel). Fase 11b: “reclamar editor” dentro del grupo.

### 5.3 Facilitador — panel del espacio

Pestañas sugeridas:

1. **Inscripciones** — nombre, email, grupo, % completado, última actividad; asignar grupo; marcar editor
2. **Grupos** — miembros, avance grupal
3. **Secciones** — respuestas en vivo por bloque; agregados (alternativas, Likert)
4. **Diseño** — mismo editor de plantilla (con advertencia si hay respuestas)
5. **Exportar** — vista imprimible (navegador)

### 5.4 Pausar / archivar

- **Pausar:** `open` → `paused`; participantes autenticados ven banner
- **Archivar:** irreversible para participantes; facilitador conserva lectura + export

---

## 6. Edición de plantilla con respuestas existentes

Reglas MVP (evitar corrupción de datos):

- **Permitido:** editar textos de instrucciones (`info`); añadir secciones **al final**; cambiar título del espacio
- **Con confirmación:** cambiar tipo de sección, borrar sección, reordenar (si hay respuestas)
- **No permitido si hay respuestas:** reducir columnas de tabla eliminando datos

---

## 7. Arquitectura técnica (KitPOP actual)

### Reutilizar

- `access_codes` + `/p/:code` (nuevo `resource_type: workspace`)
- Supabase Auth + patrones RLS / RPC (como encuestas)
- `RequireAuth` / layout participante **sin** Sidebar principal
- Export: HTML + `printDocumentPdf()` existente
- Plan Pro + límite 50 participantes en `planLimits.js`

### Nuevo (Supabase)

```sql
-- Esquema orientativo (nombres finales en implementación)
workspaces (id, user_id, title, status, settings jsonb, ...)
workspace_groups (id, workspace_id, name, sort_order, editor_participant_id)
workspace_sections (id, workspace_id, sort_order, type, scope, config jsonb, ...)
workspace_participants (id, workspace_id, user_id, display_name, group_id, ...)
workspace_responses (id, section_id, participant_id, group_id nullable, value jsonb, ...)
```

- RPC `get_workspace_for_participant(code)` — valida estado, membership, devuelve secciones + respuestas permitidas
- RPC `upsert_workspace_response(...)` — valida editor en grupal
- RLS: facilitador `user_id`; participante vía `workspace_participants`

### Roles

- **Facilitador:** cuenta KitPOP normal (`profiles.plan` pro+)
- **Participante:** mismo `auth.users`; flag en `workspace_participants` o `app_metadata.role = workspace_participant` + `workspace_id` (evitar acceso a rutas `/talleres`, `/categorias`)

**Shell participante:** rutas bajo `/p/:code/*` o `/espacio/:code/*` sin `Layout` estándar.

### Costos (objetivo bajo)

| Recurso | Mitigación |
|---------|------------|
| Auth MAU | Cap 50/espacio; participantes no usan resto de app |
| DB | JSONB respuestas; sin Realtime obligatorio (poll 30s en panel facilitador MVP) |
| Storage | Sin uploads en 11a |
| Vercel functions | Reutilizar RPC Supabase; 1 API opcional export HTML; **eliminar Stripe legacy** antes si hace falta slot |
| Realtime | Fase 11b; MVP refresh manual / intervalo |

**Pricing futuro (borrador):** Pro incluye N espacios activos + 50 participantes/espacio; Studio más participantes / espacios simultáneos.

---

## 8. Fases de entrega

### 11a — MVP piloto (objetivo: operativo lun 27 jul)

**Facilitador**

- [ ] CRUD espacio + secciones (todos los tipos §4 excepto uploads)
- [ ] Grupos dinámicos (crear N al vuelo)
- [ ] Publicar + código/enlace
- [ ] Panel: inscripciones, asignar grupo, designar editor
- [ ] Panel: ver respuestas + agregados básicos + % completado
- [ ] Pausar / archivar
- [ ] Imprimir resumen (navegador)
- [ ] Edición plantilla reglas §6

**Participante**

- [ ] Registro/login (auto-confirm)
- [ ] Shell sin menú KitPOP + título taller
- [ ] Responder individual + grupal (editor)
- [ ] Ver solo propio + grupal de su grupo

**Ops**

- [ ] Auto Confirm participantes en Supabase
- [ ] Aviso privacidad en registro (checkbox)
- [ ] Límite 50 participantes

### 11b — Post-piloto (sem 1–2 ago)

- [ ] Uploads (5 MB/archivo, 50 MB/espacio)
- [ ] QR enlace
- [ ] Realtime panel facilitador
- [ ] Reclamar editor en grupo
- [ ] Duplicar espacio / plantillas guardadas

### 11c — Comercialización

- [ ] Límites Explorer vs Pro vs Studio
- [ ] Métricas de uso para pricing
- [ ] Onboarding facilitador

---

## 9. Calendario realista (23 → 27 jul)

| Día | Entrega técnica | Tu uso |
|-----|-----------------|--------|
| **Jue 24** | Esquema DB + registro participante + publicar espacio | Crear borrador plantilla |
| **Vie 25** | Editor secciones + responder individual | Probar con 2–3 cuentas test |
| **Sáb 26** | Grupos + asignación + grupal + panel inscripciones | Ensayo completo |
| **Dom 27** | Pausa/archivar + export imprimir + fixes | Ajuste final plantilla |
| **Lun 28** | **Sesión presencial:** inscripción en sala; asignación grupos | Trabajo **entre sesiones** en app |

> **Nota:** El lunes 28 en sala el flujo crítico es **inscripción + asignación a grupos** (15–20 min). Las respuestas profundas ocurren **después**, lo que alinea con entregar 11a el fin de semana.

---

## 10. Pendientes menores (defaults propuestos)

| Pregunta no respondida | Default propuesto |
|------------------------|-------------------|
| Confirmación email | **Auto Confirm** |
| Tabla filas | Facilitador elige **fixed** o **expandable** por bloque |
| Código obligatorio en registro | Implícito vía URL `/p/CODIGO` (no registro global KitPOP) |
| Elección editor | Facilitador asigna en panel (MVP) |

---

## 11. Próximo paso implementación

1. Validar este documento (1 mensaje: “aprobado” o ajustes).
2. Crear rama `sprint-11-workspaces`.
3. SQL `supabase/workspaces_v1.sql` + RPCs.
4. Rutas participante + panel facilitador.
5. Checklist ensayo sáb 26.

---

## 12. Nombre en producto (UI)

- Facilitador: **Espacios de trabajo** (submenu Talleres o Interactivo)
- Participante: **“{Título del taller}”** — powered by KitPOP (pie discreto)
