"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { upsertCategoryFormAction } from "../actions";
import type { CategoryEditModalProps } from "../types";
import MediaPickerDialog from "@/modules/media/ui/MediaPickerDialog";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import RichHtmlEditor from "@/components/admin/RichHtmlEditor";

export function CategoryEditModal({
  open,
  onClose,
  category,
  parentOptions,
}: CategoryEditModalProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const isEdit = !!category?.id;
  const titleText = isEdit ? "ویرایش دسته‌بندی" : "ایجاد دسته‌بندی جدید";

  const [iconUrl, setIconUrl] = useState<string>(category?.iconUrl ?? "");
  const [mediaOpen, setMediaOpen] = useState(false);
  const [contentHtml, setContentHtml] = useState<string>(
    category?.contentHtml ?? ""
  );

  useEffect(() => {
    setIconUrl(category?.iconUrl ?? "");
  }, [category?.iconUrl]);

  useEffect(() => {
    setContentHtml(category?.contentHtml ?? "");
  }, [category?.contentHtml]);

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />
      <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-6 pt-6 pb-5 text-left shadow-xl transition-all
              data-closed:translate-y-4 data-closed:opacity-0
              data-enter:duration-300 data-enter:ease-out
              data-leave:duration-200 data-leave:ease-in
              sm:my-10 sm:w-full sm:max-w-4xl sm:p-8
              data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            {/* Header */}
            <div>
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-indigo-100">
                <span className="text-indigo-600 text-lg">#</span>
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <DialogTitle
                  as="h3"
                  className="text-base font-semibold text-gray-900"
                >
                  {titleText}
                </DialogTitle>
                <p className="mt-2 text-sm text-gray-500">
                  عنوان، نامک، والد، آیکون و اطلاعات سئوی دسته‌بندی را تنظیم
                  کنید.
                </p>
              </div>
            </div>

            {/* Form */}
            <form
              action={(formData) =>
                startTransition(async () => {
                  await upsertCategoryFormAction(formData);
                  onClose();
                  router.refresh();
                })
              }
              className="mt-6 space-y-5"
            >
              <input
                type="hidden"
                name="id"
                defaultValue={category?.id ?? ""}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                {/* عنوان */}
                <label className="block text-right">
                  <span className="mb-1 block text-sm text-gray-700">
                    عنوان *
                  </span>
                  <input
                    name="title"
                    required
                    defaultValue={category?.title ?? ""}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="مثال: موبایل"
                  />
                </label>

                {/* نامک */}
                <label className="block text-right">
                  <span className="mb-1 block text-sm text-gray-700">
                    نامک (slug) *
                  </span>
                  <input
                    name="slug"
                    required
                    dir="ltr"
                    defaultValue={category?.slug ?? ""}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="mobile"
                  />
                </label>

                {/* والد به صورت کشویی */}
                <label className="block text-right">
                  <span className="mb-1 block text-sm text-gray-700">
                    شناسه والد (اختیاری)
                  </span>
                  <select
                    name="parentId"
                    defaultValue={category?.parentId ?? ""}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">بدون والد</option>
                    {parentOptions
                      .filter((p) => p.id !== category?.id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                  </select>
                </label>

                {/* SortOrder */}
                <label className="block text-right">
                  <span className="mb-1 block text-sm text-gray-700">
                    ترتیب نمایش
                  </span>
                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue={category?.sortOrder ?? 0}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>

                {/* آیکون / IconUrl */}
                <label className="block text-right sm:col-span-2">
                  <span className="mb-1 block text-sm text-gray-700">
                    آیکون (IconUrl)
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="hidden"
                      name="iconUrl"
                      value={iconUrl}
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={() => setMediaOpen(true)}
                      className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      انتخاب از کتابخانه
                    </button>
                    {iconUrl && (
                      <span className="text-[11px] text-slate-500" dir="ltr">
                        {iconUrl}
                      </span>
                    )}
                  </div>

                  {iconUrl && (
                    <div className="mt-2">
                      <img
                        src={resolveMediaUrl(iconUrl)}
                        alt="آیکون انتخاب شده"
                        className="h-12 w-auto object-contain"
                      />
                    </div>
                  )}
                </label>
              </div>

              {/* محتوا (ContentHtml) */}
              <div>
                <label className="mb-1 block text-sm text-gray-700">
                  توضیحات HTML
                </label>

                <input type="hidden" name="contentHtml" value={contentHtml} />

                <RichHtmlEditor value={contentHtml} onChange={setContentHtml} />
              </div>

              {/* فیلدهای سئو */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-right">
                  <span className="mb-1 block text-sm text-gray-700">
                    عنوان سئو (MetaTitle)
                  </span>
                  <input
                    name="seoTitle"
                    defaultValue={category?.seoTitle ?? ""}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="عنوان متای دسته"
                  />
                </label>

                <label className="block text-right">
                  <span className="mb-1 block text-sm text-gray-700">
                    کلمات کلیدی (Seo.Keywords)
                  </span>
                  <input
                    name="seoKeywords"
                    defaultValue={category?.seoKeywords ?? ""}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="مثال: موبایل, گوشی هوشمند"
                  />
                </label>

                <label className="block text-right sm:col-span-2">
                  <span className="mb-1 block text-sm text-gray-700">
                    توضیحات سئو (MetaDescription)
                  </span>
                  <textarea
                    name="seoDescription"
                    rows={3}
                    defaultValue={category?.seoDescription ?? ""}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="توضیح متای دسته برای نمایش در نتایج جستجو"
                  />
                </label>
              </div>

              {/* وضعیت */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={category?.isActive ?? true}
                    value="true"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>فعال باشد</span>
                </label>
              </div>

              {/* دکمه‌ها */}
              <div className="mt-5 flex flex-col-reverse gap-3 sm:mt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={pending}
                  className="inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-60"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-60"
                >
                  {pending
                    ? "در حال ذخیره..."
                    : isEdit
                    ? "ذخیره تغییرات"
                    : "ایجاد دسته‌بندی"}
                </button>
              </div>
            </form>

            <MediaPickerDialog
              open={mediaOpen}
              onClose={() => setMediaOpen(false)}
              onSelect={(url) => {
                setIconUrl(url);
                setMediaOpen(false);
              }}
              hasInitialImage={!!iconUrl}
            />
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
