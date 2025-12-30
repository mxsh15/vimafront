import { apiFetch } from "@/lib/api";
import type {
  PagedResult,
  AttributeSetListItemDto,
  AttributeSetOptionDto,
  AttributeGroupListItemDto,
  AttributeGroupDto,
  ProductAttributeListItemDto,
  AttributeOptionDto,
  ProductSpecItemDto,
  UpsertProductSpecsRequest,
} from "./types";

import {
  AttributeSetUpsertInput,
  AttributeGroupUpsertInput,
  ProductAttributeUpsertInput,
} from "./schemas";

// AttributeSets
export async function listAttributeSets(params?: {
  page?: number;
  pageSize?: number;
  q?: string;
}) {
  const searchParams = new URLSearchParams();
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  searchParams.set("page", String(page));
  searchParams.set("pageSize", String(pageSize));
  if (params?.q) searchParams.set("q", params.q);

  const url = `attributeSets?${searchParams.toString()}`;
  return apiFetch<PagedResult<AttributeSetListItemDto>>(url);
}

export async function listAttributeSetOptions({
  onlyActive = true,
}: { onlyActive?: boolean } = {}) {
  const params = new URLSearchParams();
  if (onlyActive) params.set("onlyActive", "true");

  return apiFetch<AttributeSetOptionDto[]>(
    `attributeSets/options?${params.toString()}`
  );
}

export async function upsertAttributeSet(input: AttributeSetUpsertInput) {
  if (input.id) {
    return apiFetch(`attributeSets/${input.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: input.name,
        description: input.description ?? null,
        rowVersion: input.rowVersion ?? null,
      }),
    });
  }

  return apiFetch("attributeSets", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      description: input.description ?? null,
    }),
  });
}

// AttributeGroups
export async function listAttributeGroups(params?: {
  page?: number;
  pageSize?: number;
  q?: string;
  attributeSetId?: string;
}) {
  const sp = new URLSearchParams();
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  sp.set("page", String(page));
  sp.set("pageSize", String(pageSize));
  if (params?.q) sp.set("q", params.q);
  if (params?.attributeSetId) sp.set("attributeSetId", params.attributeSetId);

  const url = `attributeGroups?${sp.toString()}`;
  return apiFetch<PagedResult<AttributeGroupListItemDto>>(url);
}

export async function getAttributeGroup(id: string) {
  return apiFetch<AttributeGroupDto>(`attributeGroups/${id}`);
}

export async function upsertAttributeGroup(input: AttributeGroupUpsertInput) {
  const payload = {
    attributeSetId: input.attributeSetId,
    name: input.name,
    sortOrder: input.sortOrder ?? 0,
    rowVersion: input.rowVersion ?? null,
    attributeIds: input.attributeIds ?? [],
  };

  if (input.id) {
    return apiFetch(`attributeGroups/${input.id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  return apiFetch("attributeGroups", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteAttributeGroup(id: string) {
  return apiFetch<void>(`attributeGroups/${id}`, {
    method: "DELETE",
  });
}

// لیست ویژگی‌ها برای یک گروه
export async function listProductAttributes({
  page,
  pageSize,
  q,
  attributeGroupId,
}: {
  page: number;
  pageSize: number;
  q?: string;
  attributeGroupId?: string; // اختیاری
}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (q) params.set("q", q);

  if (attributeGroupId && attributeGroupId !== "undefined") {
    params.set("attributeGroupId", attributeGroupId);
  }

  return apiFetch<PagedResult<ProductAttributeListItemDto>>(
    `productAttributes?${params.toString()}`
  );
}

export async function upsertProductAttribute(
  input: ProductAttributeUpsertInput
) {
  const payload = {
    attributeGroupId: input.attributeGroupId,
    name: input.name,
    key: input.key,
    unit: input.unit ?? null,
    valueType: input.valueType,
    isRequired: input.isRequired ?? false,
    isVariantLevel: input.isVariantLevel ?? false,
    isFilterable: input.isFilterable ?? false,
    isComparable: input.isComparable ?? false,
    sortOrder: input.sortOrder ?? 0,
    rowVersion: input.rowVersion ?? null,
  };

  if (input.id) {
    return apiFetch(`productAttributes/${input.id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  return apiFetch("productAttributes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteProductAttribute(id: string) {
  return apiFetch<void>(`productAttributes/${id}`, {
    method: "DELETE",
  });
}

// خواندن مشخصات یک محصول
export async function getProductSpecs(productId: string) {
  return apiFetch<ProductSpecItemDto[]>(`products/${productId}/specs`, {
    method: "GET",
    next: { revalidate: 0 },
  });
}

// ذخیره‌ی bulk مشخصات یک محصول
export async function upsertProductSpecs(
  productId: string,
  payload: UpsertProductSpecsRequest
): Promise<void> {
  return apiFetch<void>(`products/${productId}/specs`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// گرفتن گزینه‌های هر ویژگی
export async function listAttributeOptionsByAttribute(
  attributeId: string
): Promise<AttributeOptionDto[]> {
  return apiFetch<AttributeOptionDto[]>(
    `attributeOptions/by-attribute/${attributeId}`,
    {
      method: "GET",
      next: { revalidate: 0 },
    }
  );
}

export async function listDeletedProductAttributes({
  page,
  pageSize,
  q,
}: {
  page: number;
  pageSize: number;
  q?: string;
}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (q) params.set("q", q);

  return apiFetch<PagedResult<ProductAttributeListItemDto>>(
    `productAttributes/trash?${params.toString()}`
  );
}

export async function listUnusedProductAttributes({
  page,
  pageSize,
  q,
}: {
  page: number;
  pageSize: number;
  q?: string;
}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (q) params.set("q", q);

  return apiFetch<PagedResult<ProductAttributeListItemDto>>(
    `productAttributes/unused?${params.toString()}`
  );
}

export async function restoreProductAttribute(id: string) {
  return apiFetch<void>(`productAttributes/${id}/restore`, {
    method: "POST",
  });
}

export async function hardDeleteProductAttribute(id: string) {
  return apiFetch<void>(`productAttributes/${id}/hard`, {
    method: "DELETE",
  });
}
