import { listShipments } from "@/modules/shipments/api";
import { ShipmentsPageClient } from "./ShipmentsPageClient";

export const metadata = { title: "مرسوله‌ها | پنل مدیریت" };

export default async function Page({
    searchParams,
}: {
    searchParams: { page?: string; q?: string; status?: string };
}) {
    const page = Number(searchParams?.page ?? 1);
    const q = searchParams?.q ?? "";
    const status =
        typeof searchParams?.status === "string" && searchParams.status.length > 0
            ? (searchParams.status as any)
            : undefined;

    const data = await listShipments({ page, pageSize: 20, q, status });
    return <ShipmentsPageClient data={data} q={q} />;
}
