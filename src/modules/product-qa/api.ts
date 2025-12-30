import type { PagedResult } from "@/shared/types/adminlistpageTypes";
import type { ProductQuestionDto, ProductAnswerDto } from "./types";
import { apiFetch } from "@/lib/api";

export async function listProductQuestions({
  page = 1,
  pageSize = 20,
  q,
  isAnswered,
  productId,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
  isAnswered?: boolean;
  productId?: string;
} = {}): Promise<PagedResult<ProductQuestionDto>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (q) params.set("q", q);
  if (typeof isAnswered === "boolean")
    params.set("isAnswered", String(isAnswered));
  if (productId) params.set("productId", productId);

  return apiFetch<PagedResult<ProductQuestionDto>>(
    `product-questions?${params.toString()}`
  );
}

export async function answerQuestion(
  questionId: string,
  answer: string
): Promise<ProductAnswerDto> {
  return apiFetch<ProductAnswerDto>(
    `product-questions/${questionId}/answers`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    }
  );
}

export async function deleteQuestion(id: string) {
  return apiFetch<void>(`product-questions/${id}`, { method: "DELETE" });
}

import type { ProductQuestionDetailDto } from "./types";

export async function getQuestionDetail(id: string) {
  return apiFetch<ProductQuestionDetailDto>(
    `product-questions/${id}/detail`
  );
}

export async function verifyAnswer(answerId: string, isVerified = true) {
  const params = new URLSearchParams({ isVerified: String(isVerified) });
  return apiFetch<void>(
    `product-questions/answers/${answerId}/verify?${params.toString()}`,
    {
      method: "PUT",
    }
  );
}

export async function updateAnswer(answerId: string, answer: string) {
  return apiFetch<void>(`product-questions/answers/${answerId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answer }),
  });
}

export async function deleteAnswer(answerId: string) {
  return apiFetch<void>(`product-questions/answers/${answerId}`, {
    method: "DELETE",
  });
}

// سوال‌ها
export async function listQuestionsTrash({
  page = 1,
  pageSize = 20,
  q,
}: { page?: number; pageSize?: number; q?: string } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q?.trim()) params.set("q", q.trim());
  return apiFetch(`product-questions/trash?${params.toString()}`);
}
export async function restoreQuestion(id: string) {
  return apiFetch<void>(`product-questions/${id}/restore`, {
    method: "POST",
  });
}
export async function hardDeleteQuestion(id: string) {
  return apiFetch<void>(`product-questions/${id}/hard`, {
    method: "DELETE",
  });
}

// پاسخ‌ها
export async function listAnswersTrash({
  page = 1,
  pageSize = 20,
  q,
}: { page?: number; pageSize?: number; q?: string } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q?.trim()) params.set("q", q.trim());
  return apiFetch(`product-questions/answers/trash?${params.toString()}`);
}
export async function restoreAnswer(answerId: string) {
  return apiFetch<void>(`product-questions/answers/${answerId}/restore`, {
    method: "POST",
  });
}
export async function hardDeleteAnswer(answerId: string) {
  return apiFetch<void>(`product-questions/answers/${answerId}/hard`, {
    method: "DELETE",
  });
}
