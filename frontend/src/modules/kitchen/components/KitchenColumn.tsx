import { useKitchenTranslation } from "../hooks/useKitchenTranslation";
import { KitchenTicketCard } from "./KitchenTicketCard";
import type { KitchenTicket } from "../../../../contracts/entities";
import type { KITCHEN_BOARD_STATUSES } from "../types/kitchen";

interface KitchenColumnProps {
  status: (typeof KITCHEN_BOARD_STATUSES)[number];
  tickets: KitchenTicket[];
  onChanged: () => void;
}

export function KitchenColumn({ status, tickets, onChanged }: KitchenColumnProps) {
  const t = useKitchenTranslation();

  return (
    <section className="kitchen-column" aria-labelledby={`kitchen-column-${status}`}>
      <h2 id={`kitchen-column-${status}`} className="kitchen-column__title">
        {t(`kitchen.column.${status}`)}
        <span className="kitchen-column__count">{tickets.length}</span>
      </h2>
      {tickets.length === 0 ? (
        <div className="kitchen-empty">
          <p className="kitchen-empty__title">{t("kitchen.state.empty.title")}</p>
          <p className="kitchen-empty__body">{t("kitchen.state.empty.body")}</p>
        </div>
      ) : (
        <div className="kitchen-column__list">
          {tickets.map((ticket) => (
            <KitchenTicketCard key={ticket.id} ticket={ticket} onChanged={onChanged} />
          ))}
        </div>
      )}
    </section>
  );
}
