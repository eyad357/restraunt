/**
 * Route registration for the "kitchen" module.
 *
 * See src/routes/moduleRoutes.ts for the registration convention: the
 * shared router discovers this file automatically, so nothing outside
 * this module needed to change to add this route.
 */
import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "../../auth/ProtectedRoute";
import { KitchenPage } from "./pages/KitchenPage";

const routes: RouteObject[] = [
  {
    path: "/kitchen",
    element: (
      <ProtectedRoute>
        <KitchenPage />
      </ProtectedRoute>
    ),
  },
];

export default routes;
