"use client";

import { ChevronUp, ChevronDown } from "lucide-react";

export interface ToggleableField {
  key: string;
  label: string;
  enabled: boolean;
}

interface FieldToggleListEditorProps<T extends ToggleableField> {
  label: string;
  hint?: string;
  value: T[];
  onChange: (v: T[]) => void;
}

// Shared show/hide + reorder editor for a fixed list of optional form fields —
// used for the admin's own Add/Edit Event field blocks, and for the per-event
// ticket booking / inquiry / competition registration form field configs.
export default function FieldToggleListEditor<T extends ToggleableField>({
  label, hint, value, onChange,
}: FieldToggleListEditorProps<T>) {
  const fields = value ?? [];

  const toggle = (idx: number) =>
    onChange(fields.map((f, i) => (i === idx ? { ...f, enabled: !f.enabled } : f)));

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "rgba(203,185,160,0.5)" }}>
        {label}
      </label>
      {hint && <p className="text-[11px] mb-2" style={{ color: "rgba(203,185,160,0.4)" }}>{hint}</p>}
      <div className="flex flex-col gap-2">
        {fields.map((f, idx) => (
          <div
            key={f.key}
            className="flex items-center justify-between gap-3 p-3 rounded-xl border transition-all"
            style={{
              background: f.enabled ? "rgba(217, 119, 6,0.06)" : "rgba(255,255,255,0.02)",
              borderColor: f.enabled ? "rgba(217, 119, 6,0.25)" : "rgba(255,255,255,0.06)",
              opacity: f.enabled ? 1 : 0.6,
            }}
          >
            <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
              <input
                type="checkbox"
                checked={f.enabled}
                onChange={() => toggle(idx)}
                className="w-4 h-4 rounded accent-amber-500 cursor-pointer shrink-0"
              />
              <span className="text-xs font-medium truncate" style={{ color: "#F5EEE2" }}>{f.label}</span>
            </label>
            <div className="flex items-center gap-1 shrink-0">
              <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0}
                className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-25"
                style={{ background: "rgba(217, 119, 6,0.1)", color: "#fbbf24", border: "none", cursor: "pointer" }}>
                <ChevronUp size={13} />
              </button>
              <button type="button" onClick={() => move(idx, 1)} disabled={idx === fields.length - 1}
                className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-25"
                style={{ background: "rgba(217, 119, 6,0.1)", color: "#fbbf24", border: "none", cursor: "pointer" }}>
                <ChevronDown size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
