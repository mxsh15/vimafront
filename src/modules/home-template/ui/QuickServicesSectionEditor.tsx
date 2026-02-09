"use client";

import { useMemo, useState } from "react";
import MediaPickerDialog from "@/modules/media/ui/MediaPickerDialog";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import { ArrowUp, ArrowDown, Trash2, Plus, ImagePlus } from "lucide-react";
import { QuickServicesConfigSchema, parseBySchema, safeJsonStringify } from "../types";

export function QuickServicesSectionEditor(props: {
    value: string;
    onChange: (json: string) => void;
}) {
    const cfg = useMemo(
        () =>
            parseBySchema(QuickServicesConfigSchema, props.value, {
                boxed: true,
                title: "",
                items: [],
            }),
        [props.value]
    );

    const [pickerIndex, setPickerIndex] = useState<number | null>(null);

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
                <div className="text-sm font-bold text-slate-900">خدمات سریع</div>
                <button
                    className="h-10 rounded-2xl bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700"
                    onClick={() => {
                        update({
                            ...cfg,
                            items: [
                                ...cfg.items,
                                { iconUrl: "", title: "عنوان", href: "/" },
                            ],
                        });
                    }}
                >
                    <span className="inline-flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        افزودن آیتم
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
                        هنوز آیتمی تعریف نشده.
                    </div>
                )}

                {cfg.items.map((it, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white p-3">
                        <div className="grid grid-cols-1 md:grid-cols-[120px_1fr_44px] gap-3 items-start">
                            <button
                                type="button"
                                className="rounded-2xl border border-slate-200 bg-slate-50 p-3 hover:bg-slate-100"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setPickerIndex(i);
                                }}
                            >
                                <div className="text-[11px] text-slate-500 mb-2">آیکون</div>
                                <div className="h-16 w-16 rounded-xl bg-white mx-auto overflow-hidden flex items-center justify-center">
                                    {it.iconUrl ? (
                                        <img
                                            src={resolveMediaUrl(it.iconUrl)}
                                            alt=""
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <ImagePlus className="h-5 w-5 text-slate-400" />
                                    )}
                                </div>
                            </button>

                            <div className="space-y-2">
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">عنوان</div>
                                    <input
                                        className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                                        value={it.title}
                                        onChange={(e) => {
                                            const next = cfg.items.slice();
                                            next[i] = { ...it, title: e.target.value };
                                            update({ ...cfg, items: next });
                                        }}
                                    />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">لینک</div>
                                    <input
                                        className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                                        value={it.href}
                                        onChange={(e) => {
                                            const next = cfg.items.slice();
                                            next[i] = { ...it, href: e.target.value };
                                            update({ ...cfg, items: next });
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        move(i, -1);
                                    }}
                                    title="بالا"
                                >
                                    <ArrowUp className="h-4 w-4 mx-auto" />
                                </button>
                                <button className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50" onClick={() => move(i, 1)} title="پایین">
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
                open={pickerIndex !== null}
                onClose={() => setPickerIndex(null)}
                multiple={false}
                confirmLabel="انتخاب آیکون"
                onSelect={(urls) => {
                    const url = urls?.[0];
                    if (!url) return;
                    const i = pickerIndex!;
                    const next = cfg.items.slice();
                    next[i] = { ...next[i], iconUrl: url };
                    update({ ...cfg, items: next });
                    setPickerIndex(null);
                }}
            />
        </div>
    );
}
