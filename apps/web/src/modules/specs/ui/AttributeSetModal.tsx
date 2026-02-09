"use client";

import { useTransition, useState } from "react";
import type { AttributeSetListItemDto } from "../types";
import { upsertAttributeSetFormAction } from "../actions";

type Props = {
  open: boolean;
  onClose: () => void;
  setItem?: AttributeSetListItemDto & { rowVersion?: string | null };
};

export function AttributeSetModal({ open, onClose, setItem }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await upsertAttributeSetFormAction(formData);
        onClose();
      } catch (err: any) {
        setError(err.message ?? "خطا در ذخیره ست ویژگی");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          {setItem ? "ویرایش ست ویژگی" : "ست ویژگی جدید"}
        </h2>

        {error && <p className="mb-2 text-xs text-red-500">{error}</p>}

        <form action={handleSubmit} className="space-y-3">
          <input type="hidden" name="id" value={setItem?.id ?? ""} />
          <input
            type="hidden"
            name="rowVersion"
            value={setItem?.rowVersion ?? ""}
          />

          <div className="space-y-1">
            <label className="text-[11px] text-slate-600">نام ست</label>
            <input
              name="name"
              defaultValue={setItem?.name ?? ""}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-600">توضیحات</label>
            <textarea
              name="description"
              defaultValue={setItem?.description ?? ""}
              className="min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-60"
            >
              {pending ? "در حال ذخیره..." : "ذخیره"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
