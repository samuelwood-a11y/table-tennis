"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  shape?: "circle" | "rounded";
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  className?: string;
}

const sizeMap = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
};

export function ImageUpload({
  currentUrl,
  onUpload,
  onRemove,
  shape = "circle",
  size = "md",
  placeholder = "📷",
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Use JPEG, PNG, or WebP");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Max 2MB");
      return;
    }

    setUploading(true);
    setError("");

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) {
        onUpload(data.url);
      } else {
        setError(data.error ?? "Upload failed");
      }
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-2xl";

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative group">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "relative overflow-hidden flex items-center justify-center transition-all",
            sizeMap[size],
            shapeClass,
            currentUrl
              ? "ring-2 ring-white/20"
              : "bg-white/10 border-2 border-dashed border-white/20 hover:border-white/40"
          )}
          disabled={uploading}
        >
          {currentUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentUrl} alt="Upload" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">{uploading ? "⏳" : placeholder}</span>
          )}
          {/* Overlay on hover */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity",
            shapeClass
          )}>
            <span className="text-white text-xs font-medium">
              {uploading ? "Uploading..." : currentUrl ? "Change" : "Upload"}
            </span>
          </div>
        </button>

        {currentUrl && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors"
          >
            ×
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <p className="text-xs text-white/30">
        {currentUrl ? "Click to change photo" : "Click to upload"} · JPEG, PNG, WebP · max 2MB
      </p>
    </div>
  );
}
