import { listTicketsByStatus } from "../services/kitchenApi";
import { useAsyncData } from "./useAsyncData";
import { type KitchenBoardColumns } from "../types/kitchen";

async function fetchBoard(): Promise<KitchenBoardColumns> {
  const [received, preparing, ready] = await Promise.all([
    listTicketsByStatus("RECEIVED"),
    listTicketsByStatus("PREPARING"),
    listTicketsByStatus("READY"),
  ]);
  return { RECEIVED: received, PREPARING: preparing, READY: ready };
}

/**
 * Polling is intentionally NOT implemented — no realtime/polling
 * convention is documented for this endpoint. Staff use the page's own
 * manual retry (see pages/KitchenPage.tsx) rather than this frontend
 * inventing a polling interval that isn't specified anywhere.
 */
export function useKitchenBoard() {
  return useAsyncData(() => fetchBoard(), []);
}
