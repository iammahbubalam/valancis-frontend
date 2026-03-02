"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Save, Trash2, X, ChevronDown, ChevronUp } from "lucide-react";
import { PolicyPage, PolicySection } from "@/lib/content-types";
import { getApiUrl } from "@/lib/utils";
import { useDialog } from "@/context/DialogContext";

interface PolicyEditorProps {
  policyKey: "policy_shipping" | "policy_return";
  title: string;
  onClose: () => void;
}

export function PolicyEditor({ policyKey, title, onClose }: PolicyEditorProps) {
  const dialog = useDialog();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<PolicyPage>({
    sections: [],
    lastUpdated: "",
  });
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(getApiUrl(`/content/${policyKey}`));
        if (res.ok) {
          const json = await res.json();
          if (json.content) {
            setData(json.content);
          }
        }
      } catch (e) {
        console.error("Failed to fetch policy", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [policyKey]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedData = {
        ...data,
        lastUpdated: new Date().toISOString(),
      };

      const res = await fetch(getApiUrl(`/admin/content/${policyKey}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) throw new Error("Failed to save");

      // Refresh local state to show new timestamp
      setData(updatedData);
      dialog.toast({
        message: "Policy updated successfully!",
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

  const addSection = () => {
    setData((prev) => ({
      ...prev,
      sections: [...prev.sections, { heading: "New Section", content: "" }],
    }));
    setExpandedIdx(data.sections.length);
  };

  const removeSection = async (idx: number) => {
    const confirmed = await dialog.confirm({
      title: "Delete Section",
      message: "Delete this section?",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;
    setData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== idx),
    }));
    if (expandedIdx === idx) setExpandedIdx(null);
  };

  const updateSection = (
    idx: number,
    field: keyof PolicySection,
    value: any,
  ) => {
    const newSections = [...data.sections];
    newSections[idx] = { ...newSections[idx], [field]: value };
    setData((prev) => ({ ...prev, sections: newSections }));
  };

  const updateListItems = (idx: number, raw: string) => {
    const items = raw.split("\n").filter((line) => line.trim() !== "");
    updateSection(idx, "listItems", items);
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
            <h2 className="text-xl font-bold font-serif">{title}</h2>
            <p className="text-sm text-gray-500">Edit Policy Content</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={addSection}>
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
            <Save className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto w-full p-8 pb-32 space-y-6">
        {data.sections.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">No content sections yet.</p>
            <Button variant="link" onClick={addSection}>
              Create first section
            </Button>
          </div>
        )}

        {data.sections.map((section, idx) => (
          <div
            key={idx}
            className={`border rounded-lg transition-all ${
              expandedIdx === idx
                ? "border-primary/20 shadow-md bg-white"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            {/* Section Header */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer select-none"
              onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                  {idx + 1}
                </span>
                <span className="font-medium text-gray-900">
                  {section.heading || "Untitled Section"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSection(idx);
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
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                    Heading
                  </label>
                  <input
                    type="text"
                    value={section.heading}
                    onChange={(e) =>
                      updateSection(idx, "heading", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                    placeholder="e.g. Delivery Areas"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                    Content Text (Paragraph)
                  </label>
                  <textarea
                    value={section.content || ""}
                    onChange={(e) =>
                      updateSection(idx, "content", e.target.value)
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                    placeholder="Enter the main text content..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                    List Items (Optional)
                  </label>
                  <p className="text-xs text-gray-400 mb-1">
                    Enter each bullet point on a new line.
                  </p>
                  <textarea
                    value={section.listItems?.join("\n") || ""}
                    onChange={(e) => updateListItems(idx, e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white font-mono text-sm"
                    placeholder="- Item 1&#10;- Item 2"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
