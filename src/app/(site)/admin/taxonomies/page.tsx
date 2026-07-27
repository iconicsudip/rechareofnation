"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Tags, X } from "lucide-react";

interface Taxonomy {
  id: string;
  type: string;
  value: string;
}

const TYPES = [
  { key: "event_category", label: "Event Categories" },
  { key: "competition_category", label: "Competition Categories" },
  { key: "blog_category", label: "Blog Categories" },
  { key: "gallery_category", label: "Gallery Categories" },
  { key: "city", label: "Cities" },
];

const S = {
  card: { background: "rgba(15,23,42,0.6)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: "16px" },
  input: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", color: "#E2E8F0", outline: "none", padding: "9px 12px", fontSize: "13px", width: "100%" },
  btn: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: "none" },
};

export default function AdminTaxonomiesPage() {
  const [activeType, setActiveType] = useState(TYPES[0].key);
  const [items, setItems] = useState<Taxonomy[]>([]);
  const [loading, setLoading] = useState(true);
  const [newValue, setNewValue] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/taxonomies?type=${activeType}`);
    const data = await res.json();
    setItems(data.taxonomies ?? []);
    setLoading(false);
  }, [activeType]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!newValue.trim()) return;
    setSaving(true);
    await fetch("/api/admin/taxonomies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: activeType, value: newValue.trim() }),
    });
    setNewValue("");
    setSaving(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/taxonomies?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6" style={{ color: "#E2E8F0" }}>
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Categories &amp; Cities</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(148,163,184,0.6)" }}>
          Manage the dropdown options used across events, competitions, blogs, and gallery.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveType(t.key)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
            style={{
              background: activeType === t.key ? "linear-gradient(135deg, rgba(79,70,229,0.3), rgba(219,39,119,0.15))" : "rgba(99,102,241,0.06)",
              color: activeType === t.key ? "#fff" : "rgba(148,163,184,0.6)",
              border: activeType === t.key ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={S.card} className="p-5 flex flex-col gap-4">
        <div className="flex gap-2">
          <input
            style={S.input}
            placeholder={`Add a new ${TYPES.find(t => t.key === activeType)?.label.toLowerCase().replace(/s$/, "")}...`}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button onClick={handleAdd} disabled={saving || !newValue.trim()}
            style={{ ...S.btn, background: "linear-gradient(135deg,#4F46E5,#DB2777)", color: "#fff", opacity: saving || !newValue.trim() ? 0.6 : 1 }}>
            <Plus size={13} /> Add
          </button>
        </div>

        {loading ? (
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-8 w-24 rounded-full animate-pulse" style={{ background: "rgba(99,102,241,0.08)" }} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10">
            <Tags size={28} style={{ color: "rgba(148,163,184,0.2)" }} />
            <p className="text-sm" style={{ color: "rgba(148,163,184,0.5)" }}>No entries yet.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "rgba(99,102,241,0.1)", color: "#C7D2FE", border: "1px solid rgba(99,102,241,0.2)" }}
              >
                {item.value}
                <button onClick={() => handleDelete(item.id)} style={{ color: "rgba(248,113,113,0.8)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs px-4 py-3 rounded-xl" style={{ background: "rgba(99,102,241,0.06)", color: "rgba(148,163,184,0.6)" }}>
        <Trash2 size={12} className="flex-shrink-0" />
        Deleting a category here does not change existing events/blogs/etc. already using that value — it just removes it from the picker for new entries.
      </div>
    </div>
  );
}
