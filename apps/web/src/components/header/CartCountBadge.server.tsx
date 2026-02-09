import Link from "next/link";
import { cookies } from "next/headers";

async function fetchCartCount(): Promise<number> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;

  if (!cartId) return 0;
  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
    }/store/cart/${cartId}/summary`,
    {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" },
    }
  ).catch(() => null);

  if (!res || !res.ok) return 0;

  const data = (await res.json()) as { itemsCount?: number; count?: number };
  return Number(data.itemsCount ?? data.count ?? 0) || 0;
}

export default async function CartCountBadgeServer() {
  const count = await fetchCartCount();
  if (!count) return null;

  return (
    <Link
      href="/cart"
      className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-xs font-bold bg-slate-900 text-white"
      aria-label={`سبد خرید، ${count} آیتم`}
    >
      {count.toLocaleString("fa-IR")}
    </Link>
  );
}
