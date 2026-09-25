import { useState, type FormEvent } from "react";
import { useMenuTranslation } from "../hooks/useMenuTranslation";
import { ApiError } from "../../../api/ApiError";
import type { Category } from "../../../../contracts/entities";
import type { CreateCategoryRequest } from "../types/menu";

interface CategoryFormProps {
  initial?: Category;
  isSubmitting: boolean;
  error: Error | null;
  onSubmit: (body: CreateCategoryRequest) => void;
  onCancel: () => void;
}

interface FieldErrors {
  nameAr?: string;
  sortOrder?: string;
}

export function CategoryForm({ initial, isSubmitting, error, onSubmit, onCancel }: CategoryFormProps) {
  const t = useMenuTranslation();
  const [nameAr, setNameAr] = useState(initial?.name.ar ?? "");
  const [nameEn, setNameEn] = useState(initial?.name.en ?? "");
  const [sortOrder, setSortOrder] = useState(String(initial?.sort_order ?? 0));
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (nameAr.trim() === "") errors.nameAr = t("menu.form.validation.nameArRequired");
    if (sortOrder.trim() === "" || Number(sortOrder) < 0 || !Number.isFinite(Number(sortOrder))) {
      errors.sortOrder = t("menu.form.validation.sortOrderInvalid");
    }
    return errors;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    onSubmit({
      name: { ar: nameAr.trim(), en: nameEn.trim() === "" ? null : nameEn.trim() },
      sort_order: Number(sortOrder),
      is_active: isActive,
    });
  }

  return (
    <form className="menu-form" onSubmit={handleSubmit} noValidate>
      <div className="menu-form__field">
        <label htmlFor="cat-name-ar">{t("menu.form.nameAr")}</label>
        <input id="cat-name-ar" type="text" value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
        {fieldErrors.nameAr ? <p className="menu-form__error">{fieldErrors.nameAr}</p> : null}
      </div>
      <div className="menu-form__field">
        <label htmlFor="cat-name-en">{t("menu.form.nameEn")}</label>
        <input id="cat-name-en" type="text" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
      </div>
      <div className="menu-form__field">
        <label htmlFor="cat-sort">{t("menu.form.sortOrder")}</label>
        <input id="cat-sort" type="number" min={0} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
        {fieldErrors.sortOrder ? <p className="menu-form__error">{fieldErrors.sortOrder}</p> : null}
      </div>
      <label className="menu-form__checkbox">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        {t("menu.form.isActive")}
      </label>

      {error ? (
        <p className="menu-form__error" role="alert">
          {error instanceof ApiError ? error.message : t("menu.state.error.title")}
        </p>
      ) : null}

      <div className="menu-form__actions">
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {isSubmitting ? t("menu.state.saving") : initial ? t("menu.form.save") : t("menu.form.create")}
        </button>
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          {t("menu.form.cancel")}
        </button>
      </div>
    </form>
  );
}
