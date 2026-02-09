"use server";

import { revalidatePath } from "next/cache";
import { updateOrderStatus } from "./api";
import type { OrderStatus } from "./types";

export async function updateOrderStatusAction(id: string, status: OrderStatus) {
  await updateOrderStatus(id, status);
  revalidatePath("/admin/orders");
}
