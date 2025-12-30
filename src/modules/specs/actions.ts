"use server";

import { revalidatePath } from "next/cache";
import { attributeGroupSchema, attributeSetSchema } from "./schemas";
import {
  upsertAttributeGroup,
  deleteAttributeGroup,
  upsertAttributeSet,
} from "./api";
import { apiFetch } from "@/lib/api";
import { AttributeOptionDto } from "./types";

export async function upsertAttributeSetFormAction(formData: FormData) {
  const data = {
    id: (formData.get("id") as string) || undefined,
    name: String(formData.get("name") || "").trim(),
    description: (formData.get("description") as string) || null,
    rowVersion: (formData.get("rowVersion") as string) || null,
  };

  const parsed = attributeSetSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Invalid input");
  }

  await upsertAttributeSet(parsed.data);
  revalidatePath("/admin/spec-groups");
}

export async function upsertAttributeGroupFormAction(formData: FormData) {
  const attributeIds = formData
    .getAll("attributeIds")
    .map((x) => x.toString())
    .filter((x) => x !== "");

  const data = {
    id: (formData.get("id") as string) || undefined,
    attributeSetId: String(formData.get("attributeSetId") || ""),
    name: String(formData.get("name") || "").trim(),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    rowVersion: (formData.get("rowVersion") as string) || null,
    attributeIds,
  };

  const parsed = attributeGroupSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Invalid input");
  }

  await upsertAttributeGroup(parsed.data);
  revalidatePath("/admin/spec-groups");
}

export async function deleteAttributeGroupAction(id: string) {
  await deleteAttributeGroup(id);
  revalidatePath("/admin/spec-groups");
}

export async function upsertProductAttributeFormAction(formData: FormData) {
  const idRaw = formData.get("id")?.toString() ?? "";
  const id = idRaw || null;

  const attributeGroupIdRaw = formData.get("attributeGroupId");
  const attributeGroupId =
    attributeGroupIdRaw && attributeGroupIdRaw.toString().trim() !== ""
      ? attributeGroupIdRaw.toString()
      : null;

  const name = (formData.get("name") ?? "").toString();
  const key = (formData.get("key") ?? "").toString();
  const unit = formData.get("unit")?.toString() || null;
  const valueType = Number(formData.get("valueType") ?? "4");
  const isFilterable = formData.get("isFilterable") === "on";
  const isComparable = formData.get("isComparable") === "on";
  const isVariantLevel = formData.get("isVariantLevel") === "on";
  const isRequired = formData.get("isRequired") === "on";
  const sortOrder = Number(formData.get("sortOrder") ?? "0");

  const payload = {
    id,
    attributeGroupId,
    name,
    key,
    unit,
    valueType,
    isRequired,
    isVariantLevel,
    isFilterable,
    isComparable,
    sortOrder,
  };

  await serverFetch<void>("productAttributes", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  revalidatePath(`/admin/spec-attributes`);
}

export async function upsertAttributeOptionsFormAction(formData: FormData) {
  const attributeId = formData.get("attributeId")!.toString();

  const raw = formData.get("optionsJson")?.toString() || "[]";
  const items: Array<Partial<AttributeOptionDto>> = JSON.parse(raw);

  const payload = {
    attributeId,
    items: items.map((i) => ({
      id: i.id || null,
      value: i.value,
      displayLabel: i.displayLabel,
      sortOrder: i.sortOrder ?? 0,
      isDefault: i.isDefault ?? false,
    })),
  };

  await serverFetch<void>("attributeOptions/bulk-upsert", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  revalidatePath(`/admin/spec-groups`);
}

export async function loadAttributeOptionsAction(attributeId: string) {
  return await serverFetch<AttributeOptionDto[]>(
    `attributeOptions/by-attribute/${attributeId}`
  );
}

export async function deleteProductAttributeAction(id: string) {
  await serverFetch<void>(`productAttributes/${id}`, { method: "DELETE" });
  revalidatePath(`/admin/spec-attributes`);
  revalidatePath(`/admin/spec-attributes/trash`);
  revalidatePath(`/admin/spec-attributes/unused`);
}

export async function restoreProductAttributeAction(id: string) {
  await serverFetch<void>(`productAttributes/${id}/restore`, {
    method: "POST",
  });
  revalidatePath(`/admin/spec-attributes`);
  revalidatePath(`/admin/spec-attributes/trash`);
  revalidatePath(`/admin/spec-attributes/unused`);
}

export async function hardDeleteProductAttributeAction(id: string) {
  await serverFetch<void>(`productAttributes/${id}/hard`, { method: "DELETE" });
  revalidatePath(`/admin/spec-attributes/trash`);
}
