import type { User } from "../../../../contracts/entities";

/**
 * GAP IN docs/contracts/auth-contract.md — NOT invented here:
 *
 * The contract documents the login body as:
 *   `{ "user_id" or "username", "pin" }`
 *
 * literally as an "or", without settling which field name the backend
 * actually expects. This module picks `username` (a typed identifier is a
 * more natural login-form field than a UUID `user_id`, and the contract's
 * own wording lists it as an alternative), but this is a decision requiring
 * confirmation, not a resolved contract fact. If the backend ends up
 * expecting `user_id` instead, only this file and services/authApi.ts need
 * to change — nothing else in the module depends on the field name.
 */
export interface LoginRequest {
  username: string;
  pin: string;
}

/**
 * Per docs/contracts/auth-contract.md: "returns
 * `{ "access_token", "user": {...} }`". The `user` shape is assumed to be
 * the shared `User` entity (frontend/contracts/entities.ts) since no
 * separate "login response user" shape is documented anywhere.
 *
 * Per docs/contracts/api/api-contract.md ("Response envelope exceptions"),
 * `/auth/login` is exempt from the `{ data: ... }` success envelope, so this
 * is the literal top-level response body — see services/authApi.ts.
 */
export interface LoginResponse {
  access_token: string;
  user: User;
}
