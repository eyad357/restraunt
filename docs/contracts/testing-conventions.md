# Testing Conventions

Status: STABLE (Phase 00)
Owner: Shared

## Backend (FastAPI / Python)

- Framework: `pytest`.
- Contract tests: for each enum in `enums.md`, a test asserts the Python enum
  (`backend/contracts/enums.py`) values match the canonical list exactly — this is
  the automated guard against the two language files drifting from the markdown
  source of truth.
- Every lifecycle contract (order, payment, shift, kitchen, delivery) gets a state-
  machine test asserting only the documented transitions are accepted and every
  other transition returns `INVALID_TRANSITION` (see error-contract.md).
- Money math (order totals, modifier deltas, shift reconciliation) is tested with
  `Decimal` fixtures, never `float`, and includes at least one rounding-edge-case
  test per calculation (see money-contract.md).
- Branch-scoping tests: for every branch-scoped endpoint, a test asserts a
  `CASHIER` from Branch A cannot read/write Branch B's data (404, not leaking
  existence — see error-contract.md).

## Frontend (React / TypeScript)

- Framework: whatever the existing Phase A/B project already uses if this repo has
  prior frontend work (inspect before assuming) — otherwise Vitest + React Testing
  Library as the Phase 00 recommendation.
- Shared TypeScript contract types (`frontend/contracts/*.ts`) are exercised by
  compile-time type tests (no `any` leakage) rather than runtime tests, since
  they're pure type definitions with no logic.
- Money formatting utilities (`formatMoney`/`parseMoney`, per money-contract.md)
  get dedicated unit tests, since a bug there is a financial bug.

## Cross-cutting

- Every new error code added to `error-contract.md` needs at least one test that
  triggers it, so the registry never accumulates codes nothing actually returns.
- CI runs backend and frontend test suites independently — Person 1 and Person 2's
  suites must not depend on each other's fixtures, matching the module-ownership
  independence goal (see ownership-map.md).
