"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import {
    HomeSectionType,
    type AdminHomeTemplateDetail,
    type AdminHomeTemplateSection,
} from "@/modules/home-template/types";

import {
    saveAdminHomeTemplateSections,
    updateAdminHomeTemplate,
    activateAdminHomeTemplate,
    getAdminHomeTemplate,
} from "@/modules/home-template/api";

import { ArrowUp, ArrowDown, Plus, Save, CheckCircle2, Trash2 } from "lucide-react";

import { HeroSliderSectionEditor } from "@/modules/home-template/ui/HeroSliderSectionEditor";
import { QuickServicesSectionEditor } from "@/modules/home-template/ui/QuickServicesSectionEditor";
import { AmazingProductsSectionEditor } from "@/modules/home-template/ui/AmazingProductsSectionEditor";
import { BannerRowSectionEditor } from "@/modules/home-template/ui/BannerRowSectionEditor";
import { FullWidthImageSectionEditor } from "@/modules/home-template/ui/FullWidthImageSectionEditor";
import { CategoryIconsSectionEditor } from "@/modules/home-template/ui/CategoryIconsSectionEditor";
import { TopBrandsSectionEditor } from "@/modules/home-template/ui/TopBrandsSectionEditor";
import { CategoryProducts4ColumnSectionEditor } from "@/modules/home-template/ui/CategoryProducts4ColumnSectionEditor";
import { CategoryProductsSliderSectionEditor } from "@/modules/home-template/ui/CategoryProductsSliderSectionEditor";

type SectionState = AdminHomeTemplateSection & { clientId: string };

const SECTION_CATALOG: Array<{ type: HomeSectionType; title: string; defaultConfig: object }> = [
    { type: HomeSectionType.Stories, title: "استوری‌ها", defaultConfig: { boxed: true, take: 12, title: "استوری‌ها" } },
    { type: HomeSectionType.HeroSlider, title: "اسلایدر اصلی", defaultConfig: { boxed: true, title: "", items: [] } },
    { type: HomeSectionType.QuickServices, title: "خدمات سریع", defaultConfig: { boxed: true, title: "", items: [] } },
    {
        type: HomeSectionType.AmazingProducts,
        title: "پیشنهاد شگفت‌انگیز",
        defaultConfig: { boxed: true, take: 20, title: "پیشنهاد شگفت‌انگیز", categoryId: null, startAtUtc: null, endAtUtc: null },
    },
    { type: HomeSectionType.BannerRow, title: "شبکه بنرها", defaultConfig: { boxed: true, items: [] } },
    { type: HomeSectionType.Spacer, title: "فاصله", defaultConfig: { height: 16 } },
    {
        type: HomeSectionType.FullWidthImage,
        title: "تصویر تمام‌عرض",
        defaultConfig: { imageUrl: "", alt: "", href: "", fixedHeight: false, heightPx: 360 },
    },
    {
        type: HomeSectionType.CategoryIcons,
        title: "آیکن دسته‌بندی‌ها (دیجی‌کالا)",
        defaultConfig: { title: "خرید بر اساس دسته‌بندی", boxed: true, items: [], imageSize: 100 },
    },
    { type: HomeSectionType.TopBrands, title: "محبوب‌ترین برندها", defaultConfig: { boxed: true, title: "محبوب‌ترین برندها", brandIds: [] } },
    {
        type: HomeSectionType.CategoryProducts4Column,
        title: "محصولات ۴ ستونه بر اساس دسته‌بندی",
        defaultConfig: {
            boxed: true,
            subtitle: "بر اساس سلیقه شما",
            take: 4,
            columns: [{ categoryId: null }, { categoryId: null }, { categoryId: null }, { categoryId: null }],
        },
    },
    { type: HomeSectionType.BestSellingProducts, title: "پرفروش‌ترین کالاها", defaultConfig: {} },
    {
        type: HomeSectionType.CategoryProductsSlider,
        title: "اسلایدر محصولات (انتخاب دسته‌بندی)",
        defaultConfig: { boxed: true, title: "محصولات منتخب", take: 12, categoryIds: [], showAllHref: "", showAllText: "نمایش همه" },
    },
];

