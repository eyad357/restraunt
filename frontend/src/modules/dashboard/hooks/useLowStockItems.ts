import { getLowStockItems } from "../services/dashboardApi";
import { useAsyncData } from "./useAsyncData";

export function useLowStockItems() {
  return useAsyncData(() => getLowStockItems(), []);
}
