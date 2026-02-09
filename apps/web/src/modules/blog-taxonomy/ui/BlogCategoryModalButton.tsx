"use client";

import { useState, useTransition, useEffect, useMemo, } from "react";
import {
    SchemaPresetId,
    buildSchemaTemplate,
    schemaPresets,
} from "@/modules/seo/schema-presets";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import type {
    BlogCategoryUpsertDto,
    BlogCategoryOptionDto,
} from "../types";
import { upsertBlogCategoryAction } from "../actions";
import { normalizeSlug } from "@/lib/slug";

const SEO_TITLE_LIMIT = 60;
const SEO_DESC_LIMIT = 160;

function getSeoBarClass(len: number, max: number) {
    if (len === 0) return "bg-gray-200";
    if (len <= max) return "bg-emerald-500";
    return "bg-red-500";
}

type Props = {
    category?: BlogCategoryUpsertDto | null;
    allCategories: BlogCategoryOptionDto[];
    triggerLabel?: string;
    triggerClassName?: string;
    initialOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export function BlogCategoryModalButton({
    category,
    allCategories,
    triggerLabel = "دسته جدید",
    triggerClassName,
    initialOpen = false,
    onOpenChange,
}: Props) {
    const [open, setOpen] = useState(initialOpen);
    const setOpenSafe = (v: boolean) => {
        setOpen(v);
        onOpenChange?.(v);
    };
    const [pending, startTransition] = useTransition();

    const [form, setForm] = useState<BlogCategoryUpsertDto>(
        category ?? {
            name: "",
            slug: "",
            description: "",
            parentId: undefined,
            metaTitle: null,
            metaDescription: null,
            keywords: null,
            canonicalUrl: null,
            seoMetaRobots: null,
            seoSchemaJson: null,
            autoGenerateSnippet: true,
            autoGenerateHeadTags: true,
            includeInSitemap: true
        }
    );

    const handleSubmit = () => {
        const fixed = {
            ...form,
            slug: normalizeSlug(form.slug),
        };

        startTransition(async () => {
            await upsertBlogCategoryAction(fixed);
            setOpenSafe(false);
        });
    };

    /* ------------------ SEO ------------------ */
    const [seoTitle, setSeoTitle] = useState(category?.metaTitle ?? "");
    const [seoMetaDescription, setSeoMetaDescription] = useState(category?.metaDescription ?? "");
    const [seoCanonicalUrl, setSeoCanonicalUrl] = useState(category?.canonicalUrl ?? "");
    const [seoSchemaJson, setSeoSchemaJson] = useState<string>(category?.seoSchemaJson ?? "");
    const [schemaPresetId, setSchemaPresetId] = useState<SchemaPresetId | "">("");

    const seoTitleLength = seoTitle.trim().length;
    const seoDescLength = seoMetaDescription.trim().length;

    // meta robots (مثل BlogPost)
    const [robotsIndex, setRobotsIndex] = useState(false);
    const [robotsNoIndex, setRobotsNoIndex] = useState(false);
    const [robotsNoFollow, setRobotsNoFollow] = useState(false);
    const [robotsNoArchive, setRobotsNoArchive] = useState(false);
    const [robotsNoSnippet, setRobotsNoSnippet] = useState(false);
    const [robotsNoImageIndex, setRobotsNoImageIndex] = useState(false);

    useEffect(() => {
        const robots = (category?.seoMetaRobots ?? "").toLowerCase();
        setRobotsNoIndex(robots.includes("noindex"));
        setRobotsIndex(!robots.includes("noindex") && robots.includes("index"));
        setRobotsNoFollow(robots.includes("nofollow"));
        setRobotsNoArchive(robots.includes("noarchive"));
        setRobotsNoSnippet(robots.includes("nosnippet"));
        setRobotsNoImageIndex(robots.includes("noimageindex"));
    }, [category]);

    const computedSeoMetaRobots = useMemo(() => {
        const tokens: string[] = [];
        if (robotsNoIndex) tokens.push("noindex");
        else if (robotsIndex) tokens.push("index");
        if (robotsNoFollow) tokens.push("nofollow");
        if (robotsNoArchive) tokens.push("noarchive");
        if (robotsNoSnippet) tokens.push("nosnippet");
        if (robotsNoImageIndex) tokens.push("noimageindex");
        return tokens.join(",");
    }, [
        robotsIndex,
        robotsNoIndex,
        robotsNoFollow,
        robotsNoArchive,
        robotsNoSnippet,
        robotsNoImageIndex,
    ]);

    // schema presets
    const applySchemaPreset = (id: SchemaPresetId) => {
        const origin =
            typeof window !== "undefined" ? window.location.origin : "https://example.com";

        const json = buildSchemaTemplate(id, {
            origin,
            slug: form.slug,
            title: form.name || seoTitle,
            descriptionHtml: "", // category content نداریم
            fallbackMetaDescription: seoMetaDescription,
            imagePath: undefined,
            price: null,
            createdAtUtc: null,
            updatedAtUtc: null,
        });

        setSchemaPresetId(id);
        setSeoSchemaJson(JSON.stringify(json, null, 2));
    };


    return (
        <>
            <button
                type="button"
                className={
                    triggerClassName ??
                    "rounded-xl bg-emerald-600 px-3 py-1.5 text-xs text-white"
                }
                onClick={() => setOpenSafe(true)}
            >
                {triggerLabel}
            </button>

            <Dialog open={open} onClose={() => setOpenSafe(false)} className="relative z-50">
                <DialogBackdrop className="fixed inset-0 bg-black/30" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg">                           <DialogTitle className="mb-3 text-sm font-semibold">
                        {category ? "ویرایش دسته‌بندی بلاگ" : "دسته‌بندی جدید بلاگ"}
                    </DialogTitle>
                        <div className="min-h-0 flex-1 overflow-y-auto max-h-[calc(100vh-180px)] p-6">
                            <div className="grid gap-4 md:grid-cols-1">
                                <div className="space-y-3 text-xs">
                                    <div>
                                        <label className="mb-1 block text-slate-700">نام دسته</label>
                                        <input
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                                            value={form.name}
                                            onChange={(e) =>
                                                setForm((f) => ({ ...f, name: e.target.value }))
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-slate-700">Slug</label>
                                        <input
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs ltr"
                                            value={form.slug}
                                            onChange={(e) => {
                                                const raw = e.target.value;
                                                const fixed = raw.includes(" ") ? normalizeSlug(raw) : raw;
                                                setForm((f) => ({ ...f, slug: fixed }));
                                            }}
                                            onBlur={() => setForm((f) => ({ ...f, slug: normalizeSlug(f.slug) }))}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-slate-700">
                                            دسته والد (اختیاری)
                                        </label>
                                        <select
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                                            value={form.parentId ?? ""}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    parentId: e.target.value || undefined,
                                                }))
                                            }
                                        >
                                            <option value="">— بدون والد —</option>
                                            {allCategories
                                                .filter((c) => c.id !== form.id)
                                                .map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-slate-700">توضیحات</label>
                                        <textarea
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                                            rows={3}
                                            value={form.description ?? ""}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    description: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>

                                    {/* SEO */}
                                    <div className="rounded bg-white p-3 space-y-2">
                                        <h3 className="text-xs font-semibold">SEO</h3>

                                        <input
                                            value={seoTitle}
                                            onChange={(e) => setSeoTitle(e.target.value)}
                                            placeholder="Meta Title"
                                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                                        />

                                        <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-600">
                                            <div className="flex-1 h-1 rounded bg-gray-200 overflow-hidden">
                                                <div
                                                    className={`h-1 ${getSeoBarClass(seoTitleLength, SEO_TITLE_LIMIT)}`}
                                                    style={{ width: `${Math.min(100, (seoTitleLength / SEO_TITLE_LIMIT) * 100)}%` }}
                                                />
                                            </div>
                                            <span className={seoTitleLength > SEO_TITLE_LIMIT ? "text-red-500" : "text-emerald-600"}>
                                                {seoTitleLength}/{SEO_TITLE_LIMIT}
                                            </span>
                                        </div>

                                        <textarea
                                            value={seoMetaDescription}
                                            onChange={(e) => setSeoMetaDescription(e.target.value)}
                                            rows={2}
                                            placeholder="Meta Description"
                                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                                        />

                                        <div className="flex items-center gap-2 text-[11px] text-gray-600">
                                            <div className="flex-1 h-1 rounded bg-gray-200 overflow-hidden">
                                                <div
                                                    className={`h-1 ${getSeoBarClass(seoDescLength, SEO_DESC_LIMIT)}`}
                                                    style={{ width: `${Math.min(100, (seoDescLength / SEO_DESC_LIMIT) * 100)}%` }}
                                                />
                                            </div>
                                            <span className={seoDescLength > SEO_DESC_LIMIT ? "text-red-500" : "text-emerald-600"}>
                                                {seoDescLength}/{SEO_DESC_LIMIT}
                                            </span>
                                        </div>

                                        <label className="block text-right">
                                            <span className="mb-1 block text-xs text-gray-700">URL متعارف (Canonical)</span>
                                            <input
                                                value={seoCanonicalUrl}
                                                onChange={(e) => setSeoCanonicalUrl(e.target.value)}
                                                dir="ltr"
                                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                                                placeholder="https://example.com/blog/category/..."
                                            />
                                            <p className="mt-1 text-[11px] text-gray-500">
                                                اگر خالی بماند، به‌طور خودکار از آدرس خود صفحه استفاده می‌شود.
                                            </p>
                                        </label>

                                        {/* Robots (اختیاری UI؛ ولی hidden submit حتماً باشد) */}
                                        <div className="mt-2 grid grid-cols-2 gap-2 text-[12px]">
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" checked={robotsNoIndex} onChange={(e) => setRobotsNoIndex(e.target.checked)} />
                                                noindex
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" checked={robotsIndex} onChange={(e) => setRobotsIndex(e.target.checked)} />
                                                index
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" checked={robotsNoFollow} onChange={(e) => setRobotsNoFollow(e.target.checked)} />
                                                nofollow
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" checked={robotsNoArchive} onChange={(e) => setRobotsNoArchive(e.target.checked)} />
                                                noarchive
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" checked={robotsNoSnippet} onChange={(e) => setRobotsNoSnippet(e.target.checked)} />
                                                nosnippet
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" checked={robotsNoImageIndex} onChange={(e) => setRobotsNoImageIndex(e.target.checked)} />
                                                noimageindex
                                            </label>
                                        </div>

                                        {/* Schema JSON-LD */}
                                        <div className="mt-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-gray-700">اسکیما (JSON-LD)</span>
                                                <span className="text-[11px] text-gray-400">
                                                    یک نوع اسکیما را انتخاب کنید یا JSON را ویرایش کنید.
                                                </span>
                                            </div>

                                            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                                                {schemaPresets.map((p: any) => (
                                                    <div
                                                        key={p.id}
                                                        className="flex items-center justify-between rounded border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800"
                                                    >
                                                        <div className="text-right">
                                                            <div className="font-semibold">{p.label}</div>
                                                            <div className="text-[10px] text-gray-500">
                                                                {p.schemaType} – {p.description}
                                                            </div>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => applySchemaPreset(p.id)}
                                                            className="ml-2 rounded border border-indigo-500 px-2 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50"
                                                        >
                                                            استفاده +
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <textarea
                                                rows={6}
                                                dir="ltr"
                                                value={seoSchemaJson}
                                                onChange={(e) => setSeoSchemaJson(e.target.value)}
                                                className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-xs font-mono text-gray-900 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2 text-xs">
                            <button
                                type="button"
                                className="rounded-xl border border-slate-200 px-3 py-1.5"
                                onClick={() => setOpenSafe(false)}
                            >
                                انصراف
                            </button>
                            <button
                                type="button"
                                disabled={pending}
                                className="rounded-xl bg-emerald-600 px-3 py-1.5 text-white disabled:opacity-60"
                                onClick={handleSubmit}
                            >
                                {pending ? "در حال ذخیره..." : "ذخیره"}
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    );
}
