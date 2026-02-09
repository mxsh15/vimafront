import { ProductsPageClient } from "./ProductsPageClient";
import { listProducts } from "@/modules/product/api";
import { listBrandOptions } from "@/modules/brand/api";
import { listVendorOptions } from "@/modules/vendor/api";
import { listProductAttributes, listAttributeGroups } from "@/modules/specs/api";
import { listCategoryOptions } from "@/modules/category/api";
import { listTags } from "@/modules/tag/api";
import type { VendorOptionDto } from "@/modules/product/types";

export const metadata = { title: "محصولات | پنل مدیریت" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const q = params.q ?? "";
  const pageSize = 12;

  const [
    data,
    brandOptions,
    vendorOptionsRaw,
    attributesData,
    groupsData,
    categoryOptions,
    tagsResult,
  ] = await Promise.all([
    listProducts({ page, pageSize, q }),
    listBrandOptions(),
    listVendorOptions(),
    listProductAttributes({ page: 1, pageSize: 1000 }),
    listAttributeGroups({ page: 1, pageSize: 1000 }),
    listCategoryOptions(),
    listTags({ page: 1, pageSize: 200 }),
  ]);

  const vendorOptions: VendorOptionDto[] = vendorOptionsRaw.map((v: any) => ({
    id: v.id,
    storeName: v.storeName,
  }));

  return (
    <ProductsPageClient
      data={data}
      q={q}
      page={page}
      pageSize={pageSize}
      brandOptions={brandOptions}
      vendorOptions={vendorOptions}
      attributeOptions={attributesData.items}
      groupOptions={groupsData.items}
      categoryOptions={categoryOptions}
      tagOptions={tagsResult.items}
    />
  );
}
