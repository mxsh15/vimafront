import type {
  ListMediaParams,
  MediaAssetDto,
  MediaUpdateInput,
  MediaUsage,
} from "./types";

export async function listMediaFromClient(params: ListMediaParams) {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("pageSize", String(params.pageSize ?? 40));
  //if (params.usage) searchParams.set("usage", params.usage);
  //if (params.kind) searchParams.set("kind", params.kind);
  if (params.q) searchParams.set("q", params.q);

  const res = await fetch(`/api/media?${searchParams.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `Media list failed: ${res.status} ${res.statusText} - ${txt}`
    );
  }

  return (await res.json()) as {
    items: MediaAssetDto[];
    page: number;
    pageSize: number;
    totalCount: number;
  };
}

export async function updateMediaFromClient(
  id: string,
  input: MediaUpdateInput
) {
  const res = await fetch(`/api/media/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `Media update failed: ${res.status} ${res.statusText} - ${txt}`
    );
  }

  return (await res.json()) as MediaAssetDto;
}

export async function uploadMediaFromClient(
  file: File,
  usage: MediaUsage = "General"
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("usage", usage);

  const res = await fetch(`/api/media/upload`, {
    method: "POST",
    body: formData,
  });

  const text = await res.text().catch(() => "");

  if (!res.ok) {
    console.error("Media upload failed raw body:", text);
    throw new Error(
      `Media upload failed: ${res.status} ${res.statusText} - ${text}`
    );
  }

  return JSON.parse(text) as MediaAssetDto;
}

export async function deleteMediaFromClient(id: string) {
  const res = await fetch(`/api/media/${id}`, {
    method: "DELETE",
  });

  if (res.ok || res.status === 204 || res.status === 404) {
    return;
  }

  const txt = await res.text().catch(() => "");
  throw new Error(
    `Media delete failed: ${res.status} ${res.statusText} - ${txt}`
  );
}


export async function getMediaByIdFromClient(id: string) {
  const res = await fetch(`/api/media/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Get media failed: ${res.status} ${res.statusText} - ${txt}`);
  }

  return (await res.json()) as MediaAssetDto;
}
