"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Check, RefreshCw, Image as ImageIcon, PlayCircle } from "lucide-react";
import ImageUploadField from "@/components/admin/ImageUploadField";

interface GalleryItem {
  id: string;
  type: "photo" | "video";
  url: string;
  thumbnail_url: string;
  title: string;
  event: string;
}

interface Taxonomy { value: string }

const EMPTY = { type: "photo", url: "", title: "", event: "" };

const S = {
  card: { background: "rgba(15,23,42,0.6)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: "16px" },
  input: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", color: "#E2E8F0", outline: "none", padding: "10px 12px", fontSize: "13px", width: "100%" },
  btn: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "none" },
};

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [itemsRes, taxRes] = await Promise.all([
      fetch("/api/admin/gallery"),
      fetch("/api/taxonomies?type=gallery_category"),
    ]);
    const itemsData = await itemsRes.json();
    const taxData = await taxRes.json();
    setItems(itemsData.items ?? []);
    setCategories((taxData.taxonomies ?? []).map((t: Taxonomy) => t.value));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => { setEditTarget(null); setForm({ ...EMPTY, event: categories[0] || "" }); setShowModal(true); };
  const openEdit = (item: GalleryItem) => {
    setEditTarget(item);
    setForm({ type: item.type, url: item.url, title: item.title, event: item.event });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const method = editTarget ? "PUT" : "POST";
    const body = { ...form, thumbnail_url: form.url, ...(editTarget ? { id: editTarget.id } : {}) };
    await fetch("/api/admin/gallery", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    setShowModal(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/gallery?id=${id}`, { method: "DELETE" });
    setDeleteId(null);
    fetchAll();
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6" style={{ color: "#E2E8F0" }}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Gallery</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(148,163,184,0.6)" }}>{items.length} items in the database</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll} style={{ ...S.btn, background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={openCreate} style={{ ...S.btn, background: "linear-gradient(135deg,#4F46E5,#DB2777)", color: "#fff" }}>
            <Plus size={14} /> Add Item
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: "rgba(99,102,241,0.06)" }} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24" style={S.card}>
          <ImageIcon size={40} style={{ color: "rgba(148,163,184,0.2)" }} />
          <p style={{ color: "rgba(148,163,184,0.5)" }}>No gallery items yet. Add your first one.</p>
          <button onClick={openCreate} style={{ ...S.btn, background: "linear-gradient(135deg,#4F46E5,#DB2777)", color: "#fff" }}>
            <Plus size={14} /> Add Item
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="relative group overflow-hidden rounded-2xl" style={{ border: "1px solid rgba(99,102,241,0.12)" }}>
              <div className="w-full h-32" style={{ background: "rgba(255,255,255,0.04)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.thumbnail_url || item.url} alt={item.title} className="w-full h-full object-cover" />
              </div>
              {item.type === "video" && (
                <div className="absolute top-2 left-2"><PlayCircle size={16} className="text-white drop-shadow" /></div>
              )}
              <div className="absolute inset-0 flex flex-col justify-between p-2.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.55)" }}>
                <div className="flex justify-end gap-1">
                  <button onClick={() => openEdit(item)} className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "rgba(99,102,241,0.5)", color: "#fff" }}><Pencil size={11} /></button>
                  <button onClick={() => setDeleteId(item.id)} className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "rgba(239,68,68,0.6)", color: "#fff" }}><Trash2 size={11} /></button>
                </div>
                <div>
                  <div className="text-white text-[11px] font-semibold line-clamp-2">{item.title}</div>
                  <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>{item.event}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto" style={{ ...S.card, background: "#0F1729" }}>
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-white text-lg">{editTarget ? "Edit Item" : "Add Item"}</h2>
              <button onClick={() => setShowModal(false)} style={{ color: "rgba(148,163,184,0.6)" }}><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(148,163,184,0.7)" }}>Type</label>
                <select style={{ ...S.input, cursor: "pointer" }} value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
                  <option value="photo">Photo</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <ImageUploadField label="Image" value={form.url} onChange={(url) => setForm((p) => ({ ...p, url }))} />
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(148,163,184,0.7)" }}>Title / Caption *</label>
                <input style={S.input} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(148,163,184,0.7)" }}>Category</label>
                <select style={{ ...S.input, cursor: "pointer" }} value={form.event} onChange={(e) => setForm((p) => ({ ...p, event: e.target.value }))}>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowModal(false)} style={{ ...S.btn, background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title || !form.url}
                style={{ ...S.btn, background: "linear-gradient(135deg,#4F46E5,#DB2777)", color: "#fff", opacity: saving || !form.title || !form.url ? 0.6 : 1 }}>
                {saving ? "Saving..." : <><Check size={14} /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-sm p-6 flex flex-col gap-5 text-center" style={{ ...S.card, background: "#0F1729" }}>
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)" }}>
              <Trash2 size={20} style={{ color: "#F87171" }} />
            </div>
            <div>
              <p className="font-bold text-white">Delete Item?</p>
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
