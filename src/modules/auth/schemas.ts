import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("فرمت ایمیل صحیح نیست"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
});

export const registerSchema = z
  .object({
    email: z.string().email("فرمت ایمیل صحیح نیست"),
    password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
    confirmPassword: z.string(),
    firstName: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
    lastName: z.string().min(2, "نام خانوادگی باید حداقل ۲ کاراکتر باشد"),
    phoneNumber: z.string().optional(),
    role: z.enum(["Customer", "Vendor", "Admin"]).default("Customer"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تکرار آن یکسان نیستند",
    path: ["confirmPassword"],
  });

export type LoginSchemaInput = z.infer<typeof loginSchema>;
export type RegisterSchemaInput = z.infer<typeof registerSchema>;

