import { useMenuTranslation } from "../hooks/useMenuTranslation";
import "../pages/menu.css";

/**
 * Shown instead of any Menu page's real content whenever the menu
 * service rejects with `MenuServiceUnavailableError` — which is every
 * time, in the shipped default configuration, since no menu-management
 * endpoint is documented yet (see INTEGRATION_REQUEST.md). This is the
 * honest empty/error state this phase's own rules require, applied at
 * the whole-page level since it affects every Menu screen equally.
 */
export function MenuUnavailable() {
  const t = useMenuTranslation();
  return (
    <div className="menu-page">
      <div className="menu-panel menu-empty">
        <p className="menu-empty__title">{t("menu.unavailable.title")}</p>
        <p className="menu-empty__body">{t("menu.unavailable.body")}</p>
      </div>
    </div>
  );
}
