"use client";

import ProductModalButton from "./ProductModalButton";
import type { BrandOptionDto, VendorOptionDto } from "../types";
import { ProductAttributeListItemDto, AttributeGroupListItemDto } from "@/modules/specs/types";
import { CategoryOptionDto } from "@/modules/category/types";
import { TagListItemDto } from "@/modules/tag/types";

export function ProductCreateButton({
  brandOptions,
  vendorOptions,
  attributeOptions,
  groupOptions,
  categoryOptions,
  tagOptions,
}: {
  brandOptions: BrandOptionDto[];
  vendorOptions: VendorOptionDto[];
  attributeOptions: ProductAttributeListItemDto[];
  groupOptions: AttributeGroupListItemDto[];
  categoryOptions: CategoryOptionDto[];
  tagOptions: TagListItemDto[];
}) {
  return (
    <ProductModalButton
      brandOptions={brandOptions}
      vendorOptions={vendorOptions}
      attributeOptions={attributeOptions}
      groupOptions={groupOptions}
      categoryOptions={categoryOptions}
      tagOptions={tagOptions} 
      initialCategoryIds={[]}
      asHeader
      triggerVariant="primary"
      label="محصول جدید" />
  );
}
