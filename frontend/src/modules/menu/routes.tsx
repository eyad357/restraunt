/**
 * Route registration for the "menu" module.
 *
 * See src/routes/moduleRoutes.ts for the registration convention: the
 * shared router discovers this file automatically, so nothing outside
 * this module needed to change to add these routes.
 *
 * "/menu" itself redirects to "/menu/categories" — Category is the top
 * of the documented hierarchy (Category -> Product -> Variant ->
 * Modifier), so it's the natural landing page. No standalone
 * "/menu/variants" or "/menu/modifiers" route exists: both are strictly
 * product-scoped per domain-entities.md (each carries a required
 * product_id, no product-agnostic listing makes sense), so they're
 * managed from "/menu/products/:productId" instead — a deliberate,
 * documented deviation from the task's own "suggested ONLY if consistent
 * with contracts" route list.
 */
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "../../auth/ProtectedRoute";
import { CategoriesPage } from "./pages/CategoriesPage";
import { ProductsPage } from "./pages/ProductsPage";
import { ProductDetailsPage } from "./pages/ProductDetailsPage";

const routes: RouteObject[] = [
  { path: "/menu", element: <Navigate to="/menu/categories" replace /> },
  {
    path: "/menu/categories",
    element: (
      <ProtectedRoute>
        <CategoriesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/menu/products",
    element: (
      <ProtectedRoute>
        <ProductsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/menu/products/:productId",
    element: (
      <ProtectedRoute>
        <ProductDetailsPage />
      </ProtectedRoute>
    ),
  },
];

export default routes;
