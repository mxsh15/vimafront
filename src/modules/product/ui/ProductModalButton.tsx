"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import RichHtmlEditor from "@/components/admin/RichHtmlEditor";
import { upsertProductFormAction } from "../actions";
import MediaPickerDialog from "@/modules/media/ui/MediaPickerDialog";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import type {
  ProductListItemDto,
  BrandOptionDto,
  VendorOptionDto,
  VariantRow,
  VariantAttributeValueDto,
  ProductVariantDetailDto,
} from "../types";
import {
  ProductAttributeListItemDto,
  AttributeGroupListItemDto,
  ProductSpecItemDto,
} from "@/modules/specs/types";
import { ProductSpecsEditor } from "@/modules/specs/ui/ProductSpecsEditor";
import { getProductSpecsClient } from "@/modules/specs/client-api";
import { CategoryOptionDto } from "@/modules/category/types";
import { bffFetch } from "@/lib/fetch-bff";
import {
  SchemaPresetId,
  buildSchemaTemplate,
  schemaPresets,
} from "@/modules/seo/schema-presets";
import { TagListItemDto } from "@/modules/tag/types";
import { createTagClient } from "@/modules/tag/client-api";
import { useServerActionMutation } from "@/lib/react-query/use-server-action-mutation";
import SearchableSelect from "@/shared/components/SearchableSelect";
import { apiFetch } from "@/lib/api";
import { StoreSettingsDto } from "@/modules/settings/types";

const SEO_TITLE_LIMIT = 60;
const SEO_DESC_LIMIT = 160;

function getSeoBarClass(len: number, max: number) {
  if (len === 0) return "bg-gray-200";
  if (len <= max) return "bg-emerald-500";
  return "bg-red-500";
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9 4h2v12H9z" />
      <path d="M4 9h12v2H4z" />
    </svg>
  );
}

type Props = {
  product?: ProductListItemDto;
  brandOptions: BrandOptionDto[];
  vendorOptions: VendorOptionDto[];
  attributeOptions: ProductAttributeListItemDto[];
  groupOptions: AttributeGroupListItemDto[];
  productSpecs?: ProductSpecItemDto[];
  categoryOptions: CategoryOptionDto[];
  initialCategoryIds?: string[];
  initialGalleryImages?: string[];
  initialTagIds?: string[];
  asHeader?: boolean;
  triggerVariant?: "primary" | "link";
  label?: string;
  className?: string;
  tagOptions: TagListItemDto[];
};

function buildCategoryTree(options: CategoryOptionDto[]) {
  type Node = { cat: CategoryOptionDto; depth: number };
  const byParent: Record<string, CategoryOptionDto[]> = {};

  for (const cat of options) {
    const key = cat.parentId ?? "root";
    if (!byParent[key]) byParent[key] = [];
    byParent[key].push(cat);
  }

  Object.values(byParent).forEach((list) => {
    list.sort((a, b) => a.title.localeCompare(b.title, "fa"));
  });

  const result: Node[] = [];

  function dfs(parentId: string | null, depth: number) {
    const key = parentId ?? "root";
    const children = byParent[key] ?? [];
    for (const cat of children) {
      result.push({ cat, depth });
      dfs(cat.id, depth + 1);
    }
  }

  dfs(null, 0);
  return result;
}

function validateVariantRow(v: VariantRow) {
  const price = v.price ? Number(v.price) : null;
  const discountPrice = v.discountPrice ? Number(v.discountPrice) : null;
  const minVar = v.minVariablePrice ? Number(v.minVariablePrice) : null;
  const maxVar = v.maxVariablePrice ? Number(v.maxVariablePrice) : null;

  const errors: string[] = [];

  const fieldErrors: {
    price?: string;
    discountPrice?: string;
    minVariablePrice?: string;
    maxVariablePrice?: string;
  } = {};

  // 1) discountPrice باید >= price باشد
  if (discountPrice != null && price != null && discountPrice < price) {
    const msg = "قیمت قبل از تخفیف نباید از قیمت فعلی کمتر باشد.";
    errors.push(msg);
    fieldErrors.discountPrice = msg;
  }

  // 2) minVariablePrice نباید از maxVariablePrice بیشتر باشد
  if (minVar != null && maxVar != null && minVar > maxVar) {
    const msg = "حداقل قیمت متغیر نمی‌تواند از حداکثر قیمت متغیر بیشتر باشد.";
    errors.push(msg);
    fieldErrors.minVariablePrice = msg;
    fieldErrors.maxVariablePrice = msg;
  }

  // 3) قیمت فعلی نباید کمتر از حداقل قیمت متغیر باشد
  if (price != null && minVar != null && price < minVar) {
    const msg = "قیمت فعلی نباید از حداقل قیمت متغیر کمتر باشد.";
    errors.push(msg);
    fieldErrors.price = msg;
  }

  // 4) قیمت فعلی نباید بیشتر از حداکثر قیمت متغیر باشد
  if (price != null && maxVar != null && price > maxVar) {
    const msg = "قیمت فعلی نباید از حداکثر قیمت متغیر بیشتر باشد.";
    errors.push(msg);
    fieldErrors.price = fieldErrors.price ?? msg;
  }

  return {
    hasError: errors.length > 0,
    messages: errors,
    fieldErrors,
  };
}

