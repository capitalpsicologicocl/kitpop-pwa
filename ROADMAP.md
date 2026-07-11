# KITPOP PWA — ROADMAP OFICIAL

## Objetivo del proyecto

Migrar el HTML oficial aprobado de KitPOP a una aplicación profesional en React + Supabase + Vercel + PWA.

La regla principal del proyecto es:

> React no rediseña KitPOP. React migra técnicamente el HTML aprobado manteniendo una experiencia idéntica o mejor.

---

## Stack tecnológico

- React
- Vite
- React Router DOM
- Supabase
- Vercel
- PWA
- CSS modular basado en HTML oficial

---

## Estado general

Avance estimado actual: 22%

---

## Arquitectura

Estado: 100%

- Proyecto React creado con Vite.
- Estructura base creada.
- Router configurado.
- Layout base funcionando.
- Componentización iniciada.
- Separación de datos iniciada.

---

## Estructura actual

```txt
src/
├─ components/
│  ├─ home/
│  │  ├─ Hero.jsx
│  │  ├─ CategoryGrid.jsx
│  │  └─ CategoryCard.jsx
│  ├─ Layout.jsx
│  ├─ Topbar.jsx
│  ├─ Sidebar.jsx
│  └─ Footer.jsx
├─ data/
│  └─ categories.js
├─ pages/
│  ├─ Home.jsx
│  ├─ Categories.jsx
│  ├─ Category.jsx
│  ├─ Activity.jsx
│  ├─ Login.jsx
│  ├─ Register.jsx
│  ├─ Profile.jsx
│  ├─ Favorites.jsx
│  └─ Journal.jsx
├─ services/
│  └─ supabaseClient.js
└─ styles/
   ├─ global.css
   ├─ layout.css
   ├─ home.css
   └─ kitpop.css