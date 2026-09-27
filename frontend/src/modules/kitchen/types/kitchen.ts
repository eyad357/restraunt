import type { KitchenTicket } from "../../../../contracts/entities";
import type { KitchenStatus } from "../../../../contracts/enums";

/**
 * Board columns — exactly the live-queue states per
 * docs/contracts/kitchen-contract.md ("the live kitchen board view").
 * COMPLETED tickets are deliberately excluded from the active board (they
 * are done; the board only helps staff act on tickets that still need
 * something). No new status is introduced — these are the exact
 * `KitchenStatus` values.
 */
export const KITCHEN_BOARD_STATUSES = ["RECEIVED", "PREPARING", "READY"] as const satisfies readonly KitchenStatus[];

export type KitchenBoardColumns = Record<(typeof KITCHEN_BOARD_STATUSES)[number], KitchenTicket[]>;

/**
 * ASSUMPTION, not a confirmed contract fact — see INTEGRATION_REQUEST.md:
 * kitchen-contract.md confirms the three action endpoints exist
 * (`POST /kitchen-tickets/{id}/actions/{start|ready|complete}`) but does
 * not state their response shape. Following the same resource-action
 * convention already established for Orders (P1-FE-04) — an action
 * returns the updated resource wrapped in the standard `{ data }`
 * envelope — this assumes the response is the updated `KitchenTicket`.
 */
export type KitchenActionResponse = KitchenTicket;
