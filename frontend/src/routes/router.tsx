/**
 * Shared routing foundation.
 *
 * FROZEN after this phase — see moduleRoutes.ts for the integration
 * boundary that lets modules add routes WITHOUT editing this file.
 */

import { createBrowserRouter, type RouteObject } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { NotFoundPage } from "../components/layout/NotFoundPage";
import { FoundationCheckPage } from "../components/layout/FoundationCheckPage";
import type { ModuleRouteModule } from "./moduleRoutes";

// Eagerly discover every module's routes.tsx. Eager (not lazy) import here
// is about *discovering which modules registered routes*, not about
// code-splitting the app — each module's own routes.tsx can still use
// `React.lazy` for its page components (see AppLoading.tsx for the
// Suspense boundary that supports that).
const moduleRouteFiles = import.meta.glob<ModuleRouteModule>("../modules/*/routes.tsx", {
  eager: true,
});

const moduleRoutes: RouteObject[] = Object.values(moduleRouteFiles).flatMap(
  (mod) => mod.default,
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <FoundationCheckPage /> },
      ...moduleRoutes,
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
