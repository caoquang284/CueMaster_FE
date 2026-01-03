import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const sanitizeFileName = (name: string) =>
  name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 100) || "image";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing file in upload request." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image uploads are supported." },
        { status: 415 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `Image is too large (>${Math.round(
            MAX_FILE_SIZE_BYTES / (1024 * 1024)
          )}MB).`,
        },
        { status: 413 }
      );
    }

    const apiKey = process.env.IMGBB_API_KEY;
    // 🔑 Set IMGBB_API_KEY=your_imgbb_key in .env.local before calling this route.
    if (!apiKey) {
      return NextResponse.json(
        { error: "IMGBB_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const requestedName = form.get("name");
    const expiration = form.get("expiration");

    const payload = new URLSearchParams();
    payload.append("image", base64);
    payload.append(
      "name",
      typeof requestedName === "string" && requestedName.trim()
        ? sanitizeFileName(requestedName)
        : sanitizeFileName(file.name.split(".")[0] ?? "image")
    );

    if (typeof expiration === "string" && expiration.trim()) {
      payload.append("expiration", expiration.trim());
    }

    const imgbbResponse = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: payload,
      }
    );

    const imgbbPayload = await imgbbResponse.json().catch(() => null);

    if (!imgbbResponse.ok || !imgbbPayload?.success) {
      const errorMessage =
        imgbbPayload?.error?.message ??
        imgbbPayload?.data?.error?.message ??
        "Failed to upload image to imgbb.";

      return NextResponse.json(
        {
          error: errorMessage,
          details: imgbbPayload ?? null,
        },
        { status: imgbbResponse.status || 500 }
      );
    }

    const data = imgbbPayload.data;

    return NextResponse.json({
      url: data.url,
      viewerUrl: data.url_viewer,
      deleteUrl: data.delete_url ?? null,
      thumbUrl: data.thumb?.url ?? null,
      mediumUrl: data.medium?.url ?? null,
      width: Number(data.image?.width ?? data.width ?? 0),
      height: Number(data.image?.height ?? data.height ?? 0),
      size: Number(data.size ?? 0),
      originalFilename: data.image?.filename ?? file.name,
    });
  } catch (error) {
    console.error("[api/media/upload]", error);
    return NextResponse.json(
      { error: "Unexpected server error while uploading the image." },
      { status: 500 }
    );
  }
}
