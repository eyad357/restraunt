/**
 * Route registration for the "orders" module.
 *
 * See src/routes/moduleRoutes.ts for the registration convention: the
 * shared router discovers this file automatically, so nothing outside
 * this module needed to change to add these routes.
 */
import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "../../auth/ProtectedRoute";
import { OrdersListPage } from "./pages/OrdersListPage";
import { OrderDetailsPage } from "./pages/OrderDetailsPage";
import { NewOrderPage } from "./pages/NewOrderPage";

const routes: RouteObject[] = [
  {
    path: "/orders",
    element: (
      <ProtectedRoute>
        <OrdersListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/orders/new",
    element: (
      <ProtectedRoute>
        <NewOrderPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/orders/:orderId",
    element: (
      <ProtectedRoute>
        <OrderDetailsPage />
      </ProtectedRoute>
    ),
  },
];

export default routes;
