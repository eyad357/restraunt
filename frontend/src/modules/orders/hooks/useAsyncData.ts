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
 * Same pattern as modules/dashboard/hooks/useAsyncData.ts — duplicated
 * here rather than imported cross-module, since each module is meant to
 * be self-contained (see modules/dashboard/README-equivalent convention
 * in modules/README.md) and this is module-local plumbing, not shared
 * foundation.
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
