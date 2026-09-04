"use client";

import { useState, useEffect } from "react";
import { ApiClient } from "@/lib/api-client";
import {
  Sparkles, ShieldCheck, BadgeCheck, Zap, Award, Users, Gem, Compass,
} from "lucide-react";

// Fixed icon/color palette cycled by index for CMS-driven cards (milestones,
// core values) — content is admin-editable free text with no inherent icon.
const ACCENT_PALETTE = [
  { icon: Sparkles, bg: "bg-pink-50", border: "border-pink-100", text: "text-pink-600" },
  { icon: ShieldCheck, bg: "bg-indigo-50", border: "border-indigo-100", text: "text-indigo-600" },
  { icon: BadgeCheck, bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-600" },
  { icon: Zap, bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-600" },
  { icon: Award, bg: "bg-purple-50", border: "border-purple-100", text: "text-purple-600" },
  { icon: Users, bg: "bg-cyan-50", border: "border-cyan-100", text: "text-cyan-600" },
  { icon: Gem, bg: "bg-rose-50", border: "border-rose-100", text: "text-rose-600" },
  { icon: Compass, bg: "bg-orange-50", border: "border-orange-100", text: "text-orange-600" },
];

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
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28 border-b border-slate-100">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="container relative z-10 text-center flex flex-col items-center gap-4 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-pink-50 border border-pink-100 text-pink-600 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full font-primary">
            <Sparkles size={12} /> {content?.eyebrow}
          </span>
          <h1 className="text-4xl md:text-6xl font-black font-primary text-slate-900 tracking-tight">{content?.heading}</h1>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-xl">
            {content?.subheading}
          </p>
        </div>
      </section>

      <div className="container py-16 md:py-20 flex flex-col gap-16 max-w-5xl">
        {/* Intro Block */}
        <div className="bg-white border border-slate-200/90 rounded-[28px] shadow-sm p-8 md:p-12 flex flex-col gap-6 leading-relaxed text-sm md:text-[15px] text-slate-600 relative overflow-hidden">
          <span className="absolute -top-4 -left-2 text-8xl font-black font-primary text-slate-50 select-none leading-none">&ldquo;</span>
          {(content?.introParagraphs ?? []).map((paragraph, idx) => (
            <p key={idx} className="relative z-10">{paragraph}</p>
          ))}
        </div>

        {/* Milestones */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {(content?.milestones ?? []).map((stat, idx) => {
            const accent = ACCENT_PALETTE[idx % ACCENT_PALETTE.length];
            const Icon = accent.icon;
            return (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col items-center text-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${accent.bg} border ${accent.border}`}>
                  <Icon size={18} className={accent.text} />
                </div>
                <span className="text-3xl font-black text-slate-900 font-primary">{stat.title}</span>
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wide">{stat.desc}</span>
              </div>
            );
          })}
        </div>

        {/* Core Values */}
        <div className="flex flex-col gap-8">
          <div className="text-center flex flex-col gap-2 max-w-lg mx-auto">
            <span className="text-[11px] font-primary font-bold tracking-widest text-indigo-600 uppercase">What Sets Us Apart</span>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 font-primary">{content?.coreValuesHeading}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {(content?.coreValues ?? []).map((val, idx) => {
              const accent = ACCENT_PALETTE[idx % ACCENT_PALETTE.length];
              const Icon = accent.icon;
              return (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <div className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center ${accent.bg} border ${accent.border}`}>
                    <Icon size={18} className={accent.text} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h4 className="font-bold text-slate-900 text-sm font-primary">{val.title}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">{val.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
