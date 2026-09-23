import { useState } from "react";
import { useOrdersTranslation } from "../hooks/useOrdersTranslation";
import { useCancelOrder } from "../hooks/useOrderMutations";
import { ApiError } from "../../../api/ApiError";
import type { Order } from "../../../../contracts/entities";

/**
 * Cancellation is only reachable from DRAFT, PLACED, or PREPARING per
 * order-lifecycle-contract.md — "not from READY or COMPLETED (a
 * ready/handed order is not voided via a status flip)". No cancellation
 * reason field is documented anywhere, so none is collected here (per
 * this phase's own "if not required, do not invent it" rule) — no
 * manager-approval workflow is required either.
 */
function canCancel(order: Order): boolean {
  return order.status === "DRAFT" || order.status === "PLACED" || order.status === "PREPARING";
}

interface CancelOrderControlProps {
  order: Order;
  onOrderUpdated: (order: Order) => void;
}

export function CancelOrderControl({ order, onOrderUpdated }: CancelOrderControlProps) {
  const t = useOrdersTranslation();
  const cancelOrder = useCancelOrder();
  const [confirming, setConfirming] = useState(false);

  if (!canCancel(order)) return null;

  async function handleConfirm() {
    const updated = await cancelOrder.run(order.id);
    if (updated) {
      onOrderUpdated(updated);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="cancel-confirm" role="alertdialog" aria-labelledby="cancel-confirm-title">
        <p id="cancel-confirm-title" className="cancel-confirm__title">
          {t("orders.actions.cancelConfirmTitle")}
        </p>
        <p className="cancel-confirm__body">{t("orders.actions.cancelConfirmBody")}</p>
        <div className="cancel-confirm__actions">
          <button type="button" className="btn btn--danger" disabled={cancelOrder.isLoading} onClick={handleConfirm}>
            {cancelOrder.isLoading ? t("orders.actions.cancelling") : t("orders.actions.cancelConfirm")}
          </button>
          <button type="button" className="btn btn--secondary" onClick={() => setConfirming(false)}>
            {t("orders.actions.cancelDismiss")}
          </button>
        </div>
        {cancelOrder.status === "error" ? (
          <p className="orders-panel__error" role="alert">
            {cancelOrder.error instanceof ApiError ? cancelOrder.error.message : t("orders.state.error.title")}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <button type="button" className="btn btn--danger" onClick={() => setConfirming(true)}>
      {t("orders.actions.cancel")}
    </button>
  );
}
