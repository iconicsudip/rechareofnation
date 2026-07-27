"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Check, RefreshCw, BookOpen } from "lucide-react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface Blog {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  image_url: string;
  category: string;
  author: string;
  published_at: string;
  read_time: string;
  subheading: string | null;
  bullets: string[];
}

interface Taxonomy { value: string }

const EMPTY_FORM = {
  title: "", slug: "", summary: "", content: "", image_url: "", category: "",
  author: "GoRidez Editorial Team", published_at: "", read_time: "3 min read", subheading: "",
};

const S = {
  card: { background: "rgba(15,23,42,0.6)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: "16px" },
  input: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", color: "#E2E8F0", outline: "none", padding: "10px 12px", fontSize: "13px", width: "100%" },
  btn: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "none" },
};

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Blog | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [bullets, setBullets] = useState<string[]>([]);
  const [bulletDraft, setBulletDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [blogsRes, taxRes] = await Promise.all([
      fetch("/api/admin/blogs"),
      fetch("/api/taxonomies?type=blog_category"),
    ]);
    const blogsData = await blogsRes.json();
    const taxData = await taxRes.json();
    setBlogs(blogsData.blogs ?? []);
    setCategories((taxData.taxonomies ?? []).map((t: Taxonomy) => t.value));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, category: categories[0] || "" });
    setBullets([]);
    setPanelOpen(true);
  };

  const openEdit = (b: Blog) => {
    setEditTarget(b);
    setForm({
      title: b.title, slug: b.slug, summary: b.summary, content: b.content,
      image_url: b.image_url, category: b.category, author: b.author,
      published_at: b.published_at, read_time: b.read_time, subheading: b.subheading || "",
    });
    setBullets(Array.isArray(b.bullets) ? b.bullets : []);
    setPanelOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = { ...form, bullets, ...(editTarget ? { id: editTarget.id } : {}) };
    await fetch("/api/admin/blogs", {
      method: editTarget ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    setPanelOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/blogs?id=${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    load();
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6" style={{ color: "#E2E8F0" }}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Blogs</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(148,163,184,0.6)" }}>{blogs.length} posts total</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} style={{ ...S.btn, background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={openCreate} style={{ ...S.btn, background: "linear-gradient(135deg, #4F46E5, #DB2777)", color: "#fff" }}>
            <Plus size={14} /> New Post
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: "rgba(99,102,241,0.06)" }} />)}
        </div>
      ) : blogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24" style={S.card}>
          <BookOpen size={40} style={{ color: "rgba(148,163,184,0.2)" }} />
          <p style={{ color: "rgba(148,163,184,0.5)" }}>No posts yet. Publish your first one.</p>
          <button onClick={openCreate} style={{ ...S.btn, background: "linear-gradient(135deg,#4F46E5,#DB2777)", color: "#fff" }}>
            <Plus size={14} /> New Post
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {blogs.map((b) => (
            <div key={b.id} className="flex flex-col gap-3 overflow-hidden" style={S.card}>
              <div className="w-full h-32 overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                {b.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="px-4 pb-4 flex flex-col gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold w-fit" style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.2)" }}>{b.category}</span>
                <div className="font-bold text-white text-sm leading-tight line-clamp-2">{b.title}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px]" style={{ color: "rgba(148,163,184,0.4)" }}>{b.published_at}</span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(b)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.12)", color: "#818CF8" }}><Pencil size={12} /></button>
                    {deleteConfirm === b.id ? (
                      <button onClick={() => handleDelete(b.id)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.15)", color: "#F87171" }}><Check size={12} /></button>
                    ) : (
                      <button onClick={() => setDeleteConfirm(b.id)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)", color: "#F87171" }}><Trash2 size={12} /></button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPanelOpen(false)} />
          <div className="relative w-full max-w-xl h-full overflow-y-auto flex flex-col" style={{ background: "#0F1729", borderLeft: "1px solid rgba(99,102,241,0.2)" }}>
            <div className="flex items-center justify-between p-6 border-b sticky top-0 z-10" style={{ borderColor: "rgba(99,102,241,0.15)", background: "#0F1729" }}>
              <h2 className="font-extrabold text-white text-lg">{editTarget ? "Edit Post" : "Create Post"}</h2>
              <button onClick={() => setPanelOpen(false)} className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", color: "#94A3B8" }}><X size={16} /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 flex flex-col gap-5 flex-1">
              {[
                { label: "Title", key: "title", type: "text", required: true },
                { label: "URL Slug", key: "slug", type: "text", required: true },
                { label: "Subheading", key: "subheading", type: "text" },
                { label: "Author", key: "author", type: "text" },
                { label: "Published Date", key: "published_at", type: "text", placeholder: "e.g. July 26, 2026" },
                { label: "Read Time", key: "read_time", type: "text" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "rgba(148,163,184,0.5)" }}>{f.label}</label>
                  <input type={f.type} style={S.input} required={f.required} placeholder={f.placeholder}
                    value={(form as Record<string, string>)[f.key]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "rgba(148,163,184,0.5)" }}>Category</label>
                <select style={S.input} value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <ImageUploadField label="Cover Image" value={form.image_url} onChange={(url) => setForm((p) => ({ ...p, image_url: url }))} />

              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "rgba(148,163,184,0.5)" }}>Summary</label>
                <textarea rows={2} style={{ ...S.input, resize: "vertical" }} value={form.summary}
                  onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))} />
              </div>

              <RichTextEditor label="Content" value={form.content} onChange={(html) => setForm((p) => ({ ...p, content: html }))} />

              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "rgba(148,163,184,0.5)" }}>Key Highlights (bullets)</label>
                <div className="flex gap-2 mb-2">
                  <input style={S.input} value={bulletDraft} placeholder="Add a bullet point..."
                    onChange={(e) => setBulletDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (bulletDraft.trim()) { setBullets((p) => [...p, bulletDraft.trim()]); setBulletDraft(""); }
                      }
                    }} />
                  <button type="button" onClick={() => { if (bulletDraft.trim()) { setBullets((p) => [...p, bulletDraft.trim()]); setBulletDraft(""); } }}
                    style={{ ...S.btn, background: "rgba(99,102,241,0.15)", color: "#818CF8" }}>Add</button>
                </div>
                <div className="flex flex-col gap-1.5">
                  {bullets.map((bl, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.02)", color: "rgba(226,232,240,0.8)" }}>
                      <span>{bl}</span>
                      <button type="button" onClick={() => setBullets((p) => p.filter((_, idx) => idx !== i))} style={{ color: "#F87171", background: "none", border: "none", cursor: "pointer" }}><X size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setPanelOpen(false)}
                  style={{ ...S.btn, flex: 1, justifyContent: "center", background: "rgba(255,255,255,0.05)", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.08)" }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ ...S.btn, flex: 2, justifyContent: "center", background: saving ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg, #4F46E5, #DB2777)", color: "#fff" }}>
                  {saving ? "Saving..." : editTarget ? "Update Post" : "Publish Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
