import type { OrderStatus } from "../../../../contracts/enums";
import { useDashboardTranslation } from "../hooks/useDashboardTranslation";
import { useOrderStatusCounts } from "../hooks/useOrderStatusCounts";
import { SectionState } from "./SectionState";
import { OrderStatusBadge } from "./StatusBadge";
import type { OrderStatusCounts } from "../types/dashboard";

const DISPLAY_ORDER: OrderStatus[] = [
  "PLACED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
  "DRAFT",
];

export function OrderStatusOverview() {
  const t = useDashboardTranslation();
  const result = useOrderStatusCounts();
  const total = result.data
    ? Object.values(result.data).reduce((sum, n) => sum + n, 0)
    : 0;

  return (
    <section className="dashboard-section" aria-labelledby="order-status-title">
      <div className="dashboard-section__heading">
        <h2 id="order-status-title">{t("dashboard.orderStatus.title")}</h2>
        <p>{t("dashboard.orderStatus.subtitle")}</p>
      </div>
      <SectionState<OrderStatusCounts>
        status={result.status}
        data={result.data}
        error={result.error}
        retry={result.retry}
        isEmpty={() => total === 0}
        renderEmpty={() => (
          <p className="dashboard-empty-inline">{t("dashboard.recentOrders.empty.title")}</p>
        )}
        renderSuccess={(counts) => (
          <ul className="order-status-list">
            {DISPLAY_ORDER.map((status) => {
              const count = counts[status];
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <li key={status} className="order-status-list__row">
                  <OrderStatusBadge status={status} label={t(`dashboard.orderStatus.${status}`)} />
                  <div
                    className="order-status-list__bar-track"
                    role="img"
                    aria-label={`${t(`dashboard.orderStatus.${status}`)}: ${count}`}
                  >
                    <div
                      className={`order-status-list__bar-fill order-status-list__bar-fill--${status.toLowerCase()}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="order-status-list__count money">{count}</span>
                </li>
              );
            })}
          </ul>
        )}
      />
    </section>
  );
}
