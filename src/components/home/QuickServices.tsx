"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePublicQuickServices } from "@/modules/quickService/hooks";
import { resolveMediaUrl } from "@/modules/media/resolve-url";

function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-600" aria-hidden="true">
      <circle cx="6" cy="12" r="1.6" fill="currentColor" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <circle cx="18" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

type QuickServiceItem = {
  mediaAssetId: string;
  mediaUrl: string;
  title: string;
  linkUrl: string | null;
};

export function QuickServices() {
  const q = usePublicQuickServices();
  const [moreOpen, setMoreOpen] = useState(false);
  const data = (q.data ?? []) as QuickServiceItem[];
  const topNine = useMemo(() => data.slice(0, 9), [data]);

  if (q.isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-4 justify-items-center">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-neutral-100 animate-pulse" />
            <div className="h-3 w-14 bg-neutral-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  // اگر هیچ داده‌ای نیست، چیزی نشون نده
  if (data.length === 0) return null;

  const ItemCard = ({
    title,
    imgUrl,
  }: {
    title: string;
    imgUrl: string;
  }) => (
    <div className="flex flex-col items-center gap-2 cursor-pointer group select-none">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden group-hover:bg-gray-200 transition">
        <img
          src={resolveMediaUrl(imgUrl)}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <span className="text-xs text-gray-700 font-medium text-center leading-5 line-clamp-2">
        {title}
      </span>
    </div>
  );

  const Grid = ({ items }: { items: QuickServiceItem[] }) => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-5 justify-items-center">
      {items.map((item) => {
        const content = (
          <ItemCard title={item.title} imgUrl={item.mediaUrl} />
        );

        return item.linkUrl ? (
          <Link
            key={item.mediaAssetId}
            href={item.linkUrl}
            className="contents"
            onClick={() => setMoreOpen(false)}
          >
            {content}
          </Link>
        ) : (
          <div key={item.mediaAssetId}>{content}</div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* ردیف اصلی: دقیقاً ۱۰ تا (۹ تا از API + بیشتر) */}
      <div className="container mx-auto px-4 py-6 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-4 justify-items-center">
        {topNine.map((item) => {
          const content = <ItemCard title={item.title} imgUrl={item.mediaUrl} />;

          return item.linkUrl ? (
            <Link key={item.mediaAssetId} href={item.linkUrl} className="contents">
              {content}
            </Link>
          ) : (
            <div key={item.mediaAssetId}>{content}</div>
          );
        })}

        {/* آیتم دهم: بیشتر */}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center gap-2 cursor-pointer group"
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
        >
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition">
            <DotsIcon />
          </div>
          <span className="text-xs text-gray-700 font-medium text-center">بیشتر</span>
        </button>
      </div>

      {/* مودال: نمایش همه QuickService ها */}
      {moreOpen ? (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/45" onClick={() => setMoreOpen(false)} />

          <div className="absolute left-1/2 top-1/2 w-[94vw] max-w-[980px] -translate-x-1/2 -translate-y-1/2">
            <div className="rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden">
              <div className="h-14 px-4 border-b border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-700"
                  aria-label="بستن"
                >
                  <XIcon />
                </button>

                <div className="text-sm font-bold text-slate-900">خدمات ما</div>

                <div className="h-9 w-9" />
              </div>

              <div className="max-h-[70vh] overflow-auto p-6">
                <Grid items={data} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}