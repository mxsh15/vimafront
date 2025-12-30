"use client";

import { useEffect, useState } from "react";
import { getMyCart, removeFromCart, updateCartItem } from "@/modules/cart/api";
import type { CartDto } from "@/modules/cart/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken } from "@/modules/auth/client-api";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace(`/login?returnUrl=${encodeURIComponent("/cart")}`);
      return;
    }
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCart() {
    try {
      const data = await getMyCart();
      setCart(data);
    } catch (error) {
      console.error("Failed to load cart", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return;
    try {
      await updateCartItem(itemId, { quantity });
      await loadCart();
    } catch (error) {
      console.error("Failed to update cart item", error);
    }
  }

  async function handleRemove(itemId: string) {
    try {
      await removeFromCart(itemId);
      await loadCart();
    } catch (error) {
      console.error("Failed to remove item", error);
    }
  }

  if (loading) return <div className="p-8">در حال بارگذاری...</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">سبد خرید شما خالی است</h1>
        <Link href="/shop" className="text-blue-600 hover:underline">
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">سبد خرید</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 flex items-center gap-4"
              >
                {item.productImageUrl && (
                  <img
                    src={item.productImageUrl}
                    alt={item.productTitle}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}

                <div className="flex-1">
                  <h3 className="font-semibold">{item.productTitle}</h3>
                  {item.variantName && (
                    <p className="text-sm text-gray-600">{item.variantName}</p>
                  )}
                  <p className="text-lg font-bold mt-2">
                    {item.unitPrice.toLocaleString()} تومان
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleUpdateQuantity(item.id, item.quantity - 1)
                    }
                    className="px-3 py-1 border rounded"
                  >
                    -
                  </button>
                  <span className="w-12 text-center">{item.quantity}</span>
                  <button
                    onClick={() =>
                      handleUpdateQuantity(item.id, item.quantity + 1)
                    }
                    className="px-3 py-1 border rounded"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <p className="font-bold">
                    {item.totalPrice.toLocaleString()} تومان
                  </p>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-red-600 text-sm mt-2"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">خلاصه سفارش</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>جمع کل:</span>
                <span>{cart.totalPrice.toLocaleString()} تومان</span>
              </div>
              <div className="flex justify-between">
                <span>تعداد آیتم‌ها:</span>
                <span>{cart.totalItems}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700"
            >
              ادامه به تسویه حساب
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
