/**
 * Kitchen data access. Every request goes through the shared
 * `src/api/client.ts` helpers — never raw `fetch()`. Unlike Menu
 * (P1-FE-05), Kitchen has a fully documented, real API
 * (docs/contracts/kitchen-contract.md):
 *
 *  - `GET /kitchen-tickets?status=...` — the live board.
 *  - `POST /kitchen-tickets/{id}/actions/start` (RECEIVED → PREPARING)
 *  - `POST /kitchen-tickets/{id}/actions/ready` (PREPARING → READY, the
 *    server fires the ORDER_READY notification itself — Kitchen does not
 *    create it)
 *  - `POST /kitchen-tickets/{id}/actions/complete` (READY → COMPLETED,
 *    gated for DELIVERY orders — see components/KitchenTicketCard.tsx)
 *
 * `KitchenTicket` (frontend/contracts/entities.ts) carries only
 * `order_id`, not the order's items/notes/modifiers — per
 * kitchen-contract.md, the kitchen view is "a projection of Order.notes,
 * OrderItem.notes, and each OrderItem's modifiers," so this module reads
 * the referenced order via the already-documented `GET /orders/{id}`
 * (the same endpoint Orders itself uses) rather than inventing an
 * "expanded ticket" shape that isn't in any contract.
 *
 * No `branch_id` is sent on any call — consistent with the pattern
 * established in Dashboard/Orders: a CASHIER's branch is implicit and
 * must never be sent by the client (branch-context-contract.md); an
 * OWNER has no branch-selection data source yet (see
 * INTEGRATION_REQUEST.md's existing item on this), so an OWNER's board
 * shows all branches, the contract's own documented default for an
 * omitted branch_id.
 */

import { apiGet, apiGetList, apiPost } from "../../../api/client";
import type { KitchenTicket, Order } from "../../../../contracts/entities";
import type { KitchenStatus } from "../../../../contracts/enums";
import type { KitchenActionResponse } from "../types/kitchen";

export async function listTicketsByStatus(status: KitchenStatus): Promise<KitchenTicket[]> {
  const result = await apiGetList<KitchenTicket>("kitchen-tickets", {
    query: { status, page_size: 100 },
  });
  return result.data;
}

export async function getOrderForTicket(orderId: string): Promise<Order> {
  return apiGet<Order>(`orders/${orderId}`);
}

export async function startTicket(ticketId: string): Promise<KitchenActionResponse> {
  return apiPost<KitchenActionResponse>(`kitchen-tickets/${ticketId}/actions/start`);
}

export async function readyTicket(ticketId: string): Promise<KitchenActionResponse> {
  return apiPost<KitchenActionResponse>(`kitchen-tickets/${ticketId}/actions/ready`);
}

export async function completeTicket(ticketId: string): Promise<KitchenActionResponse> {
  return apiPost<KitchenActionResponse>(`kitchen-tickets/${ticketId}/actions/complete`);
}
