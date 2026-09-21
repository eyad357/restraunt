import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, ApiTransportError } from "../../../api/ApiError";

export type AsyncStatus = "loading" | "success" | "error";

export interface AsyncDataResult<T> {
  status: AsyncStatus;
  data: T | null;
  error: ApiError | ApiTransportError | Error | null;
  retry: () => void;
}

/**
 * Runs `fetcher` on mount (and whenever `deps` changes), tracking
 * loading/success/error independently per call site — this is what lets
 * each dashboard section show its own state instead of one all-or-nothing
 * page-level spinner (per this phase's "no section blanks the whole page"
 * requirement).
 *
 * Not exported outside the dashboard module — this is module-local
 * plumbing, not a second shared data-fetching system; it sits on top of
 * the shared api/client.ts, it doesn't replace it.
 */
export function useAsyncData<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: unknown[],
): AsyncDataResult<T> {
  const [status, setStatus] = useState<AsyncStatus>("loading");
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | ApiTransportError | Error | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    setStatus("loading");
    setError(null);

    fetcherRef.current(controller.signal)
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setStatus("success");
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        setError(
          caught instanceof ApiError || caught instanceof ApiTransportError || caught instanceof Error
            ? caught
            : new Error("Unknown error"),
        );
        setStatus("error");
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, retryToken]);

  const retry = useCallback(() => setRetryToken((t) => t + 1), []);

  return { status, data, error, retry };
}
