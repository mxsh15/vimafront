import { listBrands } from "@/modules/brand/api";
import { BrandsPageClient } from "./BrandsPageClient";

export const metadata = { title: "برندها | پنل مدیریت" };

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; status?: string };
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const q = sp.q ?? "";
  const status = sp.status ?? undefined;
  const pageSize = 12;

  const data = await listBrands({ page, pageSize, q, status });

  return (
    <BrandsPageClient
      data={data}
      q={q}
      page={page}
      pageSize={pageSize}
      status={status}
    />
  );
}
