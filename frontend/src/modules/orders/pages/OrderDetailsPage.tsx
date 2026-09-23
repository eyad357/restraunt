import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLocale } from "../../../i18n/LocaleContext";
import { formatMoney } from "../../../money/formatMoney";
import { useOrdersTranslation } from "../hooks/useOrdersTranslation";
import { useOrder } from "../hooks/useOrder";
import { SectionState } from "../components/SectionState";
import { OrderStatusBadge } from "../components/StatusBadges";
import { OrderItemsList } from "../components/OrderItemsList";
import { PaymentPanel } from "../components/PaymentPanel";
import { DeliveryPanel } from "../components/DeliveryPanel";
import { CancelOrderControl } from "../components/CancelOrderControl";
import type { Order } from "../../../../contracts/entities";
import "./orders.css";

function shortOrderId(id: string): string {
  return `#${id.slice(-6).toUpperCase()}`;
}

export function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { locale } = useLocale();
  const t = useOrdersTranslation();
  const result = useOrder(orderId ?? "");
  // Local override so a payment/delivery/cancel mutation updates the view
  // immediately without a second round-trip — initialized from the fetch,
  // replaced whenever a mutation hook hands back the server's fresh copy.
  const [order, setOrder] = useState<Order | null>(null);
  const displayOrder = order ?? result.data;

  const dateFormatter = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="orders-page">
      <Link to="/orders" className="orders-details__back">
        {t("orders.details.back")}
      </Link>

      <SectionState<Order>
        status={result.status}
        data={displayOrder}
        error={result.error}
        retry={result.retry}
        isEmpty={() => false}
        renderEmpty={() => <p className="orders-empty-inline">{t("orders.details.notFound")}</p>}
        renderSuccess={(current) => (
          <>
            <header className="orders-details__header">
              <div>
                <h1>{t("orders.details.title", { orderId: shortOrderId(current.id) })}</h1>
                <div className="orders-details__meta">
                  <OrderStatusBadge status={current.status} label={t(`orders.status.${current.status}`)} />
                  <span>{t(`orders.type.${current.type}`)}</span>
                  <span>{t(`orders.source.${current.source}`)}</span>
                </div>
              </div>
              <CancelOrderControl order={current} onOrderUpdated={setOrder} />
            </header>

            <dl className="orders-details-list">
              <div>
                <dt>{t("orders.details.createdAt")}</dt>
                <dd>{dateFormatter.format(new Date(current.created_at))}</dd>
              </div>
              {current.completed_at ? (
                <div>
                  <dt>{t("orders.details.completedAt")}</dt>
                  <dd>{dateFormatter.format(new Date(current.completed_at))}</dd>
                </div>
              ) : null}
              {current.cancelled_at ? (
                <div>
                  <dt>{t("orders.details.cancelledAt")}</dt>
                  <dd>{dateFormatter.format(new Date(current.cancelled_at))}</dd>
                </div>
              ) : null}
              {current.scheduled_for ? (
                <div>
                  <dt>{t("orders.details.scheduledFor")}</dt>
                  <dd>{dateFormatter.format(new Date(current.scheduled_for))}</dd>
                </div>
              ) : null}
            </dl>

            <section className="orders-panel">
              <h2>{t("orders.details.notes")}</h2>
              <p>{current.notes ?? t("orders.details.noNotes")}</p>
            </section>

            <section className="orders-panel">
              <h2>{t("orders.details.items")}</h2>
              <OrderItemsList items={current.items} />
              <div className="orders-details__totals">
                <span>
                  {t("orders.details.subtotal")}: <span className="money">{formatMoney(current.subtotal, locale)}</span>
                </span>
                <span className="orders-details__grand-total">
                  {t("orders.details.total")}: <span className="money">{formatMoney(current.total, locale)}</span>
                </span>
              </div>
            </section>

            <PaymentPanel order={current} onOrderUpdated={setOrder} />

            {current.delivery ? <DeliveryPanel order={current} onOrderUpdated={setOrder} /> : null}
          </>
        )}
      />
    </div>
  );
}
