import { useLocale } from "../../../i18n/LocaleContext";
import { formatMoney } from "../../../money/formatMoney";
import { useMenuTranslation } from "../hooks/useMenuTranslation";
import { ActiveBadge } from "./ActiveBadge";
import type { Modifier } from "../../../../contracts/entities";

export function ModifierList({ modifiers, onEdit }: { modifiers: Modifier[]; onEdit: (m: Modifier) => void }) {
  const { locale } = useLocale();
  const t = useMenuTranslation();

  return (
    <div className="menu-table-scroll">
      <table className="menu-table">
        <thead>
          <tr>
            <th>{t("menu.modifiers.column.name")}</th>
            <th>{t("menu.modifiers.column.priceDelta")}</th>
            <th>{t("menu.modifiers.column.status")}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {modifiers.map((modifier) => (
            <tr key={modifier.id}>
              <td>{locale === "ar" ? modifier.name.ar : (modifier.name.en ?? modifier.name.ar)}</td>
              <td className="money">
                {Number(modifier.price_delta) > 0 ? "+" : ""}
                {formatMoney(modifier.price_delta, locale)}
              </td>
              <td>
                <ActiveBadge isActive={modifier.is_active} />
              </td>
              <td>
                <button type="button" className="btn btn--secondary" onClick={() => onEdit(modifier)}>
                  {t("menu.form.edit")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
