import type { ProblemDetails } from "@/lib/http/problem-details";
import { ApiError } from "@/lib/http/api-error";

type OpenApiResult<T> = { data?: T; error?: any; response: Response };

// Helper to normalize openapi-fetch's result into our ApiError
export async function unwrap<T>(p: Promise<OpenApiResult<T>>): Promise<T> {
  const { data, error, response } = await p;

  if (response.ok) return data as T;

  const status = response.status;
  let problem: ProblemDetails | undefined;
  try {
    if (error && typeof error === "object") {
      problem = error as ProblemDetails;
    }
  } catch {
    // ignore
  }

  throw new ApiError({
    message:
      (problem?.detail as string) ||
      (problem?.title as string) ||
      `API ${status} ${response.statusText}`,
    status,
    url: response.url,
    problem,
    headers: response.headers,
  });
}
