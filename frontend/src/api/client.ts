/**
 * Shared API client boundary.
 *
 * Understands the Phase 00 conventions only (docs/contracts/api/api-contract.md,
 * docs/contracts/error-contract.md, docs/contracts/auth-contract.md):
 *  - `{ data }` / `{ data, meta }` success envelope
 *  - `{ error: { code, message, details } }` error envelope
 *  - `Authorization: Bearer <jwt>` header when a token is present
 *  - configurable base URL (see src/config/env.ts)
 *
 * It does NOT define any endpoint paths, request/response shapes for a
 * specific resource, or mock data — those belong to the owning module once
 * the backend exists (see docs/contracts/api/api-contract.md for the naming
 * convention modules should follow when they add endpoints).
 */

import type { ApiErrorBody, ApiListSuccess, ApiSuccess } from "../../contracts/api";
import { env } from "../config/env";
import { tokenStorage } from "../auth/tokenStorage";
import { ApiError, ApiTransportError } from "./ApiError";

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  /** JSON-serializable request body. Money fields must already be strings —
   * see docs/contracts/money-contract.md. */
  body?: unknown;
  /** Extra query params, merged onto the URL. */
  query?: Record<string, string | number | boolean | undefined>;
  /** For write endpoints that support safe retry — see
   * docs/contracts/offline-readiness-contract.md. */
  idempotencyKey?: string;
  /** Owner-session branch context for write endpoints — see
   * docs/contracts/branch-context-contract.md. Ignored for CASHIER sessions
   * server-side, but the client still only sets it when explicitly passed. */
  branchId?: string;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(
    `${env.apiBaseUrl}/${path.replace(/^\/+/, "")}`,
    // Base is only needed for relative apiBaseUrl values (e.g. "/api/v1")
    // when running in a browser; URL requires an absolute base in that case.
    typeof window !== "undefined" ? window.location.origin : undefined,
  );
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, idempotencyKey, branchId, signal } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = tokenStorage.get();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }
  if (branchId) {
    headers["X-Branch-Id"] = branchId;
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch {
    throw new ApiTransportError(0, "Network request failed before reaching the server.");
  }

  const rawText = await response.text();
  let parsed: unknown = undefined;
  if (rawText) {
    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new ApiTransportError(
        response.status,
        "Response body was not valid JSON.",
      );
    }
  }

  if (!response.ok) {
    if (isApiErrorBody(parsed)) {
      throw new ApiError(response.status, parsed);
    }
    throw new ApiTransportError(
      response.status,
      `Request failed with status ${response.status} and no documented error body.`,
    );
  }

  return parsed as T;
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as ApiErrorBody).error === "object"
  );
}

/**
 * Fetch a single-resource endpoint and unwrap the `{ data }` envelope.
 */
export async function apiGet<T>(path: string, options?: RequestOptions): Promise<T> {
  const result = await request<ApiSuccess<T>>(path, { ...options, method: "GET" });
  return result.data;
}

/**
 * Fetch a list endpoint and return both `data` and pagination `meta`
 * (docs/contracts/api/api-contract.md) rather than silently discarding it.
 */
export async function apiGetList<T>(
  path: string,
  options?: RequestOptions,
): Promise<ApiListSuccess<T>> {
  return request<ApiListSuccess<T>>(path, { ...options, method: "GET" });
}

export async function apiPost<T>(path: string, options?: RequestOptions): Promise<T> {
  const result = await request<ApiSuccess<T>>(path, { ...options, method: "POST" });
  return result.data;
}

export async function apiPatch<T>(path: string, options?: RequestOptions): Promise<T> {
  const result = await request<ApiSuccess<T>>(path, { ...options, method: "PATCH" });
  return result.data;
}

export async function apiDelete<T>(path: string, options?: RequestOptions): Promise<T> {
  const result = await request<ApiSuccess<T>>(path, { ...options, method: "DELETE" });
  return result.data;
}
