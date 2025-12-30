"use client";

import { useState } from "react";
import ProductModalButton from "./ProductModalButton";
import type { ProductListItemDto, BrandOptionDto, VendorOptionDto } from "../types";
import { deleteProductAction } from "../actions";
import { AttributeGroupListItemDto, ProductAttributeListItemDto } from "@/modules/specs/types";
import { CategoryOptionDto } from "@/modules/category/types";
import { TagListItemDto } from "@/modules/tag/types";

export function ProductRowMenuCell({
    product,
    brandOptions,
    vendorOptions,
    attributeOptions,
    groupOptions,
    categoryOptions,
    tagOptions
}: {
    product: ProductListItemDto;
    brandOptions: BrandOptionDto[];
    vendorOptions: VendorOptionDto[];
    attributeOptions: ProductAttributeListItemDto[];
    groupOptions: AttributeGroupListItemDto[];
    categoryOptions: CategoryOptionDto[];
    tagOptions: TagListItemDto[];
}) {
    const [deleting, setDeleting] = useState(false);

    async function handleDelete() {
        if (!confirm("آیا از حذف این محصول مطمئن هستید؟"))
            return; setDeleting(true);
        await deleteProductAction(product.id);
        setDeleting(false);
    }
    return (
        <div className="flex items-center gap-2 text-xs">
            <ProductModalButton
                product={product}
                brandOptions={brandOptions}
                vendorOptions={vendorOptions}
                attributeOptions={attributeOptions}
                groupOptions={groupOptions}
                categoryOptions={categoryOptions}
                tagOptions={tagOptions}
                initialCategoryIds={product.categoryIds ?? []}
                initialGalleryImages={product.galleryImageUrls ?? []}
                initialTagIds={product.tagIds ?? []}
                triggerVariant="link" label="ویرایش" />
            <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="border px-2 py-1 rounded text-red-500 disabled:opacity-60">
                {deleting ? "..." : "حذف"} </button>
        </div>);
}