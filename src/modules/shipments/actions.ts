"use server";

import { revalidatePath } from "next/cache";
import { upsertShipmentByOrder } from "./api";
import type { ShippingUpsertDto } from "./types";

export async function upsertShipmentByOrderAction(
  orderId: string,
  dto: ShippingUpsertDto
) {
  await upsertShipmentByOrder(orderId, dto);
  revalidatePath("/admin/shipments");
}
