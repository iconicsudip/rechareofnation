"use client";

import { useEffect, useRef, useState } from "react";
import { UploadCloud, X, Link as LinkIcon, Loader2, Check } from "lucide-react";
import { optimizeImageBeforeUpload } from "@/lib/client-image-optimizer";

interface ImageUploadFieldProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  // When true, also accepts video uploads/URLs (used for hero backgrounds
  // that can be either a still image or a background video).
  allowVideo?: boolean;
}

const S = {
  input: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(217, 119, 6,0.2)",
    borderRadius: "10px", color: "#E2E8F0", outline: "none", padding: "10px 12px",
    fontSize: "13px", width: "100%",
  },
};

function isVideoUrl(url: string): boolean {
  const clean = url.trim().toLowerCase().split("?")[0];
  return clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".mov") || clean.endsWith(".ogg");
}

export default function ImageUploadField({ label, value, onChange, allowVideo }: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);

    // Instant optimistic preview so the user experiences zero waiting
    const localBlobUrl = URL.createObjectURL(file);
    onChange(localBlobUrl);

    try {
      // Hardware-accelerated client-side optimization to WebP (15-30ms)
      const optimizedFile = await optimizeImageBeforeUpload(file, 1920, 0.82);

      const formData = new FormData();
      formData.append("file", optimizedFile);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.success) {
        onChange(data.url);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch {
      setError(`Upload failed. Try pasting a${allowVideo ? "n image or video" : "n image"} URL instead.`);
    } finally {
      URL.revokeObjectURL(localBlobUrl);
      setUploading(false);
    }
  };

  // Paste-to-upload: while the pointer is over (or focus is inside) this field,
  // a pasted image from the clipboard is uploaded like a chosen file.
  const [active, setActive] = useState(false);
  const handleFileRef = useRef(handleFile);
  handleFileRef.current = handleFile;
  useEffect(() => {
    if (!active) return;
    const onPaste = (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items || []);
      const item = items.find(
        (it) => it.kind === "file" && (it.type.startsWith("image/") || (allowVideo && it.type.startsWith("video/")))
      );
      const file = item?.getAsFile();
      if (!file) return;
      e.preventDefault();
      handleFileRef.current(file);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [active, allowVideo]);

  return (
    <div
      tabIndex={-1}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className="outline-none"
    >
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "rgba(148,163,184,0.5)" }}>
          {label}
        </label>
      )}

      <div className="flex flex-col gap-2">
        {value ? (
          <div className="relative w-full h-32 rounded-xl overflow-hidden group"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {allowVideo && isVideoUrl(value) ? (
              <video src={value} className="w-full h-full object-cover" muted loop autoPlay playsInline />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt="Preview"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/logo.png";
                }}
                className="w-full h-full object-cover"
              />
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center gap-2 text-xs font-bold text-amber-300">
                <Loader2 size={16} className="animate-spin text-amber-400" />
                <span>Optimizing & Saving...</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-32 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(217, 119, 6,0.3)", color: "rgba(148,163,184,0.6)" }}
          >
            {uploading ? (
              <>
                <Loader2 size={20} className="animate-spin" style={{ color: "#fbbf24" }} />
                <span className="text-xs">Compressing & Saving...</span>
              </>
            ) : (
              <>
                <UploadCloud size={20} className="text-amber-500/80" />
                <span className="text-xs font-medium text-[#F5EEE2]">Click to upload {allowVideo ? "an image or video" : "an image"}</span>
                <span className="text-[10px] text-amber-500/70 font-mono">Or hover &amp; paste (Ctrl/Cmd+V) • Auto-compressed</span>
              </>
            )}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={allowVideo ? "image/*,video/*" : "image/*"}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />

        {error && <p className="text-xs" style={{ color: "#F87171" }}>{error}</p>}

        <button
          type="button"
          onClick={() => setShowUrlInput((s) => !s)}
          className="flex items-center gap-1.5 text-xs w-fit"
          style={{ color: "rgba(245, 158, 11,0.8)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <LinkIcon size={11} /> {showUrlInput ? "Hide URL input" : `Or paste a${allowVideo ? "n image or video" : "n image"} URL`}
        </button>

        {showUrlInput && (
          <input
            style={S.input}
            placeholder="https://..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>
    </div>
  );
}
