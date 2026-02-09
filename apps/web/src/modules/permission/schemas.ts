import { z } from "zod";

export const permissionUpsertSchema = z.object({
  name: z.string().min(2, "نام دسترسی باید حداقل ۲ کاراکتر باشد"),
  displayName: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  status: z.boolean().optional(),
});

export type PermissionUpsertInput = z.infer<typeof permissionUpsertSchema>;

