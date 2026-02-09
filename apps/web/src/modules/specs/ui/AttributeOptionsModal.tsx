"use client";

import { useEffect, useState, useTransition } from "react";
import type { AttributeOptionDto } from "../types";
import { listAttributeOptions } from "../client-api";
import {
  loadAttributeOptionsAction,
  upsertAttributeOptionsFormAction,
} from "../actions";

type Props = {
  open: boolean;
  onClose: () => void;
  attributeId: string;
  attributeName: string;
};

type EditableOption = AttributeOptionDto & { tempId: string };

export function AttributeOptionsModal({
  open,
  onClose,
  attributeId,
  attributeName,
}: Props) {
  const [options, setOptions] = useState<AttributeOptionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open || !attributeId) return;

    setError(null);
    setLoading(true);

    loadAttributeOptionsAction(attributeId)
      .then((items) => {
        const normalized: EditableOption[] = items.map((o) => ({
          ...o,
          tempId: o.id || crypto.randomUUID(),
        }));
        setOptions(normalized);
      })
      .catch((err) => {
        console.error(err);
        setError("خطا در دریافت گزینه‌ها");
      })
      .finally(() => setLoading(false));
  }, [open, attributeId]);

  if (!open) return null;

  function addOption() {
    setOptions((prev) => [
      ...prev,
      {
        id: "",
        attributeId,
        value: "",
        displayLabel: "",
        sortOrder: prev.length,
        isDefault: false,
        tempId: crypto.randomUUID(),
      },
    ]);
  }

  function updateOption(tempId: string, patch: Partial<EditableOption>) {
    setOptions((prev) =>
      prev.map((o) => (o.tempId === tempId ? { ...o, ...patch } : o))
    );
  }

  function removeOption(tempId: string) {
    setOptions((prev) => prev.filter((o) => o.tempId !== tempId));
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const payload = options.map((o) => ({
          id: o.id || null,
          value: o.value,
          displayLabel: o.displayLabel,
          sortOrder: o.sortOrder,
          isDefault: o.isDefault,
        }));

        formData.set("attributeId", attributeId);
        formData.set("optionsJson", JSON.stringify(payload));

        await upsertAttributeOptionsFormAction(formData);
        onClose();
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "خطا در ذخیره گزینه‌ها");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-lg">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          گزینه‌های ویژگی: {attributeName}
        </h2>

        {loading && (
          <p className="mb-2 text-xs text-slate-500">در حال بارگذاری...</p>
        )}
        {error && <p className="mb-2 text-xs text-red-500">{error}</p>}

        <form action={handleSubmit} className="space-y-3">
          <input type="hidden" name="attributeId" value={attributeId} />
          <input type="hidden" name="optionsJson" />

          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {options.map((opt, index) => (
              <div
                key={opt.tempId}
                className="flex items-center gap-2 rounded-xl border border-slate-200 p-2"
              >
                <span className="w-6 text-[11px] text-slate-400">
                  {index + 1}
                </span>
                <input
                  className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-xs"
                  placeholder="مقدار (مثلاً قرمز)"
                  value={opt.value}
                  onChange={(e) =>
                    updateOption(opt.tempId, { value: e.target.value })
                  }
                />
                <input
                  className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-xs"
                  placeholder="برچسب نمایشی (اختیاری)"
                  value={opt.displayLabel ?? ""}
                  onChange={(e) =>
                    updateOption(opt.tempId, { displayLabel: e.target.value })
                  }
                />
                <input
                  type="number"
                  className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-xs"
                  value={opt.sortOrder}
                  onChange={(e) =>
                    updateOption(opt.tempId, {
                      sortOrder: Number(e.target.value || 0),
                    })
                  }
                />
                <label className="flex items-center gap-1 text-[10px] text-slate-500">
                  <input
                    type="checkbox"
                    checked={opt.isDefault}
                    onChange={(e) =>
                      updateOption(opt.tempId, { isDefault: e.target.checked })
                    }
                  />
                  پیش‌فرض
                </label>
                <button
                  type="button"
                  onClick={() => removeOption(opt.tempId)}
                  className="rounded-lg border border-red-200 px-2 py-1 text-[10px] text-red-500"
                >
                  حذف
                </button>
              </div>
            ))}

            {!loading && options.length === 0 && (
              <p className="text-center text-[11px] text-slate-400">
                هنوز گزینه‌ای تعریف نشده است.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={addOption}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
            >
              + گزینه جدید
            </button>

            <div className="flex items-center gap-2">
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
          </div>
        </form>
      </div>
    </div>
  );
}
