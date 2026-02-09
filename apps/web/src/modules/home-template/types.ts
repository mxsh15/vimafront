import { z } from "zod";

export enum HomeSectionType {
  Stories = 1,
  HeroSlider = 2,
  QuickServices = 3,
  AmazingProducts = 4,
  BannerRow = 5,
  CategoryShowcase = 6,
  ProductSlider = 7,
  BrandsSlider = 8,
  BlogPosts = 9,
  Spacer = 10,
  FullWidthImage = 11,
  CategoryIcons = 12,
  TopBrands = 13,
  CategoryProducts4Column = 14,
  BestSellingProducts = 15,
  CategoryProductsSlider = 16
}

export const AdminHomeTemplateListItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  isSystem: z.boolean(),
  isEnabled: z.boolean(),
  isActiveForStore: z.boolean(),
  sectionsCount: z.number(),
  createdAtUtc: z.string(),
});

export type AdminHomeTemplateListItem = z.infer<typeof AdminHomeTemplateListItemSchema>;

export const AdminHomeTemplateSectionSchema = z.object({
  id: z.string().nullable().optional(),
  type: z.nativeEnum(HomeSectionType),
  title: z.string(),
  sortOrder: z.number(),
  isEnabled: z.boolean(),
  configJson: z.string(),
});
export type AdminHomeTemplateSection = z.infer<typeof AdminHomeTemplateSectionSchema>;

export const AdminHomeTemplateDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  thumbnailMediaAssetId: z.string().nullable().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  isSystem: z.boolean(),
  isEnabled: z.boolean(),
  isActiveForStore: z.boolean(),
  sections: z.array(AdminHomeTemplateSectionSchema),
});
export type AdminHomeTemplateDetail = z.infer<typeof AdminHomeTemplateDetailSchema>;

export const PublicHomeLayoutSchema = z.object({
  templateId: z.string().nullable().optional(),
  templateSlug: z.string().nullable().optional(),
  sections: z.array(
    z.object({
      type: z.nativeEnum(HomeSectionType),
      configJson: z.string(),
    })
  ),
});
export type PublicHomeLayout = z.infer<typeof PublicHomeLayoutSchema>;

// ------------------------------
// Config schemas (نمونه‌های واقعی برای شروع)
// ------------------------------
export const StoriesConfigSchema = z.object({
  boxed: z.boolean().default(true),
  take: z.number().int().min(1).max(50).default(12),
  title: z.string().default("استوری‌ها"),
});
export type StoriesConfig = z.infer<typeof StoriesConfigSchema>;

export function parseConfig<T>(schema: z.ZodType<T>, json: string, fallback: T): T {
  try {
    const obj = JSON.parse(json || "{}");
    return schema.parse(obj);
  } catch {
    return fallback;
  }
}

export const HeroSliderItemSchema = z.object({
  imageUrl: z.string().min(1),
  href: z.string().optional().nullable(),
});

export const HeroSliderConfigSchema = z.object({
  boxed: z.boolean().default(true),
  title: z.string().default(""),
  items: z.array(HeroSliderItemSchema).default([]),
});

export type HeroSliderConfig = z.infer<typeof HeroSliderConfigSchema>;

export const QuickServiceItemSchema = z.object({
  //categoryId: z.string().uuid().nullable().optional(),
  iconUrl: z.string().default(""),
  title: z.string().default(""),
  href: z.string().default(""),
});

export const QuickServicesConfigSchema = z.object({
  boxed: z.boolean().default(true),
  title: z.string().default(""),
  items: z.array(QuickServiceItemSchema).default([]),
});

export type QuickServicesConfig = z.infer<typeof QuickServicesConfigSchema>;

export const AmazingProductsConfigSchema = z.object({
  boxed: z.boolean().default(true),
  title: z.string().default("پیشنهاد شگفت‌انگیز"),
  take: z.number().int().min(1).max(50).default(20),
  categoryIds: z.array(z.string().uuid()).default([]).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  startAtUtc: z.string().datetime().nullable().default(null),
  endAtUtc: z.string().datetime().nullable().default(null),
});

export type AmazingProductsConfig = z.infer<typeof AmazingProductsConfigSchema>;

export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json || "{}") as T;
  } catch {
    return fallback;
  }
}


export const BannerRowItemSchema = z.object({
  imageUrl: z.string().min(1),
  alt: z.string().default(""),
  href: z.string().default(""),
});

export const BannerRowConfigSchema = z.object({
  boxed: z.boolean().default(true),
  columns: z.number().int().min(1).max(6).default(4),
  gap: z.number().int().min(0).max(32).default(12),
  items: z.array(BannerRowItemSchema).default([]),
});

export type BannerRowConfig = z.infer<typeof BannerRowConfigSchema>;



export const FullWidthImageConfigSchema = z.object({
  imageUrl: z.string().min(1).default(""),
  alt: z.string().default(""),
  href: z.string().default(""),
  fixedHeight: z.boolean().default(false),
  heightPx: z.number().int().min(120).max(1200).default(360),
});

export type FullWidthImageConfig = z.infer<typeof FullWidthImageConfigSchema>;


export const CategoryIconsItemSchema = z.object({
  categoryId: z.string().uuid(),
  imageUrl: z.string().optional().nullable(),
});

export const CategoryIconsConfigSchema = z.object({
  title: z.string().default("خرید بر اساس دسته‌بندی"),
  boxed: z.boolean().default(true),
  imageSize: z.number().optional(),
  items: z.array(CategoryIconsItemSchema).default([]),
});

export type CategoryIconsConfig = z.infer<typeof CategoryIconsConfigSchema>;


export const TopBrandsConfigSchema = z.object({
  boxed: z.boolean().optional().default(true),
  title: z.string().optional().default("محبوب‌ترین برندها"),
  brandIds: z.array(z.string().uuid()).optional().default([]),
});

export type TopBrandsConfig = z.infer<typeof TopBrandsConfigSchema>;


export const CategoryProducts4ColumnConfigSchema = z.object({
  boxed: z.boolean().optional().default(true),
  subtitle: z.string().optional().default("بر اساس سلیقه شما"),
  take: z.number().int().min(1).max(8).optional().default(4),
  columns: z
    .array(
      z.object({
        categoryId: z.string().uuid().nullable().optional().default(null),
        titleOverride: z.string().optional().default(""),
      })
    )
    .length(4)
    .default([
      { categoryId: null, titleOverride: "" },
      { categoryId: null, titleOverride: "" },
      { categoryId: null, titleOverride: "" },
      { categoryId: null, titleOverride: "" },
    ]),
});

export type CategoryProducts4ColumnConfig = z.infer<typeof CategoryProducts4ColumnConfigSchema>;


export const CategoryProductsSliderConfigSchema = z.object({
  boxed: z.boolean().default(true),
  title: z.string().default("محصولات منتخب"),
  take: z.number().int().min(1).max(50).default(12),
  categoryIds: z.array(z.string().uuid()).default([]),
  showAllHref: z.string().optional().default(""),
  showAllText: z.string().optional().default("نمایش همه"),
});

export type CategoryProductsSliderConfig = z.infer<typeof CategoryProductsSliderConfigSchema>;


export function safeJsonStringify(obj: any) {
  return JSON.stringify(obj ?? {}, null, 2);
}

export function parseBySchema<T>(schema: z.ZodType<T>, json: string, fallback: T): T {
  try {
    return schema.parse(JSON.parse(json || "{}"));
  } catch {
    return fallback;
  }
}



