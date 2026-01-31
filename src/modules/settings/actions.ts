"use server";

import { revalidatePath } from "next/cache";
import { updateSettings } from "./api";

export async function updateSettingsAction(formData: FormData) {
  const payload = {
    rowVersion: String(formData.get("rowVersion") || ""),

    storeName: String(formData.get("storeName") || "").trim(),
    logoUrl: (formData.get("logoUrl") as string) || null,

    supportEmail: (formData.get("supportEmail") as string) || null,
    supportPhone: (formData.get("supportPhone") as string) || null,

    instagramUrl: (formData.get("instagramUrl") as string) || null,
    telegramUrl: (formData.get("telegramUrl") as string) || null,
    whatsappUrl: (formData.get("whatsappUrl") as string) || null,
    youtubeUrl: (formData.get("youtubeUrl") as string) || null,
    linkedinUrl: (formData.get("linkedinUrl") as string) || null,

    defaultMetaTitle: (formData.get("defaultMetaTitle") as string) || null,
    defaultMetaDescription:
      (formData.get("defaultMetaDescription") as string) || null,
    canonicalBaseUrl: (formData.get("canonicalBaseUrl") as string) || null,
    robotsTxt: (formData.get("robotsTxt") as string) || null,
    sitemapEnabled: String(formData.get("sitemapEnabled") || "true") === "true",

    timeZoneId: String(formData.get("timeZoneId") || "Asia/Tehran").trim(),
    dateFormat: String(formData.get("dateFormat") || "yyyy/MM/dd").trim(),

    multiVendorEnabled: String(formData.get("multiVendorEnabled") || "true") === "true",
  };

  await updateSettings(payload);
  revalidatePath("/admin/settings");
}
