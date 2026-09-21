# Restaurant Management System — Frontend

React + TypeScript + Vite. RTL-first (Arabic default, English secondary),
desktop-first, modular monolith frontend for a multi-branch restaurant
management system. See `../RESTAURANT_SYSTEM_MASTER_SPEC.md` and
`../docs/contracts/` for the authoritative project/technical contracts.

## Getting started

```bash
npm install
cp .env.example .env   # adjust VITE_API_BASE_URL once a backend exists
npm run dev
```

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc -b`) and produce a production build
- `npm run lint` — run oxlint
- `npm run preview` — preview the production build locally

## Structure

```
src/
  config/     env boundary (src/config/env.ts is the only file reading import.meta.env)
  api/        shared API client (envelope/error/auth-header handling only — no endpoints)
  auth/       auth state boundary, token storage abstraction, route protection
  i18n/       locale context, direction (RTL/LTR) handling, shared chrome translations
  components/ shared UI primitives (components/ui) and root layout (components/layout)
  routes/     shared router; auto-discovers each module's routes.tsx (see routes/moduleRoutes.ts)
  modules/    one directory per business module — see modules/README.md for ownership
```

Everything outside `src/modules/<your-module>/` is shared/frozen
infrastructure — see `docs/contracts/git-integration-rules.md` for the
process to request a change to it.

## Contracts

Domain types, enums, and the API envelope shape come from
`frontend/contracts/*.ts` and must not be redefined locally.
