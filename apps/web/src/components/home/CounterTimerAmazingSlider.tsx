"use client";

import { useEffect, useMemo, useState } from "react";

function parseIsoMs(iso: string | null) {
    if (!iso) return null;
    const t = Date.parse(iso);
    return Number.isNaN(t) ? null : t;
}

function pad2(n: number) {
    return String(Math.max(0, Math.floor(n))).padStart(2, "0");
}

function breakdownMs(ms: number) {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return { days, hours, minutes, seconds, totalSec };
}

/**
 * مثل ادمین:
 * - اگر now < start => countdown تا شروع (start - now)
 * - اگر now >= start => countdown تا پایان (end - now)
 * - اگر start خالی بود => countdown تا پایان (end - now)
 */
function useCampaignCountdown(startAtUtc: string | null, endAtUtc: string | null) {
    const startMs = useMemo(() => parseIsoMs(startAtUtc), [startAtUtc]);
    const endMs = useMemo(() => parseIsoMs(endAtUtc), [endAtUtc]);

    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        // اگر هیچ هدفی نداریم، interval لازم نیست
        if (!startMs && !endMs) return;

        const id = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, [startMs, endMs]);

    // اگر end نداریم، چیزی برای شمارش نداریم
    if (!endMs) {
        return { mode: "none" as const, active: false, diff: 0, ...breakdownMs(0) };
    }

    // اگر start داریم و هنوز نرسیده
    if (startMs && now < startMs) {
        const diff = Math.max(0, startMs - now);
        const b = breakdownMs(diff);
        return { mode: "until_start" as const, active: diff > 0, diff, ...b };
    }

    // در غیر اینصورت تا پایان
    const diff = Math.max(0, endMs - now);
    const b = breakdownMs(diff);
    return { mode: "until_end" as const, active: diff > 0, diff, ...b };
}

export function CountdownInline({
    startAtUtc,
    endAtUtc,
}: {
    startAtUtc: string | null;
    endAtUtc: string | null;
}) {
    const cd = useCampaignCountdown(startAtUtc, endAtUtc);

    // اگر end تنظیم نشده، چیزی نمایش نده
    if (!endAtUtc) return null;

    // اگر تمام شد، مخفی
    if (!cd.active) return null;

    const label = cd.mode === "until_start" ? "تا شروع" : "تا پایان";

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
                {cd.days > 0 ? (
                    <div className="flex items-center">
                        <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-white text-[#ef394e] text-sm font-extrabold">
                            {cd.days}
                        </span>
                        <span className="mx-1 text-white/90 text-xs">روز</span>
                    </div>
                ) : null}


                <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-white text-[#ef394e] text-sm font-extrabold">
                    {pad2(cd.seconds)}
                </span>
                <span className="text-white/90 text-sm font-bold">:</span>

                <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-white text-[#ef394e] text-sm font-extrabold">
                    {pad2(cd.minutes)}
                </span>
                <span className="text-white/90 text-sm font-bold">:</span>
                <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-white text-[#ef394e] text-sm font-extrabold">
                    {pad2(cd.hours)}
                </span>
            </div>
        </div>
    );
}

export function isVisibleNow(cfg: { startAtUtc: string | null; endAtUtc: string | null }) {
    const now = Date.now();

    if (cfg.startAtUtc) {
        const s = Date.parse(cfg.startAtUtc);
        if (!Number.isNaN(s) && now < s) return false;
    }
    if (cfg.endAtUtc) {
        const e = Date.parse(cfg.endAtUtc);
        if (!Number.isNaN(e) && now > e) return false;
    }
    return true;
}
