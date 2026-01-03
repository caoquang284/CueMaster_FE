"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { ImageIcon, Loader2, UploadCloud, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  sanitizeFileName,
  uploadImageViaApi,
  type UploadResult,
} from "@/lib/services/imgbb";
import { cropImageFromSource } from "@/lib/utils/crop-image";

type ImageUploaderProps = {
  label?: string;
  description?: string;
  value?: string;
  onChange?: (url: string | undefined, meta?: UploadResult) => void;
  onUploadComplete?: (meta: UploadResult) => void;
  aspect?: number;
  cropShape?: "rect" | "round";
  outputWidth?: number;
  outputHeight?: number;
  mimeType?: string;
  quality?: number;
  expirationSeconds?: number;
  accept?: string;
  maxFileSize?: number;
  allowUrlInput?: boolean;
  enableRotation?: boolean;
  disabled?: boolean;
  className?: string;
};

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;

export function ImageUploader({
  label,
  description,
  value,
  onChange,
  onUploadComplete,
  aspect = 1,
  cropShape = "rect",
  outputWidth,
  outputHeight,
  mimeType,
  quality,
  expirationSeconds,
  accept = "image/*",
  maxFileSize = DEFAULT_MAX_SIZE,
  allowUrlInput = true,
  enableRotation = true,
  disabled = false,
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const currentPreview = useMemo(
    () => previewUrl ?? value ?? "",
    [previewUrl, value]
  );

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = "";

    if (!file.type.startsWith("image/")) {
      toast({
        title: "File không hợp lệ",
        description: "Vui lòng chọn đúng định dạng hình ảnh.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > maxFileSize) {
      toast({
        title: "Ảnh quá lớn",
        description: `Giới hạn hiện tại là ${Math.round(
          maxFileSize / (1024 * 1024)
        )}MB.`,
        variant: "destructive",
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setIsCropperOpen(true);
  };

  const handleCropComplete = useCallback(
    (_: Area, areaPixels: Area) => {
      setCroppedAreaPixels(areaPixels);
    },
    []
  );

  const resetFileState = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const closeCropper = () => {
    setIsCropperOpen(false);
    resetFileState();
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile || !previewUrl) return;
    if (!croppedAreaPixels) {
      toast({
        title: "Hình ảnh chưa sẵn sàng",
        description: "Vui lòng đợi ảnh tải xong trước khi lưu.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      const safeBaseName = sanitizeFileName(
        selectedFile.name.split(".")[0] ?? "image"
      );
      const targetMime = mimeType ?? (selectedFile.type || "image/jpeg");

      const croppedFile = await cropImageFromSource(
        previewUrl,
        croppedAreaPixels,
        enableRotation ? rotation : 0,
        {
          mimeType: targetMime,
          quality: quality ?? 0.92,
          width: outputWidth,
          height: outputHeight,
          fileName: `${safeBaseName}.${targetMime.split("/")[1] ?? "jpg"}`,
        }
      );

      const uploadResult = await uploadImageViaApi(croppedFile, {
        name: safeBaseName,
        expirationSeconds,
      });

      onChange?.(uploadResult.url, uploadResult);
      onUploadComplete?.(uploadResult);

      toast({
        title: "Đã tải ảnh lên",
        description: "Ảnh mới đã sẵn sàng sử dụng.",
      });

      closeCropper();
    } catch (error) {
      console.error("[ImageUploader] upload failed", error);
      toast({
        title: "Không thể tải ảnh",
        description:
          error instanceof Error ? error.message : "Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value.trim();
    onChange?.(nextValue ? nextValue : undefined);
  };

  const handleRemove = () => {
    onChange?.(undefined);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label>{label}</Label> : null}
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div
          className={cn(
            "relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-md border border-dashed border-slate-300 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-900/40",
            cropShape === "round" && "rounded-full"
          )}
        >
          {currentPreview ? (
            <img
              src={currentPreview}
              alt="Current preview"
              className={cn(
                "h-full w-full object-cover",
                cropShape === "round" && "rounded-full"
              )}
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-xs">
              <ImageIcon className="h-6 w-6" />
              <span>No image</span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
            >
              <UploadCloud className="mr-2 h-4 w-4" />
              {value ? "Đổi ảnh" : "Tải ảnh lên"}
            </Button>
            {value ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={disabled}
              >
                <X className="mr-2 h-4 w-4" />
                Xóa ảnh
              </Button>
            ) : null}
          </div>

          {allowUrlInput ? (
            <Input
              type="url"
              placeholder="https://..."
              value={value ?? ""}
              onChange={handleManualChange}
              disabled={disabled}
            />
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileSelected}
        disabled={disabled}
      />

      <Dialog
        open={isCropperOpen}
        onOpenChange={(open) => {
          if (!open && !isUploading) {
            closeCropper();
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa ảnh</DialogTitle>
          </DialogHeader>

          <div className="relative h-96 w-full overflow-hidden rounded-md bg-slate-950/70">
            {previewUrl ? (
              <Cropper
                image={previewUrl}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                cropShape={cropShape}
                rotation={enableRotation ? rotation : 0}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={enableRotation ? setRotation : undefined}
                onCropComplete={handleCropComplete}
                zoomWithScroll
              />
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs uppercase text-muted-foreground">
                Zoom
              </Label>
              <Slider
                value={[zoom]}
                min={1}
                max={4}
                step={0.1}
                onValueChange={(value) => setZoom(value[0] ?? 1)}
              />
            </div>

            {enableRotation ? (
              <div className="space-y-1">
                <Label className="text-xs uppercase text-muted-foreground">
                  Rotation
                </Label>
                <Slider
                  value={[rotation]}
                  min={0}
                  max={360}
                  step={1}
                  onValueChange={(value) => setRotation(value[0] ?? 0)}
                />
              </div>
            ) : null}
          </div>

          <DialogFooter className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={closeCropper}
              disabled={isUploading}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleConfirmUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tải...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Lưu ảnh
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
