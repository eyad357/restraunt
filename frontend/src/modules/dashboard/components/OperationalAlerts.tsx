import { useDashboardTranslation } from "../hooks/useDashboardTranslation";
import { useAlerts } from "../hooks/useAlerts";
import { SectionState } from "./SectionState";
import { AlertIcon } from "./icons";
import type { DashboardAlert } from "../types/dashboard";

function shortId(id: string): string {
  return `#${id.slice(-6).toUpperCase()}`;
}

export function OperationalAlerts() {
  const t = useDashboardTranslation();
  const { status, data, error, retry, dismiss, dismissingIds } = useAlerts(10);

  return (
    <section className="dashboard-section" aria-labelledby="alerts-title">
      <div className="dashboard-section__heading">
        <h2 id="alerts-title">{t("dashboard.alerts.title")}</h2>
        <p>{t("dashboard.alerts.subtitle")}</p>
      </div>
      <SectionState<DashboardAlert[]>
        status={status}
        data={data}
        error={error}
        retry={retry}
        isEmpty={(alerts) => alerts.length === 0}
        renderEmpty={() => (
          <div className="dashboard-empty">
            <p className="dashboard-empty__title">{t("dashboard.alerts.empty.title")}</p>
            <p className="dashboard-empty__body">{t("dashboard.alerts.empty.body")}</p>
          </div>
        )}
        renderSuccess={(alerts) => (
          <ul className="alert-list">
            {alerts.map((alert) => {
              const isDismissing = dismissingIds.has(alert.id);
              return (
                <li key={alert.id} className="alert-list__item">
                  <span className="alert-list__icon" aria-hidden="true">
                    <AlertIcon />
                  </span>
                  <div className="alert-list__body">
                    {alert.kind === "ORDER_READY" ? (
                      <>
                        <p className="alert-list__title">{t("dashboard.alerts.orderReady.title")}</p>
                        <p className="alert-list__detail">
                          {t("dashboard.alerts.orderReady.body", { orderId: shortId(alert.orderId) })}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="alert-list__title">{t("dashboard.alerts.lowStock.title")}</p>
                        <p className="alert-list__detail">
                          {t("dashboard.alerts.lowStock.body", {
                            itemId: shortId(alert.inventoryItemId),
                            quantity: alert.currentQuantity,
                          })}
                        </p>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn--secondary alert-list__dismiss"
                    disabled={isDismissing}
                    onClick={() => dismiss(alert.id)}
                  >
                    {isDismissing ? t("dashboard.alerts.dismissing") : t("dashboard.alerts.dismiss")}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      />
    </section>
  );
}
