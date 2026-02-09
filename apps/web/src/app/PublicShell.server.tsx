import ProgressProvider from "./ProgressProvider";
import PublicFooter from "@/components/footer/PublicFooter";
import PublicHeaderShell from "@/components/header/PublicHeaderShell.server";
import { getPublicSettingsCached } from "@/modules/settings/public-api.server";

export default async function PublicShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await getPublicSettingsCached();

  return (
    <>
      <PublicHeaderShell logoUrl={s.logoUrl} />
      <ProgressProvider>{children}</ProgressProvider>
      <PublicFooter />
    </>
  );
}
