"use client";

import dynamic from "next/dynamic";

const CartClient = dynamic(() => import("./CartClient"), { ssr: false });

export default function CartPageClient() {
  return <CartClient />;
}
