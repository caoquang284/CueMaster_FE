"use client";

export interface UploadOptions {
  name?: string;
  expirationSeconds?: number;
}

export interface UploadResult {
  url: string;
  viewerUrl?: string | null;
  deleteUrl?: string | null;
  thumbUrl?: string | null;
  mediumUrl?: string | null;
  width?: number;
  height?: number;
  size?: number;
  originalFilename?: string;
}

export const sanitizeFileName = (name: string) =>
  name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 100) || "image";

export async function uploadImageViaApi(
  file: Blob | File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const formData = new FormData();

  const baseName = options.name
    ? sanitizeFileName(options.name)
    : file instanceof File
    ? sanitizeFileName(file.name.split(".")[0] ?? "image")
    : "image";

  const extension =
    file instanceof File && file.name.includes(".")
      ? file.name.split(".").pop()
      : file.type.split("/").pop();

  const normalizedFile =
    file instanceof File
      ? file
      : new File([file], `${baseName}.${extension ?? "jpg"}`, {
          type: file.type || "image/jpeg",
        });

  formData.append("file", normalizedFile, normalizedFile.name);
  formData.append("name", baseName);

  if (options.expirationSeconds) {
    formData.append(
      "expiration",
      String(Math.max(options.expirationSeconds, 60))
    );
  }

  const response = await fetch("/api/media/upload", {
    method: "POST",
    body: formData,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (typeof payload?.error === "string" && payload.error) ||
      (typeof payload?.details?.error?.message === "string" &&
        payload.details.error.message) ||
      (typeof payload?.details?.data?.error?.message === "string" &&
        payload.details.data.error.message) ||
      "Không thể tải ảnh lên imgbb.";

    if (payload?.details) {
      // Surface raw response in console so developers can debug quickly.
      console.error("[uploadImageViaApi] details:", payload.details);
    }

    throw new Error(message);
  }

  return payload as UploadResult;
}
