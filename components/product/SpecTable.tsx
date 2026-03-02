"use client";

import { ProductSpecs } from "@/types";

interface SpecTableProps {
  specs: ProductSpecs;
  productName: string;
}

/**
 * SpecTable - Machine-readable specifications
 *
 * Semantic HTML table for AI extraction with Schema.org markup.
 * Enables AI assistants to answer questions like "What's the RAM?" accurately.
 */
export function SpecTable({ specs, productName }: SpecTableProps) {
  const specEntries = Object.entries(specs);

  // L9: Don't render if no specs provided
  if (specEntries.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden my-8">
      <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Technical Specifications
        </h3>
      </div>

      <div className="overflow-x-auto">
        {/* Semantic table with Schema.org markup for AI readability */}
        <table
          className="w-full"
          itemScope
          itemType="https://schema.org/Product"
          itemProp="additionalProperty"
        >
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Specification
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {specEntries.map(([key, value], index) => (
              <tr
                key={key}
                className={
                  index % 2 === 0
                    ? "bg-white dark:bg-gray-800"
                    : "bg-gray-50 dark:bg-gray-900"
                }
                itemScope
                itemType="https://schema.org/PropertyValue"
              >
                <td
                  className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-200"
                  itemProp="name"
                >
                  {key}
                </td>
                <td
                  className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300"
                  itemProp="value"
                >
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Specifications are subject to manufacturer changes
        </p>
      </div>
    </div>
  );
}
