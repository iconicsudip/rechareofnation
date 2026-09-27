"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Plus, Pencil, Trash2, Star, Globe, X, Check, RefreshCw,
  Layers, UploadCloud, CheckSquare, Square, Search,
  SlidersHorizontal, Copy, AlertCircle, Loader2, Tag,
  ExternalLink, FileSpreadsheet, ArrowUpDown, ChevronDown
} from "lucide-react";
import ImageUploadField from "@/components/admin/ImageUploadField";

interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  tier: string;
  website_url: string;
  created_at: string;
}

interface DynamicSponsorRow {
  id: string;
  name: string;
  tier: string;
  logo_url: string;
  website_url: string;
  isUploading?: boolean;
}

const TIERS = ["Title", "Platinum", "Gold", "Media", "Partner"];

const TIER_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Title:    { bg: "rgba(250,204,21,0.15)",  color: "#FBBF24", border: "rgba(250,204,21,0.35)" },
  Platinum: { bg: "rgba(226,232,240,0.12)",  color: "#CBD5E1", border: "rgba(203,213,225,0.25)" },
  Gold:     { bg: "rgba(251,191,36,0.15)",  color: "#F59E0B", border: "rgba(251,191,36,0.3)" },
  Media:    { bg: "rgba(96,165,250,0.15)",  color: "#60A5FA", border: "rgba(96,165,250,0.3)" },
  Partner:  { bg: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "rgba(245,158,11,0.3)" },
};

const EMPTY_FORM = { name: "", logo_url: "", tier: "Partner", website_url: "" };

const createEmptyRow = (tier = "Partner"): DynamicSponsorRow => ({
  id: "row-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
  name: "",
  tier,
  logo_url: "",
  website_url: "",
  isUploading: false,
});

