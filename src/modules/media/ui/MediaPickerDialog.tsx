"use client";

import {
  Button,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useEffect, useMemo, useState, ChangeEvent, DragEvent } from "react";
import { X, Check } from "lucide-react";
import {
  deleteMediaFromClient,
  listMediaFromClient,
  updateMediaFromClient
} from "../actions";
import type { MediaAssetDto } from "../types";
import { resolveMediaUrl } from "../resolve-url";
import DeleteMediaButton from "./DeleteMediaButton";
import { uploadMediaWithProgress } from "../client-upload";
import { resolveMediaIdByUrl } from "@/modules/blog/api.client";
import { getMediaByIdFromClient } from "@/modules/media/actions";


function formatBytes(bytes?: number | null) {
  if (bytes == null || Number.isNaN(bytes)) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let n = bytes;
  let u = 0;
  while (n >= 1024 && u < units.length - 1) {
    n /= 1024;
    u++;
  }
  const fixed = u === 0 ? 0 : n < 10 ? 2 : n < 100 ? 1 : 0;
  return `${n.toFixed(fixed)} ${units[u]}`;
}



type MediaPickerDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  hasInitialImage?: boolean;
  confirmLabel?: string;
  multiple?: boolean;
  initialSelectedUrls?: string[];
  usage?: string;
};

const PAGE_SIZE = 8;

