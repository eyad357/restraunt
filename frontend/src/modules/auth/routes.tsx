/**
 * Route registration for the "auth" module.
 *
 * See src/routes/moduleRoutes.ts for the registration convention this file
 * follows: the shared router discovers this file automatically via
 * import.meta.glob, so nothing outside this module needed to change to
 * add these routes.
 */
import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "../../auth/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { LogoutPage } from "./pages/LogoutPage";

const routes: RouteObject[] = [
  { path: "/login", element: <LoginPage /> },
  {
    path: "/logout",
    element: (
      <ProtectedRoute>
        <LogoutPage />
      </ProtectedRoute>
    ),
  },
];

export default routes;
