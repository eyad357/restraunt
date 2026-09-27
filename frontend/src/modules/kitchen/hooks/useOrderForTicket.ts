import { getOrderForTicket } from "../services/kitchenApi";
import { useAsyncData } from "./useAsyncData";

/**
 * Each ticket card fetches its own order independently, so one slow or
 * failing order lookup never blocks the rest of the board — same
 * per-section independence principle used throughout Dashboard/Orders.
 */
export function useOrderForTicket(orderId: string) {
  return useAsyncData(() => getOrderForTicket(orderId), [orderId]);
}
