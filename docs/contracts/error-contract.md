# Error Contract

Status: STABLE (Phase 00)
Owner: Shared

See `api/api-contract.md` for the wire shape. This file is the registry of known
error codes so both developers use the same vocabulary instead of inventing ad-hoc
strings per endpoint.

## HTTP status → meaning

| Status | Meaning                                                |
|--------|------------------------------------------------------------|
| 400    | Malformed request (bad JSON, wrong type)                    |
| 401    | Missing/invalid/expired auth token                           |
| 403    | Authenticated but not authorized (wrong role or branch)     |
| 404    | Resource does not exist (or is outside the caller's branch scope, to avoid leaking existence across branches — a `CASHIER` requesting another branch's order gets 404, not 403) |
| 409    | Conflict with current state (double-open shift, etc.)       |
| 422    | Semantically invalid (fails a business rule, not just types)|
| 500    | Unhandled server error                                       |

## Known error codes (grows over time; Phase 00 seeds it)

| Code                     | Status | Meaning                                      |
|--------------------------|--------|------------------------------------------------|
| `VALIDATION_ERROR`       | 422    | Generic field validation failure; see `details.fields` |
| `FORBIDDEN_ROLE`         | 403    | Role lacks permission for this action           |
| `FORBIDDEN_BRANCH`       | 403    | Wrong branch for this actor                     |
| `BRANCH_MISMATCH`        | 422    | Cross-branch relationship attempted             |
| `SHIFT_ALREADY_OPEN`     | 409    | Cashier already has an open/active shift        |
| `OVERPAYMENT`            | 422    | Payment total would exceed order total          |
| `ORDER_ALREADY_COMPLETED`| 409    | Action invalid on a completed order             |
| `INVALID_TRANSITION`     | 409    | Status transition not allowed from current state|
| `IDEMPOTENCY_KEY_REUSED` | 200*   | Not really an error — original response is replayed; documented here since clients must know this is expected, not a bug |

## Rules

- New codes are added here in the same PR that introduces the endpoint using them
  — no undocumented codes ship.
- Codes are never renamed once shipped (frontend may switch on them); deprecate by
  ceasing to issue and noting `DEPRECATED` next to the entry.
