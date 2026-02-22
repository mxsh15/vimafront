"use server";

import { revalidatePath } from "next/cache";
import { approveReview, deleteReview, rejectReview } from "./api";

export async function approveReviewAction(id: string) {
  await approveReview(id);
  revalidatePath("/admin/reviews");
}

export async function deleteReviewAction(id: string) {
  await deleteReview(id);
  revalidatePath("/admin/reviews");
}

export async function rejectReviewAction(id: string) {
  await rejectReview(id);
  revalidatePath("/admin/reviews");
}