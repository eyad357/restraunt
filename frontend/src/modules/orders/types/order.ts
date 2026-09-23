import type { Category, Modifier, Product, Variant } from "../../../../contracts/entities";
import type { OrderSource, OrderStatus, OrderType, PaymentStatus } from "../../../../contracts/enums";

/**
 * Filters for `GET /orders`. Field names match the query params
 * documented in docs/contracts/api/api-contract.md ("Filtering &
 * sorting" — plain field-name query params, `_from`/`_to` for date
 * ranges). `search` is NOT sent to the server: no full-text search
 * endpoint or filter field is documented for /orders, so search is
 * applied client-side against the currently-loaded page only — see
 * hooks/useOrdersList.ts and the note in INTEGRATION_REQUEST.md.
 */
export interface OrderFilters {
  status?: OrderStatus;
  type?: OrderType;
  source?: OrderSource;
  payment_status?: PaymentStatus;
  created_at_from?: string;
  created_at_to?: string;
  search?: string;
}

/**
 * `POST /orders` request body.
 *
 * ASSUMPTION, NOT A CONFIRMED CONTRACT SHAPE — see INTEGRATION_REQUEST.md.
 * No endpoint request schema for order creation is documented anywhere in
 * docs/contracts/ (only the response shape, via
 * docs/contracts/examples/order-example.json, and the existence of the
 * endpoint itself in api-contract.md's idempotency section). This shape
 * is inferred conservatively:
 *  - Only IDs, quantities, and notes are sent — never `unit_price`,
 *    `line_total`, `subtotal`, or `total`. Those are server-computed
 *    (money-contract.md: backend remains authoritative for financial
 *    calculations; this frontend never submits a price it calculated).
 *  - `source` is limited here to "CASHIER" | "PHONE" — an "ONLINE" order
 *    is submitted by a storefront this module does not implement.
 *  - `branch_id` is intentionally NOT a body field — branch context for a
 *    branch-scoped POST is `X-Branch-Id` header for OWNER sessions
 *    (implicit for CASHIER), per branch-context-contract.md. See
 *    services/ordersApi.ts.
 */
export interface CreateOrderItemInput {
  product_id: string;
  variant_id: string | null;
  modifier_ids: string[];
  quantity: number;
  notes: string | null;
}

export interface CreateOrderRequest {
  type: OrderType;
  source: Extract<OrderSource, "CASHIER" | "PHONE">;
  items: CreateOrderItemInput[];
  notes: string | null;
  /** Required when type === "PRE_ORDER" per order-lifecycle-contract.md. */
  scheduled_for: string | null;
}

/**
 * `POST /orders/{id}/payments` request body — per payment-contract.md,
 * one concrete method per call (never "MIXED" itself; a mixed payment is
 * multiple calls with different methods).
 */
export interface RecordPaymentRequest {
  method: "CASH" | "CARD" | "WALLET" | "INSTAPAY";
  amount: string; // Money — see frontend/contracts/entities.ts
}

/**
 * `PATCH /orders/{id}/delivery` request body — per delivery-contract.md
 * ("assign/update driver, transition status"). Only the fields that
 * contract's State section actually describes are exposed: a free-text
 * driver name and a status transition. No address field exists anywhere
 * in the DeliveryInfo contract — see INTEGRATION_REQUEST.md.
 */
export interface UpdateDeliveryRequest {
  driver_name?: string;
  status?: "ASSIGNED" | "OUT" | "DELIVERED" | "RETURNED";
}

/**
 * Menu catalog adapter boundary — see services/menuCatalogService.ts.
 * Types reuse the canonical Category/Product/Variant/Modifier contracts
 * directly; this file adds no new entity shape, only the service
 * interface order creation needs to browse them.
 */
export interface MenuCatalogService {
  listCategories(): Promise<Category[]>;
  listProducts(categoryId: string): Promise<Product[]>;
  listVariants(productId: string): Promise<Variant[]>;
  listModifiers(productId: string): Promise<Modifier[]>;
}

/**
 * A single configured line in the order-creation cart, before submission.
 * UI-local only — never sent as-is; see CreateOrderItemInput for the wire
 * shape and formatMoney/sumMoney for how its estimated total is shown.
 */
export interface CartLine {
  lineId: string; // client-local id (crypto.randomUUID()), not a server id
  product: Product;
  variant: Variant | null;
  modifiers: Modifier[];
  quantity: number;
  notes: string;
}
