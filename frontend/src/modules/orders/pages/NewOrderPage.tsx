import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import { useOrdersTranslation } from "../hooks/useOrdersTranslation";
import { useCart } from "../hooks/useCart";
import { useCreateOrder } from "../hooks/useOrderMutations";
import { CategoryProductPicker } from "../components/CategoryProductPicker";
import { ItemConfigurator } from "../components/ItemConfigurator";
import { CartPanel } from "../components/CartPanel";
import { ApiError } from "../../../api/ApiError";
import type { Modifier, Product, Variant } from "../../../../contracts/entities";
import type { OrderSource, OrderType } from "../../../../contracts/enums";
import "./orders.css";

const TYPES: OrderType[] = ["TAKEAWAY", "PICKUP", "DELIVERY", "PRE_ORDER"];
const SOURCES: Extract<OrderSource, "CASHIER" | "PHONE">[] = ["CASHIER", "PHONE"];

export function NewOrderPage() {
  const { session } = useAuth();
  const t = useOrdersTranslation();
  const navigate = useNavigate();
  const cart = useCart();
  const createOrder = useCreateOrder();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [type, setType] = useState<OrderType>("TAKEAWAY");
  const [source, setSource] = useState<Extract<OrderSource, "CASHIER" | "PHONE">>("CASHIER");
  const [scheduledFor, setScheduledFor] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  const role = session?.user.role ?? "CASHIER";

  // See INTEGRATION_REQUEST.md: an OWNER-created order requires an
  // explicit X-Branch-Id header (branch-context-contract.md), and no
  // branch-selection data source exists yet (no GET /branches endpoint).
  // Rather than guess a branch or silently omit a required header, order
  // creation is disabled for OWNER sessions with a clear explanation.
  if (role === "OWNER") {
    return (
      <div className="orders-page">
        <div className="orders-panel orders-empty">
          <p className="orders-empty__title">{t("orders.new.ownerBranchRequired.title")}</p>
          <p className="orders-empty__body">{t("orders.new.ownerBranchRequired.body")}</p>
        </div>
      </div>
    );
  }

  function handleAddToCart(variant: Variant | null, modifiers: Modifier[], quantity: number, notes: string) {
    if (!selectedProduct) return;
    cart.addLine(selectedProduct, variant, modifiers, quantity, notes);
    setSelectedProduct(null);
  }

  async function handleSubmit() {
    const created = await createOrder.run({
      type,
      source,
      items: cart.toCreateOrderItems(),
      notes: orderNotes.trim() === "" ? null : orderNotes.trim(),
      scheduled_for: type === "PRE_ORDER" && scheduledFor ? new Date(scheduledFor).toISOString() : null,
    });
    if (created) {
      navigate(`/orders/${created.id}`, { replace: true });
    }
  }

  const canSubmit = cart.lines.length > 0 && !createOrder.isLoading && (type !== "PRE_ORDER" || scheduledFor !== "");

  return (
    <div className="orders-page">
      <header className="orders-header">
        <div>
          <h1 className="orders-header__title">{t("orders.new.title")}</h1>
          <p className="orders-header__subtitle">{t("orders.new.subtitle")}</p>
        </div>
      </header>

      <div className="new-order-fields">
        <div className="orders-filters__field">
          <label htmlFor="new-order-type">{t("orders.new.type")}</label>
          <select id="new-order-type" value={type} onChange={(e) => setType(e.target.value as OrderType)}>
            {TYPES.map((ty) => (
              <option key={ty} value={ty}>
                {t(`orders.type.${ty}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="orders-filters__field">
          <label htmlFor="new-order-source">{t("orders.new.source")}</label>
          <select
            id="new-order-source"
            value={source}
            onChange={(e) => setSource(e.target.value as Extract<OrderSource, "CASHIER" | "PHONE">)}
          >
            {SOURCES.map((src) => (
              <option key={src} value={src}>
                {t(`orders.source.${src}`)}
              </option>
            ))}
          </select>
        </div>
        {type === "PRE_ORDER" ? (
          <div className="orders-filters__field">
            <label htmlFor="new-order-scheduled">{t("orders.new.scheduledFor")}</label>
            <input
              id="new-order-scheduled"
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
            />
          </div>
        ) : null}
        <div className="orders-filters__field orders-filters__field--search">
          <label htmlFor="new-order-notes">{t("orders.new.notes")}</label>
          <input
            id="new-order-notes"
            type="text"
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            placeholder={t("orders.new.notesPlaceholder")}
          />
        </div>
      </div>

      <div className="new-order-layout">
        <div className="new-order-layout__catalog">
          <CategoryProductPicker
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            onSelectProduct={setSelectedProduct}
          />
          {selectedProduct ? <ItemConfigurator product={selectedProduct} onAdd={handleAddToCart} /> : null}
        </div>
        <div className="new-order-layout__cart">
          <CartPanel
            lines={cart.lines}
            lineTotal={cart.lineTotal}
            estimatedTotal={cart.estimatedTotal}
            onRemove={cart.removeLine}
            onQuantityChange={cart.updateQuantity}
          />
          <button type="button" className="btn btn--primary new-order-layout__submit" disabled={!canSubmit} onClick={handleSubmit}>
            {createOrder.isLoading ? t("orders.new.submitting") : t("orders.new.submit")}
          </button>
          {createOrder.status === "error" ? (
            <p className="orders-panel__error" role="alert">
              {createOrder.error instanceof ApiError ? createOrder.error.message : t("orders.state.error.title")}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
