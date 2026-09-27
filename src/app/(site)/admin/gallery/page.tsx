"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  Plus, Pencil, Trash2, X, Check, RefreshCw,
  Image as ImageIcon, PlayCircle, UploadCloud, CheckSquare,
  Square, Loader2, AlertCircle, FolderPlus, Tag
} from "lucide-react";
import ImageUploadField from "@/components/admin/ImageUploadField";

interface GalleryItem {
  id: string;
  type: "photo" | "video";
  url: string;
  thumbnail_url: string;
  title: string;
  event: string;
}

interface Taxonomy {
  value: string;
}

interface GalleryFormState {
  type: "photo" | "video";
  url: string;
  title: string;
  event: string;
}

interface StagedFile {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  status: "idle" | "uploading" | "success" | "error";
  errorMsg?: string;
}

const EMPTY: GalleryFormState = { type: "photo", url: "", title: "", event: "" };

const S = {
  card: {
    background: "rgba(23,13,8,0.7)",
    border: "1px solid rgba(217, 119, 6, 0.15)",
    borderRadius: "16px"
  },
  input: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(217, 119, 6, 0.25)",
    borderRadius: "10px",
    color: "#F5EEE2",
    outline: "none",
    padding: "10px 12px",
    fontSize: "13px",
    width: "100%"
  },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "9px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s"
  },
};

