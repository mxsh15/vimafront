"use server";

import { revalidatePath } from "next/cache";
import { answerQuestion, deleteQuestion, setQuestionApproval } from "./api";
import {
  verifyAnswer,
  updateAnswer,
  deleteAnswer,
  restoreQuestion,
  hardDeleteQuestion,
  restoreAnswer,
  hardDeleteAnswer,
} from "./api";

export async function answerQuestionAction(id: string, answer: string) {
  await answerQuestion(id, answer);
  revalidatePath("/admin/product-questions");
}

export async function deleteQuestionAction(id: string) {
  await deleteQuestion(id);
  revalidatePath("/admin/product-questions");
}

export async function approveQuestionAction(id: string) {
  await setQuestionApproval(id, true);
  revalidatePath("/admin/product-questions");
  revalidatePath(`/admin/product-questions/${id}`);
}

export async function rejectQuestionAction(id: string) {
  await setQuestionApproval(id, false);
  revalidatePath("/admin/product-questions");
  revalidatePath(`/admin/product-questions/${id}`);
}

export async function verifyAnswerAction(answerId: string, isVerified: boolean) {
  await verifyAnswer(answerId, isVerified);
  revalidatePath("/admin/product-questions");
  revalidatePath("/admin/product-questions/answers/trash");
}

export async function updateAnswerAction(answerId: string, answer: string) {
  await updateAnswer(answerId, answer);
  revalidatePath("/admin/product-questions");
}

export async function deleteAnswerAction(answerId: string) {
  await deleteAnswer(answerId);
  revalidatePath("/admin/product-questions");
}

export async function restoreQuestionAction(id: string) {
  await restoreQuestion(id);
  revalidatePath("/admin/product-questions/trash");
  revalidatePath("/admin/product-questions");
}

export async function hardDeleteQuestionAction(id: string) {
  await hardDeleteQuestion(id);
  revalidatePath("/admin/product-questions/trash");
}

export async function restoreAnswerAction(id: string) {
  await restoreAnswer(id);
  revalidatePath("/admin/product-questions/answers/trash");
}

export async function hardDeleteAnswerAction(id: string) {
  await hardDeleteAnswer(id);
  revalidatePath("/admin/product-questions/answers/trash");
}
