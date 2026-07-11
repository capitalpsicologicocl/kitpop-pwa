# DECISIONES DE ARQUITECTURA

Este documento registra las decisiones importantes del proyecto y el motivo de cada una.

---

## Decisión 001

### El HTML oficial es la fuente maestra del diseño.

Motivo:

Evitar rediseños innecesarios y mantener consistencia visual durante toda la migración.

---

## Decisión 002

### React adapta el HTML.

No se diseñan nuevas pantallas.

Todo componente React nace desde el HTML oficial.

---

## Decisión 003

### Componentes pequeños

Ningún componente debería crecer innecesariamente.

Siempre que sea posible se dividirá en componentes reutilizables.

---

## Decisión 004

### Separación entre datos y componentes

Toda información (categorías, actividades, fortalezas, configuración) vive fuera de los componentes.

Inicialmente en `src/data`.

Posteriormente en Supabase.

---

## Decisión 005

### Trabajo por Sprints

Cada Sprint tendrá:

- Objetivo.
- Archivos involucrados.
- Código completo.
- Validación visual.
- Actualización del ROADMAP.

---

## Decisión 006

### Metodología de trabajo

El usuario prefiere trabajar reemplazando archivos completos.

Las instrucciones serán siempre:

- Abrir archivo.
- Borrar contenido.
- Pegar código completo.

Evitar modificaciones parciales.

---

## Decisión 007

### Calidad profesional

Cada nueva funcionalidad debe cumplir con tres requisitos:

1. Escalable.
2. Mantenible.
3. Consistente con la arquitectura del proyecto.