"use client";

import { useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SimpleHtmlEditor({ value, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    if (editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const syncValue = () => {
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);
  };

  const applyCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;

    editorRef.current.focus();
    document.execCommand(command, false, value);
    syncValue();
  };

  const handleCreateLink = () => {
    const url = window.prompt("آدرس لینک را وارد کنید:", "https://");
    if (!url) return;
    applyCommand("createLink", url);
  };

  const handleRemoveFormat = () => {
    applyCommand("removeFormat");
    applyCommand("unlink");
  };

  const handleInput = () => {
    syncValue();
  };

  return (
    <div className="border border-gray-300 rounded-md text-sm bg-white">
      <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700">
        <button
          type="button"
          onClick={() => applyCommand("bold")}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          <strong>بولد</strong>
        </button>
        <button
          type="button"
          onClick={() => applyCommand("italic")}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          <em>ایتالیک</em>
        </button>
        <button
          type="button"
          onClick={() => applyCommand("underline")}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          <span className="underline">زیرخط</span>
        </button>

        <span className="mx-1 h-4 w-px bg-gray-300 self-center" />

        <button
          type="button"
          onClick={() => applyCommand("insertUnorderedList")}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          لیست نقطه‌ای
        </button>
        <button
          type="button"
          onClick={() => applyCommand("insertOrderedList")}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          لیست شماره‌دار
        </button>

        <span className="mx-1 h-4 w-px bg-gray-300 self-center" />

        <button
          type="button"
          onClick={handleCreateLink}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          لینک
        </button>
        <button
          type="button"
          onClick={handleRemoveFormat}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          حذف فرمت
        </button>
      </div>

      {/* منطقه ویرایش */}
      <div
        ref={editorRef}
        contentEditable
        dir="ltr"
        className="min-h-[140px] px-3 py-2 focus:outline-none"
        onInput={handleInput}
      />
    </div>
  );
}
