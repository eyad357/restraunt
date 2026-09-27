# HANDOFF.md

## Phase
P1-FE-06 — Kitchen Frontend Module

## Owner
Person 1

## Module
Kitchen (`frontend/src/modules/kitchen/`)

## Branch
`person1/frontend`

## Implemented

A live Kitchen operational board at `/kitchen` (protected route), built
entirely on the frozen foundation/auth work. Unlike Menu (P1-FE-05),
Kitchen has a fully documented, real API
(`docs/contracts/kitchen-contract.md`), so this module ships as a
genuinely functional board against a real backend once one exists — not
an honest-unavailable placeholder.

- **Three live columns** — Received, Preparing, Ready — using the exact
  `KitchenStatus` values from `frontend/contracts/enums.ts`. COMPLETED
  tickets are excluded from the active board by design (the contract's
  own "live kitchen board" framing).
- **Each ticket card** independently fetches its own order (a
  `KitchenTicket` only carries `order_id`, not items/notes/modifiers),
  so one slow or failing lookup never blocks the rest of the board.
  Cards show order type/source, items with modifiers and item notes,
  order-level notes, and received time.
- **Column-appropriate action** per card: Start preparing / Mark ready /
  Complete, each with its own submitting/disabled state.
- **Delivery completion gate**: for a DELIVERY order not yet
  `DeliveryInfo.status = DELIVERED`, the Complete button is disabled
  with a clear explanatory note, exactly matching
  `order-lifecycle-contract.md`'s documented rule — verified in QA to
  both block the gated case and allow a non-delivery order through.
- No polling/realtime — none is documented for this endpoint; staff use
  the board's own manual retry.

## Files added/modified

**New** (all under `frontend/src/modules/kitchen/`):
```
index.ts
types/kitchen.ts
services/kitchenApi.ts
hooks/{useAsyncData,useMutation,useKitchenBoard,useOrderForTicket,
       useTicketActions,useKitchenTranslation}.ts
translations/{en,ar}.ts
components/{SectionState,KitchenColumn,KitchenTicketCard}.tsx
pages/{KitchenPage.tsx,kitchen.css}
```

**Modified:**
- `frontend/src/modules/kitchen/routes.tsx` — real route registration
  (was an empty skeleton).
- `INTEGRATION_REQUEST.md` — extended with one new item (19).

No `backend/`, `docs/`, `frontend/contracts/`, Orders, Dashboard, Menu,
Auth, Kitchen/Cashier/Inventory/Delivery/Expenses/Reports/Settings
(Person 2) module, or shared foundation file (bootstrap, router, API
client, AuthContext, ProtectedRoute, LocaleContext, shared UI
primitives, global theme, environment config, money utility) was
touched.

## Dependencies

None added.

## Contract dependencies

- `docs/contracts/kitchen-contract.md` — `GET /kitchen-tickets`, the
  three ticket actions, the live-board framing, the delivery completion
  gate.
- `docs/contracts/order-lifecycle-contract.md` — confirms the
  `READY → COMPLETED` delivery gate for `DELIVERY` orders.
- `docs/contracts/branch-context-contract.md` — branch-omission
  convention (no header/param sent).
- `frontend/contracts/entities.ts` — `KitchenTicket`, `Order`,
  `OrderItem`, `OrderItemModifier`, `DeliveryInfo` shapes, imported
  as-is.
- `frontend/contracts/enums.ts` — `KitchenStatus`, `OrderType`,
  `OrderSource`, `DeliveryStatus`.

## API assumptions (see `INTEGRATION_REQUEST.md` item 19)

The exact response shape of the three ticket action endpoints
(`start`/`ready`/`complete`) is not explicitly spelled out in
`kitchen-contract.md`. This module assumes the same resource-action
convention already established for Orders and Menu: the action returns
the updated `KitchenTicket` in the standard `{ data }` envelope. If
wrong, only the three action functions in `services/kitchenApi.ts` need
to change.

`KitchenTicket` carries only `order_id` — this module reads the
referenced order via the already-documented `GET /orders/{id}` per
ticket rather than inventing an "expanded ticket" response shape, per
the contract's own description of the kitchen view as a projection of
Order/OrderItem data.

## Known limitations

- **No real backend exists.** All QA used a throwaway, non-shipped mock
  server matching the documented contract shapes — actual production
  API integration is untested by construction.
- No polling/auto-refresh — the board only updates on load, an action's
  own success, or a manual retry after an error. If a real-time
  convention (websocket, SSE, polling interval) is documented later,
  this can be added without changing the board's data-fetching
  structure.
- No session rehydration on page reload (a P1-FE-02 limitation,
  unchanged).
- Product IDs are shown as truncated UUID fragments in item lists (same
  documented gap as Orders — `OrderItem` has no product/variant display
  name in the canonical contract).

## Validation

| Command | Result |
|---|---|
| `npx tsc -b` (strict) | ✅ clean, no output |
| `npm run build` | ✅ succeeds — 149 modules transformed |
| `npm run lint` (oxlint) | ✅ 0 errors; same 3 pre-existing foundation warnings, none new |

**Interactive/visual QA** (Playwright, headless Chromium, against a
throwaway mock backend — not part of this archive or the repo):

- Unauthenticated `/kitchen` → redirects to `/login`; successful login
  correctly returns to `/kitchen`.
- Full ticket lifecycle exercised end-to-end: Start → Mark ready →
  Complete, with the ticket correctly disappearing from the board once
  completed (COMPLETED isn't part of the active board).
- Delivery gate verified both ways: a DELIVERY order not yet delivered
  shows a disabled Complete button with the explanatory note; a
  non-delivery READY order's Complete button is enabled and works.
- Arabic (RTL, default) and English (LTR) both verified — correct
  `dir`/`lang`, correct labels, no mixed-language strings; columns
  render in a consistent Received → Preparing → Ready flow in both
  languages (a deliberate kanban-style choice — stage progression is a
  spatial convention independent of text direction, not something RTL
  needs to mirror).
- Zero console/page errors throughout.
- No horizontal overflow at 1280px or a narrower 850px desktop width.

## Commit

`1b2b62c` — "feat(frontend): implement restaurant kitchen" — on branch
`person1/frontend`. Not merged into `main`.

Builds on: `8c4d158` (P1-FE-01A foundation), `52e2076` (P1-FE-02 auth),
`01b8d56` (P1-FE-03 dashboard), `4e8991e` (P1-FE-04 orders), `2c62f32`
(P1-FE-05 menu).

## Person 2 files modified

NO
