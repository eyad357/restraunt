import { useCallback, useState } from "react";
import { ApiError, ApiTransportError } from "../../../api/ApiError";

export type MutationStatus = "idle" | "loading" | "error";

export function useMutation<Args extends unknown[], Result>(action: (...args: Args) => Promise<Result>) {
  const [status, setStatus] = useState<MutationStatus>("idle");
  const [error, setError] = useState<ApiError | ApiTransportError | Error | null>(null);

  const run = useCallback(
    async (...args: Args): Promise<Result | null> => {
      setStatus("loading");
      setError(null);
      try {
        const result = await action(...args);
        setStatus("idle");
        return result;
      } catch (caught) {
        setStatus("error");
        setError(
          caught instanceof ApiError || caught instanceof ApiTransportError || caught instanceof Error
            ? caught
            : new Error("Unexpected error"),
        );
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return { run, status, error, isLoading: status === "loading" };
}
