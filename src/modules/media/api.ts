import type { PagedResult } from "@/modules/brand/types";
import type {
  ListMediaParams,
  MediaAssetDto,
  MediaUpdateInput,
  MediaUsage,
} from "./types";
import { apiFetch } from "@/lib/api";
import { ENV } from "@/lib/env";

export async function listMedia({
  page = 1,
  pageSize = 40,
  usage,
  kind,
  q,
}: ListMediaParams = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (usage) params.set("usage", usage);
  if (kind) params.set("kind", kind);
  if (q && q.trim()) params.set("q", q.trim());
  const url = `media?${params.toString()}`;
  return apiFetch<PagedResult<MediaAssetDto>>(url);
}

export async function getMedia(id: string) {
  return apiFetch<MediaAssetDto>(`media/${id}`);
}

export async function deleteMedia(id: string) {
  await apiFetch<void>(`media/${id}`, { method: "DELETE" });
}

export async function updateMedia(id: string, input: MediaUpdateInput) {
  return apiFetch<MediaAssetDto>(`media/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function uploadMediaOnServer(
  file: File,
  usage: MediaUsage = "General"
) {
  if (typeof window !== "undefined") {
    throw new Error(
      "uploadMediaOnServer must be used on the server (e.g. in a server action)."
    );
  }

  if (!ENV.BACKEND_URL) {
    throw new Error("BACKEND_URL is not configured");
  }

  const base = ENV.BACKEND_URL.replace(/\/+$/, "");
  const url = `${base}/media/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("usage", usage);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Upload failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const dto = (await res.json()) as MediaAssetDto;
  return dto;
}
