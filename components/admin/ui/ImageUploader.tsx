"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { getApiUrl } from "@/lib/utils";
import { useDialog } from "@/context/DialogContext";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  bucketType?: "products" | "content"; // Optional hint for future backend organization
}

export function ImageUploader({
  value,
  onChange,
  disabled = false,
  className = "",
  label = "Upload Image",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialog = useDialog();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const token = localStorage.getItem("token");

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Using the generic /upload endpoint
      const res = await fetch(getApiUrl("/upload"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      }
    } catch (error) {
      console.error("Upload error:", error);
      dialog.toast({
        message: "Failed to upload image. Please try again.",
        variant: "danger",
      });
    } finally {
      setIsUploading(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const clearImage = () => {
    onChange("");
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-bold uppercase text-gray-500">
          {label}
        </label>
      )}

      {!value ? (
        // Empty State - Upload Button
        <div
          className={`border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-gray-400 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer ${
            disabled ? "opacity-50 pointer-events-none" : ""
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          ) : (
            <Upload className="w-8 h-8 opacity-50" />
          )}
          <span className="text-xs font-medium">
            {isUploading ? "Uploading..." : "Click to upload"}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
          />
        </div>
      ) : (
        // Preview State
        <div className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-video w-full max-w-[300px]">
          <Image src={value} alt="Preview" fill className="object-cover" />

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="h-8 text-xs bg-white/90 hover:bg-white"
            >
              Change
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={clearImage}
              disabled={disabled || isUploading}
              className="h-8 px-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Hidden input for "Change" action */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
          />
        </div>
      )}
    </div>
  );
}
