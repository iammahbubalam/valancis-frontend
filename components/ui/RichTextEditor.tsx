"use client";

import dynamic from "next/dynamic";

interface RichTextEditorInnerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

// Lazy load the heavy tiptap editor component
const RichTextEditorInner = dynamic<RichTextEditorInnerProps>(
  () => import("./RichTextEditorInner").then((mod) => mod.RichTextEditorInner),
  {
    ssr: false,
    loading: () => (
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white animate-pulse">
        <div className="h-10 bg-gray-50 border-b border-gray-100" />
        <div className="h-40 bg-gray-50" />
      </div>
    ),
  }
);

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  className,
}: RichTextEditorProps) {
  return (
    <RichTextEditorInner value={value} onChange={onChange} className={className} />
  );
}
