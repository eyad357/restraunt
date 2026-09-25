import { useLocale } from "../../../i18n/LocaleContext";
import { formatMoney } from "../../../money/formatMoney";
import { useMenuTranslation } from "../hooks/useMenuTranslation";
import { DefaultBadge } from "./ActiveBadge";
import type { Variant } from "../../../../contracts/entities";

export function VariantList({ variants, onEdit }: { variants: Variant[]; onEdit: (v: Variant) => void }) {
  const { locale } = useLocale();
  const t = useMenuTranslation();

  return (
    <div className="menu-table-scroll">
      <table className="menu-table">
        <thead>
          <tr>
            <th>{t("menu.variants.column.name")}</th>
            <th>{t("menu.variants.column.price")}</th>
            <th>{t("menu.variants.column.default")}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {variants.map((variant) => (
            <tr key={variant.id}>
              <td>{locale === "ar" ? variant.name.ar : (variant.name.en ?? variant.name.ar)}</td>
              <td className="money">{formatMoney(variant.price, locale)}</td>
              <td>{variant.is_default ? <DefaultBadge /> : "—"}</td>
              <td>
                <button type="button" className="btn btn--secondary" onClick={() => onEdit(variant)}>
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