function getPaginationRange(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Single Item Modal states
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);

  // Single Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Bulk Selection states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Bulk Category Change states
  const [showBulkCategoryModal, setShowBulkCategoryModal] = useState(false);
  const [targetBulkCategory, setTargetBulkCategory] = useState<string>("");
  const [bulkUpdatingCategory, setBulkUpdatingCategory] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");

  // Bulk Upload Modal states
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [bulkCategory, setBulkCategory] = useState<string>("");
  const [bulkTitlePrefix, setBulkTitlePrefix] = useState<string>("");
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkUploadProgress, setBulkUploadProgress] = useState({ current: 0, total: 0 });
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  // Computed valid selections
  const validSelectedIds = useMemo(() => {
    const itemIds = new Set(items.map((i) => i.id));
    const valid = new Set<string>();
    selectedIds.forEach((id) => {
      if (itemIds.has(id)) valid.add(id);
    });
    return valid;
  }, [items, selectedIds]);

  // Admin Pagination
  const [adminPage, setAdminPage] = useState(1);
  const adminLimit = 16;
  const totalAdminPages = Math.max(1, Math.ceil(items.length / adminLimit));

  const paginatedItems = useMemo(() => {
    const start = (adminPage - 1) * adminLimit;
    return items.slice(start, start + adminLimit);
  }, [items, adminPage, adminLimit]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, taxRes] = await Promise.all([
        fetch("/api/admin/gallery"),
        fetch("/api/taxonomies?type=gallery_category"),
      ]);
      const itemsData = await itemsRes.json();
      const taxData = await taxRes.json();
      setItems(itemsData.items ?? []);
      const cats = (taxData.taxonomies ?? []).map((t: Taxonomy) => t.value);
      setCategories(cats);
      if (cats.length > 0 && !bulkCategory) {
        setBulkCategory(cats[0]);
      }
    } catch (err) {
      console.error("Failed to fetch gallery:", err);
    } finally {
      setLoading(false);
    }
  }, [bulkCategory]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [itemsRes, taxRes] = await Promise.all([
          fetch("/api/admin/gallery"),
          fetch("/api/taxonomies?type=gallery_category"),
        ]);
        const itemsData = await itemsRes.json();
        const taxData = await taxRes.json();
        if (!active) return;
        setItems(itemsData.items ?? []);
        const cats = (taxData.taxonomies ?? []).map((t: Taxonomy) => t.value);
        setCategories(cats);
        if (cats.length > 0 && !bulkCategory) {
          setBulkCategory(cats[0]);
        }
      } catch (err) {
        console.error("Failed to load initial gallery items:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [bulkCategory]);

  // Single Edit / Create Handlers
  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...EMPTY, event: categories[0] || "" });
    setShowModal(true);
  };

  const openEdit = (item: GalleryItem) => {
    setEditTarget(item);
    setForm({ type: item.type, url: item.url, title: item.title, event: item.event });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const method = editTarget ? "PUT" : "POST";
    const body = {
      ...form,
      thumbnail_url: form.url,
      ...(editTarget ? { id: editTarget.id } : {})
    };
    await fetch("/api/admin/gallery", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    setShowModal(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/gallery?id=${id}`, { method: "DELETE" });
    setDeleteId(null);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    fetchAll();
  };

  // Bulk Selection Handlers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(items.map((i) => i.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // Bulk Delete Execution
  const handleBulkDelete = async () => {
    if (validSelectedIds.size === 0) return;
    setBulkDeleting(true);
    try {
      const idsArray = Array.from(validSelectedIds);
      await fetch("/api/admin/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: idsArray }),
      });
      setSelectedIds(new Set());
      setShowBulkDeleteModal(false);
      fetchAll();
    } catch (err) {
      console.error("Bulk delete failed:", err);
    } finally {
      setBulkDeleting(false);
    }
  };

  // Bulk Change Category Execution
  const handleBulkChangeCategory = async () => {
    const finalCategory = isCustomCategory ? customCategoryInput.trim() : targetBulkCategory.trim();
    if (validSelectedIds.size === 0 || !finalCategory) return;
    setBulkUpdatingCategory(true);
    try {
      const idsArray = Array.from(validSelectedIds);
      const res = await fetch("/api/admin/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: idsArray, event: finalCategory }),
      });
      if (res.ok) {
        setSelectedIds(new Set());
        setShowBulkCategoryModal(false);
        setIsCustomCategory(false);
        setCustomCategoryInput("");
        fetchAll();
      }
    } catch (err) {
      console.error("Bulk change category failed:", err);
    } finally {
      setBulkUpdatingCategory(false);
    }
  };

  // Bulk Upload File Staging
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newStaged: StagedFile[] = Array.from(files).map((file, idx) => {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      const formattedTitle = nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1);
      return {
        id: `${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        title: formattedTitle,
        status: "idle" as const,
      };
    });

    setStagedFiles((prev) => [...prev, ...newStaged]);
  };

  const removeStagedFile = (id: string) => {
    setStagedFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const clearStagedFiles = () => {
    stagedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setStagedFiles([]);
  };

  // Execute Bulk Upload
  const handleStartBulkUpload = async () => {
    if (stagedFiles.length === 0 || isBulkUploading) return;
    setIsBulkUploading(true);
    setBulkUploadProgress({ current: 0, total: stagedFiles.length });

    const uploadedGalleryRecords: Array<{
      type: "photo";
      url: string;
      thumbnail_url: string;
      title: string;
      event: string;
    }> = [];

    // Upload each file to S3 via /api/admin/upload
    for (let i = 0; i < stagedFiles.length; i++) {
      const staged = stagedFiles[i];

      // Mark this file as uploading
      setStagedFiles((prev) =>
        prev.map((f) => (f.id === staged.id ? { ...f, status: "uploading" } : f))
      );

      try {
        const formData = new FormData();
        formData.append("file", staged.file);

        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (uploadRes.ok && uploadData.url) {
          const finalTitle = bulkTitlePrefix.trim()
            ? `${bulkTitlePrefix.trim()} ${i + 1}`
            : staged.title || `Photo ${i + 1}`;

          uploadedGalleryRecords.push({
            type: "photo",
            url: uploadData.url,
            thumbnail_url: uploadData.url,
            title: finalTitle,
            event: bulkCategory,
          });

          setStagedFiles((prev) =>
            prev.map((f) => (f.id === staged.id ? { ...f, status: "success" } : f))
          );
        } else {
          setStagedFiles((prev) =>
            prev.map((f) =>
              f.id === staged.id
                ? { ...f, status: "error", errorMsg: uploadData.error || "Upload failed" }
                : f
            )
          );
        }
      } catch {
        setStagedFiles((prev) =>
          prev.map((f) =>
            f.id === staged.id
              ? { ...f, status: "error", errorMsg: "Network error" }
              : f
          )
        );
      }

      setBulkUploadProgress({ current: i + 1, total: stagedFiles.length });
    }

    // Insert all successful uploads into database
    if (uploadedGalleryRecords.length > 0) {
      try {
        await fetch("/api/admin/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: uploadedGalleryRecords }),
        });
      } catch (err) {
        console.error("Batch database insert error:", err);
      }
    }

    setIsBulkUploading(false);
    fetchAll();

    // Close modal if all succeeded
    setTimeout(() => {
      clearStagedFiles();
      setShowBulkUploadModal(false);
    }, 1200);
  };

  const isAllSelected = items.length > 0 && validSelectedIds.size === items.length;

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6" style={{ color: "#F5EEE2" }}>

      {/* Top Header & Action Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ImageIcon size={26} className="text-amber-400" /> Gallery Management
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(203,185,160,0.6)" }}>
            {items.length} items total • {validSelectedIds.size} selected
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Refresh */}
          <button
            onClick={fetchAll}
            style={{ ...S.btn, background: "rgba(217, 119, 6, 0.1)", color: "#fbbf24" }}
          >
            <RefreshCw size={14} /> Refresh
          </button>

          {/* Bulk Upload Button */}
          <button
            onClick={() => {
              clearStagedFiles();
              setShowBulkUploadModal(true);
            }}
            style={{
              ...S.btn,
              background: "rgba(217, 119, 6, 0.15)",
              border: "1px solid rgba(217, 119, 6, 0.35)",
              color: "#fde68a",
            }}
          >
            <FolderPlus size={15} /> Bulk Upload
          </button>

          {/* Add Single Item */}
          <button
            onClick={openCreate}
            style={{
              ...S.btn,
              background: "linear-gradient(135deg, #F59E0B, #B45309)",
              color: "#fff",
            }}
          >
            <Plus size={14} /> Add Single Item
          </button>
        </div>
      </div>

      {/* Bulk Selection Bar (Always visible or shows when items exist) */}
      {items.length > 0 && (
        <div
          className="p-3.5 px-5 rounded-2xl flex items-center justify-between gap-4 flex-wrap border transition-all"
          style={{
            background: validSelectedIds.size > 0 ? "rgba(217, 119, 6, 0.12)" : "rgba(255,255,255,0.02)",
            borderColor: validSelectedIds.size > 0 ? "rgba(245, 158, 11, 0.4)" : "rgba(217, 119, 6, 0.15)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={isAllSelected ? deselectAll : selectAll}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
            >
              {isAllSelected ? (
                <CheckSquare size={16} className="text-amber-400" />
              ) : (
                <Square size={16} className="text-[var(--text-muted)]" />
              )}
              <span>{isAllSelected ? "Deselect All" : "Select All Items"}</span>
            </button>

            {validSelectedIds.size > 0 && (
              <span className="text-xs font-bold text-[var(--text-secondary)] border-l border-[var(--border-color)] pl-3">
                <strong className="text-white">{validSelectedIds.size}</strong> of {items.length} chosen
              </span>
            )}
          </div>

          {validSelectedIds.size > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in duration-200">
              <button
                type="button"
                onClick={deselectAll}
                className="text-xs text-[var(--text-muted)] hover:text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-semibold"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => {
                  setTargetBulkCategory(categories[0] || "");
                  setIsCustomCategory(false);
                  setCustomCategoryInput("");
                  setShowBulkCategoryModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[#170D08] bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-400/20 transition-all cursor-pointer"
              >
                <Tag size={14} />
                <span>Change Category ({validSelectedIds.size})</span>
              </button>

              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/25 transition-all cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Delete Selected ({validSelectedIds.size})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Gallery Cards Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-2xl animate-pulse"
              style={{ background: "rgba(217, 119, 6, 0.06)" }}
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24" style={S.card}>
          <ImageIcon size={44} style={{ color: "rgba(203,185,160,0.2)" }} />
          <p style={{ color: "rgba(203,185,160,0.5)" }}>No gallery items yet.</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                clearStagedFiles();
                setShowBulkUploadModal(true);
              }}
              style={{ ...S.btn, background: "rgba(217, 119, 6, 0.2)", color: "#fde68a" }}
            >
              <FolderPlus size={14} /> Bulk Upload Photos
            </button>
            <button
              onClick={openCreate}
              style={{ ...S.btn, background: "linear-gradient(135deg, #F59E0B, #B45309)", color: "#fff" }}
            >
              <Plus size={14} /> Add Single Item
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedItems.map((item) => {
            const isSelected = validSelectedIds.has(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleSelect(item.id)}
                className={`relative overflow-hidden rounded-2xl flex flex-col transition-all cursor-pointer select-none group border ${
                  isSelected
                    ? "border-amber-400 ring-2 ring-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-[1.01]"
                    : "border-[rgba(217,119,6,0.15)] hover:border-amber-400/40"
                }`}
                style={{ background: isSelected ? "rgba(217, 119, 6, 0.1)" : "rgba(23,13,8,0.6)" }}
              >
                {/* Checkbox Selector (Top-Left) */}
                <div
                  className="absolute top-2.5 left-2.5 z-20 w-6 h-6 rounded-lg flex items-center justify-center transition-all shadow"
                  style={{
                    background: isSelected ? "#F59E0B" : "rgba(0,0,0,0.65)",
                    border: isSelected ? "1px solid #F59E0B" : "1px solid rgba(255,255,255,0.3)",
                    color: isSelected ? "#170D08" : "#fff",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(item.id);
                  }}
                >
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </div>

                {/* Thumbnail Container */}
                <div className="w-full h-36 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnail_url || item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.type === "video" && (
                    <div className="absolute top-2 left-10">
                      <PlayCircle size={18} className="text-white drop-shadow" />
                    </div>
                  )}

                  {/* Top-Right Action Buttons */}
                  <div
                    className="absolute top-2 right-2 flex gap-1 z-20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => openEdit(item)}
                      title="Edit Item"
                      className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                      style={{ background: "rgba(23,13,8,0.85)", color: "#fbbf24" }}
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      title="Delete Item"
                      className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                      style={{ background: "rgba(23,13,8,0.85)", color: "#F87171" }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Item Details */}
                <div className="p-3 flex flex-col justify-between flex-grow" style={{ background: "rgba(23,13,8,0.5)" }}>
                  <div className="text-white text-xs font-semibold line-clamp-1 leading-snug">
                    {item.title}
                  </div>
                  <div className="flex items-center justify-between text-[10px] mt-1.5" style={{ color: "rgba(203,185,160,0.6)" }}>
                    <span className="truncate max-w-[120px]">{item.event || "Uncategorized"}</span>
                    <span className="uppercase text-[9px] font-bold text-amber-400/80">{item.type}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Admin Pagination Controls */}
        {totalAdminPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-amber-500/15 bg-white/[0.02]">
            <span className="text-xs text-[var(--text-secondary)] font-secondary">
              Showing <strong className="text-white font-mono">{(adminPage - 1) * adminLimit + 1}</strong> - <strong className="text-white font-mono">{Math.min(adminPage * adminLimit, items.length)}</strong> of <strong className="text-amber-400 font-mono">{items.length}</strong> items
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAdminPage((p) => Math.max(1, p - 1))}
                disabled={adminPage <= 1}
                className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10 cursor-pointer"
              >
                Prev
              </button>
              {getPaginationRange(adminPage, totalAdminPages).map((item, idx) => {
                if (item === "...") {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-7 h-7 flex items-center justify-center text-xs text-stone-500 font-bold select-none"
                    >
                      …
                    </span>
                  );
                }
                const p = Number(item);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAdminPage(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      p === adminPage
                        ? "bg-amber-500 text-[#170D08] font-black shadow-sm"
                        : "bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setAdminPage((p) => Math.min(totalAdminPages, p + 1))}
                disabled={adminPage >= totalAdminPages}
                className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </>
    )}

      {/* ========================================================================= */}
      {/* MODAL 0: BULK CHANGE CATEGORY                                              */}
      {/* ========================================================================= */}
      {showBulkCategoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-md p-6 flex flex-col gap-5 rounded-[24px] border border-amber-500/30 shadow-2xl"
            style={{ background: "#2A1510", color: "#F5EEE2" }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Tag size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base font-primary uppercase tracking-tight">
                    Change Category
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Applying to <strong className="text-amber-400">{validSelectedIds.size}</strong> selected items
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkCategoryModal(false)}
                disabled={bulkUpdatingCategory}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                  Select Target Category
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(!isCustomCategory)}
                  className="text-xs text-amber-400 hover:text-amber-300 underline font-semibold transition-colors cursor-pointer"
                >
                  {isCustomCategory ? "Choose from list" : "+ Enter new category"}
                </button>
              </div>

              {!isCustomCategory ? (
                <>
                  <select
                    value={targetBulkCategory}
                    onChange={(e) => setTargetBulkCategory(e.target.value)}
                    style={S.input}
                    className="focus:border-amber-400 cursor-pointer"
                  >
                    {categories.length === 0 ? (
                      <option value="">No categories defined yet</option>
                    ) : (
                      categories.map((c) => (
                        <option key={c} value={c} className="bg-[#170D08] text-[#F5EEE2]">
                          {c}
                        </option>
                      ))
                    )}
                  </select>

                  {/* Quick Select Chips */}
                  {categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {categories.map((c) => {
                        const active = targetBulkCategory === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setTargetBulkCategory(c)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              active
                                ? "bg-amber-400 text-[#170D08] shadow-sm font-bold scale-[1.03]"
                                : "bg-white/5 text-[var(--text-secondary)] hover:text-white hover:bg-white/10 border border-white/5"
                            }`}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <input
                    type="text"
                    placeholder="e.g. Annual Summit 2026, Field Work..."
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    style={S.input}
                    className="focus:border-amber-400"
                    autoFocus
                  />
                  <span className="text-[11px] text-[var(--text-muted)]">
                    This new category tag will be assigned to all selected items.
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 justify-end pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowBulkCategoryModal(false)}
                disabled={bulkUpdatingCategory}
                style={{ ...S.btn, background: "rgba(255,255,255,0.06)", color: "#F5EEE2" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkChangeCategory}
                disabled={
                  bulkUpdatingCategory ||
                  (isCustomCategory ? !customCategoryInput.trim() : !targetBulkCategory.trim())
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#170D08] bg-amber-400 hover:bg-amber-300 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {bulkUpdatingCategory ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <Check size={14} strokeWidth={3} /> Apply Category ({validSelectedIds.size})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: BULK DELETE CONFIRMATION                                         */}
      {/* ========================================================================= */}
      {showBulkDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-md p-6 flex flex-col gap-5 text-center rounded-[24px] border border-rose-500/30"
            style={{ background: "#2A1510", color: "#F5EEE2" }}
          >
            <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <Trash2 size={26} />
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="font-extrabold text-white text-lg font-primary uppercase tracking-tight">
                Delete {selectedIds.size} Selected Items?
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-secondary leading-relaxed">
                This will permanently remove the selected {selectedIds.size} photo(s) from the database. This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-2.5 justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={bulkDeleting}
                style={{ ...S.btn, background: "rgba(255,255,255,0.06)", color: "#F5EEE2" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {bulkDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} /> Confirm Bulk Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: BULK UPLOAD MODAL                                                */}
      {/* ========================================================================= */}
      {showBulkUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-2xl p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto rounded-[28px] border border-[var(--border-color)]"
            style={{ background: "#2A1510", color: "#F5EEE2" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus size={20} className="text-amber-400" />
                <h2 className="font-extrabold text-white text-lg tracking-tight font-primary uppercase">
                  Bulk Photo Uploader
                </h2>
              </div>
              <button
                onClick={() => {
                  if (!isBulkUploading) {
                    clearStagedFiles();
                    setShowBulkUploadModal(false);
                  }
                }}
                disabled={isBulkUploading}
                style={{ color: "rgba(203,185,160,0.6)" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Batch Settings Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/25 p-4 rounded-2xl border border-[var(--border-color)]">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-amber-400">
                  Target Event / Category *
                </label>
                <select
                  style={{ ...S.input, cursor: "pointer" }}
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  disabled={isBulkUploading}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[var(--text-secondary)]">
                  Batch Title Prefix (Optional)
                </label>
                <input
                  style={S.input}
                  placeholder="e.g. Cultural Odyssey 2026"
                  value={bulkTitlePrefix}
                  onChange={(e) => setBulkTitlePrefix(e.target.value)}
                  disabled={isBulkUploading}
                />
                <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                  Leaves original filenames if empty.
                </span>
              </div>
            </div>

            {/* Drag & Drop File Zone */}
            <div
              onClick={() => !isBulkUploading && bulkFileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-amber-500/30 hover:border-amber-400/60 rounded-2xl flex flex-col items-center justify-center gap-2.5 cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all text-center"
            >
              <UploadCloud size={36} className="text-amber-400" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">
                  Click or drag multiple image files here
                </span>
                <span className="text-xs text-[var(--text-muted)] mt-0.5">
                  Supports JPG, PNG, WEBP files
                </span>
              </div>

              <input
                ref={bulkFileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                disabled={isBulkUploading}
                onChange={(e) => {
                  handleFilesSelected(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            {/* Staged Files Preview Grid */}
            {stagedFiles.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  <span>Selected Files ({stagedFiles.length})</span>
                  {!isBulkUploading && (
                    <button
                      onClick={clearStagedFiles}
                      className="text-rose-400 hover:text-rose-300 text-[11px] cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto p-1">
                  {stagedFiles.map((staged, idx) => (
                    <div
                      key={staged.id}
                      className="relative rounded-xl overflow-hidden border border-[var(--border-color)] bg-black/40 flex flex-col group"
                    >
                      <div className="w-full h-20 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={staged.previewUrl}
                          alt={staged.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Status Overlay */}
                        {staged.status === "uploading" && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Loader2 size={16} className="animate-spin text-amber-400" />
                          </div>
                        )}
                        {staged.status === "success" && (
                          <div className="absolute inset-0 bg-emerald-950/70 flex items-center justify-center text-emerald-400">
                            <Check size={18} strokeWidth={3} />
                          </div>
                        )}
                        {staged.status === "error" && (
                          <div className="absolute inset-0 bg-rose-950/80 flex items-center justify-center text-rose-400">
                            <AlertCircle size={18} />
                          </div>
                        )}

                        {!isBulkUploading && (
                          <button
                            type="button"
                            onClick={() => removeStagedFile(staged.id)}
                            className="absolute top-1 right-1 w-5 h-5 rounded bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>

                      <div className="p-1.5 text-[10px] text-white truncate font-medium">
                        {bulkTitlePrefix.trim() ? `${bulkTitlePrefix.trim()} ${idx + 1}` : staged.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress indicator during upload */}
            {isBulkUploading && (
              <div className="flex flex-col gap-2 bg-black/30 p-3.5 rounded-2xl border border-[var(--border-color)]">
                <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-amber-400" />
                    Uploading batch to cloud storage...
                  </span>
                  <span>
                    {bulkUploadProgress.current} / {bulkUploadProgress.total}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-300 rounded-full"
                    style={{
                      width: `${(bulkUploadProgress.current / Math.max(1, bulkUploadProgress.total)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex gap-2 justify-end pt-2 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => {
                  clearStagedFiles();
                  setShowBulkUploadModal(false);
                }}
                disabled={isBulkUploading}
                style={{ ...S.btn, background: "rgba(255,255,255,0.06)", color: "#F5EEE2" }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStartBulkUpload}
                disabled={isBulkUploading || stagedFiles.length === 0}
                style={{
                  ...S.btn,
                  background: "linear-gradient(135deg, #F59E0B, #B45309)",
                  color: "#fff",
                  opacity: isBulkUploading || stagedFiles.length === 0 ? 0.5 : 1,
                }}
              >
                {isBulkUploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Uploading ({bulkUploadProgress.current}/{bulkUploadProgress.total})...
                  </>
                ) : (
                  <>
                    <UploadCloud size={14} /> Upload {stagedFiles.length} Photos
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: SINGLE EDIT / CREATE MODAL                                       */}
      {/* ========================================================================= */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-md p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            style={{ ...S.card, background: "#2A1510" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-white text-lg">
                {editTarget ? "Edit Item" : "Add Item"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ color: "rgba(203,185,160,0.6)" }}>
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(203,185,160,0.7)" }}>
                  Type
                </label>
                <select
                  style={{ ...S.input, cursor: "pointer" }}
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as "photo" | "video" }))}
                >
                  <option value="photo">Photo</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <ImageUploadField
                label="Image"
                value={form.url}
                onChange={(url) => setForm((p) => ({ ...p, url }))}
              />
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(203,185,160,0.7)" }}>
                  Title / Caption *
                </label>
                <input
                  style={S.input}
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(203,185,160,0.7)" }}>
                  Category
                </label>
                <select
                  style={{ ...S.input, cursor: "pointer" }}
                  value={form.event}
                  onChange={(e) => setForm((p) => ({ ...p, event: e.target.value }))}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowModal(false)}
                style={{ ...S.btn, background: "rgba(217, 119, 6,0.1)", color: "#fbbf24" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title || !form.url}
                style={{
                  ...S.btn,
                  background: "linear-gradient(135deg, #F59E0B, #B45309)",
                  color: "#fff",
                  opacity: saving || !form.title || !form.url ? 0.6 : 1,
                }}
              >
                {saving ? "Saving..." : <><Check size={14} /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: SINGLE DELETE CONFIRMATION                                       */}
      {/* ========================================================================= */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-sm p-6 flex flex-col gap-5 text-center"
            style={{ ...S.card, background: "#2A1510" }}
          >
            <div
              className="w-12 h-12 rounded-full mx-auto flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.12)" }}
            >
              <Trash2 size={20} style={{ color: "#F87171" }} />
            </div>
            <div>
              <p className="font-bold text-white">Delete Item?</p>
              <p className="text-sm mt-1" style={{ color: "rgba(203,185,160,0.6)" }}>
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setDeleteId(null)}
                style={{ ...S.btn, background: "rgba(217, 119, 6,0.1)", color: "#fbbf24" }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                style={{ ...S.btn, background: "#EF4444", color: "#fff" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
