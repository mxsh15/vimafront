import { listOrders } from "@/modules/order/api";
import { OrdersPageClient } from "./OrdersPageClient";

export const metadata = {
  title: "سفارش‌ها | پنل مدیریت",
};

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; status?: string };
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const q = params.q ?? "";
  const status =
    typeof params?.status === "string" && params.status.length > 0
      ? (params.status as any)
      : undefined;

  const pageSize = 20;

  const data = await listOrders({
    page,
    pageSize,
    q,
    status,
  });

  return <OrdersPageClient data={data} q={q} />;
}
