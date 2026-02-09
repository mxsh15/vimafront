"use client";

import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationResult,
} from "@tanstack/react-query";
import { ApiError } from "@/lib/http/api-error";

type Opts<TVars, TResult> = {
  action: (vars: TVars) => Promise<TResult>;
  invalidate?: QueryKey[];
  onSuccess?: (res: TResult, vars: TVars) => void;
  onError?: (err: unknown) => void;
};

export function useServerActionMutation<TVars, TResult>(
  opts: Opts<TVars, TResult>
): UseMutationResult<TResult, unknown, TVars, unknown> {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: opts.action,
    onSuccess: (res, vars) => {
      if (opts.invalidate?.length) {
        for (const key of opts.invalidate) {
          qc.invalidateQueries({ queryKey: key });
        }
      }
      opts.onSuccess?.(res, vars);
    },
    onError: (err) => {
      // متمرکز و قابل توسعه
      if (err instanceof ApiError) {
        console.error("API Error:", err.status, err.message, err.problem);
      } else {
        console.error("Unknown error:", err);
      }
      opts.onError?.(err);
    },
  });
}
