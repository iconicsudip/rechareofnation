"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

interface SimpleListEditorProps {
  label?: string;
  value: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

const S = {
  input: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: "8px", color: "#E2E8F0", outline: "none", padding: "9px 12px", fontSize: "13px", width: "100%",
  },
  btn: {
    display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 14px",
    borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: "none",
  },
};

export default function SimpleListEditor({ label, value, onChange, placeholder = "Add an item..." }: SimpleListEditorProps) {
  const items = value ?? [];
  const [draft, setDraft] = useState("");

  const add = () => {
    if (draft.trim()) {
      onChange([...items, draft.trim()]);
      setDraft("");
    }
  };

  return (
    <div>
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "rgba(148,163,184,0.5)" }}>
          {label}
        </label>
      )}
      <div className="flex gap-2 mb-2">
        <input
          style={S.input}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        />
        <button type="button" onClick={add} style={{ ...S.btn, background: "rgba(99,102,241,0.15)", color: "#818CF8" }}>
          <Plus size={12} /> Add
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs"
            style={{ background: "rgba(255,255,255,0.02)", color: "rgba(226,232,240,0.8)" }}>
            <span>{item}</span>
            <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              style={{ color: "#F87171", background: "none", border: "none", cursor: "pointer" }}>
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
