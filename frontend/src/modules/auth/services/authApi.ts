/**
 * Login request.
 *
 * This intentionally does NOT go through `src/api/client.ts`'s
 * apiGet/apiPost/etc. helpers: those unwrap the `{ data: ... }` success
 * envelope, but docs/contracts/api/api-contract.md explicitly lists
 * `/auth/login` as exempt from that envelope ("Response envelope
 * exceptions"). Using the enveloped helpers here would silently break the
 * moment a real backend returns the documented `{ access_token, user }`
 * shape directly. This is not a duplication of the shared client's job
 * (parsing the general envelope) — it's handling the one endpoint the
 * contract says is different.
 *
 * The error format is NOT exempt (error-contract.md doesn't carve out
 * `/auth/login`), so error handling reuses the shared `ApiError` /
 * `ApiTransportError` types for consistency with the rest of the app.
 *
 * KNOWN GAP, not fixed here: `src/api/client.ts` does not currently send
 * an `Accept-Language` header on any request, even though
 * docs/contracts/localization-contract.md says the server uses it to
 * localize `message`/notification/receipt text. This file sets it locally
 * for the login call only. The same gap likely affects every other future
 * module's API calls — flagged for an integration request against the
 * shared client rather than silently patched here.
 */

import type { ApiErrorBody } from "../../../../contracts/api";
import type { Locale } from "../../../../contracts/enums";
import { env } from "../../../config/env";
import { ApiError, ApiTransportError } from "../../../api/ApiError";
import type { LoginRequest, LoginResponse } from "../types/auth";

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as ApiErrorBody).error === "object"
  );
}

export async function login(
  payload: LoginRequest,
  locale: Locale,
  signal?: AbortSignal,
): Promise<LoginResponse> {
  const url = new URL(
    `${env.apiBaseUrl}/auth/login`,
    typeof window !== "undefined" ? window.location.origin : undefined,
  );

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": locale,
      },
      // PIN is sent once, over the wire, to the documented login endpoint —
      // never logged, never persisted (see tokenStorage.ts for what IS
      // persisted: the resulting access token, not the credential).
      body: JSON.stringify(payload),
      signal,
    });
  } catch {
    throw new ApiTransportError(0, "Network request failed before reaching the server.");
  }

  const rawText = await response.text();
  let parsed: unknown;
  if (rawText) {
    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new ApiTransportError(response.status, "Response body was not valid JSON.");
    }
  }

  if (!response.ok) {
    if (isApiErrorBody(parsed)) {
      throw new ApiError(response.status, parsed);
    }
    throw new ApiTransportError(
      response.status,
      `Login failed with status ${response.status} and no documented error body.`,
    );
  }

  return parsed as LoginResponse;
}
