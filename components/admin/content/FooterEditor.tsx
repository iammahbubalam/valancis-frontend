"use client";

import { useState, useEffect } from "react";
import { FooterSection, FooterLink } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import {
  X,
  Plus,
  Trash2,
  Loader2,
  Save,
  Grid,
  Type,
  Link as LinkIcon,
  LayoutTemplate,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getApiUrl } from "@/lib/utils";
import { useDialog } from "@/context/DialogContext";

interface FooterEditorProps {
  onClose: () => void;
}

export function FooterEditor({ onClose }: FooterEditorProps) {
  const dialog = useDialog();
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const res = await fetch(getApiUrl("/content/home_footer"));
        if (res.ok) {
          const data = await res.json();
          if (data.content && data.content.sections) {
            setSections(data.content.sections);
            return;
          }
        }
        setSections([]);
      } catch (error) {
        console.error("Failed to fetch footer", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFooter();
  }, []);

  const handleAddSection = () => {
    setSections([...sections, { title: "New Column", links: [] }]);
  };

  const handleRemoveSection = (idx: number) => {
    setSections(sections.filter((_, i) => i !== idx));
  };

  const handleSectionTitleChange = (idx: number, title: string) => {
    const newSections = [...sections];
    newSections[idx].title = title;
    setSections(newSections);
  };

  const handleAddLink = (sectionIdx: number) => {
    const newSections = [...sections];
    newSections[sectionIdx].links.push({ label: "New Link", href: "/" });
    setSections(newSections);
  };

  const handleRemoveLink = (sectionIdx: number, linkIdx: number) => {
    const newSections = [...sections];
    newSections[sectionIdx].links = newSections[sectionIdx].links.filter(
      (_, i) => i !== linkIdx,
    );
    setSections(newSections);
  };

  const handleLinkChange = (
    sectionIdx: number,
    linkIdx: number,
    field: keyof FooterLink,
    value: string,
  ) => {
    const newSections = [...sections];
    (newSections[sectionIdx].links[linkIdx] as any)[field] = value;
    setSections(newSections);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(getApiUrl("/admin/content/home_footer"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ sections }),
      });

      if (res.ok) {
        dialog.toast({
          message: "Footer saved successfully",
          variant: "success",
        });
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-50/50 w-full max-w-7xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-md"
      >
        {/* Header */}
        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <LayoutTemplate className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-gray-900">Footer Editor</h2>
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
              Save Footer
            </Button>
          </div>
        </div>

        {/* Content Area - Horizontal Scroll for Grid */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-8 bg-gray-50/50">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="flex gap-6 h-full items-start">
              {sections.map((section, sIdx) => (
                <motion.div
                  key={sIdx}
                  layoutId={`section-${sIdx}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-80 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col shrink-0 max-h-full"
                >
                  {/* Column Header */}
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-xl group">
                    <div className="flex items-center gap-2 flex-1">
                      <Grid className="w-4 h-4 text-gray-400" />
                      <input
                        className="bg-transparent font-bold text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 rounded px-1 w-full"
                        value={section.title}
                        onChange={(e) =>
                          handleSectionTitleChange(sIdx, e.target.value)
                        }
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveSection(sIdx)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Links List */}
                  <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
                    <div className="space-y-2">
                      <AnimatePresence>
                        {section.links.map((link, lIdx) => (
                          <motion.div
                            key={lIdx}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="group p-2 rounded-lg border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all"
                          >
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <Type className="w-3 h-3 text-gray-400 shrink-0" />
                                <input
                                  className="flex-1 bg-transparent text-sm font-medium text-gray-900 focus:outline-none placeholder:text-gray-300"
                                  value={link.label}
                                  onChange={(e) =>
                                    handleLinkChange(
                                      sIdx,
                                      lIdx,
                                      "label",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Label"
                                />
                                <button
                                  onClick={() => handleRemoveLink(sIdx, lIdx)}
                                  className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="flex items-center gap-2 pl-5">
                                <LinkIcon className="w-3 h-3 text-gray-300 shrink-0" />
                                <input
                                  className="flex-1 bg-transparent text-xs text-gray-500 font-mono focus:outline-none placeholder:text-gray-300"
                                  value={link.href}
                                  onChange={(e) =>
                                    handleLinkChange(
                                      sIdx,
                                      lIdx,
                                      "href",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="/path"
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    <button
                      onClick={() => handleAddLink(sIdx)}
                      className="w-full mt-2 py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary/70 hover:text-primary hover:bg-primary/5 rounded-lg border border-dashed border-primary/20 hover:border-primary/40 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Link
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Add Column Button */}
              <button
                onClick={handleAddSection}
                className="w-80 h-[200px] shrink-0 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-primary transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="font-medium text-sm">Add New Column</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
