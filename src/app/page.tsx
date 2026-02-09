import { Suspense } from "react";
import { getPublicHomeLayout } from "@/modules/home-template/api";
import { RenderHomeLayout } from "@/modules/home-builder/renderers";

export const metadata = { title: "خانه | ShopVima" };

function HomeFallback() {
  return (
    <div className="p-6">
      Loading...
    </div>
  );
}

async function HomeContent() {
  const layout = await getPublicHomeLayout();
  return <RenderHomeLayout layout={layout} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent />
    </Suspense>
  );
}

