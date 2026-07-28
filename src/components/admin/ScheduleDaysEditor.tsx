"use client";

import { Plus, Trash2 } from "lucide-react";
import RepeaterField from "@/components/admin/RepeaterField";

export interface ScheduleItem { [key: string]: unknown; time: string; title: string; desc: string }
export interface ScheduleDay { dayLabel: string; items: ScheduleItem[] }

const EMPTY_ITEM: ScheduleItem = { time: "", title: "", desc: "" };

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

interface ScheduleDaysEditorProps {
  label?: string;
  value: ScheduleDay[];
  onChange: (days: ScheduleDay[]) => void;
}

export default function ScheduleDaysEditor({ label, value, onChange }: ScheduleDaysEditorProps) {
  const days = value ?? [];
  const updateDay = (i: number, patch: Partial<ScheduleDay>) =>
    onChange(days.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  const removeDay = (i: number) => onChange(days.filter((_, idx) => idx !== i));
  const addDay = () => onChange([...days, { dayLabel: `Day ${days.length + 1}`, items: [] }]);

  return (
    <div>
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "rgba(148,163,184,0.5)" }}>
          {label}
        </label>
      )}
      <div className="flex flex-col gap-4">
        {days.map((day, i) => (
          <div key={i} className="p-4 rounded-xl relative" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <button type="button" onClick={() => removeDay(i)}
              className="absolute top-3 right-3 w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.1)", color: "#F87171", border: "none", cursor: "pointer" }}>
              <Trash2 size={11} />
            </button>
            <input style={{ ...S.input, marginBottom: "10px", maxWidth: "60%" }} placeholder="Day label (e.g. Day 1: Oct 24)"
              value={day.dayLabel} onChange={(e) => updateDay(i, { dayLabel: e.target.value })} />
            <RepeaterField
              columns={[
                { key: "time", label: "Time (e.g. 07:30 PM)" },
                { key: "title", label: "Title" },
                { key: "desc", label: "Description", type: "textarea", span: 2 },
              ]}
              value={day.items as unknown as Record<string, unknown>[]}
              onChange={(items) => updateDay(i, { items: items as unknown as ScheduleItem[] })}
              emptyRow={EMPTY_ITEM}
              addLabel="Add schedule item"
            />
          </div>
        ))}
      </div>
      <button type="button" onClick={addDay} className="flex items-center gap-1.5 mt-2.5"
        style={{ ...S.btn, background: "rgba(99,102,241,0.12)", color: "#818CF8" }}>
        <Plus size={12} /> Add day
      </button>
    </div>
  );
}
