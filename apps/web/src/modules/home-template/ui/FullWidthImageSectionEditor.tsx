"use client";

import { useMemo, useState } from "react";
import MediaPickerDialog from "@/modules/media/ui/MediaPickerDialog";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import { ImagePlus, Trash2 } from "lucide-react";
import { FullWidthImageConfigSchema, parseBySchema, safeJsonStringify } from "../types";

export function FullWidthImageSectionEditor(props: {
    value: string;
    onChange: (json: string) => void;
}) {
    const cfg = useMemo(
        () =>
            parseBySchema(FullWidthImageConfigSchema, props.value, {
                imageUrl: "",
                alt: "",
                href: "",
                fixedHeight: false,
                heightPx: 360,
            }),
        [props.value]
    );

    const [pickerOpen, setPickerOpen] = useState(false);

    function update(next: any) {
        props.onChange(safeJsonStringify(next));
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-bold text-slate-900">تصویر تمام‌عرض</div>

                <button
                    className="h-10 rounded-2xl bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700"
                    onClick={() => setPickerOpen(true)}
                >
                    <span className="inline-flex items-center gap-2">
                        <ImagePlus className="h-4 w-4" />
                        انتخاب تصویر
                    </span>
                </button>
            </div>

            {!cfg.imageUrl ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                    هنوز تصویری انتخاب نشده.
                </div>
            ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                    <div className="flex items-start gap-3">
                        <div className="h-24 w-40 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                            <img
                                src={resolveMediaUrl(cfg.imageUrl)}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        </div>

                        <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">alt (اختیاری)</div>
                                    <input
                                        className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                                        placeholder="مثلاً بنر جشنواره"
                                        value={cfg.alt ?? ""}
                                        onChange={(e) => update({ ...cfg, alt: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <div className="text-xs text-slate-500 mb-1">لینک (اختیاری)</div>
                                    <input
                                        className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                                        placeholder="مثلاً /category/watch یا https://..."
                                        value={cfg.href ?? ""}
                                        onChange={(e) => update({ ...cfg, href: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <label className="inline-flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={!!cfg.fixedHeight}
                                        onChange={(e) => update({ ...cfg, fixedHeight: e.target.checked })}
                                    />
                                    ارتفاع ثابت (cover)
                                </label>

                                {cfg.fixedHeight && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">ارتفاع (px)</span>
                                        <input
                                            type="number"
                                            min={120}
                                            max={1200}
                                            className="h-10 w-28 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                                            value={cfg.heightPx ?? 360}
                                            onChange={(e) =>
                                                update({ ...cfg, heightPx: Number(e.target.value || 0) })
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            className="h-10 w-10 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => update({ ...cfg, imageUrl: "" })}
                            title="حذف تصویر"
                        >
                            <Trash2 className="h-4 w-4 mx-auto" />
                        </button>
                    </div>
                </div>
            )}

            <MediaPickerDialog
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                multiple={false}
                confirmLabel="انتخاب"
                onSelect={(urls) => {
                    const u = urls?.[0] ?? "";
                    update({ ...cfg, imageUrl: u });
                    setPickerOpen(false);
                }}
            />
        </div>
    );
}
