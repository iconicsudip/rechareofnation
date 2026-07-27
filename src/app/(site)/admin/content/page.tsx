"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText, Check, RefreshCw, AlertCircle } from "lucide-react";

interface SiteContentRow {
  key: string;
  value: Record<string, unknown>;
  updated_at?: string;
}

const KEY_META: Record<string, { label: string; description: string }> = {
  homepage_hero: { label: "Homepage Hero Slides", description: "The rotating hero banner on the homepage." },
  homepage_testimonials: { label: "Homepage Testimonials", description: "The scrolling testimonial wall." },
  homepage_partner_logos: { label: "Homepage Partner Logos", description: "Brand names in the trusted-partners marquee." },
  about_page: { label: "About Page", description: "Mission copy, milestones, and core values." },
  contact_info: { label: "Contact Page", description: "Address, phone, email, and map." },
  footer: { label: "Footer", description: "Brand description, newsletter copy, and link columns." },
  nav_links: { label: "Navigation Menu", description: "The main nav bar items." },
  legal_terms: { label: "Terms & Conditions", description: "Full legal document body." },
  legal_privacy: { label: "Privacy Policy", description: "Full legal document body." },
  sponsorship_tiers: { label: "Sponsorship Tiers", description: "Pricing packages shown on the sponsors page." },
};

const KEY_ORDER = Object.keys(KEY_META);

const S = {
  card: { background: "rgba(15,23,42,0.6)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: "16px" },
  input: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", color: "#E2E8F0", outline: "none", padding: "9px 12px", fontSize: "13px", width: "100%" },
  btn: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "none" },
  mono: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "12px" },
};

// Fields long enough to need a textarea rather than a single-line input
const isLongText = (v: string) => v.length > 90 || v.includes("\n");

export default function AdminContentPage() {
  const [rows, setRows] = useState<Record<string, SiteContentRow>>({});
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState(KEY_ORDER[0]);
  const [scalarFields, setScalarFields] = useState<Record<string, string>>({});
  const [jsonFields, setJsonFields] = useState<Record<string, string>>({});
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/site-content");
    const data = await res.json();
    const map: Record<string, SiteContentRow> = {};
    for (const r of data.contents ?? []) map[r.key] = r;
    setRows(map);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const value = rows[activeKey]?.value ?? {};
    const scalars: Record<string, string> = {};
    const jsons: Record<string, string> = {};
    for (const [k, v] of Object.entries(value)) {
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        scalars[k] = String(v);
      } else {
        jsons[k] = JSON.stringify(v, null, 2);
      }
    }
    setScalarFields(scalars);
    setJsonFields(jsons);
    setJsonErrors({});
    setSaved(false);
  }, [activeKey, rows]);

  const handleSave = async () => {
    const merged: Record<string, unknown> = { ...scalarFields };
    const errors: Record<string, string> = {};
    for (const [k, raw] of Object.entries(jsonFields)) {
      try {
        merged[k] = JSON.parse(raw);
      } catch {
        errors[k] = "Invalid JSON — fix before saving.";
      }
    }
    if (Object.keys(errors).length > 0) {
      setJsonErrors(errors);
      return;
    }
    setSaving(true);
    await fetch("/api/admin/site-content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: activeKey, value: merged }),
    });
    setSaving(false);
    setSaved(true);
    load();
  };

  const meta = KEY_META[activeKey];

  return (
    <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-6" style={{ color: "#E2E8F0" }}>
      {/* Sidebar */}
      <div className="lg:w-64 flex-shrink-0 flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-white tracking-tight mb-1">Site Content</h1>
        <p className="text-xs mb-4" style={{ color: "rgba(148,163,184,0.6)" }}>Edit copy shown across the public site.</p>
        {KEY_ORDER.map((key) => (
          <button
            key={key}
            onClick={() => setActiveKey(key)}
            className="text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{
              background: activeKey === key ? "linear-gradient(135deg, rgba(79,70,229,0.25), rgba(219,39,119,0.12))" : "transparent",
              color: activeKey === key ? "#fff" : "rgba(148,163,184,0.7)",
              border: activeKey === key ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
            }}
          >
            {KEY_META[key].label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 min-w-0">
        {loading ? (
          <div className="h-64 rounded-2xl animate-pulse" style={{ background: "rgba(99,102,241,0.06)" }} />
        ) : (
          <div style={S.card} className="p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-extrabold text-white text-lg">{meta.label}</h2>
                <p className="text-xs mt-1" style={{ color: "rgba(148,163,184,0.6)" }}>{meta.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={load} style={{ ...S.btn, background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>
                  <RefreshCw size={13} /> Refresh
                </button>
                <button onClick={handleSave} disabled={saving}
                  style={{ ...S.btn, background: saving ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg,#4F46E5,#DB2777)", color: "#fff" }}>
                  {saving ? "Saving..." : saved ? <><Check size={14} /> Saved</> : "Save Changes"}
                </button>
              </div>
            </div>

            {Object.keys(scalarFields).length === 0 && Object.keys(jsonFields).length === 0 && (
              <div className="flex items-center gap-2 text-sm py-8 justify-center" style={{ color: "rgba(148,163,184,0.5)" }}>
                <FileText size={16} /> No content seeded for this key yet.
              </div>
            )}

            {Object.entries(scalarFields).map(([field, val]) => (
              <div key={field}>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "rgba(148,163,184,0.5)" }}>
                  {field}
                </label>
                {isLongText(val) ? (
                  <textarea rows={4} style={{ ...S.input, resize: "vertical" }} value={val}
                    onChange={(e) => setScalarFields((p) => ({ ...p, [field]: e.target.value }))} />
                ) : (
                  <input style={S.input} value={val}
                    onChange={(e) => setScalarFields((p) => ({ ...p, [field]: e.target.value }))} />
                )}
              </div>
            ))}

            {Object.entries(jsonFields).map(([field, val]) => (
              <div key={field}>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-2" style={{ color: "rgba(148,163,184,0.5)" }}>
                  {field} <span className="normal-case font-normal" style={{ color: "rgba(148,163,184,0.35)" }}>(structured data — edit as JSON)</span>
                </label>
                <textarea
                  rows={14}
                  style={{ ...S.input, ...S.mono, resize: "vertical", borderColor: jsonErrors[field] ? "#F87171" : S.input.border }}
                  value={val}
                  onChange={(e) => setJsonFields((p) => ({ ...p, [field]: e.target.value }))}
                />
                {jsonErrors[field] && (
                  <p className="flex items-center gap-1.5 text-xs mt-1.5" style={{ color: "#F87171" }}>
                    <AlertCircle size={12} /> {jsonErrors[field]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
