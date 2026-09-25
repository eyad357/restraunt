import { useLocale } from "../../../i18n/LocaleContext";
import { useMenuTranslation } from "../hooks/useMenuTranslation";
import { ActiveBadge } from "./ActiveBadge";
import type { Category } from "../../../../contracts/entities";

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
}

export function CategoryList({ categories, onEdit }: CategoryListProps) {
  const { locale } = useLocale();
  const t = useMenuTranslation();
  const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="menu-table-scroll">
      <table className="menu-table">
        <thead>
          <tr>
            <th>{t("menu.categories.column.name")}</th>
            <th>{t("menu.categories.column.sortOrder")}</th>
            <th>{t("menu.categories.column.status")}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {sorted.map((category) => (
            <tr key={category.id}>
              <td>{locale === "ar" ? category.name.ar : (category.name.en ?? category.name.ar)}</td>
              <td className="money">{category.sort_order}</td>
              <td>
                <ActiveBadge isActive={category.is_active} />
              </td>
              <td>
                <button type="button" className="btn btn--secondary" onClick={() => onEdit(category)}>
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
