"use client";

import { AdminListPage } from "@/shared/components/AdminListPage";
import { ProductCreateButton } from "@/modules/product/ui/ProductCreateButton";
import { ProductRowMenuCell } from "@/modules/product/ui/ProductRowMenuCell";
import type {
  ProductListItemDto,
  VendorOptionDto,
  BrandOptionDto,
  PagedResult,
} from "@/modules/product/types";
import type { TagListItemDto } from "@/modules/tag/types";
import type { CategoryOptionDto } from "@/modules/category/types";
import type {
  AttributeGroupListItemDto,
  ProductAttributeListItemDto,
} from "@/modules/specs/types";
import { resolveMediaUrl } from "@/modules/media/resolve-url";
import { useProducts } from "@/modules/product/hooks";

export function ProductsPageClient(props: {
  data: PagedResult<ProductListItemDto>;
  q: string;
  page: number;
  pageSize: number;
  brandOptions: BrandOptionDto[];
  vendorOptions: VendorOptionDto[];
  attributeOptions: ProductAttributeListItemDto[];
  groupOptions: AttributeGroupListItemDto[];
  categoryOptions: CategoryOptionDto[];
  tagOptions: TagListItemDto[];
}) {
  const { data, q, page, pageSize } = props;

  const productsQ = useProducts({ page, pageSize, q }, data);
  const list = productsQ.data ?? data;

  const columns = [
    {
      id: "image",
      header: "تصویر محصول",
      width: "80px",
      cell: (row: any) => (
        <div className="flex justify-start">
          {row.primaryImageUrl ? (
            <img
              src={resolveMediaUrl(row.primaryImageUrl)}
              alt={row.title}
              className="h-12 w-12 rounded border border-gray-200 object-cover bg-white"
            />
          ) : (
            <div className="h-12 w-12 rounded border border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400">
              بدون تصویر
            </div>
          )}
        </div>
      ),
    },
    {
      id: "title",
      header: "عنوان",
      cell: (r: ProductListItemDto) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-900">{r.title}</span>
          {r.brandTitle && (
            <span className="text-[11px] text-slate-400">
              برند: {r.brandTitle}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "vendor",
      header: "فروشنده",
      width: "140px",
      cell: (row: any) => (
        <div className="flex flex-col items-start text-right">
          <span className="text-xs text-gray-800">
            {row.ownerVendorName ?? "فروشگاه اصلی"}
          </span>
        </div>
      ),
    },
  ];

  return (
    <AdminListPage<ProductListItemDto>
      title="محصولات"
      basePath="/admin/products"
      data={list}
      q={q}
      createButton={
        <ProductCreateButton
          brandOptions={props.brandOptions}
          vendorOptions={props.vendorOptions}
          attributeOptions={props.attributeOptions}
          groupOptions={props.groupOptions}
          categoryOptions={props.categoryOptions}
          tagOptions={props.tagOptions}
        />
      }
      columns={columns}
      rowMenuCell={(row) => (
        <ProductRowMenuCell
          product={row}
          brandOptions={props.brandOptions}
          vendorOptions={props.vendorOptions}
          attributeOptions={props.attributeOptions}
          groupOptions={props.groupOptions}
          categoryOptions={props.categoryOptions}
          tagOptions={props.tagOptions}
        />
      )}
      showTrashButton={true}
      trashHref="/admin/products/trash"
      trashLabel="سطل زباله"
      searchPlaceholder="جستجوی محصول..."
    />
  );
}
