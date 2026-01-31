import Link from "next/link";
import { Suspense } from "react";
import { listPublicProductsCached } from "@/modules/product/public-api.server";

export const metadata = { title: "فروشگاه | ShopVima" };

function toFaMoney(n?: number | null) {
  if (!n || n <= 0) return "تماس بگیرید";
  return `${Number(n).toLocaleString("fa-IR")} تومان`;
}

function GridFallback() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200 bg-white p-4 animate-pulse"
        >
          <div className="h-4 w-3/4 bg-slate-100 rounded" />
          <div className="mt-3 h-4 w-1/2 bg-slate-100 rounded" />
          <div className="mt-3 h-3 w-1/3 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  );
}

async function ProductsGrid({ q, page }: { q: string; page: number }) {
  const res = await listPublicProductsCached({ page, pageSize: 20, q });
  const products = res.items ?? [];

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        محصولی پیدا نشد.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/product/${p.id}`}
          className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition"
        >
          <div className="text-sm font-semibold line-clamp-2">{p.title}</div>
          <div className="mt-2 text-sm font-bold">{toFaMoney(p.minPrice)}</div>
          <div className="mt-2 text-xs text-slate-500 font-mono">{p.id}</div>
        </Link>
      ))}
    </div>
  );
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp?.q ?? "";
  const page = Number(sp?.page ?? "1") || 1;

  return (
    <div className="container mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">فروشگاه</h1>
        <Link
          href="/"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          خانه
        </Link>
      </div>

      <Suspense fallback={<GridFallback />}>
        <ProductsGrid q={q} page={page} />
      </Suspense>
    </div>
  );
}
