"use client";

import { useEffect, useState, useTransition } from "react";
import type { ProductAttributeListItemDto } from "../types";
import { upsertProductAttributeFormAction } from "../actions";
import { getProductAttribute } from "../client-api";

type Props = {
  open: boolean;
  onClose: () => void;
  attribute?: ProductAttributeListItemDto;
  groupId?: string;
};

export function ProductAttributeModal({
  open,
  onClose,
  attribute,
  groupId,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [initial, setInitial] = useState<ProductAttributeListItemDto | null>(
    attribute ?? null
  );

  useEffect(() => {
    if (!open) return;
    setError(null);

    if (attribute && !initial) {
      getProductAttribute(attribute.id)
        .then((data) => setInitial(data))
        .catch(() => setInitial(attribute));
    } else if (attribute) {
      setInitial(attribute);
    } else {
      setInitial(null);
    }
  }, [open, attribute]);

  if (!open) return null;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await upsertProductAttributeFormAction(formData);
        onClose();
      } catch (e: any) {
        console.error(e);
        setError(e.message ?? "خطا در ذخیره ویژگی");
      }
    });
  }

  const isEdit = !!initial;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          {isEdit ? "ویرایش ویژگی" : "افزودن ویژگی جدید"}
        </h2>

        {error && <p className="mb-2 text-[11px] text-red-500">{error}</p>}

        <form action={handleSubmit} className="space-y-3">
          <input type="hidden" name="id" value={initial?.id ?? ""} />
          <input
            type="hidden"
            name="attributeGroupId"
            value={initial?.attributeGroupId ?? groupId ?? ""}
          />

          {/* نام */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-700">نام</label>
            <input
              name="name"
              defaultValue={initial?.name ?? ""}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="مثلاً شرایط خرید.موجودی"
            />
            <p className="text-[10px] text-slate-400">
              این همان نامی است که در فروشگاه نمایش داده می‌شود.
            </p>
          </div>

          {/* نامک / Slug */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-700">نامک</label>
            <input
              name="key"
              defaultValue={initial?.key ?? ""}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="availability"
            />
            <p className="text-[10px] text-slate-400">
              نسخه انگلیسی کوتاه برای استفاده در URL و فیلترها.
            </p>
          </div>

          {/* واحد (اختیاری) – مثل برچسب سفارشی / واحد اندازه */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-700">
              برچسب واحد (اختیاری)
            </label>
            <input
              name="unit"
              defaultValue={initial?.unit ?? ""}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="مثلاً % یا kg یا cm"
            />
            <p className="text-[10px] text-slate-400">
              در صورت نیاز واحدی مثل % یا کیلوگرم برای این ویژگی مشخص کنید.
            </p>
          </div>

          {/* نوع مقدار – مثل نوع نمایش در ووکامرس */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-700">نوع مقدار</label>
            <select
              name="valueType"
              defaultValue={initial?.valueType?.toString() ?? "4"}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">متنی ساده</option>
              <option value="2">عددی</option>
              <option value="3">بولی (بله/خیر)</option>
              <option value="4">تاریخ</option>
              <option value="5">لیست گزینه‌ای (Select)</option>
              <option value="6">چندگزینه‌ای (Multi Select)</option>
            </select>
            <p className="text-[10px] text-slate-400">
              برای ویژگی‌های مثل رنگ، برند و ... نوع «لیست گزینه‌ای» را انتخاب
              کنید.
            </p>
          </div>

          {/* فلگ‌ها – معادل تیک‌ها در ووکامرس */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
            <label className="inline-flex items-center gap-1">
              <input
                type="checkbox"
                name="isFilterable"
                defaultChecked={initial?.isFilterable ?? false}
              />
              استفاده در فیلترهای فروشگاه
            </label>
            <label className="inline-flex items-center gap-1">
              <input
                type="checkbox"
                name="isComparable"
                defaultChecked={initial?.isComparable ?? false}
              />
              نمایش در مقایسه محصولات
            </label>
            <label className="inline-flex items-center gap-1">
              <input
                type="checkbox"
                name="isVariantLevel"
                defaultChecked={initial?.isVariantLevel ?? false}
              />
              مقدار در سطح متغیر (مثل رنگ/سایز)
            </label>
            <label className="inline-flex items-center gap-1">
              <input
                type="checkbox"
                name="isRequired"
                defaultChecked={initial?.isRequired ?? false}
              />
              مقدار این ویژگی اجباری است
            </label>
          </div>

          {/* ترتیب نمایش – مثل مرتب‌سازی دلخواه */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-700">ترتیب دلخواه</label>
            <input
              type="number"
              name="sortOrder"
              defaultValue={initial?.sortOrder ?? 0}
              className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[10px] text-slate-400">
              ترتیب نمایش این ویژگی در لیست ویژگی‌ها.
            </p>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-60"
            >
              {pending
                ? "در حال ذخیره..."
                : isEdit
                ? "ذخیره تغییرات"
                : "افزودن ویژگی"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
