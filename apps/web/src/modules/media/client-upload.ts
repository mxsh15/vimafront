"use client";

import type { MediaAssetDto } from "./types";

export function uploadMediaWithProgress(
  file: File,
  usage: string,
  onProgress: (p: number) => void
): Promise<MediaAssetDto> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/media/upload", true);

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const percent = Math.round((e.loaded / e.total) * 100);
      onProgress(percent);
    };

    xhr.onload = () => {
      try {
        if (xhr.status < 200 || xhr.status >= 300) {
          return reject(
            new Error(`Upload failed: ${xhr.status} ${xhr.responseText}`)
          );
        }
        resolve(JSON.parse(xhr.responseText));
      } catch (err) {
        reject(err);
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));

    const form = new FormData();
    form.append("file", file);
    form.append("usage", usage);

    xhr.send(form);
  });
}
