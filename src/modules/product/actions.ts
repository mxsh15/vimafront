"use server";

import { revalidatePath } from "next/cache";
import { productUpsertSchema } from "./schemas";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  hardDeleteProduct,
} from "./api";

export async function upsertProductFormAction(formData: FormData) {
  const categoryIdsRaw = formData.getAll("categoryIds") as string[];
  const categoryIds = categoryIdsRaw
    .map((x) => String(x).trim())
    .filter(Boolean);

  const galleryImageUrls = formData
    .getAll("galleryImageUrls")
    .map((v) => String(v).trim())
    .filter((v) => v.length > 0);

  const tagIdsRaw = formData.getAll("tagIds") as string[];
  const tagIds = tagIdsRaw.map((x) => String(x).trim()).filter(Boolean);

  const isVariantProductRaw = formData.get("isVariantProduct");
  const variantsJsonRaw = formData.get("variantsJson");

  const title = String(formData.get("title") || "").trim();
  const shortTitleRaw = (formData.get("shortTitle") as string) || "";
  const shortTitle = shortTitleRaw.trim() || title;

  const includeInSitemap = formData.get("includeInSitemap") === "on";
  const autoGenerateHeadTags = formData.get("autoGenerateHeadTags") === "on";
  const autoGenerateSnippet = formData.get("autoGenerateSnippet") === "on";
  const seoMetaRobots = (formData.get("seoMetaRobots") as string) || null;
  const seoSchemaJson = (formData.get("seoSchemaJson") as string) || null;

  // --- مدیریت موجودی ---
  const manageStockRaw = formData.get("manageStock");
  const manageStock = manageStockRaw === "on";

  const stockStatusRaw = formData.get("stockStatus");
  const stockStatus =
    stockStatusRaw && String(stockStatusRaw).trim() !== ""
      ? Number(stockStatusRaw)
      : undefined;

  // محصول متغیر است یا نه؟
  const isVariantProduct =
    (isVariantProductRaw && isVariantProductRaw.toString() === "true") || false;

  // مقدار فیلد موجودی انبار محصول ساده
  const stockQuantityRaw = formData.get("stockQuantity");
  const stock =
    !isVariantProduct && manageStock
      ? stockQuantityRaw && String(stockQuantityRaw).trim() !== ""
        ? Number(stockQuantityRaw)
        : 0
      : 0;

  const data = {
    id: (formData.get("id") as string) || undefined,
    title,
    shortTitle,
    englishTitle: (formData.get("englishTitle") as string) || null,
    slug: String(formData.get("slug") || "").trim(),
    sku: (formData.get("sku") as string) || null,
    excerpt: (formData.get("excerpt") as string) || null,
    descriptionHtml: (formData.get("descriptionHtml") as string) || null,
    isFeatured: formData.get("isFeatured") === "on",
    status: Number(formData.get("status") ?? "1"),
    brandId: (formData.get("brandId") as string)?.trim() || null,
    ownerVendorId: formData.get("ownerVendorId") as string,
    seoTitle: (formData.get("seoTitle") as string) || null,
    seoMetaDescription: (formData.get("seoMetaDescription") as string) || null,
    seoKeywords: (formData.get("seoKeywords") as string) || null,
    seoCanonicalUrl: (formData.get("seoCanonicalUrl") as string) || null,
    includeInSitemap,
    autoGenerateHeadTags,
    autoGenerateSnippet,
    seoMetaRobots,
    seoSchemaJson,
    saleModel: Number(formData.get("saleModel") ?? "0"),
    vendorCommissionPercent:
      formData.get("vendorCommissionPercent") !== null &&
      String(formData.get("vendorCommissionPercent")).trim() !== ""
        ? Number(formData.get("vendorCommissionPercent"))
        : null,
    tagIds,
    primaryImageUrl:
      ((formData.get("primaryImageUrl") as string) || "").trim() || null,
    galleryImageUrls,
    price: Number(formData.get("price") ?? "0"),
    discountPrice:
      formData.get("discountPrice") &&
      String(formData.get("discountPrice")).trim() !== ""
        ? Number(formData.get("discountPrice"))
        : null,
    stock: Number(formData.get("stock") ?? "0"),
    rowVersion: (formData.get("rowVersion") as string) || null,
    categoryIds,
    isVariantProduct,
    variantsJson:
      typeof variantsJsonRaw === "string" && variantsJsonRaw.trim() !== ""
        ? variantsJsonRaw
        : null,
    manageStock,
    stockStatus,
  };

  if (data.isVariantProduct) {
    data.price = 0;
    data.discountPrice = null;
    data.stock = 0;
  }

  const parsed = productUpsertSchema.safeParse(data);
  if (!parsed.success) {
    console.error(parsed.error.issues);
    const firstIssue = parsed.error.issues[0];
    throw new Error(firstIssue?.message ?? "اطلاعات نامعتبر است");
  }

  if (parsed.data.id) {
    await updateProduct(parsed.data.id, parsed.data);
  } else {
    await createProduct(parsed.data);
  }

  revalidatePath("/admin/products");
}

export async function deleteProductAction(id: string) {
  await deleteProduct(id);
  revalidatePath("/admin/products");
}

export async function restoreProductAction(id: string) {
  await restoreProduct(id);
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/trash");
}

export async function hardDeleteProductAction(id: string) {
  await hardDeleteProduct(id);
  revalidatePath("/admin/products/trash");
}
