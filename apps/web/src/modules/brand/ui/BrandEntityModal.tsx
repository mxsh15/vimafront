"use client";

import { useState } from "react";
import { EntityFormModal } from "@/shared/components/EntityFormModal";
import MediaPickerDialog from "@/modules/media/ui/MediaPickerDialog";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import RichHtmlEditor from "@/components/admin/RichHtmlEditor";
import { upsertBrandFormAction } from "../actions";
import type { Brand } from "../types";

type BrandEntityModalProps = {
  open: boolean;
  onClose: () => void;
  brand?: Brand; 
};

export function BrandEntityModal({
  open,
  onClose,
  brand,
}: BrandEntityModalProps) {
  const isEdit = !!brand;

  const [logoUrl, setLogoUrl] = useState<string>(brand?.logoUrl ?? "");
  const [mediaOpen, setMediaOpen] = useState(false);
  const [contentHtml, setContentHtml] = useState<string>(
    brand?.contentHtml ?? ""
  );

  return (
    <>
      <EntityFormModal
        open={open}
        onClose={onClose}
        isEdit={isEdit}
        entityLabelFa="برند"
        onSubmit={async (formData) => {
          formData.set("logoUrl", logoUrl ?? "");
          formData.set("contentHtml", contentHtml ?? "");
          await upsertBrandFormAction(formData);
        }}
      >
        {() => (
          <>
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
                <span className="mb-1 block text-sm text-gray-700">لوگو</span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMediaOpen(true)}
                    className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    انتخاب از کتابخانه
                  </button>
                </div>

                {logoUrl && (
                  <div className="mt-2">
                    <img
                      src={resolveMediaUrl(logoUrl)}
                      alt="لوگوی انتخاب شده"
                      className="h-32 w-auto object-contain text-center"
                    />
                  </div>
                )}
              </label>

              <div className="block text-right sm:col-span-2">
                <label className="mb-1 block text-sm text-gray-700">
                  توضیحات HTML
                </label>
                <RichHtmlEditor value={contentHtml} onChange={setContentHtml} />
              </div>
            </div>
          </>
        )}
      </EntityFormModal>


      <MediaPickerDialog
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(url) => {
          setLogoUrl(url);
          setMediaOpen(false);
        }}
        hasInitialImage={!!logoUrl}
      />
    </>
  );
}
