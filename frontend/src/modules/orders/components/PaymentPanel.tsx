import { useState, type FormEvent } from "react";
import { useLocale } from "../../../i18n/LocaleContext";
import { formatMoney } from "../../../money/formatMoney";
import { useOrdersTranslation } from "../hooks/useOrdersTranslation";
import { useRecordPayment, useVoidPayment } from "../hooks/useOrderMutations";
import { PaymentStatusBadge } from "./StatusBadges";
import { ApiError } from "../../../api/ApiError";
import type { Order, PaymentComponent } from "../../../../contracts/entities";
import type { PaymentMethod } from "../../../../contracts/enums";

const METHODS: Exclude<PaymentMethod, "MIXED">[] = ["CASH", "CARD", "WALLET", "INSTAPAY"];

/**
 * Voiding a payment is only permitted while the order is DRAFT, PLACED,
 * PREPARING, or CANCELLED — per payment-contract.md's explicit gate
 * ("Attempting to void a payment on an order that is READY or COMPLETED
 * returns 409 INVALID_TRANSITION"). The void button is hidden rather than
 * shown-then-failing for READY/COMPLETED orders.
 */
function canVoidPayments(order: Order): boolean {
  return (
    order.status === "DRAFT" ||
    order.status === "PLACED" ||
    order.status === "PREPARING" ||
    order.status === "CANCELLED"
  );
}

interface PaymentPanelProps {
  order: Order;
  onOrderUpdated: (order: Order) => void;
}

/**
 * NOTE on a real contract gap (see INTEGRATION_REQUEST.md): payment-
 * contract.md's derivation formula is
 * `paid_total = sum(component.amount for component in order.payments
 * where not voided)`, but the canonical `PaymentComponent` entity
 * (frontend/contracts/entities.ts) has no `voided`/`is_voided` field —
 * there is no way for the frontend to tell which components are voided.
 * Rather than guess, this panel never re-derives `paid_total` or a
 * "remaining balance" itself: it only displays `order.payment_status`
 * and `order.total`, both already server-derived and authoritative, and
 * gates the payment form on `payment_status !== "PAID"` instead of a
 * self-computed remaining amount.
 */
export function PaymentPanel({ order, onOrderUpdated }: PaymentPanelProps) {
  const { locale } = useLocale();
  const t = useOrdersTranslation();
  const recordPayment = useRecordPayment();
  const voidPayment = useVoidPayment();
  const [method, setMethod] = useState<Exclude<PaymentMethod, "MIXED">>("CASH");
  const [amount, setAmount] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const updated = await recordPayment.run(order.id, { method, amount });
    if (updated) {
      onOrderUpdated(updated);
      setAmount("");
    }
  }

  async function handleVoid(paymentId: string) {
    const updated = await voidPayment.run(order.id, paymentId);
    if (updated) onOrderUpdated(updated);
  }

  const showForm = order.status !== "COMPLETED" && order.status !== "CANCELLED" && order.payment_status !== "PAID";

  const paymentError = recordPayment.status === "error" ? recordPayment.error : null;
  const paymentErrorMessage =
    paymentError instanceof ApiError
      ? paymentError.code === "OVERPAYMENT"
        ? t("orders.errors.overpayment")
        : paymentError.message
      : paymentError
        ? t("orders.state.error.title")
        : null;

  return (
    <section className="orders-panel">
      <div className="orders-panel__heading">
        <h2>{t("orders.payment.title")}</h2>
        <PaymentStatusBadge status={order.payment_status} label={t(`orders.paymentStatus.${order.payment_status}`)} />
      </div>

      {order.payments.length === 0 ? (
        <p className="orders-empty-inline">{t("orders.payment.empty")}</p>
      ) : (
        <ul className="payment-list">
          {order.payments.map((payment: PaymentComponent) => (
            <li key={payment.id} className="payment-list__row">
              <span>{t(`orders.paymentMethod.${payment.method}`)}</span>
              <span className="money">{formatMoney(payment.amount, locale)}</span>
              {canVoidPayments(order) ? (
                <button
                  type="button"
                  className="btn btn--secondary payment-list__void"
                  disabled={voidPayment.isLoading}
                  onClick={() => handleVoid(payment.id)}
                >
                  {t("orders.payment.void")}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <p className="orders-panel__summary money">
        {t("orders.details.total")}: {formatMoney(order.total, locale)}
      </p>

      {showForm ? (
        <form className="payment-form" onSubmit={handleSubmit}>
          <select value={method} onChange={(e) => setMethod(e.target.value as Exclude<PaymentMethod, "MIXED">)}>
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {t(`orders.paymentMethod.${m}`)}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={t("orders.payment.amount")}
            className="money"
          />
          <button type="submit" className="btn btn--primary" disabled={recordPayment.isLoading}>
            {t("orders.payment.submit")}
          </button>
        </form>
      ) : null}

      {paymentErrorMessage ? (
        <p className="orders-panel__error" role="alert">
          {paymentErrorMessage}
        </p>
      ) : null}
    </section>
  );
}
