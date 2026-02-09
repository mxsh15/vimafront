"use client";

import { useEffect, useRef, useState } from "react";
import MediaPickerDialog from "@/modules/media/ui/MediaPickerDialog";
import { resolveMediaUrl } from "@/modules/media/resolve-url";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

type Mode = "visual" | "code";


function cleanHtml(raw: string): string {
  if (typeof window === "undefined") return raw;

  const container = document.createElement("div");
  container.innerHTML = raw;

  const allowedTags = new Set([
    "P", "BR", "STRONG", "B", "EM", "I", "U",
    "UL", "OL", "LI",
    "BLOCKQUOTE",
    "A",
    "IMG",
  ]);

  const allowedAttrs: Record<string, string[]> = {
    A: ["href", "title", "target", "rel"],
    IMG: ["src", "alt"],
  };

  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_ELEMENT,
    null
  );

  const toRemove: Element[] = [];

  while (walker.nextNode()) {
    const el = walker.currentNode as HTMLElement;

    // تگ‌های غیرمجاز را unwrap کن (محتوا را بالا ببر)
    if (!allowedTags.has(el.tagName)) {
      while (el.firstChild) {
        el.parentNode?.insertBefore(el.firstChild, el);
      }
      toRemove.push(el);
      continue;
    }

    // استایل‌ها و attribute های اضافی را حذف کن
    for (const attr of Array.from(el.attributes)) {
      if (attr.name === "style") {
        el.removeAttribute("style");
        continue;
      }

      const allowed = allowedAttrs[el.tagName] ?? [];
      if (!allowed.includes(attr.name)) {
        el.removeAttribute(attr.name);
      }
    }

    // جلوگیری از javascript: در لینک‌ها
    if (el.tagName === "A") {
      const href = el.getAttribute("href") || "";
      if (href.trim().toLowerCase().startsWith("javascript:")) {
        el.removeAttribute("href");
      }
    }
  }

  toRemove.forEach((el) => el.remove());
  return container.innerHTML;
}


