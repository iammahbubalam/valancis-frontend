"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { X, Save, Loader2, ExternalLink, Bell, Palette } from "lucide-react";
import { getApiUrl } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

interface AnnouncementEditorProps {
  onClose: () => void;
}

interface AnnouncementData {
  message: string;
  linkText: string;
  linkUrl: string;
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
}

const defaultAnnouncement: AnnouncementData = {
  message: "🎉 Free shipping on orders over ৳2,000!",
  linkText: "Shop Now",
  linkUrl: "/shop",
  backgroundColor: "#1a1a2e",
  textColor: "#ffffff",
  isActive: true,
};

const presetColors = [
  { bg: "#1a1a2e", text: "#ffffff", label: "Dark Blue" },
  { bg: "#e74c3c", text: "#ffffff", label: "Red" },
  { bg: "#27ae60", text: "#ffffff", label: "Green" },
  { bg: "#f39c12", text: "#1a1a2e", label: "Gold" },
  { bg: "#9b59b6", text: "#ffffff", label: "Purple" },
  { bg: "#3498db", text: "#ffffff", label: "Blue" },
];

export function AnnouncementEditor({ onClose }: AnnouncementEditorProps) {
  const queryClient = useQueryClient();
  const [data, setData] = useState<AnnouncementData>(defaultAnnouncement);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing announcement
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(getApiUrl("/content/announcement_bar"));
        if (res.ok) {
          const result = await res.json();
          if (result.content) {
            setData({
              ...defaultAnnouncement,
              ...result.content,
              // Use isActive from content first (saved JSON), fallback to column value
              isActive: result.content.isActive ?? result.isActive ?? true,
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch announcement", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl("/admin/content/announcement_bar"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to save");
      }

      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ["admin_content_meta"] });
      queryClient.invalidateQueries({ queryKey: ["announcement_bar"] });

      onClose();
    } catch (err) {
      setError("Failed to save announcement. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const applyPreset = (preset: (typeof presetColors)[0]) => {
    setData((prev) => ({
      ...prev,
      backgroundColor: preset.bg,
      textColor: preset.text,
    }));
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold">Announcement Bar</h2>
              <p className="text-sm text-gray-500">
                Configure the site-wide announcement banner
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Live Preview */}
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <div className="text-xs font-medium text-gray-500 px-3 py-2 bg-gray-50 border-b border-gray-200">
              Live Preview
            </div>
            <div
              className="py-2.5 px-4 text-center text-sm font-medium"
              style={{
                backgroundColor: data.backgroundColor,
                color: data.textColor,
              }}
            >
              {data.message}{" "}
              {data.linkText && (
                <span className="underline cursor-pointer ml-1">
                  {data.linkText}
                </span>
              )}
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Show Announcement</h4>
              <p className="text-sm text-gray-500">
                Toggle the announcement bar visibility
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                checked={data.isActive}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, isActive: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Message
            </label>
            <input
              type="text"
              value={data.message}
              onChange={(e) =>
                setData((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder="🎉 Free shipping on orders over ৳2,000!"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>

          {/* Link */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Link Text (Optional)
              </label>
              <input
                type="text"
                value={data.linkText}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, linkText: e.target.value }))
                }
                placeholder="Shop Now"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Link URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={data.linkUrl}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, linkUrl: e.target.value }))
                  }
                  placeholder="/shop"
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Color Presets */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Palette className="w-4 h-4" />
              Color Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {presetColors.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className={`px-3 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${data.backgroundColor === preset.bg &&
                      data.textColor === preset.text
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-gray-200 hover:border-gray-300"
                    }`}
                  style={{
                    backgroundColor: preset.bg,
                    color: preset.text,
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Background Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={data.backgroundColor}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      backgroundColor: e.target.value,
                    }))
                  }
                  className="w-12 h-10 rounded border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={data.backgroundColor}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      backgroundColor: e.target.value,
                    }))
                  }
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Text Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={data.textColor}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, textColor: e.target.value }))
                  }
                  className="w-12 h-10 rounded border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={data.textColor}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, textColor: e.target.value }))
                  }
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
