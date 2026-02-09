"use client";

import { useEffect, useMemo, useState } from "react";
import {
    parseBySchema,
    safeJsonStringify,
    TopBrandsConfigSchema,
} from "@/modules/home-template/types";
import { usePublicBrandOptions } from "@/modules/brand/hooks";
import type { AdminHomeTemplateSection } from "@/modules/home-template/types";

export function TopBrandsSectionEditor(props: {
    section: AdminHomeTemplateSection;
    onChange: (nextConfigJson: string) => void;
}) {
    const { section, onChange } = props;

    const cfg = useMemo(
        () => parseBySchema(TopBrandsConfigSchema, section.configJson),
        [section.configJson]
    );

    const [title, setTitle] = useState(cfg.title ?? "محبوب‌ترین برندها");
    const [boxed, setBoxed] = useState(!!cfg.boxed);
    const [brandIds, setBrandIds] = useState<string[]>(cfg.brandIds ?? []);
    const [q, setQ] = useState("");

    const brandsQ = usePublicBrandOptions();
    const all = brandsQ.data ?? [];

    useEffect(() => {
        setTitle(cfg.title ?? "محبوب‌ترین برندها");
        setBoxed(!!cfg.boxed);
        setBrandIds(cfg.brandIds ?? []);
        setQ(""); 
    }, [section.id, section.type, section.configJson]);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return all;
        return all.filter(
            (x) =>
                (x.title ?? "").toLowerCase().includes(s) ||
                (x.slug ?? "").toLowerCase().includes(s)
        );
    }, [all, q]);

    useEffect(() => {
        onChange(
            safeJsonStringify({
                boxed,
                title: title.trim() || "محبوب‌ترین برندها",
                brandIds,
            })
        );
    }, [boxed, title, brandIds, onChange]);

    function toggle(id: string) {
        setBrandIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    }

    function selectAllFiltered() {
        const ids = filtered.map((x) => x.id);
        setBrandIds((prev) => Array.from(new Set([...prev, ...ids])));
    }

    function clearAll() {
        setBrandIds([]);
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-right">
                    <span className="mb-1 block text-sm text-gray-700">عنوان</span>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="محبوب‌ترین برندها"
                    />
                </label>

                <label className="flex items-center gap-2 justify-end">
                    <input
                        type="checkbox"
                        checked={boxed}
                        onChange={(e) => setBoxed(e.target.checked)}
                        className="h-4 w-4"
                    />
                    <span className="text-sm text-gray-700">نمایش به صورت boxed</span>
                </label>
            </div>

            <div className="flex items-center gap-2">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="جستجوی برند (نام یا slug)..."
                />
                <button
                    type="button"
                    onClick={selectAllFiltered}
                    className="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                    انتخاب همه
                </button>
                <button
                    type="button"
                    onClick={clearAll}
                    className="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                    پاک کردن
                </button>
            </div>

            <div className="rounded-xl border border-slate-200">
                <div className="max-h-[360px] overflow-auto p-3 space-y-2">
                    {brandsQ.isLoading && (
                        <div className="text-sm text-gray-500">در حال بارگذاری...</div>
                    )}
                    {!brandsQ.isLoading && filtered.length === 0 && (
                        <div className="text-sm text-gray-500">برندی پیدا نشد.</div>
                    )}

                    {filtered.map((b) => {
                        const checked = brandIds.includes(b.id);
                        return (
                            <label
                                key={b.id}
                                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-slate-50"
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggle(b.id)}
                                        className="h-4 w-4"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {b.title}
                                        </span>
                                        <span className="text-xs text-gray-500" dir="ltr">
                                            {b.slug}
                                        </span>
                                    </div>
                                </div>

                                <span className="text-xs text-gray-500">
                                    {checked ? "انتخاب شده" : ""}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            <div className="text-xs text-gray-500 text-right">
                تعداد انتخاب شده: {brandIds.length}
            </div>
        </div>
    );
}
