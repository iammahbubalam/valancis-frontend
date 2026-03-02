"use client";

import { GlobalSettingsEditor } from "@/components/admin/content/GlobalSettingsEditor";

export default function SettingsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-2 border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-serif font-bold text-gray-900">
          Global Settings
        </h1>
        <p className="text-gray-500 max-w-2xl text-sm leading-relaxed">
          Manage site-wide configuration, including branding, contact
          information, social media links, and default SEO settings.
        </p>
      </div>

      {/* Rendering Editor in "Embedded" mode */}
      <GlobalSettingsEditor isEmbedded={true} onClose={() => {}} />
    </div>
  );
}
