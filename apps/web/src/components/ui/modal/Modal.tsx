"use client";
import React from "react";

export default function Modal({
  open,
  title,
  onClose,
  children,
  maxWidth = "max-w-2xl",
}: {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999]">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`absolute left-1/2 top-10 -translate-x-1/2 rounded-xl border border-gray-200 bg-white shadow-xl ${maxWidth} w-[92%] dark:border-white/[0.06] dark:bg-white/[0.03]`}
      >
        <div className="flex items-center justify-between border-b px-5 py-3 dark:border-white/[0.06]">
          <h3 className="text-base font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
