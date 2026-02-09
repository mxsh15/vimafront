import { NextRequest, NextResponse } from "next/server";

function getCookieValue(cookieHeader: string, name: string) {
  const parts = cookieHeader.split(";").map((p) => p.trim());
  const hit = parts.find((p) => p.startsWith(name + "="));
  if (!hit) return null;
  return decodeURIComponent(hit.substring(name.length + 1));
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
  const base = (process.env.BACKEND_URL || "").replace(/\/+$/, "");
  if (!base) {
    return NextResponse.json(
      { error: "BACKEND_URL is not configured" },
      { status: 500 }
    );
  }

  const id =
    "then" in (ctx as any).params
      ? (await (ctx as any).params).id
      : (ctx as any).params.id;

  const target = `${base}/orders/${encodeURIComponent(id)}`;

  const headers: HeadersInit = { Accept: "application/json" };

  const cookieHeader = req.headers.get("cookie") || "";
  const token = getCookieValue(cookieHeader, "auth_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const upstream = await fetch(target, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const contentType =
    upstream.headers.get("content-type") || "application/json";
  const buf = await upstream.arrayBuffer();

  return new NextResponse(buf, {
    status: upstream.status,
    headers: { "Content-Type": contentType },
  });
}
