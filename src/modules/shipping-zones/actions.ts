"use server";

import { revalidatePath } from "next/cache";
import {
  createShippingZone,
  updateShippingZone,
  deleteShippingZone,
  upsertShippingZoneRates,
} from "./api";
import type { ShippingZoneUpsertDto, ShippingZoneRateDto } from "./types";

export async function createShippingZoneAction(formData: FormData) {
  const dto: ShippingZoneUpsertDto = {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    status: String(formData.get("status") ?? "true") === "true",
    sortOrder: Number(String(formData.get("sortOrder") ?? "0")),
    countryCode: String(formData.get("countryCode") ?? "").trim() || null,
    province: String(formData.get("province") ?? "").trim() || null,
    city: String(formData.get("city") ?? "").trim() || null,
    postalCodePattern:
      String(formData.get("postalCodePattern") ?? "").trim() || null,
  };

  await createShippingZone(dto);
  revalidatePath("/admin/shipping-zones");
}

export async function updateShippingZoneAction(id: string, formData: FormData) {
  const dto: ShippingZoneUpsertDto = {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    status: String(formData.get("status") ?? "true") === "true",
    sortOrder: Number(String(formData.get("sortOrder") ?? "0")),
    countryCode: String(formData.get("countryCode") ?? "").trim() || null,
    province: String(formData.get("province") ?? "").trim() || null,
    city: String(formData.get("city") ?? "").trim() || null,
    postalCodePattern:
      String(formData.get("postalCodePattern") ?? "").trim() || null,
  };

  await updateShippingZone(id, dto);
  revalidatePath("/admin/shipping-zones");
}

export async function deleteShippingZoneAction(id: string) {
  await deleteShippingZone(id);
  revalidatePath("/admin/shipping-zones");
}

export async function upsertShippingZoneRatesAction(
  zoneId: string,
  rates: ShippingZoneRateDto[]
) {
  await upsertShippingZoneRates(zoneId, rates);
  revalidatePath(`/admin/shipping-zones/${zoneId}/rates`);
}
