// src/components/header/PublicHeaderShell.server.tsx
import { Suspense } from "react";
import { headers } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";

import PublicHeaderDesktop from "./PublicHeaderDesktop";
import PublicHeaderMobile from "./PublicHeaderMobile";

import CartCountNumber from "./CartCountNumber.server";
import { getPublicCategoryOptionsCached } from "@/modules/category/server";
import { isMobileRequest } from "@/lib/device/isMobileRequest";

function CartCountFallback({
  storeName,
  logoUrl,
}: {
  storeName?: string;
  logoUrl?: string | null;
}) {
  return (
    <PublicHeaderDesktop
      storeName={storeName}
      logoUrl={logoUrl}
      cartCount={0}
      initialCategoryOptions={[]}
    />
  );
}

export default function PublicHeaderShell({
  storeName,
  logoUrl,
}: {
  storeName?: string;
  logoUrl?: string | null;
}) {
  return (
    <Suspense fallback={<CartCountFallback storeName={storeName} logoUrl={logoUrl} />}>
      <PublicHeaderShellInner storeName={storeName} logoUrl={logoUrl} />
    </Suspense>
  );
}

async function PublicHeaderShellInner({
  storeName,
  logoUrl,
}: {
  storeName?: string;
  logoUrl?: string | null;
}) {
  noStore();

  const h = await headers();
  const ua = h.get("user-agent");
  const chMobile = h.get("sec-ch-ua-mobile");
  const isMobile = isMobileRequest(ua, chMobile);

  if (isMobile) {
    return <PublicHeaderMobile storeName={storeName} logoUrl={logoUrl} />;
  }

  const [count, categoryOptions] = await Promise.all([
    CartCountNumber(),
    getPublicCategoryOptionsCached(true),
  ]);

  return (
    <PublicHeaderDesktop
      storeName={storeName}
      logoUrl={logoUrl}
      cartCount={count}
      initialCategoryOptions={categoryOptions ?? []}
    />
  );
}