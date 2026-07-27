"use client";

import { useState, useEffect } from "react";
import { ApiClient } from "@/lib/api-client";

interface AboutPageContent {
  eyebrow: string;
  heading: string;
  subheading: string;
  introParagraphs: string[];
  milestones: { title: string; desc: string }[];
  coreValuesHeading: string;
  coreValues: { title: string; desc: string }[];
}

export default function AboutPage() {
  const [content, setContent] = useState<AboutPageContent | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      const data = await ApiClient.getSiteContent<AboutPageContent>("about_page");
      setContent(data);
    };
    fetchContent();
  }, []);

  if (!content) {
    return (
      <div className="container py-20 md:py-24 flex flex-col gap-12 max-w-4xl">
        <div className="text-center flex flex-col gap-3 items-center">
          <div className="h-4 w-40 rounded animate-pulse" style={{ background: "rgba(99,102,241,0.08)" }} />
          <div className="h-10 w-72 rounded animate-pulse" style={{ background: "rgba(99,102,241,0.08)" }} />
          <div className="h-4 w-96 max-w-full rounded animate-pulse" style={{ background: "rgba(99,102,241,0.06)" }} />
        </div>
        <div className="h-40 rounded-2xl animate-pulse" style={{ background: "rgba(99,102,241,0.06)" }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "rgba(99,102,241,0.06)" }} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "rgba(99,102,241,0.06)" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-20 md:py-24 flex flex-col gap-12 max-w-4xl">
      {/* Header */}
      <div className="text-center flex flex-col gap-3">
        <span className="text-sm font-semibold uppercase tracking-widest text-cyan-400">{content?.eyebrow}</span>
        <h1 className="text-4xl md:text-5xl font-black font-primary text-white">{content?.heading}</h1>
        <p className="text-gray-400 text-sm leading-relaxed max-w-xl mx-auto">
          {content?.subheading}
        </p>
      </div>

      {/* Intro Block */}
      <div className="glass-panel p-8 md:p-10 rounded-2xl border-indigo-500/10 flex flex-col gap-6 leading-relaxed text-sm text-gray-300">
        {(content?.introParagraphs ?? []).map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </div>

      {/* Milestones grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        {(content?.milestones ?? []).map((stat, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-xl border-[rgba(255,255,255,0.06)] flex flex-col gap-2">
            <span className="text-3xl font-black text-cyan-400 font-primary">{stat.title}</span>
            <span className="text-xs text-gray-500 font-semibold uppercase">{stat.desc}</span>
          </div>
        ))}
      </div>

      {/* Core Values */}
      <div className="flex flex-col gap-6 mt-4">
        <h3 className="text-2xl font-bold text-white font-primary">{content?.coreValuesHeading}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {(content?.coreValues ?? []).map((val, idx) => (
            <div key={idx} className="glass-panel p-5 rounded-xl border-[rgba(255,255,255,0.04)] flex flex-col gap-2 bg-slate-900/10">
              <h4 className="font-bold text-white text-sm font-primary">{val.title}</h4>
              <p className="text-gray-400 text-xs leading-normal">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
