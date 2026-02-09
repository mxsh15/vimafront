import { NextResponse } from "next/server";

export async function GET(
    _req: Request,
    { params }: { params: { path: string[] } }
) {
    const p = params.path.join("/");
    const upstream = `http://127.0.0.1:5167/uploads/${p}`;

    const res = await fetch(upstream, { cache: "no-store" });
    if (!res.ok) return new NextResponse("Not Found", { status: 404 });

    const contentType = res.headers.get("content-type") ?? "application/octet-stream";
    return new NextResponse(res.body, {
        status: 200,
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=60",
        },
    });
}
