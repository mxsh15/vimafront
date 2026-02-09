"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdminHomeBannerListItem, AdminHomeBannerUpsert } from "../types";
import MediaPickerDialog from "@/modules/media/ui/MediaPickerDialog";
import { resolveMediaIdByUrl } from "@/modules/blog/api.client";
import { resolveMediaUrl } from "@/modules/media/resolve-url";


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
    initial: AdminHomeBannerListItem | null;
    submitting: boolean;
    onSubmit: (dto: AdminHomeBannerUpsert) => Promise<void>;
};

function toLocalInputValue(isoOrEmpty: string) {
    // input[type=datetime-local] => "YYYY-MM-DDTHH:mm"
    if (!isoOrEmpty) return "";
    const d = new Date(isoOrEmpty);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
    )}:${pad(d.getMinutes())}`;
}

function fromLocalInputValue(local: string) {
    // برمی‌گردونیم ISO. اگر خالی => null
    if (!local) return null;
    const d = new Date(local);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
}

export default function HomeBannerUpsertModal({
    open,
    onOpenChange,
    initial,
    submitting,
    onSubmit,
}: Props) {
    const [mediaAssetId, setMediaAssetId] = useState(initial?.mediaAssetId ?? "");
    const [mediaUrl, setMediaUrl] = useState(initial?.mediaUrl ?? "");
    const [linkUrl, setLinkUrl] = useState(initial?.linkUrl ?? "");
    const [title, setTitle] = useState(initial?.title ?? "");
    const [altText, setAltText] = useState(initial?.altText ?? "");
    const [sortOrder, setSortOrder] = useState<number>(initial?.sortOrder ?? 0);
    const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);
    const [mediaDialogOpen, setMediaDialogOpen] = useState(false);

    // این دو تا رو به datetime-local تبدیل می‌کنیم که UI “ادمینی” بشه
    const [startAtLocal, setStartAtLocal] = useState<string>(
        toLocalInputValue(initial?.startAt ?? "")
    );
    const [endAtLocal, setEndAtLocal] = useState<string>(
        toLocalInputValue(initial?.endAt ?? "")
    );

    const [pickerOpen, setPickerOpen] = useState(false);

    const titleText = useMemo(
        () => (initial ? "ویرایش بنر" : "افزودن بنر"),
        [initial]
    );

    // وقتی مودال برای ردیف جدید باز میشه یا initial عوض میشه، state را sync کن
    useEffect(() => {
        if (!open) return;
        setMediaAssetId(initial?.mediaAssetId ?? "");
        setMediaUrl(initial?.mediaUrl ?? "");
        setLinkUrl(initial?.linkUrl ?? "");
        setTitle(initial?.title ?? "");
        setAltText(initial?.altText ?? "");
        setSortOrder(initial?.sortOrder ?? 0);
        setIsActive(initial?.isActive ?? true);
        setStartAtLocal(toLocalInputValue(initial?.startAt ?? ""));
        setEndAtLocal(toLocalInputValue(initial?.endAt ?? ""));
    }, [open, initial]);

    const canSubmit = !!mediaAssetId && !submitting;

    async function submit() {
        if (!mediaAssetId) {
            alert("انتخاب تصویر الزامی است.");
            return;
        }

        const startAt = fromLocalInputValue(startAtLocal);
        const endAt = fromLocalInputValue(endAtLocal);

        const dto: AdminHomeBannerUpsert = {
            mediaAssetId,
            linkUrl: linkUrl.trim() ? linkUrl.trim() : null,
            title: title.trim() ? title.trim() : null,
            altText: altText.trim() ? altText.trim() : null,
            sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
            isActive,
            startAt,
            endAt,
        };

        await onSubmit(dto);
    }

    function close() {
        onOpenChange(false);
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
                onClick={close}
            />

            {/* Dialog */}
            <div
                className="absolute left-1/2 top-1/2 w-[94vw] max-w-[860px] -translate-x-1/2 -translate-y-1/2"
                role="dialog"
                aria-modal="true"
            >
                <div className="rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <div className="flex flex-col">
                            <div className="text-sm font-semibold text-slate-900">{titleText}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                                تنظیم تصویر، لینک، ترتیب و زمان نمایش
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

                    {/* Body */}
                    <div className="px-5 py-4 max-h-[70vh] overflow-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
                            {/* Left: Media */}
                            <div className="rounded-2xl border border-slate-200 p-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs font-semibold text-slate-800">تصویر بنر</div>
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
                                        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                                            <img
                                                src={resolveMediaUrl(mediaUrl)}
                                                alt={altText || title || "banner"}
                                                className="h-44 w-full object-cover"
                                            />
                                            <div className="px-3 py-2 text-[11px] text-slate-500">
                                                پیش‌نمایش
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-44 w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 grid place-items-center text-[11px] text-slate-500">
                                            هنوز تصویری انتخاب نشده
                                        </div>
                                    )}
                                </div>

                                <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
                                    <div className="text-[10px] text-slate-500">MediaAssetId</div>
                                    <div className="text-[11px] text-slate-700 break-all">
                                        {mediaAssetId || "—"}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Fields */}
                            <div className="rounded-2xl border border-slate-200 p-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <label className="block md:col-span-2">
                                        <div className="text-[11px] font-semibold text-slate-700 mb-1">
                                            لینک
                                        </div>
                                        <input
                                            value={linkUrl}
                                            onChange={(e) => setLinkUrl(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[12px] outline-none focus:ring-2 focus:ring-slate-200"
                                            placeholder="مثلاً /products یا https://..."
                                        />
                                        <div className="mt-1 text-[10px] text-slate-500">
                                            اگر خالی باشد، بنر کلیک‌پذیر نیست.
                                        </div>
                                    </label>

                                    <label className="block">
                                        <div className="text-[11px] font-semibold text-slate-700 mb-1">
                                            عنوان
                                        </div>
                                        <input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[12px] outline-none focus:ring-2 focus:ring-slate-200"
                                            placeholder="اختیاری"
                                        />
                                    </label>

                                    <label className="block">
                                        <div className="text-[11px] font-semibold text-slate-700 mb-1">
                                            Alt
                                        </div>
                                        <input
                                            value={altText}
                                            onChange={(e) => setAltText(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[12px] outline-none focus:ring-2 focus:ring-slate-200"
                                            placeholder="اختیاری"
                                        />
                                    </label>

                                    <label className="block">
                                        <div className="text-[11px] font-semibold text-slate-700 mb-1">
                                            ترتیب نمایش
                                        </div>
                                        <input
                                            type="number"
                                            value={sortOrder}
                                            onChange={(e) =>
                                                setSortOrder(parseInt(e.target.value || "0", 10))
                                            }
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[12px] outline-none focus:ring-2 focus:ring-slate-200"
                                        />
                                        <div className="mt-1 text-[10px] text-slate-500">
                                            عدد کمتر = جلوتر.
                                        </div>
                                    </label>

                                    <div className="flex items-end">
                                        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 w-full">
                                            <input
                                                type="checkbox"
                                                checked={isActive}
                                                onChange={(e) => setIsActive(e.target.checked)}
                                                className="h-4 w-4"
                                            />
                                            <span className="text-[12px] text-slate-700">فعال</span>
                                        </label>
                                    </div>

                                    <label className="block">
                                        <div className="text-[11px] font-semibold text-slate-700 mb-1">
                                            شروع نمایش
                                        </div>
                                        <input
                                            type="datetime-local"
                                            value={startAtLocal}
                                            onChange={(e) => setStartAtLocal(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[12px] outline-none focus:ring-2 focus:ring-slate-200"
                                        />
                                        <div className="mt-1 text-[10px] text-slate-500">
                                            خالی = بدون محدودیت شروع.
                                        </div>
                                    </label>

                                    <label className="block">
                                        <div className="text-[11px] font-semibold text-slate-700 mb-1">
                                            پایان نمایش
                                        </div>
                                        <input
                                            type="datetime-local"
                                            value={endAtLocal}
                                            onChange={(e) => setEndAtLocal(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[12px] outline-none focus:ring-2 focus:ring-slate-200"
                                        />
                                        <div className="mt-1 text-[10px] text-slate-500">
                                            خالی = بدون محدودیت پایان.
                                        </div>
                                    </label>
                                </div>

                                {/* Inline warning example */}
                                {startAtLocal && endAtLocal && startAtLocal > endAtLocal ? (
                                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                                        شروع نمایش نباید بعد از پایان نمایش باشد.
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-white">
                        <div className="text-[11px] text-slate-500">
                            تصویر الزامی است. بقیه فیلدها اختیاری‌اند.
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="rounded-xl border border-slate-200 px-4 py-2 text-[12px] text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                                onClick={close}
                                disabled={submitting}
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
            </div>


            <MediaPickerDialog
                open={mediaDialogOpen}
                onClose={() => setMediaDialogOpen(false)}
                multiple={false}
                onSelect={(urls) => {
                    const url = urls?.[0];
                    if (!url) return;

                    // 1) URL پیش‌نمایش
                    setMediaUrl(url);
                    setMediaDialogOpen(false);

                    // 2) تبدیل URL به mediaAssetId (مثل بلاگ)
                    resolveMediaIdByUrl(url)
                        .then((id) => {
                            setMediaAssetId(id || "");
                        })
                        .catch(() => {
                            setMediaAssetId("");
                        });
                }}
                hasInitialImage={!!mediaUrl}
                initialSelectedUrls={mediaUrl ? [mediaUrl] : []}
            />
        </div>
    );
}
