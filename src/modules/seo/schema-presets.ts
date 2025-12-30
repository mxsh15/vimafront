import { resolveMediaUrl } from "@/modules/media/resolve-url";

export type SchemaPresetId =
  | "product"
  | "article"
  | "blogPosting"
  | "faq"
  | "course"
  | "event"
  | "howTo"
  | "video"
  | "software";

export type SchemaPreset = {
  id: SchemaPresetId;
  label: string;
  schemaType: string;
  description: string;
};

export const schemaPresets: SchemaPreset[] = [
  {
    id: "product",
    label: "محصول",
    schemaType: "Product",
    description: "محصولات فروشگاهی، کالای فیزیکی یا دیجیتال",
  },
  {
    id: "article",
    label: "مقاله",
    schemaType: "Article",
    description: "مقاله‌های خبری یا تحلیلی",
  },
  {
    id: "blogPosting",
    label: "بلاگ پست",
    schemaType: "BlogPosting",
    description: "محتوای وبلاگی معمولی",
  },
  {
    id: "faq",
    label: "سوالات متداول (FAQ)",
    schemaType: "FAQPage",
    description: "لیست سوال و جواب",
  },
  {
    id: "course",
    label: "دوره آموزشی",
    schemaType: "Course",
    description: "دوره‌های آموزشی و کلاس‌ها",
  },
  {
    id: "event",
    label: "رویداد",
    schemaType: "Event",
    description: "وبینار، همایش، ورکشاپ و ...",
  },
  {
    id: "howTo",
    label: "راهنمای گام‌به‌گام",
    schemaType: "HowTo",
    description: "آموزش مرحله به مرحله",
  },
  {
    id: "video",
    label: "ویدیو",
    schemaType: "VideoObject",
    description: "ویدیوهای آموزشی یا تبلیغاتی",
  },
  {
    id: "software",
    label: "نرم‌افزار / اپ",
    schemaType: "SoftwareApplication",
    description: "نرم‌افزار، اپلیکیشن، SaaS",
  },
];

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

// کانتکست ورودی که از هر فرم می‌گیری
export type SchemaBuildContext = {
  origin: string; // https://site.com
  slug?: string; // /my-product
  title?: string;
  descriptionHtml?: string;
  fallbackMetaDescription?: string;
  imagePath?: string | null; // /uploads/...
  price?: number | null;
  createdAtUtc?: string | Date | null;
  updatedAtUtc?: string | Date | null;
};

export function buildSchemaTemplate(
  id: SchemaPresetId,
  ctx: SchemaBuildContext
) {
  const {
    origin,
    slug,
    title,
    descriptionHtml,
    fallbackMetaDescription,
    imagePath,
    price,
    createdAtUtc,
    updatedAtUtc,
  } = ctx;

  const url = origin + (slug ? `/${slug}` : "");
  const name = title ?? "";
  const description = stripHtml(
    descriptionHtml || fallbackMetaDescription || ""
  );
  const imageUrl = imagePath ? resolveMediaUrl(imagePath) : undefined;

  switch (id) {
    case "product":
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        image: imageUrl ? [imageUrl] : undefined,
        offers: {
          "@type": "Offer",
          url,
          priceCurrency: "IRR",
          price: price ?? 0,
          availability: "https://schema.org/InStock",
        },
      };

    case "article":
    case "blogPosting":
      return {
        "@context": "https://schema.org",
        "@type": id === "article" ? "Article" : "BlogPosting",
        headline: name,
        description,
        mainEntityOfPage: url,
        datePublished: createdAtUtc ?? undefined,
        dateModified: updatedAtUtc ?? undefined,
        image: imageUrl ? [imageUrl] : undefined,
      };

    case "faq":
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "سوال متداول شماره ۱ را اینجا بنویسید",
            acceptedAnswer: {
              "@type": "Answer",
              text: "پاسخ مربوط به این سوال را اینجا بنویسید.",
            },
          },
        ],
      };

    case "course":
      return {
        "@context": "https://schema.org",
        "@type": "Course",
        name,
        description,
        provider: {
          "@type": "Organization",
          name: "نام آموزشگاه / برند خودتان",
        },
      };

    case "event":
      return {
        "@context": "https://schema.org",
        "@type": "Event",
        name,
        description,
        url,
        startDate: "2025-01-01T20:00:00+03:30",
        endDate: "2025-01-01T22:00:00+03:30",
        eventStatus: "https://schema.org/EventScheduled",
      };

    case "howTo":
      return {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name,
        description,
        step: [
          {
            "@type": "HowToStep",
            text: "گام اول را اینجا بنویسید",
          },
        ],
      };

    case "video":
      return {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name,
        description,
        thumbnailUrl: imageUrl ? [imageUrl] : [],
        uploadDate: "2025-01-01T20:00:00+03:30",
        contentUrl: url,
      };

    case "software":
      return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name,
        description,
        applicationCategory: "BusinessApplication",
        offers: {
          "@type": "Offer",
          priceCurrency: "IRR",
          price: price ?? 0,
        },
      };
  }
}
