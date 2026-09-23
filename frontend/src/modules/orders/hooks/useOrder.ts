import { getOrder } from "../services/ordersApi";
import { useAsyncData } from "./useAsyncData";

export function useOrder(orderId: string) {
  return useAsyncData(() => getOrder(orderId), [orderId]);
}
