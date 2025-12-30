import { z } from "zod";

export const vendorUpsertSchema = z.object({
  storeName: z.string().min(2),
  legalName: z.string().optional().nullable(),
  nationalId: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  mobileNumber: z.string().optional().nullable(),
  defaultCommissionPercent: z.number().min(0).max(100).optional().nullable(),
  ownerUserId: z.string().uuid().optional().nullable(),
  status: z.boolean(),
});

export type VendorUpsertInput = z.infer<typeof vendorUpsertSchema>;
