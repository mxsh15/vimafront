import { listPublicProducts } from "@/modules/product/public-api.server";
import Link from "next/link";

export const metadata = {
  title: "خانه | ShopVima",
};

function toFaMoney(n?: number | null) {
  if (!n || n <= 0) return "تماس بگیرید";
  return `${Number(n).toLocaleString("fa-IR")} تومان`;
}

export default async function Home() {
  const res = await listPublicProducts({ page: 1, pageSize: 8 });

  const products = res?.items ?? [];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            به فروشگاه ویما خوش آمدید
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            محصولات واقعی از دیتابیس
          </p>
        </div>

        {products.length === 0 ? (
          <div className="mt-12 text-center text-gray-600 dark:text-gray-400">
            هنوز محصولی برای نمایش وجود ندارد.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition p-4 border border-slate-100 dark:border-gray-700"
                >
                  <div className="h-44 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    {p.primaryImageUrl ? (
                      // اگر URL کامل نیست و resolveMediaUrl داری، بهتره از اون استفاده کنی
                      <img
                        src={p.primaryImageUrl}
                        alt={p.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">
                        بدون تصویر
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-3 line-clamp-2">
                    {p.title}
                  </h3>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {toFaMoney(p.minPrice)}
                    </div>
                    <div className="text-xs text-gray-500">
                      مشاهده →
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 text-white px-5 py-3 text-sm hover:bg-indigo-700 transition"
              >
                مشاهده همه محصولات
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
