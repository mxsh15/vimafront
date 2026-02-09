import type { PagedResult } from "@/shared/types/adminlistpageTypes";
import type { PaymentRow, PaymentStatus } from "./types";
import { apiFetch } from "@/lib/api";

export async function listPayments({
  page = 1,
  pageSize = 20,
  q,
  status,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: PaymentStatus;
} = {}): Promise<PagedResult<PaymentRow>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (q) params.set("q", q);
  if (status) params.set("status", status);

  return serverFetch<PagedResult<PaymentRow>>(`payments?${params.toString()}`);
}
