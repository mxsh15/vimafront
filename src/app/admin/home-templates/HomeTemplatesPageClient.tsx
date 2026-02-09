"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { AdminHomeTemplateListItem } from "@/modules/home-template/types";
import {
    activateAdminHomeTemplate,
    cloneAdminHomeTemplate,
    deleteAdminHomeTemplate,
    createAdminHomeTemplate,
} from "@/modules/home-template/api";
import { Plus, Pencil, Check, Copy, Trash2 } from "lucide-react";
import { resolveMediaUrl } from "@/modules/media/resolve-url";

function slugifyFaLike(input: string) {
    return input
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-\u0600-\u06FF]/g, "");
}

export default function HomeTemplatesPageClient({ items }: { items: AdminHomeTemplateListItem[] }) {
    const router = useRouter();
    const [creating, setCreating] = useState(false);
    const [title, setTitle] = useState("");
    const [busyId, setBusyId] = useState<string | null>(null);

    const sorted = useMemo(() => {
        const active = items.filter((x) => x.isActiveForStore);
        const rest = items.filter((x) => !x.isActiveForStore);
        return [...active, ...rest];
    }, [items]);


    const isGuid = (v: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

    return (
        <div className="p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex flex-col">
                    <h1 className="text-lg font-bold text-slate-900">مدیریت قالب</h1>
                    <p className="text-xs text-slate-500">قالب صفحه اصلی را انتخاب/ویرایش کن. بله، مثل بقیه‌ی دنیا.</p>
                </div>

                <button
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                    onClick={() => setCreating(true)}
                >
                    <Plus className="h-4 w-4" />
                    ایجاد قالب جدید
                </button>
            </div>

            {creating && (
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                            className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                            placeholder="عنوان قالب (مثلاً: قالب دیجی‌کالا)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <div className="md:col-span-2 flex items-center gap-2">
                            <button
                                disabled={!title.trim()}
                                className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-50"
                                onClick={async () => {
                                    const t = title.trim();
                                    const slug = slugifyFaLike(t);
                                    try {
                                        setBusyId("create");
                                        await createAdminHomeTemplate({
                                            title: t,
                                            slug,
                                            description: null,
                                            thumbnailMediaAssetId: null,
                                            isEnabled: true,
                                        });
                                        setCreating(false);
                                        setTitle("");
                                        router.refresh();
                                    } finally {
                                        setBusyId(null);
                                    }
                                }}
                            >
                                ساخت
                            </button>
                            <button
                                className="h-11 rounded-xl border border-slate-200 px-4 text-sm"
                                onClick={() => {
                                    setCreating(false);
                                    setTitle("");
                                }}
                            >
                                انصراف
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {sorted.map((t) => (
                    <div key={t.id} className="rounded-3xl bg-white border border-slate-200 overflow-hidden">
                        <div className="p-4">
                            <div className="rounded-2xl bg-slate-100 overflow-hidden aspect-[16/9]">
                                {t.thumbnailUrl ? (
                                    <img
                                        src={resolveMediaUrl(t.thumbnailUrl)}
                                        alt={t.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                                        پیش‌نمایش ندارد
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex items-start justify-between gap-3">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-sm font-bold text-slate-900">{t.title}</h2>
                                        {t.isActiveForStore && (
                                            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                                                فعال
                                            </span>
                                        )}
                                        {!t.isEnabled && (
                                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                                غیرفعال
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        {t.description ?? "—"}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        {t.sectionsCount} سکشن
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 p-4 pt-0">

                            { }

                            <button
                                className="h-11 rounded-2xl border border-slate-200 text-sm font-semibold hover:bg-slate-50"
                                onClick={() => {
                                    if (!t?.id || !isGuid(t.id)) {
                                        console.error("Invalid template id:", t?.id);
                                        return;
                                    }
                                    console.log("EDIT CLICK", { id: t.id, type: typeof t.id, raw: JSON.stringify(t) });
                                    router.push(`/admin/home-templates/${t.id}`);
                                }}
                            >
                                <span className="inline-flex items-center gap-2 justify-center">
                                    <Pencil className="h-4 w-4" /> ویرایش
                                </span>
                            </button>

                            <button
                                disabled={busyId === t.id || t.isActiveForStore || !t.isEnabled}
                                className="h-11 rounded-2xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                                onClick={async () => {
                                    try {
                                        setBusyId(t.id);
                                        await activateAdminHomeTemplate(t.id);
                                        router.refresh();
                                    } finally {
                                        setBusyId(null);
                                    }
                                }}
                            >
                                <span className="inline-flex items-center gap-2 justify-center">
                                    <Check className="h-4 w-4" /> انتخاب
                                </span>
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    className="flex-1 h-11 rounded-2xl border border-slate-200 text-sm hover:bg-slate-50"
                                    onClick={async () => {
                                        try {
                                            setBusyId(t.id);
                                            const r = await cloneAdminHomeTemplate(t.id);
                                            router.push(`/admin/home-templates/${r.id}`);
                                        } finally {
                                            setBusyId(null);
                                        }
                                    }}
                                    title="کپی"
                                >
                                    <Copy className="h-4 w-4 mx-auto" />
                                </button>

                                <button
                                    disabled={t.isSystem}
                                    className="flex-1 h-11 rounded-2xl border border-red-200 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                                    onClick={async () => {
                                        if (t.isSystem) return;
                                        try {
                                            setBusyId(t.id);
                                            await deleteAdminHomeTemplate(t.id);
                                            router.refresh();
                                        } finally {
                                            setBusyId(null);
                                        }
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
        </div>
    );
}
