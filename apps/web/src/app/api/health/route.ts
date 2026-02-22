import { NextResponse } from "next/server";

export async function GET() {
    const base = (process.env.BACKEND_URL || "").replace(/\/+$/, "");
    if (!base) {
        return NextResponse.json({ ok: false, reason: "BACKEND_URL not set" }, { status: 500 });
    }

    const target = `${base}/public/settings`;
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 3000);

    try {
        const res = await fetch(target, { cache: "no-store", signal: ac.signal });
        return NextResponse.json({ ok: res.ok }, { status: res.ok ? 200 : 503 });
    } catch {
        return NextResponse.json({ ok: false }, { status: 503 });
    } finally {
        clearTimeout(timer);
    }
}
