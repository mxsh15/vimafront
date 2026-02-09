"use client";

import { useState, useEffect } from "react";
import { EntityFormModal } from "@/shared/components/EntityFormModal";
import { upsertPermissionFormAction } from "../actions";
import type { PermissionDto } from "../types";
import { clientFetch } from "@/lib/fetch-client";

type PermissionEntityModalProps = {
  open: boolean;
  onClose: () => void;
  permission?: PermissionDto;
};

export function PermissionEntityModal({
  open,
  onClose,
  permission,
}: PermissionEntityModalProps) {
  const isEdit = !!permission;
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      clientFetch<string[]>("permissions/categories")
        .then(setCategories)
        .catch(console.error);
    }
  }, [open]);

  return (
    <EntityFormModal
      open={open}
      onClose={onClose}
      isEdit={isEdit}
      entityLabelFa="دسترسی"
      onSubmit={async (formData) => {
        await upsertPermissionFormAction(formData);
      }}
    >
      {() => (
        <>
          <input type="hidden" name="id" defaultValue={permission?.id ?? ""} />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-right">
              <span className="mb-1 block text-sm text-gray-700">
                نام دسترسی (کد) *
              </span>
              <input
                name="name"
                required
                dir="ltr"
                defaultValue={permission?.name ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="products.view"
              />
            </label>

            <label className="block text-right">
              <span className="mb-1 block text-sm text-gray-700">
                نام نمایشی
              </span>
              <input
                name="displayName"
                defaultValue={permission?.displayName ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="مشاهده محصولات"
              />
            </label>

            <label className="block text-right sm:col-span-2">
              <span className="mb-1 block text-sm text-gray-700">
                دسته‌بندی
              </span>
              <input
                name="category"
                list="categories"
                defaultValue={permission?.category ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="مثال: products"
              />
              <datalist id="categories">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </label>

            <label className="block text-right sm:col-span-2">
              <span className="mb-1 block text-sm text-gray-700">
                توضیحات
              </span>
              <textarea
                name="description"
                rows={2}
                defaultValue={permission?.description ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="توضیحات دسترسی..."
              />
            </label>

            {isEdit && (
              <label className="block text-right sm:col-span-2">
                <span className="mb-1 block text-sm text-gray-700">
                  وضعیت
                </span>
                <select
                  name="status"
                  defaultValue={permission?.status ? "true" : "false"}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="true">فعال</option>
                  <option value="false">غیرفعال</option>
                </select>
              </label>
            )}
          </div>
        </>
      )}
    </EntityFormModal>
  );
}

