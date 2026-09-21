import type { ApiErrorBody } from "../../contracts/api";

/**
 * Thrown by the API client for any non-2xx response that returned the
 * documented `{ error: { code, message, details } }` envelope
 * (see docs/contracts/error-contract.md).
 *
 * Callers should switch on `.code`, never on `.message` (the message is
 * server-localized display text — see docs/contracts/api/api-contract.md).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: ApiErrorBody["error"]["details"];

  constructor(status: number, body: ApiErrorBody) {
    super(body.error.message);
    this.name = "ApiError";
    this.status = status;
    this.code = body.error.code;
    this.details = body.error.details;
  }
}

/**
 * Thrown when a non-2xx response could not be parsed into the documented
 * error envelope at all (e.g. a proxy/502 returning HTML). Kept distinct
 * from `ApiError` so callers can tell "the backend told us something went
 * wrong" apart from "something went wrong before the backend could answer".
 */
export class ApiTransportError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiTransportError";
    this.status = status;
  }
}
