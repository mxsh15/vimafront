import { z } from "zod";

export const userUpsertSchema = z.object({
  email: z.string().email("ایمیل معتبر نیست"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد").optional(),
  firstName: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  lastName: z.string().min(2, "نام خانوادگی باید حداقل ۲ کاراکتر باشد"),
  phoneNumber: z.string().optional().nullable(),
  role: z.number().int().min(0).max(2), // UserRole enum
  roleId: z.string().uuid().optional().nullable(),
  vendorIds: z.array(z.string().uuid()).optional().default([]),
  status: z.boolean().optional(),
});

export type UserUpsertInput = z.infer<typeof userUpsertSchema>;
