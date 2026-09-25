import { useState, type FormEvent } from "react";
import { useMenuTranslation } from "../hooks/useMenuTranslation";
import { ApiError } from "../../../api/ApiError";
import type { Variant } from "../../../../contracts/entities";
import type { CreateVariantRequest } from "../types/menu";

interface VariantFormProps {
  initial?: Variant;
  isSubmitting: boolean;
  error: Error | null;
  onSubmit: (body: CreateVariantRequest) => void;
  onCancel: () => void;
}

interface FieldErrors {
  nameAr?: string;
  price?: string;
}

function isValidMoneyInput(value: string): boolean {
  return /^\d+(\.\d{1,2})?$/.test(value.trim());
}

export function VariantForm({ initial, isSubmitting, error, onSubmit, onCancel }: VariantFormProps) {
  const t = useMenuTranslation();
  const [nameAr, setNameAr] = useState(initial?.name.ar ?? "");
  const [nameEn, setNameEn] = useState(initial?.name.en ?? "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [isDefault, setIsDefault] = useState(initial?.is_default ?? false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (nameAr.trim() === "") errors.nameAr = t("menu.form.validation.nameArRequired");
    if (price.trim() === "") errors.price = t("menu.form.validation.priceRequired");
    else if (!isValidMoneyInput(price)) errors.price = t("menu.form.validation.priceInvalid");
    return errors;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    onSubmit({
      name: { ar: nameAr.trim(), en: nameEn.trim() === "" ? null : nameEn.trim() },
      price: Number(price).toFixed(2),
      is_default: isDefault,
    });
  }

  return (
    <form className="menu-form" onSubmit={handleSubmit} noValidate>
      <div className="menu-form__field">
        <label htmlFor="var-name-ar">{t("menu.form.nameAr")}</label>
        <input id="var-name-ar" type="text" value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
        {fieldErrors.nameAr ? <p className="menu-form__error">{fieldErrors.nameAr}</p> : null}
      </div>
      <div className="menu-form__field">
        <label htmlFor="var-name-en">{t("menu.form.nameEn")}</label>
        <input id="var-name-en" type="text" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
      </div>
      <div className="menu-form__field">
        <label htmlFor="var-price">{t("menu.variants.column.price")}</label>
        <input id="var-price" type="text" inputMode="decimal" className="money" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
        <p className="menu-form__hint">{t("menu.variants.priceNote")}</p>
        {fieldErrors.price ? <p className="menu-form__error">{fieldErrors.price}</p> : null}
      </div>
      <label className="menu-form__checkbox">
        <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
        {t("menu.default")}
      </label>
      <p className="menu-form__hint">{t("menu.variants.defaultNote")}</p>

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
