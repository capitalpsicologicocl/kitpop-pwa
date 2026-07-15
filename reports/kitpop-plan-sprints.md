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

## Sprint 4 — Estabilidad y realtime (Semana 7–9)

**Meta:** confianza para escalar tráfico pagado.

| Tarea | Impacto | Entregable |
|-------|---------|------------|
| Supabase Realtime en live | Medio | Reemplazar polling 3–4s por canal `live_polls` |
| Tests E2E Playwright | Alto | Flujos: guest browse → registro → checkout sandbox → export gated → taller IA |
| CI en GitHub Actions | Alto | `npm run build` + E2E en PR |
| Webhook PayPal idempotente | Medio | Log + retry en `api/paypal-webhook` |
| Rate limit APIs IA | Medio | Por usuario + plan |

---

## Sprint 5 — Contenido (Semana 10–11)

**Meta:** cerrar brechas de contenido (7.2 → 8+).

| Tarea | Impacto | Entregable |
|-------|---------|------------|
| Ciencia en 11 guías pendientes | Medio | JSON + UI sección “Evidencia” |
| UI audios / microlearning | Medio | Reproductor + lista; URLs externas (YouTube/Vimeo/Supabase Storage) |
| Migrar catálogo crítico a Supabase | Bajo | Solo si se necesita edición sin deploy |

**Fuera de alcance agente:** grabación de audios.

---

## Sprint 6 — Visual premium (Semana 12)

**Meta:** sensación producto premium sin rediseño total.

| Tarea | Impacto | Entregable |
|-------|---------|------------|
| Ilustraciones empty states | Medio | SVG inline morados |
| Motion sutil (Framer/CSS) | Bajo | Transiciones tabs, cards plan |
| Hero landing refresh | Medio | Mockup app + social proof placeholder |
| Dark mode (opcional) | Bajo | Variables CSS |

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
