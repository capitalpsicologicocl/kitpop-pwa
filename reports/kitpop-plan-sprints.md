# KitPOP — Plan de trabajo por sprints

**Objetivo:** pasar de beta comercial (6.9/10) a producto monetizable y estable en 6 sprints (~12 semanas).

**Modelo de precios (jul 2026)**

| Plan | Precio | Rol |
|------|--------|-----|
| Explorer | Gratis | Probar, enganchar |
| Pro Anual | USD 39/año | **Default en checkout** |
| Pro Mensual | USD 6,99/mes | Ancla de valor |
| Fundador | USD 29/año | Primeros 100 clientes |

---

## Sprint 1 — Monetización y adquisición (Semana 1–2) ✅ En curso

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

## Sprint 2 — Operaciones y conversión (Semana 3–4) ✅ En curso

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

## Sprint 3 — UX polish (Semana 5–6) ✅ En curso

**Meta:** subir UX de 6.5 → ~7.5.

| Tarea | Estado | Entregable |
|-------|--------|------------|
| Skeletons en listas | ✅ | Talleres, encuestas, live, categorías, editor |
| Tablas responsive móvil | ✅ | Cards taller + resultados encuesta |
| Feedback IA intermedio | ✅ | `AiProgressPanel` en documento + generación |
| Mejorar auth wall | ✅ | Bitácora actividad con `GuestLoginGate` |
| CompactPlanStrip en más vistas | ✅ | Encuestas y en vivo |

---

## Sprint 4 — Estabilidad y realtime (Semana 7–9) ✅ En curso

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

## Sprint 5 — Contenido (Semana 10–11) ✅ En curso

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

## Sprint 6 — Visual premium (Semana 12) ✅ En curso

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
S1 (monetización) → S2 (admin + CTA) → S4 (tests) en paralelo con S3 (UX)
→ S5 (contenido) → S6 (visual)
```

**Próximo paso inmediato:** terminar deploy Sprint 1 (PayPal + SQL + Vercel) y arrancar panel admin Sprint 2.
