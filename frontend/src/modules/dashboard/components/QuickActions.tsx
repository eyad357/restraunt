import { useDashboardTranslation } from "../hooks/useDashboardTranslation";
import { PlusIcon, KitchenIcon, CashierIcon, DeliveryIcon, InventoryIcon } from "./icons";

/**
 * Every target module (orders, kitchen, cashier, delivery, inventory) is
 * either an empty route skeleton or doesn't exist as a module directory
 * yet, per this phase's own scope rules ("don't build a new module, don't
 * invent a route implementation"). These are real, keyboard-accessible
 * <button> elements, disabled with a clear "not available yet" state —
 * not links to a route that would just 404 via the shared NotFoundPage.
 */
const ACTIONS = [
  { key: "newOrder", labelKey: "dashboard.quickActions.newOrder", icon: <PlusIcon /> },
  { key: "kitchen", labelKey: "dashboard.quickActions.kitchen", icon: <KitchenIcon /> },
  { key: "cashier", labelKey: "dashboard.quickActions.cashier", icon: <CashierIcon /> },
  { key: "delivery", labelKey: "dashboard.quickActions.delivery", icon: <DeliveryIcon /> },
  { key: "inventory", labelKey: "dashboard.quickActions.inventory", icon: <InventoryIcon /> },
] as const;

export function QuickActions() {
  const t = useDashboardTranslation();

  return (
    <section className="dashboard-section" aria-labelledby="quick-actions-title">
      <div className="dashboard-section__heading">
        <h2 id="quick-actions-title">{t("dashboard.quickActions.title")}</h2>
      </div>
      <div className="quick-actions">
        {ACTIONS.map((action) => (
          <button
            key={action.key}
            type="button"
            className="quick-action"
            disabled
            aria-disabled="true"
            title={t("dashboard.quickActions.comingSoon")}
          >
            <span className="quick-action__icon" aria-hidden="true">
              {action.icon}
            </span>
            <span className="quick-action__label">
              {t(`dashboard.quickActions.${action.key}` as `dashboard.quickActions.${typeof action.key}`)}
            </span>
            <span className="quick-action__badge">{t("dashboard.quickActions.comingSoon")}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
