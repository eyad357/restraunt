import { useLocale } from "../../../i18n/LocaleContext";
import { formatMoney } from "../../../money/formatMoney";
import { useOrdersTranslation } from "../hooks/useOrdersTranslation";
import type { CartLine } from "../types/order";

interface CartPanelProps {
  lines: CartLine[];
  lineTotal: (line: CartLine) => string;
  estimatedTotal: string;
  onRemove: (lineId: string) => void;
  onQuantityChange: (lineId: string, quantity: number) => void;
}

export function CartPanel({ lines, lineTotal, estimatedTotal, onRemove, onQuantityChange }: CartPanelProps) {
  const { locale } = useLocale();
  const t = useOrdersTranslation();

  return (
    <section className="cart-panel">
      <h3>{t("orders.new.cart")}</h3>
      {lines.length === 0 ? (
        <p className="orders-empty-inline">{t("orders.new.cartEmpty")}</p>
      ) : (
        <ul className="cart-panel__list">
          {lines.map((line) => (
            <li key={line.lineId} className="cart-panel__row">
              <div className="cart-panel__info">
                <span>{locale === "ar" ? line.product.name.ar : (line.product.name.en ?? line.product.name.ar)}</span>
                {line.variant ? (
                  <span className="cart-panel__variant">
                    {locale === "ar" ? line.variant.name.ar : (line.variant.name.en ?? line.variant.name.ar)}
                  </span>
                ) : null}
                {line.modifiers.length > 0 ? (
                  <span className="cart-panel__modifiers">
                    {line.modifiers.map((m) => (locale === "ar" ? m.name.ar : (m.name.en ?? m.name.ar))).join(", ")}
                  </span>
                ) : null}
                {line.notes ? <span className="cart-panel__note">{line.notes}</span> : null}
              </div>
              <input
                type="number"
                min={1}
                value={line.quantity}
                onChange={(e) => onQuantityChange(line.lineId, Number(e.target.value) || 1)}
                className="cart-panel__qty"
              />
              <span className="money cart-panel__line-total">{formatMoney(lineTotal(line), locale)}</span>
              <button type="button" className="btn btn--secondary" onClick={() => onRemove(line.lineId)}>
                {t("orders.new.removeItem")}
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="cart-panel__total money">
        {t("orders.new.estimatedTotal")}: {formatMoney(estimatedTotal, locale)}
      </p>
      <p className="orders-empty-inline">{t("orders.new.estimatedNote")}</p>
    </section>
  );
}
