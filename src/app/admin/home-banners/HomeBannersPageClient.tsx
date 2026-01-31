"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AdminListPage } from "@/shared/components/AdminListPage";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import type {
  AdminHomeBannerListItem,
  AdminHomeBannerUpsert,
  PagedResult,
} from "@/modules/homeBanner/types";
import HomeBannerUpsertModal from "@/modules/homeBanner/ui/HomeBannerUpsertModal";
import { HomeBannerCreateButton } from "@/modules/homeBanner/ui/HomeBannerCreateButton";
import { HomeBannerRowMenuCell } from "@/modules/homeBanner/ui/HomeBannerRowMenuCell";
import { createHomeBannerAction } from "@/modules/homeBanner/actions";

export default function HomeBannersPageClient(props: {
  data: PagedResult<AdminHomeBannerListItem>;
  q: string;
  page: number;
  pageSize: number;
  status: "all" | "active" | "inactive";
}) {
  const router = useRouter();
  const { data, q } = props;

  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const columns = useMemo(
    () => [
      {
        id: "preview",
        header: "پیش‌نمایش",
        width: "120px",
        cell: (r: AdminHomeBannerListItem) => (
          <img
            src={resolveMediaUrl(r.mediaUrl)}
            alt={r.altText ?? r.title ?? "banner"}
            className="h-12 w-28 object-cover rounded-lg border border-slate-200 bg-white"
          />
        ),
        cellClassName: "px-2",
      },
      {
        id: "title",
        header: "عنوان / Alt",
        cell: (r: AdminHomeBannerListItem) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-slate-900">
              {r.title ?? "—"}
            </span>
            <span className="text-[11px] text-slate-400">
              {r.altText ?? "—"}
            </span>
          </div>
        ),
        cellClassName: "px-2",
      },
      {
        id: "linkUrl",
        header: "لینک",
        cell: (r: AdminHomeBannerListItem) => (
          <span className="text-[11px] text-slate-600 break-all">
            {r.linkUrl ?? "—"}
          </span>
        ),
        cellClassName: "px-2",
      },
      {
        id: "sortOrder",
        header: "ترتیب",
        width: "90px",
        cell: (r: AdminHomeBannerListItem) => (
          <span className="text-[11px] text-slate-600">{r.sortOrder}</span>
        ),
        cellClassName: "px-2",
      },
      {
        id: "status",
        header: "وضعیت",
        width: "110px",
        cell: (r: AdminHomeBannerListItem) =>
          r.isActive ? (
            <span className="text-[11px] font-medium text-emerald-700">فعال</span>
          ) : (
            <span className="text-[11px] text-slate-400">غیرفعال</span>
          ),
        cellClassName: "px-2",
      },
    ],
    []
  );

  return (
    <>
      <AdminListPage<AdminHomeBannerListItem>
        title="بنر اسلایدر صفحه اصلی"
        subtitle="آپلود تصویر، لینک‌دهی، زمان‌بندی و ترتیب نمایش."
        basePath="/admin/home-banners"
        data={data}
        q={q}
        createButton={<HomeBannerCreateButton onClick={() => setCreateOpen(true)} />}
        searchPlaceholder="جستجو در عنوان/alt/لینک..."
        emptyMessage="بنری ثبت نشده است."
        rowMenuHeader="عملیات"
        rowMenuCell={(row) => <HomeBannerRowMenuCell row={row} />}
        filterBars={[
          {
            paramKey: "status",
            label: "وضعیت:",
            options: [
              { label: "همه", value: null },
              { label: "فعال", value: "active" },
              { label: "غیرفعال", value: "inactive" },
            ],
          },
        ]}
        columns={columns as any}
      />

      <HomeBannerUpsertModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        initial={null}
        submitting={submitting}
        onSubmit={async (dto: AdminHomeBannerUpsert) => {
          try {
            setSubmitting(true);
            await createHomeBannerAction(dto);
            setCreateOpen(false);
            router.refresh();
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </>
  );
}
