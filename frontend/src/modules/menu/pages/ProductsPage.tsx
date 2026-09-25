import { useState } from "react";
import { useLocale } from "../../../i18n/LocaleContext";
import { useMenuTranslation } from "../hooks/useMenuTranslation";
import { useCategories, useProducts } from "../hooks/useMenuQueries";
import { useCreateProduct, useUpdateProduct } from "../hooks/useMenuMutations";
import { SectionState } from "../components/SectionState";
import { ProductList } from "../components/ProductList";
import { ProductForm } from "../components/ProductForm";
import { MenuUnavailable } from "../components/MenuUnavailable";
import { MenuNav } from "../components/MenuNav";
import { MenuServiceUnavailableError } from "../services/menuService";
import type { Product } from "../../../../contracts/entities";
import "./menu.css";

export function ProductsPage() {
  const { locale } = useLocale();
  const t = useMenuTranslation();
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const categories = useCategories();
  const products = useProducts(categoryFilter === "" ? undefined : categoryFilter);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [editing, setEditing] = useState<Product | "new" | null>(null);

  async function handleSubmit(body: Parameters<typeof createProduct.run>[0]) {
    const result = editing && editing !== "new" ? await updateProduct.run(editing.id, body) : await createProduct.run(body);
    if (result) {
      setEditing(null);
      products.retry();
    }
  }

  if (products.status === "error" && products.error instanceof MenuServiceUnavailableError) {
    return <MenuUnavailable />;
  }

  const catMap = new Map((categories.data ?? []).map((c) => [c.id, c]));

  return (
    <div className="menu-page">
      <MenuNav />
      <header className="menu-header">
        <div>
          <h1 className="menu-header__title">{t("menu.products.title")}</h1>
          <p className="menu-header__subtitle">{t("menu.products.subtitle")}</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setEditing("new")}>
          {t("menu.products.new")}
        </button>
      </header>

      <div className="menu-filters">
        <label htmlFor="product-category-filter">{t("menu.products.filterCategory")}</label>
        <select id="product-category-filter" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">{t("menu.products.filterAll")}</option>
          {(categories.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {locale === "ar" ? c.name.ar : (c.name.en ?? c.name.ar)}
            </option>
          ))}
        </select>
      </div>

      {editing ? (
        <section className="menu-panel">
          <h2>{editing === "new" ? t("menu.products.new") : t("menu.products.edit")}</h2>
          <ProductForm
            categories={categories.data ?? []}
            initial={editing === "new" ? undefined : editing}
            defaultCategoryId={categoryFilter || undefined}
            isSubmitting={createProduct.isLoading || updateProduct.isLoading}
            error={editing === "new" ? createProduct.error : updateProduct.error}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
          />
        </section>
      ) : null}

      <SectionState<Product[]>
        status={products.status}
        data={products.data}
        error={products.error}
        retry={products.retry}
        isEmpty={(list) => list.length === 0}
        renderEmpty={() => (
          <div className="menu-empty">
            <p className="menu-empty__title">{t("menu.products.empty.title")}</p>
            <p className="menu-empty__body">{t("menu.products.empty.body")}</p>
          </div>
        )}
        renderSuccess={(list) => <ProductList products={list} categoriesById={catMap} onEdit={setEditing} />}
      />
    </div>
  );
}
