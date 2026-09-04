"use client";

import { useState, useEffect } from "react";
import { FileText, ShieldCheck } from "lucide-react";
import { ApiClient } from "@/lib/api-client";

interface LegalPageContent {
  heading: string;
  lastUpdated: string;
  introText: string;
  sections: { title: string; body: string }[];
}

export default function PrivacyPolicyPage() {
  const [content, setContent] = useState<LegalPageContent | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      const data = await ApiClient.getSiteContent<LegalPageContent>("legal_privacy");
      setContent(data);
    };
    fetchContent();
  }, []);

  if (!content) {
    return (
      <div className="min-h-screen bg-[#f8fafc] container py-20 md:py-24 flex flex-col gap-10 max-w-4xl text-left">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-40 rounded animate-pulse" style={{ background: "rgba(99,102,241,0.08)" }} />
          <div className="h-10 w-72 rounded animate-pulse" style={{ background: "rgba(99,102,241,0.08)" }} />
          <div className="h-3 w-32 rounded animate-pulse" style={{ background: "rgba(99,102,241,0.06)" }} />
        </div>
        <div className="h-96 rounded-2xl animate-pulse" style={{ background: "rgba(99,102,241,0.06)" }} />
      </div>
    );
  }

  const sections = content?.sections ?? [];

  return (
    <div className="min-h-screen bg-[#f8fafc] container py-20 md:py-24 flex flex-col gap-12 max-w-6xl text-left">
      {/* Header */}
      <div className="flex flex-col gap-3 max-w-2xl">
        <span className="inline-flex items-center gap-2 bg-pink-50 border border-pink-100 text-pink-600 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full font-primary w-fit">
          <ShieldCheck size={12} /> Legal Documentation
        </span>
        <h1 className="text-4xl md:text-5xl font-black font-primary text-slate-900 tracking-tight">{content?.heading}</h1>
        <p className="text-slate-400 text-xs">Last Updated: {content?.lastUpdated}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Table of Contents */}
        {sections.length > 0 && (
          <div className="lg:col-span-4 lg:sticky lg:top-24 bg-white border border-slate-200/90 rounded-[24px] shadow-sm p-6 flex flex-col gap-1">
            <span className="text-[10px] font-primary font-bold tracking-widest text-slate-400 uppercase mb-2 flex items-center gap-2">
              <FileText size={12} /> On This Page
            </span>
            {sections.map((section, idx) => (
              <a
                key={idx}
                href={`#section-${idx}`}
                className="flex items-center gap-3 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-xl px-2.5 py-2 transition-colors"
              >
                <span className="w-5 h-5 shrink-0 rounded-full bg-slate-100 text-slate-500 text-[9px] font-bold flex items-center justify-center font-primary">
                  {idx + 1}
                </span>
                <span className="line-clamp-1">{section.title.replace(/^\d+[.)]\s*/, "")}</span>
              </a>
            ))}
          </div>
        )}

        {/* Document body */}
        <div className={`${sections.length > 0 ? "lg:col-span-8" : "lg:col-span-12"} bg-white border border-slate-200/90 rounded-[28px] shadow-sm p-8 md:p-10 flex flex-col gap-8 text-sm text-slate-600 leading-relaxed font-secondary`}>
          <p>{content?.introText}</p>

          {sections.map((section, idx) => (
            <div key={idx} id={`section-${idx}`} className="flex flex-col gap-4 scroll-mt-24 pt-6 border-t border-slate-100 first:border-t-0 first:pt-0">
              <h3 className="text-lg font-bold text-slate-900 font-primary flex items-center gap-3">
                <span className="w-7 h-7 shrink-0 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-black flex items-center justify-center font-primary">
                  {idx + 1}
                </span>
                {section.title.replace(/^\d+[.)]\s*/, "")}
              </h3>
              <div className="pl-10 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2" dangerouslySetInnerHTML={{ __html: section.body }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
