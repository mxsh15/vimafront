"use client";

import { useTransition, useState } from "react";
import type { StoreSettingsDto } from "../types";
import { updateSettingsAction } from "../actions";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import MediaPickerDialog from "@/modules/media/ui/MediaPickerDialog";
import { formatGregorianISO, parseGregorianISO, toGregorian, toJalali } from "@/lib/jalali";
import TimezoneSelect from "@/shared/components/TimezoneSelect";

type Props = { settings: StoreSettingsDto };

export default function AdminSettingsForm({ settings }: Props) {
    const [pending, startTransition] = useTransition();
    const [logoMediaOpen, setLogoMediaOpen] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string>(settings.logoUrl ?? "");
    const [timeZoneId, setTimeZoneId] = useState<string>(settings.timeZoneId ?? "Asia/Tehran");

    const initialG = parseGregorianISO(settings.dateFormat) ?? (() => {
        const d = new Date();
        return { gy: d.getFullYear(), gm: d.getMonth() + 1, gd: d.getDate() };
    })();

    const initialJ = toJalali(initialG.gy, initialG.gm, initialG.gd);

    const [jalaliY, setJalaliY] = useState(initialJ.jy);
    const [jalaliM, setJalaliM] = useState(initialJ.jm);
    const [jalaliD, setJalaliD] = useState(initialJ.jd);

    const g = toGregorian(jalaliY, jalaliM, jalaliD);
    const gregorianISO = formatGregorianISO(g.gy, g.gm, g.gd);


    return (
        <form
            action={(fd) => {
                // sync state -> formData
                fd.set("logoUrl", logoUrl || "");
                startTransition(async () => {
                    await updateSettingsAction(fd);
                });
            }}
            className="space-y-6"
        >
            <input type="hidden" name="rowVersion" value={settings.rowVersion} />

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-700">اطلاعات عمومی</div>
                    <button
                        type="submit"
                        disabled={pending}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-60"
                    >
                        {pending ? "در حال ذخیره..." : "ذخیره تنظیمات"}
                    </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-right">
                        <span className="mb-1 block text-xs text-slate-500">نام فروشگاه</span>
                        <input
                            name="storeName"
                            defaultValue={settings.storeName}
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-slate-700 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="ShopVima"
                        />
                    </label>

                    <div className="sm:col-span-2">
                        <div className="rounded-xl border border-gray-200 bg-white p-3">
                            <div className="mb-2 text-xs text-slate-500">لوگو</div>

                            {logoUrl ? (
                                <div className="mb-3">
                                    <img
                                        src={resolveMediaUrl(logoUrl)}
                                        alt="لوگو"
                                        className="h-24 w-24 rounded border border-gray-200 object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="mb-3 flex h-24 w-24 items-center justify-center rounded border border-dashed border-gray-300 text-xs text-gray-400">
                                    لوگو انتخاب نشده
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setLogoMediaOpen(true)}
                                    className="rounded border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    انتخاب از کتابخانه
                                </button>

                                {logoUrl ? (
                                    <button
                                        type="button"
                                        onClick={() => setLogoUrl("")}
                                        className="rounded border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-gray-50"
                                    >
                                        حذف
                                    </button>
                                ) : null}
                            </div>

                            <input type="hidden" name="logoUrl" value={logoUrl} />
                        </div>
                    </div>


                    <label className="block text-right">
                        <span className="mb-1 block text-xs text-slate-500">ایمیل پشتیبانی</span>
                        <input
                            name="supportEmail"
                            defaultValue={settings.supportEmail ?? ""}
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-slate-700 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="support@..."
                        />
                    </label>

                    <label className="block text-right">
                        <span className="mb-1 block text-xs text-slate-500">شماره پشتیبانی</span>
                        <input
                            name="supportPhone"
                            defaultValue={settings.supportPhone ?? ""}
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-slate-700 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="09..."
                        />
                    </label>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 text-sm font-semibold text-slate-700">شبکه‌های اجتماعی</div>
                <div className="grid gap-4 sm:grid-cols-2">
                    {[
                        ["instagramUrl", "Instagram", settings.instagramUrl],
                        ["telegramUrl", "Telegram", settings.telegramUrl],
                        ["whatsappUrl", "WhatsApp", settings.whatsappUrl],
                        ["youtubeUrl", "YouTube", settings.youtubeUrl],
                        ["linkedinUrl", "LinkedIn", settings.linkedinUrl],
                    ].map(([name, label, val]) => (
                        <label key={name as string} className="block text-right">
                            <span className="mb-1 block text-xs text-slate-500">{label}</span>
                            <input
                                name={name as string}
                                defaultValue={(val as string) ?? ""}
                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-slate-700 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="https://..."
                            />
                        </label>
                    ))}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 text-sm font-semibold text-slate-700">SEO عمومی</div>
                <div className="grid gap-4">
                    <label className="block text-right">
                        <span className="mb-1 block text-xs text-slate-500">Default Meta Title</span>
                        <input
                            name="defaultMetaTitle"
                            defaultValue={settings.defaultMetaTitle ?? ""}
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-slate-700 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </label>

                    <label className="block text-right">
                        <span className="mb-1 block text-xs text-slate-500">Default Meta Description</span>
                        <textarea
                            name="defaultMetaDescription"
                            defaultValue={settings.defaultMetaDescription ?? ""}
                            className="min-h-[90px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-slate-700 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block text-right">
                            <span className="mb-1 block text-xs text-slate-500">Canonical Base URL</span>
                            <input
                                name="canonicalBaseUrl"
                                defaultValue={settings.canonicalBaseUrl ?? ""}
                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-slate-700 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="https://example.com"
                            />
                        </label>

                        <label className="block text-right">
                            <span className="mb-1 block text-xs text-slate-500">Sitemap</span>
                            <select
                                name="sitemapEnabled"
                                defaultValue={String(settings.sitemapEnabled)}
                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-slate-700 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="true">فعال</option>
                                <option value="false">غیرفعال</option>
                            </select>
                        </label>
                    </div>

                    <label className="block text-right">
                        <span className="mb-1 block text-xs text-slate-500">Robots.txt</span>
                        <textarea
                            name="robotsTxt"
                            defaultValue={settings.robotsTxt ?? ""}
                            className="min-h-[140px] w-full rounded-md border border-gray-200 px-3 py-2 font-mono text-xs text-slate-700 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder={"User-agent: *\nDisallow:"}
                        />
                    </label>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 text-sm font-semibold text-slate-700">زمان و فرمت</div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-right">
                        <span className="mb-1 block text-xs text-slate-500">TimeZone</span>
                        <TimezoneSelect value={timeZoneId} onChange={setTimeZoneId} name="timeZoneId" />
                    </label>
                    <label className="block text-right">
                        <span className="mb-1 block text-xs text-slate-500">فرمت نمایش تاریخ</span>

                        <select
                            name="dateFormat"
                            defaultValue={settings.dateFormat || "yyyy/MM/dd"}
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="yyyy/MM/dd">yyyy/MM/dd (1404/09/26)</option>
                            <option value="yyyy-MM-dd">yyyy-MM-dd (1404-09-26)</option>
                            <option value="dd/MM/yyyy">dd/MM/yyyy (26/09/1404)</option>
                            <option value="dd-MM-yyyy">dd-MM-yyyy (26-09-1404)</option>
                            <option value="yyyy/MM/dd HH:mm">yyyy/MM/dd HH:mm</option>
                            <option value="yyyy-MM-dd HH:mm">yyyy-MM-dd HH:mm</option>
                        </select>
                    </label>

                </div>
            </div>


            <MediaPickerDialog
                open={logoMediaOpen}
                onClose={() => setLogoMediaOpen(false)}
                multiple={false}
                confirmLabel="انتخاب لوگو"
                onSelect={(urls) => {
                    const url = urls[0];
                    if (url) setLogoUrl(url);
                    setLogoMediaOpen(false);
                }}
                hasInitialImage={!!logoUrl}
            />

        </form>
    );
}
