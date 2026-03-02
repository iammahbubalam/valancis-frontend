"use client";

import { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";

interface SERPPreviewProps {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  baseUrl?: string;
}

/**
 * SERPPreview - Google Search Result Snippet Preview
 *
 * L9: Visual preview of how meta tags appear in Google search results.
 * Shows character limits and truncation behavior.
 */
export function SERPPreview({
  metaTitle,
  metaDescription,
  slug,
  baseUrl = "https://valancis.com",
}: SERPPreviewProps) {
  const [titleLength, setTitleLength] = useState(0);
  const [descLength, setDescLength] = useState(0);

  const MAX_TITLE_LENGTH = 60;
  const MAX_DESC_LENGTH = 160;

  useEffect(() => {
    setTitleLength(metaTitle.length);
    setDescLength(metaDescription.length);
  }, [metaTitle, metaDescription]);

  const truncateTitle = (title: string) => {
    if (title.length <= MAX_TITLE_LENGTH) return title;
    return title.substring(0, MAX_TITLE_LENGTH - 3) + "...";
  };

  const truncateDescription = (desc: string) => {
    if (desc.length <= MAX_DESC_LENGTH) return desc;
    return desc.substring(0, MAX_DESC_LENGTH - 3) + "...";
  };

  const fullUrl = `${baseUrl}/${slug}`;

  // Parse URL breadcrumb
  const urlParts = fullUrl.replace(/^https?:\/\//, "").split("/");
  const domain = urlParts[0];
  const breadcrumb = urlParts.slice(1).join(" › ");

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          SERP Preview
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <span
            className={`font-medium ${titleLength > MAX_TITLE_LENGTH ? "text-red-600" : "text-green-600"}`}
          >
            Title: {titleLength}/{MAX_TITLE_LENGTH}
          </span>
          <span
            className={`font-medium ${descLength > MAX_DESC_LENGTH ? "text-red-600" : "text-green-600"}`}
          >
            Desc: {descLength}/{MAX_DESC_LENGTH}
          </span>
        </div>
      </div>

      {/* Google-style Preview */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700">
        {/* URL Breadcrumb */}
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <ExternalLink className="w-3 h-3" />
            <span className="font-medium">{domain}</span>
            {breadcrumb && (
              <>
                <span className="mx-1">›</span>
                <span className="truncate max-w-md">{breadcrumb}</span>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl text-blue-600 dark:text-blue-400 mb-2 cursor-pointer hover:underline font-normal">
          {truncateTitle(metaTitle) || "Untitled Page"}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {truncateDescription(metaDescription) ||
            "No meta description provided"}
        </p>

        {/* Warning if exceeded */}
        {(titleLength > MAX_TITLE_LENGTH || descLength > MAX_DESC_LENGTH) && (
          <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-800 dark:text-yellow-400">
            ⚠️ {titleLength > MAX_TITLE_LENGTH && "Title"}
            {titleLength > MAX_TITLE_LENGTH &&
              descLength > MAX_DESC_LENGTH &&
              " and "}
            {descLength > MAX_DESC_LENGTH && "Description"} exceed{" "}
            {titleLength > MAX_TITLE_LENGTH && descLength > MAX_DESC_LENGTH
              ? ""
              : "s"}{" "}
            recommended length
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>
          <strong>Note:</strong> Actual Google results may vary based on device,
          intent, and other factors. This is an approximate preview.
        </p>
      </div>
    </div>
  );
}
