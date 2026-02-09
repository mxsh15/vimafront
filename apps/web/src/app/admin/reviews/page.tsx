import { listReviews } from "@/modules/review/api";
import { ReviewsPageClient } from "./ReviewsPageClient";

export const metadata = {
  title: "دیدگاه‌های محصولات | پنل مدیریت",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    isApproved?: string;
    productId?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const q = params.q ?? "";
  const isApproved =
    typeof params?.isApproved === "string"
      ? params.isApproved === "true"
      : undefined;
  const productId = params?.productId;
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
