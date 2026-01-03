"use client";

import type { Area } from "react-easy-crop";

export interface CropImageOptions {
  mimeType?: string;
  quality?: number;
  width?: number;
  height?: number;
  fileName?: string;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const getRadianAngle = (degree: number) => (degree * Math.PI) / 180;

const rotateSize = (width: number, height: number, rotation: number) => {
  const rotRad = getRadianAngle(rotation);
  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
};

export async function cropImageFromSource(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  options: CropImageOptions = {}
): Promise<File> {
  const image = await createImage(imageSrc);

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  if (!tempCtx) throw new Error("Canvas context is not available.");

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  tempCanvas.width = bBoxWidth;
  tempCanvas.height = bBoxHeight;

  tempCtx.translate(bBoxWidth / 2, bBoxHeight / 2);
  tempCtx.rotate(rotRad);
  tempCtx.drawImage(image, -image.width / 2, -image.height / 2);

  const targetWidth = options.width ?? pixelCrop.width;
  const targetHeight =
    options.height ??
    (options.width
      ? Math.round((options.width / pixelCrop.width) * pixelCrop.height)
      : pixelCrop.height);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context is not available.");

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.drawImage(
    tempCanvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  const mimeType = options.mimeType ?? "image/jpeg";
  const quality = options.quality ?? 0.92;

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Failed to crop the image."));
      },
      mimeType,
      quality
    );
  });

  const extension = mimeType.split("/")[1] ?? "jpg";
  const fileName =
    options.fileName ??
    `upload-${Date.now().toString(36)}.${extension.replace(/\?.*$/, "")}`;

  return new File([blob], fileName, { type: mimeType });
}
