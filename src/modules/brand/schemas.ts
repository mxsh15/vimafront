import { z } from "zod";
export const brandUpsertSchema = z.object({
  title: z.string().min(2),
  englishTitle: z.string().optional().nullable(),
  slug: z.string().min(2),
  websiteUrl: z.string().url().optional().nullable(),
  contentHtml: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  seo: z.any().optional().nullable(),
  rowVersion: z.string().optional().nullable(),
});
export type BrandUpsertInput = z.infer<typeof brandUpsertSchema>;
