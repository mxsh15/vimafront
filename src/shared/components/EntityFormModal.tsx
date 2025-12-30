"use client";

import { useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

type EntityFormModalProps = {
  open: boolean;
  onClose: () => void;
  isEdit: boolean;
  entityLabelFa: string; 
  titleNew?: string;
  titleEdit?: string;
  descriptionNew?: string;
  descriptionEdit?: string;
  onSubmit: (formData: FormData) => Promise<void>;
  children: (ctx: { pending: boolean }) => ReactNode;
  icon?: ReactNode;
};

export function EntityFormModal({
  open,
  onClose,
  isEdit,
  entityLabelFa,
  titleNew,
  titleEdit,
  descriptionNew,
  descriptionEdit,
  onSubmit,
  children,
  icon,
}: EntityFormModalProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const finalTitle = isEdit
    ? titleEdit ?? `ویرایش ${entityLabelFa}`
    : titleNew ?? `ایجاد ${entityLabelFa} جدید`;

  const finalDescription = isEdit
    ? descriptionEdit ?? `ویرایش اطلاعات ${entityLabelFa} و ذخیره تغییرات.`
    : descriptionNew ??
      `اطلاعات ${entityLabelFa} را تکمیل کنید. فیلدهای ستاره‌دار الزامی هستند.`;

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
                {icon ?? (
                  <svg
                    viewBox="0 0 24 24"
                    className="size-6 text-indigo-600"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M20.59 13.41 12 4.83c-.37-.37-.88-.58-1.41-.58H4a2 2 0 0 0-2 2v6.59c0 .53.21 1.04.59 1.41l8.59 8.59c.78.78 2.05.78 2.83 0l6.59-6.59c.78-.78.78-2.05 0-2.83ZM6.5 9A1.5 1.5 0 1 1 8 7.5 1.5 1.5 0 0 1 6.5 9Z" />
                  </svg>
                )}
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <DialogTitle
                  as="h3"
                  className="text-base font-semibold text-gray-900"
                >
                  {finalTitle}
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{finalDescription}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form
              action={(formData) =>
                startTransition(async () => {
                  await onSubmit(formData);
                  onClose();
                  router.refresh();
                })
              }
              className="mt-6 space-y-5"
            >
              {/* فیلدهای اختصاصی entity */}
              {children({ pending })}

              {/* Footer دکمه‌ها مشترک */}
              <div className="mt-5 flex flex-col-reverse gap-3 sm:mt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
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
  );
}
