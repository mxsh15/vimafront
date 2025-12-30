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
    const page = Number(searchParams?.page ?? 1);
    const q = searchParams?.q ?? "";
    const status =
        typeof searchParams?.status === "string" && searchParams.status.length > 0
            ? (searchParams.status as any)
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
