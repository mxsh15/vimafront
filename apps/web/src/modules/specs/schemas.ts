import { z } from "zod";
import { AttributeValueType } from "./types";

export const attributeSetSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "نام حداقل ۲ کاراکتر باشد"),
  description: z.string().max(500).nullable().optional(),
  rowVersion: z.string().nullable().optional(),
});

export type AttributeSetUpsertInput = z.infer<typeof attributeSetSchema>;

// 👇 اینجا attributeIds را اضافه می‌کنیم
export const attributeGroupSchema = z.object({
  id: z.string().uuid().optional(),
  attributeSetId: z.string().uuid({ message: "انتخاب ست ویژگی الزامی است" }),
  name: z.string().min(2, "نام حداقل ۲ کاراکتر باشد"),
  sortOrder: z.coerce.number().int().min(0).default(0),
  rowVersion: z.string().nullable().optional(),

  // آرایه آیدی ویژگی‌ها که از فرم می‌آید
  attributeIds: z.array(z.string().uuid()).optional().default([]),
});

export type AttributeGroupUpsertInput = z.infer<typeof attributeGroupSchema>;

export const productAttributeSchema = z.object({
  id: z.string().uuid().optional(),
  attributeGroupId: z.string().uuid(),
  name: z.string().min(2),
  key: z
    .string()
    .min(2)
    .regex(/^[a-zA-Z0-9_.-]+$/, {
      message: "Key فقط حروف لاتین، عدد و ._- باشد",
    }),
  unit: z.string().max(50).nullable().optional(),
  valueType: z.nativeEnum(AttributeValueType),
  isRequired: z.boolean().optional().default(false),
  isVariantLevel: z.boolean().optional().default(false),
  isFilterable: z.boolean().optional().default(false),
  isComparable: z.boolean().optional().default(false),
  sortOrder: z.coerce.number().int().min(0).default(0),
  rowVersion: z.string().nullable().optional(),
});

export type ProductAttributeUpsertInput = z.infer<
  typeof productAttributeSchema
>;
