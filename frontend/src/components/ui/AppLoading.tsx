import { useLocale } from "../../i18n/LocaleContext";

/**
 * Basic application loading boundary — used as the Suspense fallback while
 * lazily-loaded module routes (see src/routes/router.tsx) are fetched.
 */
export function AppLoading() {
  const { t } = useLocale();

  return (
    <div className="app-boundary" role="status" aria-live="polite">
      <span className="app-boundary__spinner" aria-hidden="true" />
      <span>{t("app.loading")}</span>
    </div>
  );
}
