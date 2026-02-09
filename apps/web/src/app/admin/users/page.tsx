import { UsersPageClient } from "./UsersPageClient";
import { listUsers } from "@/modules/user/api";
import { listRoleOptions } from "@/modules/role/api";
import { listVendorOptions } from "@/modules/vendor/api";

export const metadata = {
  title: "کاربران | پنل مدیریت",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; role?: string; status?: string }>;
}) {
  const params = await searchParams;

  const page = Number(params.page ?? "1");
  const q = params.q ?? "";
  const role = params.role ?? undefined;
  const status = params.status ?? undefined;
  const pageSize = 12;

  const [data, roleOptions, vendorOptions] = await Promise.all([
    listUsers({ page, pageSize, q, role, status }),
    listRoleOptions(),
    listVendorOptions(),
  ]);

  const vendorOptionsMapped = vendorOptions.map((v) => ({
    id: v.id,
    storeName: v.storeName,
  }));

  return (
    <UsersPageClient
      data={data}
      q={q}
      page={page}
      pageSize={pageSize}
      role={role}
      status={status}
      roleOptions={roleOptions}
      vendorOptions={vendorOptionsMapped}
    />
  );
}
