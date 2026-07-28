"use client";

import { Plus, Trash2 } from "lucide-react";

export interface RepeaterColumn {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea";
  placeholder?: string;
  span?: 1 | 2; // grid column span within a row (default 1)
}

interface RepeaterFieldProps<T extends Record<string, unknown>> {
  label?: string;
  hint?: string;
  columns: RepeaterColumn[];
  value: T[];
  onChange: (rows: T[]) => void;
  emptyRow: T;
  addLabel?: string;
}

const S = {
  input: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: "8px", color: "#E2E8F0", outline: "none", padding: "8px 10px", fontSize: "12.5px", width: "100%",
  },
  btn: {
    display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px",
    borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: "none",
  },
};

export default function RepeaterField<T extends Record<string, unknown>>({
  label, hint, columns, value, onChange, emptyRow, addLabel = "Add row",
}: RepeaterFieldProps<T>) {
  const rows = value ?? [];

  const updateRow = (index: number, key: string, val: string | number) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, [key]: val } : row)));
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const addRow = () => {
    onChange([...rows, { ...emptyRow }]);
  };

  return (
    <div>
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "rgba(148,163,184,0.5)" }}>
          {label}
        </label>
      )}
      {hint && <p className="text-[11px] mb-2" style={{ color: "rgba(148,163,184,0.4)" }}>{hint}</p>}

      <div className="flex flex-col gap-2.5">
        {rows.map((row, i) => (
          <div key={i} className="p-3 rounded-xl flex flex-col gap-2 relative" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="grid grid-cols-2 gap-2">
              {columns.map((col) => (
                <div key={col.key} className={col.span === 2 ? "col-span-2" : ""}>
                  {col.type === "textarea" ? (
                    <textarea
                      rows={2}
                      style={{ ...S.input, resize: "vertical" }}
                      placeholder={col.placeholder ?? col.label}
                      value={(row[col.key] as string) ?? ""}
                      onChange={(e) => updateRow(i, col.key, e.target.value)}
                    />
                  ) : (
                    <input
                      type={col.type === "number" ? "number" : "text"}
                      style={S.input}
                      placeholder={col.placeholder ?? col.label}
                      value={(row[col.key] as string | number) ?? ""}
                      onChange={(e) => updateRow(i, col.key, col.type === "number" ? Number(e.target.value) : e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.1)", color: "#F87171", border: "none", cursor: "pointer" }}
            >
              <Trash2 size={11} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1.5 mt-2.5"
        style={{ ...S.btn, background: "rgba(99,102,241,0.12)", color: "#818CF8" }}
      >
        <Plus size={12} /> {addLabel}
      </button>
    </div>
  );
}
