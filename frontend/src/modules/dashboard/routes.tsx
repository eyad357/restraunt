/**
 * Route registration for the "dashboard" module.
 *
 * See src/routes/moduleRoutes.ts for the registration convention: the
 * shared router discovers this file automatically, so nothing outside
 * this module needed to change to add this route.
 *
 * Registered at "/dashboard" rather than "/" — the shared router's root
 * index route ("/") is hardcoded to FoundationCheckPage in
 * src/routes/router.tsx (frozen shared foundation), so taking over "/"
 * would mean editing that shared file. See INTEGRATION_REQUEST.md for the
 * proposal to eventually make "/" redirect into the dashboard once a
 * module is meant to own the app's home route; that change is out of this
 * phase's authorized scope. In the meantime, modules/auth/pages/LoginPage.tsx
 * (owned by Person 1, not a shared file) was updated to redirect a
 * successful login to "/dashboard" directly.
 */
import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "../../auth/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";

const routes: RouteObject[] = [
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
];

export default routes;
