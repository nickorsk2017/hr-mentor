"use client";

import React, { useEffect, useImperativeHandle } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "./Button";
import type { Size } from "./Button";

type RichEditorProps = {
  valueHtml: string;
  onChangeHtml: (nextHtml: string) => void;
  autoFocus?: boolean;
  className?: string;
  size?: Size;
  classToolbar?: string;
  onMouseUp?: (e: React.MouseEvent<HTMLDivElement>) => void;
};

export type RichEditorHandle = {
  focus: () => void;
};

export const RichEditor = React.forwardRef<RichEditorHandle, RichEditorProps>(function RichEditor({
  valueHtml,
  onChangeHtml,
  autoFocus,
  className,
  size = "medium",
  classToolbar,
  onMouseUp,
}, ref) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: valueHtml || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "min-h-[260px] p-3 text-lg leading-relaxed text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-900/5 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_li]:my-1 [&_h2]:text-[30px] [&_h2]:leading-[38px] [&_h2]:font-semibold [&_h2]:my-2",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChangeHtml(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== valueHtml) {
      editor.commands.setContent(valueHtml || "<p></p>");
    }
  }, [editor, valueHtml]);

  useEffect(() => {
    if (!editor) return;
    if (autoFocus) {
      // Place caret at the very start of the document
      editor.commands.setTextSelection(0);
      editor.commands.focus("start");
    }
  }, [editor, autoFocus]);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        if (!editor) return;
        
        editor.commands.setTextSelection(0);
        editor.commands.focus("start");
      },
    }),
    [editor]
  );

  if (!editor) return null;

  return (
    <div
      onClick={onMouseUp}
      className={`cursor-text height-auto border border-zinc-200 bg-white border-t-0 ${
        className ?? ""
      }`}
    >
      {/* Toolbar sticks to the top of this scrollable editor card */}
      <div className={`sticky top-20.5 z-30 flex flex-wrap items-center gap-1 border-t border-b border-zinc-200 bg-white/90 px-3 py-2 backdrop-blur ${classToolbar}`}>
        <Button
          type="button"
          size={size}
          appearance="secondary"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </Button>
        <Button
          type="button"
          size={size}
          appearance="secondary"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </Button>
        <Button
          type="button"
          size={size}
          appearance="secondary"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Bullets
        </Button>
        <Button
          type="button"
          size={size}
          appearance="secondary"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          Numbered
        </Button>
        <Button
          type="button"
          size={size}
          appearance="secondary"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </Button>
        <Button
          type="button"
          size={size}
          appearance="secondary"
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          P
        </Button>
        <Button
          type="button"
          size={size}
          appearance="ghost"
          disabled={!editor.can().chain().focus().undo().run()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          Undo
        </Button>
        <Button
          type="button"
          size={size}
          appearance="ghost"
          disabled={!editor.can().chain().focus().redo().run()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          Redo
        </Button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
});

