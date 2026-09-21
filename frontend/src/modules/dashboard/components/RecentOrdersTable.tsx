import { useLocale } from "../../../i18n/LocaleContext";
import { formatMoney } from "../../../money/formatMoney";
import { useDashboardTranslation } from "../hooks/useDashboardTranslation";
import { useRecentOrders } from "../hooks/useRecentOrders";
import { SectionState } from "./SectionState";
import { OrderStatusBadge, PaymentStatusBadge } from "./StatusBadge";
import type { Order } from "../../../../contracts/entities";

/**
 * No human-friendly order number exists in the contracts (domain-entities.md
 * only has `id: UUID` — see INTEGRATION_REQUEST.md's note on this being a
 * possible future product decision, not something to invent here). This
 * shows a short, clearly-labeled fragment of the UUID rather than
 * pretending it's a sequential order number.
 */
function shortOrderId(id: string): string {
  return `#${id.slice(-6).toUpperCase()}`;
}

export function RecentOrdersTable() {
  const { locale } = useLocale();
  const t = useDashboardTranslation();
  const result = useRecentOrders(8);

  const timeFormatter = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="dashboard-section" aria-labelledby="recent-orders-title">
      <div className="dashboard-section__heading">
        <h2 id="recent-orders-title">{t("dashboard.recentOrders.title")}</h2>
        <p>{t("dashboard.recentOrders.subtitle")}</p>
      </div>
      <SectionState<Order[]>
        status={result.status}
        data={result.data}
        error={result.error}
        retry={result.retry}
        isEmpty={(orders) => orders.length === 0}
        renderEmpty={() => (
          <div className="dashboard-empty">
            <p className="dashboard-empty__title">{t("dashboard.recentOrders.empty.title")}</p>
            <p className="dashboard-empty__body">{t("dashboard.recentOrders.empty.body")}</p>
          </div>
        )}
        renderSuccess={(orders) => (
          <div className="dashboard-table-scroll">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>{t("dashboard.recentOrders.column.id")}</th>
                  <th>{t("dashboard.recentOrders.column.time")}</th>
                  <th>{t("dashboard.recentOrders.column.type")}</th>
                  <th>{t("dashboard.recentOrders.column.source")}</th>
                  <th>{t("dashboard.recentOrders.column.status")}</th>
                  <th>{t("dashboard.recentOrders.column.paymentStatus")}</th>
                  <th>{t("dashboard.recentOrders.column.total")}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="money">{shortOrderId(order.id)}</td>
                    <td>{timeFormatter.format(new Date(order.created_at))}</td>
                    <td>{t(`dashboard.type.${order.type}`)}</td>
                    <td>{t(`dashboard.source.${order.source}`)}</td>
                    <td>
                      <OrderStatusBadge status={order.status} label={t(`dashboard.orderStatus.${order.status}`)} />
                    </td>
                    <td>
                      <PaymentStatusBadge
                        status={order.payment_status}
                        label={t(`dashboard.paymentStatus.${order.payment_status}`)}
                      />
                    </td>
                    <td className="money">{formatMoney(order.total, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      />
    </section>
  );
}
