import { useLocale } from "../../../i18n/LocaleContext";
import { formatMoney } from "../../../money/formatMoney";
import { useOrdersTranslation } from "../hooks/useOrdersTranslation";
import { useCategories, useProducts } from "../hooks/useMenuCatalog";
import { SectionState } from "./SectionState";
import type { Category, Product } from "../../../../contracts/entities";

interface CategoryProductPickerProps {
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
  onSelectProduct: (product: Product) => void;
}

export function CategoryProductPicker({
  selectedCategoryId,
  onSelectCategory,
  onSelectProduct,
}: CategoryProductPickerProps) {
  const { locale } = useLocale();
  const t = useOrdersTranslation();
  const categories = useCategories();
  const products = useProducts(selectedCategoryId);

  return (
    <div className="menu-picker">
      <div className="menu-picker__categories">
        <h3>{t("orders.new.categories")}</h3>
        <SectionState<Category[]>
          status={categories.status}
          data={categories.data}
          error={categories.error}
          retry={categories.retry}
          isEmpty={(list) => list.length === 0}
          renderEmpty={() => (
            <div className="orders-empty">
              <p className="orders-empty__title">{t("orders.new.catalogUnavailable.title")}</p>
              <p className="orders-empty__body">{t("orders.new.catalogUnavailable.body")}</p>
            </div>
          )}
          renderSuccess={(list) => (
            <ul className="menu-picker__category-list">
              {list.map((category) => (
                <li key={category.id}>
                  <button
                    type="button"
                    className={`menu-picker__category-btn${
                      category.id === selectedCategoryId ? " menu-picker__category-btn--active" : ""
                    }`}
                    onClick={() => onSelectCategory(category.id)}
                  >
                    {locale === "ar" ? category.name.ar : (category.name.en ?? category.name.ar)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        />
      </div>

      <div className="menu-picker__products">
        <h3>{t("orders.new.products")}</h3>
        {selectedCategoryId === null ? (
          <p className="orders-empty-inline">{t("orders.new.selectCategory")}</p>
        ) : (
          <SectionState<Product[]>
            status={products.status}
            data={products.data}
            error={products.error}
            retry={products.retry}
            isEmpty={(list) => list.length === 0}
            renderEmpty={() => (
              <div className="orders-empty">
                <p className="orders-empty__title">{t("orders.new.catalogUnavailable.title")}</p>
              </div>
            )}
            renderSuccess={(list) => (
              <ul className="menu-picker__product-grid">
                {list.map((product) => (
                  <li key={product.id}>
                    <button type="button" className="menu-picker__product-btn" onClick={() => onSelectProduct(product)}>
                      <span>{locale === "ar" ? product.name.ar : (product.name.en ?? product.name.ar)}</span>
                      <span className="money">{formatMoney(product.base_price, locale)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          />
        )}
      </div>
    </div>
  );
}
