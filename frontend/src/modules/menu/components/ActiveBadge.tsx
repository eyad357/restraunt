import { useMenuTranslation } from "../hooks/useMenuTranslation";

export function ActiveBadge({ isActive }: { isActive: boolean }) {
  const t = useMenuTranslation();
  return (
    <span className={`status-badge ${isActive ? "status-badge--success" : "status-badge--neutral"}`}>
      {isActive ? t("menu.active") : t("menu.inactive")}
    </span>
  );
}

export function DefaultBadge() {
  const t = useMenuTranslation();
  return <span className="status-badge status-badge--info">{t("menu.default")}</span>;
}
