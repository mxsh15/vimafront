"use client";

import { useEffect, useMemo, useState } from "react";
import MediaPickerDialog from "@/modules/media/ui/MediaPickerDialog";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import { resolveMediaIdByUrl } from "@/modules/blog/api.client";
import type { AdminQuickServiceListItem, AdminQuickServiceUpsert } from "../types";

function XIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

type Props = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    initial: AdminQuickServiceListItem | null;
    submitting: boolean;
    onSubmit: (dto: AdminQuickServiceUpsert) => Promise<void>;
};

export default function QuickServiceUpsertModal({
    open,
    onOpenChange,
    initial,
    submitting,
    onSubmit,
}: Props) {
    const [mediaAssetId, setMediaAssetId] = useState(initial?.mediaAssetId ?? "");
    const [mediaUrl, setMediaUrl] = useState(initial?.mediaUrl ?? "");
    const [title, setTitle] = useState(initial?.title ?? "");
    const [linkUrl, setLinkUrl] = useState(initial?.linkUrl ?? "");
    const [sortOrder, setSortOrder] = useState<number>(initial?.sortOrder ?? 0);
    const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);
    const [mediaDialogOpen, setMediaDialogOpen] = useState(false);

    const titleText = useMemo(() => (initial ? "ویرایش آیتم" : "افزودن آیتم"), [initial]);

    useEffect(() => {
        if (!open) return;
        setMediaAssetId(initial?.mediaAssetId ?? "");
        setMediaUrl(initial?.mediaUrl ?? "");
        setTitle(initial?.title ?? "");
        setLinkUrl(initial?.linkUrl ?? "");
        setSortOrder(initial?.sortOrder ?? 0);
        setIsActive(initial?.isActive ?? true);
    }, [open, initial]);

    const canSubmit = !!mediaAssetId && !!title.trim() && !submitting;

    async function submit() {
        if (!mediaAssetId) return alert("انتخاب تصویر الزامی است.");
        if (!title.trim()) return alert("عنوان الزامی است.");

        const dto: AdminQuickServiceUpsert = {
            mediaAssetId,
            title: title.trim(),
            linkUrl: linkUrl.trim() ? linkUrl.trim() : null,
            sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
            isActive,
        };

        await onSubmit(dto);
    }

    function close() {
        onOpenChange(false);
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" onClick={close} />

            <div
                className="absolute left-1/2 top-1/2 w-[94vw] max-w-[820px] -translate-x-1/2 -translate-y-1/2"
                role="dialog"
                aria-modal="true"
            >
                <div className="rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <div className="flex flex-col">
                            <div className="text-sm font-semibold text-slate-900">{titleText}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                                تصویر + عنوان + لینک + ترتیب نمایش
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={close}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 h-9 w-9 text-slate-600 hover:bg-slate-50"
                            aria-label="بستن"
                        >
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="px-5 py-4 max-h-[70vh] overflow-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
                            <div className="rounded-2xl border border-slate-200 p-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs font-semibold text-slate-800">تصویر آیتم</div>
                                    <button
                                        type="button"
                                        onClick={() => setMediaDialogOpen(true)}
                                        className="rounded-xl border px-3 py-2 text-sm"
                                    >
                                        انتخاب از پرونده چندرسانه‌ای
                                    </button>
                                </div>

                                <div className="mt-3">
                                    {mediaUrl ? (
                                        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-4 grid place-items-center">
                                            <img
                                                src={resolveMediaUrl(mediaUrl)}
                                                alt={title || "icon"}
                                                className="h-20 w-20 rounded-full object-cover border border-slate-200 bg-white"
                                            />
                                            <div className="mt-2 text-[11px] text-slate-500">پیش‌نمایش</div>
                                        </div>
                                    ) : (
                                        <div className="h-32 w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 grid place-items-center text-[11px] text-slate-500">
                                            هنوز تصویری انتخاب نشده
                                        </div>
                                    )}
                                </div>

                                <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
                                    <div className="text-[10px] text-slate-500">MediaAssetId</div>
                                    <div className="text-[11px] text-slate-700 break-all">{mediaAssetId || "—"}</div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 p-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <label className="block md:col-span-2">
                                        <div className="text-[11px] font-semibold text-slate-700 mb-1">عنوان</div>
                                        <input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[12px] outline-none focus:ring-2 focus:ring-slate-200"
                                            placeholder="مثلاً سوپرمارکت"
                                        />
                                    </label>

                                    <label className="block md:col-span-2">
                                        <div className="text-[11px] font-semibold text-slate-700 mb-1">لینک</div>
                                        <input
                                            value={linkUrl}
                                            onChange={(e) => setLinkUrl(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[12px] outline-none focus:ring-2 focus:ring-slate-200"
                                            placeholder="مثلاً /search?q=... یا https://..."
                                        />
                                        <div className="mt-1 text-[10px] text-slate-500">اگر خالی باشد کلیک‌پذیر نیست.</div>
                                    </label>

                                    <label className="block">
                                        <div className="text-[11px] font-semibold text-slate-700 mb-1">ترتیب</div>
                                        <input
                                            type="number"
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(Number(e.target.value))}
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[12px] outline-none focus:ring-2 focus:ring-slate-200"
                                        />
                                    </label>

                                    <label className="flex items-center gap-2 mt-6">
                                        <input
                                            type="checkbox"
                                            checked={isActive}
                                            onChange={(e) => setIsActive(e.target.checked)}
                                            className="h-4 w-4"
                                        />
                                        <span className="text-[12px] text-slate-700">فعال</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50">
                        <button
                            type="button"
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
                            onClick={close}
                        >
                            انصراف
                        </button>
                        <button
                            type="button"
                            className="rounded-xl bg-slate-900 px-4 py-2 text-[12px] font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                            onClick={submit}
                            disabled={!canSubmit}
                        >
                            {submitting ? "در حال ذخیره..." : "ذخیره"}
                        </button>
                    </div>
                </div>
            </div>

            <MediaPickerDialog
                open={mediaDialogOpen}
                onClose={() => setMediaDialogOpen(false)}
                multiple={false}
                onSelect={(urls) => {
                    const url = urls?.[0];
                    if (!url) return;

                    setMediaUrl(url);
                    setMediaDialogOpen(false);

                    resolveMediaIdByUrl(url)
                        .then((id) => setMediaAssetId(id || ""))
                        .catch(() => setMediaAssetId(""));
                }}
                hasInitialImage={!!mediaUrl}
                initialSelectedUrls={mediaUrl ? [mediaUrl] : []}
            />
        </div>
    );
}
