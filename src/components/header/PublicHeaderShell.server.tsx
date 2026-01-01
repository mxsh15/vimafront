import { Suspense } from "react";
import PublicHeader from "./PublicHeader";
import CartCountNumber from "./CartCountNumber.server";

function CartCountFallback({
  storeName,
  logoUrl,
}: {
  storeName?: string;
  logoUrl?: string | null;
}) {
  return <PublicHeader storeName={storeName} logoUrl={logoUrl} cartCount={0} />;
}

export default function PublicHeaderShell({
  storeName,
  logoUrl,
}: {
  storeName?: string;
  logoUrl?: string | null;
}) {
  return (
    <Suspense
      fallback={<CartCountFallback storeName={storeName} logoUrl={logoUrl} />}
    >
      <PublicHeaderWithCartCount storeName={storeName} logoUrl={logoUrl} />
    </Suspense>
  );
}

async function PublicHeaderWithCartCount({
  storeName,
  logoUrl,
}: {
  storeName?: string;
  logoUrl?: string | null;
}) {
  const count = await CartCountNumber();
  return (
    <PublicHeader storeName={storeName} logoUrl={logoUrl} cartCount={count} />
  );
}
