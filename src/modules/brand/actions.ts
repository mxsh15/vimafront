"use server";

import { revalidateTag } from "next/cache";
import type { BrandUpsertInput } from "./schemas";
import {
  createBrand,
  updateBrand,
  deleteBrand,
  restoreBrand,
  hardDeleteBrand,
} from "./api";
import { pick } from "./utils";

const TAGS = {
  list: "brands",
  trash: "brands:trash",
  detail: (id: string) => `brand:${id}`,
};

// برای صفحه /admin/brands/[id]
export async function upsertBrandAction(id: string, payload: BrandUpsertInput) {
  await updateBrand(id, payload);

  revalidateTag(TAGS.list, "max");
  revalidateTag(TAGS.detail(id), "max");
}

// برای مودال create/edit که FormData می‌دهد
export async function upsertBrandFormAction(formData: FormData): Promise<void> {
  const payload = pick(formData);
  if (payload.id) {
    await updateBrand(payload.id, payload as any);

    revalidateTag(TAGS.list, "max");
    revalidateTag(TAGS.detail(payload.id), "max");
  } else {
    await createBrand(payload as any);

    revalidateTag(TAGS.list, "max");
  }
}

export async function deleteBrandAction(id: string) {
  await deleteBrand(id);

  revalidateTag(TAGS.list, "max");
  revalidateTag(TAGS.detail(id), "max");
  revalidateTag(TAGS.trash, "max");
}

export async function restoreBrandAction(id: string) {
  await restoreBrand(id);

  revalidateTag(TAGS.list, "max");
  revalidateTag(TAGS.trash, "max");
  revalidateTag(TAGS.detail(id), "max");
}

export async function hardDeleteBrandAction(id: string) {
  await hardDeleteBrand(id);

  revalidateTag(TAGS.trash, "max");
  revalidateTag(TAGS.detail(id), "max");
}
