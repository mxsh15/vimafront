import type { DiscountDto } from "./types";

export async function clientGetDiscount(id: string): Promise<DiscountDto> {
  const res = await fetch(`/api/discounts/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch discount");
  return res.json();
}
