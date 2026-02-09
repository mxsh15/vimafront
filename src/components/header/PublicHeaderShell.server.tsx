import { Suspense } from "react";
import PublicHeader from "./PublicHeader";
import CartCountNumber from "./CartCountNumber.server";
import { getPublicCategoryOptionsCached } from "@/modules/category/server";

function CartCountFallback({ storeName, logoUrl }: { storeName?: string; logoUrl?: string | null }) {
  return <PublicHeader
    storeName={storeName}
    logoUrl={logoUrl}
    cartCount={0}
    initialCategoryOptions={[]} />;
}

export default function PublicHeaderShell({ storeName, logoUrl }: { storeName?: string; logoUrl?: string | null }) {
  return (
    <Suspense fallback={<CartCountFallback storeName={storeName} logoUrl={logoUrl} />}>
      <PublicHeaderWithCartCount storeName={storeName} logoUrl={logoUrl} />
    </Suspense>
  );
}

async function PublicHeaderWithCartCount({ storeName, logoUrl }: { storeName?: string; logoUrl?: string | null }) {
  const [count, categoryOptions] = await Promise.all([
    CartCountNumber(),
    getPublicCategoryOptionsCached(true),
  ]);

  console.log(categoryOptions);

  return (
    <PublicHeader
      storeName={storeName}
      logoUrl={logoUrl}
      cartCount={count}
      initialCategoryOptions={categoryOptions ?? []}
    />
  );
}
