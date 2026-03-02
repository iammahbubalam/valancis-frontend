"use client";

import { PolicyPage } from "@/lib/content-types";
import { format } from "date-fns";

interface PolicyViewerProps {
  title: string;
  data: PolicyPage | null;
}

export function PolicyViewer({ title, data }: PolicyViewerProps) {
  if (!data) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <h1 className="text-3xl font-serif mb-4">{title}</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-16 px-6 md:px-0">
      <div className="mb-12 border-b border-gray-100 pb-8">
        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
          {title}
        </h1>
        <p className="text-sm text-gray-500 uppercase tracking-widest font-medium">
          Last Updated:{" "}
          {data.lastUpdated
            ? format(new Date(data.lastUpdated), "MMMM d, yyyy")
            : "Recently"}
        </p>
      </div>

      <div className="space-y-12">
        {data.sections.map((section, idx) => (
          <section key={idx} className="space-y-4">
            {section.heading && (
              <h2 className="text-xl font-bold text-gray-900 tracking-wide uppercase">
                {section.heading}
              </h2>
            )}

            {section.content && (
              <p className="text-gray-600 leading-relaxed font-sans text-lg">
                {section.content}
              </p>
            )}

            {section.listItems && (
              <ul className="list-disc pl-5 space-y-2 text-gray-600 text-lg">
                {section.listItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
