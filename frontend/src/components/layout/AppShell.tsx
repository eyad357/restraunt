import { Outlet } from "react-router-dom";
import { useLocale } from "../../i18n/LocaleContext";

/**
 * Root layout shell. Intentionally minimal for this phase — a real
 * sidebar/topbar with navigation is business-module UI (dashboard/auth
 * concerns) that belongs to a later phase, not shared infrastructure.
 *
 * The locale toggle lives here (not in a module) because switching UI
 * language is shared chrome behavior, not any one module's feature.
 */
export function AppShell() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <span className="app-shell__brand">{t("app.name")}</span>
        <button
          type="button"
          className="btn btn--secondary app-shell__locale-toggle"
          onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
        >
          {t("app.locale.toggle")}
        </button>
      </header>
      <main className="app-shell__content">
        <Outlet />
      </main>
    </div>
  );
}
