/**
 * Auth module public surface.
 *
 * Nothing needs to be re-exported for other modules to consume today —
 * routing integration happens via routes.tsx (auto-discovered, see
 * src/routes/moduleRoutes.ts), and session state is read via the SHARED
 * `useAuth()` (src/auth/AuthContext.tsx), not through this module.
 *
 * This file exists as the documented extension point per the module
 * structure convention, should a future phase need to expose something
 * (e.g. a reusable login-required banner) to other modules.
 */
export {};
