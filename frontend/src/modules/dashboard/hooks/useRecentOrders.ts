import { getRecentOrders } from "../services/dashboardApi";
import { useAsyncData } from "./useAsyncData";

export function useRecentOrders(limit = 8) {
  return useAsyncData(() => getRecentOrders(limit), [limit]);
}
