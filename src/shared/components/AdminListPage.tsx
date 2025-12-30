import Link from "next/link";
import { ListSearchBox } from "./ListSearchBox";
import { StatusFilterBar } from "./StatusFilterBar";
import { AdminDataTable } from "./AdminDataTable";
import { AdminPaginationBar } from "./AdminPaginationBar";
import { AdminListPageProps } from "../types/adminlistpageTypes";

export function AdminListPage<T>({
  title,
  subtitle,
  createButton,
  basePath,
  data,
  q,
  columns,
  rowMenuCell,
  rowMenuHeader,
  showIndex = true,
  emptyMessage,
  enableStatusFilter = false,
  statusOptions,
  totalLabel,
  searchPlaceholder = "جستجو...",
  showTrashButton = false,
  trashHref,
  trashLabel = "سطل زباله",
}: AdminListPageProps<T>) {
  return (
    <main className="flex-1 px-6 pb-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-slate-900">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-[11px] text-slate-400">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {createButton}
          {showTrashButton && (
            <Link
              href={trashHref ?? `${basePath}/trash`}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              🗑
              <span className="mr-1">{trashLabel}</span>
            </Link>
          )}
        </div>
      </div>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <ListSearchBox placeholder={searchPlaceholder} />

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>مرتب‌سازی بر اساس</span>
              <button className="rounded-full border border-slate-200 px-3 py-1 hover:bg-slate-50">
                جدیدترین
              </button>
            </div>
          </div>
        </div>

        {enableStatusFilter && statusOptions && (
          <StatusFilterBar options={statusOptions} totalLabel={totalLabel} />
        )}

        <AdminDataTable
          data={data.items}
          page={data.page}
          pageSize={data.pageSize}
          columns={columns}
          rowMenuCell={rowMenuCell}
          rowMenuHeader={rowMenuHeader}
          showIndex={showIndex}
          emptyMessage={emptyMessage}
        />

        <AdminPaginationBar
          basePath={basePath}
          page={data.page}
          pageSize={data.pageSize}
          totalCount={data.totalCount ?? data.total ?? data.items.length}
          q={q}
        />
      </section>
    </main>
  );
}
