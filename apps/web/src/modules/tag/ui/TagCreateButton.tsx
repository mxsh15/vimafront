"use client";
import { useState } from "react";
import { TagModal } from "./TagModal";

export function TagCreateButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs"
      >
        + برچسب جدید
      </button>

      <TagModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
