import { z } from "zod";

export const tagSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "نام حداقل ۲ کاراکتر باشد"),
  slug: z
    .string()
    .min(2, "نامک حداقل ۲ کاراکتر باشد")
    .regex(/^[a-z0-9-]+$/, "نامک باید فقط حروف کوچک، عدد و خط تیره باشد"),
  rowVersion: z.string().nullable().optional(),
});

export type TagUpsertInput = z.infer<typeof tagSchema>;
