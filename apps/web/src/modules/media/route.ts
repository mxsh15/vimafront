// src/app/api/media/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ENV } from "@/lib/env";
import { listMedia } from "@/modules/media/api"; // <- این همونیه که خودت نوشتی

// 1) GET: لیست فایل‌ها با استفاده از listMedia (serverFetch)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") ?? "1") || 1;
    const pageSize = Number(searchParams.get("pageSize") ?? "40") || 40;
    const usage = searchParams.get("usage") || undefined;
    const kind = searchParams.get("kind") || undefined;
    const q = searchParams.get("q") || undefined;

    const result = await listMedia({
      page,
      pageSize,
      usage: usage as any,
      kind: kind as any,
      q: q ?? undefined,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("API /api/media list error", err);
    return NextResponse.json(
      {
        error: "خطا در دریافت لیست فایل‌ها.",
        detail: err?.message ?? null,
      },
      { status: 500 }
    );
  }
}

// 2) POST: آپلود فایل به بک‌اند (کدی که خودت از قبل داشتی)
export async function POST(req: NextRequest) {
  try {
    if (!ENV.BACKEND_URL) {
      return NextResponse.json(
        { error: "BACKEND_URL تنظیم نشده است." },
        { status: 500 }
      );
    }

    const base = ENV.BACKEND_URL.replace(/\/+$/, "");
    const url = `${base}/media/upload`;

    // فرم‌دیتای فرانت رو می‌گیریم
    const incomingForm = await req.formData();
    const file = incomingForm.get("file");
    const usage = (incomingForm.get("usage") as string) || "General";

    if (!file) {
      return NextResponse.json(
        { error: "فایلی ارسال نشده است." },
        { status: 400 }
      );
    }

    // فرم‌دیتای جدید برای .NET
    const backendForm = new FormData();

    if (file instanceof File) {
      backendForm.append("file", file, file.name);
    } else {
      backendForm.append("file", file as any);
    }

    backendForm.append("usage", usage);

    const backendRes = await fetch(url, {
      method: "POST",
      body: backendForm,
    });

    const text = await backendRes.text();

    if (!backendRes.ok) {
      console.error("Backend /media/upload error:", backendRes.status, text);
      return NextResponse.json(
        {
          error: "آپلود در سرور بک‌اند با خطا مواجه شد.",
          status: backendRes.status,
          backendBody: text,
        },
        { status: 500 }
      );
    }

    const dto = JSON.parse(text);
    return NextResponse.json(dto);
  } catch (err: any) {
    console.error("API /api/media upload error", err);
    return NextResponse.json(
      {
        error: "بارگذاری پرونده با خطا مواجه شد.",
        detail: err?.message ?? null,
      },
      { status: 500 }
    );
  }
}
