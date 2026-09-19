# API Contract

Status: STABLE (Phase 00)
Owner: Shared

## Versioning & base URL

All endpoints are under `/api/v1/`. Breaking changes require `/api/v2/`; additive
fields never bump the version.

## Naming

- Resource paths: plural, kebab-free lowercase nouns — `/orders`, `/inventory-items`,
  `/cashier-shifts`.
- Nested resources only where the child cannot exist without the parent in the URL
  sense of access control, e.g. `/orders/{order_id}/payments`. Otherwise flat with a
  filter query param, e.g. `/order-items?order_id=...` is **not** used — OrderItems
  are always accessed via their parent Order (`/orders/{id}` returns items inline;
  there is no standalone OrderItem list endpoint).
- HTTP verbs map conventionally: `GET` list/read, `POST` create, `PATCH` partial
  update, `POST /{id}/actions/{action}` for state-transition actions (e.g.
  `POST /orders/{id}/actions/cancel`, `POST /cashier-shifts/{id}/actions/close`).
  Status-machine transitions are actions, not raw `PATCH status=...`, so the backend
  can validate the transition and the audit log can record a meaningful action name.

## Request format

- `Content-Type: application/json` for all bodies.
- Money values are transmitted as **strings** (e.g. `"45.50"`), never JSON numbers,
  to avoid floating-point round-tripping through JS. Backend parses to `Decimal`.
- Timestamps: ISO-8601 UTC with `Z` suffix.

## Response format

Success (single resource):

```json
{
  "data": { "...": "resource fields" }
}
```

Success (list):

```json
{
  "data": [ { "...": "resource" } ],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total_count": 143,
    "total_pages": 8
  }
}
```

## Pagination

- Cursor pagination is **not** used in MVP (adds complexity not justified yet).
  Standard offset pagination via query params: `?page=1&page_size=20`.
- `page_size` default 20, max 100. Requests above max are clamped, not rejected.
- Every list endpoint returns `meta` as shown above, even if the list fits on one
  page.

## Filtering & sorting

- Filters are plain query params matching field names: `?status=PLACED&branch_id=...`.
- Date-range filters use `_from` / `_to` suffixes: `?created_at_from=...&created_at_to=...`.
- Sorting: `?sort=created_at` (ascending) or `?sort=-created_at` (descending, `-`
  prefix). Default sort is documented per-endpoint; when unspecified, newest first
  (`-created_at`).
- Only fields explicitly documented as filterable/sortable per endpoint are
  supported; undocumented filter params are ignored rather than erroring, to keep
  clients forward-compatible.

## Error format

```json
{
  "error": {
    "code": "ORDER_ALREADY_COMPLETED",
    "message": "Human-readable, safe to display",
    "details": { "order_id": "..." }
  }
}
```

- `code`: `UPPER_SNAKE_CASE`, stable, machine-matchable — frontend switches on this,
  never on `message` text.
- `message`: written for end users where possible; Arabic/English selection follows
  `Accept-Language` (see localization-contract.md) — the server localizes `message`,
  the frontend never has to.
- HTTP status still carries the general category (400/401/403/404/409/422/500);
  `code` carries the specific reason.
- Validation errors (422) put per-field problems in `details.fields`:
  `{"fields": {"quantity": "must be >= 1"}}`.

## Authentication headers & session behavior

See `auth-contract.md` for the full flow. Summary for API conventions:

- `Authorization: Bearer <jwt>` on every authenticated request.
- 401 → token missing/invalid/expired. 403 → valid token, insufficient role or
  wrong branch.

## Branch context

- Every request that touches branch-scoped data must resolve a branch. For
  `CASHIER` users this is implicit (their session is bound to one branch — see
  branch-context-contract.md) and **must not** be overridable by a request param.
- For `OWNER` users (who can act across branches), branch is explicit:
  `X-Branch-Id` header for actions, `?branch_id=` for GET list filters. Omitting it
  on a GET list means "all branches the owner can see"; omitting it on a
  branch-scoped POST is a 422.

## Idempotency

- State-changing endpoints that are unsafe to double-submit (`POST /orders`,
  `POST /orders/{id}/payments`, `POST /cashier-shifts/{id}/actions/close`) accept an
  `Idempotency-Key` header (client-generated UUID). The server stores the key with
  the resulting response for 24h; a repeated key returns the original response
  instead of creating a duplicate. This is the same mechanism the offline-readiness
  contract relies on for safe retry after reconnect — see
  `offline-readiness-contract.md`.

## Response envelope exceptions

- `GET /health` and authentication endpoints (`/auth/login`) are exempt from the
  `{data: ...}` envelope for simplicity, since they aren't resource reads.