function typeLabel(t: HomeSectionType) {
    const x = SECTION_CATALOG.find((s) => s.type === t);
    return x?.title ?? `Section ${t}`;
}

export default function HomeTemplateEditorPageClient({ initial }: { initial: AdminHomeTemplateDetail }) {
    const router = useRouter();

    const [meta, setMeta] = useState({
        title: initial.title,
        slug: initial.slug,
        description: initial.description ?? "",
        thumbnailMediaAssetId: initial.thumbnailMediaAssetId ?? null,
        isEnabled: initial.isEnabled,
    });

    const [sections, setSections] = useState<SectionState[]>(
        (initial.sections ?? []).map((s, idx) => ({
            ...s,
            sortOrder: idx + 1,
            clientId: s.id ?? crypto.randomUUID(),
        }))
    );

    const [selectedIndex, setSelectedIndex] = useState<number>(sections.length ? 0 : -1);
    const [busy, setBusy] = useState<string | null>(null);

    // ✅ Add Section popover state + search
    const [addMenuOpen, setAddMenuOpen] = useState(false);
    const [sectionSearch, setSectionSearch] = useState("");
    const addMenuRef = useRef<HTMLDivElement | null>(null);

    const selected = selectedIndex >= 0 && selectedIndex < sections.length ? sections[selectedIndex] : null;

    const normalized = useMemo(() => {
        return sections.map((s, i) => ({ ...s, sortOrder: i + 1 }));
    }, [sections]);

    const payload = sections.map((s, i) => ({
        id: s.id ?? null,
        type: s.type,
        title: s.title,
        sortOrder: i + 1,
        isEnabled: s.isEnabled,
        configJson: s.configJson,
    }));

    const filteredCatalog = useMemo(() => {
        const q = sectionSearch.trim();
        if (!q) return SECTION_CATALOG;
        return SECTION_CATALOG.filter((x) => x.title.includes(q));
    }, [sectionSearch]);

    function move(i: number, dir: -1 | 1) {
        const j = i + dir;
        if (j < 0 || j >= sections.length) return;
        const next = sections.slice();
        const tmp = next[i];
        next[i] = next[j];
        next[j] = tmp;
        setSections(next);
        setSelectedIndex(j);
    }

    function addSection(type: HomeSectionType) {
        const item = SECTION_CATALOG.find((x) => x.type === type);
        const configJson = JSON.stringify(item?.defaultConfig ?? {}, null, 2);

        const next: SectionState = {
            id: null,
            type,
            title: item?.title ?? typeLabel(type),
            sortOrder: sections.length + 1,
            isEnabled: true,
            configJson,
            clientId: crypto.randomUUID(),
        };

        setSections([...sections, next]);
        setSelectedIndex(sections.length);

        // ✅ close menu + reset search
        setAddMenuOpen(false);
        setSectionSearch("");
    }

    function removeSection(i: number) {
        const next = sections.slice();
        next.splice(i, 1);
        setSections(next);

        setSelectedIndex((prev) => {
            if (next.length === 0) return -1;
            if (prev === i) return Math.min(i, next.length - 1);
            if (prev > i) return prev - 1;
            return prev;
        });
    }

    useEffect(() => {
        if (sections.length === 0) {
            if (selectedIndex !== -1) setSelectedIndex(-1);
            return;
        }
        if (selectedIndex < 0) setSelectedIndex(0);
        if (selectedIndex >= sections.length) setSelectedIndex(sections.length - 1);
    }, [sections.length, selectedIndex]);

    useEffect(() => {
        setMeta({
            title: initial.title,
            slug: initial.slug,
            description: initial.description ?? "",
            thumbnailMediaAssetId: initial.thumbnailMediaAssetId ?? null,
            isEnabled: initial.isEnabled,
        });

        setSections(
            (initial.sections ?? []).map((s, idx) => ({
                ...s,
                sortOrder: idx + 1,
                clientId: s.id ?? crypto.randomUUID(),
            }))
        );

        setSelectedIndex((initial.sections?.length ?? 0) ? 0 : -1);
    }, [initial.id, initial.updatedAtUtc]);

    // ✅ click-outside close for add menu
    useEffect(() => {
        if (!addMenuOpen) return;

        function onPointerDown(e: PointerEvent) {
            const el = addMenuRef.current;
            if (!el) return;
            if (el.contains(e.target as Node)) return;
            setAddMenuOpen(false);
            setSectionSearch("");
        }

        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [addMenuOpen]);

    return (
        <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex flex-col">
                    <h1 className="text-lg font-bold text-slate-900">ویرایش قالب</h1>
                    <p className="text-xs text-slate-500">سکشن‌ها را بچین. بعدش سایت مثل آدم رندر می‌شود.</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        className="h-11 rounded-2xl border border-slate-200 px-4 text-sm font-semibold hover:bg-slate-50"
                        onClick={() => router.push("/admin/home-templates")}
                    >
                        برگشت
                    </button>

                    <button
                        disabled={busy !== null}
                        className="h-11 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                        onClick={async () => {
                            try {
                                setBusy("activate");
                                await activateAdminHomeTemplate(initial.id);
                                router.refresh();
                            } finally {
                                setBusy(null);
                            }
                        }}
                    >
                        <span className="inline-flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" /> فعال‌کردن برای فروشگاه
                        </span>
                    </button>

                    <button
                        disabled={busy !== null}
                        className="h-11 rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                        onClick={async () => {
                            try {
                                setBusy("save-all");
                                await updateAdminHomeTemplate(initial.id, meta);
                                await saveAdminHomeTemplateSections(initial.id, payload);

                                const fresh = await getAdminHomeTemplate(initial.id);
                                setSections(
                                    (fresh.sections ?? []).map((s, idx) => ({
                                        ...s,
                                        sortOrder: idx + 1,
                                        clientId: s.id ?? crypto.randomUUID(),
                                    }))
                                );

                                setSelectedIndex((fresh.sections?.length ?? 0) ? 0 : -1);

                                setMeta({
                                    title: fresh.title,
                                    slug: fresh.slug,
                                    description: fresh.description ?? "",
                                    thumbnailMediaAssetId: fresh.thumbnailMediaAssetId ?? null,
                                    isEnabled: fresh.isEnabled,
                                });
                            } finally {
                                setBusy(null);
                            }
                        }}
                    >
                        <span className="inline-flex items-center gap-2">
                            <Save className="h-4 w-4" /> ذخیره
                        </span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
                {/* Left: sections list */}
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-bold text-slate-900">سکشن‌ها</div>

                        {/* ✅ Clean popover menu */}
                        <div className="relative" ref={addMenuRef}>
                            <button
                                type="button"
                                className="h-10 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700"
                                onClick={() => setAddMenuOpen((v) => !v)}
                                aria-haspopup="menu"
                                aria-expanded={addMenuOpen}
                            >
                                <Plus className="h-4 w-4" /> افزودن سکشن
                            </button>

                            {addMenuOpen && (
                                <div
                                    className="
                    absolute z-50 mt-2 right-0
                    w-[340px]
                    rounded-2xl border border-slate-200 bg-white shadow-lg
                    overflow-hidden
                  "
                                    role="menu"
                                >
                                    <div className="p-2 border-b border-slate-100">
                                        <input
                                            autoFocus
                                            placeholder="جستجو در سکشن‌ها..."
                                            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                                            value={sectionSearch}
                                            onChange={(e) => setSectionSearch(e.target.value)}
                                        />
                                    </div>

                                    <div className="max-h-[340px] overflow-y-auto p-2">
                                        {filteredCatalog.length === 0 ? (
                                            <div className="px-3 py-6 text-center text-sm text-slate-400">
                                                چیزی پیدا نشد.
                                            </div>
                                        ) : (
                                            filteredCatalog.map((s) => (
                                                <button
                                                    key={s.type}
                                                    type="button"
                                                    className="w-full text-right rounded-xl px-3 py-2 text-sm hover:bg-slate-50"
                                                    onClick={() => addSection(s.type)} // ✅ closes menu
                                                    role="menuitem"
                                                >
                                                    {s.title}
                                                </button>
                                            ))
                                        )}
                                    </div>

                                    <div className="p-2 border-t border-slate-100 flex items-center justify-between">
                                        <button
                                            type="button"
                                            className="h-9 px-3 rounded-xl border border-slate-200 text-sm hover:bg-slate-50"
                                            onClick={() => {
                                                setSectionSearch("");
                                            }}
                                        >
                                            پاک‌کردن جستجو
                                        </button>

                                        <button
                                            type="button"
                                            className="h-9 px-3 rounded-xl bg-slate-900 text-white text-sm hover:bg-slate-800"
                                            onClick={() => {
                                                setAddMenuOpen(false);
                                                setSectionSearch("");
                                            }}
                                        >
                                            بستن
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ✅ limited height + scroll */}
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                        {normalized.map((s, i) => {
                            const isSelected = i === selectedIndex;

                            return (
                                <div
                                    key={(s as any).id ?? (s as any).clientId}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setSelectedIndex(i)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            setSelectedIndex(i);
                                        }
                                    }}
                                    className={[
                                        "w-full text-right rounded-2xl border p-3 transition cursor-pointer select-none",
                                        "focus:outline-none focus:ring-2 focus:ring-blue-300",
                                        isSelected ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50",
                                    ].join(" ")}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-900">{s.title}</span>
                                            <span className="text-[11px] text-slate-500">{typeLabel(s.type)}</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                className="h-9 w-9 rounded-xl border border-slate-200 hover:bg-white"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    move(i, -1);
                                                }}
                                                title="بالا"
                                            >
                                                <ArrowUp className="h-4 w-4 mx-auto" />
                                            </button>

                                            <button
                                                type="button"
                                                className="h-9 w-9 rounded-xl border border-slate-200 hover:bg-white"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    move(i, 1);
                                                }}
                                                title="پایین"
                                            >
                                                <ArrowDown className="h-4 w-4 mx-auto" />
                                            </button>

                                            <button
                                                type="button"
                                                className="h-9 w-9 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeSection(i);
                                                }}
                                                title="حذف"
                                                aria-label="حذف سکشن"
                                            >
                                                <Trash2 className="h-4 w-4 mx-auto" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {!normalized.length && (
                            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                                هیچ سکشنی نداری. تعجب‌آور نیست.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: editor */}
                <div className="space-y-6">
                    {/* Template meta */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-5">
                        <div className="text-sm font-bold text-slate-900 mb-3">مشخصات قالب</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                                className="h-11 rounded-2xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                                value={meta.title}
                                onChange={(e) => setMeta((x) => ({ ...x, title: e.target.value }))}
                                placeholder="عنوان"
                            />
                            <input
                                className="h-11 rounded-2xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                                value={meta.slug}
                                onChange={(e) => setMeta((x) => ({ ...x, slug: e.target.value }))}
                                placeholder="slug"
                            />
                            <textarea
                                className="min-h-[90px] md:col-span-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-300"
                                value={meta.description}
                                onChange={(e) => setMeta((x) => ({ ...x, description: e.target.value }))}
                                placeholder="توضیحات"
                            />
                            <label className="md:col-span-2 inline-flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={meta.isEnabled}
                                    onChange={(e) => setMeta((x) => ({ ...x, isEnabled: e.target.checked }))}
                                />
                                قالب فعال باشد
                            </label>
                        </div>
                    </div>

                    {/* Section config */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-5">
                        <div className="text-sm font-bold text-slate-900 mb-3">تنظیمات سکشن</div>

                        {!selected && (
                            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                                یک سکشن را از لیست انتخاب کن.
                            </div>
                        )}

                        {selected && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input
                                        className="h-11 rounded-2xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                                        value={selected.title}
                                        onChange={(e) => {
                                            const next = sections.slice();
                                            next[selectedIndex] = { ...selected, title: e.target.value };
                                            setSections(next);
                                        }}
                                        placeholder="عنوان سکشن"
                                    />

                                    <label className="inline-flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={selected.isEnabled}
                                            onChange={(e) => {
                                                const next = sections.slice();
                                                next[selectedIndex] = { ...selected, isEnabled: e.target.checked };
                                                setSections(next);
                                            }}
                                        />
                                        سکشن فعال باشد
                                    </label>
                                </div>

                                {/* UI اختصاصی بر اساس نوع سکشن */}
                                {selected.type === HomeSectionType.HeroSlider && (
                                    <HeroSliderSectionEditor
                                        value={selected.configJson}
                                        onChange={(json) => {
                                            const next = sections.slice();
                                            next[selectedIndex] = { ...selected, configJson: json };
                                            setSections(next);
                                        }}
                                    />
                                )}

                                {selected.type === HomeSectionType.QuickServices && (
                                    <QuickServicesSectionEditor
                                        value={selected.configJson}
                                        onChange={(json) => {
                                            const next = sections.slice();
                                            next[selectedIndex] = { ...selected, configJson: json };
                                            setSections(next);
                                        }}
                                    />
                                )}

                                {selected.type === HomeSectionType.AmazingProducts && (
                                    <AmazingProductsSectionEditor
                                        value={selected.configJson}
                                        onChange={(json) => {
                                            const next = sections.slice();
                                            next[selectedIndex] = { ...selected, configJson: json };
                                            setSections(next);
                                        }}
                                    />
                                )}

                                {selected.type === HomeSectionType.BannerRow && (
                                    <BannerRowSectionEditor
                                        value={selected.configJson}
                                        onChange={(json) => {
                                            const next = sections.slice();
                                            next[selectedIndex] = { ...selected, configJson: json };
                                            setSections(next);
                                        }}
                                    />
                                )}

                                {selected.type === HomeSectionType.FullWidthImage && (
                                    <FullWidthImageSectionEditor
                                        value={selected.configJson}
                                        onChange={(json) => {
                                            const next = sections.slice();
                                            next[selectedIndex] = { ...selected, configJson: json };
                                            setSections(next);
                                        }}
                                    />
                                )}

                                {selected.type === HomeSectionType.CategoryIcons && (
                                    <CategoryIconsSectionEditor
                                        value={selected.configJson}
                                        onChange={(json) => {
                                            const next = sections.slice();
                                            next[selectedIndex] = { ...selected, configJson: json };
                                            setSections(next);
                                        }}
                                    />
                                )}

                                {selected.type === HomeSectionType.TopBrands && (
                                    <TopBrandsSectionEditor
                                        section={selected}
                                        onChange={(json) => {
                                            const next = sections.slice();
                                            next[selectedIndex] = { ...selected, configJson: json };
                                            setSections(next);
                                        }}
                                    />
                                )}

                                {selected.type === HomeSectionType.CategoryProducts4Column && (
                                    <CategoryProducts4ColumnSectionEditor
                                        value={selected.configJson}
                                        onChange={(json) => {
                                            setSections((prev) => {
                                                if (selectedIndex < 0 || selectedIndex >= prev.length) return prev;
                                                const cur = prev[selectedIndex];
                                                if (cur.configJson === json) return prev;
                                                const next = prev.slice();
                                                next[selectedIndex] = { ...cur, configJson: json };
                                                return next;
                                            });
                                        }}
                                    />
                                )}

                                {selected.type === HomeSectionType.CategoryProductsSlider && (
                                    <CategoryProductsSliderSectionEditor
                                        value={selected.configJson}
                                        onChange={(json) => {
                                            const next = sections.slice();
                                            next[selectedIndex] = { ...selected, configJson: json };
                                            setSections(next);
                                        }}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
