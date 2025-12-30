"use client";

import { bffFetch } from "@/lib/fetch-bff";
import type {
  ProductAttributeListItemDto,
  AttributeOptionDto,
  UpsertProductSpecsRequest,
  ProductSpecItemDto,
} from "./types";

// گرفتن یک ویژگی
export async function getProductAttribute(
  id: string
): Promise<ProductAttributeListItemDto> {
  return bffFetch<ProductAttributeListItemDto>(`productAttributes/${id}`, {
    method: "GET",
  });
}

// لیست گزینه‌های یک ویژگی
export async function listAttributeOptions(
  attributeId: string
): Promise<AttributeOptionDto[]> {
  return bffFetch<AttributeOptionDto[]>(
    `attributeOptions/by-attribute/${attributeId}`,
    {
      method: "GET",
    }
  );
}

export async function upsertProductSpecs(
  productId: string,
  payload: UpsertProductSpecsRequest
): Promise<void> {
  return bffFetch<void>(`products/${productId}/specs`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listAttributeOptionsByAttribute(
  attributeId: string
): Promise<AttributeOptionDto[]> {
  return bffFetch<AttributeOptionDto[]>(
    `attributeOptions/by-attribute/${attributeId}`,
    {
      method: "GET",
      next: { revalidate: 0 },
    }
  );
}

export async function getProductSpecsClient(
  productId: string
): Promise<ProductSpecItemDto[]> {
  return bffFetch<ProductSpecItemDto[]>(`products/${productId}/specs`, {
    method: "GET",
  });
}

export async function createAttributeOption(
  attributeId: string,
  value: string
): Promise<AttributeOptionDto> {
  return bffFetch<AttributeOptionDto>("attributeOptions", {
    method: "POST",
    body: JSON.stringify({
      attributeId,
      value,
      displayLabel: value,
      sortOrder: 0,
      isDefault: false,
    }),
  });
}
