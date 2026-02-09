import { listHomeBannersAction } from "@/modules/homeBanner/actions";
import HomeBannersPageClient from "./HomeBannersPageClient";

export const metadata = {
    title: "بنر اسلایدر صفحه اصلی | پنل مدیریت",
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

    const data = await listHomeBannersAction({ page, pageSize, q, status });

    return (
        <HomeBannersPageClient
            data={data}
            q={q}
            page={page}
            pageSize={pageSize}
            status={status}
        />
    );
}
