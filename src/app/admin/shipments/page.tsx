import { listShipments } from "@/modules/shipments/api";
import { ShipmentsPageClient } from "./ShipmentsPageClient";

export const metadata = { title: "مرسوله‌ها | پنل مدیریت" };

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

  const data = await listShipments({ page, pageSize: 20, q, status });
  return <ShipmentsPageClient data={data} q={q} />;
}
