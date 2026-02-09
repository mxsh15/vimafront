import { serverFetch } from "@/lib/server/http";
import type { CartDto } from "@/modules/cart/types";

export default async function CartCountNumber(): Promise<number> {
  try {
    const cart = await serverFetch<CartDto>("carts/my-cart", { cache: "no-store" });
    return Number(cart?.totalItems ?? 0) || 0;
  } catch (e: any) {
    const status = e?.status || e?.cause?.status;
    if (status === 401) return 0;
    return 0;
  }
}
