import { listBrands } from "@/modules/brand/api";
import { BrandsPageClient } from "./BrandsPageClient";

export const metadata = {
  title: "برندها | پنل مدیریت",
};

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; status?: string };
}) {
  const params = await searchParams;

  const page = Number(searchParams?.page ?? 1);
  const q = params?.q ?? "";
  const status = params.status ?? undefined;
  const pageSize = 12;
  const data = await listBrands({ page, pageSize, q, status });

  return <BrandsPageClient data={data} q={q} />;
}