const S = {
  card: {
    background: "rgba(23,13,8,0.7)",
    border: "1px solid rgba(217, 119, 6, 0.15)",
    borderRadius: "16px",
  },
  input: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(217, 119, 6, 0.25)",
    borderRadius: "10px",
    color: "#F5EEE2",
    outline: "none",
    padding: "10px 12px",
    fontSize: "13px",
    width: "100%",
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
    transition: "all 0.2s",
  },
};

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTierFilter, setSelectedTierFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"tier" | "name" | "newest">("tier");

  // Single Item Modal states
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Sponsor | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Bulk Selection states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showBulkTierModal, setShowBulkTierModal] = useState(false);
  const [targetBulkTier, setTargetBulkTier] = useState<string>("Partner");
  const [bulkUpdatingTier, setBulkUpdatingTier] = useState(false);

  // Bulk Add Dynamic Form Modal states
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [dynamicRows, setDynamicRows] = useState<DynamicSponsorRow[]>([
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
  ]);
  const [bulkDefaultTier, setBulkDefaultTier] = useState<string>("Partner");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const bulkFileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchSponsors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sponsors");
      const data = await res.json();
      setSponsors(data.sponsors ?? []);
    } catch (err) {
      console.error("Failed to load sponsors:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSponsors();
  }, [fetchSponsors]);

  // Tier counts
  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = { All: sponsors.length };
    TIERS.forEach((t) => {
      counts[t] = 0;
    });
    sponsors.forEach((sp) => {
      if (counts[sp.tier] !== undefined) {
        counts[sp.tier]++;
      } else {
        counts[sp.tier] = 1;
      }
    });
    return counts;
  }, [sponsors]);

  // Filtered & Sorted Sponsors
  const filteredSponsors = useMemo(() => {
    let result = [...sponsors];

    // Filter by tier
    if (selectedTierFilter !== "All") {
      result = result.filter((s) => s.tier === selectedTierFilter);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.website_url.toLowerCase().includes(q) ||
          s.tier.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      // Tier priority
      const tierRank: Record<string, number> = {
        Title: 0,
        Platinum: 1,
        Gold: 2,
        Media: 3,
        Partner: 4,
      };
      result.sort((a, b) => (tierRank[a.tier] ?? 99) - (tierRank[b.tier] ?? 99));
    }

    return result;
  }, [sponsors, selectedTierFilter, searchQuery, sortBy]);

  // Valid Selection Set
  const validSelectedIds = useMemo(() => {
    const sponsorIds = new Set(sponsors.map((s) => s.id));
    const valid = new Set<string>();
    selectedIds.forEach((id) => {
      if (sponsorIds.has(id)) valid.add(id);
    });
    return valid;
  }, [sponsors, selectedIds]);

  const isAllFilteredSelected =
    filteredSponsors.length > 0 &&
    filteredSponsors.every((s) => validSelectedIds.has(s.id));

  // Selection Handlers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredSponsors.forEach((s) => next.delete(s.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredSponsors.forEach((s) => next.add(s.id));
        return next;
      });
    }
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // Single Edit / Create Handlers
  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, tier: bulkDefaultTier });
    setShowModal(true);
  };

  const openEdit = (sp: Sponsor) => {
    setEditTarget(sp);
    setForm({
      name: sp.name,
      logo_url: sp.logo_url,
      tier: sp.tier,
      website_url: sp.website_url,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const method = editTarget ? "PUT" : "POST";
      const body = editTarget ? { ...form, id: editTarget.id } : form;
      await fetch("/api/admin/sponsors", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setShowModal(false);
      fetchSponsors();
    } catch (err) {
      console.error("Failed to save sponsor:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/sponsors?id=${id}`, { method: "DELETE" });
      setDeleteId(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      fetchSponsors();
    } catch (err) {
      console.error("Failed to delete sponsor:", err);
    }
  };

  // Bulk Delete Execution
  const handleBulkDelete = async () => {
    if (validSelectedIds.size === 0) return;
    setBulkDeleting(true);
    try {
      const idsArray = Array.from(validSelectedIds);
      await fetch("/api/admin/sponsors", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: idsArray }),
      });
      setSelectedIds(new Set());
      setShowBulkDeleteModal(false);
      fetchSponsors();
    } catch (err) {
      console.error("Bulk delete failed:", err);
    } finally {
      setBulkDeleting(false);
    }
  };

  // Bulk Tier Change Execution
  const handleBulkChangeTier = async () => {
    if (validSelectedIds.size === 0 || !targetBulkTier) return;
    setBulkUpdatingTier(true);
    try {
      const idsArray = Array.from(validSelectedIds);
      await fetch("/api/admin/sponsors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: idsArray, tier: targetBulkTier }),
      });
      setSelectedIds(new Set());
      setShowBulkTierModal(false);
      fetchSponsors();
    } catch (err) {
      console.error("Bulk change tier failed:", err);
    } finally {
      setBulkUpdatingTier(false);
    }
  };

  // Dynamic Row Actions for Bulk Add
  const handleAddRow = () => {
    setDynamicRows((prev) => [...prev, createEmptyRow(bulkDefaultTier)]);
  };

  const handleAddMultipleRows = (count: number) => {
    const newRows = Array.from({ length: count }, () => createEmptyRow(bulkDefaultTier));
    setDynamicRows((prev) => [...prev, ...newRows]);
  };

  const handleRemoveRow = (id: string) => {
    setDynamicRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  };

  const handleDuplicateRow = (row: DynamicSponsorRow) => {
    const duplicated: DynamicSponsorRow = {
      ...row,
      id: "row-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      name: row.name ? `${row.name} (Copy)` : "",
    };
    setDynamicRows((prev) => [...prev, duplicated]);
  };

  const handleRowChange = (id: string, field: keyof DynamicSponsorRow, value: string) => {
    setDynamicRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  // Bulk-upload several logo images at once: one row per file, name guessed
  // from the filename (e.g. "acme-corp.png" -> "Acme Corp") so the admin only
  // has to review/correct names and tiers instead of typing everything.
  const handleBulkImageUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    const newRows: DynamicSponsorRow[] = fileArray.map((file) => {
      const base = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim();
      const guessedName = base.replace(/\b\w/g, (c) => c.toUpperCase());
      return { ...createEmptyRow(bulkDefaultTier), name: guessedName, isUploading: true };
    });

    setDynamicRows((prev) => {
      const keep = prev.filter((r) => r.name.trim() || r.logo_url.trim());
      return [...keep, ...newRows];
    });

    await Promise.all(
      fileArray.map(async (file, idx) => {
        const rowId = newRows[idx].id;
        try {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
          const data = await res.json();
          if (res.ok && data.success && data.url) {
            setDynamicRows((prev) =>
              prev.map((r) => (r.id === rowId ? { ...r, logo_url: data.url, isUploading: false } : r))
            );
          } else {
            setDynamicRows((prev) =>
              prev.map((r) => (r.id === rowId ? { ...r, isUploading: false } : r))
            );
          }
        } catch {
          setDynamicRows((prev) =>
            prev.map((r) => (r.id === rowId ? { ...r, isUploading: false } : r))
          );
        }
      })
    );
  };

  const handleRowFileUpload = async (id: string, file: File) => {
    setDynamicRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isUploading: true } : r))
    );
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setDynamicRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, logo_url: data.url, isUploading: false } : r))
        );
      } else {
        alert(data.error || "Image upload failed");
        setDynamicRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isUploading: false } : r))
        );
      }
    } catch {
      alert("Image upload failed");
      setDynamicRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isUploading: false } : r))
      );
    }
  };

  const handleApplyDefaultTierToAll = (tier: string) => {
    setBulkDefaultTier(tier);
    setDynamicRows((prev) => prev.map((r) => ({ ...r, tier })));
  };

  // Quick Paste Parser (supports "Name | Tier | Website | Logo" or "Name, Tier, Website")
  const handleParsePaste = () => {
    if (!pasteText.trim()) return;
    const lines = pasteText.split("\n").map((l) => l.trim()).filter(Boolean);
    const parsedRows: DynamicSponsorRow[] = [];

    for (const line of lines) {
      // Split by tab, pipe, or comma
      let parts = line.split("\t");
      if (parts.length === 1) parts = line.split("|");
      if (parts.length === 1) parts = line.split(",");

      const trimmed = parts.map((p) => p.trim());
      const name = trimmed[0] || "";
      if (!name) continue;

      let tier = bulkDefaultTier;
      let website = "";
      let logo = "";

      if (trimmed[1]) {
        const foundTier = TIERS.find((t) => t.toLowerCase() === trimmed[1].toLowerCase());
        if (foundTier) {
          tier = foundTier;
          website = trimmed[2] || "";
          logo = trimmed[3] || "";
        } else if (trimmed[1].startsWith("http")) {
          website = trimmed[1];
          logo = trimmed[2] || "";
        } else {
          website = trimmed[1];
        }
      }

      parsedRows.push({
        id: "row-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
        name,
        tier,
        website_url: website,
        logo_url: logo,
      });
    }

    if (parsedRows.length > 0) {
      setDynamicRows((prev) => [
        ...prev.filter((r) => r.name.trim() !== ""),
        ...parsedRows,
      ]);
      setPasteText("");
      setPasteMode(false);
    }
  };

  // Submit Bulk Add
  const validDynamicRows = useMemo(
    () => dynamicRows.filter((r) => r.name.trim().length > 0),
    [dynamicRows]
  );

  const handleSubmitBulkAdd = async () => {
    if (validDynamicRows.length === 0) return;
    setBulkSubmitting(true);
    try {
      const payload = validDynamicRows.map((r) => ({
        name: r.name.trim(),
        tier: r.tier || "Partner",
        logo_url: r.logo_url.trim(),
        website_url: r.website_url.trim(),
      }));

      const res = await fetch("/api/admin/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sponsors: payload }),
      });

      if (res.ok) {
        setShowBulkAddModal(false);
        setDynamicRows([createEmptyRow(), createEmptyRow(), createEmptyRow()]);
        fetchSponsors();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to create sponsors");
      }
    } catch (err) {
      console.error("Bulk add failed:", err);
      alert("Failed to submit sponsors");
    } finally {
      setBulkSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6" style={{ color: "#F5EEE2" }}>
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-[#F5EEE2] tracking-tight">Sponsors & Partners</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(203,185,160,0.6)" }}>
            Manage commercial tier partners, media badges, and brand integrations.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchSponsors}
            style={{ ...S.btn, background: "rgba(217, 119, 6,0.1)", color: "#fbbf24" }}
            title="Refresh database"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>

          <button
            onClick={() => {
              setDynamicRows([createEmptyRow(), createEmptyRow(), createEmptyRow()]);
              setPasteMode(false);
              setShowBulkAddModal(true);
            }}
            style={{ ...S.btn, background: "rgba(217, 119, 6, 0.2)", color: "#fde68a" }}
            className="hover:bg-amber-500/30 transition-all border border-amber-500/30 shadow-sm"
          >
            <FileSpreadsheet size={15} /> Bulk Add Sponsors
          </button>

          <button
            onClick={openCreate}
            style={{ ...S.btn, background: "linear-gradient(135deg, #F59E0B, #B45309)", color: "#fff" }}
            className="shadow-md shadow-amber-500/20"
          >
            <Plus size={14} /> Add Single Sponsor
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {["All", ...TIERS].map((tier) => {
          const tc = TIER_COLORS[tier] || { bg: "rgba(255,255,255,0.05)", color: "#F5EEE2", border: "rgba(255,255,255,0.1)" };
          const active = selectedTierFilter === tier;
          return (
            <button
              key={tier}
              onClick={() => setSelectedTierFilter(tier)}
              className={`p-3.5 rounded-2xl flex flex-col gap-1 text-left transition-all cursor-pointer border ${
                active ? "ring-2 ring-amber-400 scale-[1.02]" : "hover:border-amber-400/40"
              }`}
              style={{ background: tc.bg, borderColor: tc.border }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {tier}
              </span>
              <span className="text-xl font-black font-mono" style={{ color: tc.color }}>
                {tierCounts[tier] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Control & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search sponsors by name, url..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-amber-400 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Sort & Quick Select */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <ArrowUpDown size={12} />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 outline-none cursor-pointer focus:border-amber-400"
            >
              <option value="tier" className="bg-[#170D08]">Tier Priority</option>
              <option value="name" className="bg-[#170D08]">Name (A-Z)</option>
              <option value="newest" className="bg-[#170D08]">Newest Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Selection Bar */}
      {sponsors.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectAllFiltered}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
            >
              {isAllFilteredSelected ? (
                <CheckSquare size={16} className="text-amber-400" />
              ) : (
                <Square size={16} className="text-[var(--text-muted)]" />
              )}
              <span>{isAllFilteredSelected ? "Deselect All" : `Select All (${filteredSponsors.length})`}</span>
            </button>

            {validSelectedIds.size > 0 && (
              <span className="text-xs font-bold text-[var(--text-secondary)] border-l border-white/10 pl-3">
                <strong className="text-white">{validSelectedIds.size}</strong> chosen
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
                  setTargetBulkTier("Partner");
                  setShowBulkTierModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#170D08] bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-400/20 transition-all cursor-pointer"
              >
                <Tag size={13} />
                <span>Change Tier ({validSelectedIds.size})</span>
              </button>

              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/25 transition-all cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete Selected ({validSelectedIds.size})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grid of Sponsors */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl animate-pulse" style={{ background: "rgba(217, 119, 6,0.06)" }} />
          ))}
        </div>
      ) : filteredSponsors.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24" style={S.card}>
          <Star size={40} style={{ color: "rgba(203,185,160,0.2)" }} />
          <p style={{ color: "rgba(203,185,160,0.5)" }}>
            {searchQuery || selectedTierFilter !== "All"
              ? "No sponsors match your active filters."
              : "No sponsors yet. Add your first sponsor."}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setDynamicRows([createEmptyRow(), createEmptyRow(), createEmptyRow()]);
                setShowBulkAddModal(true);
              }}
              style={{ ...S.btn, background: "rgba(217, 119, 6, 0.2)", color: "#fde68a" }}
            >
              <FileSpreadsheet size={14} /> Bulk Add
            </button>
            <button
              onClick={openCreate}
              style={{ ...S.btn, background: "linear-gradient(135deg, #F59E0B, #B45309)", color: "#fff" }}
            >
              <Plus size={14} /> Add Single Sponsor
            </button>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSponsors.map((sp) => {
            const tc = TIER_COLORS[sp.tier] ?? TIER_COLORS.Partner;
            const isSelected = validSelectedIds.has(sp.id);

            return (
              <div
                key={sp.id}
                onClick={() => toggleSelect(sp.id)}
                className={`p-5 flex flex-col justify-between gap-4 rounded-2xl relative transition-all cursor-pointer border select-none group ${
                  isSelected
                    ? "border-amber-400 ring-2 ring-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-[1.01]"
                    : "border-[rgba(217,119,6,0.15)] hover:border-amber-400/40"
                }`}
                style={{
                  background: isSelected ? "rgba(217, 119, 6, 0.1)" : S.card.background,
                }}
              >
                {/* Top Row: Checkbox, Tier badge, Actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* Checkbox */}
                    <div
                      className="w-5 h-5 rounded-lg flex items-center justify-center transition-all shadow shrink-0"
                      style={{
                        background: isSelected ? "#F59E0B" : "rgba(0,0,0,0.65)",
                        border: isSelected ? "1px solid #F59E0B" : "1px solid rgba(255,255,255,0.3)",
                        color: isSelected ? "#170D08" : "#fff",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(sp.id);
                      }}
                    >
                      {isSelected && <Check size={13} strokeWidth={3} />}
                    </div>

                    <span
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide"
                      style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}
                    >
                      {sp.tier}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openEdit(sp)}
                      title="Edit Sponsor"
                      className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                      style={{ background: "rgba(217, 119, 6,0.15)", color: "#fbbf24" }}
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => setDeleteId(sp.id)}
                      title="Delete Sponsor"
                      className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                      style={{ background: "rgba(239,68,68,0.15)", color: "#F87171" }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Logo Display */}
                <div
                  className="w-full h-20 rounded-xl flex items-center justify-center overflow-hidden p-2"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {sp.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sp.logo_url}
                      alt={sp.name}
                      className="max-h-16 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Star size={28} style={{ color: tc.color, opacity: 0.35 }} />
                  )}
                </div>

                {/* Sponsor Details */}
                <div className="flex flex-col gap-1 text-left">
                  <div className="font-extrabold text-[#F5EEE2] text-sm tracking-tight line-clamp-1">
                    {sp.name}
                  </div>
                  {sp.website_url ? (
                    <a
                      href={sp.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 text-xs hover:underline text-amber-400/80 hover:text-amber-300 transition-colors truncate"
                    >
                      <Globe size={11} className="shrink-0" />
                      <span className="truncate">{sp.website_url.replace(/^https?:\/\//, "")}</span>
                      <ExternalLink size={10} className="shrink-0 opacity-60" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-[var(--text-muted)] italic">No website url</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: BULK ADD DYNAMIC FORM                                            */}
      {/* ========================================================================= */}
      {showBulkAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
        >
          <div
            className="w-full max-w-4xl p-6 flex flex-col gap-5 max-h-[92vh] overflow-hidden rounded-[28px] border border-amber-500/30 shadow-2xl"
            style={{ background: "#24130E", color: "#F5EEE2" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h2 className="font-extrabold text-white text-lg tracking-tight font-primary uppercase">
                    Bulk Add Sponsors
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    Add multiple sponsors simultaneously via dynamic rows or quick paste.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPasteMode(!pasteMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    pasteMode ? "bg-amber-400 text-[#170D08]" : "bg-white/5 text-stone-300 hover:text-white"
                  }`}
                >
                  {pasteMode ? "Switch to Table" : "Quick Paste Mode"}
                </button>
                <button
                  onClick={() => setShowBulkAddModal(false)}
                  disabled={bulkSubmitting}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Quick Batch Options Bar */}
            {!pasteMode && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-stone-400 font-semibold">Set All To Tier:</span>
                  <select
                    value={bulkDefaultTier}
                    onChange={(e) => handleApplyDefaultTierToAll(e.target.value)}
                    className="bg-[#170D08] border border-amber-500/30 rounded-lg px-2.5 py-1 text-xs text-amber-300 outline-none cursor-pointer"
                  >
                    {TIERS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => bulkFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold cursor-pointer"
                    title="Select multiple logo images — one row is created per image, with the name guessed from the filename"
                  >
                    <UploadCloud size={13} /> Bulk Upload Logos
                  </button>
                  <input
                    ref={bulkFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) handleBulkImageUpload(files);
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 font-semibold cursor-pointer"
                  >
                    <Plus size={13} /> Add Row
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddMultipleRows(3)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 font-semibold cursor-pointer"
                  >
                    +3 Rows
                  </button>
                  <button
                    type="button"
                    onClick={() => setDynamicRows([createEmptyRow(bulkDefaultTier)])}
                    className="text-stone-400 hover:text-rose-400 px-2 py-1 transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            {/* Body */}
            {pasteMode ? (
              <div className="flex flex-col gap-3 py-2 flex-grow overflow-y-auto">
                <p className="text-xs text-stone-300 leading-relaxed">
                  Paste sponsor entries one per line. Formats supported:
                  <br />
                  <code className="text-amber-300 font-mono text-[11px]">
                    Sponsor Name | Tier | Website URL | Logo URL
                  </code>
                  <br />
                  <span className="text-[11px] text-stone-400">
                    (You can also paste tab-separated rows copied directly from Excel/Google Sheets).
                  </span>
                </p>
                <textarea
                  rows={9}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={`Red Bull | Title | https://redbull.com\nSony Music | Platinum | https://sonymusic.com\nTata Motors | Gold | https://tatamotors.com`}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-white outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleParsePaste}
                  disabled={!pasteText.trim()}
                  className="self-end px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#170D08] font-bold text-xs uppercase cursor-pointer disabled:opacity-40"
                >
                  Parse &amp; Populate Rows
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[50vh] pr-1">
                {dynamicRows.map((row, idx) => (
                  <div
                    key={row.id}
                    className="p-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-col md:flex-row items-center gap-3 transition-colors hover:border-amber-500/30"
                  >
                    {/* Index */}
                    <span className="w-6 h-6 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-[10px] font-mono text-stone-400 shrink-0">
                      {idx + 1}
                    </span>

                    {/* Name */}
                    <div className="flex-1 w-full">
                      <input
                        type="text"
                        placeholder="Sponsor Name *"
                        value={row.name}
                        onChange={(e) => handleRowChange(row.id, "name", e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                        required
                      />
                    </div>

                    {/* Tier */}
                    <div className="w-full md:w-36 shrink-0">
                      <select
                        value={row.tier}
                        onChange={(e) => handleRowChange(row.id, "tier", e.target.value)}
                        className="w-full bg-[#170D08] border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 outline-none focus:border-amber-400 cursor-pointer"
                      >
                        {TIERS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Logo (Upload / URL) */}
                    <div className="w-full md:w-48 flex items-center gap-2 shrink-0">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Logo URL or upload"
                          value={row.logo_url}
                          onChange={(e) => handleRowChange(row.id, "logo_url", e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-2.5 pr-7 py-2 text-[11px] text-white outline-none focus:border-amber-400 truncate"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[row.id]?.click()}
                          title="Upload logo file"
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-400 p-1 cursor-pointer"
                        >
                          {row.isUploading ? (
                            <Loader2 size={12} className="animate-spin text-amber-400" />
                          ) : (
                            <UploadCloud size={13} />
                          )}
                        </button>
                        <input
                          ref={(el) => { fileInputRefs.current[row.id] = el; }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleRowFileUpload(row.id, file);
                          }}
                        />
                      </div>

                      {/* Mini Thumbnail */}
                      {row.logo_url && (
                        <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center p-0.5 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={row.logo_url} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                      )}
                    </div>

                    {/* Website */}
                    <div className="w-full md:w-44 shrink-0">
                      <input
                        type="text"
                        placeholder="https://website.com"
                        value={row.website_url}
                        onChange={(e) => handleRowChange(row.id, "website_url", e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Row Action buttons */}
                    <div className="flex items-center gap-1 shrink-0 self-end md:self-center">
                      <button
                        type="button"
                        onClick={() => handleDuplicateRow(row)}
                        title="Duplicate row"
                        className="p-2 text-stone-400 hover:text-amber-300 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        disabled={dynamicRows.length <= 1}
                        title="Delete row"
                        className="p-2 text-stone-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer disabled:opacity-20"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer Summary & Submit */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 mt-auto">
              <div className="text-xs text-stone-400">
                <strong className="text-amber-400 font-mono text-sm">{validDynamicRows.length}</strong> valid sponsor(s) ready to create
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowBulkAddModal(false)}
                  disabled={bulkSubmitting}
                  style={{ ...S.btn, background: "rgba(255,255,255,0.06)", color: "#F5EEE2" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitBulkAdd}
                  disabled={bulkSubmitting || validDynamicRows.length === 0}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#170D08] bg-amber-400 hover:bg-amber-300 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {bulkSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check size={14} strokeWidth={3} /> Save {validDynamicRows.length} Sponsors
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: BULK DELETE CONFIRMATION                                         */}
      {/* ========================================================================= */}
      {showBulkDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
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
                Delete {validSelectedIds.size} Selected Sponsors?
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-secondary leading-relaxed">
                This will permanently remove the selected {validSelectedIds.size} sponsor(s) from the portal. This action cannot be undone.
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
      {/* MODAL 3: BULK CHANGE TIER                                                  */}
      {/* ========================================================================= */}
      {showBulkTierModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
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
                    Change Tier
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Updating <strong className="text-amber-400">{validSelectedIds.size}</strong> selected sponsors
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkTierModal(false)}
                disabled={bulkUpdatingTier}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                Select Target Tier
              </label>

              <select
                value={targetBulkTier}
                onChange={(e) => setTargetBulkTier(e.target.value)}
                style={S.input}
                className="cursor-pointer focus:border-amber-400"
              >
                {TIERS.map((t) => (
                  <option key={t} value={t} className="bg-[#170D08] text-white">
                    {t}
                  </option>
                ))}
              </select>

              {/* Quick Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {TIERS.map((t) => {
                  const active = targetBulkTier === t;
                  const tc = TIER_COLORS[t];
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTargetBulkTier(t)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        active
                          ? "bg-amber-400 text-[#170D08] shadow-sm font-bold scale-[1.03]"
                          : "bg-white/5 text-[var(--text-secondary)] hover:text-white hover:bg-white/10 border border-white/5"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2.5 justify-end pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowBulkTierModal(false)}
                disabled={bulkUpdatingTier}
                style={{ ...S.btn, background: "rgba(255,255,255,0.06)", color: "#F5EEE2" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkChangeTier}
                disabled={bulkUpdatingTier || !targetBulkTier}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#170D08] bg-amber-400 hover:bg-amber-300 cursor-pointer shadow-lg disabled:opacity-40 transition-all"
              >
                {bulkUpdatingTier ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <Check size={14} strokeWidth={3} /> Apply Tier ({validSelectedIds.size})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: SINGLE CREATE / EDIT SPONSOR                                     */}
      {/* ========================================================================= */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
        >
          <div className="w-full max-w-md p-6 flex flex-col gap-4 rounded-2xl" style={{ ...S.card, background: "#2A1510" }}>
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-[#F5EEE2] text-lg">
                {editTarget ? "Edit Sponsor" : "Add Single Sponsor"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ color: "rgba(203,185,160,0.6)" }}>
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { label: "Sponsor Name *", key: "name", placeholder: "e.g. Airtel" },
                { label: "Website URL", key: "website_url", placeholder: "https://example.com" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(203,185,160,0.7)" }}>
                    {f.label}
                  </label>
                  <input
                    style={S.input}
                    value={form[f.key as keyof typeof form]}
                    placeholder={f.placeholder}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
              <ImageUploadField
                label="Logo"
                value={form.logo_url}
                onChange={(url) => setForm((p) => ({ ...p, logo_url: url }))}
              />
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(203,185,160,0.7)" }}>
                  Tier *
                </label>
                <select
                  style={{ ...S.input, cursor: "pointer" }}
                  value={form.tier}
                  onChange={(e) => setForm((p) => ({ ...p, tier: e.target.value }))}
                >
                  {TIERS.map((t) => (
                    <option key={t} value={t} className="bg-[#170D08]">
                      {t}
                    </option>
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
                disabled={saving || !form.name.trim()}
                style={{
                  ...S.btn,
                  background: "linear-gradient(135deg, #F59E0B, #B45309)",
                  color: "#fff",
                  opacity: saving || !form.name.trim() ? 0.6 : 1,
                }}
              >
                {saving ? "Saving..." : <><Check size={14} /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: SINGLE DELETE CONFIRM                                            */}
      {/* ========================================================================= */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
        >
          <div className="w-full max-w-sm p-6 flex flex-col gap-5 text-center rounded-2xl" style={{ ...S.card, background: "#2A1510" }}>
            <div
              className="w-12 h-12 rounded-full mx-auto flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.12)" }}
            >
              <Trash2 size={20} style={{ color: "#F87171" }} />
            </div>
            <div>
              <p className="font-bold text-[#F5EEE2]">Delete Sponsor?</p>
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
