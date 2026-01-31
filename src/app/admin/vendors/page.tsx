import { listVendors } from "@/modules/vendor/api";
import { listUserOptions } from "@/modules/user/api";
import { VendorsPageClient } from "./VendorsPageClient";
import type { PagedResult, VendorRow, VendorListItemDto } from "@/modules/vendor/types";

export const metadata = {
  title: "فروشندگان | پنل مدیریت",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const q = params.q ?? "";
  const status = params.status ?? undefined;
  const pageSize = 12;

  const [data, userOptions] = await Promise.all([
    listVendors({ page, pageSize, q, status }),
    listUserOptions(),
  ]);

  const normalized: PagedResult<VendorRow> = {
    page: data.page ?? page,
    pageSize: data.pageSize ?? pageSize,
    totalCount: data.totalCount ?? 0,
    items: (data.items ?? []).map((v: VendorListItemDto) => ({
      id: v.id,
      storeName: v.storeName,
      legalName: v.legalName ?? null,
      nationalId: v.nationalId ?? null,
      phoneNumber: v.phoneNumber ?? null,
      mobileNumber: v.mobileNumber ?? null,
      defaultCommissionPercent: v.defaultCommissionPercent ?? null,
      ownerUserId: v.ownerUserId ?? null,
      ownerUserName: (v as any).ownerUserName ?? null,
      productsCount: v.productsCount ?? 0,
      ordersCount: v.ordersCount ?? 0,
      status: v.status,
      createdAtUtc: v.createdAtUtc,
    })),
  };

  return (
    <VendorsPageClient
      data={normalized}
      q={q}
      page={page}
      pageSize={pageSize}
      status={status}
      userOptions={userOptions}
    />
  );
}
