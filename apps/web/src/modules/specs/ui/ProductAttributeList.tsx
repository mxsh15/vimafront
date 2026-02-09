"use client";

import { useState } from "react";
import type { PagedResult, ProductAttributeListItemDto } from "../types";
import { ProductAttributeModal } from "./ProductAttributeModal";

type Props = {
  groupId: string;
  data: PagedResult<ProductAttributeListItemDto>;
  q?: string;
};

export function ProductAttributeList({ groupId, data }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductAttributeListItemDto | null>(
    null
  );

  function handleNew() {
    setEditing(null);
    setOpen(true);
  }

  function handleEdit(attr: ProductAttributeListItemDto) {
    setEditing(attr);
    setOpen(true);
  }

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold text-slate-800">لیست ویژگی‌ها</h2>
        <button
          type="button"
          onClick={handleNew}
          className="rounded-xl bg-blue-600 px-3 py-1.5 text-[11px] font-medium text-white"
        >
          + ویژگی جدید
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-[11px] text-slate-700">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <th className="px-3 py-2">نام</th>
              <th className="px-3 py-2">Key</th>
              <th className="px-3 py-2">واحد</th>
              <th className="px-3 py-2">نوع</th>
              <th className="px-3 py-2">الزامی؟</th>
              <th className="px-3 py-2">سطح واریانت؟</th>
              <th className="px-3 py-2">فیلتر؟</th>
              <th className="px-3 py-2">ترتیب</th>
              <th className="px-3 py-2 text-right">اکشن‌ها</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-6 text-center text-[11px] text-slate-400"
                >
                  هنوز ویژگی‌ای برای این گروه ثبت نشده است.
                </td>
              </tr>
            )}

            {data.items.map((attr) => (
              <tr key={attr.id} className="border-b border-slate-50">
                <td className="px-3 py-2">{attr.name}</td>
                <td className="px-3 py-2 font-mono text-[10px]">{attr.key}</td>
                <td className="px-3 py-2">{attr.unit ?? "-"}</td>
                <td className="px-3 py-2">{attr.valueType}</td>
                <td className="px-3 py-2">{attr.isRequired ? "بله" : "خیر"}</td>
                <td className="px-3 py-2">
                  {attr.isVariantLevel ? "بله" : "خیر"}
                </td>
                <td className="px-3 py-2">
                  {attr.isFilterable ? "بله" : "خیر"}
                </td>
                <td className="px-3 py-2">{attr.sortOrder}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleEdit(attr)}
                    className="rounded-xl border border-slate-200 px-2 py-1 text-[11px] text-slate-600"
                  >
                    ویرایش
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProductAttributeModal
        groupId={groupId}
        open={open}
        onClose={() => setOpen(false)}
        attribute={editing ?? undefined}
      />
    </section>
  );
}
