# frontend/src/modules/

Physical module isolation per `RESTAURANT_SYSTEM_MASTER_SPEC.md` (§"PARALLEL
FRONTEND DEVELOPMENT & HANDOFF RULES") and `docs/contracts/ownership-map.md`.

## Ownership (frontend phase)

**Person 1** — created in Phase P1-FE-01A:
- `auth/`
- `dashboard/`
- `orders/`
- `menu/`
- `kitchen/`

**Person 2** — not created yet; Person 2 creates these when their own
foundation/module work begins:
- `cashier/`
- `inventory/`
- `delivery/`
- `expenses/`
- `reports/`
- `settings/`

Do not create or modify a module directory you do not own. If a shared
change is required, write `INTEGRATION_REQUEST.md` instead of editing
directly (see `docs/contracts/git-integration-rules.md`).

## Route registration convention

Each module registers its own routes by exporting a default `RouteObject[]`
from `modules/<name>/routes.tsx`. The shared router
(`frontend/src/routes/router.tsx`) auto-discovers these files — see
`frontend/src/routes/moduleRoutes.ts` for the full contract. This means a
module's routes are edited only inside that module's own directory; the
shared router file never needs to change when a module adds, removes, or
changes its routes.
