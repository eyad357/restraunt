import { useState, type FormEvent } from "react";
import { useMenuTranslation } from "../hooks/useMenuTranslation";
import { ApiError } from "../../../api/ApiError";
import { useLocale } from "../../../i18n/LocaleContext";
import type { Category, Product } from "../../../../contracts/entities";
import type { CreateProductRequest } from "../types/menu";

interface ProductFormProps {
  categories: Category[];
  initial?: Product;
  defaultCategoryId?: string;
  isSubmitting: boolean;
  error: Error | null;
  onSubmit: (body: CreateProductRequest) => void;
  onCancel: () => void;
}

interface FieldErrors {
  nameAr?: string;
  categoryId?: string;
  basePrice?: string;
}

function isValidMoneyInput(value: string): boolean {
  return /^\d+(\.\d{1,2})?$/.test(value.trim());
}

export function ProductForm({ categories, initial, defaultCategoryId, isSubmitting, error, onSubmit, onCancel }: ProductFormProps) {
  const t = useMenuTranslation();
  const { locale } = useLocale();
  const [nameAr, setNameAr] = useState(initial?.name.ar ?? "");
  const [nameEn, setNameEn] = useState(initial?.name.en ?? "");
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? defaultCategoryId ?? "");
  const [basePrice, setBasePrice] = useState(initial?.base_price ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (nameAr.trim() === "") errors.nameAr = t("menu.form.validation.nameArRequired");
    if (categoryId === "") errors.categoryId = t("menu.form.validation.categoryRequired");
    if (basePrice.trim() === "") errors.basePrice = t("menu.form.validation.priceRequired");
    else if (!isValidMoneyInput(basePrice)) errors.basePrice = t("menu.form.validation.priceInvalid");
    return errors;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    onSubmit({
      category_id: categoryId,
      name: { ar: nameAr.trim(), en: nameEn.trim() === "" ? null : nameEn.trim() },
      base_price: Number(basePrice).toFixed(2),
      is_active: isActive,
    });
  }

  return (
    <form className="menu-form" onSubmit={handleSubmit} noValidate>
      <div className="menu-form__field">
        <label htmlFor="prod-name-ar">{t("menu.form.nameAr")}</label>
        <input id="prod-name-ar" type="text" value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
        {fieldErrors.nameAr ? <p className="menu-form__error">{fieldErrors.nameAr}</p> : null}
      </div>
      <div className="menu-form__field">
        <label htmlFor="prod-name-en">{t("menu.form.nameEn")}</label>
        <input id="prod-name-en" type="text" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
      </div>
      <div className="menu-form__field">
        <label htmlFor="prod-category">{t("menu.products.filterCategory")}</label>
        <select id="prod-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">{t("menu.form.validation.categoryRequired")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {locale === "ar" ? c.name.ar : (c.name.en ?? c.name.ar)}
            </option>
          ))}
        </select>
        {fieldErrors.categoryId ? <p className="menu-form__error">{fieldErrors.categoryId}</p> : null}
      </div>
      <div className="menu-form__field">
        <label htmlFor="prod-price">{t("menu.products.column.basePrice")}</label>
        <input id="prod-price" type="text" inputMode="decimal" className="money" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="0.00" />
        <p className="menu-form__hint">{t("menu.products.basePriceNote")}</p>
        {fieldErrors.basePrice ? <p className="menu-form__error">{fieldErrors.basePrice}</p> : null}
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
