import { z } from "zod";

export const roleUpsertSchema = z.object({
  name: z.string().min(2, "نام نقش باید حداقل ۲ کاراکتر باشد"),
  description: z.string().optional().nullable(),
  permissionIds: z.array(z.string().uuid()).optional().default([]),
  status: z.boolean().optional(),
});

export type RoleUpsertInput = z.infer<typeof roleUpsertSchema>;

