/**
 * Module route registration convention.
 *
 * INTEGRATION BOUNDARY: this is the ONLY contract between the shared router
 * (router.tsx, frozen after this phase) and each business module. A module
 * registers its own routes by exporting a default `RouteObject[]` from:
 *
 *   frontend/src/modules/<module-name>/routes.tsx
 *
 * The router discovers these files automatically via `import.meta.glob` —
 * it does NOT import each module by name. This means:
 *
 *  - Adding, changing, or removing a module's routes never requires editing
 *    router.tsx (a shared/frozen file) — only the module's own routes.tsx.
 *  - Person 1 and Person 2 can add routes in parallel with zero risk of
 *    both needing to edit the same shared line.
 *  - A module with no routes.tsx yet (e.g. an empty skeleton) is simply not
 *    included in the route tree — no error, no shared-file edit needed to
 *    "turn it off".
 *
 * Each route's `path` must be absolute (e.g. "/orders", "/orders/:id") —
 * modules are mounted flat under the root layout, not nested by module
 * name, so a module is free to choose its own URL shape.
 *
 * Route elements needing an authenticated session should wrap themselves
 * with <ProtectedRoute> (see src/auth/ProtectedRoute.tsx) — the shared
 * router does not apply protection implicitly.
 */

import type { RouteObject } from "react-router-dom";

export type ModuleRouteModule = { default: RouteObject[] };
