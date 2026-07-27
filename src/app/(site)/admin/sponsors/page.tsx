"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Star, Globe, X, Check, RefreshCw } from "lucide-react";

interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  tier: string;
  website_url: string;
  created_at: string;
}

const TIERS = ["Title", "Platinum", "Gold", "Media", "Partner"];

const TIER_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Title:    { bg: "rgba(250,204,21,0.12)",  color: "#FBBF24", border: "rgba(250,204,21,0.25)" },
  Platinum: { bg: "rgba(226,232,240,0.1)",  color: "#CBD5E1", border: "rgba(203,213,225,0.2)" },
  Gold:     { bg: "rgba(251,191,36,0.12)",  color: "#F59E0B", border: "rgba(251,191,36,0.25)" },
  Media:    { bg: "rgba(96,165,250,0.12)",  color: "#60A5FA", border: "rgba(96,165,250,0.25)" },
  Partner:  { bg: "rgba(167,139,250,0.12)", color: "#A78BFA", border: "rgba(167,139,250,0.25)" },
};

const EMPTY = { name: "", logo_url: "", tier: TIERS[0], website_url: "" };

const S = {
  card:  { background: "rgba(15,23,42,0.6)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: "16px" },
  input: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", color: "#E2E8F0", outline: "none", padding: "10px 12px", fontSize: "13px", width: "100%" },
  btn:   { display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "none" },
};

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Sponsor | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchSponsors = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/sponsors");
    const data = await res.json();
    setSponsors(data.sponsors ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSponsors(); }, [fetchSponsors]);

  const openCreate = () => { setEditTarget(null); setForm({ ...EMPTY }); setShowModal(true); };
  const openEdit = (sp: Sponsor) => { setEditTarget(sp); setForm({ name: sp.name, logo_url: sp.logo_url, tier: sp.tier, website_url: sp.website_url }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    const method = editTarget ? "PUT" : "POST";
    const body = editTarget ? { ...form, id: editTarget.id } : form;
    await fetch("/api/admin/sponsors", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    setShowModal(false);
    fetchSponsors();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/sponsors?id=${id}`, { method: "DELETE" });
    setDeleteId(null);
    fetchSponsors();
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6" style={{ color: "#E2E8F0" }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Sponsors</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(148,163,184,0.6)" }}>{sponsors.length} sponsors in the database</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchSponsors} style={{ ...S.btn, background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={openCreate} style={{ ...S.btn, background: "linear-gradient(135deg,#4F46E5,#DB2777)", color: "#fff" }}>
            <Plus size={14} /> Add Sponsor
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background: "rgba(99,102,241,0.06)" }} />
          ))}
        </div>
      ) : sponsors.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24" style={S.card}>
          <Star size={40} style={{ color: "rgba(148,163,184,0.2)" }} />
          <p style={{ color: "rgba(148,163,184,0.5)" }}>No sponsors yet. Add your first sponsor.</p>
          <button onClick={openCreate} style={{ ...S.btn, background: "linear-gradient(135deg,#4F46E5,#DB2777)", color: "#fff" }}>
            <Plus size={14} /> Add Sponsor
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sponsors.map((sp) => {
            const tc = TIER_COLORS[sp.tier] ?? TIER_COLORS.Partner;
            return (
              <div key={sp.id} className="p-5 flex flex-col gap-4 relative group" style={S.card}>
                {/* Tier badge */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
                    style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                    {sp.tier}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(sp)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(99,102,241,0.12)", color: "#818CF8" }}>
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => setDeleteId(sp.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#F87171" }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Logo */}
                <div className="w-full h-16 rounded-xl flex items-center justify-center overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {sp.logo_url ? (
                    <img src={sp.logo_url} alt={sp.name} className="max-h-12 max-w-full object-contain" />
                  ) : (
                    <Star size={24} style={{ color: tc.color, opacity: 0.4 }} />
                  )}
                </div>

                {/* Info */}
                <div>
                  <div className="font-bold text-white text-sm">{sp.name}</div>
                  {sp.website_url && (
                    <a href={sp.website_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs mt-1 hover:underline"
                      style={{ color: "rgba(148,163,184,0.5)" }}>
                      <Globe size={10} /> {sp.website_url.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md p-6 flex flex-col gap-4" style={{ ...S.card, background: "#0F1729" }}>
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-white text-lg">{editTarget ? "Edit Sponsor" : "Add Sponsor"}</h2>
              <button onClick={() => setShowModal(false)} style={{ color: "rgba(148,163,184,0.6)" }}><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { label: "Sponsor Name *", key: "name", placeholder: "e.g. Airtel" },
                { label: "Logo URL", key: "logo_url", placeholder: "https://..." },
                { label: "Website URL", key: "website_url", placeholder: "https://example.com" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(148,163,184,0.7)" }}>{f.label}</label>
                  <input style={S.input} value={form[f.key as keyof typeof form]} placeholder={f.placeholder}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(148,163,184,0.7)" }}>Tier *</label>
                <select style={{ ...S.input, cursor: "pointer" }} value={form.tier}
                  onChange={e => setForm(p => ({ ...p, tier: e.target.value }))}>
                  {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowModal(false)} style={{ ...S.btn, background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name}
                style={{ ...S.btn, background: "linear-gradient(135deg,#4F46E5,#DB2777)", color: "#fff", opacity: saving || !form.name ? 0.6 : 1 }}>
                {saving ? "Saving..." : <><Check size={14} /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-sm p-6 flex flex-col gap-5 text-center" style={{ ...S.card, background: "#0F1729" }}>
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)" }}>
              <Trash2 size={20} style={{ color: "#F87171" }} />
            </div>
            <div>
              <p className="font-bold text-white">Delete Sponsor?</p>
              <p className="text-sm mt-1" style={{ color: "rgba(148,163,184,0.6)" }}>This action cannot be undone.</p>
            </div>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setDeleteId(null)} style={{ ...S.btn, background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} style={{ ...S.btn, background: "#EF4444", color: "#fff" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
