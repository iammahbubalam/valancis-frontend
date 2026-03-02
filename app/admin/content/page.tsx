"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import {
  Image as ImageIcon,
  LayoutTemplate,
  CheckCircle,
  Clock,
  ArrowRight,
  Settings,
  Bell,
} from "lucide-react";
import { HeroEditor } from "@/components/admin/content/HeroEditor";
import { FooterEditor } from "@/components/admin/content/FooterEditor";
import { AboutEditor } from "@/components/admin/content/AboutEditor";
import { PolicyEditor } from "@/components/admin/content/PolicyEditor";
import { GlobalSettingsEditor } from "@/components/admin/content/GlobalSettingsEditor";
import { AnnouncementEditor } from "@/components/admin/content/AnnouncementEditor";
import { getApiUrl } from "@/lib/utils";
import { format } from "date-fns";

type ContentType =
  | "hero"
  | "footer"
  | "about"
  | "shipping"
  | "return"
  | "global"
  | "announcement"
  | null;

interface ContentMeta {
  key: string;
  updatedAt: string;
  itemCount: number;
}

export default function ContentPage() {
  const [activeEditor, setActiveEditor] = useState<ContentType>(null);

  const fetchContentMeta = async (path: string) => {
    try {
      const res = await fetch(getApiUrl(path));
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  const { data: meta = {}, isLoading: loading } = useQuery({
    queryKey: ["admin_content_meta"],
    queryFn: async () => {
      const [hero, footer, about, shipping, returns, global_settings] =
        await Promise.all([
          fetchContentMeta("/content/home_hero"),
          fetchContentMeta("/content/home_footer"),
          fetchContentMeta("/content/content_about"),
          fetchContentMeta("/content/policy_shipping"),
          fetchContentMeta("/content/policy_return"),
          fetchContentMeta("/content/settings_global"),
        ]);

      const newMeta: Record<string, ContentMeta> = {};

      if (hero)
        newMeta["hero"] = {
          key: "home_hero",
          updatedAt: hero.updatedAt,
          itemCount: hero.content?.slides?.length || 0,
        };
      if (footer)
        newMeta["footer"] = {
          key: "home_footer",
          updatedAt: footer.updatedAt,
          itemCount: footer.content?.sections?.length || 0,
        };
      if (about)
        newMeta["about"] = {
          key: "content_about",
          updatedAt: about.updatedAt,
          itemCount: about.content?.blocks?.length || 0,
        };
      if (shipping)
        newMeta["shipping"] = {
          key: "policy_shipping",
          updatedAt: shipping.updatedAt,
          itemCount: shipping.content?.sections?.length || 0,
        };
      if (returns)
        newMeta["return"] = {
          key: "policy_return",
          updatedAt: returns.updatedAt,
          itemCount: returns.content?.sections?.length || 0,
        };
      if (global_settings)
        newMeta["global"] = {
          key: "settings_global",
          updatedAt: global_settings.updatedAt,
          itemCount: 4,
        };

      return newMeta;
    },
    staleTime: 60 * 1000,
  });

  const sections = [
    {
      id: "hero",
      title: "Hero Banners",
      subtitle: "Main Homepage Slider",
      description:
        "Manage high-impact visuals, headlines, and call-to-actions for the home page landing area.",
      icon: ImageIcon,
      path: "/admin/content/hero",
      metaKey: "hero",
      color: "bg-blue-50 text-blue-600",
    },
    {
      id: "footer",
      title: "Footer Navigation",
      subtitle: "Site-wide Footer",
      description:
        "Organize footer columns, links, and navigation structure across the entire website.",
      icon: LayoutTemplate,
      path: "/admin/content/footer",
      metaKey: "footer",
      color: "bg-purple-50 text-purple-600",
    },
    {
      id: "about",
      title: "About Page",
      subtitle: "/about",
      description:
        "Manage the brand story, stats, and editorial content blocks.",
      icon: CheckCircle,
      path: "/admin/content/about",
      metaKey: "about",
      color: "bg-amber-50 text-amber-600",
    },

    {
      id: "shipping",
      title: "Shipping Policy",
      subtitle: "/shipping",
      description:
        "Manage delivery areas, timelines, and shipping costs information.",
      icon: Clock,
      path: "/admin/content/shipping",
      metaKey: "shipping",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      id: "return",
      title: "Return Policy",
      subtitle: "/return",
      description: "Manage return windows, conditions, and exchange processes.",
      icon: ArrowRight,
      path: "/admin/content/return",
      metaKey: "return",
      color: "bg-rose-50 text-rose-600",
    },
    {
      id: "announcement",
      title: "Announcement Bar",
      subtitle: "Site-wide Banner",
      description:
        "Configure the promotional banner that appears at the top of every page.",
      icon: Bell,
      path: "/admin/content/announcement",
      metaKey: "announcement",
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2 border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-serif font-bold text-gray-900">
          Content Management
        </h1>
        <p className="text-gray-500 max-w-2xl text-sm leading-relaxed">
          Control the dynamic aspects of your storefront. Updates made here are
          reflected immediately on the live site.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          const sectionMeta = meta[section.metaKey];

          return (
            <div
              key={section.id}
              className="group bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden relative"
            >
              <div className="flex flex-col md:flex-row p-6 md:p-8 gap-6 md:gap-8 items-start relative z-10">
                <div
                  className={`p-4 rounded-2xl ${section.color} shrink-0 ring-1 ring-black/5`}
                >
                  <Icon className="w-8 h-8" />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-900 leading-none">
                      {section.title}
                    </h3>
                    {loading ? (
                      <div className="h-5 w-20 bg-gray-100 animate-pulse rounded-full" />
                    ) : sectionMeta ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                        Inactive
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {section.subtitle}
                  </p>

                  <p className="text-gray-600 text-sm leading-relaxed max-w-lg">
                    {section.description}
                  </p>

                  <div className="flex items-center gap-6 pt-2 text-xs text-gray-400 font-medium">
                    {loading ? (
                      <div className="h-4 w-32 bg-gray-100 animate-pulse rounded" />
                    ) : sectionMeta ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                          {sectionMeta.itemCount} Items
                        </div>
                        {sectionMeta.updatedAt && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            Updated{" "}
                            {format(
                              new Date(sectionMeta.updatedAt),
                              "MMM d, yyyy • h:mm a",
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <span>No content found</span>
                    )}
                  </div>
                </div>

                <div className="self-start md:self-center shrink-0">
                  <Button
                    onClick={() => setActiveEditor(section.id as ContentType)}
                    variant="secondary"
                    className="w-full md:w-auto"
                  >
                    Manage Content
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>

              <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          );
        })}
      </div>

      {activeEditor === "hero" && (
        <HeroEditor onClose={() => setActiveEditor(null)} />
      )}

      {activeEditor === "footer" && (
        <FooterEditor onClose={() => setActiveEditor(null)} />
      )}

      {activeEditor === "about" && (
        <AboutEditor onClose={() => setActiveEditor(null)} />
      )}

      {activeEditor === "shipping" && (
        <PolicyEditor
          title="Shipping Policy"
          policyKey="policy_shipping"
          onClose={() => setActiveEditor(null)}
        />
      )}

      {activeEditor === "return" && (
        <PolicyEditor
          title="Return Policy"
          policyKey="policy_return"
          onClose={() => setActiveEditor(null)}
        />
      )}

      {activeEditor === "announcement" && (
        <AnnouncementEditor onClose={() => setActiveEditor(null)} />
      )}
    </div>
  );
}
