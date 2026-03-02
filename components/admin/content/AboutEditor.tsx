"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Plus,
  Save,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Type,
  BarChart3,
} from "lucide-react";
import { AboutPage, AboutBlock } from "@/lib/content-types";
import { getApiUrl } from "@/lib/utils";
import { ImageUploader } from "@/components/admin/ui/ImageUploader";
import { useDialog } from "@/context/DialogContext";

interface AboutEditorProps {
  onClose: () => void;
}

export function AboutEditor({ onClose }: AboutEditorProps) {
  const dialog = useDialog();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<AboutPage>({
    hero: { title: "", subtitle: "", imageUrl: "" },
    blocks: [],
  });
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(getApiUrl("/content/content_about"));
        if (res.ok) {
          const json = await res.json();
          if (json.content) {
            setData(json.content);
          }
        }
      } catch (e) {
        console.error("Failed to fetch about page", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(getApiUrl("/admin/content/content_about"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save");
      dialog.toast({
        message: "About Page updated successfully!",
        variant: "success",
      });
      onClose();
    } catch (e) {
      console.error(e);
      dialog.toast({ message: "Failed to save changes.", variant: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const addBlock = (type: "text" | "stats") => {
    const newBlock: AboutBlock =
      type === "text"
        ? { type: "text", heading: "New Section", body: "" }
        : { type: "stats", items: [{ label: "Stat 1", value: "100" }] };

    setData((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }));
    setExpandedIdx(data.blocks.length);
  };

  const removeBlock = async (idx: number) => {
    const confirmed = await dialog.confirm({
      title: "Delete Block",
      message: "Delete this block?",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;
    setData((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((_, i) => i !== idx),
    }));
    if (expandedIdx === idx) setExpandedIdx(null);
  };

  const updateBlock = (idx: number, field: keyof AboutBlock, value: any) => {
    const newBlocks = [...data.blocks];
    newBlocks[idx] = { ...newBlocks[idx], [field]: value };
    setData((prev) => ({ ...prev, blocks: newBlocks }));
  };

  const updateStatItem = (
    blockIdx: number,
    statIdx: number,
    field: "label" | "value",
    val: string,
  ) => {
    const newBlocks = [...data.blocks];
    const items = [...(newBlocks[blockIdx].items || [])];
    items[statIdx] = { ...items[statIdx], [field]: val };
    newBlocks[blockIdx].items = items;
    setData((prev) => ({ ...prev, blocks: newBlocks }));
  };

  const addStatItem = (blockIdx: number) => {
    const newBlocks = [...data.blocks];
    newBlocks[blockIdx].items = [
      ...(newBlocks[blockIdx].items || []),
      { label: "New Stat", value: "0" },
    ];
    setData((prev) => ({ ...prev, blocks: newBlocks }));
  };

  const removeStatItem = (blockIdx: number, statIdx: number) => {
    const newBlocks = [...data.blocks];
    newBlocks[blockIdx].items = (newBlocks[blockIdx].items || []).filter(
      (_, i) => i !== statIdx,
    );
    setData((prev) => ({ ...prev, blocks: newBlocks }));
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-10 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold font-serif">About Page Editor</h2>
            <p className="text-sm text-gray-500">Manage Our Story & Stats</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => addBlock("text")}>
            <Type className="w-4 h-4 mr-2" />
            Add Text
          </Button>
          <Button variant="secondary" onClick={() => addBlock("stats")}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Add Stats
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
            <Save className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto w-full p-8 pb-32 space-y-8">
        {/* HERO CONFIG */}
        <section className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="font-bold uppercase text-sm tracking-wider text-gray-500">
            About Hero Section
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold">Hero Title</label>
              <input
                className="w-full px-3 py-2 border rounded-md"
                value={data.hero.title}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, title: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold">Subtitle</label>
              <input
                className="w-full px-3 py-2 border rounded-md"
                value={data.hero.subtitle}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, subtitle: e.target.value },
                  }))
                }
              />
            </div>
            <div className="col-span-2 space-y-2">
              <ImageUploader
                label="Background Image"
                value={data.hero.imageUrl}
                onChange={(url) =>
                  setData((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, imageUrl: url },
                  }))
                }
              />
            </div>
          </div>
        </section>

        <div className="h-px bg-gray-200" />

        <h3 className="font-bold uppercase text-sm tracking-wider text-gray-500 mb-4">
          Content Blocks
        </h3>

        {data.blocks.map((block, idx) => (
          <div
            key={idx}
            className={`border rounded-lg transition-all ${
              expandedIdx === idx
                ? "border-primary/20 shadow-md bg-white"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            {/* Block Header */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer select-none"
              onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-200 rounded text-gray-600">
                  {block.type === "text" ? (
                    <Type className="w-4 h-4" />
                  ) : (
                    <BarChart3 className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <span className="font-medium text-gray-900 block">
                    {block.heading || "Untitled Block"}
                  </span>
                  <span className="text-xs text-gray-400 uppercase">
                    {block.type}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBlock(idx);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                {expandedIdx === idx ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Editor Body */}
            {expandedIdx === idx && (
              <div className="p-6 border-t border-gray-100 space-y-6 animate-in fade-in duration-200">
                {/* TEXT BLOCK EDITOR */}
                {block.type === "text" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                        Heading (Optional)
                      </label>
                      <input
                        type="text"
                        value={block.heading || ""}
                        onChange={(e) =>
                          updateBlock(idx, "heading", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                        Body Text
                      </label>
                      <textarea
                        value={block.body || ""}
                        onChange={(e) =>
                          updateBlock(idx, "body", e.target.value)
                        }
                        rows={5}
                        className="w-full px-4 py-2 border border-gray-200 rounded-md"
                      />
                    </div>
                  </>
                )}

                {/* STATS BLOCK EDITOR */}
                {block.type === "stats" && (
                  <div className="space-y-4">
                    <label className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-2 block">
                      Stat Items
                    </label>
                    {block.items?.map((item, sIdx) => (
                      <div key={sIdx} className="flex gap-4 items-center">
                        <input
                          placeholder="Label (e.g. Years)"
                          className="flex-1 px-3 py-2 border rounded-md text-sm"
                          value={item.label}
                          onChange={(e) =>
                            updateStatItem(idx, sIdx, "label", e.target.value)
                          }
                        />
                        <input
                          placeholder="Value (e.g. 10+)"
                          className="w-24 px-3 py-2 border rounded-md text-sm font-mono"
                          value={item.value}
                          onChange={(e) =>
                            updateStatItem(idx, sIdx, "value", e.target.value)
                          }
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400"
                          onClick={() => removeStatItem(idx, sIdx)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addStatItem(idx)}
                      className="mt-2"
                    >
                      + Add Stat
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
