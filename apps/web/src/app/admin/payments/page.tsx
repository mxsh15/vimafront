import { listPayments } from "@/modules/payments/api";
import { PaymentsPageClient } from "./PaymentsPageClient";

export const metadata = { title: "پرداخت‌ها | پنل مدیریت" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const q = params.q ?? "";
  const status =
    typeof params?.status === "string" && params.status.length > 0
      ? (params.status as any)
      : undefined;

  const data = await listPayments({ page, pageSize: 20, q, status });
  return <PaymentsPageClient data={data} q={q} />;
}
