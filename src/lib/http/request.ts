import type { ProblemDetails } from "./problem-details";
import { ApiError } from "./api-error";

export type ApiResponse<T> = {
  data: T;
  status: number;
  headers: Headers;
};

function isJsonContentType(ct: string | null | undefined) {
  return !!ct && ct.toLowerCase().includes("application/json");
}

async function safeReadText(res: Response) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

async function parsePossiblyJson<T>(res: Response): Promise<T> {
  // 204/304 must not parse a body
  if (res.status === 204 || res.status === 304) return undefined as T;

  const ct = res.headers.get("content-type");
  if (isJsonContentType(ct)) {
    // If body is empty, treat as undefined
    const txt = await safeReadText(res);
    if (!txt) return undefined as T;
    return JSON.parse(txt) as T;
  }

  return (await safeReadText(res)) as unknown as T;
}

async function parseProblemDetails(res: Response): Promise<{
  problem?: ProblemDetails;
  rawBody?: string;
}> {
  const ct = res.headers.get("content-type");
  const rawBody = await safeReadText(res);

  if (isJsonContentType(ct) && rawBody) {
    try {
      const j = JSON.parse(rawBody);
      // very loose check for RFC7807-ish
      if (
        typeof j === "object" &&
        j &&
        ("title" in j || "detail" in j || "status" in j || "errors" in j)
      ) {
        return { problem: j as ProblemDetails, rawBody };
      }
    } catch {
      // ignore
    }
  }

  return { rawBody };
}

export async function apiRequest<T>(url: string, init: RequestInit & { timeoutMs?: number } = {}) {
  const { timeoutMs = 30_000, ...rest } = init;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...rest, signal: rest.signal ?? ac.signal });

    if (!res.ok) {
      const { problem, rawBody } = await parseProblemDetails(res);
      const msg =
        problem?.detail ||
        problem?.title ||
        rawBody?.slice(0, 500) ||
        `API ${res.status} ${res.statusText}`;
      console.error("API ERROR", res.status, res.statusText, url, rawBody);
      throw new ApiError({
        message: msg,
        status: res.status,
        url,
        problem,
        rawBody,
        headers: res.headers,
      });
    }

    const data = await parsePossiblyJson<T>(res);
    return { data, status: res.status, headers: res.headers } as ApiResponse<T>;
  } catch (e: any) {
    if (e?.name === "AbortError") {
      throw new ApiError({
        message: `Request timeout after ${timeoutMs}ms`,
        status: 408,
        url,
      });
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
