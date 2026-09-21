/**
 * Route protection boundary.
 *
 * Wrap any route element a module registers that should require an
 * authenticated session, e.g.:
 *
 *   { path: "/orders", element: <ProtectedRoute><OrdersPage /></ProtectedRoute> }
 *
 * This is infrastructure only — it does not know about roles/branches yet
 * beyond what `useAuth` already exposes. Role/branch-specific gating
 * (OWNER vs CASHIER, per docs/contracts/auth-contract.md) is a module
 * concern to layer on top once real pages exist.
 */

import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
