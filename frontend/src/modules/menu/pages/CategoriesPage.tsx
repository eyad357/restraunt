import { useState } from "react";
import { useMenuTranslation } from "../hooks/useMenuTranslation";
import { useCategories } from "../hooks/useMenuQueries";
import { useCreateCategory, useUpdateCategory } from "../hooks/useMenuMutations";
import { SectionState } from "../components/SectionState";
import { CategoryList } from "../components/CategoryList";
import { CategoryForm } from "../components/CategoryForm";
import { MenuUnavailable } from "../components/MenuUnavailable";
import { MenuNav } from "../components/MenuNav";
import { MenuServiceUnavailableError } from "../services/menuService";
import type { Category } from "../../../../contracts/entities";
import "./menu.css";

export function CategoriesPage() {
  const t = useMenuTranslation();
  const categories = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const [editing, setEditing] = useState<Category | "new" | null>(null);

  async function handleSubmit(body: Parameters<typeof createCategory.run>[0]) {
    const result =
      editing && editing !== "new" ? await updateCategory.run(editing.id, body) : await createCategory.run(body);
    if (result) {
      setEditing(null);
      categories.retry();
    }
  }

  if (categories.status === "error" && categories.error instanceof MenuServiceUnavailableError) {
    return <MenuUnavailable />;
  }

  return (
    <div className="menu-page">
      <MenuNav />
      <header className="menu-header">
        <div>
          <h1 className="menu-header__title">{t("menu.categories.title")}</h1>
          <p className="menu-header__subtitle">{t("menu.categories.subtitle")}</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setEditing("new")}>
          {t("menu.categories.new")}
        </button>
      </header>

      {editing ? (
        <section className="menu-panel">
          <h2>{editing === "new" ? t("menu.categories.new") : t("menu.categories.edit")}</h2>
          <CategoryForm
            initial={editing === "new" ? undefined : editing}
            isSubmitting={createCategory.isLoading || updateCategory.isLoading}
            error={editing === "new" ? createCategory.error : updateCategory.error}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
          />
        </section>
      ) : null}

      <SectionState<Category[]>
        status={categories.status}
        data={categories.data}
        error={categories.error}
        retry={categories.retry}
        isEmpty={(list) => list.length === 0}
        renderEmpty={() => (
          <div className="menu-empty">
            <p className="menu-empty__title">{t("menu.categories.empty.title")}</p>
            <p className="menu-empty__body">{t("menu.categories.empty.body")}</p>
          </div>
        )}
        renderSuccess={(list) => <CategoryList categories={list} onEdit={setEditing} />}
      />
    </div>
  );
}
