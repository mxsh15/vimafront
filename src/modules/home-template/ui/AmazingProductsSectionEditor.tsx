"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { listPublicCategoryOptions } from "@/modules/category/api";
import type { CategoryOptionDto } from "@/modules/category/types";
import { AmazingProductsConfigSchema, parseBySchema, safeJsonStringify } from "../types";
import { PersianDateTimeField } from "@/shared/components/PersianDateTimeField";

type TreeItem = CategoryOptionDto & { parentKey: string | null };

function getParentId(c: any): string | null {
    return (c.parentId ?? c.parentCategoryId ?? null) as string | null;
}

function buildHierarchicalOptions(cats: CategoryOptionDto[]) {
    const items: TreeItem[] = cats.map((c) => ({ ...c, parentKey: getParentId(c) }));

    const byParent = new Map<string | null, TreeItem[]>();
    for (const c of items) {
        const key = c.parentKey ?? null;
        const arr = byParent.get(key) ?? [];
        arr.push(c);
        byParent.set(key, arr);
    }

    // مرتب‌سازی برای خروجی مرتب
    for (const [k, arr] of byParent.entries()) {
        arr.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? "", "fa"));
        byParent.set(k, arr);
    }

    const roots = byParent.get(null) ?? [];

    const out: Array<{ id: string; title: string; depth: number }> = [];
    const visited = new Set<string>();

    function dfs(node: TreeItem, depth: number) {
        if (visited.has(node.id)) return; // جلوگیری از حلقه‌های عجیب
        visited.add(node.id);

        out.push({ id: node.id, title: node.title, depth });

        const children = byParent.get(node.id) ?? [];
        for (const ch of children) dfs(ch, depth + 1);
    }

    for (const r of roots) dfs(r, 0);

    if (out.length === 0 && items.length > 0) {
        for (const x of items) out.push({ id: x.id, title: x.title, depth: 0 });
    }

    return out;
}

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

function formatDurationFa(ms: number) {
    const { days, hours, minutes, seconds } = breakdownMs(ms);
    const parts: string[] = [];
    if (days > 0) parts.push(`${days} روز`);
    parts.push(`${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`);
    return parts.join(" ");
}

function useAdminCountdown(targetIso: string | null) {
    const targetMs = useMemo(() => parseIsoMs(targetIso), [targetIso]);
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (!targetMs) return;
        const id = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, [targetMs]);

    if (!targetMs) return null;
    const diff = Math.max(0, targetMs - now);
    return { diff, ...breakdownMs(diff) };
}



