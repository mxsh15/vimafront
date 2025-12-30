import Link from "next/link";
import { listProducts } from "@/modules/product/api";

export const metadata = { title: "فروشگاه" };

export default async function ShopPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; page?: string }>;
}) {
    const sp = await searchParams;
    const q = sp.q ?? "";
    const page = Number(sp.page ?? "1") || 1;

    const res = await listProducts({ page, pageSize: 20, q });
    const products = res.items ?? [];

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

            {products.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                    محصولی پیدا نشد.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {products.map((p) => (
                        <Link
                            key={p.id}
                            href={`/product/${p.id}`}
                            className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition"
                        >
                            <div className="text-sm font-semibold line-clamp-2">{p.title}</div>

                            {p.minPrice != null && (
                                <div className="mt-2 text-sm font-bold">
                                    {Number(p.minPrice).toLocaleString("fa-IR")} تومان
                                </div>
                            )}

                            <div className="mt-2 text-xs text-slate-500 font-mono">{p.id}</div>
                        </Link>
                    ))}
                </div>
            )}

            {/* اگر خواستی pagination واقعی بذاریم با res.totalCount */}
            {/* <div className="flex gap-2 justify-center mt-6"> ... </div> */}
        </div>
    );
}
