"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { listPublicCategoryOptions } from "@/modules/category/api";
import type { CategoryOptionDto } from "@/modules/category/types";
import { CategoryProductsSliderConfigSchema, parseBySchema, safeJsonStringify } from "@/modules/home-template/types";

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

export function CategoryProductsSliderSectionEditor(props: { value: string; onChange: (json: string) => void }) {
    const cfg = useMemo(
        () =>
            parseBySchema(CategoryProductsSliderConfigSchema, props.value, {
                boxed: true,
                title: "محصولات منتخب",
                take: 12,
                categoryIds: [],
                showAllHref: "",
                showAllText: "نمایش همه",
            }),
        [props.value]
    );

    const [cats, setCats] = useState<CategoryOptionDto[]>([]);
    const [loading, setLoading] = useState(false);

    const options = useMemo(() => buildHierarchicalOptions(cats), [cats]);

    function update(next: any) {
        props.onChange(safeJsonStringify(next));
    }

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        listPublicCategoryOptions({ onlyActive: true })
            .then((r) => mounted && setCats(r))
            .finally(() => mounted && setLoading(false));
        return () => {
            mounted = false;
        };
    }, []);

    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");
    const wrapRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;
        function onDocPointerDown(e: PointerEvent) {
            const el = wrapRef.current;
            if (!el) return;
            if (el.contains(e.target as Node)) return;
            setOpen(false);
        }
        document.addEventListener("pointerdown", onDocPointerDown);
        return () => document.removeEventListener("pointerdown", onDocPointerDown);
    }, [open]);

    const filtered = useMemo(() => {
        const query = q.trim();
        if (!query) return options;
        return options.filter((x) => (x.title ?? "").includes(query));
    }, [options, q]);

    const selectedIds = (cfg.categoryIds ?? []).map((x: any) => String(x));

    return (
        <div className="space-y-4">
            <div className="text-sm font-bold text-slate-900">اسلایدر محصولات بر اساس دسته‌بندی</div>

            <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={cfg.boxed} onChange={(e) => update({ ...cfg, boxed: e.target.checked })} />
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
                        onChange={(e) => update({ ...cfg, take: Number(e.target.value || 12) })}
                    />
                </div>

                <div className="md:col-span-2">
                    <div className="text-xs text-slate-500 mb-1">دسته‌بندی‌ها</div>

                    {selectedIds.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {selectedIds.map((id) => {
                                const t = options.find((x) => x.id === id)?.title ?? id;
                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        className="px-2 py-1 rounded-full border border-slate-200 text-xs bg-white hover:bg-slate-50"
                                        onClick={() => update({ ...cfg, categoryIds: selectedIds.filter((x) => x !== id) })}
                                    >
                                        {t} ✕
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <div className="relative" ref={wrapRef}>
                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => setOpen((v) => !v)}
                            className={[
                                "h-10 w-full rounded-xl border px-3 text-sm outline-none bg-white flex items-center justify-between gap-2",
                                loading ? "border-slate-200 text-slate-400" : "border-slate-200 hover:border-slate-300",
                            ].join(" ")}
                        >
                            <span className="truncate text-right">انتخاب دسته‌بندی‌ها...</span>
                            <span className="text-slate-400">▾</span>
                        </button>

                        {open && (
                            <div className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                                <div className="p-2 border-b border-slate-100">
                                    <input
                                        autoFocus
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        placeholder="جستجو..."
                                        className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                                    />
                                </div>

                                <div className="max-h-72 overflow-auto py-1">
                                    {filtered.map((c) => {
                                        const isSelected = selectedIds.includes(c.id);
                                        return (
                                            <button
                                                key={c.id}
                                                type="button"
                                                className="w-full text-right px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
                                                onClick={() => {
                                                    const next = isSelected ? selectedIds.filter((x) => x !== c.id) : [...selectedIds, c.id];
                                                    update({ ...cfg, categoryIds: next });
                                                }}
                                            >
                                                <span
                                                    className={[
                                                        "h-4 w-4 rounded border flex items-center justify-center text-[10px] shrink-0",
                                                        isSelected ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-300 text-transparent",
                                                    ].join(" ")}
                                                >
                                                    ✓
                                                </span>
                                                <span className="text-slate-300 shrink-0">{indentPrefix(c.depth)}</span>
                                                <span className="truncate">{c.title}</span>
                                            </button>
                                        );
                                    })}
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
                </div>

                <div className="md:col-span-2">
                    <div className="text-xs text-slate-500 mb-1">لینک نمایش همه (اختیاری)</div>
                    <input
                        className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                        value={cfg.showAllHref || ""}
                        onChange={(e) => update({ ...cfg, showAllHref: e.target.value })}
                        placeholder="/shop یا هر لینک دلخواه"
                    />
                </div>
            </div>
        </div>
    );
}
