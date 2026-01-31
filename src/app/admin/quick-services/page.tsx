import { listQuickServicesAction } from "@/modules/quickService/actions";
import QuickServicesPageClient from "./QuickServicesPageClient";

export const metadata = {
    title: "سرویس‌های سریع صفحه اصلی | پنل مدیریت",
};

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
    const params = await searchParams;
    const page = Number(params.page ?? 1);
    const pageSize = 20;
    const q = params.q ?? "";
    const statusRaw = (params.status ?? "all").toLowerCase();
    const status: "all" | "active" | "inactive" =
        statusRaw === "active" || statusRaw === "inactive" ? statusRaw : "all";

    const data = await listQuickServicesAction({ page, pageSize, q, status });

    return (
        <QuickServicesPageClient
            data={data}
            q={q}
            page={page}
            pageSize={pageSize}
            status={status}
        />
    );
}
