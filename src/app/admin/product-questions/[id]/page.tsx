import { getQuestionDetail } from "@/modules/product-qa/api";
import { QuestionDetailClient } from "./QuestionDetailClient";

export const metadata = { title: "جزئیات سؤال محصول | پنل مدیریت" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getQuestionDetail(id);
    return <QuestionDetailClient data={data} />;
}
