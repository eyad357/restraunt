import { countActiveDeliveries } from "../services/dashboardApi";
import { useAsyncData } from "./useAsyncData";

export function useActiveDeliveries() {
  return useAsyncData(() => countActiveDeliveries(), []);
}