export default function ProductModalButton({
  product,
  brandOptions,
  vendorOptions,
  attributeOptions,
  groupOptions,
  productSpecs,
  categoryOptions,
  initialCategoryIds,
  initialGalleryImages,
  initialTagIds,
  asHeader,
  triggerVariant = product ? "link" : "primary",
  label,
  className,
  tagOptions,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  // Image field
  const [primaryImageUrl, setPrimaryImageUrl] = useState<string>(
    product?.primaryImageUrl ?? ""
  );
  const [mediaOpen, setMediaOpen] = useState(false);

  // Image Gallery field
  const [galleryImages, setGalleryImages] = useState<string[]>(
    initialGalleryImages ?? []
  );
  const [galleryMediaOpen, setGalleryMediaOpen] = useState(false);

  // HTML fields
  const [descriptionHtml, setDescriptionHtml] = useState<string>(
    product?.descriptionHtml ?? ""
  );

  // مارکتینگ و ویترین
  const [isFeatured, setIsFeatured] = useState<boolean>(
    product?.isFeatured ?? false
  );
  const [allowCustomerQuestions, setAllowCustomerQuestions] = useState<boolean>(
    product?.allowCustomerQuestions ?? true
  );
  const [allowCustomerReviews, setAllowCustomerReviews] = useState<boolean>(
    product?.allowCustomerReviews ?? true
  );

  const [status, setStatus] = useState<number>(product?.status ?? 1);
  const [saleModel, setSaleModel] = useState<number>(product?.saleModel ?? 0);

  // تنظیمات موجودی و فروش در سطح پیشنهاد فروشنده
  const [manageStock, setManageStock] = useState(
    product?.isVariantProduct
      ? false
      : product?.defaultOfferManageStock ?? false
  );

  const [stockStatus, setStockStatus] = useState<number>(
    product?.isVariantProduct ? 1 : product?.defaultOfferStockStatus ?? 1
  );

  const [backorderPolicy, setBackorderPolicy] = useState<number>(
    (product as any)?.backorderPolicy ?? 0
  );

  const [lowStockThreshold, setLowStockThreshold] = useState<string>(
    (product as any)?.lowStockThreshold != null
      ? String((product as any).lowStockThreshold)
      : ""
  );

  // SEO
  const [seoTitle, setSeoTitle] = useState(product?.metaTitle ?? "");
  const [seoMetaDescription, setSeoMetaDescription] = useState(
    product?.metaDescription ?? ""
  );
  const [seoKeywords, setSeoKeywords] = useState(product?.keywords ?? "");
  const [seoCanonicalUrl, setSeoCanonicalUrl] = useState(
    product?.canonicalUrl ?? ""
  );

  // Meta Robots UI
  const [robotsIndex, setRobotsIndex] = useState(false); // index
  const [robotsNoIndex, setRobotsNoIndex] = useState(false); // noindex
  const [robotsNoFollow, setRobotsNoFollow] = useState(false);
  const [robotsNoArchive, setRobotsNoArchive] = useState(false);
  const [robotsNoSnippet, setRobotsNoSnippet] = useState(false);
  const [robotsNoImageIndex, setRobotsNoImageIndex] = useState(false);

  const [seoSchemaJson, setSeoSchemaJson] = useState(
    product?.seoSchemaJson ?? ""
  );
  const [autoGenerateSnippet, setAutoGenerateSnippet] = useState(
    product?.autoGenerateSnippet ?? true
  );
  const [autoGenerateHeadTags, setAutoGenerateHeadTags] = useState(
    product?.autoGenerateHeadTags ?? true
  );
  const [includeInSitemap, setIncludeInSitemap] = useState(
    product?.includeInSitemap ?? true
  );
  const seoTitleLength = seoTitle.trim().length;
  const seoDescLength = seoMetaDescription.trim().length;

  // مشخصات فنی محصول
  const [specs, setSpecs] = useState<ProductSpecItemDto[]>(productSpecs ?? []);
  const [specsLoaded, setSpecsLoaded] = useState(!!productSpecs);
  const [specsLoading, setSpecsLoading] = useState(false);
  const [specsError, setSpecsError] = useState<string | null>(null);

  // محصول متغیر
  const [isVariantProduct, setIsVariantProduct] = useState<boolean>(
    product?.isVariantProduct ?? false
  );
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [variantSourceValues, setVariantSourceValues] = useState<
    VariantAttributeValueDto[]
  >([]);
  const [variantsLoaded, setVariantsLoaded] = useState(false);

  // برای فرم افزودن ویراینت جدید"
  const [newVariantAttributeId, setNewVariantAttributeId] =
    useState<string>("");
  const [newVariantOptionId, setNewVariantOptionId] = useState<string>("");

  const isEdit = !!product;
  const titleText = isEdit ? "ویرایش محصول" : "ایجاد محصول جدید";
  const triggerText = label ?? (isEdit ? "ویرایش" : "افزودن محصول");

  const wrapperClass = asHeader ? "mt-4 sm:mt-0 sm:flex-none" : "";

  const triggerClass =
    triggerVariant === "primary"
      ? `cursor-pointer inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${className ?? ""
      }`
      : `cursor-pointer inline-flex items-center gap-x-1.5 rounded-md border px-2 py-1 rounded text-yellow-600 disabled:opacity-60 ${className ?? ""
      }`;

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialCategoryIds ?? []
  );

  const hierarchicalCategories = useMemo(
    () => buildCategoryTree(categoryOptions ?? []),
    [categoryOptions]
  );

  const applySchemaPreset = (id: SchemaPresetId) => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://example.com";

    const json = buildSchemaTemplate(id, {
      origin,
      slug: product?.slug,
      title: product?.title ?? seoTitle,
      descriptionHtml: descriptionHtml,
      fallbackMetaDescription: seoMetaDescription,
      imagePath: primaryImageUrl,
      price: product?.defaultOfferPrice ?? null,
      createdAtUtc: (product as any)?.createdAtUtc ?? null,
      updatedAtUtc: (product as any)?.updatedAtUtc ?? null,
    });

    setSeoSchemaJson(JSON.stringify(json, null, 2));
  };

  // تگ‌ها
  const [allTags, setAllTags] = useState<TagListItemDto[]>(tagOptions ?? []);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialTagIds ?? product?.tagIds ?? []
  );
  const [newTagName, setNewTagName] = useState("");
  const [tagCreating, setTagCreating] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);


  useEffect(() => {
    setAllTags(tagOptions ?? []);
  }, [tagOptions]);

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) return;

    try {
      setTagCreating(true);
      setTagError(null);

      const tag = await createTagClient(name);

      setAllTags((prev) =>
        prev.some((t) => t.id === tag.id) ? prev : [...prev, tag]
      );
      setSelectedTagIds((prev) =>
        prev.includes(tag.id) ? prev : [...prev, tag.id]
      );
      setNewTagName("");
    } catch (err: any) {
      console.error("create tag error", err);
      setTagError(err?.message ?? "ایجاد برچسب با خطا مواجه شد");
    } finally {
      setTagCreating(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    if (!product) return;
    if (!isVariantProduct) return;
    if (variantsLoaded) return;

    (async () => {
      try {
        const data = await bffFetch<ProductVariantDetailDto[]>(
          `products/${product.id}/variants`
        );
        setVariants(data.map(mapVariantDtoToRow));
        setVariantsLoaded(true);
      } catch (err) {
        console.error("load variants error", err);
      }
    })();
  }, [open, product, isVariantProduct, variantsLoaded]);

  const variantAttributeOptions = useMemo(() => {
    const map = new Map<string, { id: string; title: string }>();

    variantSourceValues.forEach((v) => {
      if (!map.has(v.attributeId)) {
        map.set(v.attributeId, {
          id: v.attributeId,
          title: v.attributeTitle,
        });
      }
    });

    return Array.from(map.values());
  }, [variantSourceValues]);

  // برای هر ویژگی، لیست مقدارهای مجاز آن
  const variantOptionsByAttribute = useMemo(() => {
    const map: Record<string, { id: string; label: string }[]> = {};

    variantSourceValues.forEach((v) => {
      if (!map[v.attributeId]) {
        map[v.attributeId] = [];
      }

      if (!map[v.attributeId].some((o) => o.id === v.optionId)) {
        map[v.attributeId].push({
          id: v.optionId,
          label: v.optionTitle,
        });
      }
    });

    return map;
  }, [variantSourceValues]);

  //هلسپر برای گرفتن عنوان ویژگی/مقدار
  const getVariantAttributeTitle = (attributeId?: string) =>
    attributeId
      ? variantAttributeOptions.find((a) => a.id === attributeId)?.title ?? ""
      : "";

  const getVariantOptionLabel = (attributeId?: string, optionId?: string) => {
    if (!attributeId || !optionId) return "";
    const list = variantOptionsByAttribute[attributeId] ?? [];
    return list.find((o) => o.id === optionId)?.label ?? "";
  };

  const mapVariantDtoToRow = (dto: ProductVariantDetailDto): VariantRow => ({
    tempId: crypto.randomUUID(),
    id: dto.id,
    attributeId: dto.attributeId ?? undefined,
    optionId: dto.optionId ?? undefined,
    variantCode: dto.variantCode ?? undefined,
    sku: dto.sku ?? "",
    price: dto.price != null ? dto.price.toString() : "",
    discountPrice:
      dto.discountPrice != null ? dto.discountPrice.toString() : "",
    minVariablePrice:
      dto.minVariablePrice != null ? dto.minVariablePrice.toString() : "",
    maxVariablePrice:
      dto.maxVariablePrice != null ? dto.maxVariablePrice.toString() : "",
    weightKg: dto.weightKg != null ? dto.weightKg.toString() : "",
    lengthCm: dto.lengthCm != null ? dto.lengthCm.toString() : "",
    widthCm: dto.widthCm != null ? dto.widthCm.toString() : "",
    heightCm: dto.heightCm != null ? dto.heightCm.toString() : "",
    description: dto.description ?? "",
    minOrderQuantity:
      dto.minOrderQuantity != null ? dto.minOrderQuantity.toString() : "",
    maxOrderQuantity:
      dto.maxOrderQuantity != null ? dto.maxOrderQuantity.toString() : "",
    quantityStep: dto.quantityStep != null ? dto.quantityStep.toString() : "1",
    stock: dto.stockQuantity != null ? dto.stockQuantity.toString() : "",
    manageStock: dto.manageStock ?? false,
    stockStatus: dto.stockStatus ?? 1,
    backorderPolicy: dto.backorderPolicy ?? 0,
    lowStockThreshold:
      dto.lowStockThreshold != null ? dto.lowStockThreshold.toString() : "",
  });

  const [expandedVariantIds, setExpandedVariantIds] = useState<string[]>([]);
  const toggleVariantExpanded = (tempId: string) => {
    setExpandedVariantIds((prev) =>
      prev.includes(tempId)
        ? prev.filter((id) => id !== tempId)
        : [...prev, tempId]
    );
  };

  useEffect(() => {
    if (!open) return;
    if (!product) return;
    if (!isVariantProduct) return;

    (async () => {
      try {
        const data = await bffFetch<VariantAttributeValueDto[]>(
          `products/${product.id}/variant-attributes`
        );

        setVariantSourceValues(data);
      } catch (err) {
        console.error("load variant attributes error", err);
      }
    })();
  }, [open, product, isVariantProduct]);

  useEffect(() => {
    if (!open) return;
    if (!product) return;
    if (specsLoaded || specsLoading) return;

    (async () => {
      try {
        setSpecsLoading(true);
        setSpecsError(null);

        const data = await getProductSpecsClient(product.id);
        setSpecs(data);
        setSpecsLoaded(true);
      } catch (err) {
        console.error("load product specs error", err);
        setSpecsError("خطا در بارگذاری مشخصات فنی محصول");
      } finally {
        setSpecsLoading(false);
      }
    })();
  }, [open, product, specsLoaded, specsLoading]);

  useEffect(() => {
    const robots = (product?.seoMetaRobots ?? "").toLowerCase();
    const hasNoIndex = robots.includes("noindex");
    const hasIndex = robots.includes("index");
    setRobotsNoIndex(hasNoIndex);
    setRobotsIndex(!hasNoIndex && hasIndex);
    setRobotsNoFollow(robots.includes("nofollow"));
    setRobotsNoArchive(robots.includes("noarchive"));
    setRobotsNoSnippet(robots.includes("nosnippet"));
    setRobotsNoImageIndex(robots.includes("noimageindex"));
  }, [product]);

  const computedSeoMetaRobots = useMemo(() => {
    const tokens: string[] = [];

    if (robotsNoIndex) {
      tokens.push("noindex");
    } else if (robotsIndex) {
      tokens.push("index");
    }

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

  const upsert = useServerActionMutation<FormData, void>({
    action: upsertProductFormAction,
    invalidate: [["products"] as const, ["products", "trash"] as const],
  });

  const [ownerVendorId, setOwnerVendorId] = useState<string>(
    product?.ownerVendorId ?? ""
  );
  const [multiVendorEnabled, setMultiVendorEnabled] = useState<boolean>(true);
  const [brandId, setBrandId] = useState<string>(product?.brandId ?? "");

  useEffect(() => {
    setOwnerVendorId(product?.ownerVendorId ?? "");
    setBrandId(product?.brandId ?? "");
  }, [product?.id, product?.ownerVendorId, product?.brandId]);

  const vendorSelectOptions = vendorOptions.map((v) => ({
    value: v.id,
    label: v.storeName,
  }));

  const brandSelectOptions = brandOptions.map((b) => ({
    value: b.id,
    label: b.title,
  }));


  useEffect(() => {
    let mounted = true;

    apiFetch<StoreSettingsDto>("settings")
      .then((s) => {
        if (!mounted) return;
        setMultiVendorEnabled(s.multiVendorEnabled ?? true);
      })
      .catch(() => {
        if (mounted) setMultiVendorEnabled(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!multiVendorEnabled) {
      setOwnerVendorId("");
    }
  }, [multiVendorEnabled]);

  return (
    <>
      {/* Trigger */}
      <div className={wrapperClass}>
        <button
          type="button"
          className={triggerClass}
          onClick={() => setOpen(true)}
        >
          {!isEdit && triggerVariant === "primary" && <PlusIcon />}
          {triggerText}
        </button>
      </div>

      {/* Modal */}
      <Dialog open={open} onClose={setOpen} className="relative z-50">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />
        <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-[#f0f0f1] px-4 pt-4 pb-5 text-left shadow-xl transition-all
                data-closed:translate-y-4 data-closed:opacity-0
                data-enter:duration-300 data-enter:ease-out
                data-leave:duration-200 data-leave:ease-in
                sm:my-6 sm:w-full sm:max-w-6xl sm:p-6
                data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              {/* Header */}
              <div className="mb-4 flex items-center justify-between border-b border-gray-300 pb-3">
                <div className="text-right">
                  <DialogTitle
                    as="h1"
                    className="text-lg font-semibold text-gray-900"
                  >
                    {titleText}
                  </DialogTitle>
                  <p className="mt-1 text-xs text-gray-500">
                    نام محصول، توضیحات، قیمت و سایر تنظیمات را تکمیل کنید.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={pending}
                    className="inline-flex items-center rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    form="product-form"
                    disabled={pending}
                    className="inline-flex items-center rounded bg-[#2271b1] px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-[#135e96] disabled:opacity-60"
                  >
                    {pending
                      ? "در حال ذخیره..."
                      : isEdit
                        ? "به‌روزرسانی محصول"
                        : "انتشار محصول"}
                  </button>
                </div>
              </div>

              {/* فرم اصلی */}
              <form
                id="product-form"
                action={(formData) =>
                  startTransition(async () => {
                    if (isVariantProduct) {
                      const hasAnyError = variants.some(
                        (v) => validateVariantRow(v).hasError
                      );
                      if (hasAnyError) {
                        alert(
                          "برخی از متغیرها خطای قیمتی دارند. لطفاً آن‌ها را برطرف کنید."
                        );
                        return;
                      }
                    }

                    formData.set(
                      "isVariantProduct",
                      isVariantProduct ? "true" : "false"
                    );

                    const variantsPayload =
                      isVariantProduct && variants.length > 0
                        ? variants.map((v) => {
                          const manageStock = v.manageStock === true;
                          const stockStatus = !manageStock
                            ? v.stockStatus
                              ? Number(v.stockStatus)
                              : 1
                            : null;

                          return {
                            id: v.id ?? null,
                            attributeId: v.attributeId ?? null,
                            optionId: v.optionId ?? null,

                            sku: v.sku || null,
                            price: v.price !== "" ? Number(v.price) : null,
                            discountPrice:
                              v.discountPrice !== ""
                                ? Number(v.discountPrice)
                                : null,
                            stock: v.stock !== "" ? Number(v.stock) : 0,

                            minVariablePrice:
                              v.minVariablePrice !== ""
                                ? Number(v.minVariablePrice)
                                : null,
                            maxVariablePrice:
                              v.maxVariablePrice !== ""
                                ? Number(v.maxVariablePrice)
                                : null,

                            weightKg:
                              v.weightKg !== "" ? Number(v.weightKg) : null,
                            lengthCm:
                              v.lengthCm !== "" ? Number(v.lengthCm) : null,
                            widthCm:
                              v.widthCm !== "" ? Number(v.widthCm) : null,
                            heightCm:
                              v.heightCm !== "" ? Number(v.heightCm) : null,

                            description: v.description || null,

                            minOrderQuantity:
                              v.minOrderQuantity !== ""
                                ? Number(v.minOrderQuantity)
                                : 0,
                            maxOrderQuantity:
                              v.maxOrderQuantity !== ""
                                ? Number(v.maxOrderQuantity)
                                : 0,
                            quantityStep:
                              v.quantityStep !== ""
                                ? Number(v.quantityStep)
                                : 1,
                            manageStock,
                            stockStatus,
                            backorderPolicy: v.backorderPolicy ?? 0,
                            lowStockThreshold:
                              v.lowStockThreshold !== ""
                                ? Number(v.lowStockThreshold)
                                : null,
                          };
                        })
                        : [];

                    formData.set(
                      "variantsJson",
                      isVariantProduct && variantsPayload.length > 0
                        ? JSON.stringify(variantsPayload)
                        : ""
                    );

                    formData.set("primaryImageUrl", primaryImageUrl ?? "");
                    await upsert.mutateAsync(formData);
                    setOpen(false);
                  })
                }
                className="space-y-4"
              >
                <input
                  type="hidden"
                  name="id"
                  defaultValue={product?.id ?? ""}
                />
                <input
                  type="hidden"
                  name="rowVersion"
                  defaultValue={product?.rowVersion ?? ""}
                />
                {galleryImages.map((url, index) => (
                  <input
                    key={index}
                    type="hidden"
                    name="galleryImageUrls"
                    value={url}
                  />
                ))}
                {selectedTagIds.map((id) => (
                  <input key={id} type="hidden" name="tagIds" value={id} />
                ))}

                {/* گرید دو ستونه */}
                <div className="grid gap-4 lg:grid-cols-[minmax(0,_2.4fr)_minmax(0,_1fr)]">
                  {/* ستون چپ: محتوای اصلی */}
                  <div className="space-y-4">
                    {/* نام محصول / نامک / توضیحات */}
                    <div className="rounded border border-gray-300 bg-white p-4">
                      {/* نام محصول */}
                      <div className="mb-3">
                        <label className="mb-1 block text-sm font-medium text-gray-800 text-right">
                          نام محصول
                        </label>
                        <input
                          name="title"
                          required
                          defaultValue={product?.title ?? ""}
                          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                          placeholder="نام محصول را وارد کنید..."
                        />
                      </div>

                      {/* نامک */}
                      <div className="mb-4 text-xs text-gray-600 text-right">
                        <span className="font-semibold">نامک (Slug): </span>
                        <input
                          name="slug"
                          required
                          dir="ltr"
                          defaultValue={product?.slug ?? ""}
                          className="mt-1 w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs font-mono text-gray-800 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                          placeholder="samsung-galaxy-s24"
                        />
                      </div>

                      {/* نام انگلیسی محصول */}
                      <div className="mb-3">
                        <label className="mb-1 block text-xs font-medium text-gray-700 text-right">
                          نام انگلیسی محصول (اختیاری)
                        </label>
                        <input
                          name="englishTitle"
                          defaultValue={product?.englishTitle ?? ""}
                          className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                          placeholder="مثال: Apple iPhone 16 Pro Max"
                        />
                      </div>

                      {/* عنوان کوتاه */}
                      <div className="mb-3">
                        <label className="mb-1 block text-xs font-medium text-gray-700 text-right">
                          عنوان کوتاه (برای لیست‌ها و کارت‌ها)
                        </label>
                        <input
                          name="shortTitle"
                          required
                          defaultValue={
                            product?.shortTitle ?? product?.title ?? ""
                          } // 👈 fallback به title
                          className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                          placeholder="مثال: آیفون ۱۶ پرو مکس"
                        />
                      </div>

                      {/* توضیحات محصول */}
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-800 text-right">
                          توضیحات محصول
                        </label>
                        <input
                          type="hidden"
                          name="descriptionHtml"
                          value={descriptionHtml}
                        />
                        <RichHtmlEditor
                          value={descriptionHtml}
                          onChange={setDescriptionHtml}
                        />
                      </div>
                    </div>

                    {/* اطلاعات محصول (قیمت / موجودی / ویراینت‌ها) */}
                    <div className="rounded border border-gray-300 bg-white">
                      <div className="border-b border-gray-200 px-4 py-2 text-right text-sm font-semibold text-gray-800">
                        اطلاعات محصول
                      </div>

                      <div className="grid gap-4 px-4 py-4">
                        <div className="space-y-3">
                          {/* SKU */}
                          <label className="block text-right">
                            <span className="mb-1 block text-xs text-gray-700">
                              SKU / کد محصول
                            </span>
                            <input
                              name="sku"
                              defaultValue={product?.sku ?? ""}
                              className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                              placeholder="مثال: ER-123456"
                            />
                          </label>

                          {/* نوع محصول */}
                          <div className="rounded border border-gray-300 bg-white mt-4">
                            <div className="border-b border-gray-200 px-4 py-2 text-right text-sm font-semibold text-gray-800">
                              نوع محصول
                            </div>
                            <div className="px-4 py-3 text-xs text-gray-700 space-y-2 text-right">
                              <label className="inline-flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="productType"
                                  value="simple"
                                  checked={!isVariantProduct}
                                  onChange={() => setIsVariantProduct(false)}
                                />
                                <span>محصول ساده</span>
                              </label>

                              <label className="inline-flex items-center gap-2 text-right">
                                <input
                                  type="radio"
                                  name="productType"
                                  value="variable"
                                  checked={isVariantProduct}
                                  onChange={() => setIsVariantProduct(true)}
                                />
                                <span className="text-right">محصول متغیر</span>
                              </label>

                              {isVariantProduct && (
                                <p className="mt-2 text-[11px] text-gray-500">
                                  در حالت محصول متغیر، قیمت و موجودی اصلی الزامی
                                  نیست و برای هر ویراینت جداگانه تعریف می‌شود.
                                </p>
                              )}
                            </div>
                          </div>

                          {/* جدول ویراینت‌ها در حالت محصول متغیر */}
                          {isVariantProduct && (
                            <section className="rounded border border-gray-300 bg-white p-4">
                              <div className="mb-3 border-b border-gray-200 pb-2 text-right text-sm font-semibold text-gray-800">
                                ویرایش ویراینت‌ها (براساس ویژگی انتخاب‌شده)
                              </div>

                              {/* نوار بالایی برای انتخاب ویژگی/مقدار و افزودن ویراینت جدید */}
                              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end">
                                <div className="flex-1">
                                  <label className="mb-1 block text-xs text-gray-700 text-right">
                                    ویژگی
                                  </label>
                                  <select
                                    className="w-full rounded border border-gray-300 px-2 py-1 text-xs text-gray-900 bg-white"
                                    value={newVariantAttributeId}
                                    onChange={(e) => {
                                      setNewVariantAttributeId(e.target.value);
                                      setNewVariantOptionId(""); // وقتی ویژگی عوض شد مقدار قبلی پاک شود
                                    }}
                                  >
                                    <option value="">انتخاب ویژگی...</option>
                                    {variantAttributeOptions.map((attr) => (
                                      <option key={attr.id} value={attr.id}>
                                        {attr.title}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="flex-1">
                                  <label className="mb-1 block text-xs text-gray-700 text-right">
                                    مقدار ویژگی
                                  </label>
                                  <select
                                    className="w-full rounded border border-gray-300 px-2 py-1 text-xs text-gray-900 bg-white"
                                    value={newVariantOptionId}
                                    onChange={(e) =>
                                      setNewVariantOptionId(e.target.value)
                                    }
                                    disabled={!newVariantAttributeId}
                                  >
                                    <option value="">
                                      {newVariantAttributeId
                                        ? "انتخاب مقدار..."
                                        : "ابتدا ویژگی را انتخاب کنید"}
                                    </option>
                                    {(
                                      variantOptionsByAttribute[
                                      newVariantAttributeId
                                      ] ?? []
                                    ).map((opt) => (
                                      <option key={opt.id} value={opt.id}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="md:w-32">
                                  <button
                                    type="button"
                                    className="w-full rounded bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-800 border border-gray-300 hover:bg-gray-200 disabled:opacity-50"
                                    onClick={() => {
                                      if (
                                        !newVariantAttributeId ||
                                        !newVariantOptionId
                                      )
                                        return;

                                      // جلوگیری از تکرار همان ویژگی/مقدار
                                      const exists = variants.some(
                                        (v) =>
                                          v.attributeId ===
                                          newVariantAttributeId &&
                                          v.optionId === newVariantOptionId
                                      );
                                      if (exists) return;

                                      const tempId = crypto.randomUUID();

                                      setVariants((prev) => [
                                        ...prev,
                                        {
                                          tempId,
                                          id: undefined,
                                          attributeId: newVariantAttributeId,
                                          optionId: newVariantOptionId,
                                          sku: "",
                                          price: "",
                                          discountPrice: "",
                                          minVariablePrice: "",
                                          maxVariablePrice: "",
                                          weightKg: "",
                                          lengthCm: "",
                                          widthCm: "",
                                          heightCm: "",
                                          description: "",
                                          minOrderQuantity: "0",
                                          maxOrderQuantity: "0",
                                          quantityStep: "1",
                                          stock: "",
                                          manageStock: false,
                                          stockStatus: 1,
                                          backorderPolicy: 0,
                                          lowStockThreshold: "",
                                        },
                                      ]);

                                      setExpandedVariantIds((prev) => [
                                        ...prev,
                                        tempId,
                                      ]);

                                      // ریست فرم افزودن
                                      setNewVariantOptionId("");
                                    }}
                                    disabled={
                                      !newVariantAttributeId ||
                                      !newVariantOptionId
                                    }
                                  >
                                    افزودن ویراینت
                                  </button>
                                </div>
                              </div>

                              {/* کارت‌های ویراینت — شبیه تصویر ووکامرس */}
                              {variants.length === 0 && (
                                <p className="text-[11px] text-gray-400 text-right">
                                  هنوز هیچ ویراینتی ثبت نشده است. ابتدا ویژگی و
                                  مقدار را انتخاب کرده و روی «افزودن ویراینت»
                                  کلیک کنید.
                                </p>
                              )}

                              <div className="space-y-4">
                                {variants.map((v) => {
                                  const attrTitle = getVariantAttributeTitle(
                                    v.attributeId
                                  );
                                  const optionLabel = getVariantOptionLabel(
                                    v.attributeId,
                                    v.optionId
                                  );
                                  const isExpanded =
                                    expandedVariantIds.includes(v.tempId);

                                  const validation = validateVariantRow(v);
                                  const fe = validation.fieldErrors;

                                  return (
                                    <div
                                      key={v.tempId}
                                      className="rounded border border-gray-300 bg-gray-50 p-3"
                                    >
                                      {/* هدر کارت – کلیک‌خور برای باز/بسته کردن */}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          toggleVariantExpanded(v.tempId)
                                        }
                                        className="w-full flex items-center justify-between px-3 py-2 text-right"
                                      >
                                        <div className="text-sm font-semibold text-gray-800">
                                          {attrTitle && optionLabel
                                            ? `${attrTitle} : ${optionLabel}`
                                            : "ویراینت بدون عنوان"}
                                        </div>

                                        <div className="flex items-center gap-3">
                                          {/* آیکن باز/بسته ساده */}
                                          <span className="text-[11px] text-gray-500">
                                            {isExpanded ? "بستن" : "باز"}
                                          </span>
                                          <span
                                            className={`inline-block transform transition-transform ${isExpanded ? "rotate-90" : ""
                                              }`}
                                          >
                                            ▸
                                          </span>
                                        </div>
                                      </button>

                                      {/* دکمه حذف در هدر یا زیر هدر */}
                                      <div className="px-3 pb-2 flex justify-end">
                                        <button
                                          type="button"
                                          className="text-xs text-red-600 hover:text-red-800"
                                          onClick={() => {
                                            setVariants((prev) =>
                                              prev.filter(
                                                (row) => row.tempId !== v.tempId
                                              )
                                            );
                                            setExpandedVariantIds((prev) =>
                                              prev.filter(
                                                (id) => id !== v.tempId
                                              )
                                            );
                                          }}
                                        >
                                          حذف این ویراینت
                                        </button>
                                      </div>

                                      {/* بدنه کارت – فرم عمودی مثل اسکرین‌شات */}
                                      {isExpanded && (
                                        <div className="border-t border-gray-200 p-3 grid gap-3 md:grid-cols-2">
                                          {/* شناسه محصول SKU */}
                                          <div>
                                            <label className="mb-1 block text-xs text-gray-700 text-right">
                                              شناسه محصول (SKU){" "}
                                              <span className="text-red-500">
                                                *
                                              </span>
                                            </label>
                                            <input
                                              type="text"
                                              className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-900 bg-white"
                                              value={v.sku}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                setVariants((prev) =>
                                                  prev.map((row) =>
                                                    row.tempId === v.tempId
                                                      ? { ...row, sku: val }
                                                      : row
                                                  )
                                                );
                                              }}
                                              placeholder="مثال: IP16-BLK-01"
                                              required
                                            />
                                          </div>

                                          {/* قیمت‌ها */}
                                          <div>
                                            <label className="mb-1 block text-xs text-gray-700 text-right">
                                              قیمت اصلی (تومان)
                                            </label>
                                            <input
                                              type="number"
                                              className={
                                                "w-full rounded border px-2 py-1.5 text-xs text-gray-900 bg-white " +
                                                (fe.price
                                                  ? "border-red-500"
                                                  : "border-gray-300")
                                              }
                                              min={0}
                                              value={v.price}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                setVariants((prev) =>
                                                  prev.map((row) =>
                                                    row.tempId === v.tempId
                                                      ? { ...row, price: val }
                                                      : row
                                                  )
                                                );
                                              }}
                                            />
                                            {fe.price && (
                                              <span className="mt-1 block text-[10px] text-red-600">
                                                {fe.price}
                                              </span>
                                            )}
                                          </div>

                                          <div>
                                            <label className="mb-1 block text-xs text-gray-700 text-right">
                                              قیمت فروش فوق‌العاده (تومان)
                                            </label>
                                            <input
                                              type="number"
                                              className={
                                                "w-full rounded border px-2 py-1.5 text-xs text-gray-900 bg-white " +
                                                (fe.discountPrice
                                                  ? "border-red-500"
                                                  : "border-gray-300")
                                              }
                                              min={0}
                                              value={v.discountPrice}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                setVariants((prev) =>
                                                  prev.map((row) =>
                                                    row.tempId === v.tempId
                                                      ? {
                                                        ...row,
                                                        discountPrice: val,
                                                      }
                                                      : row
                                                  )
                                                );
                                              }}
                                            />
                                            {fe.discountPrice && (
                                              <span className="mt-1 block text-[10px] text-red-600">
                                                {fe.discountPrice}
                                              </span>
                                            )}
                                          </div>

                                          {/* حداقل / حداکثر قیمت متغیر */}
                                          <div>
                                            <label className="mb-1 block text-xs text-gray-700 text-right">
                                              حداقل قیمت متغیر (تومان)
                                            </label>
                                            <input
                                              type="number"
                                              className={
                                                "w-full rounded border px-2 py-1.5 text-xs text-gray-900 bg-white " +
                                                (fe.minVariablePrice
                                                  ? "border-red-500"
                                                  : "border-gray-300")
                                              }
                                              min={0}
                                              value={v.minVariablePrice}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                setVariants((prev) =>
                                                  prev.map((row) =>
                                                    row.tempId === v.tempId
                                                      ? {
                                                        ...row,
                                                        minVariablePrice: val,
                                                      }
                                                      : row
                                                  )
                                                );
                                              }}
                                            />
                                            {fe.minVariablePrice && (
                                              <span className="mt-1 block text-[10px] text-red-600">
                                                {fe.minVariablePrice}
                                              </span>
                                            )}
                                          </div>

                                          <div>
                                            <label className="mb-1 block text-xs text-gray-700 text-right">
                                              حداکثر قیمت متغیر (تومان)
                                            </label>
                                            <input
                                              type="number"
                                              className={
                                                "w-full rounded border px-2 py-1.5 text-xs text-gray-900 bg-white " +
                                                (fe.maxVariablePrice
                                                  ? "border-red-500"
                                                  : "border-gray-300")
                                              }
                                              min={0}
                                              value={v.maxVariablePrice}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                setVariants((prev) =>
                                                  prev.map((row) =>
                                                    row.tempId === v.tempId
                                                      ? {
                                                        ...row,
                                                        maxVariablePrice: val,
                                                      }
                                                      : row
                                                  )
                                                );
                                              }}
                                            />
                                            {fe.maxVariablePrice && (
                                              <span className="mt-1 block text-[10px] text-red-600">
                                                {fe.maxVariablePrice}
                                              </span>
                                            )}
                                          </div>

                                          {/* بلاک مدیریت موجودی برای این ویراینت */}
                                          <div className="md:col-span-2">
                                            <div className="mt-2 rounded border border-gray-200 bg-white p-3 space-y-3">
                                              <label className="flex items-center gap-2 text-xs text-gray-800">
                                                <input
                                                  type="checkbox"
                                                  checked={
                                                    v.manageStock ?? false
                                                  }
                                                  onChange={(e) => {
                                                    const checked =
                                                      e.target.checked;
                                                    setVariants((prev) =>
                                                      prev.map((row) =>
                                                        row.tempId === v.tempId
                                                          ? {
                                                            ...row,
                                                            manageStock:
                                                              checked,
                                                          }
                                                          : row
                                                      )
                                                    );
                                                  }}
                                                />
                                                <span>
                                                  مدیریت موجودی انبار این
                                                  ویراینت؟
                                                </span>
                                              </label>

                                              {v.manageStock ? (
                                                <div className="grid gap-3 md:grid-cols-3">
                                                  <div>
                                                    <label className="mb-1 block text-xs text-gray-700 text-right">
                                                      موجودی انبار (Stock
                                                      Quantity)
                                                    </label>
                                                    <input
                                                      type="number"
                                                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-900"
                                                      min={0}
                                                      value={v.stock}
                                                      onChange={(e) => {
                                                        const val =
                                                          e.target.value;
                                                        setVariants((prev) =>
                                                          prev.map((row) =>
                                                            row.tempId ===
                                                              v.tempId
                                                              ? {
                                                                ...row,
                                                                stock: val,
                                                              }
                                                              : row
                                                          )
                                                        );
                                                      }}
                                                    />
                                                  </div>

                                                  <div>
                                                    <label className="mb-1 block text-xs text-gray-700 text-right">
                                                      آستانه کمبود موجودی
                                                    </label>
                                                    <input
                                                      type="number"
                                                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-900"
                                                      min={0}
                                                      value={
                                                        v.lowStockThreshold ??
                                                        ""
                                                      }
                                                      onChange={(e) => {
                                                        const val =
                                                          e.target.value;
                                                        setVariants((prev) =>
                                                          prev.map((row) =>
                                                            row.tempId ===
                                                              v.tempId
                                                              ? {
                                                                ...row,
                                                                lowStockThreshold:
                                                                  val,
                                                              }
                                                              : row
                                                          )
                                                        );
                                                      }}
                                                    />
                                                  </div>

                                                  <div>
                                                    <label className="mb-1 block text-xs text-gray-700 text-right">
                                                      سیاست بک‌اُردر
                                                    </label>
                                                    <select
                                                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-900"
                                                      value={
                                                        v.backorderPolicy ?? 0
                                                      }
                                                      onChange={(e) => {
                                                        const val = Number(
                                                          e.target.value
                                                        );
                                                        setVariants((prev) =>
                                                          prev.map((row) =>
                                                            row.tempId ===
                                                              v.tempId
                                                              ? {
                                                                ...row,
                                                                backorderPolicy:
                                                                  val,
                                                              }
                                                              : row
                                                          )
                                                        );
                                                      }}
                                                    >
                                                      <option value={0}>
                                                        عدم اجازه سفارش در صورت
                                                        اتمام
                                                      </option>
                                                      <option value={1}>
                                                        اجازه سفارش با اطلاع
                                                      </option>
                                                      <option value={2}>
                                                        اجازه سفارش بدون محدودیت
                                                      </option>
                                                    </select>
                                                  </div>
                                                </div>
                                              ) : (
                                                <div>
                                                  <label className="mb-1 block text-xs text-gray-700 text-right">
                                                    وضعیت موجودی
                                                  </label>
                                                  <select
                                                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-900"
                                                    value={v.stockStatus ?? 1}
                                                    onChange={(e) => {
                                                      const val = Number(
                                                        e.target.value
                                                      );
                                                      setVariants((prev) =>
                                                        prev.map((row) =>
                                                          row.tempId ===
                                                            v.tempId
                                                            ? {
                                                              ...row,
                                                              stockStatus:
                                                                val,
                                                            }
                                                            : row
                                                        )
                                                      );
                                                    }}
                                                  >
                                                    <option value={1}>
                                                      موجود در انبار
                                                    </option>
                                                    <option value={2}>
                                                      ناموجود
                                                    </option>
                                                    <option value={3}>
                                                      قابل سفارش (Backorder)
                                                    </option>
                                                  </select>
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          {/* ابعاد و محدودیت‌های تعداد – در یک گرید منظم */}
                                          <div className="md:col-span-2 mt-2 space-y-3">
                                            {/* ردیف اول: وزن + طول + عرض + ارتفاع */}
                                            <div className="grid gap-3 md:grid-cols-4">
                                              {/* وزن - بزرگ‌تر (دو ستون) */}
                                              <div className="md:col-span-1">
                                                <label className="mb-1 block text-xs text-gray-700 text-right">
                                                  وزن (کیلوگرم)
                                                </label>
                                                <input
                                                  type="number"
                                                  min={0}
                                                  step="0.01"
                                                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-900 bg-white"
                                                  value={v.weightKg}
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    setVariants((prev) =>
                                                      prev.map((row) =>
                                                        row.tempId === v.tempId
                                                          ? {
                                                            ...row,
                                                            weightKg: val,
                                                          }
                                                          : row
                                                      )
                                                    );
                                                  }}
                                                />
                                              </div>

                                              {/* طول */}
                                              <div>
                                                <label className="mb-1 block text-xs text-gray-700 text-right">
                                                  طول (سانتی‌متر)
                                                </label>
                                                <input
                                                  type="number"
                                                  min={0}
                                                  step="0.1"
                                                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-900 bg-white"
                                                  value={v.lengthCm}
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    setVariants((prev) =>
                                                      prev.map((row) =>
                                                        row.tempId === v.tempId
                                                          ? {
                                                            ...row,
                                                            lengthCm: val,
                                                          }
                                                          : row
                                                      )
                                                    );
                                                  }}
                                                />
                                              </div>

                                              {/* عرض */}
                                              <div>
                                                <label className="mb-1 block text-xs text-gray-700 text-right">
                                                  عرض (سانتی‌متر)
                                                </label>
                                                <input
                                                  type="number"
                                                  min={0}
                                                  step="0.1"
                                                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-900 bg-white"
                                                  value={v.widthCm}
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    setVariants((prev) =>
                                                      prev.map((row) =>
                                                        row.tempId === v.tempId
                                                          ? {
                                                            ...row,
                                                            widthCm: val,
                                                          }
                                                          : row
                                                      )
                                                    );
                                                  }}
                                                />
                                              </div>

                                              {/* ارتفاع */}
                                              <div>
                                                <label className="mb-1 block text-xs text-gray-700 text-right">
                                                  ارتفاع (سانتی‌متر)
                                                </label>
                                                <input
                                                  type="number"
                                                  min={0}
                                                  step="0.1"
                                                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-900 bg-white"
                                                  value={v.heightCm}
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    setVariants((prev) =>
                                                      prev.map((row) =>
                                                        row.tempId === v.tempId
                                                          ? {
                                                            ...row,
                                                            heightCm: val,
                                                          }
                                                          : row
                                                      )
                                                    );
                                                  }}
                                                />
                                              </div>
                                            </div>

                                            {/* ردیف دوم: توضیحات */}
                                            <div>
                                              <label className="mb-1 block text-xs text-gray-700 text-right">
                                                توضیحات
                                              </label>
                                              <textarea
                                                className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-900 bg-white"
                                                rows={2}
                                                value={v.description}
                                                onChange={(e) => {
                                                  const val = e.target.value;
                                                  setVariants((prev) =>
                                                    prev.map((row) =>
                                                      row.tempId === v.tempId
                                                        ? {
                                                          ...row,
                                                          description: val,
                                                        }
                                                        : row
                                                    )
                                                  );
                                                }}
                                              />
                                            </div>

                                            {/* ردیف سوم: محدودیت‌ها (۳ فیلد در یک ردیف) */}
                                            <div className="grid gap-3 md:grid-cols-3">
                                              {/* حداقل تعداد */}
                                              <div>
                                                <label className="mb-1 block text-xs text-gray-700 text-right">
                                                  حداقل تعداد (۰ = بدون محدودیت)
                                                </label>
                                                <input
                                                  type="number"
                                                  min={0}
                                                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-900 bg-white"
                                                  value={v.minOrderQuantity}
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    setVariants((prev) =>
                                                      prev.map((row) =>
                                                        row.tempId === v.tempId
                                                          ? {
                                                            ...row,
                                                            minOrderQuantity:
                                                              val,
                                                          }
                                                          : row
                                                      )
                                                    );
                                                  }}
                                                />
                                              </div>

                                              {/* حداکثر تعداد */}
                                              <div>
                                                <label className="mb-1 block text-xs text-gray-700 text-right">
                                                  حداکثر تعداد (۰ = بدون
                                                  محدودیت)
                                                </label>
                                                <input
                                                  type="number"
                                                  min={0}
                                                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-900 bg-white"
                                                  value={v.maxOrderQuantity}
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    setVariants((prev) =>
                                                      prev.map((row) =>
                                                        row.tempId === v.tempId
                                                          ? {
                                                            ...row,
                                                            maxOrderQuantity:
                                                              val,
                                                          }
                                                          : row
                                                      )
                                                    );
                                                  }}
                                                />
                                              </div>

                                              {/* گام تعداد */}
                                              <div>
                                                <label className="mb-1 block text-xs text-gray-700 text-right">
                                                  گام تعداد
                                                </label>
                                                <input
                                                  type="number"
                                                  min={1}
                                                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-900 bg-white"
                                                  value={v.quantityStep}
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    setVariants((prev) =>
                                                      prev.map((row) =>
                                                        row.tempId === v.tempId
                                                          ? {
                                                            ...row,
                                                            quantityStep: val,
                                                          }
                                                          : row
                                                      )
                                                    );
                                                  }}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                  {
                                    validation.hasError && (
                                      <div className="mt-2 text-[11px] text-red-600 space-y-1 md:col-span-2">
                                        {validation.messages.map((msg, idx) => (
                                          <p key={idx}>• {msg}</p>
                                        ))}
                                      </div>
                                    );
                                  }
                                })}
                              </div>
                            </section>
                          )}

                          {/* قیمت/تخفیف/موجودی فقط در محصول ساده */}
                          {/* تنظیمات فروش و موجودی فقط در محصول ساده (VendorOffer) */}
                          {!isVariantProduct && (
                            <div className="space-y-3">
                              {/* مدل فروش */}
                              <label className="block text-right">
                                <span className="mb-1 block text-xs text-gray-700">
                                  مدل فروش (Sale Model)
                                </span>
                                <select
                                  name="saleModel"
                                  value={saleModel}
                                  onChange={(e) =>
                                    setSaleModel(Number(e.target.value))
                                  }
                                  className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                                >
                                  {/* مقادیر را با enum واقعی ProductSaleModel ست کن */}
                                  <option value={0}>
                                    فروش آنلاین (پیش‌فرض)
                                  </option>
                                  <option value={1}>
                                    نمایش کاتالوگ بدون قیمت
                                  </option>
                                  <option value={2}>تماس برای قیمت</option>
                                </select>
                              </label>

                              {/* قیمت‌ها */}
                              <label className="block text-right">
                                <span className="mb-1 block text-xs text-gray-700">
                                  قیمت اصلی (تومان)
                                </span>
                                <input
                                  type="number"
                                  name="price"
                                  min={0}
                                  required={!isVariantProduct}
                                  defaultValue={product?.defaultOfferPrice ?? 0}
                                  className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                                />
                              </label>

                              <label className="block text-right">
                                <span className="mb-1 block text-xs text-gray-700">
                                  قیمت فروش فوق‌العاده (تومان)
                                </span>
                                <input
                                  type="number"
                                  name="discountPrice"
                                  min={0}
                                  defaultValue={
                                    product?.defaultOfferDiscountPrice ?? ""
                                  }
                                  className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                                />
                              </label>

                              {/* مدیریت موجودی انبار */}
                              <div className="mt-2 rounded border border-gray-200 bg-gray-50 p-3 space-y-3">
                                <label className="flex items-center gap-2 text-xs text-gray-800">
                                  <input
                                    type="checkbox"
                                    name="manageStock"
                                    checked={manageStock}
                                    onChange={(e) =>
                                      setManageStock(e.target.checked)
                                    }
                                  />
                                  <span>مدیریت موجودی انبار؟</span>
                                </label>

                                {/* اگر مدیریت موجودی فعال باشد: موجودی، آستانه کمبود، سیاست بک‌اُردر */}
                                {manageStock ? (
                                  <div className="grid gap-3 md:grid-cols-3">
                                    <div>
                                      <label className="mb-1 block text-xs text-gray-700 text-right">
                                        موجودی انبار (Stock Quantity)
                                      </label>
                                      <input
                                        type="number"
                                        name="stock"
                                        min={0}
                                        defaultValue={
                                          product?.isVariantProduct
                                            ? 0
                                            : (product as any)
                                              ?.defaultOfferStock ?? 0
                                        }
                                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-900"
                                      />
                                    </div>

                                    <div>
                                      <label className="mb-1 block text-xs text-gray-700 text-right">
                                        آستانه کمبود موجودی
                                      </label>
                                      <input
                                        type="number"
                                        name="lowStockThreshold"
                                        min={0}
                                        value={lowStockThreshold}
                                        onChange={(e) =>
                                          setLowStockThreshold(e.target.value)
                                        }
                                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-900"
                                      />
                                    </div>

                                    <div>
                                      <label className="mb-1 block text-xs text-gray-700 text-right">
                                        سیاست بک‌اُردر (Backorder Policy)
                                      </label>
                                      <select
                                        name="backorderPolicy"
                                        value={backorderPolicy}
                                        onChange={(e) =>
                                          setBackorderPolicy(
                                            Number(e.target.value)
                                          )
                                        }
                                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-900"
                                      >
                                        <option value={0}>
                                          عدم اجازه سفارش در صورت اتمام
                                        </option>
                                        <option value={1}>
                                          اجازه سفارش با اطلاع به مشتری
                                        </option>
                                        <option value={2}>
                                          اجازه سفارش بدون محدودیت
                                        </option>
                                      </select>
                                    </div>
                                  </div>
                                ) : (
                                  // اگر مدیریت موجودی خاموش باشد، فقط وضعیت موجودی را انتخاب می‌کنیم
                                  <div>
                                    <label className="mb-1 block text-xs text-gray-700 text-right">
                                      وضعیت موجودی (Stock Status)
                                    </label>
                                    <select
                                      name="stockStatus"
                                      value={stockStatus}
                                      onChange={(e) =>
                                        setStockStatus(Number(e.target.value))
                                      }
                                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-900"
                                      defaultValue={
                                        product?.defaultOfferStockStatus?.toString() ??
                                        "1"
                                      }
                                    >
                                      <option value={1}>موجود در انبار</option>
                                      <option value={2}>ناموجود</option>
                                      <option value={3}>
                                        قابل سفارش (Backorder)
                                      </option>
                                    </select>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* مشخصات فنی */}
                    {product && (
                      <div className="rounded border border-gray-300 bg-white p-4">
                        <div className="mb-3 border-b border-gray-200 pb-2 text-right text-sm font-semibold text-gray-800">
                          مشخصات فنی محصول
                        </div>

                        {specsError && (
                          <p className="mb-2 text-xs text-red-500 text-right">
                            {specsError}
                          </p>
                        )}
                        {specsLoading && !specsLoaded && (
                          <p className="mb-2 text-xs text-gray-500 text-right">
                            در حال بارگذاری مشخصات فنی...
                          </p>
                        )}

                        <ProductSpecsEditor
                          productId={product.id}
                          initialSpecs={specs}
                          allAttributes={attributeOptions}
                          groups={groupOptions}
                        />
                      </div>
                    )}

                    {/* SEO */}
                    <section className="rounded border border-gray-300 bg-white p-4">
                      <div className="mb-2 border-b border-gray-200 pb-2 text-right text-sm font-semibold text-gray-800">
                        سئو (SEO)
                      </div>

                      <div className="grid gap-3">
                        <label className="block text-right">
                          <span className="mb-1 block text-xs text-gray-700">
                            عنوان سئو (Meta Title)
                          </span>
                          <input
                            name="seoTitle"
                            value={seoTitle}
                            onChange={(e) => setSeoTitle(e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                          />
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-600">
                            <div className="flex-1 h-1 rounded bg-gray-200 overflow-hidden">
                              <div
                                className={`h-1 ${getSeoBarClass(
                                  seoTitleLength,
                                  SEO_TITLE_LIMIT
                                )}`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (seoTitleLength / SEO_TITLE_LIMIT) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                            <span
                              className={
                                seoTitleLength > SEO_TITLE_LIMIT
                                  ? "text-red-500"
                                  : "text-emerald-600"
                              }
                            >
                              {seoTitleLength}/{SEO_TITLE_LIMIT}
                            </span>
                          </div>
                        </label>

                        <label className="block text-right">
                          <span className="mb-1 block text-xs text-gray-700">
                            توضیحات متا (Meta Description)
                          </span>
                          <textarea
                            name="seoMetaDescription"
                            rows={2}
                            value={seoMetaDescription}
                            onChange={(e) =>
                              setSeoMetaDescription(e.target.value)
                            }
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                          />
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-600">
                            <div className="flex-1 h-1 rounded bg-gray-200 overflow-hidden">
                              <div
                                className={`h-1 ${getSeoBarClass(
                                  seoDescLength,
                                  SEO_DESC_LIMIT
                                )}`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (seoDescLength / SEO_DESC_LIMIT) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                            <span
                              className={
                                seoDescLength > SEO_DESC_LIMIT
                                  ? "text-red-500"
                                  : "text-emerald-600"
                              }
                            >
                              {seoDescLength}/{SEO_DESC_LIMIT}
                            </span>
                          </div>
                        </label>

                        <label className="block text-right">
                          <span className="mb-1 block text-xs text-gray-700">
                            کلمات کلیدی (Keywords)
                          </span>
                          <input
                            name="seoKeywords"
                            value={seoKeywords}
                            onChange={(e) => setSeoKeywords(e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                          />
                        </label>

                        {/* Canonical URL – مشابه تصویر RankMath */}
                        <label className="block text-right">
                          <span className="mb-1 block text-xs text-gray-700">
                            URL متعارف (Canonical)
                          </span>
                          <input
                            name="seoCanonicalUrl"
                            dir="ltr"
                            value={seoCanonicalUrl}
                            onChange={(e) => setSeoCanonicalUrl(e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                            placeholder="https://example.com/product/..."
                          />
                          <p className="mt-1 text-[11px] text-gray-500">
                            اگر خالی بماند، به‌طور خودکار از آدرس خود صفحه
                            استفاده می‌شود.
                          </p>
                        </label>

                        {/* Meta Robots – UI دو ستونه مثل RankMath */}
                        <div className="mt-3 rounded border border-gray-200 bg-gray-50 p-3">
                          <div className="mb-2 text-xs font-semibold text-gray-800 text-right">
                            متا ربات‌ها
                          </div>

                          <input
                            type="hidden"
                            name="seoMetaRobots"
                            value={computedSeoMetaRobots}
                          />

                          <div className="grid gap-3 md:grid-cols-2 text-xs text-gray-700">
                            {/* ستون راست: نمایه‌سازی + nofollow + noimageindex */}
                            <div className="space-y-2 text-right">
                              <label className="flex items-center gap-2 justify-end">
                                <span>نمایه‌سازی (Index)</span>
                                <input
                                  type="checkbox"
                                  checked={robotsIndex}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setRobotsIndex(checked);
                                    if (checked) {
                                      // اگر index انتخاب شد، noindex خاموش شود
                                      setRobotsNoIndex(false);
                                    }
                                  }}
                                />
                              </label>

                              <label className="flex items-center gap-2 justify-end">
                                <span>Nofollow</span>
                                <input
                                  type="checkbox"
                                  checked={robotsNoFollow}
                                  onChange={(e) =>
                                    setRobotsNoFollow(e.target.checked)
                                  }
                                />
                              </label>

                              <label className="flex items-center gap-2 justify-end">
                                <span>بدون نمایه تصویر (No Image Index)</span>
                                <input
                                  type="checkbox"
                                  checked={robotsNoImageIndex}
                                  onChange={(e) =>
                                    setRobotsNoImageIndex(e.target.checked)
                                  }
                                />
                              </label>
                            </div>

                            {/* ستون چپ: No Index + No Archive + No Snippet */}
                            <div className="space-y-2 text-right">
                              <label className="flex items-center gap-2 justify-end">
                                <span>No Index</span>
                                <input
                                  type="checkbox"
                                  checked={robotsNoIndex}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setRobotsNoIndex(checked);
                                    if (checked) {
                                      // اگر noindex انتخاب شد، index خاموش شود
                                      setRobotsIndex(false);
                                    }
                                  }}
                                />
                              </label>

                              <label className="flex items-center gap-2 justify-end">
                                <span>بدون بایگانی (No Archive)</span>
                                <input
                                  type="checkbox"
                                  checked={robotsNoArchive}
                                  onChange={(e) =>
                                    setRobotsNoArchive(e.target.checked)
                                  }
                                />
                              </label>

                              <label className="flex items-center gap-2 justify-end">
                                <span>No Snippet</span>
                                <input
                                  type="checkbox"
                                  checked={robotsNoSnippet}
                                  onChange={(e) =>
                                    setRobotsNoSnippet(e.target.checked)
                                  }
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Schema JSON-LD */}
                        {/* اسکیما (JSON-LD) + لیست پرکاربردها شبیه RankMath */}
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-700">
                              اسکیما (JSON-LD)
                            </span>
                            <span className="text-[11px] text-gray-400">
                              یک نوع اسکیما را از لیست زیر انتخاب کنید یا مستقیم
                              JSON را ویرایش کنید.
                            </span>
                          </div>

                          {/* گرید اسکیماها */}
                          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                            {schemaPresets.map((p) => (
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

                          {/* textarea نهایی JSON-LD */}
                          <textarea
                            name="seoSchemaJson"
                            rows={6}
                            dir="ltr"
                            value={seoSchemaJson}
                            onChange={(e) => setSeoSchemaJson(e.target.value)}
                            className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-xs font-mono text-gray-900 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                            placeholder='{ "@context": "https://schema.org", "@type": "Product", ... }'
                          />
                        </div>
                      </div>
                      {/* سه تا فلگ بولی */}
                      <div className="grid gap-2 md:grid-cols-3 text-xs text-gray-700 mt-1">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="autoGenerateSnippet"
                            checked={autoGenerateSnippet}
                            onChange={(e) =>
                              setAutoGenerateSnippet(e.target.checked)
                            }
                          />
                          <span>تولید خودکار اسنیپت</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="autoGenerateHeadTags"
                            checked={autoGenerateHeadTags}
                            onChange={(e) =>
                              setAutoGenerateHeadTags(e.target.checked)
                            }
                          />
                          <span>تولید خودکار تگ‌های head</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="includeInSitemap"
                            checked={includeInSitemap}
                            onChange={(e) =>
                              setIncludeInSitemap(e.target.checked)
                            }
                          />
                          <span>قرار گرفتن در Sitemap</span>
                        </label>
                      </div>
                    </section>
                  </div>

                  {/* ستون راست: متاباکس‌ها */}
                  <div className="space-y-4">
                    {/* وضعیت محصول */}
                    <label className="block text-right">
                      <span className="mb-1 block text-xs text-gray-700">
                        وضعیت محصول
                      </span>
                      <select
                        name="status"
                        value={status}
                        onChange={(e) => setStatus(Number(e.target.value))}
                        className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                      >
                        <option value={0}>پیش‌نویس</option>
                        <option value={1}>منتشر شده</option>
                        <option value={2}>آرشیو شده</option>
                      </select>
                    </label>

                    {/* تصویر محصول */}
                    <div className="rounded border border-gray-300 bg-white text-right">
                      <div className="border-b border-gray-200 px-3 py-2 text-xs font-semibold text-gray-800">
                        تصویر محصول
                      </div>
                      <div className="px-3 py-3">
                        {primaryImageUrl ? (
                          <div className="mb-3">
                            <img
                              src={resolveMediaUrl(primaryImageUrl)}
                              alt="تصویر محصول"
                              className="w-full rounded border border-gray-200 object-contain"
                            />
                          </div>
                        ) : (
                          <div className="mb-3 flex h-32 items-center justify-center rounded border border-dashed border-gray-300 text-xs text-gray-400">
                            هنوز تصویری انتخاب نشده است
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setMediaOpen(true)}
                          className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          انتخاب تصویر محصول
                        </button>
                      </div>
                    </div>

                    {/* گالری تصاویر */}
                    <div className="rounded border border-gray-300 bg-white text-right">
                      <div className="border-b border-gray-200 px-3 py-2 text-xs font-semibold text-gray-800">
                        گالری تصاویر محصول
                      </div>
                      <div className="px-3 py-3 space-y-3 text-xs text-gray-700">
                        {galleryImages.length > 0 ? (
                          <div className="grid grid-cols-2 gap-3">
                            {galleryImages.map((url, index) => (
                              <div
                                key={index}
                                className="relative border border-gray-200 rounded overflow-hidden"
                              >
                                <img
                                  src={resolveMediaUrl(url)}
                                  alt={`تصویر گالری ${index + 1}`}
                                  className="w-full h-24 object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setGalleryImages((prev) =>
                                      prev.filter((_, i) => i !== index)
                                    )
                                  }
                                  className="absolute top-1 left-1 rounded bg-red-600/80 px-1.5 py-0.5 text-[10px] text-white"
                                >
                                  حذف
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-gray-400">
                            هنوز تصویری به گالری اضافه نشده است.
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() => setGalleryMediaOpen(true)}
                          className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          افزودن تصویر به گالری
                        </button>
                      </div>
                    </div>

                    {/* برند و فروشنده */}
                    <div className="rounded border border-gray-300 bg-white text-right">
                      <div className="border-b border-gray-200 px-3 py-2 text-xs font-semibold text-gray-800">
                        برند و فروشنده
                      </div>
                      <div className="space-y-3 px-3 py-3 text-xs text-gray-700">
                        <label className="block text-right">
                          <span className="mb-1 block text-xs text-gray-700">
                            برند
                          </span>
                          <SearchableSelect
                            name="brandId"
                            options={brandSelectOptions}
                            value={brandId}
                            onChange={setBrandId}
                            placeholder="انتخاب برند"
                            emptyLabel="بدون برند"
                          />
                        </label>
                        {multiVendorEnabled && (
                          <label className="block text-right">
                            <span className="mb-1 block text-xs text-gray-700">
                              فروشنده
                            </span>
                            <SearchableSelect
                              name="ownerVendorId"
                              options={vendorSelectOptions}
                              value={ownerVendorId}
                              onChange={setOwnerVendorId}
                              placeholder="انتخاب فروشنده"
                              emptyLabel="فروشگاه اصلی"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* دسته‌های محصول */}
                    <div className="rounded border border-gray-300 bg-white text-right">
                      <div className="border-b border-gray-200 px-3 py-2 text-xs font-semibold text-gray-800">
                        دسته‌های محصول
                      </div>

                      <div className="max-h-64 overflow-y-auto px-3 py-3 text-xs text-gray-700 space-y-1">
                        {hierarchicalCategories.map(({ cat, depth }) => {
                          const checked = selectedCategoryIds.includes(cat.id);

                          return (
                            <label
                              key={cat.id}
                              className="flex items-center gap-2"
                              style={{ paddingRight: depth * 12 }}
                            >
                              <input
                                type="checkbox"
                                name="categoryIds"
                                value={cat.id}
                                checked={checked}
                                onChange={(e) => {
                                  setSelectedCategoryIds((prev) =>
                                    e.target.checked
                                      ? [...prev, cat.id]
                                      : prev.filter((id) => id !== cat.id)
                                  );
                                }}
                              />
                              <span>
                                {depth > 0 && "↳ "}
                                {cat.title}
                              </span>
                            </label>
                          );
                        })}

                        {(!hierarchicalCategories ||
                          hierarchicalCategories.length === 0) && (
                            <p className="text-[11px] text-gray-400">
                              هنوز دسته‌ای ثبت نشده است.
                            </p>
                          )}
                      </div>
                    </div>

                    {/* برچسب‌ها */}
                    {/* برچسب‌ها */}
                    <div className="rounded border border-gray-300 bg-white text-right">
                      <div className="border-b border-gray-200 px-3 py-2 text-xs font-semibold text-gray-800 flex items-center justify-between">
                        <span>برچسب‌ها</span>
                      </div>

                      {/* لیست برچسب‌های موجود + چک‌باکس‌ها */}
                      <div className="max-h-64 overflow-y-auto px-3 py-3 text-xs text-gray-700 space-y-1">
                        {allTags.length > 0 ? (
                          allTags.map((t) => {
                            const checked = selectedTagIds.includes(t.id);
                            return (
                              <label
                                key={t.id}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="checkbox"
                                  name="tagIds"
                                  value={t.id}
                                  checked={checked}
                                  onChange={(e) => {
                                    setSelectedTagIds((prev) =>
                                      e.target.checked
                                        ? [...prev, t.id]
                                        : prev.filter((id) => id !== t.id)
                                    );
                                  }}
                                />
                                <span>{t.name}</span>
                              </label>
                            );
                          })
                        ) : (
                          <p className="text-[11px] text-gray-400">
                            هنوز برچسبی ثبت نشده است.
                          </p>
                        )}
                      </div>

                      {/* ساخت برچسب جدید درجا */}
                      <div className="border-t border-gray-200 px-3 py-2 space-y-2">
                        {tagError && (
                          <p className="text-[11px] text-red-600 text-right">
                            {tagError}
                          </p>
                        )}

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (!tagCreating) handleCreateTag();
                              }
                            }}
                            className="flex-1 rounded border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                            placeholder="نام برچسب جدید"
                          />
                          <button
                            type="button"
                            onClick={handleCreateTag}
                            disabled={tagCreating || !newTagName.trim()}
                            className="rounded bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                          >
                            {tagCreating ? "در حال افزودن..." : "افزودن برچسب"}
                          </button>
                        </div>

                        <p className="text-[10px] text-gray-400 text-right">
                          با وارد کردن نام و زدن «افزودن برچسب»، برچسب جدید
                          ساخته می‌شود و به‌صورت خودکار برای این محصول انتخاب
                          می‌گردد.
                        </p>
                      </div>
                    </div>

                    {/* تنظیمات محصول */}
                    <div className="rounded border border-gray-300 bg-white text-right px-3 py-3 space-y-2">
                      <div className="border-b border-gray-200 pb-2 mb-2 text-xs font-semibold text-gray-800">
                        تنظیمات محصول
                      </div>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="isFeatured"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                        />
                        <span>محصول ویژه (Featured)</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="allowCustomerQuestions"
                          checked={allowCustomerQuestions}
                          onChange={(e) =>
                            setAllowCustomerQuestions(e.target.checked)
                          }
                        />
                        <span>نمایش پرسش و پاسخ</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="allowCustomerReviews"
                          checked={allowCustomerReviews}
                          onChange={(e) =>
                            setAllowCustomerReviews(e.target.checked)
                          }
                        />
                        <span>نمایش دیدگاه‌ها</span>
                      </label>
                    </div>
                  </div>
                </div>
              </form>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* انتخاب تصویر کاور (تک‌انتخابی) */}
      <MediaPickerDialog
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        multiple={false}
        onSelect={(urls) => {
          const url = urls[0];
          if (url) {
            setPrimaryImageUrl(url);
          }
          setMediaOpen(false);
        }}
        hasInitialImage={!!primaryImageUrl}
      />

      {/* انتخاب تصاویر گالری (چند‌انتخابی) */}
      <MediaPickerDialog
        open={galleryMediaOpen}
        onClose={() => setGalleryMediaOpen(false)}
        multiple
        confirmLabel="افزودن به گالری"
        onSelect={(urls) => {
          setGalleryImages((prev) => {
            const merged = [...prev];
            for (const u of urls) {
              if (!merged.includes(u)) merged.push(u);
            }
            return merged;
          });
          setGalleryMediaOpen(false);
        }}
        hasInitialImage={false}
      />
    </>
  );
}
