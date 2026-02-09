import { z } from "zod";

const Schema = z.object({
  BACKEND_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  // اضافه کردن متغیر برای هندل کردن بیس مسیر API داخلی اگر لازم باشد
  NEXT_PUBLIC_API_BASE: z.string().optional(),
});

const raw = {
  BACKEND_URL: process.env.BACKEND_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
};

const parsed = Schema.safeParse(raw);

if (!parsed.success) {
  const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
  console.warn(
    "[env] Invalid or missing envs:",
    missing,
    "- falling back to defaults if any."
  );
}

const BACKEND_URL =
  parsed.success && parsed.data.BACKEND_URL
    ? parsed.data.BACKEND_URL
    : process.env.NEXT_PUBLIC_API_BASE || "";

const NEXT_PUBLIC_SITE_URL =
  (parsed.success && parsed.data.NEXT_PUBLIC_SITE_URL) ||
  "http://localhost:3000";

export const ENV = {
  BACKEND_URL,
  NEXT_PUBLIC_SITE_URL,
};