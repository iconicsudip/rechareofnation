"use client";

import { useRef, useState } from "react";
import { UploadCloud, FileText, X, ExternalLink, Loader2 } from "lucide-react";

interface PdfUploadFieldProps {
  label?: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
}

const S = {
  input: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(217, 119, 6,0.2)",
    borderRadius: "10px",
    color: "#F5EEE2",
    outline: "none",
    padding: "10px 12px",
    fontSize: "13px",
    width: "100%",
  },
};

export default function PdfUploadField({ label, hint, value, onChange }: PdfUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError("Upload failed. Try pasting a PDF link directly.");
    }
    setUploading(false);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: "rgba(203,185,160,0.6)" }}>
          {label}
        </label>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            style={S.input}
            placeholder="Paste PDF link (e.g. /brochure.pdf or https://...) or upload below"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-2.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/5 transition-colors cursor-pointer shrink-0"
              title="Clear PDF"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 text-xs font-bold font-primary uppercase tracking-wider transition-colors cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Uploading PDF...</span>
              </>
            ) : (
              <>
                <UploadCloud size={13} />
                <span>Upload PDF File</span>
              </>
            )}
          </button>

          {value && (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline"
            >
              <FileText size={13} />
              <span>Preview PDF Document</span>
              <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>

      {error && <span className="text-[11px] text-rose-400">{error}</span>}
      {hint && <p className="text-[11px]" style={{ color: "rgba(203,185,160,0.4)" }}>{hint}</p>}
    </div>
  );
}
