import { getTodayOrdersCount } from "../services/dashboardApi";
import { useAsyncData } from "./useAsyncData";

export function useTodayOrdersCount() {
  return useAsyncData(() => getTodayOrdersCount(), []);
}
