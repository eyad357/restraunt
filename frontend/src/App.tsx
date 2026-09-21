import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { AppErrorFallback } from "./components/ui/AppErrorFallback";
import { AppLoading } from "./components/ui/AppLoading";
import { LocaleProvider } from "./i18n/LocaleContext";
import { AuthProvider } from "./auth/AuthContext";
import { router } from "./routes/router";

/**
 * Application bootstrap composition.
 *
 * Provider order matters: LocaleProvider must be above anything that calls
 * `useLocale` (including the error fallback), AuthProvider above anything
 * route-protected, and the error boundary must wrap everything else so a
 * render error anywhere below (including inside the router) is caught.
 */
export function App() {
  return (
    <ErrorBoundary
      fallback={(_error, reset) => (
        <LocaleProvider>
          <AppErrorFallback onReload={reset} />
        </LocaleProvider>
      )}
      onError={(error, info) => {
        // eslint-disable-next-line no-console
        console.error("[App] Uncaught render error:", error, info);
      }}
    >
      <LocaleProvider>
        <AuthProvider>
          <Suspense fallback={<AppLoading />}>
            <RouterProvider router={router} />
          </Suspense>
        </AuthProvider>
      </LocaleProvider>
    </ErrorBoundary>
  );
}
