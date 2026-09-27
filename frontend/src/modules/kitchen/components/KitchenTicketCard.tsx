import { useLocale } from "../../../i18n/LocaleContext";
import { useKitchenTranslation } from "../hooks/useKitchenTranslation";
import { useOrderForTicket } from "../hooks/useOrderForTicket";
import { useStartTicket, useReadyTicket, useCompleteTicket } from "../hooks/useTicketActions";
import { ApiError } from "../../../api/ApiError";
import type { KitchenTicket } from "../../../../contracts/entities";

function shortId(id: string): string {
  return `#${id.slice(-6).toUpperCase()}`;
}

interface KitchenTicketCardProps {
  ticket: KitchenTicket;
  onChanged: () => void;
}

/**
 * Each card fetches its own order (see hooks/useOrderForTicket.ts) so a
 * slow/failing lookup for one ticket never blocks the rest of the board.
 * `onChanged` tells the parent to re-fetch the board after a successful
 * action, since a status change moves the ticket to a different column —
 * simpler and more honest than trying to move it client-side without a
 * confirmed server response shape for the full board.
 */
export function KitchenTicketCard({ ticket, onChanged }: KitchenTicketCardProps) {
  const { locale } = useLocale();
  const t = useKitchenTranslation();
  const order = useOrderForTicket(ticket.order_id);
  const startTicket = useStartTicket();
  const readyTicket = useReadyTicket();
  const completeTicket = useCompleteTicket();

  const timeFormatter = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  async function handleStart() {
    const result = await startTicket.run(ticket.id);
    if (result) onChanged();
  }
  async function handleReady() {
    const result = await readyTicket.run(ticket.id);
    if (result) onChanged();
  }
  async function handleComplete() {
    const result = await completeTicket.run(ticket.id);
    if (result) onChanged();
  }

  const isDeliveryNotYetDelivered =
    order.data?.type === "DELIVERY" && order.data.delivery?.status !== "DELIVERED";

  const actionError = [startTicket.error, readyTicket.error, completeTicket.error].find(
    (e): e is NonNullable<typeof e> => e !== null,
  );

  return (
    <article className="kitchen-card">
      <header className="kitchen-card__header">
        <span className="kitchen-card__id money">
          {t("kitchen.ticket.orderLabel")} {shortId(ticket.order_id)}
        </span>
        <span className="kitchen-card__time">{timeFormatter.format(new Date(ticket.received_at))}</span>
      </header>

      {order.status === "loading" ? (
        <p className="kitchen-empty-inline">{t("kitchen.ticket.orderLoading")}</p>
      ) : order.status === "error" ? (
        <div className="kitchen-card__order-error">
          <p className="kitchen-empty-inline">
            {order.error instanceof ApiError ? order.error.message : t("kitchen.ticket.orderUnavailable")}
          </p>
          <button type="button" className="btn btn--secondary" onClick={order.retry}>
            {t("kitchen.ticket.retry")}
          </button>
        </div>
      ) : order.data ? (
        <>
          <div className="kitchen-card__meta">
            <span>{t(`kitchen.type.${order.data.type}`)}</span>
            <span>{t(`kitchen.source.${order.data.source}`)}</span>
          </div>

          <ul className="kitchen-card__items">
            {order.data.items.map((item) => (
              <li key={item.id} className="kitchen-card__item">
                <span className="kitchen-card__item-qty">{item.quantity}×</span>
                <div className="kitchen-card__item-body">
                  <span className="kitchen-card__item-product money">#{item.product_id.slice(-6).toUpperCase()}</span>
                  {item.modifiers.length > 0 ? (
                    <ul className="kitchen-card__modifiers">
                      {item.modifiers.map((mod) => (
                        <li key={mod.id}>{mod.name_snapshot}</li>
                      ))}
                    </ul>
                  ) : null}
                  {item.notes ? (
                    <p className="kitchen-card__item-note">
                      {t("kitchen.ticket.itemNote")}: {item.notes}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>

          {order.data.notes ? (
            <p className="kitchen-card__order-note">
              {t("kitchen.ticket.notes")}: {order.data.notes}
            </p>
          ) : null}
        </>
      ) : null}

      <footer className="kitchen-card__actions">
        {ticket.status === "RECEIVED" ? (
          <button type="button" className="btn btn--primary" disabled={startTicket.isLoading} onClick={handleStart}>
            {startTicket.isLoading ? t("kitchen.action.starting") : t("kitchen.action.start")}
          </button>
        ) : null}

        {ticket.status === "PREPARING" ? (
          <button type="button" className="btn btn--primary" disabled={readyTicket.isLoading} onClick={handleReady}>
            {readyTicket.isLoading ? t("kitchen.action.markingReady") : t("kitchen.action.ready")}
          </button>
        ) : null}

        {ticket.status === "READY" ? (
          <>
            <button
              type="button"
              className="btn btn--primary"
              disabled={completeTicket.isLoading || isDeliveryNotYetDelivered}
              onClick={handleComplete}
            >
              {completeTicket.isLoading ? t("kitchen.action.completing") : t("kitchen.action.complete")}
            </button>
            {isDeliveryNotYetDelivered ? (
              <p className="kitchen-empty-inline">{t("kitchen.action.deliveryGate")}</p>
            ) : null}
          </>
        ) : null}

        {actionError ? (
          <p className="kitchen-card__error" role="alert">
            {actionError instanceof ApiError ? actionError.message : t("kitchen.action.error")}
          </p>
        ) : null}
      </footer>
    </article>
  );
}
