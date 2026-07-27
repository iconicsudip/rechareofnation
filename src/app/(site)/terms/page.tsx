"use client";

import { useState, useEffect } from "react";
import { ApiClient } from "@/lib/api-client";

interface LegalPageContent {
  heading: string;
  lastUpdated: string;
  introText: string;
  sections: { title: string; body: string }[];
}

export default function TermsConditionsPage() {
  const [content, setContent] = useState<LegalPageContent | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      const data = await ApiClient.getSiteContent<LegalPageContent>("legal_terms");
      setContent(data);
    };
    fetchContent();
  }, []);

  if (!content) {
    return (
      <div className="container py-20 md:py-24 flex flex-col gap-10 max-w-4xl text-left">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-40 rounded animate-pulse" style={{ background: "rgba(99,102,241,0.08)" }} />
          <div className="h-10 w-72 rounded animate-pulse" style={{ background: "rgba(99,102,241,0.08)" }} />
          <div className="h-3 w-32 rounded animate-pulse" style={{ background: "rgba(99,102,241,0.06)" }} />
        </div>
        <div className="h-96 rounded-2xl animate-pulse" style={{ background: "rgba(99,102,241,0.06)" }} />
      </div>
    );
  }

  return (
    <div className="container py-20 md:py-24 flex flex-col gap-10 max-w-4xl text-left">
      <div>
        <span className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Legal Documentation</span>
        <h1 className="text-4xl font-black mt-1 font-primary text-white">{content?.heading}</h1>
        <p className="text-gray-500 text-xs mt-2">Last Updated: {content?.lastUpdated}</p>
      </div>

      <div className="glass-panel p-8 md:p-10 rounded-2xl border-[rgba(255,255,255,0.06)] flex flex-col gap-6 text-sm text-gray-300 leading-relaxed font-secondary">
        <p>
          {content?.introText}
        </p>

        {(content?.sections ?? []).map((section, idx) => (
          <div key={idx} className="flex flex-col gap-6">
            <h3 className="text-lg font-bold text-white font-primary mt-4">{section.title}</h3>
            <div dangerouslySetInnerHTML={{ __html: section.body }} />
          </div>
        ))}
      </div>
    </div>
  );
}
