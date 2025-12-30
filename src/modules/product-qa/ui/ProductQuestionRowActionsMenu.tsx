"use client";

import { useState, useTransition, FormEvent } from "react";
import { RowActionsMenu } from "@/shared/components/RowActionsMenu";
import { answerQuestionAction, deleteQuestionAction } from "../actions";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";

type Props = {
    question: {
        id: string;
        question: string;
        productTitle: string;
        isAnswered: boolean;
    };
};

export function ProductQuestionRowActionsMenu({ question }: Props) {
    const [open, setOpen] = useState(false);
    const [answer, setAnswer] = useState("");
    const [pending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm("سؤال حذف شود؟")) return;
        startTransition(async () => {
            await deleteQuestionAction(question.id);
        });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!answer.trim()) return;

        startTransition(async () => {
            await answerQuestionAction(question.id, answer.trim());
            setAnswer("");
            setOpen(false);
        });
    };

    return (
        <>
            <RowActionsMenu
                onEdit={() => setOpen(true)}
                onDelete={handleDelete}
                editLabel={question.isAnswered ? "ویرایش پاسخ" : "پاسخ دادن"}
                deleteLabel="حذف سؤال"
            />

            <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
                <DialogBackdrop className="fixed inset-0 bg-black/30" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg">
                        <DialogTitle className="mb-2 text-sm font-semibold">
                            پاسخ به سؤال برای «{question.productTitle}»
                        </DialogTitle>
                        <p className="mb-3 text-xs text-slate-600">
                            {question.question}
                        </p>
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
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    );
}