export default function MediaPickerDialog({
  open,
  onClose,
  onSelect,
  hasInitialImage = false,
  confirmLabel,
  multiple = false,
  initialSelectedUrls = [],
  usage
}: MediaPickerDialogProps) {
  const [items, setItems] = useState<MediaAssetDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 الان چندتا ID می‌تونیم داشته باشیم (برای multiple)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [altInput, setAltInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // تب فعال: بارگذاری | کتابخانه
  const [activeTab, setActiveTab] = useState<"upload" | "library">("upload");

  // وضعیت آپلود
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // درصد فایل آپلود شده
  const [uploadProgress, setUploadProgress] = useState(0);

  // اولین آیتم انتخاب شده برای نمایش در پنل چپ
  const selected = useMemo(
    () =>
      selectedIds.length === 0
        ? null
        : items.find((m) => m.id === selectedIds[0]) || null,
    [items, selectedIds]
  );

  const confirmText =
    confirmLabel ??
    (multiple ? "افزودن تصاویر به گالری" : "قرار دادن به عنوان تصویر شاخص");

  // ریست وقتی مدال باز می‌شود
  useEffect(() => {
    if (open) {
      setPage(1);
      setSelectedIds([]);
      setAltInput("");
      setTitleInput("");
      setError(null);
      setUploadError(null);
      setActiveTab(hasInitialImage ? "library" : "upload");
      setUploadProgress(0);
    }
  }, [open, hasInitialImage, multiple]);

  // لود لیست مدیا
  useEffect(() => {
    if (!open) return;

    const normalize = (u: string) => resolveMediaUrl(u).trim().toLowerCase();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await listMediaFromClient({
          page,
          pageSize: PAGE_SIZE,
          kind: "Image",
          q: search || undefined,
        });

        const itemsByUrl = new Map(res.items.map((x: any) => [normalize(x.url), x]));

        const pinnedFromList: MediaAssetDto[] = [];
        const missingUrls: string[] = [];

        for (const url of initialSelectedUrls ?? []) {
          if (!url) continue;
          const hit = itemsByUrl.get(normalize(url));
          if (hit) pinnedFromList.push(hit);
          else missingUrls.push(url);
        }

        const pinnedHydrated: MediaAssetDto[] = [];

        for (const url of missingUrls) {
          try {
            const id = await resolveMediaIdByUrl(url); // string | null
            if (!id) {
              // واقعاً رکوردی در DB نیست (یا resolve شکست خورد)
              pinnedHydrated.push({
                id: `__pinned__${normalize(url)}`,
                url,
                thumbnailUrl: url,
                altText: null,
                title: null,
                fileSize: 0,
                contentType: null,
                kind: "Image",
                usage: "General",
              } as any);
              continue;
            }

            const dto = await getMediaByIdFromClient(id);
            pinnedHydrated.push(dto);
          } catch {
            pinnedHydrated.push({
              id: `__pinned__${normalize(url)}`,
              url,
              thumbnailUrl: url,
              altText: null,
              title: null,
              fileSize: 0,
              contentType: null,
              kind: "Image",
              usage: "General",
            } as any);
          }
        }

        const pinned = [...pinnedFromList, ...pinnedHydrated];

        // 4) merge بدون تکرار
        const pinnedUrlSet = new Set(pinned.map((p) => normalize(p.url)));
        const mergedItems = [
          ...pinned,
          ...res.items.filter((i: any) => !pinnedUrlSet.has(normalize(i.url))),
        ];

        setItems(mergedItems);
        setTotalCount(res.totalCount + pinned.length);

        // 5) انتخاب پیشفرض
        if (selectedIds.length === 0) {
          const first = pinned[0];
          if (first) setSelectedIds([first.id]);
          else if (mergedItems.length > 0) setSelectedIds([mergedItems[0].id]);
        }

      } catch (err: any) {
        console.error("Failed to load media", err);
        setError("خطا در بارگذاری لیست مدیا.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, page, search, initialSelectedUrls.join("|")]);

  useEffect(() => {
    if (!selected) {
      setAltInput("");
      setTitleInput("");
    } else {
      setAltInput(selected.altText ?? "");
      setTitleInput(selected.title ?? "");
    }
  }, [selected]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handleSaveMeta = async () => {
    if (!selected) return;
    setSavingMeta(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updated = await updateMediaFromClient(selected.id, {
        altText: altInput || undefined,
        title: titleInput || undefined,
      });

      setItems((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setSuccessMessage("تغییرات با موفقیت ذخیره شد.");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Failed to save media meta", err);
      setError("ذخیره مشخصات تصویر با خطا مواجه شد.");
      setSuccessMessage(null);
    } finally {
      setSavingMeta(false);
    }
  };

  const handleConfirmSelect = () => {
    if (selectedIds.length === 0) return;

    // URL همه آیتم‌های انتخاب شده
    const urls = items
      .filter((m) => selectedIds.includes(m.id))
      .map((m) => m.url);

    if (urls.length === 0) return;

    onSelect(urls);
    onClose();
  };

  // ---- بخش آپلود ----
  const uploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setUploading(true);
    setUploadError(null);
    try {
      const created = await uploadMediaWithProgress(file, "BrandLogo", (p) => {
        setUploadProgress(p);
      });

      setItems((prev) => [created, ...prev]);
      setSelectedIds([created.id]);
      setActiveTab("library");
    } catch (err) {
      console.error("Upload failed", err);
      setUploadError("بارگذاری پرونده با خطا مواجه شد.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    uploadFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    uploadFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDeleteSelected = async () => {
    if (!selected) return;

    const confirmed = window.confirm(
      "آیا از حذف دائمی این تصویر مطمئن هستید؟ این عمل غیرقابل بازگشت است."
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      setError(null);

      await deleteMediaFromClient(selected.id);

      // حذف از state
      setItems((prev) => prev.filter((m) => m.id !== selected.id));
      setSelectedIds((prev) => prev.filter((id) => id !== selected.id));
      setAltInput("");
      setTitleInput("");
    } catch (err) {
      console.error("Failed to delete media", err);
      setError("حذف تصویر با خطا مواجه شد.");
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (!multiple) {
        return [id];
      }
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      return [...prev, id];
    });
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      dir="rtl"
    >
      <DialogBackdrop className="fixed inset-0 bg-black/50" />

      <DialogPanel className="relative bg-white w-full max-w-7xl h[90vh] flex flex-col rounded shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-300 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 p-1"
          >
            <X className="w-5 h-5" />
          </button>
          <DialogTitle className="text-xl font-normal">
            افزودن رسانه
          </DialogTitle>
          <div className="w-5" />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-300">
          <div className="flex gap-4 px-6 text-sm">
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`py-3 border-b-4 ${activeTab === "upload"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:border-gray-400"
                }`}
            >
              بارگذاری پرونده‌ها
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("library")}
              className={`py-3 border-b-4 ${activeTab === "library"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:border-gray-400"
                }`}
            >
              کتابخانه پرونده‌های چندرسانه‌ای
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "upload" ? (
          // ---------------- تب بارگذاری ----------------
          <div className="flex-1 flex flex-col items-center justify-center bg-white px-6">
            <div
              onDrop={uploading ? undefined : handleDrop}
              onDragOver={uploading ? undefined : handleDragOver}
              onDragLeave={uploading ? undefined : handleDragLeave}
              className={`w-full max-w-xl border-2 border-dashed rounded bg-gray-50 flex flex-col items-center justify-center py-12 text-center transition ${isDragging ? "border-blue-500 bg-blue-50/50" : "border-gray-300"
                }`}
            >
              <p className="text-sm text-gray-700 mb-2">
                برای بارگذاری، پرونده‌ها را بکشید
              </p>
              <p className="text-sm text-gray-500 mb-4">یا</p>

              <label className="inline-flex items-center justify-center border border-blue-500 text-blue-600 hover:bg-blue-50 rounded px-4 py-2 cursor-pointer text-sm">
                گزینش پرونده‌ها
                <input
                  type="file"
                  className="hidden"
                  disabled={uploading}
                  onChange={handleFileInputChange}
                />
              </label>

              <p className="mt-4 text-xs text-gray-500">
                حداکثر اندازه پرونده برای بارگذاری: ۸ مگابایت.
              </p>
            </div>

            {uploadError && (
              <p className="mt-4 text-sm text-red-600">{uploadError}</p>
            )}

            {uploading && (
              <div className="mt-4 w-full max-w-xl">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span>در حال بارگذاری...</span>
                  <span dir="ltr">{uploadProgress}%</span>
                </div>

                <div className="h-2 w-full rounded bg-gray-200 overflow-hidden">
                  <div
                    className="h-2 rounded bg-blue-600 transition-[width] duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-6 text-sm text-gray-600">
              <button
                type="button"
                className="text-blue-600 hover:underline"
              >
                گذاشتن از نشانی
              </button>
            </div>
          </div>
        ) : (
          // ---------------- تب کتابخانه ----------------
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel - Details */}
            <div className="w-96 border-l border-gray-300 p-6 overflow-y-auto bg-gray-50">
              {selected ? (
                <div className="space-y-6">
                  <div className="border-2 border-gray-200 bg-white p-4 rounded">
                    <div className="flex gap-4 mb-4">
                      <div className="flex-1 text-right">
                        <div className="text-sm text-gray-500 mb-2">
                          جزئیات پیوست
                        </div>
                        <h3 className="font-semibold text-base mb-1 whitespace-normal break-words">
                          {selected.title ||
                            selected.altText ||
                            selected.url.split("/").pop()}
                        </h3>
                        <div className="text-sm text-gray-600 mt-2">
                          {formatBytes(selected.fileSize)}
                        </div>

                        {selected.contentType && (
                          <div className="text-sm text-gray-600">{selected.contentType}</div>
                        )}

                        <div className="mt-2 text-sm">
                          <DeleteMediaButton
                            id={selected.id}
                            title={
                              selected.title ||
                              selected.altText ||
                              selected.url.split("/").pop()
                            }
                            onDeleted={() => {
                              setItems((prev) =>
                                prev.filter((m) => m.id !== selected.id)
                              );
                              setSelectedIds((prev) =>
                                prev.filter((id) => id !== selected.id)
                              );
                              setAltInput("");
                              setTitleInput("");
                            }}
                          />
                        </div>
                      </div>

                    </div>

                    <div className="space-y-4 mt-6">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1 text-right">
                          متن جایگزین
                        </label>
                        <input
                          type="text"
                          value={altInput}
                          onChange={(e) => setAltInput(e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          dir="rtl"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-1 text-right">
                          عنوان
                        </label>
                        <input
                          type="text"
                          value={titleInput}
                          onChange={(e) => setTitleInput(e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          dir="rtl"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-1 text-right">
                          نشانی پرونده
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={resolveMediaUrl(selected.url)}
                          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-gray-100 text-gray-600"
                          dir="ltr"
                        />
                      </div>

                      <Button
                        type="button"
                        onClick={handleSaveMeta}
                        disabled={savingMeta}
                        className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm disabled:opacity-60"
                      >
                        {savingMeta ? "در حال ذخیره..." : "ذخیره تغییرات"}
                      </Button>
                      {successMessage && (
                        <p className="mt-2 text-sm text-green-600 text-right">
                          {successMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-gray-500 text-center">
                    یک تصویر از سمت راست انتخاب کنید تا جزئیات آن را ویرایش
                    کنید.
                  </p>
                </div>
              )}
            </div>

            {/* Main Library Area */}
            <div className="flex-1 flex flex-col bg-white">
              {/* Top Bar */}
              <div className="border-b border-gray-300 p-4 flex justify-between items-center">
                <input
                  type="text"
                  placeholder="جستجو"
                  className="border border-gray-300 rounded px-3 py-1.5 w-48 text-sm text-right"
                  dir="rtl"
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                />
                <div className="flex gap-3 items-center">
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
                    >
                      قبلی
                    </button>
                    <span>
                      صفحه {page} از {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
                    >
                      بعدی
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid */}
              <div className="flex-1 min-h-0 overflow-y-auto p-6 max-h-[70vh]">
                {error && (
                  <p className="mb-3 text-sm text-red-600 text-right">
                    {error}
                  </p>
                )}
                {loading ? (
                  <p className="text-sm text-gray-500 text-right">
                    در حال بارگذاری...
                  </p>
                ) : items.length === 0 ? (
                  <p className="text-sm text-gray-500 text-right">
                    هیچ پرونده‌ای یافت نشد.
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-4">
                    {items.map((m) => {
                      const isActive = selectedIds.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleSelect(m.id)}
                          className="relative group cursor-pointer text-left"
                        >
                          <div
                            className={
                              "rounded overflow-hidden border aspect-square flex items-center justify-center bg-gray-50" +
                              (isActive
                                ? " border-4 border-blue-500"
                                : " border-gray-300")
                            }
                          >
                            <img
                              src={resolveMediaUrl(m.thumbnailUrl || m.url)}
                              alt={m.altText || ""}
                              className="w-full h-full object-cover"
                            />
                            {isActive && (
                              <div className="absolute top-2 right-2 bg-blue-500 text-white rounded p-1">
                                <Check className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Bar */}
              <div className="border-t border-gray-300 p-4 flex justify-between items-center bg-gray-50">
                <Button
                  type="button"
                  onClick={handleConfirmSelect}
                  disabled={selectedIds.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm disabled:opacity-60"
                >
                  {confirmText}
                </Button>

                {selectedIds.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    {selected && (
                      <img
                        src={resolveMediaUrl(
                          selected.thumbnailUrl || selected.url
                        )}
                        alt={selected.altText || ""}
                        className="w-10 h-10 object-cover rounded border border-gray-300"
                      />
                    )}
                    <span>{selectedIds.length} مورد انتخاب شده است</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogPanel>
    </Dialog>
  );
}
