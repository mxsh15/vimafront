import { listReviews } from "@/modules/review/api";
import { ReviewsPageClient } from "./ReviewsPageClient";

export const metadata = {
    title: "دیدگاه‌های محصولات | پنل مدیریت",
};

export default async function Page({
    searchParams,
}: {
    searchParams: { page?: string; q?: string; isApproved?: string; productId?: string };
}) {
    const page = Number(searchParams?.page ?? 1);
    const q = searchParams?.q ?? "";
    const isApproved =
        typeof searchParams?.isApproved === "string"
            ? searchParams.isApproved === "true"
            : undefined;
    const productId = searchParams?.productId;

    const pageSize = 20;

    const data = await listReviews({
        page,
        pageSize,
        q,
        isApproved,
        productId,
    });

    return <ReviewsPageClient data={data} q={q} />;
}
