"use client";

import { useState } from "react";
import { VendorEntityModal } from "./VendorEntityModal";
import type { VendorDto } from "../types";

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
  vendor?: VendorDto;
  asHeader?: boolean;
  triggerVariant?: "primary" | "link";
  label?: string;
  className?: string;
};

export default function VendorModalButton({
  vendor,
  asHeader,
  triggerVariant = vendor ? "link" : "primary",
  label,
  className,
}: Props) {
  const [open, setOpen] = useState(false);

  const isEdit = !!vendor;
  const titleText = isEdit ? "ویرایش فروشنده" : "ایجاد فروشنده جدید";
  const triggerText = label ?? (isEdit ? "ویرایش" : "افزودن فروشنده");

  const wrapperClass = asHeader ? "mt-4 sm:mt-0 sm:flex-none" : "";

  const triggerClass =
    triggerVariant === "primary"
      ? `cursor-pointer inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
          className ?? ""
        }`
      : `cursor-pointer inline-flex items-center gap-x-1.5 rounded-md bg-yellow-400 px-3 py-2 text-sm font-semibold text-dark shadow-xs hover:bg-yellow-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
          className ?? ""
        }`;

  return (
    <>
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

      <VendorEntityModal
        open={open}
        onClose={() => setOpen(false)}
        vendor={vendor}
      />
    </>
  );
}

