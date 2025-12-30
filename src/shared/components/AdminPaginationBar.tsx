import Link from "next/link";

type AdminPaginationBarProps = {
  basePath: string;
  page: number;
  pageSize: number;
  totalCount: number;
  q?: string;
};

export function AdminPaginationBar({
  basePath,
  page,
  pageSize,
  totalCount,
  q,
}: AdminPaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);

  const from = totalCount === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, totalCount);

  function buildHref(targetPage: number) {
    const params = new URLSearchParams();
    params.set("page", String(targetPage));
    if (q && q.trim()) params.set("q", q.trim());
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const prevHref = buildHref(Math.max(1, current - 1));
  const nextHref = buildHref(Math.min(totalPages, current + 1));

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-[11px] text-slate-500">
      <div className="flex items-center gap-1">
        <Link
          aria-disabled={current === 1}
          href={current === 1 ? "#" : prevHref}
          className={`rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50 ${
            current === 1 ? "pointer-events-none opacity-50" : ""
          }`}
        >
          « قبلی
        </Link>
        <button className="h-7 min-w-7 rounded-lg bg-blue-600 px-2 text-center text-[11px] font-semibold text-white">
          {current}
        </button>
        <Link
          aria-disabled={current === totalPages}
          href={current === totalPages ? "#" : nextHref}
          className={`rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50 ${
            current === totalPages ? "pointer-events-none opacity-50" : ""
          }`}
        >
          بعدی »
        </Link>
      </div>
      <div>
        {totalCount === 0
          ? "هیچ موردی ثبت نشده است"
          : `نمایش ${from} تا ${to} از ${totalCount} مورد`}
      </div>
    </div>
  );
}
