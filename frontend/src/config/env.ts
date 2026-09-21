/**
 * Environment / configuration boundary.
 *
 * This is the ONLY file that should read `import.meta.env` directly.
 * Everything else (API client, i18n, etc.) imports `env` from here so the
 * rest of the app never depends on Vite's env mechanism directly and the
 * configuration surface stays in one place.
 *
 * Required variables must be declared in `src/vite-env.d.ts` and documented
 * in `.env.example`.
 */

interface AppEnv {
  /** Base URL for the backend API, e.g. "http://localhost:8000/api/v1". */
  apiBaseUrl: string;
  /** Build mode as reported by Vite ("development" | "production" | ...). */
  mode: string;
}

function readApiBaseUrl(): string {
  const value = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!value || value.trim() === "") {
    // Fail loudly at startup rather than silently calling the wrong host.
    // eslint-disable-next-line no-console
    console.warn(
      "[config] VITE_API_BASE_URL is not set — falling back to /api/v1. " +
        "Set it in .env (see .env.example) once a backend exists.",
    );
    return "/api/v1";
  }
  return value.replace(/\/+$/, "");
}

export const env: AppEnv = {
  apiBaseUrl: readApiBaseUrl(),
  mode: import.meta.env.MODE,
};
