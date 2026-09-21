import { Link } from "react-router-dom";
import { useLocale } from "../../i18n/LocaleContext";

export function NotFoundPage() {
  const { t } = useLocale();

  return (
    <div className="app-boundary">
      <h1 className="app-boundary__title">{t("app.notFound.title")}</h1>
      <p className="app-boundary__body">{t("app.notFound.body")}</p>
      <Link to="/" className="btn btn--primary">
        {t("app.notFound.home")}
      </Link>
    </div>
  );
}
