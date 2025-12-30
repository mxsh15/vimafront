import { NextRequest, NextResponse } from "next/server";

function getCookieValue(cookieHeader: string, name: string) {
  const parts = cookieHeader.split(";").map((p) => p.trim());
  const hit = parts.find((p) => p.startsWith(name + "="));
  if (!hit) return null;
  return decodeURIComponent(hit.substring(name.length + 1));
}

export async function POST(req: NextRequest) {
  const base = (process.env.BACKEND_URL || "").replace(/\/+$/, "");
  if (!base) {
    return new NextResponse(
      JSON.stringify({ error: "BACKEND_URL is not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const target = `${base}/payments/verify`;

  try {
    const body = await req.arrayBuffer();

    const headers: HeadersInit = {
      "Content-Type": req.headers.get("content-type") || "application/json",
      Accept: "application/json",
    };

    const cookieHeader = req.headers.get("cookie") || "";
    const token = getCookieValue(cookieHeader, "auth_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const upstream = await fetch(target, {
      method: "POST",
      headers,
      body: Buffer.from(body),
      cache: "no-store",
    });

    const contentType =
      upstream.headers.get("content-type") || "application/json";
    const buf = await upstream.arrayBuffer();

    return new NextResponse(buf, {
      status: upstream.status,
      headers: { "Content-Type": contentType },
    });
  } catch (err: any) {
    return new NextResponse(
      JSON.stringify({ error: err?.message || "verify proxy error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
