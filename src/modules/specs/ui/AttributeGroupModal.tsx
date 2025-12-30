"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import type {
  AttributeSetOptionDto,
  ProductAttributeOptionDto,
  AttributeGroupWithAttrsDto,
} from "../types";
import { upsertAttributeGroupFormAction } from "../actions";

type Props = {
  open: boolean;
  onClose: () => void;
  attributeSetOptions: AttributeSetOptionDto[];
  attributeOptions: ProductAttributeOptionDto[];
  group?: AttributeGroupWithAttrsDto;
};

export function AttributeGroupModal({
  open,
  onClose,
  attributeSetOptions,
  attributeOptions,
  group,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>(
    group?.attributeIds ?? []
  );
  const [attributeToAdd, setAttributeToAdd] = useState("");

  const availableAttributes = useMemo(
    () => attributeOptions.filter((a) => !selectedAttributeIds.includes(a.id)),
    [attributeOptions, selectedAttributeIds]
  );

  useEffect(() => {
    setSelectedAttributeIds(group?.attributeIds ?? []);
  }, [group?.id]);

  if (!open) return null;

  function handleAddAttribute() {
    if (!attributeToAdd) return;
    setSelectedAttributeIds((prev) =>
      prev.includes(attributeToAdd) ? prev : [...prev, attributeToAdd]
    );
    setAttributeToAdd("");
  }

  function handleRemoveAttribute(id: string) {
    setSelectedAttributeIds((prev) => prev.filter((x) => x !== id));
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await upsertAttributeGroupFormAction(formData);
        onClose();
      } catch (err: any) {
        setError(err.message ?? "خطا در ذخیره گروه ویژگی");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-4 shadow-lg">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          {group ? "ویرایش گروه ویژگی" : "گروه ویژگی جدید"}
        </h2>

        {error && <p className="mb-2 text-xs text-red-500">{error}</p>}

        <form action={handleSubmit} className="space-y-3">
          <input type="hidden" name="id" value={group?.id ?? ""} />
          <input
            type="hidden"
            name="rowVersion"
            value={group?.rowVersion ?? ""}
          />

          {/* نام گروه */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-600">نام گروه</label>
            <input
              name="name"
              defaultValue={group?.name ?? ""}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ست ویژگی */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-600">ست ویژگی</label>
            <select
              name="attributeSetId"
              defaultValue={group?.attributeSetId ?? ""}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">یک ست را انتخاب کنید...</option>
              {attributeSetOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* ترتیب */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-600">ترتیب نمایش</label>
            <input
              type="number"
              name="sortOrder"
              defaultValue={group?.sortOrder ?? 0}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* --- باکس ویژگی‌ها؛ مثل ووکامرس --- */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
              <span className="text-xs font-medium text-slate-700">
                ویژگی‌ها
              </span>

              <div className="flex items-center gap-2">
                <select
                  value={attributeToAdd}
                  onChange={(e) => setAttributeToAdd(e.target.value)}
                  className="w-52 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none"
                >
                  <option value="">انتخاب ویژگی...</option>
                  {availableAttributes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.key})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddAttribute}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-medium text-white disabled:opacity-60"
                  disabled={!attributeToAdd}
                >
                  افزودن
                </button>
              </div>
            </div>

            <div className="max-h-64 space-y-2 overflow-y-auto p-3">
              {selectedAttributeIds.length === 0 ? (
                <p className="text-[11px] text-slate-400">
                  هنوز هیچ ویژگی به این گروه اضافه نشده است.
                </p>
              ) : (
                selectedAttributeIds.map((id) => {
                  const attr = attributeOptions.find((a) => a.id === id);
                  if (!attr) return null;

                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs shadow-sm"
                    >
                      <div>
                        <div className="font-medium text-slate-800">
                          {attr.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          نامک: {attr.key}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAttribute(id)}
                        className="text-[11px] text-red-500"
                      >
                        پاک کردن
                      </button>

                      <input type="hidden" name="attributeIds" value={id} />
                    </div>
                  );
                })
              )}
            </div>
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
