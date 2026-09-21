import { useCallback, useState } from "react";
import { getUnreadNotifications, markNotificationRead } from "../services/dashboardApi";
import { useAsyncData } from "./useAsyncData";
import type { DashboardAlert } from "../types/dashboard";
import type { Notification } from "../../../../contracts/entities";

/**
 * Converts a raw `Notification` (frontend/contracts/entities.ts) into the
 * UI-local `DashboardAlert` shape, defensively — `payload` is typed
 * `Record<string, unknown>` in the contract, so this checks the exact
 * fields docs/contracts/notification-contract.md documents per type
 * (`ORDER_READY: { order_id }`, `LOW_STOCK: { inventory_item_id,
 * current_quantity }`) before trusting them. A notification whose payload
 * doesn't match is skipped rather than rendered with missing/garbled data.
 */
function toAlert(notification: Notification): DashboardAlert | null {
  const payload = notification.payload;
  if (notification.type === "ORDER_READY") {
    const orderId = payload.order_id;
    if (typeof orderId !== "string") return null;
    return {
      id: notification.id,
      kind: "ORDER_READY",
      orderId,
      createdAt: notification.created_at,
    };
  }
  if (notification.type === "LOW_STOCK") {
    const inventoryItemId = payload.inventory_item_id;
    const currentQuantity = payload.current_quantity;
    if (typeof inventoryItemId !== "string") return null;
    return {
      id: notification.id,
      kind: "LOW_STOCK",
      inventoryItemId,
      currentQuantity: String(currentQuantity ?? ""),
      createdAt: notification.created_at,
    };
  }
  return null;
}

export function useAlerts(limit = 10) {
  const result = useAsyncData(
    () =>
      getUnreadNotifications(limit).then((list) =>
        list.map(toAlert).filter((a): a is DashboardAlert => a !== null),
      ),
    [limit],
  );
  const [dismissing, setDismissing] = useState<Set<string>>(new Set());

  const dismiss = useCallback(async (id: string) => {
    setDismissing((prev) => new Set(prev).add(id));
    try {
      await markNotificationRead(id);
      result.retry();
    } finally {
      setDismissing((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
    // result.retry is stable across renders (useCallback in useAsyncData).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...result, dismiss, dismissingIds: dismissing };
}