export function AmazingProductsSectionEditor(props: {
    value: string;
    onChange: (json: string) => void;
}) {
    const cfg = useMemo(
        () =>
            parseBySchema(AmazingProductsConfigSchema, props.value, {
                boxed: true,
                title: "پیشنهاد شگفت‌انگیز",
                take: 20,
                categoryIds: [],
                categoryId: null,
                startAtUtc: null,
                endAtUtc: null,
            }),
        [props.value]
    );

    const selectedIds: string[] = useMemo(() => {
        const ids = Array.isArray((cfg as any).categoryIds) ? (cfg as any).categoryIds : [];
        if (ids.length > 0) return ids;
        const legacy = (cfg as any).categoryId;
        if (typeof legacy === "string" && legacy.trim() !== "") return [legacy.trim()];

        return [];
    }, [cfg]);

    const [cats, setCats] = useState<CategoryOptionDto[]>([]);
    const [loading, setLoading] = useState(false);


    const [nowMs, setNowMs] = useState(() => Date.now());
    useEffect(() => {
        const id = window.setInterval(() => setNowMs(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, []);

    const startMs = useMemo(() => parseIsoMs(cfg.startAtUtc), [cfg.startAtUtc]);
    const endMs = useMemo(() => parseIsoMs(cfg.endAtUtc), [cfg.endAtUtc]);

    const untilStart = useAdminCountdown(cfg.startAtUtc);
    const untilEnd = useAdminCountdown(cfg.endAtUtc);

    const status = useMemo(() => {
        if (!startMs && !endMs) return "بدون زمان‌بندی";
        if (startMs && nowMs < startMs) return "هنوز شروع نشده";
        if (endMs && nowMs > endMs) return "تمام شده";
        return "در حال نمایش";
    }, [startMs, endMs, nowMs]);

    const durationMs = useMemo(() => {
        if (!startMs || !endMs) return null;
        return Math.max(0, endMs - startMs);
    }, [startMs, endMs]);

    function update(next: any) {
        props.onChange(safeJsonStringify(next));
    }

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        listPublicCategoryOptions({ onlyActive: true })
            .then((r) => {
                if (!mounted) return;
                setCats(r);
            })
            .finally(() => mounted && setLoading(false));
        return () => {
            mounted = false;
        };
    }, []);

    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");

    const options = useMemo(() => buildHierarchicalOptions(cats), [cats]);

    const filtered = useMemo(() => {
        const query = q.trim();
        if (!query) return options;
        return options.filter((x) => (x.title ?? "").includes(query));
    }, [options, q]);

    const selectedTitle = useMemo(() => {
        if (!cfg.categoryId) return "";
        const hit = options.find((x) => x.id === cfg.categoryId);
        return hit?.title ?? "";
    }, [cfg.categoryId, options]);

    const wrapRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;

        function onDocPointerDown(e: PointerEvent) {
            const el = wrapRef.current;
            if (!el) return;
            const target = e.target as Node;
            if (el.contains(target)) return; // کلیک داخل dropdown => نبند
            setOpen(false);                  // کلیک بیرون => ببند
        }

        document.addEventListener("pointerdown", onDocPointerDown);
        return () => document.removeEventListener("pointerdown", onDocPointerDown);
    }, [open]);



    return (
        <div className="space-y-4">
            <div className="text-sm font-bold text-slate-900">پیشنهاد شگفت‌انگیز</div>

            <label className="inline-flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={cfg.boxed}
                    onChange={(e) => update({ ...cfg, boxed: e.target.checked })}
                />
                Boxed باشد
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <div className="text-xs text-slate-500 mb-1">عنوان</div>
                    <input
                        className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                        value={cfg.title}
                        onChange={(e) => update({ ...cfg, title: e.target.value })}
                    />
                </div>

                <div>
                    <div className="text-xs text-slate-500 mb-1">تعداد نمایش</div>
                    <input
                        type="number"
                        className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                        value={cfg.take}
                        min={1}
                        max={50}
                        onChange={(e) => update({ ...cfg, take: Number(e.target.value || 20) })}
                    />
                </div>

                <div className="md:col-span-2">
                    <div className="text-xs text-slate-500 mb-1">دسته‌بندی محصولات</div>

                    {/* Selected chips */}
                    {selectedIds.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {selectedIds.map((id) => {
                                const t = options.find((x) => x.id === id)?.title ?? id;
                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        className="px-2 py-1 rounded-full border border-slate-200 text-xs bg-white hover:bg-slate-50"
                                        onClick={() => {
                                            const next = selectedIds.filter((x) => x !== id);
                                            update({ ...cfg, categoryIds: next, categoryId: null });
                                        }}
                                        title="حذف"
                                    >
                                        {t} <span className="text-slate-400">×</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <div className="relative" ref={wrapRef}>
                        {/* Trigger */}
                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => setOpen((v) => !v)}
                            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none bg-white flex items-center justify-between gap-2
        ${loading ? "border-slate-200 text-slate-400" : "border-slate-200 hover:border-slate-300"}
      `}
                        >
                            <span className="truncate text-right">
                                {selectedIds.length > 0 ? `${selectedIds.length} دسته‌بندی انتخاب شده` : "بدون فیلتر (همه)"}
                            </span>
                            <span className="text-slate-400">▾</span>
                        </button>

                        {/* Dropdown */}
                        {open && (
                            <div
                                className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden"
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                {/* Search */}
                                <div className="p-2 border-b border-slate-100">
                                    <input
                                        autoFocus
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        placeholder="جستجوی دسته‌بندی..."
                                        className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                                    />
                                </div>

                                <div className="max-h-72 overflow-auto py-1">
                                    {/* "All" option: فقط وقتی هیچ چیزی انتخاب نشده فعال است */}
                                    <button
                                        type="button"
                                        disabled={selectedIds.length > 0}
                                        onClick={() => {
                                            // همه = پاک کردن انتخاب‌ها
                                            update({ ...cfg, categoryIds: [], categoryId: null });
                                            setOpen(false);
                                            setQ("");
                                        }}
                                        className={`w-full text-right px-3 py-2 text-sm
              ${selectedIds.length > 0 ? "text-slate-300 cursor-not-allowed" : "hover:bg-slate-50"}
            `}
                                    >
                                        بدون فیلتر (همه)
                                        {selectedIds.length > 0 ? (
                                            <span className="text-[11px] text-slate-400 mr-2">(برای انتخاب «همه»، اول انتخاب‌ها را حذف کن)</span>
                                        ) : null}
                                    </button>

                                    {filtered.length === 0 ? (
                                        <div className="px-3 py-3 text-sm text-slate-400">موردی پیدا نشد.</div>
                                    ) : (
                                        filtered.map((c) => {
                                            const isSelected = selectedIds.includes(c.id);
                                            const indent = "— ".repeat(Math.min(c.depth, 6));

                                            return (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    onClick={() => {
                                                        let next: string[];
                                                        if (isSelected) next = selectedIds.filter((x) => x !== c.id);
                                                        else next = [...selectedIds, c.id];

                                                        update({
                                                            ...cfg,
                                                            categoryIds: next,
                                                            categoryId: null, // legacy رو خاموش کن
                                                        });
                                                    }}
                                                    className={`w-full text-right px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2`}
                                                >
                                                    {/* checkbox */}
                                                    <span
                                                        className={`h-4 w-4 rounded border flex items-center justify-center text-xs
                      ${isSelected ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-300 text-transparent"}
                    `}
                                                    >
                                                        ✓
                                                    </span>

                                                    <span className="text-slate-300 shrink-0">{indent}</span>
                                                    <span className="truncate">{c.title}</span>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Footer actions */}
                                <div className="border-t border-slate-100 p-2 flex items-center justify-between gap-2">
                                    <button
                                        type="button"
                                        className="text-xs text-slate-600 hover:text-slate-900"
                                        onClick={() => {
                                            update({ ...cfg, categoryIds: [], categoryId: null });
                                            setQ("");
                                        }}
                                    >
                                        پاک کردن انتخاب‌ها
                                    </button>

                                    <button
                                        type="button"
                                        className="h-9 px-3 rounded-xl bg-slate-900 text-white text-sm hover:bg-slate-800"
                                        onClick={() => setOpen(false)}
                                    >
                                        بستن
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1">
                        فعلاً فیلتر بر اساس دسته‌های انتخاب‌شده اعمال می‌شود. (زیرمجموعه‌ها جدا حساب می‌شوند مگر در API اضافه کنی)
                    </div>
                </div>

                {/* شروع نمایش */}
                <PersianDateTimeField
                    label="تاریخ شروع"
                    valueIso={cfg.startAtUtc}
                    onChangeIso={(iso) => update({ ...cfg, startAtUtc: iso })}
                    showTime
                />

                {/* پایان نمایش */}
                <PersianDateTimeField
                    label="تاریخ اتمام"
                    valueIso={cfg.endAtUtc}
                    onChangeIso={(iso) => update({ ...cfg, endAtUtc: iso })}
                    showTime
                />

                {cfg.endAtUtc ? (
                    <div className="md:col-span-2">
                        <button
                            type="button"
                            className="text-xs text-slate-500 hover:text-slate-700"
                            onClick={() => update({ ...cfg, endAtUtc: null })}
                        >
                            پاک کردن پایان نمایش
                        </button>
                    </div>
                ) : null}


                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-slate-900">
                            وضعیت: <span className="text-slate-700">{status}</span>
                        </div>

                        {durationMs != null ? (
                            <div className="text-xs text-slate-500">
                                مدت بین شروع و پایان: {formatDurationFa(durationMs)}
                            </div>
                        ) : null}
                    </div>

                    <div className="mt-2 flex flex-col gap-1 text-xs text-slate-600">
                        {startMs ? (
                            <div>شروع: <span className="font-mono">{new Date(startMs).toLocaleString("fa-IR")}</span></div>
                        ) : (
                            <div>شروع: <span className="text-slate-400">تنظیم نشده</span></div>
                        )}

                        {endMs ? (
                            <div>پایان: <span className="font-mono">{new Date(endMs).toLocaleString("fa-IR")}</span></div>
                        ) : (
                            <div>پایان: <span className="text-slate-400">تنظیم نشده</span></div>
                        )}
                    </div>

                    {status === "هنوز شروع نشده" && untilStart ? (
                        <div className="mt-3 text-sm">
                            <span className="text-slate-700">تا شروع: </span>
                            <span className="font-mono font-bold text-slate-900">{formatDurationFa(untilStart.diff)}</span>
                        </div>
                    ) : null}

                    {status === "در حال نمایش" && untilEnd ? (
                        <div className="mt-3 text-sm">
                            <span className="text-slate-700">تا پایان: </span>
                            <span className="font-mono font-bold text-slate-900">{formatDurationFa(untilEnd.diff)}</span>
                        </div>
                    ) : null}

                    {status === "تمام شده" ? (
                        <div className="mt-3 text-sm text-slate-500">
                            این بازه زمانی تمام شده و در سایت نمایش داده نمی‌شود.
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
