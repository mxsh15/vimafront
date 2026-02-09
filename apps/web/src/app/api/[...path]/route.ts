import { NextRequest, NextResponse } from "next/server";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
]);

function forwardHeaders(upstream: Response) {
  const h = new Headers();
  for (const [k, v] of upstream.headers.entries()) {
    const key = k.toLowerCase();
    if (HOP_BY_HOP.has(key)) continue;
    // let Next set content-encoding, etc.
    h.set(k, v);
  }
  return h;
}

function jsonProblem(
  status: number,
  title: string,
  detail?: string,
  extra: Record<string, unknown> = {}
) {
  return new NextResponse(
    JSON.stringify({
      title,
      status,
      detail,
      ...extra,
    }),
    {
      status,
      headers: { "Content-Type": "application/problem+json" },
    }
  );
}

async function handler(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const params = await ctx.params;
  const base = (process.env.BACKEND_URL || "").replace(/\/+$/, "");
  if (!base) {
    return jsonProblem(500, "BACKEND_URL is not configured");
  }

  const pathSegments = params.path.join("/");
  const target = `${base}/${pathSegments}${req.nextUrl.search}`;

  // keep logs minimal (avoid leaking base url in production)
  if (process.env.NODE_ENV !== "production") {
    console.log(`[BFF] ${req.method} ${req.nextUrl.pathname} -> ${target}`);
  }

  try {
    const method = req.method;
    const body =
      method === "GET" || method === "HEAD"
        ? undefined
        : await req.arrayBuffer();

    const headers: HeadersInit = {
      Accept: "application/json",
    };

    const contentType = req.headers.get("content-type");
    if (contentType) {
      headers["Content-Type"] = contentType;
    }

    const authorization = req.headers.get("authorization");
    if (authorization) {
      headers["Authorization"] = authorization;
    } else {
      const cookieToken = req.cookies.get("auth_token")?.value;
      if (cookieToken) {
        headers["Authorization"] = `Bearer ${cookieToken}`;
      }
    }

    const ac = new AbortController();
    const timeoutMs = Number(process.env.BFF_TIMEOUT_MS || 30000);
    const timer = setTimeout(() => ac.abort(), timeoutMs);
    const upstream = await fetch(target, {
      method,
      headers,
      body: body ? Buffer.from(body) : undefined,
      cache: "no-store",
      signal: ac.signal,
    }).finally(() => clearTimeout(timer));

    // If backend returns 404, forward as-is (do not mask real 404s)

    const status = upstream.status;
    const headersOut = forwardHeaders(upstream);

    // ⚠️ نقطهٔ مهم: برای 204/304 اصلاً body نساز
    if (status === 204 || status === 304) return new NextResponse(null, { status, headers: headersOut });

    // بقیهٔ statusها: body رو پاس بده
    const buf = await upstream.arrayBuffer();
    return new NextResponse(buf, { status, headers: headersOut });
  } catch (err: any) {
    const msg = err?.name === "AbortError" ? "Upstream timeout" : (err?.message || "unknown error");
    if (process.env.NODE_ENV !== "production") {
      console.error(`[BFF] Error for ${target}:`, err);
    }
    return jsonProblem(502, "BFF fetch error", msg, { target, pathSegments });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
