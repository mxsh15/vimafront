"use server";

import { revalidateTag } from "next/cache";
import { productUpsertSchema } from "./schemas";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  hardDeleteProduct,
} from "./api";

const TAGS = {
  list: "products",
  trash: "products:trash",
  detail: (id: string) => `product:${id}`,
};

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

  const manageStock = formData.get("manageStock") === "on";

  const stockStatusRaw = formData.get("stockStatus");
  const stockStatus =
    stockStatusRaw && String(stockStatusRaw).trim() !== ""
      ? Number(stockStatusRaw)
      : undefined;

  const isVariantProduct =
    (isVariantProductRaw && isVariantProductRaw.toString() === "true") || false;

  const stockQuantityRaw = formData.get("stockQuantity");
  const stock =
    !isVariantProduct && manageStock
      ? stockQuantityRaw && String(stockQuantityRaw).trim() !== ""
        ? Number(stockQuantityRaw)
        : 0
      : 0;

  const brandIdRaw = String(formData.get("brandId") ?? "").trim();
  const brandId = brandIdRaw.length ? brandIdRaw : null;

  const ownerVendorIdRaw = String(formData.get("ownerVendorId") ?? "").trim();
  const ownerVendorId = ownerVendorIdRaw.length ? ownerVendorIdRaw : null;

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
    brandId,
    ownerVendorId,
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
    const firstIssue = parsed.error.issues[0];
    throw new Error(firstIssue?.message ?? "اطلاعات نامعتبر است");
  }

  if (parsed.data.id) {
    await updateProduct(parsed.data.id, parsed.data);
    revalidateTag(TAGS.detail(parsed.data.id), "max");
  } else {
    await createProduct(parsed.data);
  }

  revalidateTag(TAGS.list, "max");
  revalidateTag(TAGS.trash, "max");
}

export async function deleteProductAction(id: string) {
  await deleteProduct(id);
  revalidateTag(TAGS.list, "max");
  revalidateTag(TAGS.trash, "max");
  revalidateTag(TAGS.detail(id), "max");
}

export async function restoreProductAction(id: string) {
  await restoreProduct(id);
  revalidateTag(TAGS.list, "max");
  revalidateTag(TAGS.trash, "max");
  revalidateTag(TAGS.detail(id), "max");
}

export async function hardDeleteProductAction(id: string) {
  await hardDeleteProduct(id);
  revalidateTag(TAGS.trash, "max");
  revalidateTag(TAGS.detail(id), "max");
}
