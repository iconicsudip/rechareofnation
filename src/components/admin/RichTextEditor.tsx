"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Italic, List, ListOrdered, Heading2, Link as LinkIcon, Undo, Redo } from "lucide-react";

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (html: string) => void;
}

const barBtn = (active: boolean): React.CSSProperties => ({
  width: "28px", height: "28px", borderRadius: "6px", display: "flex",
  alignItems: "center", justifyContent: "center", cursor: "pointer", border: "none",
  background: active ? "rgba(99,102,241,0.25)" : "transparent",
  color: active ? "#818CF8" : "rgba(148,163,184,0.7)",
});

export default function RichTextEditor({ label, value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false })],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "rn-rich-text-editor",
        style: "min-height: 160px; padding: 12px; outline: none; font-size: 13px; color: #E2E8F0;",
      },
    },
  });

  return (
    <div>
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "rgba(148,163,184,0.5)" }}>
          {label}
        </label>
      )}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", overflow: "hidden" }}>
        {editor && (
          <div className="flex items-center gap-1 px-2 py-1.5 flex-wrap" style={{ borderBottom: "1px solid rgba(99,102,241,0.15)" }}>
            <button type="button" style={barBtn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={13} /></button>
            <button type="button" style={barBtn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={13} /></button>
            <button type="button" style={barBtn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={13} /></button>
            <button type="button" style={barBtn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={13} /></button>
            <button type="button" style={barBtn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={13} /></button>
            <button type="button" style={barBtn(editor.isActive("link"))} onClick={() => {
              const url = window.prompt("Link URL");
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }}><LinkIcon size={13} /></button>
            <div className="flex-1" />
            <button type="button" style={barBtn(false)} onClick={() => editor.chain().focus().undo().run()}><Undo size={13} /></button>
            <button type="button" style={barBtn(false)} onClick={() => editor.chain().focus().redo().run()}><Redo size={13} /></button>
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
