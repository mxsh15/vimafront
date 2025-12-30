export function normalizeSlug(input: string): string {
  if (!input) return "";

  let s = input
    .trim()
    .replace(/[\u200c\u200d]/g, "")
    .replace(/\s+/g, " ");

  s = s.replace(/[ _./\\]+/g, "-");
  s = s.replace(/[^0-9a-zA-Z\u0600-\u06FF-]+/g, "");
  s = s.replace(/-+/g, "-");
  s = s.replace(/^-+|-+$/g, "");
  return s.toLowerCase();
}
