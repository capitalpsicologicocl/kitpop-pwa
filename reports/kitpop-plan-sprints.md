# KitPOP — Plan de trabajo por sprints

**Objetivo original (S1–S6):** pasar de beta comercial (6.9/10) a producto monetizable (~7.8/10). ✅ Completado en código.

**Objetivo actual (S7–S10):** acercarse a SaaS premium US/EU (~8.5/10) + hardening para escalar tráfico pagado.

**Leyenda:** 🤖 Agente (código) · 👤 Tú (contenido/negocio) · ⚙️ Ops (dashboards, keys, DNS)

**Modelo de precios (jul 2026)**

| Plan | Precio | Rol |
|------|--------|-----|
| Explorer | Gratis | Probar, enganchar |
| Pro Anual | USD 39/año | **Default en checkout** |
| Pro Mensual | USD 6,99/mes | Ancla de valor |
| Fundador | USD 29/año | Primeros 100 clientes |

---

## Sprint 1 — Monetización y adquisición (Semana 1–2) ✅

**Meta:** cobrar de verdad y dejar explorar sin login.

| Tarea | Estado | Archivos / notas |
|-------|--------|------------------|
| Precios anual-first + Fundador | ✅ | `planLimits.js`, `PlanSection.jsx`, PayPal |
| Plan PayPal Fundador USD 29/año | ⏳ Ops | Crear en PayPal Dashboard → `PAYPAL_PLAN_PRO_FOUNDING_YEARLY` |
| SQL `is_founding_member` | ⏳ Ops | Ejecutar `supabase/founder_plan_v1.sql` |
| Export gating Pro | ✅ | `ExportProGate.jsx` — taller, bitácora, encuestas, live |
| Guest browse banco | ✅ | Rutas públicas en `App.jsx` |
| Landing precios actualizados | ✅ | `landing/index.html` |
| Proyección escenario B | ✅ | `reports/kitpop-analisis-proyeccion.html` |

**Checklist deploy**

1. PayPal: plan Fundador + actualizar planes Pro a USD 39/año y USD 6,99/mes si aún no existen.
2. Vercel: `PAYPAL_PLAN_PRO_FOUNDING_YEARLY`, redeploy.
3. Supabase: ejecutar SQL fundador.
4. Verificar checkout anual como default y cupos fundador en `/perfil?tab=plan`.

---

## Sprint 2 — Operaciones y conversión (Semana 3–4) ✅

**Meta:** reducir fricción operativa y subir registro → Pro.

| Tarea | Estado | Entregable |
|-------|--------|------------|
| Panel admin cortesía Pro | ✅ | `/admin` + APIs `lookup-user`, `grant-plan` |
| Trial 7 días Pro | ✅ | Botón en admin (`trialing` + 7 días) |
| CTA guest → registro | ✅ | `GuestSignupCTA` en Activity, Category, Home |
| Copy landing alineado | ✅ | Sin promesa audios; IA + exports |
| Email post-registro | ⏳ | Sprint 2.1 (Resend) |

**Checklist deploy Sprint 2**

1. Vercel: `ADMIN_EMAILS=tu@email.com` (emails admin separados por coma)
2. Redeploy Production
3. Inicia sesión → Perfil → **Panel de administración** → busca email beta → **Dar Pro cortesía**

> **Límite Hobby:** Vercel permite máx. **12 serverless functions** por deploy. Admin usa una sola ruta `/api/admin` (no 3 archivos separados).

---

## Sprint 3 — UX polish (Semana 5–6) ✅

**Meta:** subir UX de 6.5 → ~7.5.

| Tarea | Estado | Entregable |
|-------|--------|------------|
| Skeletons en listas | ✅ | Talleres, encuestas, live, categorías, editor |
| Tablas responsive móvil | ✅ | Cards taller + resultados encuesta |
| Feedback IA intermedio | ✅ | `AiProgressPanel` en documento + generación |
| Mejorar auth wall | ✅ | Bitácora actividad con `GuestLoginGate` |
| CompactPlanStrip en más vistas | ✅ | Encuestas y en vivo |

---

## Sprint 4 — Estabilidad y realtime (Semana 7–9) ✅

**Meta:** confianza para escalar tráfico pagado.

| Tarea | Estado | Entregable |
|-------|--------|------------|
| Supabase Realtime en live | ✅ | Canal `live_polls:{sessionId}` + broadcast participantes |
| Tests E2E Playwright | ✅ | `e2e/sprint4.spec.js` — guest, auth gates, export |
| CI en GitHub Actions | ✅ | `.github/workflows/ci.yml` — lint + build + E2E |
| Webhook PayPal idempotente | ✅ | `webhook_events` + `api/_lib/webhookEvents.js` |
| Rate limit APIs IA | ✅ | `api_rate_limits` + `api/_lib/rateLimit.js` |

**Checklist deploy Sprint 4**

