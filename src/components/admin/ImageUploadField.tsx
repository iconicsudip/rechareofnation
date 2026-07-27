"use client";

import { useRef, useState } from "react";
import { UploadCloud, X, Link as LinkIcon, Loader2 } from "lucide-react";

interface ImageUploadFieldProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
}

const S = {
  input: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: "10px", color: "#E2E8F0", outline: "none", padding: "10px 12px",
    fontSize: "13px", width: "100%",
  },
};

export default function ImageUploadField({ label, value, onChange }: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.success) {
        onChange(data.url);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch {
      setError("Upload failed. Try pasting an image URL instead.");
    }
    setUploading(false);
  };

  return (
    <div>
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "rgba(148,163,184,0.5)" }}>
          {label}
        </label>
      )}

      <div className="flex flex-col gap-2">
        {value ? (
          <div className="relative w-full h-32 rounded-xl overflow-hidden group"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
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
            className="w-full h-32 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(99,102,241,0.3)", color: "rgba(148,163,184,0.6)" }}
          >
            {uploading ? (
              <>
                <Loader2 size={20} className="animate-spin" style={{ color: "#818CF8" }} />
                <span className="text-xs">Uploading...</span>
              </>
            ) : (
              <>
                <UploadCloud size={20} />
                <span className="text-xs">Click to upload an image</span>
              </>
            )}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
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
          style={{ color: "rgba(129,140,248,0.8)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <LinkIcon size={11} /> {showUrlInput ? "Hide URL input" : "Or paste an image URL"}
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
