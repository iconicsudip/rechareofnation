"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Check, CalendarDays, MapPin, RefreshCw, AlertCircle } from "lucide-react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface Competition {
  id: string;
  name: string;
  slug: string;
  description: string;
  summary: string;
  banner_url: string;
  event_date: string;
  deadline: string;
  venue: string;
  city: string;
  prize_pool: string;
  registration_fee: number;
  categories: unknown[];
  rules: unknown[];
  judges: unknown[];
  faqs: unknown[];
  regional_hubs: unknown[];
  organizer: Record<string, unknown>;
  is_active: boolean;
}

const EMPTY_FORM = {
  name: "", slug: "", city: "", venue: "", eventDate: "", deadline: "",
  bannerUrl: "", prizePool: "", registrationFee: "0", summary: "", description: "",
};

const EMPTY_JSON_FIELDS = {
  categories: "[]", rules: "[]", judges: "[]", faqs: "[]", regionalHubs: "[]", organizer: "{}",
};

const S = {
  card: { background: "rgba(15,23,42,0.6)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: "16px" },
  input: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", color: "#E2E8F0", outline: "none", padding: "10px 12px", fontSize: "13px", width: "100%" },
  btn: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "none" },
  mono: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "12px" },
};

export default function AdminCompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Competition | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [jsonFields, setJsonFields] = useState(EMPTY_JSON_FIELDS);
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/competitions");
    const data = await res.json();
    setCompetitions(data.competitions ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setJsonFields(EMPTY_JSON_FIELDS);
    setJsonErrors({});
    setPanelOpen(true);
  };

  const openEdit = (c: Competition) => {
    setEditTarget(c);
    setForm({
      name: c.name, slug: c.slug, city: c.city || "", venue: c.venue || "",
      eventDate: c.event_date?.slice(0, 10) || "", deadline: c.deadline?.slice(0, 10) || "",
      bannerUrl: c.banner_url || "", prizePool: c.prize_pool || "",
      registrationFee: String(c.registration_fee ?? 0), summary: c.summary || "", description: c.description || "",
    });
    setJsonFields({
      categories: JSON.stringify(c.categories ?? [], null, 2),
      rules: JSON.stringify(c.rules ?? [], null, 2),
      judges: JSON.stringify(c.judges ?? [], null, 2),
      faqs: JSON.stringify(c.faqs ?? [], null, 2),
      regionalHubs: JSON.stringify(c.regional_hubs ?? [], null, 2),
      organizer: JSON.stringify(c.organizer ?? {}, null, 2),
    });
    setJsonErrors({});
    setPanelOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed: Record<string, unknown> = {};
    const errors: Record<string, string> = {};
    for (const [k, raw] of Object.entries(jsonFields)) {
      try { parsed[k] = JSON.parse(raw); } catch { errors[k] = "Invalid JSON"; }
    }
    if (Object.keys(errors).length > 0) { setJsonErrors(errors); return; }

    setSaving(true);
    const body = {
      ...form,
      registrationFee: Number(form.registrationFee) || 0,
      ...parsed,
      ...(editTarget ? { id: editTarget.id } : {}),
    };
    await fetch("/api/admin/competitions", {
      method: editTarget ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    setPanelOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/competitions?id=${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    load();
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6" style={{ color: "#E2E8F0" }}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Competitions</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(148,163,184,0.6)" }}>{competitions.length} competitions total</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} style={{ ...S.btn, background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={openCreate} style={{ ...S.btn, background: "linear-gradient(135deg, #4F46E5, #DB2777)", color: "#fff" }}>
            <Plus size={14} /> New Competition
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: "rgba(99,102,241,0.06)" }} />)}
        </div>
      ) : competitions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24" style={S.card}>
          <p style={{ color: "rgba(148,163,184,0.5)" }}>No competitions yet. Create your first one.</p>
          <button onClick={openCreate} style={{ ...S.btn, background: "linear-gradient(135deg,#4F46E5,#DB2777)", color: "#fff" }}>
            <Plus size={14} /> New Competition
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitions.map((c) => (
            <div key={c.id} className="p-5 flex flex-col gap-3" style={S.card}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-white text-sm leading-tight">{c.name}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: "rgba(148,163,184,0.4)" }}>/{c.slug}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.12)", color: "#818CF8" }}><Pencil size={12} /></button>
                  {deleteConfirm === c.id ? (
                    <button onClick={() => handleDelete(c.id)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.15)", color: "#F87171" }}><Check size={12} /></button>
                  ) : (
                    <button onClick={() => setDeleteConfirm(c.id)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)", color: "#F87171" }}><Trash2 size={12} /></button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(148,163,184,0.7)" }}><CalendarDays size={11} /> {c.event_date?.slice(0, 10)}</div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(148,163,184,0.5)" }}><MapPin size={11} /> {c.venue}, {c.city}</div>
              <div className="text-xs font-semibold" style={{ color: "#FBBF24" }}>{c.prize_pool}</div>
            </div>
          ))}
        </div>
      )}

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPanelOpen(false)} />
          <div className="relative w-full max-w-xl h-full overflow-y-auto flex flex-col" style={{ background: "#0F1729", borderLeft: "1px solid rgba(99,102,241,0.2)" }}>
            <div className="flex items-center justify-between p-6 border-b sticky top-0 z-10" style={{ borderColor: "rgba(99,102,241,0.15)", background: "#0F1729" }}>
              <h2 className="font-extrabold text-white text-lg">{editTarget ? "Edit Competition" : "Create Competition"}</h2>
              <button onClick={() => setPanelOpen(false)} className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", color: "#94A3B8" }}><X size={16} /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 flex flex-col gap-5 flex-1">
              {[
                { label: "Competition Name", key: "name", type: "text", required: true },
                { label: "URL Slug", key: "slug", type: "text", required: true },
                { label: "City", key: "city", type: "text" },
                { label: "Venue", key: "venue", type: "text" },
                { label: "Grand Finale Date", key: "eventDate", type: "date", required: true },
                { label: "Registration Deadline", key: "deadline", type: "date" },
                { label: "Prize Pool", key: "prizePool", type: "text" },
                { label: "Registration Fee (₹)", key: "registrationFee", type: "number" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "rgba(148,163,184,0.5)" }}>{f.label}</label>
                  <input type={f.type} style={S.input} required={f.required}
                    value={(form as Record<string, string>)[f.key]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}

              <ImageUploadField label="Banner Image" value={form.bannerUrl} onChange={(url) => setForm((p) => ({ ...p, bannerUrl: url }))} />

              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "rgba(148,163,184,0.5)" }}>Summary</label>
                <textarea rows={2} style={{ ...S.input, resize: "vertical" }} value={form.summary}
                  onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))} />
              </div>

              <RichTextEditor label="Full Description" value={form.description} onChange={(html) => setForm((p) => ({ ...p, description: html }))} />

              {Object.entries(jsonFields).map(([field, val]) => (
                <div key={field}>
                  <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "rgba(148,163,184,0.5)" }}>
                    {field} <span className="normal-case font-normal" style={{ color: "rgba(148,163,184,0.35)" }}>(JSON)</span>
                  </label>
                  <textarea rows={6} style={{ ...S.input, ...S.mono, resize: "vertical", borderColor: jsonErrors[field] ? "#F87171" : S.input.border }}
                    value={val} onChange={(e) => setJsonFields((p) => ({ ...p, [field]: e.target.value }))} />
                  {jsonErrors[field] && (
                    <p className="flex items-center gap-1.5 text-xs mt-1.5" style={{ color: "#F87171" }}><AlertCircle size={12} /> {jsonErrors[field]}</p>
                  )}
                </div>
              ))}

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setPanelOpen(false)}
                  style={{ ...S.btn, flex: 1, justifyContent: "center", background: "rgba(255,255,255,0.05)", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.08)" }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ ...S.btn, flex: 2, justifyContent: "center", background: saving ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg, #4F46E5, #DB2777)", color: "#fff" }}>
                  {saving ? "Saving..." : editTarget ? "Update Competition" : "Create Competition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
