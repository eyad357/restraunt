import { useState, type FormEvent } from "react";
import { useMenuTranslation } from "../hooks/useMenuTranslation";
import { ApiError } from "../../../api/ApiError";
import type { Modifier } from "../../../../contracts/entities";
import type { CreateModifierRequest } from "../types/menu";

interface ModifierFormProps {
  initial?: Modifier;
  isSubmitting: boolean;
  error: Error | null;
  onSubmit: (body: CreateModifierRequest) => void;
  onCancel: () => void;
}

interface FieldErrors {
  nameAr?: string;
  priceDelta?: string;
}

/**
 * Per domain-entities.md: "price_delta ... can be 0 ... or negative only
 * if explicitly documented — MVP assumes >= 0." This validation reflects
 * that documented assumption, not an invented rule.
 */
function isValidNonNegativeMoneyInput(value: string): boolean {
  return /^\d+(\.\d{1,2})?$/.test(value.trim());
}

export function ModifierForm({ initial, isSubmitting, error, onSubmit, onCancel }: ModifierFormProps) {
  const t = useMenuTranslation();
  const [nameAr, setNameAr] = useState(initial?.name.ar ?? "");
  const [nameEn, setNameEn] = useState(initial?.name.en ?? "");
  const [priceDelta, setPriceDelta] = useState(initial?.price_delta ?? "0.00");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (nameAr.trim() === "") errors.nameAr = t("menu.form.validation.nameArRequired");
    if (priceDelta.trim() === "" || !isValidNonNegativeMoneyInput(priceDelta)) {
      errors.priceDelta = t("menu.form.validation.priceInvalid");
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
      price_delta: Number(priceDelta).toFixed(2),
      is_active: isActive,
    });
  }

  return (
    <form className="menu-form" onSubmit={handleSubmit} noValidate>
      <div className="menu-form__field">
        <label htmlFor="mod-name-ar">{t("menu.form.nameAr")}</label>
        <input id="mod-name-ar" type="text" value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
        {fieldErrors.nameAr ? <p className="menu-form__error">{fieldErrors.nameAr}</p> : null}
      </div>
      <div className="menu-form__field">
        <label htmlFor="mod-name-en">{t("menu.form.nameEn")}</label>
        <input id="mod-name-en" type="text" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
      </div>
      <div className="menu-form__field">
        <label htmlFor="mod-price-delta">{t("menu.modifiers.column.priceDelta")}</label>
        <input id="mod-price-delta" type="text" inputMode="decimal" className="money" value={priceDelta} onChange={(e) => setPriceDelta(e.target.value)} placeholder="0.00" />
        <p className="menu-form__hint">{t("menu.modifiers.priceDeltaNote")}</p>
        {fieldErrors.priceDelta ? <p className="menu-form__error">{fieldErrors.priceDelta}</p> : null}
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
