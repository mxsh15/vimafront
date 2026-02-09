"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { listPublicCategoryOptions } from "@/modules/category/api";
import type { CategoryOptionDto } from "@/modules/category/types";
import MediaPickerDialog from "@/modules/media/ui/MediaPickerDialog";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import { ImagePlus, Trash2 } from "lucide-react";
import { CategoryIconsConfigSchema, parseBySchema, safeJsonStringify } from "../types";

type TreeItem = CategoryOptionDto & { parentKey: string | null };
type FlatOption = { id: string; title: string; depth: number };

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
    const out: FlatOption[] = [];
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

// ✅ آیتم باید imageUrl اختیاری داشته باشد (override)
type Item = { categoryId: string; imageUrl?: string | null };

export function CategoryIconsSectionEditor(props: {
    value: string;
    onChange: (json: string) => void;
}) {
    const cfg = useMemo(
        () =>
            parseBySchema(CategoryIconsConfigSchema, props.value, {
                title: "خرید بر اساس دسته‌بندی",
                boxed: true,
                items: [],
            }),
        [props.value]
    );

    const [cats, setCats] = useState<CategoryOptionDto[]>([]);
    const [loading, setLoading] = useState(false);

    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");

    const wrapRef = useRef<HTMLDivElement | null>(null);

    const [pickerFor, setPickerFor] = useState<string | null>(null);

    function update(next: any) {
        props.onChange(safeJsonStringify(next));
    }

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        listPublicCategoryOptions({ onlyActive: true })
            .then((r) => mounted && setCats(r ?? []))
            .finally(() => mounted && setLoading(false));
        return () => {
            mounted = false;
        };
    }, []);

    const options = useMemo(() => buildHierarchicalOptions(cats), [cats]);

    const filtered = useMemo(() => {
        const query = q.trim();
        if (!query) return options;
        return options.filter((x) => (x.title ?? "").includes(query));
    }, [options, q]);

    const selectedIds = useMemo(() => {
        const arr = Array.isArray(cfg.items) ? (cfg.items as Item[]).map((x) => x.categoryId) : [];
        return arr.filter(Boolean);
    }, [cfg.items]);

    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

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

    const titleById = useMemo(() => {
        const m = new Map<string, string>();
        for (const o of options) m.set(o.id, o.title);
        return m;
    }, [options]);

    // ✅ مپ آیکون دسته‌بندی‌ها (همون تصویری که روی دسته‌بندی تنظیم شده)
    const iconById = useMemo(() => {
        const m = new Map<string, string>();
        for (const c of cats) {
            if (c.iconUrl) m.set(c.id, c.iconUrl);
        }
        return m;
    }, [cats]);

    // ✅ وقتی دسته‌بندی انتخاب شد، اگر icon دارد و کاربر override نکرده، imageUrl را پر کن
    function toggleCategory(id: string) {
        const items: Item[] = Array.isArray(cfg.items) ? (cfg.items as Item[]) : [];

        const exists = items.find((x) => x.categoryId === id);
        if (exists) {
            update({ ...cfg, items: items.filter((x) => x.categoryId !== id) });
            return;
        }

        const autoIcon = iconById.get(id) ?? null;
        update({
            ...cfg,
            items: [...items, { categoryId: id, imageUrl: autoIcon }],
        });
    }

    function removeItem(id: string) {
        const items: Item[] = Array.isArray(cfg.items) ? (cfg.items as Item[]) : [];
        update({ ...cfg, items: items.filter((x) => x.categoryId !== id) });
    }

    function setItemImage(categoryId: string, imageUrl: string) {
        const items: Item[] = Array.isArray(cfg.items) ? (cfg.items as Item[]) : [];
        update({
            ...cfg,
            items: items.map((x) => (x.categoryId === categoryId ? { ...x, imageUrl } : x)),
        });
    }

    // ✅ اگر قبلاً items ذخیره شده‌اند و imageUrl ندارند، از icon دسته‌بندی پرشون کن (بدون override)
    useEffect(() => {
        const items: Item[] = Array.isArray(cfg.items) ? (cfg.items as Item[]) : [];
        if (!items.length) return;

        let changed = false;
        const next = items.map((x) => {
            if (x.imageUrl) return x; // override دستی یا قبلاً پر شده
            const autoIcon = iconById.get(x.categoryId);
            if (!autoIcon) return x;
            changed = true;
            return { ...x, imageUrl: autoIcon };
        });

        if (changed) update({ ...cfg, items: next });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [iconById]);

    const itemsDetailed = useMemo(() => {
        const items: Item[] = Array.isArray(cfg.items) ? (cfg.items as Item[]) : [];
        return items.map((it) => {
            const fallback = iconById.get(it.categoryId) ?? null;
            const effectiveImageUrl = it.imageUrl || fallback; // ✅ اگر override نبود، از دسته‌بندی بخوان
            return {
                ...it,
                title: titleById.get(it.categoryId) ?? it.categoryId,
                effectiveImageUrl,
            };
        });
    }, [cfg.items, titleById, iconById]);

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                    <div className="text-xs text-slate-500 mb-1">عنوان</div>
                    <input
                        className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                        value={cfg.title}
                        onChange={(e) => update({ ...cfg, title: e.target.value })}
                    />
                </div>

                <label className="flex items-center gap-2 mt-6 text-sm">
                    <input
                        type="checkbox"
                        checked={!!cfg.boxed}
                        onChange={(e) => update({ ...cfg, boxed: e.target.checked })}
                    />
                    Boxed باشد
                </label>

                <div>
                    <div className="text-xs text-slate-500 mb-1">سایز تصویر (px)</div>
                    <input
                        type="number"
                        min={56}
                        max={140}
                        className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                        value={cfg.imageSize ?? 100}
                        onChange={(e) => update({ ...cfg, imageSize: Number(e.target.value || 100) })}
                    />
                </div>
            </div>

            {/* انتخاب دسته‌بندی */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="text-sm font-bold text-slate-900 mb-2">دسته‌بندی‌ها</div>

                {selectedIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {selectedIds.map((id) => {
                            const t = titleById.get(id) ?? id;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    className="px-2 py-1 rounded-full border border-slate-200 text-xs bg-white hover:bg-slate-50"
                                    onClick={() => removeItem(id)}
                                    title="حذف"
                                >
                                    {t} <span className="text-slate-400">×</span>
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
                        className={`h-10 w-full rounded-xl border px-3 text-sm outline-none bg-white flex items-center justify-between gap-2
              ${loading ? "border-slate-200 text-slate-400" : "border-slate-200 hover:border-slate-300"}
            `}
                    >
                        <span className="truncate text-right">
                            {selectedIds.length > 0 ? `${selectedIds.length} دسته‌بندی انتخاب شده` : "انتخاب دسته‌بندی‌ها"}
                        </span>
                        <span className="text-slate-400">▾</span>
                    </button>

                    {open && (
                        <div
                            className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden"
                            onMouseDown={(e) => e.preventDefault()}
                        >
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
                                {filtered.length === 0 ? (
                                    <div className="px-3 py-3 text-sm text-slate-400">موردی پیدا نشد.</div>
                                ) : (
                                    filtered.map((c) => {
                                        const isSelected = selectedSet.has(c.id);
                                        const indent = "— ".repeat(Math.min(c.depth, 6));
                                        return (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => toggleCategory(c.id)}
                                                className="w-full text-right px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
                                            >
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

                            <div className="border-t border-slate-100 p-2 flex items-center justify-between gap-2">
                                <button
                                    type="button"
                                    className="text-xs text-slate-600 hover:text-slate-900"
                                    onClick={() => {
                                        update({ ...cfg, items: [] });
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

                <div className="text-[11px] text-slate-400 mt-2">
                    لیست سلسله‌مراتبی است. انتخاب هر سطح مستقل است.
                </div>
            </div>

            {/* آیتم‌های انتخاب شده */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="text-sm font-bold text-slate-900 mb-3">آیتم‌های انتخاب شده</div>

                {itemsDetailed.length === 0 ? (
                    <div className="text-sm text-slate-400 p-4 text-center">هیچ آیتمی انتخاب نشده.</div>
                ) : (
                    <div
                        className={[
                            "space-y-3",
                            itemsDetailed.length > 4 ? "max-h-[264px] overflow-y-auto pr-1" : "",
                        ].join(" ")}
                    >
                        {itemsDetailed.map((it) => (
                            <div
                                key={it.categoryId}
                                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-12 w-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                                        {it.effectiveImageUrl ? (
                                            <img
                                                src={resolveMediaUrl(it.effectiveImageUrl)}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full grid place-items-center text-xs text-slate-400">
                                                no img
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold text-slate-900 truncate">{it.title}</div>
                                        <div className="text-xs text-slate-500 truncate">
                                            تصویر: {it.effectiveImageUrl ? it.effectiveImageUrl : "روی دسته‌بندی هم تنظیم نشده"}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {/* ✅ دکمه override دستی */}
                                    <button
                                        className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50"
                                        onClick={() => setPickerFor(it.categoryId)}
                                        title="انتخاب/تغییر تصویر (override)"
                                    >
                                        <ImagePlus className="h-4 w-4 mx-auto" />
                                    </button>

                                    <button
                                        className="h-10 w-10 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                                        onClick={() => removeItem(it.categoryId)}
                                        title="حذف"
                                    >
                                        <Trash2 className="h-4 w-4 mx-auto" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <MediaPickerDialog
                open={!!pickerFor}
                onClose={() => setPickerFor(null)}
                multiple={false}
                confirmLabel="انتخاب"
                onSelect={(urls) => {
                    const u = urls?.[0] ?? "";
                    if (pickerFor) setItemImage(pickerFor, u);
                    setPickerFor(null);
                }}
            />
        </div>
    );
}
