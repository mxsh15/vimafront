import { z } from "zod";
import { ProductStatus, ProductSaleModel } from "./types";

export const productUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(2, "عنوان حداقل ۲ کاراکتر باشد"),
  englishTitle: z.string().max(300).nullable().optional(),
  slug: z
    .string()
    .min(2, "نامک الزامی است")
    .regex(/^[a-z0-9-]+$/, { message: "نامک باید لاتین و با - باشد" }),
  sku: z.string().max(120).nullable().optional(),
  descriptionHtml: z.string().nullable().optional(),
  primaryImageUrl: z.string().nullable(),
  isFeatured: z.boolean().optional().default(false),
  status: z.nativeEnum(ProductStatus),
  brandId: z.string().uuid().nullable().optional(),
  ownerVendorId: z.string().uuid().nullable().optional(),
  seoTitle: z.string().max(300).nullable().optional(),
  seoMetaDescription: z.string().max(500).nullable().optional(),
  seoKeywords: z.string().max(500).nullable().optional(),
  seoCanonicalUrl: z.string().max(500).nullable().optional(),

  saleModel: z.nativeEnum(ProductSaleModel),
  vendorCommissionPercent: z.coerce
    .number()
    .min(0)
    .max(100)
    .nullable()
    .optional(),
  price: z.coerce.number().min(0, "قیمت نمی‌تواند منفی باشد"),
  discountPrice: z.coerce
    .number()
    .min(0, "تخفیف اشتباه است")
    .nullable()
    .optional(),
  stock: z.coerce.number().int().min(0, "موجودی نامعتبر است"),
  rowVersion: z.string().nullable().optional(),
  categoryIds: z.array(z.string().uuid()).optional().default([]),
  galleryImageUrls: z.array(z.string()).optional(),
  tagIds: z.array(z.string().uuid()).default([]),
  isVariantProduct: z.boolean().optional().default(false),
  variantsJson: z.string().nullable().optional(),
  shortTitle: z.string().max(300).nullable().optional(),
  allowCustomerReviews: z.boolean().optional().default(true),
  allowCustomerQuestions: z.boolean().optional().default(true),
  autoGenerateHeadTags: z.boolean().optional().default(true),
  autoGenerateSnippet: z.boolean().optional().default(true),
  includeInSitemap: z.boolean().optional().default(true),
  seoMetaRobots: z.string().max(500).nullable().optional(),
  seoSchemaJson: z.string().nullable().optional(),
  productType: z.number().optional(),
  manageStock: z.boolean().optional().default(false),
  stockStatus: z.number().optional().default(0),
  backorderPolicy: z.number().optional().default(0),
  lowStockThreshold: z.coerce.number().int().min(0).nullable().optional(),
  stockQuantity: z.coerce
    .number()
    .int()
    .min(0, "موجودی نامعتبر است")
    .nullable()
    .optional(),
});
// .superRefine((val, ctx) => {
//   if ((val.price ?? 0) > 0 && !val.ownerVendorId) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       path: ["ownerVendorId"],
//       message: "انتخاب فروشنده برای ثبت قیمت الزامی است.",
//     });
//   }
//});

export type ProductUpsertSchemaInput = z.infer<typeof productUpsertSchema>;
