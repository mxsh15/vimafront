import { UpsertPayload } from "./types";

export function toBool(v: FormDataEntryValue | null) {
  if (v == null) return false;
  const s = String(v).toLowerCase();
  return s === "true" || s === "1" || s === "on" || s === "yes";
}

export function pick(form: FormData): UpsertPayload {
  const id = String(form.get("id") ?? "").trim();

  const title = String(form.get("title") ?? "").trim();
  if (!title) throw new Error("title is required");

  const slugRaw = String(form.get("slug") ?? "").trim();
  const logoRaw = String(form.get("logoUrl") ?? "").trim();

  return {
    id: id || undefined,
    title,
    slug: slugRaw ? slugRaw : null,
    logoUrl: logoRaw ? logoRaw : null,
    isActive: toBool(form.get("isActive")),
  };
}

