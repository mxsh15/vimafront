import { listProducts } from "@/modules/product/api";
import { listBrandOptions } from "@/modules/brand/api";
import { listVendorOptions } from "@/modules/vendor/api";
import type { ProductListItemDto, VendorOptionDto } from "@/modules/product/types";
import { AdminListPage } from "@/shared/components/AdminListPage";
import { ProductCreateButton } from "@/modules/product/ui/ProductCreateButton";
import { listProductAttributes, listAttributeGroups } from "@/modules/specs/api";
import { listCategoryOptions } from "@/modules/category/api";
import { ProductRowMenuCell } from "@/modules/product/ui/ProductRowMenuCell";
import { listTags } from "@/modules/tag/api";
import { TagListItemDto } from "@/modules/tag/types";
import { resolveMediaUrl } from "@/modules/media/resolve-url";

export const metadata = {
  title: "محصولات | پنل مدیریت",
};

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; };
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const q = params?.q ?? "";
  const pageSize = 12;

  const [data, brandOptions, vendorOptionsRaw, attributesData,
    groupsData, categoryOptions, tagsResult] =
    await Promise.all([
      listProducts({ page, pageSize, q }),
      listBrandOptions(),
      listVendorOptions(),
      listProductAttributes({ page: 1, pageSize: 1000 }),
      listAttributeGroups({ page: 1, pageSize: 1000 }),
      listCategoryOptions(),
      listTags({ page: 1, pageSize: 200 }),
    ]);

  const attributeOptions = attributesData.items;
  const groupOptions = groupsData.items;
  const tagOptions: TagListItemDto[] = tagsResult.items;
  const vendorOptions: VendorOptionDto[] = vendorOptionsRaw.map((v) => ({
    id: v.id,
    storeName: v.storeName,
  }));

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
      id: "stock",
      header: "انبار",
      width: "120px",
      cell: (row: ProductListItemDto) => {
        const isVariable = row.isVariantProduct;

        // -------------------------
        // ۱) محصول متغیر (ویراینت‌دار)
        // -------------------------
        if (isVariable) {
          const totalStockVariants = row.totalVariantStock ?? 0;
          const hasStockVariants = totalStockVariants > 0;

          const stockLabel = hasStockVariants
            ? "دارای موجودی در ویراینت‌ها"
            : "ناموجود در همه ویراینت‌ها";

          const badgeClass = hasStockVariants
            ? "bg-blue-50 text-blue-700 border border-blue-200"
            : "bg-red-50 text-red-700 border border-red-200";

          const extraText = hasStockVariants
            ? `(مجموع ${totalStockVariants} عدد)`
            : "";

          return (
            <span
              className={
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium " +
                badgeClass
              }
            >
              {stockLabel}
              {extraText && (
                <span className="mr-1 text-[10px] text-gray-500">{extraText}</span>
              )}
            </span>
          );
        }

        // -------------------------
        // ۲) محصول ساده
        // -------------------------
        const manageStock = row.defaultOfferManageStock ?? false;
        const stockQty = row.defaultOfferStock ?? 0;
        const stockStatus = row.defaultOfferStockStatus;

        // موجود بودن برای محصول ساده:
        const isInStockByStatus =
          stockStatus === 1 || stockStatus === "InStock" ||
          stockStatus === 3 || stockStatus === "OnBackorder";

        const hasStock = manageStock ? stockQty > 0 : isInStockByStatus;

        const stockLabel = hasStock ? "موجود در انبار" : "ناموجود";

        console.log(row.defaultOfferManageStock, row.defaultOfferStock, row.defaultOfferStockStatus)

        const badgeClass = hasStock
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-red-50 text-red-700 border border-red-200";

        const extraText =
          manageStock && hasStock
            ? `(${stockQty} عدد)`
            : "";

        return (
          <span
            className={
              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium " +
              badgeClass
            }
          >
            {stockLabel}
            {extraText && (
              <span className="mr-1 text-[10px] text-gray-500">{extraText}</span>
            )}
          </span>
        );
      },
    },
    {
      id: "price",
      header: "قیمت",
      width: "160px",
      cell: (row: any) => {
        //  محصول متغیر
        if (row.isVariantProduct) {
          const min = row.minVariantPrice ?? null;
          const max = row.maxVariantPrice ?? null;

          if (!min && !max) {
            return (
              <span className="text-xs text-gray-400">
                قیمت در سطح ویراینت‌ها تعریف می‌شود
              </span>
            );
          }

          if (min && max && min !== max) {
            return (
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-gray-800">
                  از {min.toLocaleString("fa-IR")} تا{" "}
                  {max.toLocaleString("fa-IR")} تومان
                </span>
                <span className="text-[10px] text-gray-500">
                  (براساس ویراینت‌ها)
                </span>
              </div>
            );
          }

          // اگر فقط min داریم یا min == max
          const p = min || max;
          return (
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold text-gray-800">
                از {p!.toLocaleString("fa-IR")} تومان
              </span>
              <span className="text-[10px] text-gray-500">
                (حداقل قیمت ویراینت‌ها)
              </span>
            </div>
          );
        }

        //  محصول ساده
        const price = row.defaultOfferPrice ?? 0;
        const discount = row.defaultOfferDiscountPrice ?? null;

        if (!price && !discount) {
          return (
            <span className="text-xs text-gray-400">
              بدون قیمت
            </span>
          );
        }

        return (
          <div className="flex flex-col items-start">
            {discount ? (
              <>
                <span className="text-xs text-emerald-700">
                  {discount.toLocaleString("fa-IR")} تومان
                </span>
                <span className="text-[10px] text-gray-400 line-through">
                  {price.toLocaleString("fa-IR")} تومان
                </span>
              </>
            ) : (
              <span className="text-xs text-gray-800">
                {price.toLocaleString("fa-IR")} تومان
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "createdAt",
      header: "تاریخ انتشار",
      width: "120px",
      cell: (row: any) => {
        const d = row.createdAtUtc
          ? new Date(row.createdAtUtc)
          : null;

        if (!d) {
          return (
            <span className="text-xs text-gray-400">
              نامشخص
            </span>
          );
        }

        const dateStr = d.toLocaleDateString("fa-IR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return (
          <span className="text-xs text-gray-700">
            {dateStr}
          </span>
        );
      },
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
      data={data}
      q={q}
      createButton={
        <ProductCreateButton
          brandOptions={brandOptions}
          vendorOptions={vendorOptions}
          attributeOptions={attributeOptions}
          groupOptions={groupOptions}
          categoryOptions={categoryOptions}
          tagOptions={tagOptions}
        />
      }
      columns={columns}
      rowMenuCell={(row) => (
        <ProductRowMenuCell
          product={row}
          brandOptions={brandOptions}
          vendorOptions={vendorOptions}
          attributeOptions={attributeOptions}
          groupOptions={groupOptions}
          categoryOptions={categoryOptions}
          tagOptions={tagOptions} />
      )}
      showTrashButton={true}
      trashHref="/admin/products/trash"
      trashLabel="سطل زباله"
      searchPlaceholder="جستجوی محصول..."
    />
  );
}
