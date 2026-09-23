import { useState } from "react";
import { useLocale } from "../../../i18n/LocaleContext";
import { formatMoney } from "../../../money/formatMoney";
import { useOrdersTranslation } from "../hooks/useOrdersTranslation";
import { useUpdateDelivery } from "../hooks/useOrderMutations";
import { DeliveryStatusBadge } from "./StatusBadges";
import { ApiError } from "../../../api/ApiError";
import type { Order } from "../../../../contracts/entities";

interface DeliveryPanelProps {
  order: Order;
  onOrderUpdated: (order: Order) => void;
}

/**
 * `PATCH /orders/{id}/delivery` per delivery-contract.md. Only exposes
 * what that contract actually defines: driver name (free text, not an
 * account) and a status transition. There is deliberately no address
 * field — none exists in `DeliveryInfo` (frontend/contracts/entities.ts)
 * — see INTEGRATION_REQUEST.md.
 */
export function DeliveryPanel({ order, onOrderUpdated }: DeliveryPanelProps) {
  const { locale } = useLocale();
  const t = useOrdersTranslation();
  const updateDelivery = useUpdateDelivery();
  const [driverName, setDriverName] = useState("");

  if (!order.delivery) return null;
  const delivery = order.delivery;

  async function assignDriver() {
    if (driverName.trim() === "") return;
    const updated = await updateDelivery.run(order.id, {
      driver_name: driverName.trim(),
      status: "ASSIGNED",
    });
    if (updated) {
      onOrderUpdated(updated);
      setDriverName("");
    }
  }

  async function transitionTo(status: "OUT" | "DELIVERED" | "RETURNED") {
    const updated = await updateDelivery.run(order.id, { status });
    if (updated) onOrderUpdated(updated);
  }

  const error = updateDelivery.status === "error" ? updateDelivery.error : null;

  return (
    <section className="orders-panel">
      <div className="orders-panel__heading">
        <h2>{t("orders.delivery.title")}</h2>
        <DeliveryStatusBadge status={delivery.status} label={t(`orders.deliveryStatus.${delivery.status}`)} />
      </div>

      <dl className="orders-details-list">
        <div>
          <dt>{t("orders.delivery.driver")}</dt>
          <dd>{delivery.driver_name || "—"}</dd>
        </div>
        <div>
          <dt>{t("orders.delivery.amountExpected")}</dt>
          <dd className="money">{formatMoney(delivery.amount_expected_from_driver, locale)}</dd>
        </div>
        {delivery.delivered_at ? (
          <div>
            <dt>{t("orders.delivery.deliveredAt")}</dt>
            <dd>{new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(delivery.delivered_at))}</dd>
          </div>
        ) : null}
      </dl>

      <p className="orders-empty-inline">{t("orders.delivery.noAddressNote")}</p>

      {delivery.status === "UNASSIGNED" ? (
        <div className="delivery-actions">
          <input
            type="text"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            placeholder={t("orders.delivery.driverNamePlaceholder")}
          />
          <button
            type="button"
            className="btn btn--primary"
            disabled={updateDelivery.isLoading || driverName.trim() === ""}
            onClick={assignDriver}
          >
            {t("orders.delivery.assignDriver")}
          </button>
        </div>
      ) : null}

      {delivery.status === "ASSIGNED" ? (
        <div className="delivery-actions">
          <button type="button" className="btn btn--primary" disabled={updateDelivery.isLoading} onClick={() => transitionTo("OUT")}>
            {t("orders.delivery.markOut")}
          </button>
        </div>
      ) : null}

      {delivery.status === "OUT" ? (
        <div className="delivery-actions">
          <button type="button" className="btn btn--primary" disabled={updateDelivery.isLoading} onClick={() => transitionTo("DELIVERED")}>
            {t("orders.delivery.markDelivered")}
          </button>
          <button type="button" className="btn btn--secondary" disabled={updateDelivery.isLoading} onClick={() => transitionTo("RETURNED")}>
            {t("orders.delivery.markReturned")}
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="orders-panel__error" role="alert">
          {error instanceof ApiError ? error.message : t("orders.state.error.title")}
        </p>
      ) : null}
    </section>
  );
}