1. Supabase SQL: `live_polls_realtime.sql`, `webhook_events_v1.sql`, `api_rate_limits_v1.sql`
2. Redeploy Production (Realtime + APIs)
3. Verificar sesión en vivo: votos sin polling 3 s
4. GitHub Actions: primer run en PR/push a `main`

**E2E opcionales (secrets GitHub):** `E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD`, `E2E_PAYPAL_SANDBOX=1`

---

## Sprint 5 — Contenido (Semana 10–11) ✅

**Meta:** cerrar brechas de contenido (7.2 → 8+).

| Tarea | Estado | Entregable |
|-------|--------|------------|
| Ciencia en 11 guías pendientes | ✅ | `facilitacion.json` — sección Evidencia en las 11 guías |
| UI audios / microlearning | ✅ | Tab **Recursos** + `ActivityMedia.jsx` (YouTube/Vimeo/audio) |
| Migrar catálogo crítico a Supabase | ⏸ | Fuera de alcance — no hay demanda de edición sin deploy |

**Checklist deploy Sprint 5**

1. Redeploy Production (solo frontend; sin SQL)
2. Verificar `/actividad/fac-que-es-facilitar` → pestaña **Evidencia** y **Recursos**
3. Agregar URLs de audio/video en campo `media[]` de actividades según contenido disponible

**Fuera de alcance agente:** grabación de audios.

---

## Sprint 6 — Visual premium (Semana 12) ✅

**Meta:** sensación producto premium sin rediseño total.

| Tarea | Estado | Entregable |
|-------|--------|------------|
| Ilustraciones empty states | ✅ | `EmptyState` + SVG morados en listas vacías |
| Motion sutil (CSS) | ✅ | Tabs actividad, cards plan, hero glow, pricing hover |
| Hero landing refresh | ✅ | Mockup app + social proof + iconos SVG |
| Dark mode (opcional) | ✅ | Variables CSS + `prefers-color-scheme: dark` |

**Checklist deploy Sprint 6**

1. Redeploy Production + landing (`landing/` en Vercel si aplica)
2. Probar listas vacías: favoritos, talleres, encuestas, bitácora
3. Verificar hero en `/` y `www.kitpopapp.com`
4. Probar dark mode con preferencia del sistema

**Fuera de alcance agente:** identidad de marca profunda (requiere diseñador).

---

## Sprint 7 — Hardening (Semana 13–14) ✅

**Meta:** calidad de ingeniería lista para CI estricto + microlearning visible + E2E autenticado.

| Tarea | Estado | Entregable |
|-------|--------|------------|
| Poblar `media[]` en 5–10 actividades clave | ✅ | 6 PERMA + 5 facilitación (11 total con `fac-que-es-facilitar`) |
| E2E login → taller → export gate | ✅ | `e2e/sprint7-auth-workshop.spec.js` |
| Limpiar ESLint (68 errores) | ✅ | `eslint.config.js` env Node + fixes puntuales |
| CI falla en lint | ✅ | Sin `continue-on-error` en `.github/workflows/ci.yml` |
| Usuario test E2E en Supabase | ⏳ Ops | Cuenta Explorer + secrets GitHub |

**Actividades candidatas `media[]` (PERMA):** `ronda-noticias`, `tres-cosas-buenas`, `saboreo-consciente`, `apreciograma`, `proposito-tres-niveles`, `mapa-fortalezas`.

**Actividades candidatas (Facilitación):** `fac-principios-practica`, `fac-rol-facilitador`, `fac-disena-4-fases`, `fac-errores-comunes`.

**Checklist deploy Sprint 7**

1. GitHub: añadir secrets `E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD`.
2. Push → CI verde (lint + build + E2E).
3. Verificar 5–10 actividades con pestaña **Recursos** visible.

**Fuera de alcance agente:** grabación de audios propios; solo URLs públicas curadas.

---

## Sprint 8 — Performance + email (Semana 15–16) 🟡 En curso

**Meta:** bundle más liviano + bienvenida post-registro + liberar slot Vercel.

| Tarea | Quién | Estado | Entregable |
|-------|-------|--------|------------|
| Favicon KitPOP (app + landing) | 🤖 | ✅ | `assets/kitpop-favicon.svg` + `npm run generate:favicons` |
| Email bienvenida + instrucciones PWA | 🤖 | ✅ | `confirm-signup.html`, `welcome.html`, `auth_emails_setup.sql` |
| Configurar Resend SMTP en Supabase | ⚙️ | ⏳ | Pegar template + SMTP (guía en `auth_emails_setup.sql`) |
| Code-splitting rutas pesadas | 🤖 | ⏳ | `React.lazy` en `/talleres`, `/interactivo`, `/admin` |
| Eliminar APIs Stripe muertas | 🤖 | ⏳ | Libera 3 slots Vercel |

**Checklist deploy Sprint 8**

