"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { listPublicCategoryOptions } from "@/modules/category/api";
import type { CategoryOptionDto } from "@/modules/category/types";
import {
    parseBySchema,
    safeJsonStringify,
    CategoryProducts4ColumnConfigSchema,
} from "@/modules/home-template/types";

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

    for (const [k, arr] of byParent.entries()) {
        arr.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? "", "fa"));
        byParent.set(k, arr);
    }

    const roots = byParent.get(null) ?? [];
    const out: Array<{ id: string; title: string; depth: number }> = [];
    const visited = new Set<string>();

    function dfs(node: TreeItem, depth: number) {
        if (visited.has(node.id)) return;
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

function indentPrefix(depth: number) {
    return "— ".repeat(Math.min(depth, 6));
}

function CategorySinglePicker(props: {
    label: string;
    loading?: boolean;
    options: Array<{ id: string; title: string; depth: number }>;
    valueId: string | null;
    onChangeId: (id: string | null) => void;
}) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");
    const wrapRef = useRef<HTMLDivElement | null>(null);

    const selectedTitle = useMemo(() => {
        if (!props.valueId) return "";
        return props.options.find((x) => x.id === props.valueId)?.title ?? "";
    }, [props.valueId, props.options]);

    const filtered = useMemo(() => {
        const query = q.trim();
        if (!query) return props.options;
        return props.options.filter((x) => (x.title ?? "").includes(query));
    }, [props.options, q]);

    useEffect(() => {
        if (!open) return;

        function onDocPointerDown(e: PointerEvent) {
            const el = wrapRef.current;
            if (!el) return;
            const target = e.target as Node;
            if (el.contains(target)) return;
            setOpen(false);
        }

        document.addEventListener("pointerdown", onDocPointerDown);
        return () => document.removeEventListener("pointerdown", onDocPointerDown);
    }, [open]);

    // وقتی value از بیرون عوض شد (تغییر سکشن/لود)، سرچ رو تمیز کن
    useEffect(() => {
        setQ("");
    }, [props.valueId]);

    return (
        <div className="relative" ref={wrapRef}>
            <div className="text-xs text-slate-500 mb-1">{props.label}</div>

            {/* Trigger */}
            <button
                type="button"
                disabled={!!props.loading}
                onClick={() => setOpen((v) => !v)}
                className={[
                    "h-10 w-full rounded-xl border px-3 text-sm outline-none bg-white flex items-center justify-between gap-2",
                    props.loading ? "border-slate-200 text-slate-400" : "border-slate-200 hover:border-slate-300",
                ].join(" ")}
            >
                <span className="truncate text-right">
                    {props.valueId ? selectedTitle || "انتخاب شده" : "انتخاب دسته‌بندی..."}
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
                        {/* clear option */}
                        <button
                            type="button"
                            onClick={() => {
                                props.onChangeId(null);
                                setOpen(false);
                                setQ("");
                            }}
                            className="w-full text-right px-3 py-2 text-sm hover:bg-slate-50 text-slate-600"
                        >
                            انتخاب نشده
                        </button>

                        {filtered.length === 0 ? (
                            <div className="px-3 py-3 text-sm text-slate-400">موردی پیدا نشد.</div>
                        ) : (
                            filtered.map((c) => {
                                const isSelected = props.valueId === c.id;
                                const indent = indentPrefix(c.depth);

                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => {
                                            props.onChangeId(c.id); // ✅ فقط یک انتخاب
                                            setOpen(false);
                                            setQ("");
                                        }}
                                        className={[
                                            "w-full text-right px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2",
                                            isSelected ? "bg-slate-50" : "",
                                        ].join(" ")}
                                    >
                                        {/* radio-like indicator */}
                                        <span
                                            className={[
                                                "h-4 w-4 rounded-full border flex items-center justify-center text-[10px] shrink-0",
                                                isSelected ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-300 text-transparent",
                                            ].join(" ")}
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

                    <div className="border-t border-slate-100 p-2 flex items-center justify-end">
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
    );
}

export function CategoryProducts4ColumnSectionEditor(props: {
    value: string;
    onChange: (json: string) => void;
}) {
    const cfg = useMemo(
        () =>
            parseBySchema(CategoryProducts4ColumnConfigSchema, props.value, {
                boxed: true,
                subtitle: "بر اساس سلیقه شما",
                take: 4,
                columns: [
                    { categoryId: null, titleOverride: "" },
                    { categoryId: null, titleOverride: "" },
                    { categoryId: null, titleOverride: "" },
                    { categoryId: null, titleOverride: "" },
                ],
            }),
        [props.value]
    );

    const [cats, setCats] = useState<CategoryOptionDto[]>([]);
    const [loading, setLoading] = useState(false);

    const options = useMemo(() => buildHierarchicalOptions(cats), [cats]);

    // load categories once
    useEffect(() => {
        let mounted = true;
        setLoading(true);
        listPublicCategoryOptions({ onlyActive: true } as any)
            .then((r) => mounted && setCats(r ?? []))
            .finally(() => mounted && setLoading(false));
        return () => {
            mounted = false;
        };
    }, []);

    // update helper (loop-safe)
    function update(next: any) {
        const nextJson = safeJsonStringify(next);
        if (nextJson === props.value) return; // ✅ جلوگیری از Maximum update depth
        props.onChange(nextJson);
    }

    // تغییر categoryId هر ستون (فقط یکی)
    function setColumnCategory(idx: number, categoryId: string | null) {
        const nextCols = (cfg.columns ?? []).slice();
        nextCols[idx] = { ...nextCols[idx], categoryId };
        update({ ...cfg, columns: nextCols });
    }

    function setColumnTitleOverride(idx: number, titleOverride: string) {
        const nextCols = (cfg.columns ?? []).slice();
        nextCols[idx] = { ...nextCols[idx], titleOverride };
        update({ ...cfg, columns: nextCols });
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
                <label className="flex items-center gap-2 justify-end">
                    <input
                        type="checkbox"
                        checked={cfg.boxed}
                        onChange={(e) => update({ ...cfg, boxed: e.target.checked })}
                        className="h-4 w-4"
                    />
                    <span className="text-sm text-gray-700">نمایش به صورت boxed</span>
                </label>

                <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">زیرتیتر</div>
                    <input
                        value={cfg.subtitle ?? ""}
                        onChange={(e) => update({ ...cfg, subtitle: e.target.value })}
                        className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                        placeholder="بر اساس سلیقه شما"
                    />
                </div>

                <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">تعداد محصول هر ستون</div>
                    <input
                        type="number"
                        value={cfg.take ?? 4}
                        min={1}
                        max={8}
                        onChange={(e) => update({ ...cfg, take: Number(e.target.value || 4) })}
                        className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                    />
                    <div className="mt-1 text-[11px] text-slate-400">پیشنهادی: 4 (شبکه 2×2)</div>
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                {(cfg.columns ?? []).map((col, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-200 p-3 space-y-3">
                        <div className="text-sm font-bold text-slate-900">ستون {idx + 1}</div>

                        {/* ✅ dropdown سلسله‌مراتبی + سرچ + single-select */}
                        <CategorySinglePicker
                            label="انتخاب دسته‌بندی (فقط یکی)"
                            loading={loading}
                            options={options}
                            valueId={col.categoryId ?? null}
                            onChangeId={(id) => setColumnCategory(idx, id)}
                        />

                        <div className="text-right">
                            <div className="text-xs text-slate-500 mb-1">عنوان سفارشی ستون (اختیاری)</div>
                            <input
                                value={col.titleOverride ?? ""}
                                onChange={(e) => setColumnTitleOverride(idx, e.target.value)}
                                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                                placeholder="اگر خالی باشد عنوان دسته‌بندی نمایش داده می‌شود"
                            />
                        </div>

                        <div className="text-[11px] text-slate-400">
                            برای هر ستون فقط یک دسته‌بندی می‌تونی انتخاب کنی. از این واضح‌تر نمی‌شه.
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
