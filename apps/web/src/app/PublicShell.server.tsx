import ConnectivityBanner from "@/components/common/ConnectivityBanner";
import ProgressProvider from "./ProgressProvider";
import PublicHeaderShell from "@/components/header/PublicHeaderShell.server";
import PublicFooterShell from "@/components/footer/PublicFooterShell.server";
import { getPublicSettingsCached } from "@/modules/settings/public-api.server";
import { Suspense } from "react";

export default async function PublicShell({ children }: { children: React.ReactNode }) {
  let logoUrl: string | null = null;
  let initialApiDown = false;

  try {
    const s = await getPublicSettingsCached();
    logoUrl = s?.logoUrl ?? null;
  } catch {
    initialApiDown = true;
  }

  return (
    <>
      <ConnectivityBanner initialApiDown={initialApiDown} />
      <PublicHeaderShell logoUrl={logoUrl} />
      <Suspense fallback={<div>در حال بارگذاری...</div>}>
        <ProgressProvider>{children}</ProgressProvider>
      </Suspense>
      <PublicFooterShell />
    </>
  );
}