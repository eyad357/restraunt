# Authentication & Session Contract

Status: STABLE (Phase 00)
Owner: Shared (implementation: Person 1)

## Actors

- `OWNER` — full access, all branches.
- `CASHIER` — branch-scoped, bound to exactly one branch per session.
- Drivers are **not** authenticated users (brief, "Authentication" section). They
  are represented only as free-text `driver_name` on `DeliveryInfo`. No login, no
  password/PIN, no role.

## Credential model

- Login is by PIN, not password (register/POS convention). PINs are numeric,
  minimum 4 digits (recommendation, confirm with product before launch).
- Storage: PINs are hashed with a slow hash (bcrypt or argon2 — implementation
  detail for Person 1, but must never be reversible and never logged, including in
  audit metadata).
- `POST /api/v1/auth/login` — body `{ "user_id" or "username", "pin" }` → returns
  `{ "access_token", "user": {...} }`.

## Session / token

- JWT, `Authorization: Bearer <token>` header on every subsequent request.
- Claims include: `sub` (user id), `role`, `branch_id` (null for OWNER),
  `exp`.
- Token lifetime: short-lived access token (recommendation: 12h, matching a work
  shift) with no refresh-token flow in MVP — re-login at shift start is acceptable
  for a POS terminal. **Decision requiring confirmation**: whether a refresh token
  is needed for unattended kiosk terminals; flagged as extensible, not built now.
- Logout is client-side token discard; there is no server-side token blacklist in
  MVP (stateless JWT). If forced logout is needed later, this contract extends with
  a token-version claim without breaking existing clients.

## Authorization

- Role check: `OWNER` can access everything. `CASHIER` can access only
  cashier-appropriate endpoints (orders, payments, own shift, kitchen view) within
  their bound branch.
- Branch check: for `CASHIER`, `branch_id` from the JWT is enforced server-side on
  every branch-scoped query — never trusted from client input. See
  `branch-context-contract.md`.
- Authorization failures return `403` with `code: "FORBIDDEN_ROLE"` or
  `"FORBIDDEN_BRANCH"` so the frontend can show a precise message.

## Audit

Every successful login produces an `AuditLogEntry` with `action = LOGIN`. Failed
login attempts are **not** written to the audit log in MVP (would need separate
rate-limiting/security-log concerns out of scope for Phase 00); flagged as a
decision requiring confirmation if security requirements need it later.
