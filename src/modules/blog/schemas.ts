import { z } from "zod";

export const blogPostUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(2, "عنوان حداقل ۲ کاراکتر باشد"),
  slug: z
    .string()
    .min(2, "نامک الزامی است")
    .regex(/^[a-z0-9-]+$/, { message: "نامک باید لاتین و با - باشد" }),
  summary: z.string().nullable().optional(),
  contentHtml: z.string().nullable().optional(),

  thumbnailMediaId: z.string().uuid().nullable().optional(),

  status: z.coerce.number().int().min(0).max(3),
  visibility: z.coerce.number().int(),

  categoryIds: z.array(z.string().uuid()).default([]),
  tagIds: z.array(z.string().uuid()).default([]),

  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  metaKeywords: z.string().nullable().optional(),
  canonicalUrl: z.string().nullable().optional(),
  openGraphTitle: z.string().nullable().optional(),
  openGraphDescription: z.string().nullable().optional(),
  openGraphImageUrl: z.string().nullable().optional(),
  seoSchemaJson: z
    .string()
    .nullable()
    .optional()
    .refine((val) => {
      if (!val || !val.trim()) return true;
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    }, "Schema JSON باید یک JSON معتبر باشد."),
  autoGenerateHeadTags: z.coerce.boolean().default(true),
  includeInSitemap: z.coerce.boolean().default(true),
  authorId: z.string().uuid().nullable().optional(),
});

export type BlogPostUpsertSchemaInput = z.infer<typeof blogPostUpsertSchema>;
