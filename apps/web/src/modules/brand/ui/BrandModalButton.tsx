"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import MediaPickerDialog from "@/modules/media/ui/MediaPickerDialog";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import RichHtmlEditor from "@/components/admin/RichHtmlEditor";
import { Brand } from "../types";
import { useServerActionMutation } from "@/lib/react-query/use-server-action-mutation";
import { qk } from "@/lib/react-query/keys";
import { upsertBrandFormAction } from "../actions";

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9 4h2v12H9z" />
      <path d="M4 9h12v2H4z" />
    </svg>
  );
}

type Props = {
  brand?: Brand;
  asHeader?: boolean;
  triggerVariant?: "primary" | "link";
  label?: string;
  className?: string;
};

export default function BrandModalButton({
  brand,
  asHeader,
  triggerVariant = brand ? "link" : "primary",
  label,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const upsert = useServerActionMutation<FormData, void>({
    action: upsertBrandFormAction,
    invalidate: [["brands"] as const],
  });

  const [logoUrl, setLogoUrl] = useState<string>(brand?.logoUrl ?? "");
  const [mediaOpen, setMediaOpen] = useState(false);
  const [contentHtml, setContentHtml] = useState<string>(
    brand?.contentHtml ?? ""
  );

  const isEdit = !!brand;
  const titleText = isEdit ? "ویرایش برند" : "ایجاد برند جدید";
  const triggerText = label ?? (isEdit ? "ویرایش" : "افزودن برند");

  const wrapperClass = asHeader ? "mt-4 sm:mt-0 sm:flex-none" : "";

  const triggerClass =
    triggerVariant === "primary"
      ? `cursor-pointer inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${className ?? ""
      }`
      : `cursor-pointer inline-flex items-center gap-x-1.5 rounded-md bg-yellow-400 px-3 py-2 text-sm font-semibold text-dark shadow-xs hover:bg-yellow-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${className ?? ""
      }`;

  function closeModal() {
    setOpen(false);
    setMediaOpen(false);
    setLogoUrl("");
    setContentHtml("");
  }

  useEffect(() => {
    if (!open) return;

    setLogoUrl(String(brand?.logoUrl ?? "").trim());
    setContentHtml(String(brand?.contentHtml ?? "").trim());
  }, [open, brand?.id]);


  useEffect(() => {
    if (open) return;
    setMediaOpen(false);
    setLogoUrl("");
    setContentHtml("");
  }, [open]);

  return (
    <>
      {/* Trigger */}
      <div className={wrapperClass}>
        <button
          type="button"
          className={triggerClass}
          onClick={() => setOpen(true)}
        >
          {!isEdit && triggerVariant === "primary" && <PlusIcon />}
          {triggerText}
        </button>
      </div>

      {/* Modal */}
      <Dialog open={open} onClose={setOpen} className="relative z-50">
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
                  <svg
                    viewBox="0 0 24 24"
                    className="size-6 text-indigo-600"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M20.59 13.41 12 4.83c-.37-.37-.88-.58-1.41-.58H4a2 2 0 0 0-2 2v6.59c0 .53.21 1.04.59 1.41l8.59 8.59c.78.78 2.05.78 2.83 0l6.59-6.59c.78-.78.78-2.05 0-2.83ZM6.5 9A1.5 1.5 0 1 1 8 7.5 1.5 1.5 0 0 1 6.5 9Z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <DialogTitle
                    as="h3"
                    className="text-base font-semibold text-gray-900"
                  >
                    {titleText}
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {isEdit
                        ? "ویرایش اطلاعات برند و ذخیره تغییرات."
                        : "اطلاعات برند را تکمیل کنید. فیلدهای ستاره‌دار الزامی هستند."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form
                onSubmit={(e) =>
                  startTransition(async () => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    await upsert.mutateAsync(formData);
                    closeModal();
                  })
                }
                className="mt-6 space-y-5"
              >
                <input type="hidden" name="id" defaultValue={brand?.id ?? ""} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-right">
                    <span className="mb-1 block text-sm text-gray-700">
                      عنوان *
                    </span>
                    <input
                      name="title"
                      required
                      defaultValue={brand?.title ?? ""}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="مثال: سامسونگ"
                    />
                  </label>

                  <label className="block text-right">
                    <span className="mb-1 block text-sm text-gray-700">
                      نامک (slug) *
                    </span>
                    <input
                      name="slug"
                      required
                      dir="ltr"
                      defaultValue={brand?.slug ?? ""}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="samsung"
                    />
                  </label>

                  <label className="block text-right">
                    <span className="mb-1 block text-sm text-gray-700">
                      عنوان انگلیسی
                    </span>
                    <input
                      name="englishTitle"
                      defaultValue={brand?.englishTitle ?? ""}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Samsung"
                    />
                  </label>

                  <label className="block text-right">
                    <span className="mb-1 block text-sm text-gray-700">
                      وب‌سایت
                    </span>
                    <input
                      name="websiteUrl"
                      dir="ltr"
                      defaultValue={brand?.websiteUrl ?? ""}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://..."
                    />
                  </label>

                  <label className="block text-right sm:col-span-2">
                    <span className="mb-1 block text-sm text-gray-700">
                      لوگو
                    </span>

                    <div className="flex items-center gap-2">
                      <input
                        name="logoUrl"
                        dir="ltr"
                        readOnly
                        value={logoUrl}
                        hidden
                      />
                      <button
                        type="button"
                        onClick={() => setMediaOpen(true)}
                        className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                      >
                        انتخاب از کتابخانه
                      </button>
                    </div>

                    {(() => {
                      const resolved = resolveMediaUrl(logoUrl);
                      if (!resolved) return null;

                      return (
                        <div className="mt-2">
                          <img
                            src={resolved}
                            alt="لوگوی انتخاب شده"
                            className="h-32 w-auto object-contain text-center"
                          />
                        </div>
                      );
                    })()}
                  </label>
                  <div className="block text-right sm:col-span-2">
                    <label className="mb-1 block text-sm text-gray-700">
                      توضیحات HTML
                    </label>

                    <input
                      type="hidden"
                      name="contentHtml"
                      value={contentHtml}
                    />

                    <RichHtmlEditor
                      value={contentHtml}
                      onChange={setContentHtml}
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-col-reverse gap-3 sm:mt-6 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={pending}
                    className="inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60"
                  >
                    {pending
                      ? "در حال ذخیره..."
                      : isEdit
                        ? "ذخیره تغییرات"
                        : "ذخیره"}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
      <MediaPickerDialog
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(urls) => {
          const first = Array.isArray(urls) ? urls[0] : "";
          setLogoUrl((first ?? "").trim());
          setMediaOpen(false);
        }}
        hasInitialImage={!!logoUrl.trim()}
        multiple={false}
        initialSelectedUrls={logoUrl.trim() ? [logoUrl.trim()] : []}
      />
    </>
  );
}
