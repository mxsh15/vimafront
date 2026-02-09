"use client";

import { useMemo, useState } from "react";
import MediaPickerDialog from "@/modules/media/ui/MediaPickerDialog";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import { ArrowUp, ArrowDown, Trash2, ImagePlus } from "lucide-react";
import { BannerRowConfigSchema, parseBySchema, safeJsonStringify } from "../types";

export function BannerRowSectionEditor(props: {
    value: string;
    onChange: (json: string) => void;
}) {
    const cfg = useMemo(
        () =>
            parseBySchema(BannerRowConfigSchema, props.value, {
                boxed: true,
                columns: 4,
                gap: 12,
                items: [],
            }),
        [props.value]
    );

    const [pickerOpen, setPickerOpen] = useState(false);

    function update(next: any) {
        props.onChange(safeJsonStringify(next));
    }

    function move(i: number, dir: -1 | 1) {
        const j = i + dir;
        if (j < 0 || j >= cfg.items.length) return;
        const nextItems = cfg.items.slice();
        const tmp = nextItems[i];
        nextItems[i] = nextItems[j];
        nextItems[j] = tmp;
        update({ ...cfg, items: nextItems });
    }

    const columns = Math.max(1, Math.min(6, Math.floor(cfg.columns ?? 4)));
    const gap = Math.max(0, Math.min(32, Math.floor(cfg.gap ?? 12)));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-bold text-slate-900">
                    بنرهای شبکه‌ای ({columns} ستونه)
                </div>

                <button
                    type="button"
                    className="h-10 rounded-2xl bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700"
                    onClick={() => setPickerOpen(true)}
                >
                    <span className="inline-flex items-center gap-2">
                        <ImagePlus className="h-4 w-4" />
                        افزودن بنر
                    </span>
                </button>
            </div>

            {/* تنظیمات */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="inline-flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={!!cfg.boxed}
                        onChange={(e) => update({ ...cfg, boxed: e.target.checked })}
                    />
                    Boxed باشد
                </label>

                <div>
                    <div className="text-xs text-slate-500 mb-1">تعداد ستون‌ها</div>
                    <input
                        type="number"
                        min={1}
                        max={6}
                        className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                        value={columns}
                        onChange={(e) => {
                            const n = Number(e.target.value || 4);
                            update({ ...cfg, columns: Math.max(1, Math.min(6, Math.floor(n))) });
                        }}
                    />
                    <div className="text-[11px] text-slate-400 mt-1">
                        پیشنهاد: ۲ تا ۴ برای موبایل/دسکتاپ معمولاً بهتره.
                    </div>
                </div>

                <div>
                    <div className="text-xs text-slate-500 mb-1">فاصله بین بنرها (px)</div>
                    <input
                        type="number"
                        min={0}
                        max={32}
                        className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                        value={gap}
                        onChange={(e) => {
                            const n = Number(e.target.value || 12);
                            update({ ...cfg, gap: Math.max(0, Math.min(32, Math.floor(n))) });
                        }}
                    />
                </div>
            </div>

            {/* لیست آیتم‌ها */}
            <div className="space-y-2">
                {cfg.items.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                        هنوز هیچ بنری اضافه نکردی.
                    </div>
                )}

                {cfg.items.map((it, i) => (
                    <div key={it.imageUrl + i} className="rounded-2xl border border-slate-200 bg-white p-3">
                        <div className="flex items-start gap-3">
                            <div className="h-20 w-32 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                                <img src={resolveMediaUrl(it.imageUrl)} alt="" className="h-full w-full object-cover" />
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">alt (اختیاری)</div>
                                        <input
                                            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                                            placeholder="مثلاً ساعت کاسیو"
                                            value={it.alt ?? ""}
                                            onChange={(e) => {
                                                const next = cfg.items.slice();
                                                next[i] = { ...it, alt: e.target.value };
                                                update({ ...cfg, items: next });
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">لینک</div>
                                        <input
                                            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                                            placeholder="مثلاً /category/watch یا https://..."
                                            value={it.href ?? ""}
                                            onChange={(e) => {
                                                const next = cfg.items.slice();
                                                next[i] = { ...it, href: e.target.value };
                                                update({ ...cfg, items: next });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50"
                                    onClick={() => move(i, -1)}
                                    title="بالا"
                                >
                                    <ArrowUp className="h-4 w-4 mx-auto" />
                                </button>
                                <button
                                    type="button"
                                    className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50"
                                    onClick={() => move(i, 1)}
                                    title="پایین"
                                >
                                    <ArrowDown className="h-4 w-4 mx-auto" />
                                </button>
                                <button
                                    type="button"
                                    className="h-10 w-10 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                        const next = cfg.items.filter((_, idx) => idx !== i);
                                        update({ ...cfg, items: next });
                                    }}
                                    title="حذف"
                                >
                                    <Trash2 className="h-4 w-4 mx-auto" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <MediaPickerDialog
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                multiple={true}
                confirmLabel="افزودن بنرها"
                onSelect={(urls) => {
                    const next = [
                        ...cfg.items,
                        ...urls.map((u) => ({
                            imageUrl: u,
                            alt: "",
                            href: "",
                        })),
                    ];
                    update({ ...cfg, items: next });
                    setPickerOpen(false);
                }}
            />
        </div>
    );
}
