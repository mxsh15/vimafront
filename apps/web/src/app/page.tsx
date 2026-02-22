import { Suspense } from "react";
import { getPublicHomeLayout } from "@/modules/home-template/api";
import { RenderHomeLayout } from "@/modules/home-builder/renderers";
import ApiInlineError from "@/components/common/ApiInlineError";

export const metadata = { title: "خانه | ShopVima" };

function HomeFallback() {
  return <div className="p-6">Loading...</div>;
}

async function HomeContent() {
  try {
    const layout = await getPublicHomeLayout();
    return <RenderHomeLayout layout={layout} />;
  } catch (e: any) {
    return (
      <div className="p-6">
        <ApiInlineError error={e} />
      </div>
    );
  }
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent />
    </Suspense>
  );
}
