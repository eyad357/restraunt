import { useLocale } from "../../i18n/LocaleContext";

export function AppErrorFallback({ onReload }: { onReload: () => void }) {
  const { t } = useLocale();

  return (
    <div className="app-boundary" role="alert">
      <h1 className="app-boundary__title">{t("app.error.title")}</h1>
      <p className="app-boundary__body">{t("app.error.body")}</p>
      <button type="button" className="btn btn--primary" onClick={onReload}>
        {t("app.error.reload")}
      </button>
    </div>
  );
}