1. Resend: verificar dominio + API key.
2. Supabase: pegar templates + SMTP Resend (`supabase/auth_emails_setup.sql`).
3. Vercel: redeploy; confirmar ≤12 functions.
4. Registro test → correo de bienvenida en bandeja.

**Nota Vercel:** hoy hay **12/12 functions**. Email transaccional extra requiere consolidar rutas o retirar Stripe legacy.

---

## Sprint 9 — Confianza landing (Semana 17–18) ⏳ Prioridad 2

**Meta:** social proof creíble (estructura lista; contenido real tuyo).

| Tarea | Quién | Entregable |
|-------|-------|------------|
| Sección testimonios en landing | 🤖 | `landing/testimonials.json` + cards con foto, rol, cita |
| Barra de logos / “Usado por…” | 🤖 | Grid SVG/PNG con slots configurables |
| Contenido testimonios reales | 👤 | 2–4 citas + permiso + foto opcional |
| Logos reales (consultoras, universidades) | 👤 | PNG/SVG con permiso de uso |
| Caso de uso mini (1 página) | 🤖 + 👤 | `landing/caso-facilitador.html` o sección en index |

**Checklist deploy Sprint 9**

1. Enviar al agente: citas, nombres, cargos, logos (aunque sean borrador).
2. Redeploy landing en Vercel.
3. Revisar mobile + dark mode en testimonios.

**Fuera de alcance agente:** inventar testimonios o logos de clientes reales.

---

## Sprint 10 — Visual premium US/EU (Semana 19–22) ✅ En curso

**Meta:** subir Visual 8.0 → ~8.7; iconografía propia KitPOP (no emojis de teclado).

| Tarea | Estado | Entregable |
|-------|--------|------------|
| Design tokens semánticos | ✅ | `global.css` + `landing/styles.css` — `--surface-elevated`, `--ring`, radios, sombras |
| Dark mode manual + sistema | ✅ | `ThemeContext.jsx` + toggle en topbar app + `landing/theme.js` |
| Iconos SVG propios KitPOP | ✅ | `src/icons/kitpopIcons.jsx` — categorías, hub, landing |
| Landing sin emojis universales | ✅ | `landing/index.html` — sprite SVG + `kp-icon-box` |
| App sin emojis universales | ✅ | Categorías, perfil, interactivo, sidebar, menú |
| Fondo mesh premium | ✅ | `app-mesh-bg` + `landing-mesh` |
| Componentes UI base | ✅ | `ui.css` — `.kp-btn`, `.kp-input`, `.kp-card`, icon boxes |
| Toggle dark en nav landing | ✅ | Botón `#theme-toggle` sincronizado con app (`kitpop-theme`) |

**Checklist deploy Sprint 10**

1. Redeploy Production + landing
2. Probar toggle dark en app y landing (misma preferencia)
3. Verificar iconos en `/`, `/categorias`, `/perfil`, `www.kitpopapp.com`
4. Revisar contraste dark mode en listas y cards

**Pendiente post-S10 (Sprint 8/9 si no hecho):** code-splitting, testimonios reales, email Resend.

**Fuera de alcance agente:** ilustraciones de marca custom por diseñador.

---

## Resumen: qué hace el agente vs qué necesitas tú

| Área | Agente 🤖 | Tú 👤 / Ops ⚙️ |
|------|-----------|----------------|
| `media[]` | Curar 5–10 URLs públicas + metadata | Revisar relevancia; audios propios después |
| E2E auth | Escribir tests + fixtures | Cuenta test + secrets GitHub |
| ESLint + CI | Fix 68 errores + CI estricto | — |
| Code-splitting | Lazy routes + chunks | — |
| Email Resend | Templates HTML + doc + API si hay slot | Resend account, DNS, Supabase SMTP |
| Testimonios/logos | UI + JSON editable | Citas, permisos, archivos logo |
| Visual premium | Tokens, dark mode, componentes, landing | Brand book / diseñador (opcional) |

---

## Backlog negocio (tú, no código)

- Optimización CAC / creativos Meta
- Videos y casos de uso
- Partnerships consultoras / universidades
- Pricing Team/Studio cuando haya demanda

---

## Métricas de seguimiento

| Métrica | Meta mes 3 | Meta mes 6 |
|---------|------------|------------|
| Registros/mes | 80+ | 150+ |
| Conversión registro → Pro | 5% | 7% |
| Churn Pro mensual | <8% | <6% |
| % checkout anual | 60% | 70% |
| NPS facilitadores | — | >40 |

---

## Orden de ejecución recomendado

```
S1–S6 ✅ completados
→ S7 (hardening: lint + E2E + media)
→ S8 (code-split + email Resend)
→ S9 (testimonios landing) — puede solaparse con S8 si ya tienes citas
→ S10 (visual premium US/EU)
```

**Próximo paso inmediato:** deploy Sprint 7 + configurar secrets E2E en GitHub. Luego **Sprint 8** (code-split + email Resend).
