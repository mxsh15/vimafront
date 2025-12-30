export type StoreSettingsDto = {
  id: string;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  isDeleted: boolean;
  rowVersion: string;

  storeName: string;
  logoUrl: string | null;
  supportEmail: string | null;
  supportPhone: string | null;

  instagramUrl: string | null;
  telegramUrl: string | null;
  whatsappUrl: string | null;
  youtubeUrl: string | null;
  linkedinUrl: string | null;

  defaultMetaTitle: string | null;
  defaultMetaDescription: string | null;
  canonicalBaseUrl: string | null;
  robotsTxt: string | null;
  sitemapEnabled: boolean;

  timeZoneId: string;
  dateFormat: string;
};
