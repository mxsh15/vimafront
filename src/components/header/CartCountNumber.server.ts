import { cookies } from "next/headers";

export default async function CartCountNumber(): Promise<number> {
  // اینجا باید با سیستم واقعی سبد خرید تو هماهنگ شود
  const cookieStore = await cookies();

  // اگر تو پروژه‌ات cart توکن/آی‌دی چیز دیگه‌ایه، همینجا عوضش کن
  const cartId = cookieStore.get("cartId")?.value;
  if (!cartId) return 0;

  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const res = await fetch(`${base}/store/cart/${cartId}/summary`, {
    method: "GET",
    cache: "no-store",
    headers: { Accept: "application/json" },
  }).catch(() => null);

  if (!res || !res.ok) return 0;

  const data = (await res.json()) as { itemsCount?: number; count?: number };
  return Number(data.itemsCount ?? data.count ?? 0) || 0;
}
