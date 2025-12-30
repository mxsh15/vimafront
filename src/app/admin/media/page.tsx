import { AdminListPage } from "@/shared/components/AdminListPage";
import { listMedia } from "@/modules/media/api";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import DeleteMediaButton from "@/modules/media/ui/DeleteMediaButton";
import type { MediaAssetDto } from "@/modules/media/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "کتابخانه چند رسانه‌ای | پنل مدیریت",
};

type MediaRow = MediaAssetDto;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const q = params.q ?? "";
  const pageSize = 20;
  const data = await listMedia({ page, pageSize, q });

  return (
    <AdminListPage<MediaRow>
      title="کتابخانه چند رسانه‌ای"
      subtitle="مدیریت همهٔ تصاویر و فایل‌های بارگذاری‌شده در سایت."
      basePath="/admin/media"
      data={data}
      q={q}
      searchPlaceholder="جستجو بر اساس نام یا آدرس فایل..."
      enableStatusFilter={false}
      totalLabel={`${data.totalCount} فایل در کتابخانه`}
      emptyMessage="هیچ اطلاعاتی در کتابخانه ثبت نشده است."
      createButton={null}
      showTrashButton={false}
      rowMenuHeader="عملیات"
      rowMenuCell={(row) => (
        <DeleteMediaButton id={row.id} title={row.title || row.url} />
      )}
      columns={[
        {
          id: "preview",
          header: "پیش‌نمایش",
          cell: (r) => (
            <div className="h-10 w-10 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
              <img
                src={resolveMediaUrl(r.thumbnailUrl || r.url)}
                alt={r.altText || ""}
                className="h-full w-full object-cover"
              />
            </div>
          ),
          cellClassName: "px-4",
        },
        {
          id: "file",
          header: "آدرس / نام فایل",
          cell: (r) => (
            <div className="text-xs text-slate-700">
              <div className="truncate max-w-xs" dir="ltr">
                {resolveMediaUrl(r.url)}
              </div>
              {r.title && (
                <div className="mt-1 text-[11px] text-slate-400">{r.title}</div>
              )}
            </div>
          ),
          cellClassName: "px-2",
        },
        {
          id: "size",
          header: "اندازه",
          cell: (r) =>
            r.fileSize ? `${Math.round(r.fileSize / 1024)} کیلوبایت` : "-",
          cellClassName: "px-2",
        },
      ]}
    />
  );
}
