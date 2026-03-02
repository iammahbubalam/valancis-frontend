"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import React, { useEffect } from "react";
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading2,
    Quote,
    Undo,
    Redo,
    Strikethrough,
    Minus,
    Link as LinkIcon,
    Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorInnerProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function RichTextEditorInner({
    value,
    onChange,
    className,
}: RichTextEditorInnerProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-blue-600 underline cursor-pointer",
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "max-w-full h-auto rounded-lg my-4",
                },
            }),
        ],
        content: value || "", // Initial content
        editorProps: {
            attributes: {
                class:
                    "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[150px] p-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-xl [&_h3]:font-bold [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic",
            },
        },
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || "");
        }
    }, [value, editor]);

    if (!editor) {
        return null;
    }

    const ToolbarButton = ({
        onClick,
        isActive = false,
        children,
        title,
    }: {
        onClick: () => void;
        isActive?: boolean;
        children: React.ReactNode;
        title?: string;
    }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={cn(
                "p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-700",
                isActive && "bg-gray-200 text-gray-900 font-medium",
            )}
        >
            {children}
        </button>
    );

    return (
        <div
            className={cn(
                "border border-gray-200 rounded-lg overflow-hidden bg-white",
                className,
            )}
        >
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 p-1.5 bg-gray-50/50">
                <div className="flex items-center gap-0.5 mr-2 pr-2 border-r border-gray-200">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive("bold")}
                        title="Bold"
                    >
                        <Bold className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive("italic")}
                        title="Italic"
                    >
                        <Italic className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive("strike")}
                        title="Strikethrough"
                    >
                        <Strikethrough className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                <div className="flex items-center gap-0.5 mr-2 pr-2 border-r border-gray-200">
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleHeading({ level: 2 }).run()
                        }
                        isActive={editor.isActive("heading", { level: 2 })}
                        title="Heading 2"
                    >
                        <Heading2 className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive("bulletList")}
                        title="Bullet List"
                    >
                        <List className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive("orderedList")}
                        title="Ordered List"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive("blockquote")}
                        title="Blockquote"
                    >
                        <Quote className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        title="Horizontal Rule"
                    >
                        <Minus className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                <div className="flex items-center gap-0.5 mr-2 pr-2 border-r border-gray-200">
                    <ToolbarButton
                        onClick={() => {
                            const url = window.prompt("Enter URL");
                            if (url) {
                                editor.chain().focus().setLink({ href: url }).run();
                            }
                        }}
                        isActive={editor.isActive("link")}
                        title="Insert Link"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => {
                            const url = window.prompt("Enter Image URL");
                            if (url) {
                                editor.chain().focus().setImage({ src: url }).run();
                            }
                        }}
                        title="Insert Image"
                    >
                        <ImageIcon className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                <div className="flex items-center gap-0.5">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        title="Undo"
                    >
                        <Undo className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        title="Redo"
                    >
                        <Redo className="w-4 h-4" />
                    </ToolbarButton>
                </div>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} />
        </div>
    );
}
