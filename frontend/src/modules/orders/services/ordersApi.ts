/**
 * Orders data access. Every request goes through the shared
 * `src/api/client.ts` helpers — never raw `fetch()`. Only calls endpoints
 * this phase's contracts actually document:
 *
 *  - `GET /orders`, `GET /orders/{id}` — api-contract.md's generic REST
 *    conventions applied to the `/orders` resource named there.
 *  - `POST /orders` — api-contract.md's idempotency section names this
 *    endpoint explicitly (request body is an ASSUMPTION — see
 *    types/order.ts's CreateOrderRequest doc comment and
 *    INTEGRATION_REQUEST.md).
 *  - `POST /orders/{id}/actions/cancel` — api-contract.md's own worked
 *    example of the actions convention.
 *  - `POST /orders/{id}/payments` — payment-contract.md.
 *  - `POST /orders/{id}/payments/{payment_id}/actions/void` —
 *    payment-contract.md.
 *  - `PATCH /orders/{id}/delivery` — delivery-contract.md.
 *
 * Idempotency-Key is generated client-side (crypto.randomUUID()) exactly
 * where offline-readiness-contract.md and api-contract.md say it's
 * required: order creation and payment recording. Not added to
 * endpoints that don't document it (e.g. cancel), per this phase's own
 * "do not invent" rule — an unrequested header is still an invention.
 */

import { apiGet, apiGetList, apiPatch, apiPost } from "../../../api/client";
import type { Order } from "../../../../contracts/entities";
import type {
  CreateOrderRequest,
  OrderFilters,
  RecordPaymentRequest,
  UpdateDeliveryRequest,
} from "../types/order";

function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

export interface OrderListResult {
  data: Order[];
  meta: { page: number; page_size: number; total_count: number; total_pages: number };
}

/**
 * `search` in `OrderFilters` is intentionally NOT forwarded as a query
 * param — no search/full-text filter is documented for `/orders`, so it
 * is applied client-side by the caller (see hooks/useOrdersList.ts)
 * against whatever page is loaded, not sent to the server.
 */
export async function listOrders(
  filters: OrderFilters,
  page: number,
  pageSize: number,
): Promise<OrderListResult> {
  const { status, type, source, payment_status, created_at_from, created_at_to } = filters;
  return apiGetList<Order>("orders", {
    query: {
      status,
      type,
      source,
      payment_status,
      created_at_from,
      created_at_to,
      page,
      page_size: pageSize,
      sort: "-created_at",
    },
  });
}

export async function getOrder(id: string): Promise<Order> {
  return apiGet<Order>(`orders/${id}`);
}

/**
 * `branchId`: only meaningful for an OWNER session (CASHIER's branch is
 * implicit and must never be sent — branch-context-contract.md). Pass
 * `undefined` for a CASHIER caller. See NewOrderPage for why an OWNER
 * caller currently cannot reach this at all (no branch-selection data
 * source exists — INTEGRATION_REQUEST.md).
 */
export async function createOrder(body: CreateOrderRequest, branchId?: string): Promise<Order> {
  return apiPost<Order>("orders", {
    body,
    idempotencyKey: newIdempotencyKey(),
    branchId,
  });
}

export async function cancelOrder(id: string): Promise<Order> {
  return apiPost<Order>(`orders/${id}/actions/cancel`);
}

export async function recordPayment(orderId: string, body: RecordPaymentRequest): Promise<Order> {
  return apiPost<Order>(`orders/${orderId}/payments`, {
    body,
    idempotencyKey: newIdempotencyKey(),
  });
}

export async function voidPayment(orderId: string, paymentId: string): Promise<Order> {
  return apiPost<Order>(`orders/${orderId}/payments/${paymentId}/actions/void`);
}

export async function updateDelivery(orderId: string, body: UpdateDeliveryRequest): Promise<Order> {
  return apiPatch<Order>(`orders/${orderId}/delivery`, { body });
}
