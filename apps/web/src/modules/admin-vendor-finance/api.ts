import { apiFetch } from "@/lib/api";
import type {
  PagedResult,
  AdminVendorWalletListItemDto,
  AdminVendorTransactionListItemDto,
  AdminVendorPayoutListItemDto,
  AdminVendorPayoutDetailDto,
  AdminWalletAdjustmentDto,
  AdminPayoutDecisionDto,
  AdminMarkPayoutCompletedDto,
} from "./types";

export async function listWallets({
  page = 1,
  pageSize = 20,
  q,
}: { page?: number; pageSize?: number; q?: string } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q?.trim()) params.set("q", q.trim());
  return serverFetch<PagedResult<AdminVendorWalletListItemDto>>(
    `vendorFinance/wallets?${params.toString()}`
  );
}

export async function getWallet(vendorId: string, txTake = 50) {
  const params = new URLSearchParams({ txTake: String(txTake) });
  return serverFetch<{
    wallet: AdminVendorWalletListItemDto;
    transactions: AdminVendorTransactionListItemDto[];
  }>(`vendorFinance/wallets/${vendorId}?${params.toString()}`);
}

export async function adjustWallet(
  vendorId: string,
  dto: AdminWalletAdjustmentDto
) {
  return serverFetch<void>(`vendorFinance/wallets/${vendorId}/adjust`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function listTransactions({
  page = 1,
  pageSize = 20,
  vendorId,
  type,
  q,
}: {
  page?: number;
  pageSize?: number;
  vendorId?: string;
  type?: string;
  q?: string;
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (vendorId) params.set("vendorId", vendorId);
  if (type) params.set("type", type);
  if (q?.trim()) params.set("q", q.trim());
  return serverFetch<PagedResult<AdminVendorTransactionListItemDto>>(
    `vendorFinance/transactions?${params.toString()}`
  );
}

export async function listPayouts({
  page = 1,
  pageSize = 20,
  q,
  status,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q?.trim()) params.set("q", q.trim());
  if (status) params.set("status", status);
  return serverFetch<PagedResult<AdminVendorPayoutListItemDto>>(
    `vendorFinance/payouts?${params.toString()}`
  );
}

export async function listAbandonedPayouts({
  page = 1,
  pageSize = 20,
  q,
  days = 7,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
  days?: number;
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    days: String(days),
  });
  if (q?.trim()) params.set("q", q.trim());
  return serverFetch<PagedResult<AdminVendorPayoutListItemDto>>(
    `vendorFinance/payouts/abandoned?${params.toString()}`
  );
}

export async function listPayoutTrash({
  page = 1,
  pageSize = 20,
  q,
}: { page?: number; pageSize?: number; q?: string } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q?.trim()) params.set("q", q.trim());
  return serverFetch<PagedResult<AdminVendorPayoutListItemDto>>(
    `vendorFinance/payouts/trash?${params.toString()}`
  );
}

export async function getPayout(id: string) {
  return serverFetch<AdminVendorPayoutDetailDto>(`vendorFinance/payouts/${id}`);
}

export async function deletePayout(id: string) {
  return serverFetch<void>(`vendorFinance/payouts/${id}`, { method: "DELETE" });
}

export async function restorePayout(id: string) {
  return serverFetch<void>(`vendorFinance/payouts/${id}/restore`, {
    method: "POST",
  });
}

export async function hardDeletePayout(id: string) {
  return serverFetch<void>(`vendorFinance/payouts/${id}/hard`, {
    method: "DELETE",
  });
}

export async function decidePayout(id: string, dto: AdminPayoutDecisionDto) {
  return serverFetch<void>(`vendorFinance/payouts/${id}/decision`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function completePayout(
  id: string,
  dto: AdminMarkPayoutCompletedDto
) {
  return serverFetch<void>(`vendorFinance/payouts/${id}/complete`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
