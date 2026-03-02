"use client";

import { useState, useEffect } from "react";
import { HeroSlide } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import {
  X,
  Plus,
  Trash2,
  Upload,
  Loader2,
  Save,
  ChevronUp,
  ChevronDown,
  Layout,
  Type,
  MousePointer2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getApiUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ImageUploader } from "@/components/admin/ui/ImageUploader";
import { useDialog } from "@/context/DialogContext";

interface HeroEditorProps {
  onClose: () => void;
}

export function HeroEditor({ onClose }: HeroEditorProps) {
  const dialog = useDialog();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [selectedSlideId, setSelectedSlideId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch existing slides
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch(getApiUrl("/content/home_hero"));
        if (res.ok) {
          const data = await res.json();
          if (data.content && data.content.slides) {
            setSlides(data.content.slides);
            if (data.content.slides.length > 0) {
              setSelectedSlideId(data.content.slides[0].id);
            }
            return;
          }
        }
        setSlides([]);
      } catch (error) {
        console.error("Failed to fetch hero slides", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlides();
  }, []);

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: Date.now(),
      image: "",
      title: "New Headline",
      subtitle: "Subtitle",
      description: "Description text goes here",
      alignment: "center",
      textColor: "white",
      overlayOpacity: 40,
      buttonText: "Explore",
      buttonStyle: "primary",
    };
    setSlides([...slides, newSlide]);
    setSelectedSlideId(newSlide.id);
  };

  const handleUpdateSlide = (
    id: number,
    field: keyof HeroSlide,
    value: any,
  ) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const handleDeleteSlide = (id: number) => {
    const newSlides = slides.filter((s) => s.id !== id);
    setSlides(newSlides);
    if (selectedSlideId === id && newSlides.length > 0) {
      setSelectedSlideId(newSlides[0].id);
    } else if (newSlides.length === 0) {
      setSelectedSlideId(null);
    }
  };

  const moveSlide = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === slides.length - 1)
    ) {
      return;
    }
    const newSlides = [...slides];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newSlides[index], newSlides[targetIndex]] = [
      newSlides[targetIndex],
      newSlides[index],
    ];
    setSlides(newSlides);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(getApiUrl("/admin/content/home_hero"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ slides }),
      });
      if (res.ok) {
        dialog.toast({ message: "Hero section saved", variant: "success" });
        onClose();
      } else {
        dialog.toast({ message: "Failed to save", variant: "danger" });
      }
    } catch (error) {
      console.error("Save failed", error);
      dialog.toast({ message: "Save failed", variant: "danger" });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedSlide = slides.find((s) => s.id === selectedSlideId);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-7xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <Layout className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-gray-900">Hero Editor</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} size="sm">
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* Sidebar: Slide List */}
              <div className="w-80 border-r border-gray-100 bg-gray-50/50 flex flex-col shrink-0">
                <div className="p-4 space-y-3 overflow-y-auto flex-1">
                  {slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      onClick={() => setSelectedSlideId(slide.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 group ${
                        selectedSlideId === slide.id
                          ? "bg-white border-primary shadow-sm ring-1 ring-primary/20"
                          : "bg-white border-gray-200 hover:border-primary/50"
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="w-12 h-12 rounded-lg bg-gray-100 relative overflow-hidden shrink-0 border border-gray-100">
                        {slide.image ? (
                          <Image
                            src={slide.image}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-300">
                            <Layout className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {slide.title || "Untitled"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {slide.subtitle || "No subtitle"}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveSlide(index, "up");
                          }}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-900 disabled:opacity-30"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveSlide(index, "down");
                          }}
                          disabled={index === slides.length - 1}
                          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-900 disabled:opacity-30"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200 bg-white">
                  <Button
                    onClick={handleAddSlide}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Slide
                  </Button>
                </div>
              </div>

              {/* Main Area: Form + Preview */}
              <div className="flex-1 flex flex-col h-full bg-gray-50/30">
                {selectedSlide ? (
                  <div className="flex h-full">
                    {/* Left: Form */}
                    <div className="w-[400px] border-r border-gray-100 bg-white overflow-y-auto p-6 space-y-8 h-full">
                      {/* Section: Content */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                          <Type className="w-4 h-4 text-primary" />
                          Content
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">
                              Title
                            </label>
                            <input
                              value={selectedSlide.title}
                              onChange={(e) =>
                                handleUpdateSlide(
                                  selectedSlide.id,
                                  "title",
                                  e.target.value,
                                )
                              }
                              className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">
                              Subtitle
                            </label>
                            <input
                              value={selectedSlide.subtitle}
                              onChange={(e) =>
                                handleUpdateSlide(
                                  selectedSlide.id,
                                  "subtitle",
                                  e.target.value,
                                )
                              }
                              className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">
                              Description
                            </label>
                            <textarea
                              value={selectedSlide.description}
                              onChange={(e) =>
                                handleUpdateSlide(
                                  selectedSlide.id,
                                  "description",
                                  e.target.value,
                                )
                              }
                              rows={3}
                              className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none"
                            />
                          </div>
                        </div>
                      </div>

                      <hr className="border-gray-100" />

                      {/* Section: Visuals */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                          <Layout className="w-4 h-4 text-primary" />
                          Visuals & Layout
                        </div>

                        {/* Image */}
                        <div>
                          <ImageUploader
                            label="Background Image"
                            value={selectedSlide.image}
                            onChange={(url) =>
                              handleUpdateSlide(selectedSlide.id, "image", url)
                            }
                          />
                        </div>

                        {/* Controls Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Text Color */}
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">
                              Text Color
                            </label>
                            <select
                              value={selectedSlide.textColor || "white"}
                              onChange={(e) =>
                                handleUpdateSlide(
                                  selectedSlide.id,
                                  "textColor",
                                  e.target.value,
                                )
                              }
                              className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                            >
                              <option value="white">White</option>
                              <option value="black">Black</option>
                            </select>
                          </div>

                          {/* Alignment */}
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">
                              Alignment
                            </label>
                            <select
                              value={selectedSlide.alignment || "center"}
                              onChange={(e) =>
                                handleUpdateSlide(
                                  selectedSlide.id,
                                  "alignment",
                                  e.target.value,
                                )
                              }
                              className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                            >
                              <option value="left">Left</option>
                              <option value="center">Center</option>
                              <option value="right">Right</option>
                            </select>
                          </div>
                        </div>

                        {/* Opacity */}
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase flex justify-between">
                            Overlay Opacity
                            <span>{selectedSlide.overlayOpacity ?? 40}%</span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="90"
                            value={selectedSlide.overlayOpacity ?? 40}
                            onChange={(e) =>
                              handleUpdateSlide(
                                selectedSlide.id,
                                "overlayOpacity",
                                Number(e.target.value),
                              )
                            }
                            className="w-full mt-2 accent-primary"
                          />
                        </div>
                      </div>

                      <hr className="border-gray-100" />

                      {/* Section: Button */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                          <MousePointer2 className="w-4 h-4 text-primary" />
                          Action Button
                        </div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">
                                Label
                              </label>
                              <input
                                value={selectedSlide.buttonText || ""}
                                onChange={(e) =>
                                  handleUpdateSlide(
                                    selectedSlide.id,
                                    "buttonText",
                                    e.target.value,
                                  )
                                }
                                className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">
                                Style
                              </label>
                              <select
                                value={selectedSlide.buttonStyle || "primary"}
                                onChange={(e) =>
                                  handleUpdateSlide(
                                    selectedSlide.id,
                                    "buttonStyle",
                                    e.target.value,
                                  )
                                }
                                className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                              >
                                <option value="primary">Primary</option>
                                <option value="outline">Outline</option>
                                <option value="white">White</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">
                              Link URL
                            </label>
                            <input
                              value={selectedSlide.buttonLink || ""}
                              onChange={(e) =>
                                handleUpdateSlide(
                                  selectedSlide.id,
                                  "buttonLink",
                                  e.target.value,
                                )
                              }
                              placeholder="/category/..."
                              className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm font-mono text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button
                          variant="secondary"
                          className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-100"
                          onClick={() => handleDeleteSlide(selectedSlide.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Slide
                        </Button>
                      </div>
                    </div>

                    {/* Right: Live Preview */}
                    <div className="flex-1 p-8 overflow-y-auto flex items-center justify-center bg-gray-100/50">
                      <div className="w-full max-w-[1000px] aspect-[16/9] bg-white rounded-xl shadow-2xl relative overflow-hidden group select-none ring-1 ring-gray-900/5 transition-all">
                        {/* Background */}
                        {selectedSlide.image ? (
                          <Image
                            src={selectedSlide.image}
                            alt="preview"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 font-medium">
                              No Image
                            </span>
                          </div>
                        )}

                        {/* Overlay */}
                        <div
                          className="absolute inset-0 bg-black transition-opacity duration-300"
                          style={{
                            opacity: (selectedSlide.overlayOpacity ?? 40) / 100,
                          }}
                        />

                        {/* Content Layer */}
                        <div
                          className={`absolute inset-0 p-12 flex flex-col justify-center ${
                            selectedSlide.alignment === "left"
                              ? "items-start text-left"
                              : selectedSlide.alignment === "right"
                                ? "items-end text-right"
                                : "items-center text-center"
                          }`}
                        >
                          <span
                            className="text-sm tracking-[0.2em] uppercase font-medium mb-4"
                            style={{
                              color:
                                selectedSlide.textColor === "black"
                                  ? "#111827"
                                  : "rgba(255,255,255,0.9)",
                            }}
                          >
                            {selectedSlide.subtitle || "SUBTITLE"}
                          </span>
                          <h2
                            className="text-5xl font-serif mb-6 max-w-2xl leading-tight"
                            style={{
                              color:
                                selectedSlide.textColor === "black"
                                  ? "#000000"
                                  : "#FFFFFF",
                            }}
                          >
                            {selectedSlide.title || "Headline Title"}
                          </h2>
                          <p
                            className="text-lg mb-8 max-w-xl font-light leading-relaxed"
                            style={{
                              color:
                                selectedSlide.textColor === "black"
                                  ? "#374151"
                                  : "rgba(255,255,255,0.8)",
                            }}
                          >
                            {selectedSlide.description ||
                              "Description text goes here..."}
                          </p>

                          {selectedSlide.buttonText && (
                            <div className="pointer-events-none">
                              <Button
                                size="lg"
                                className={`
                                        rounded-full px-8 py-6 text-sm tracking-wide uppercase shadow-lg
                                        ${
                                          selectedSlide.buttonStyle ===
                                          "outline"
                                            ? "bg-transparent border-2 border-white text-white"
                                            : selectedSlide.buttonStyle ===
                                                "white"
                                              ? "bg-white text-gray-900 border-2 border-white"
                                              : "bg-primary text-secondary border-2 border-primary"
                                        }
                                    `}
                              >
                                {selectedSlide.buttonText}
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Preview Label */}
                        <div className="absolute top-4 left-4 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-md uppercase tracking-wide font-medium">
                          Live Preview
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <Layout className="w-12 h-12 mb-4 opacity-20" />
                    <p>Select a slide to edit</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
