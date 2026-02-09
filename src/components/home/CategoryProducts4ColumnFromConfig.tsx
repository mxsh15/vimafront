"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import { parseBySchema, CategoryProducts4ColumnConfigSchema } from "@/modules/home-template/types";
import { listPublicCategoryOptions } from "@/modules/category/api";
import type { CategoryOptionDto } from "@/modules/category/types";
import { getCategoryProductsGrid } from "@/modules/category/api";
import type { CategoryProductsGridDto } from "@/modules/category/types";

function getCategoryHref(c: { id: string; slug?: string | null }) {
    return `/category/${c.id}`;
}

function getProductHref(p: { slug: string }) {
    return `/product/${p.slug}`;
}
export function CategoryProducts4ColumnFromConfig(props: { configJson: string }) {
    const cfg = useMemo(
        () => parseBySchema(CategoryProducts4ColumnConfigSchema, props.configJson),
        [props.configJson]
    );

    const wrapClass = cfg.boxed
        ? "w-full max-w-[1336px] mx-auto px-4 2xl:px-0"
        : "w-full";

    const categoryIds = useMemo(
        () => (cfg.columns ?? []).map((c) => c.categoryId).filter(Boolean) as string[],
        [cfg.columns]
    );

    const [options, setOptions] = useState<CategoryOptionDto[]>([]);
    const [data, setData] = useState<CategoryProductsGridDto[]>([]);

    useEffect(() => {
        let mounted = true;
        listPublicCategoryOptions().then((res) => mounted && setOptions(res ?? []));
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        let mounted = true;
        if (!categoryIds.length) {
            setData([]);
            return;
        }
        getCategoryProductsGrid({ categoryIds, take: cfg.take ?? 4 })
            .then((res) => mounted && setData(res ?? []));
        return () => { mounted = false; };
    }, [categoryIds.join("|"), cfg.take]);

    const byCatId = useMemo(() => {
        const m = new Map<string, CategoryProductsGridDto>();
        for (const x of data) m.set(x.categoryId, x);
        return m;
    }, [data]);

    const optionById = useMemo(() => {
        const m = new Map<string, CategoryOptionDto>();
        for (const o of options) m.set(o.id, o);
        return m;
    }, [options]);

    const hasAny = (cfg.columns ?? []).some((c) => !!c.categoryId);
    if (!hasAny) return null;

    return (
        <div className={wrapClass}>
            <div className="grid grid-cols-1 lg:grid-cols-4 overflow-hidden bg-white lg:rounded-2xl lg:border lg:border-slate-200">                {(cfg.columns ?? []).map((col, idx) => {
                const catId = col.categoryId;
                const catOpt = catId ? optionById.get(catId) : null;
                const block = catId ? byCatId.get(catId) : null;

                const title = (col.titleOverride ?? "").trim() || (catOpt?.title ?? block?.categoryTitle ?? "انتخاب نشده");
                const subtitle = (cfg.subtitle ?? "بر اساس سلیقه شما").trim();

                const href = catId ? getCategoryHref({ id: catId, slug: catOpt?.slug }) : "#";
                const items = block?.items ?? [];

                return (
                    <div
                        key={idx}
                        className={[
                            "flex flex-col w-full h-full px-5 py-2 bg-white",
                            "lg:border-r lg:border-slate-200",
                            idx === 0 ? "lg:border-r-0" : "",
                            idx > 0 ? "border-t border-slate-200 lg:border-t-0" : "",
                        ].join(" ")}
                    >
                        <div className="flex items-center">
                            <div className="flex flex-col mb-2 w-full">
                                <div className="w-full flex items-center justify-between">
                                    <div className="flex items-center">
                                        <h4 className="text-base font-bold text-slate-800">{title}</h4>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 flex-1 bg-white">
                            {items.slice(0, 4).map((p) => {
                                const img = resolveMediaUrl((p.imageUrl ?? "").trim());
                                return (
                                    <Link
                                        key={p.id}
                                        href={getProductHref({ slug: p.slug, id: p.id })}
                                        className="
                                                flex items-center justify-center p-3
                                                border-b border-r border-slate-200
                                                transition-colors"
                                    >
                                        <span className="flex items-center h-full w-full">
                                            {img ? (
                                                <img
                                                    className="w-full aspect-square inline-block object-contain"
                                                    src={img}
                                                    alt={p.title}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full aspect-square rounded bg-slate-50 border border-slate-200" />
                                            )}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>

                        {catId && (
                            <div className="flex items-center justify-center mt-2 mb-3">
                                <Link
                                    className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-red-500"
                                    href={href}
                                >
                                    <span>مشاهده</span>
                                    <ChevronLeft className="h-4 w-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                );
            })}
            </div>
        </div>
    );
}
