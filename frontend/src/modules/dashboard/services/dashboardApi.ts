/**
 * Dashboard data access.
 *
 * Every request goes through the shared `src/api/client.ts` helpers (never
 * `fetch()` directly), per this phase's instructions. Nothing here invents
 * an endpoint that isn't in docs/contracts/ — see the doc comment on each
 * function for exactly which contract it follows, and INTEGRATION_REQUEST.md
 * for the two real gaps found while building this (no documented
 * `GET /reports/sales` response shape; no documented branch-list endpoint).
 *
 * Branch scoping: per docs/contracts/branch-context-contract.md, a CASHIER's
 * branch is implicit from their session and must never be sent by the
 * client. An OWNER has no bound branch and no documented way to select one
 * (no `GET /branches` endpoint exists) — see INTEGRATION_REQUEST.md — so
 * every call here omits `branch_id`, which the contract itself defines as
 * meaning "all branches visible to this requester." That is a deliberate
 * reading of a documented default, not an invented behavior.
 */

import { apiGet, apiGetList, apiPost } from "../../../api/client";
import { ApiError } from "../../../api/ApiError";
import type { InventoryItem, LocalizedString, Order, Notification } from "../../../../contracts/entities";
import type { OrderStatus } from "../../../../contracts/enums";
import type { OrderStatusCounts, SalesReportResponse } from "../types/dashboard";

function todayUtcRange(): { from: string; to: string; isoDate: string } {
  const now = new Date();
  const startOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const startOfNextDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
  return {
    from: startOfDay.toISOString(),
    to: startOfNextDay.toISOString(),
    isoDate: startOfDay.toISOString().slice(0, 10),
  };
}

/**
 * Count of orders matching a filter, using `GET /orders?...&page_size=1`
 * and reading `meta.total_count` — a documented, cheap way to get an exact
 * count (docs/contracts/api/api-contract.md's pagination `meta`) without
 * fetching every row. `status`, `type`, and `created_at_from`/`_to` are the
 * filters the API contract explicitly documents by example; nothing else
 * is assumed filterable.
 */
async function countOrders(filters: {
  status?: OrderStatus;
  type?: string;
  created_at_from?: string;
  created_at_to?: string;
}): Promise<number> {
  const result = await apiGetList<Order>("orders", {
    query: { ...filters, page_size: 1 },
  });
  return result.meta.total_count;
}

/**
 * Count of orders created today, per status — feeds both the "Order
 * Status Overview" section and the Pending/Completed/Cancelled KPI cards
 * from a single set of calls rather than fetching the same thing twice.
 *
 * ASSUMPTION (documented, not invented silently): "today" is scoped by
 * `created_at` in UTC calendar-day boundaries, since every ISODateTime in
 * the contracts is UTC and no business-day/timezone convention is
 * documented anywhere. A order created just before local midnight in a
 * timezone ahead of UTC could count toward a different "today" than a
 * cashier expects — see HANDOFF.md known limitations.
 */
export async function getOrderStatusCountsToday(): Promise<OrderStatusCounts> {
  const { from, to } = todayUtcRange();
  const statuses: OrderStatus[] = [
    "DRAFT",
    "PLACED",
    "PREPARING",
    "READY",
    "COMPLETED",
    "CANCELLED",
  ];

  const counts = await Promise.all(
    statuses.map((status) =>
      countOrders({ status, created_at_from: from, created_at_to: to }),
    ),
  );

  return statuses.reduce((acc, status, index) => {
    acc[status] = counts[index] ?? 0;
    return acc;
  }, {} as OrderStatusCounts);
}

/** Total orders created today, regardless of status. */
export async function getTodayOrdersCount(): Promise<number> {
  const { from, to } = todayUtcRange();
  return countOrders({ created_at_from: from, created_at_to: to });
}

/**
 * "Active delivery" orders: type DELIVERY, not yet completed/cancelled
 * (status READY — the only OrderStatus a delivery sits in while the
 * driver has it, per docs/contracts/order-lifecycle-contract.md and
 * delivery-contract.md), further narrowed to `delivery.status` ASSIGNED or
 * OUT. `delivery.status` is a nested field with no documented top-level
 * filter, so that narrowing happens client-side on the returned page —
 * see the accuracy caveat in the doc comment on `countActiveDeliveries`
 * below.
 */
