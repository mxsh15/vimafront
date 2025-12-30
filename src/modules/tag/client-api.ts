import { bffFetch } from "@/lib/fetch-bff";
import type { TagListItemDto } from "./types";

function slugifyTagName(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      // همه فاصله‌ها و آندرلاین‌ها → خط تیره
      .replace(/[\s_]+/g, "-")
      // کاراکترهای غیر حروف/عدد/فارسی/خط تیره حذف شوند
      .replace(/[^a-z0-9\u0600-\u06FF-]/g, "")
      // چند خط تیره‌ی پشت‌سرهم → یکی
      .replace(/-+/g, "-")
      // خط تیره اول و آخر حذف
      .replace(/^-+|-+$/g, "")
  );
}

export async function createTagClient(name: string): Promise<TagListItemDto> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("نام برچسب خالی است");

  const slug = slugifyTagName(trimmed);
  if (!slug) {
    throw new Error("امکان ساخت اسلاگ معتبر از نام برچسب وجود ندارد");
  }

  const payload = {
    name: trimmed,
    slug,
  };

  return bffFetch<TagListItemDto>("tags", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
