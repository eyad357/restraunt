import { useEffect, useState } from "react";
import { useLocale } from "../../../i18n/LocaleContext";
import { formatMoney } from "../../../money/formatMoney";
import { useOrdersTranslation } from "../hooks/useOrdersTranslation";
import { useProductOptions } from "../hooks/useMenuCatalog";
import { SectionState } from "./SectionState";
import type { Modifier, Product, Variant } from "../../../../contracts/entities";

interface ItemConfiguratorProps {
  product: Product;
  onAdd: (variant: Variant | null, modifiers: Modifier[], quantity: number, notes: string) => void;
}

export function ItemConfigurator({ product, onAdd }: ItemConfiguratorProps) {
  const { locale } = useLocale();
  const t = useOrdersTranslation();
  const { variants, modifiers } = useProductOptions(product.id);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedModifierIds, setSelectedModifierIds] = useState<Set<string>>(new Set());
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setSelectedVariantId(null);
    setSelectedModifierIds(new Set());
    setQuantity(1);
    setNotes("");
  }, [product.id]);

  useEffect(() => {
    if (variants.data && variants.data.length > 0 && selectedVariantId === null) {
      const defaultVariant = variants.data.find((v) => v.is_default) ?? variants.data[0];
      if (defaultVariant) setSelectedVariantId(defaultVariant.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variants.data]);

  function toggleModifier(id: string) {
    setSelectedModifierIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAdd() {
    const variant = variants.data?.find((v) => v.id === selectedVariantId) ?? null;
    const selectedModifiers = (modifiers.data ?? []).filter((m) => selectedModifierIds.has(m.id));
    onAdd(variant, selectedModifiers, quantity, notes);
  }

  return (
    <div className="item-configurator">
      <h3>{locale === "ar" ? product.name.ar : (product.name.en ?? product.name.ar)}</h3>

      <SectionState<Variant[]>
        status={variants.status}
        data={variants.data}
        error={variants.error}
        retry={variants.retry}
        isEmpty={(list) => list.length === 0}
        renderEmpty={() => null}
        renderSuccess={(list) => (
          <fieldset className="item-configurator__variants">
            <legend>{t("orders.new.variant")}</legend>
            {list.map((variant) => (
              <label key={variant.id} className="item-configurator__option">
                <input
                  type="radio"
                  name="variant"
                  checked={selectedVariantId === variant.id}
                  onChange={() => setSelectedVariantId(variant.id)}
                />
                <span>{locale === "ar" ? variant.name.ar : (variant.name.en ?? variant.name.ar)}</span>
                <span className="money">{formatMoney(variant.price, locale)}</span>
              </label>
            ))}
          </fieldset>
        )}
      />

      <SectionState<Modifier[]>
        status={modifiers.status}
        data={modifiers.data}
        error={modifiers.error}
        retry={modifiers.retry}
        isEmpty={(list) => list.length === 0}
        renderEmpty={() => null}
        renderSuccess={(list) => (
          <fieldset className="item-configurator__modifiers">
            <legend>{t("orders.new.modifiers")}</legend>
            {list.map((modifier) => (
              <label key={modifier.id} className="item-configurator__option">
                <input
                  type="checkbox"
                  checked={selectedModifierIds.has(modifier.id)}
                  onChange={() => toggleModifier(modifier.id)}
                />
                <span>{locale === "ar" ? modifier.name.ar : (modifier.name.en ?? modifier.name.ar)}</span>
                <span className="money">
                  {Number(modifier.price_delta) >= 0 ? "+" : ""}
                  {formatMoney(modifier.price_delta, locale)}
                </span>
              </label>
            ))}
          </fieldset>
        )}
      />

      <div className="item-configurator__row">
        <label htmlFor="item-quantity">{t("orders.new.quantity")}</label>
        <input
          id="item-quantity"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
        />
      </div>

      <div className="item-configurator__row">
        <label htmlFor="item-notes">{t("orders.new.itemNotes")}</label>
        <input
          id="item-notes"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("orders.new.itemNotesPlaceholder")}
        />
      </div>

      <button type="button" className="btn btn--primary" onClick={handleAdd}>
        {t("orders.new.addToCart")}
      </button>
    </div>
  );
}
