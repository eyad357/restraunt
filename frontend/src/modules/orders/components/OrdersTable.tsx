import { Link } from "react-router-dom";
import { useLocale } from "../../../i18n/LocaleContext";
import { formatMoney } from "../../../money/formatMoney";
import { useOrdersTranslation } from "../hooks/useOrdersTranslation";
import { OrderStatusBadge, PaymentStatusBadge } from "./StatusBadges";
import type { Order } from "../../../../contracts/entities";
import type { OrderListResult } from "../services/ordersApi";

function shortOrderId(id: string): string {
  return `#${id.slice(-6).toUpperCase()}`;
}

interface OrdersTableProps {
  result: OrderListResult;
  page: number;
  onPageChange: (page: number) => void;
}

export function OrdersTable({ result, page, onPageChange }: OrdersTableProps) {
  const { locale } = useLocale();
  const t = useOrdersTranslation();
  const timeFormatter = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div>
      <div className="orders-table-scroll">
        <table className="orders-table">
          <thead>
            <tr>
              <th>{t("orders.table.column.id")}</th>
              <th>{t("orders.table.column.time")}</th>
              <th>{t("orders.table.column.type")}</th>
              <th>{t("orders.table.column.source")}</th>
              <th>{t("orders.table.column.status")}</th>
              <th>{t("orders.table.column.paymentStatus")}</th>
              <th>{t("orders.table.column.total")}</th>
              <th>{t("orders.table.column.delivery")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {result.data.map((order: Order) => (
              <tr key={order.id}>
                <td className="money">{shortOrderId(order.id)}</td>
                <td>{timeFormatter.format(new Date(order.created_at))}</td>
                <td>{t(`orders.type.${order.type}`)}</td>
                <td>{t(`orders.source.${order.source}`)}</td>
                <td>
                  <OrderStatusBadge status={order.status} label={t(`orders.status.${order.status}`)} />
                </td>
                <td>
                  <PaymentStatusBadge
                    status={order.payment_status}
                    label={t(`orders.paymentStatus.${order.payment_status}`)}
                  />
                </td>
                <td className="money">{formatMoney(order.total, locale)}</td>
                <td>
                  {order.delivery
                    ? t(`orders.deliveryStatus.${order.delivery.status}`)
                    : "—"}
                </td>
                <td>
                  <Link to={`/orders/${order.id}`} className="btn btn--secondary orders-table__view">
                    {t("orders.table.viewDetails")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="orders-pagination">
        <span className="orders-pagination__count">
          {t("orders.pagination.totalCount", { count: result.meta.total_count })}
        </span>
        <div className="orders-pagination__controls">
          <button
            type="button"
            className="btn btn--secondary"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            {t("orders.pagination.previous")}
          </button>
          <span>{t("orders.pagination.page", { page, totalPages: result.meta.total_pages })}</span>
          <button
            type="button"
            className="btn btn--secondary"
            disabled={page >= result.meta.total_pages}
            onClick={() => onPageChange(page + 1)}
          >
            {t("orders.pagination.next")}
          </button>
        </div>
      </div>
    </div>
  );
}
