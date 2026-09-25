import { Link } from "react-router-dom";
import { useLocale } from "../../../i18n/LocaleContext";
import { formatMoney } from "../../../money/formatMoney";
import { useMenuTranslation } from "../hooks/useMenuTranslation";
import { ActiveBadge } from "./ActiveBadge";
import type { Category, Product } from "../../../../contracts/entities";

interface ProductListProps {
  products: Product[];
  categoriesById: Map<string, Category>;
  onEdit: (product: Product) => void;
}

export function ProductList({ products, categoriesById, onEdit }: ProductListProps) {
  const { locale } = useLocale();
  const t = useMenuTranslation();

  return (
    <div className="menu-table-scroll">
      <table className="menu-table">
        <thead>
          <tr>
            <th>{t("menu.products.column.name")}</th>
            <th>{t("menu.products.column.category")}</th>
            <th>{t("menu.products.column.basePrice")}</th>
            <th>{t("menu.products.column.status")}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const category = categoriesById.get(product.category_id);
            return (
              <tr key={product.id}>
                <td>{locale === "ar" ? product.name.ar : (product.name.en ?? product.name.ar)}</td>
                <td>{category ? (locale === "ar" ? category.name.ar : (category.name.en ?? category.name.ar)) : "—"}</td>
                <td className="money">{formatMoney(product.base_price, locale)}</td>
                <td>
                  <ActiveBadge isActive={product.is_active} />
                </td>
                <td className="menu-table__actions">
                  <button type="button" className="btn btn--secondary" onClick={() => onEdit(product)}>
                    {t("menu.form.edit")}
                  </button>
                  <Link to={`/menu/products/${product.id}`} className="btn btn--secondary">
                    {t("menu.products.viewDetails")}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