export async function countActiveDeliveries(): Promise<{
  count: number;
  possiblyIncomplete: boolean;
}> {
  const result = await apiGetList<Order>("orders", {
    query: { type: "DELIVERY", status: "READY", page_size: 100 },
  });
  const activeCount = result.data.filter(
    (order) => order.delivery && (order.delivery.status === "ASSIGNED" || order.delivery.status === "OUT"),
  ).length;

  return {
    count: activeCount,
    // If there are more READY delivery orders than fit on one page, this
    // count only reflects the first page — flagged rather than silently
    // wrong, so the UI can say "at least N" instead of asserting exactness.
    possiblyIncomplete: result.meta.total_count > result.data.length,
  };
}

/** Most recent orders, newest first — for the Recent Orders section. */
export async function getRecentOrders(limit: number): Promise<Order[]> {
  const result = await apiGetList<Order>("orders", {
    query: { sort: "-created_at", page_size: limit },
  });
  return result.data;
}

/**
 * `GET /reports/sales` — docs/contracts/reporting-contract.md. Owner-only:
 * the contract states a CASHIER gets `403 FORBIDDEN_ROLE` on any
 * `/reports/*` endpoint, so callers must gate this behind the current
 * user's role and never call it for a CASHIER (see hooks/useSalesReport.ts).
 *
 * The response shape is an assumption — see types/dashboard.ts — validated
 * defensively here so a mismatched real backend produces a clean "couldn't
 * load" state rather than a runtime crash.
 */
export async function getSalesReport(
  period: "daily" | "weekly",
  isoDate: string,
): Promise<SalesReportResponse> {
  // /reports/sales returns a single aggregation object, not a paginated
  // list, so this follows api-contract.md's "single resource" success
  // envelope (`{ data: {...} }`) via `apiGet`, not `apiGetList`.
  const data = await apiGet<unknown>("reports/sales", {
    query: { period, date: isoDate },
  });
  if (!isSalesReportResponse(data)) {
    throw new Error("Unexpected /reports/sales response shape.");
  }
  return data;
}

function isSalesReportResponse(value: unknown): value is SalesReportResponse {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.total === "string" &&
    Array.isArray(v.points) &&
    v.points.every(
      (p) =>
        typeof p === "object" &&
        p !== null &&
        typeof (p as Record<string, unknown>).date === "string" &&
        typeof (p as Record<string, unknown>).total === "string",
    )
  );
}

/**
 * Low-stock inventory items. `GET /inventory-items` list per the generic
 * REST conventions in api-contract.md (verbs section) — `is_low_stock` is
 * already a derived field on each returned item
 * (frontend/contracts/entities.ts), so no separate "low stock" endpoint or
 * filter is assumed; this simply reads that field on the returned page.
 *
 * Same pagination caveat as `countActiveDeliveries`: only the first page
 * (max 100) is inspected.
 */
export async function getLowStockItems(): Promise<{
  items: Array<{ id: string; name: LocalizedString; currentQuantity: string; unit: string }>;
  possiblyIncomplete: boolean;
}> {
  const result = await apiGetList<InventoryItem>("inventory-items", {
    query: { page_size: 100 },
  });

  const lowStock = result.data.filter((item) => item.is_low_stock);

  return {
    items: lowStock.map((item) => ({
      id: item.id,
      name: item.name,
      currentQuantity: item.current_quantity,
      unit: item.unit,
    })),
    possiblyIncomplete: result.meta.total_count > result.data.length,
  };
}

/**
 * Unread operational notifications for the current branch —
 * `GET /notifications?is_read=false`, per notification-contract.md.
 */
export async function getUnreadNotifications(limit: number): Promise<Notification[]> {
  const result = await apiGetList<Notification>("notifications", {
    query: { is_read: false, page_size: limit },
  });
  return result.data;
}

/** `POST /notifications/{id}/actions/mark-read`, per notification-contract.md. */
export async function markNotificationRead(id: string): Promise<void> {
  await apiPost(`notifications/${id}/actions/mark-read`);
}

export { ApiError };
