"use server";

import { revalidatePath } from "next/cache";
import {
  adjustWallet,
  deletePayout,
  restorePayout,
  hardDeletePayout,
  decidePayout,
  completePayout,
} from "./api";
import type {
  AdminWalletAdjustmentDto,
  AdminPayoutDecisionDto,
  AdminMarkPayoutCompletedDto,
} from "./types";

function revalidateAll() {
  revalidatePath("/admin/vendor-finance/wallets");
  revalidatePath("/admin/vendor-finance/transactions");
  revalidatePath("/admin/vendor-finance/payouts");
  revalidatePath("/admin/vendor-finance/payouts/abandoned");
  revalidatePath("/admin/vendor-finance/payouts/trash");
}

export async function adjustWalletAction(
  vendorId: string,
  dto: AdminWalletAdjustmentDto
) {
  await adjustWallet(vendorId, dto);
  revalidatePath(`/admin/vendor-finance/wallets/${vendorId}`);
  revalidateAll();
}

export async function deletePayoutAction(id: string) {
  await deletePayout(id);
  revalidateAll();
}

export async function restorePayoutAction(id: string) {
  await restorePayout(id);
  revalidateAll();
}

export async function hardDeletePayoutAction(id: string) {
  await hardDeletePayout(id);
  revalidatePath("/admin/vendor-finance/payouts/trash");
}

export async function decidePayoutAction(
  id: string,
  dto: AdminPayoutDecisionDto
) {
  await decidePayout(id, dto);
  revalidatePath(`/admin/vendor-finance/payouts/${id}`);
  revalidateAll();
}

export async function completePayoutAction(
  id: string,
  dto: AdminMarkPayoutCompletedDto
) {
  await completePayout(id, dto);
  revalidatePath(`/admin/vendor-finance/payouts/${id}`);
  revalidateAll();
}
