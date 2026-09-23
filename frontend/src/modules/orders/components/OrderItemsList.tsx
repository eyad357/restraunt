import { useLocale } from "../../../i18n/LocaleContext";
import { formatMoney } from "../../../money/formatMoney";
import { useOrdersTranslation } from "../hooks/useOrdersTranslation";
import type { OrderItem } from "../../../../contracts/entities";

export function OrderItemsList({ items }: { items: OrderItem[] }) {
  const { locale } = useLocale();
  const t = useOrdersTranslation();

  return (
    <ul className="order-items-list">
      {items.map((item) => (
        <li key={item.id} className="order-items-list__row">
          <div className="order-items-list__main">
            <span className="order-items-list__qty">{item.quantity}×</span>
            <div className="order-items-list__info">
              {/* Product/variant names aren't embedded on OrderItem itself
                  (only IDs — see frontend/contracts/entities.ts). Modifier
                  names ARE available via name_snapshot, which the contract
                  preserves specifically so historical order items stay
                  readable even if the menu changes later. No menu-catalog
                  lookup is attempted here for product/variant display names
                  — see INTEGRATION_REQUEST.md's menu-catalog gap. */}
              <span className="order-items-list__product-id money">
                {t("orders.details.items")} #{item.product_id.slice(-6).toUpperCase()}
                {item.variant_id ? ` · ${item.variant_id.slice(-6).toUpperCase()}` : ""}
              </span>
              {item.modifiers.length > 0 ? (
                <ul className="order-items-list__modifiers">
                  {item.modifiers.map((mod) => (
                    <li key={mod.id}>
                      {mod.name_snapshot}
                      {Number(mod.price_delta_snapshot) !== 0 ? (
                        <span className="money"> (+{formatMoney(mod.price_delta_snapshot, locale)})</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
              {item.notes ? (
                <p className="order-items-list__note">
                  {t("orders.details.itemNotes")}: {item.notes}
                </p>
              ) : null}
            </div>
          </div>
          <span className="order-items-list__total money">{formatMoney(item.line_total, locale)}</span>
        </li>
      ))}
    </ul>
  );
}
