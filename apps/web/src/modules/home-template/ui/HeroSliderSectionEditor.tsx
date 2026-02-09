"use client";

import { useMemo, useState } from "react";
import MediaPickerDialog from "@/modules/media/ui/MediaPickerDialog";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import { ArrowUp, ArrowDown, Trash2, ImagePlus } from "lucide-react";
import { HeroSliderConfigSchema, parseBySchema, safeJsonStringify } from "../types";

export function HeroSliderSectionEditor(props: {
    value: string;
    onChange: (json: string) => void;
}) {
    const cfg = useMemo(
        () =>
            parseBySchema(HeroSliderConfigSchema, props.value, {
                boxed: true,
                title: "",
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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-bold text-slate-900">اسلایدر اصلی</div>
                <button
                    className="h-10 rounded-2xl bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700"
                    onClick={() => setPickerOpen(true)}
                >
                    <span className="inline-flex items-center gap-2">
                        <ImagePlus className="h-4 w-4" />
                        افزودن تصویر
                    </span>
                </button>
            </div>

            <label className="inline-flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={cfg.boxed}
                    onChange={(e) => update({ ...cfg, boxed: e.target.checked })}
                />
                Boxed باشد
            </label>

            <div className="space-y-2">
                {cfg.items.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                        هنوز هیچ تصویری اضافه نکردی.
                    </div>
                )}

                {cfg.items.map((it, i) => (
                    <div key={it.imageUrl + i} className="rounded-2xl border border-slate-200 bg-white p-3">
                        <div className="flex items-start gap-3">
                            <div className="h-20 w-32 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                                <img
                                    src={resolveMediaUrl(it.imageUrl)}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="text-xs text-slate-500">لینک (اختیاری)</div>
                                <input
                                    className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                                    placeholder="مثلاً /category/123 یا https://..."
                                    value={it.href ?? ""}
                                    onChange={(e) => {
                                        const next = cfg.items.slice();
                                        next[i] = { ...it, href: e.target.value || null };
                                        update({ ...cfg, items: next });
                                    }}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <button
                                    className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50"
                                    onClick={() => move(i, -1)}
                                    title="بالا"
                                >
                                    <ArrowUp className="h-4 w-4 mx-auto" />
                                </button>
                                <button
                                    className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50"
                                    onClick={() => move(i, 1)}
                                    title="پایین"
                                >
                                    <ArrowDown className="h-4 w-4 mx-auto" />
                                </button>
                                <button
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
                confirmLabel="افزودن به اسلایدر"
                onSelect={(urls) => {
                    const next = [
                        ...cfg.items,
                        ...urls.map((u) => ({ imageUrl: u, href: null })),
                    ];
                    update({ ...cfg, items: next });
                    setPickerOpen(false);
                }}
            />
        </div>
    );
}
