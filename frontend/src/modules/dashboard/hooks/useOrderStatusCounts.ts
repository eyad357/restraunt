import { getOrderStatusCountsToday } from "../services/dashboardApi";
import { useAsyncData } from "./useAsyncData";

/**
 * Fetches today's order count per status ONCE and is shared by both the
 * "Order Status Overview" section and the Pending/Completed/Cancelled KPI
 * cards, so the page doesn't issue the same six count queries twice.
 */
export function useOrderStatusCounts() {
  return useAsyncData(() => getOrderStatusCountsToday(), []);
}
