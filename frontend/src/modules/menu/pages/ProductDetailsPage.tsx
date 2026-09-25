import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLocale } from "../../../i18n/LocaleContext";
import { formatMoney } from "../../../money/formatMoney";
import { useMenuTranslation } from "../hooks/useMenuTranslation";
import { useProduct, useVariants, useModifiers } from "../hooks/useMenuQueries";
import { useCreateVariant, useUpdateVariant, useCreateModifier, useUpdateModifier } from "../hooks/useMenuMutations";
import { SectionState } from "../components/SectionState";
import { VariantList } from "../components/VariantList";
import { VariantForm } from "../components/VariantForm";
import { ModifierList } from "../components/ModifierList";
import { ModifierForm } from "../components/ModifierForm";
import { ActiveBadge } from "../components/ActiveBadge";
import { MenuUnavailable } from "../components/MenuUnavailable";
import { MenuServiceUnavailableError } from "../services/menuService";
import type { Modifier, Product, Variant } from "../../../../contracts/entities";
import "./menu.css";

export function ProductDetailsPage() {
  const { productId } = useParams<{ productId: string }>();
  const { locale } = useLocale();
  const t = useMenuTranslation();

  const product = useProduct(productId ?? "");
  const variants = useVariants(productId ?? "");
  const modifiers = useModifiers(productId ?? "");

  const createVariant = useCreateVariant();
  const updateVariant = useUpdateVariant();
  const createModifier = useCreateModifier();
  const updateModifier = useUpdateModifier();

  const [editingVariant, setEditingVariant] = useState<Variant | "new" | null>(null);
  const [editingModifier, setEditingModifier] = useState<Modifier | "new" | null>(null);

  if (product.status === "error" && product.error instanceof MenuServiceUnavailableError) {
    return <MenuUnavailable />;
  }

  async function submitVariant(body: Parameters<typeof createVariant.run>[1]) {
    if (!productId) return;
    const result =
      editingVariant && editingVariant !== "new"
        ? await updateVariant.run(editingVariant.id, body)
        : await createVariant.run(productId, body);
    if (result) {
      setEditingVariant(null);
      variants.retry();
    }
  }

  async function submitModifier(body: Parameters<typeof createModifier.run>[1]) {
    if (!productId) return;
    const result =
      editingModifier && editingModifier !== "new"
        ? await updateModifier.run(editingModifier.id, body)
        : await createModifier.run(productId, body);
    if (result) {
      setEditingModifier(null);
      modifiers.retry();
    }
  }

  return (
    <div className="menu-page">
      <Link to="/menu/products" className="menu-back-link">
        {t("menu.products.back")}
      </Link>

      <SectionState<Product>
        status={product.status}
        data={product.data}
        error={product.error}
        retry={product.retry}
        isEmpty={() => false}
        renderEmpty={() => <p className="menu-empty-inline">{t("menu.products.notFound")}</p>}
        renderSuccess={(current) => (
          <header className="menu-header">
            <div>
              <h1 className="menu-header__title">
                {locale === "ar" ? current.name.ar : (current.name.en ?? current.name.ar)}
              </h1>
              <p className="menu-header__subtitle">
                {t("menu.products.column.basePrice")}: {formatMoney(current.base_price, locale)} · {t("menu.products.basePriceNote")}
              </p>
            </div>
            <ActiveBadge isActive={current.is_active} />
          </header>
        )}
      />

      <section className="menu-panel">
        <div className="menu-panel__heading">
          <div>
            <h2>{t("menu.variants.title")}</h2>
            <p className="menu-panel__subtitle">{t("menu.variants.subtitle")}</p>
          </div>
          <button type="button" className="btn btn--primary" onClick={() => setEditingVariant("new")}>
            {t("menu.variants.new")}
          </button>
        </div>

        {editingVariant ? (
          <VariantForm
            initial={editingVariant === "new" ? undefined : editingVariant}
            isSubmitting={createVariant.isLoading || updateVariant.isLoading}
            error={editingVariant === "new" ? createVariant.error : updateVariant.error}
            onSubmit={submitVariant}
            onCancel={() => setEditingVariant(null)}
          />
        ) : null}

        <SectionState<Variant[]>
          status={variants.status}
          data={variants.data}
          error={variants.error}
          retry={variants.retry}
          isEmpty={(list) => list.length === 0}
          renderEmpty={() => (
            <div className="menu-empty">
              <p className="menu-empty__title">{t("menu.variants.empty.title")}</p>
              <p className="menu-empty__body">{t("menu.variants.empty.body")}</p>
            </div>
          )}
          renderSuccess={(list) => <VariantList variants={list} onEdit={setEditingVariant} />}
        />
      </section>

      <section className="menu-panel">
        <div className="menu-panel__heading">
          <div>
            <h2>{t("menu.modifiers.title")}</h2>
            <p className="menu-panel__subtitle">{t("menu.modifiers.subtitle")}</p>
          </div>
          <button type="button" className="btn btn--primary" onClick={() => setEditingModifier("new")}>
            {t("menu.modifiers.new")}
          </button>
        </div>

        {editingModifier ? (
          <ModifierForm
            initial={editingModifier === "new" ? undefined : editingModifier}
            isSubmitting={createModifier.isLoading || updateModifier.isLoading}
            error={editingModifier === "new" ? createModifier.error : updateModifier.error}
            onSubmit={submitModifier}
            onCancel={() => setEditingModifier(null)}
          />
        ) : null}

        <SectionState<Modifier[]>
          status={modifiers.status}
          data={modifiers.data}
          error={modifiers.error}
          retry={modifiers.retry}
          isEmpty={(list) => list.length === 0}
          renderEmpty={() => (
            <div className="menu-empty">
              <p className="menu-empty__title">{t("menu.modifiers.empty.title")}</p>
              <p className="menu-empty__body">{t("menu.modifiers.empty.body")}</p>
            </div>
          )}
          renderSuccess={(list) => <ModifierList modifiers={list} onEdit={setEditingModifier} />}
        />
      </section>
    </div>
  );
}
