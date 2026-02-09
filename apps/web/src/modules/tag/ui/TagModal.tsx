"use client";

import { useState, useTransition } from "react";
import { upsertTagFormAction } from "../actions";
import type { TagDto } from "../types";

export function TagModal({
  open,
  onClose,
  tag,
}: {
  open: boolean;
  onClose: () => void;
  tag?: TagDto;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await upsertTagFormAction(formData);
        onClose();
      } catch (e: any) {
        setError(e.message);
      }
    });
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white w-full max-w-md rounded-xl p-4 shadow-lg">
        <h2 className="text-sm font-semibold mb-3">
          {tag ? "ویرایش برچسب" : "برچسب جدید"}
        </h2>

        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

        <form action={handleSubmit} className="space-y-3">
          <input type="hidden" name="id" value={tag?.id ?? ""} />
          <input
            type="hidden"
            name="rowVersion"
            value={tag?.rowVersion ?? ""}
          />

          <div className="space-y-1">
            <label className="text-[11px] text-slate-600">نام</label>
            <input
              name="name"
              defaultValue={tag?.name ?? ""}
              className="w-full border rounded-lg px-3 py-2 text-xs"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-600">نامک (Slug)</label>
            <input
              name="slug"
              defaultValue={tag?.slug ?? ""}
              className="w-full border rounded-lg px-3 py-2 text-xs font-mono"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border px-3 py-1.5 rounded-lg text-xs text-slate-600"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={pending}
              className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs"
            >
              {pending ? "درحال ذخیره..." : "ذخیره"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
