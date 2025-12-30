import { listPayments } from "@/modules/payments/api";
import { PaymentsPageClient } from "./PaymentsPageClient";

export const metadata = { title: "پرداخت‌ها | پنل مدیریت" };

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

    const data = await listPayments({ page, pageSize: 20, q, status });
    return <PaymentsPageClient data={data} q={q} />;
}
