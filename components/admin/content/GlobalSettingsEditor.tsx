"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Save, X, Globe, Mail, Share2, Search } from "lucide-react";
import { GlobalSettings } from "@/lib/content-types";
import { getApiUrl } from "@/lib/utils";
import { ImageUploader } from "@/components/admin/ui/ImageUploader";
import { useDialog } from "@/context/DialogContext";

interface GlobalSettingsEditorProps {
  onClose: () => void;
  isEmbedded?: boolean;
}

export function GlobalSettingsEditor({
  onClose,
  isEmbedded = false,
}: GlobalSettingsEditorProps) {
  const dialog = useDialog();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<GlobalSettings>({
    branding: {
      siteName: "",
      tagline: "",
      logoUrl: "",
      faviconUrl: "",
      primaryColor: "#000000",
    },
    contact: {
      supportEmail: "",
      salesEmail: "",
      phonePrimary: "",
      phoneSecondary: "",
      address: {
        line1: "",
        line2: "",
        city: "",
        zip: "",
        country: "",
        mapUrl: "",
      },
    },
    socials: { facebook: "", instagram: "", tiktok: "", youtube: "" },
    seo: {
      defaultMetaTitle: "",
      defaultMetaDescription: "",
      defaultOgImage: "",
    },
  });

  const [activeTab, setActiveTab] = useState<
    "branding" | "contact" | "socials" | "seo"
  >("branding");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(getApiUrl("/content/settings_global"));
        if (res.ok) {
          const json = await res.json();
          if (json.content) {
            setData(json.content);
          }
        }
      } catch (e) {
        console.error("Failed to fetch global settings", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(getApiUrl("/admin/content/settings_global"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save");
      dialog.toast({
        message: "Global Settings updated successfully!",
        variant: "success",
      });
      // Force reload to update site config in layout (optional, or rely on next nav)
      window.location.reload();
    } catch (e) {
      console.error(e);
      dialog.toast({ message: "Failed to save changes.", variant: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const updateBranding = (
    field: keyof GlobalSettings["branding"],
    val: string,
  ) =>
    setData((prev) => ({
      ...prev,
      branding: { ...prev.branding, [field]: val },
    }));

  const updateContact = (field: keyof GlobalSettings["contact"], val: string) =>
    setData((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: val },
    }));

  const updateAddress = (
    field: keyof GlobalSettings["contact"]["address"],
    val: string,
  ) =>
    setData((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        address: { ...prev.contact.address, [field]: val },
      },
    }));

  const updateSocials = (field: keyof GlobalSettings["socials"], val: string) =>
    setData((prev) => ({
      ...prev,
      socials: { ...prev.socials, [field]: val },
    }));

  const updateSeo = (field: keyof GlobalSettings["seo"], val: string) =>
    setData((prev) => ({ ...prev, seo: { ...prev.seo, [field]: val } }));

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  const TabButton = ({
    id,
    label,
    icon: Icon,
  }: {
    id: typeof activeTab;
    label: string;
    icon: any;
  }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        activeTab === id
          ? "bg-primary text-white"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  const baseContainerClass = isEmbedded
    ? "w-full bg-transparent flex flex-col"
    : "fixed inset-0 bg-white z-50 overflow-y-auto flex flex-col";

  const headerClass = isEmbedded
    ? "hidden"
    : "bg-white border-b border-gray-100 p-4 sticky top-0 z-10 flex justify-between items-center shadow-sm";

  return (
    <div className={baseContainerClass}>
      {/* Conditionally render header or embedded controls */}
      {isEmbedded ? (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Globe className="w-4 h-4" />
            <span>Editing Live Configuration</span>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
            <Save className="w-4 h-4 ml-2" />
          </Button>
        </div>
      ) : (
        <div className={headerClass}>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-xl font-bold font-serif">Global Settings</h2>
              <p className="text-sm text-gray-500">
                Site Identity & Configuration
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
            <Save className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      <div
        className={`w-full flex flex-col md:flex-row gap-8 ${
          isEmbedded ? "" : "max-w-5xl mx-auto p-8"
        }`}
      >
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex flex-col gap-2">
          <TabButton id="branding" label="Branding" icon={Globe} />
          <TabButton id="contact" label="Contact Info" icon={Mail} />
          <TabButton id="socials" label="Social Media" icon={Share2} />
          <TabButton id="seo" label="SEO Defaults" icon={Search} />
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 p-6 md:p-8">
          {activeTab === "branding" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-4 mb-6">
                Branding Identity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">
                    Site Name
                  </label>
                  <input
                    className="w-full px-3 py-2 border rounded-md"
                    value={data.branding.siteName}
                    onChange={(e) => updateBranding("siteName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">
                    Tagline
                  </label>
                  <input
                    className="w-full px-3 py-2 border rounded-md"
                    value={data.branding.tagline}
                    onChange={(e) => updateBranding("tagline", e.target.value)}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <ImageUploader
                    label="Site Logo"
                    value={data.branding.logoUrl}
                    onChange={(url) => updateBranding("logoUrl", url)}
                  />
                  <p className="text-[10px] text-gray-400">
                    Recommended: PNG or SVG, min height 40px.
                  </p>
                </div>

                <div className="space-y-2 col-span-2">
                  <ImageUploader
                    label="Favicon"
                    value={data.branding.faviconUrl}
                    onChange={(url) => updateBranding("faviconUrl", url)}
                  />
                  <p className="text-[10px] text-gray-400">
                    Recommended: 32x32px or 64x64px PNG.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">
                    Primary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      className="p-1 h-10 w-14 border rounded cursor-pointer"
                      value={data.branding.primaryColor}
                      onChange={(e) =>
                        updateBranding("primaryColor", e.target.value)
                      }
                    />
                    <input
                      className="flex-1 px-3 py-2 border rounded-md uppercase"
                      value={data.branding.primaryColor}
                      onChange={(e) =>
                        updateBranding("primaryColor", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-4 mb-6">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">
                    Support Email
                  </label>
                  <input
                    className="w-full px-3 py-2 border rounded-md"
                    value={data.contact.supportEmail}
                    onChange={(e) =>
                      updateContact("supportEmail", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">
                    Phone
                  </label>
                  <input
                    className="w-full px-3 py-2 border rounded-md"
                    value={data.contact.phonePrimary}
                    onChange={(e) =>
                      updateContact("phonePrimary", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-bold uppercase text-gray-500">
                    Address Line 1
                  </label>
                  <input
                    className="w-full px-3 py-2 border rounded-md"
                    value={data.contact.address.line1}
                    onChange={(e) => updateAddress("line1", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">
                    City
                  </label>
                  <input
                    className="w-full px-3 py-2 border rounded-md"
                    value={data.contact.address.city}
                    onChange={(e) => updateAddress("city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">
                    Country
                  </label>
                  <input
                    className="w-full px-3 py-2 border rounded-md"
                    value={data.contact.address.country}
                    onChange={(e) => updateAddress("country", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "socials" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-4 mb-6">
                Social Media Links
              </h3>
              <div className="space-y-4">
                {["facebook", "instagram", "tiktok", "youtube"].map(
                  (platform) => (
                    <div key={platform} className="space-y-2">
                      <label className="text-xs font-bold uppercase text-gray-500">
                        {platform}
                      </label>
                      <input
                        className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                        value={(data.socials as any)[platform]}
                        onChange={(e) =>
                          updateSocials(platform as any, e.target.value)
                        }
                        placeholder={`https://${platform}.com/...`}
                      />
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-4 mb-6">
                SEO Defaults
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">
                    Default Meta Title
                  </label>
                  <input
                    className="w-full px-3 py-2 border rounded-md"
                    value={data.seo.defaultMetaTitle}
                    onChange={(e) =>
                      updateSeo("defaultMetaTitle", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">
                    Default Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                    value={data.seo.defaultMetaDescription}
                    onChange={(e) =>
                      updateSeo("defaultMetaDescription", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <ImageUploader
                    label="Default OG Image (Social Share)"
                    value={data.seo.defaultOgImage}
                    onChange={(url) => updateSeo("defaultOgImage", url)}
                  />
                  <p className="text-[10px] text-gray-400">
                    Recommended: 1200x630px JPG/PNG.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
