"use client";

import { useState, useTransition, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import {
  answerQuestionAction,
  deleteQuestionAction,
  approveQuestionAction,
  rejectQuestionAction,
} from "../actions";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { usePermissions } from "@/context/PermissionContext";
import { QuestionAnswersDialog } from "./QuestionAnswersDialog";

type Props = {
  question: {
    id: string;
    question: string;
    productTitle: string;
    isApproved: boolean;
    isAnswered: boolean;
    answersCount: number;
  };
};

export function ProductQuestionRowActionsMenu({ question }: Props) {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [pending, startTransition] = useTransition();
  const [answersOpen, setAnswersOpen] = useState(false);

  const canApprove =
    hasPermission("product-questions.approve") ||
    hasPermission("product-questions.view");
  const canReject =
    hasPermission("product-questions.approve") ||
    hasPermission("product-questions.view");
  const canAnswer =
    hasPermission("product-questions.answer") ||
    hasPermission("product-questions.view");
  const canDelete =
    hasPermission("product-questions.delete") ||
    hasPermission("product-questions.view");

  const isPendingApproval = !question.isApproved;
  const canAnswerThisQuestion = canAnswer && question.isApproved;

  const handleDelete = () => {
    if (!confirm("سؤال حذف شود؟")) return;
    startTransition(async () => {
      await deleteQuestionAction(question.id);
      router.refresh();
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    startTransition(async () => {
      await answerQuestionAction(question.id, answer.trim());
      setAnswer("");
      setOpen(false);
      router.refresh();
    });
  };

  useEffect(() => {
    if (!question.isApproved && open) setOpen(false);
  }, [question.isApproved, open]);

  const canViewAnswers =
    hasPermission("product-questions.view") || hasPermission("product-questions.manage");

  const extraActions = [

    ...(canViewAnswers && (question.answersCount > 0 || question.isAnswered)
      ? [
        {
          label: `مشاهده پاسخ‌ها (${question.answersCount})`,
          onClick: () => setAnswersOpen(true),
        },
      ]
      : []),

    ...(canApprove && isPendingApproval
      ? [
        {
          label: "تأیید پرسش",
          onClick: async () => {
            const ok = window.confirm("آیا از تأیید این پرسش مطمئن هستید؟");
            if (!ok) return;
            await approveQuestionAction(question.id);
            router.refresh();
          },
        },
        {
          label: "رد پرسش",
          danger: true,
          onClick: async () => {
            const ok = window.confirm("آیا از رد کردن این پرسش مطمئن هستید؟");
            if (!ok) return;
            await rejectQuestionAction(question.id);
            router.refresh();
          },
        },
      ]
      : []),

    ...(canReject && !isPendingApproval
      ? [
        {
          label: "لغو تأیید",
          danger: true,
          onClick: async () => {
            const ok = window.confirm("تأیید این پرسش لغو شود؟");
            if (!ok) return;
            await rejectQuestionAction(question.id);
            router.refresh();
          },
        },
      ]
      : []),
  ];

  const answerLockedLabel = isPendingApproval
    ? "ابتدا تأیید کنید"
    : "اجازه پاسخ ندارید";

  return (
    <>
      <RowActionsMenu
        onEdit={canAnswerThisQuestion ? () => setOpen(true) : undefined}
        onDelete={canDelete ? handleDelete : undefined}
        editLabel={
          canAnswerThisQuestion
            ? question.isAnswered
              ? "ویرایش پاسخ"
              : "پاسخ دادن"
            : answerLockedLabel
        }
        deleteLabel="حذف سؤال"
        extraActions={extraActions}
      />

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg">
            <DialogTitle className="mb-2 text-sm font-semibold">
              پاسخ به پرسش برای «{question.productTitle}»
            </DialogTitle>

            <p className="mb-3 text-xs text-slate-600">{question.question}</p>

            {!question.isApproved ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                این پرسش هنوز تأیید نشده است. ابتدا آن را تأیید کنید، سپس پاسخ بدهید.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  rows={4}
                  placeholder="متن پاسخ..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs"
                    onClick={() => setOpen(false)}
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={pending || !answer.trim()}
                    className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs text-white disabled:opacity-60"
                  >
                    {pending ? "در حال ذخیره..." : "ثبت پاسخ"}
                  </button>
                </div>
              </form>
            )}
          </DialogPanel>
        </div>
      </Dialog>

      <QuestionAnswersDialog
        open={answersOpen}
        onClose={() => setAnswersOpen(false)}
        questionId={question.id}
        productTitle={question.productTitle}
        questionText={question.question}
      />
    </>
  );
}
