import type { Money } from "../../../../contracts/entities";

/**
 * Count of orders per OrderStatus, for a given period (see
 * hooks/useOrderStatusCounts.ts). Uses the exact enum values from
 * frontend/contracts/enums.ts — no new status is introduced. "Pending" in
 * the UI is a display label for `PLACED`, not a new enum value.
 */
export interface OrderStatusCounts {
  DRAFT: number;
  PLACED: number;
  PREPARING: number;
  READY: number;
  COMPLETED: number;
  CANCELLED: number;
}

/**
 * ASSUMED response shape for `GET /reports/sales` — NOT settled by
 * docs/contracts/reporting-contract.md, which only describes the
 * aggregation rule ("Aggregates Order.total for status = COMPLETED orders
 * in the period. Grouped by day...") without specifying field names. This
 * is a best-effort reconstruction, documented here rather than guessed
 * silently — see INTEGRATION_REQUEST.md. `services/dashboardApi.ts`
 * validates a response actually has this shape before trusting it, so an
 * incompatible real backend degrades to this section's error state
 * instead of crashing the page.
 */
export interface SalesReportPoint {
  date: string; // ISO date, "YYYY-MM-DD"
  total: Money;
}

export interface SalesReportResponse {
  period: "daily" | "weekly" | "monthly";
  points: SalesReportPoint[];
  total: Money;
}

/**
 * A minimal, UI-local shape for an operational alert derived from
 * `Notification` (frontend/contracts/entities.ts). Kept separate from the
 * raw `Notification` type so components don't need to know about
 * `payload`'s per-type shape (see docs/contracts/notification-contract.md).
 */
export type DashboardAlert =
  | { id: string; kind: "ORDER_READY"; orderId: string; createdAt: string }
  | {
      id: string;
      kind: "LOW_STOCK";
      inventoryItemId: string;
      currentQuantity: string;
      createdAt: string;
    };
