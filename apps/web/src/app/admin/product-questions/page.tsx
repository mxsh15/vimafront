import { listProductQuestions } from "@/modules/product-qa/api";
import { ProductQuestionsPageClient } from "./ProductQuestionsPageClient";

export const metadata = {
  title: "سؤالات محصولات | پنل مدیریت",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    isAnswered?: string;
    productId?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const q = params.q ?? "";
  const isAnswered =
    typeof params?.isAnswered === "string"
      ? params.isAnswered === "true"
      : undefined;
  const productId = params?.productId;
  const pageSize = 20;

  const data = await listProductQuestions({
    page,
    pageSize,
    q,
    isAnswered,
    productId,
  });

  return <ProductQuestionsPageClient data={data} q={q} />;
}
