import Link from "next/link";

interface PaginationProps {
  current: number;
  totalPages: number;
  basePath: string; // مثلا "/shop/brands"
  q?: string;
}

export default function Pagination({
  current,
  totalPages,
  basePath,
  q = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const makeHref = (page: number) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav
      className="mt-4 flex items-center justify-between border-t border-gray-200 px-4 pt-4 sm:px-0"
      aria-label="Pagination"
    >
      {/* Previous */}
      <div className="flex flex-1 justify-start">
        {current > 1 && (
          <Link
            href={makeHref(current - 1)}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            قبلی
          </Link>
        )}
      </div>

      {/* Page numbers */}
      <div className="hidden md:flex">
        {pages.map((p) => (
          <Link
            key={p}
            href={makeHref(p)}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
              p === current
                ? "text-white bg-brand-500 hover:bg-brand-600 rounded-md"
                : "text-gray-700 hover:bg-gray-50 rounded-md"
            }`}
          >
            {p}
          </Link>
        ))}
      </div>

      {/* Next */}
      <div className="flex flex-1 justify-end">
        {current < totalPages && (
          <Link
            href={makeHref(current + 1)}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            بعدی
          </Link>
        )}
      </div>
    </nav>
  );
}