export default function RichHtmlEditor({ value, onChange }: Props) {
  const [mode, setMode] = useState<Mode>("visual");
  const [codeValue, setCodeValue] = useState<string>(value || "");
  const editorRef = useRef<HTMLDivElement | null>(null);
  const codeRef = useRef<HTMLTextAreaElement | null>(null);
  const selectionRef = useRef<Range | null>(null);

  const [mediaOpen, setMediaOpen] = useState(false);

  // همگام‌سازی مقدار خارجی
  useEffect(() => {
    if (mode === "visual" && editorRef.current) {
      if (editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
    if (mode === "code") {
      if (codeValue !== (value || "")) {
        setCodeValue(value || "");
      }
    }
    try {
      document.execCommand("defaultParagraphSeparator", false, "p");
    } catch { }
  }, [value, mode]);

  const syncFromDom = () => {
    if (!editorRef.current) return;
    const raw = editorRef.current.innerHTML;
    const cleaned = cleanHtml(raw);
    if (raw !== cleaned) {
      editorRef.current.innerHTML = cleaned;
    }
    onChange(cleaned);
  };


  const handleInput = () => {
    syncFromDom();
  };

  const saveSelection = () => {
    if (typeof window === "undefined") return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      selectionRef.current = sel.getRangeAt(0);
    }
  };

  const applyCommand = (command: string, value?: string) => {
    if (typeof document === "undefined") return;
    if (!editorRef.current) return;

    editorRef.current.focus();
    document.execCommand(command, false, value);
    syncFromDom();
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

  const handleToggleMode = (next: Mode) => {
    if (next === mode) return;

    if (next === "code") {
      // قبل از رفتن به حالت کد، HTML فعلی را سینک کن
      syncFromDom();
      setCodeValue(editorRef.current?.innerHTML ?? value ?? "");
    } else {
      // برگشت به حالت دیداری: مقدار textarea را به عنوان HTML بگیر
      onChange(codeValue);
    }

    setMode(next);
  };

  const insertImageInVisual = (url: string) => {
    if (typeof window === "undefined") return;
    if (!editorRef.current) return;

    editorRef.current.focus();

    let range = selectionRef.current;
    const sel = window.getSelection();

    if (!range) {
      // اگر انتخابی نداریم، آخر محتوا را انتخاب کن
      range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
    }

    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);

    const img = document.createElement("img");
    img.src = url;
    img.alt = "";
    img.style.maxWidth = "100%";

    range.insertNode(img);

    // انتقال caret بعد از تصویر
    range.setStartAfter(img);
    range.setEndAfter(img);
    sel.removeAllRanges();
    sel.addRange(range);

    syncFromDom();
  };

  const insertImageInCode = (url: string) => {
    if (!codeRef.current) return;
    const textarea = codeRef.current;
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;

    const imgHtml = `<img src="${url}" alt="" />`;
    const next =
      textarea.value.slice(0, start) + imgHtml + textarea.value.slice(end);

    textarea.value = next;
    setCodeValue(next);
    onChange(next);

    const pos = start + imgHtml.length;
    textarea.setSelectionRange(pos, pos);
    textarea.focus();
  };

  const wordCount = (() => {
    const text =
      mode === "code"
        ? codeValue
        : (editorRef.current?.innerText || "").replace(/\s+/g, " ").trim();

    if (!text) return 0;
    return text.split(" ").length;
  })();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.execCommand("insertParagraph");
      syncFromDom();
    }
  };

  return (
    <>
      <div className="border border-gray-300 rounded-md bg-white text-sm text-right">
        {/* Tabs + دکمه افزودن پرونده چندرسانه‌ای */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50">
          <div className="flex">
            <button
              type="button"
              onClick={() => handleToggleMode("visual")}
              className={`px-3 py-2 text-xs border-l border-gray-200 ${mode === "visual"
                ? "bg-white font-semibold text-gray-900"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              دیداری
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode("code")}
              className={`px-3 py-2 text-xs ${mode === "code"
                ? "bg-white font-semibold text-gray-900"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              Code
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMediaOpen(true)}
            className="m-1 inline-flex items-center gap-1 rounded bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            افزودن پرونده چندرسانه‌ای
          </button>
        </div>

        {/* Toolbar فقط در حالت دیداری */}
        {mode === "visual" && (
          <div className="flex flex-wrap gap-1 border-b border-gray-200 px-2 py-1 text-xs text-gray-700">
            <button
              type="button"
              onClick={() => applyCommand("bold")}
              className="px-2 py-1 rounded hover:bg-gray-200"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={() => applyCommand("italic")}
              className="px-2 py-1 rounded hover:bg-gray-200"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onClick={() => applyCommand("underline")}
              className="px-2 py-1 rounded hover:bg-gray-200"
            >
              <span className="underline">U</span>
            </button>

            <span className="mx-1 h-4 w-px bg-gray-300 self-center" />

            <button
              type="button"
              onClick={() => applyCommand("insertUnorderedList")}
              className="px-2 py-1 rounded hover:bg-gray-200"
            >
              • لیست
            </button>
            <button
              type="button"
              onClick={() => applyCommand("insertOrderedList")}
              className="px-2 py-1 rounded hover:bg-gray-200"
            >
              1. لیست
            </button>

            <span className="mx-1 h-4 w-px bg-gray-300 self-center" />

            <button
              type="button"
              onClick={() => applyCommand("justifyRight")}
              className="px-2 py-1 rounded hover:bg-gray-200"
            >
              راست
            </button>
            <button
              type="button"
              onClick={() => applyCommand("justifyCenter")}
              className="px-2 py-1 rounded hover:bg-gray-200"
            >
              وسط
            </button>
            <button
              type="button"
              onClick={() => applyCommand("justifyLeft")}
              className="px-2 py-1 rounded hover:bg-gray-200"
            >
              چپ
            </button>

            <span className="mx-1 h-4 w-px bg-gray-300 self-center" />

            <button
              type="button"
              onClick={() => applyCommand("formatBlock", "blockquote")}
              className="px-2 py-1 rounded hover:bg-gray-200"
            >
              نقل‌قول
            </button>
            <button
              type="button"
              onClick={handleCreateLink}
              className="px-2 py-1 rounded hover:bg-gray-200"
            >
              لینک
            </button>

            <span className="mx-1 h-4 w-px bg-gray-300 self-center" />

            <button
              type="button"
              onClick={() => applyCommand("undo")}
              className="px-2 py-1 rounded hover:bg-gray-200"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={() => applyCommand("redo")}
              className="px-2 py-1 rounded hover:bg-gray-200"
            >
              Redo
            </button>
            <button
              type="button"
              onClick={handleRemoveFormat}
              className="px-2 py-1 rounded hover:bg-gray-200"
            >
              حذف استایل
            </button>
          </div>
        )}

        {/* بدنه ادیتور */}
        {mode === "visual" ? (
          <div
            ref={editorRef}
            contentEditable
            dir="rtl"
            className="min-h-[220px] px-3 py-2 leading-relaxed focus:outline-none text-right [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-700"
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
          />
        ) : (
          <textarea
            ref={codeRef}
            dir="ltr"
            className="w-full min-h-[220px] border-0 px-3 py-2 font-mono text-xs leading-relaxed focus:outline-none"
            value={codeValue}
            onChange={(e) => {
              setCodeValue(e.target.value);
              onChange(e.target.value);
            }}
          />
        )}
        <div className="border-t border-gray-200 px-3 py-1 text-right text-[11px] text-gray-500">
          تعداد واژه‌ها: {wordCount}
        </div>
      </div>

      <MediaPickerDialog
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        hasInitialImage={true}
        confirmLabel="قرار دادن در نوشته"
        onSelect={(urls) => {
          const rawUrl = urls[0];
          if (!rawUrl) return;

          const url = resolveMediaUrl(rawUrl);

          if (mode === "visual") {
            insertImageInVisual(url);
          } else {
            insertImageInCode(url);
          }

          setMediaOpen(false);
        }}
      />
    </>
  );
}
