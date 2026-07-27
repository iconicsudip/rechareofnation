"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy, Calendar, MapPin, Award, ShieldAlert, ArrowRight,
  User, Check, Sparkles, ChevronRight, HelpCircle, AlertCircle,
  ArrowLeft
} from "lucide-react";
import CompetitorBoardingModal from "@/components/CompetitorBoardingModal";
import { ApiClient, CompetitionRecord } from "@/lib/api-client";

export default function CompetitionsPage() {
  // Fetched competition record
  const [competition, setCompetition] = useState<CompetitionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompetition = async () => {
      const data = await ApiClient.getCompetitionBySlug("miss-mr-traditional-india-2026");
      if (data) setCompetition(data);
      setIsLoading(false);
    };
    fetchCompetition();
  }, []);

  // Pageant Score Simulator States
  const [authenticity, setAuthenticity] = useState(88);
  const [eloquence, setEloquence] = useState(85);
  const [demeanor, setDemeanor] = useState(90);

  // Computed Pageant Score
  const pageantScore = Math.round((authenticity * 0.4) + (eloquence * 0.4) + (demeanor * 0.2));

  const getRankBadge = (score: number) => {
    if (score >= 90) return "TOP 5 (NATIONAL FINALS CORE ELITE)";
    if (score >= 85) return "TOP 10 (NATIONAL FINALS CORE ELITE)";
    if (score >= 75) return "TOP 25 (REGIONAL STAR CONTENDER)";
    return "QUALIFIED CONTENDER (STAGE ELIGIBLE)";
  };

  // Contender Card Customizer States
  const [contenderName, setContenderName] = useState("VIDYA SHARMA");
  const [coutureDivision, setCoutureDivision] = useState("Miss Traditional India");
  const [handloomFocus, setHandloomFocus] = useState("Varanasi Brocade Silk");

  // Regional Audition Tour Tab State
  const [activeHub, setActiveHub] = useState<"south" | "north" | "eastwest">("south");

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Competitor Boarding Modal State
  const [showBoardingModal, setShowBoardingModal] = useState(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 136,
    hours: 17,
    minutes: 25,
    seconds: 23
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setShowBoardingModal(true);
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#f8fafc] py-20 text-center text-slate-400 text-sm font-secondary">
        Loading Competition Details...
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="w-full min-h-screen bg-[#f8fafc] py-20 text-center flex flex-col items-center gap-4 font-secondary">
        <span className="text-4xl">⚠️</span>
        <h3 className="text-xl font-bold text-slate-900 font-primary">Competition Not Found</h3>
        <p className="text-slate-500 text-sm">The competition you are looking for does not exist or has been removed.</p>
        <Link href="/events" className="bg-slate-900 hover:bg-slate-800 text-white font-primary font-bold text-xs uppercase px-6 py-3 rounded-full transition-colors">
          Back to Directory
        </Link>
      </div>
    );
  }

  // Split the single rules[] array into the two display sections without losing or inventing text:
  // first 4 entries are eligibility/guideline items, the remainder are crown audition (scoring/jury) rules.
  const eligibilityRules = competition.rules.slice(0, 4);
  const auditionRules = competition.rules.slice(4);

  // Group the flat regionalHubs[] array into the 3 regional tabs (seeded in North(3) -> South(3) -> East/West(3) order).
  const hubGroups: Record<"north" | "south" | "eastwest", typeof competition.regionalHubs> = {
    north: competition.regionalHubs.slice(0, 3),
    south: competition.regionalHubs.slice(3, 6),
    eastwest: competition.regionalHubs.slice(6, 9),
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 py-8 font-secondary">
      <div className="container max-w-7xl mx-auto px-4 flex flex-col gap-8">

        {/* Back Link */}
        <div className="text-left">
          <div className="flex justify-start">
            <Link href="/events" className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-900 font-primary font-bold uppercase tracking-widest transition-colors">
              <ArrowLeft size={8.5} /> Back to Directory
            </Link>
          </div>
        </div>

        {/* 1. Pageant Hero Banner */}
        <div className="bg-[#0f172a] rounded-[24px] border border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-8 md:p-12 relative overflow-hidden text-left flex flex-col gap-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-bl-full filter blur-3xl pointer-events-none"></div>

          <div className="flex flex-wrap gap-2.5 relative z-10">
            <span className="bg-amber-500 text-slate-950 font-primary text-[8px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider">
              ✦ National Crown Championship ✦
            </span>
            <span className="bg-pink-600 text-white font-primary text-[8px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider">
              Handloom Couture Focus
            </span>
          </div>

          <div className="max-w-3xl relative z-10">
            <h1 className="text-3xl sm:text-5xl font-black text-white font-primary uppercase tracking-tight leading-tight">
              MISS & MR TRADITIONAL <span className="text-amber-400">INDIA 2026</span>
            </h1>
            <div
              className="text-slate-300 text-xs sm:text-sm mt-4 font-secondary leading-relaxed max-w-2xl"
              dangerouslySetInnerHTML={{ __html: competition.description }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-y-3 gap-x-6 pt-4 border-t border-gray-800 relative z-10 text-[10.5px] sm:text-xs font-primary font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5"><MapPin size={13} className="text-pink-500" /> {competition.venue}, {competition.city}</span>
            <span className="flex items-center gap-1.5"><Calendar size={13} className="text-indigo-400" /> {competition.eventDate}</span>
            <span className="flex items-center gap-1.5 text-amber-400"><Trophy size={13} /> Prize Pool: {competition.prizePool}</span>
          </div>
        </div>

        {/* 2. Grid Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-8">

            {/* Preservation Mission */}
            <div className="bg-white border border-slate-200 rounded-[20px] p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4">
              <h2 className="text-xs font-primary tracking-widest text-amber-500 font-bold uppercase flex items-center gap-2">
                <ShieldAlert size={14} /> PRESERVATION MISSION
              </h2>
              <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed font-secondary">
                Miss & Mr. Traditional India is not a standard beauty pageant. It is a country-wide cultural movement dedicated
                to mainstreaming regional weavers, handloom fabrics, and linguistic lineages. Contenders are evaluated
                strictly on their sartorial research (identifying real weaver cooperatives), verbal fluency in their native mother
                tongue, and overall poise.
              </p>
            </div>

            {/* Pageant Score Simulator */}
            <div className="bg-white border border-slate-200 rounded-[20px] p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-6">
              <div>
                <span className="text-[9px] font-primary tracking-widest text-slate-400 font-bold uppercase">LIVE JURY EVALUATION SIMULATOR</span>
                <h2 className="text-lg font-black text-slate-900 font-primary uppercase tracking-tight mt-0.5">
                  SIMULATE YOUR PAGEANT SCORE
                </h2>
                <p className="text-slate-500 text-xs mt-1">
                  Adjust the jury sliders below to forecast how traditional preservationists rate your handlooms, linguistics, and poise.
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center">

                {/* Sliders Block */}
                <div className="flex-grow w-full flex flex-col gap-5">

                  {/* Slider 1 */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Handloom Authenticity (40% Weight)</span>
                      <span className="text-indigo-600">{authenticity}/100</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={authenticity}
                      onChange={(e) => setAuthenticity(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                    />
                  </div>

                  {/* Slider 2 */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Linguistic Eloquence (40% Weight)</span>
                      <span className="text-indigo-600">{eloquence}/100</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={eloquence}
                      onChange={(e) => setEloquence(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                    />
                  </div>

                  {/* Slider 3 */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Stage Demeanor & Walk (20% Weight)</span>
                      <span className="text-indigo-600">{demeanor}/100</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={demeanor}
                      onChange={(e) => setDemeanor(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                    />
                  </div>

                </div>

                {/* Score Preview Widget */}
                <div className="w-full md:w-56 shrink-0 bg-slate-50 border border-slate-200/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-1.5">
                  <span className="text-[8px] text-slate-400 font-primary font-bold tracking-widest uppercase">PROJECTED JURY SCORE</span>
                  <span className="text-5xl font-black text-indigo-600 font-primary tracking-tight">{pageantScore}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Weighted Average out of 100</span>
                  <span className="bg-indigo-50 border border-indigo-200 text-indigo-600 text-[8px] font-primary font-bold px-2 py-0.5 rounded mt-1.5">
                    {getRankBadge(pageantScore)}
                  </span>
                </div>

              </div>

              {/* Ethics Code Banner */}
              <div className="bg-[#0f172a] rounded-xl p-4 text-left border border-gray-800 flex flex-col gap-1.5 mt-2">
                <span className="text-amber-400 font-primary text-[8px] font-extrabold uppercase tracking-widest flex items-center gap-1">
                  🛡️ CROWN CURATION ETHICS CODE
                </span>
                <p className="text-slate-300 text-[10.5px] leading-relaxed">
                  To prevent commercial infiltration, any candidate wearing machine-printed fabrics or duplicate synthetics
                  is immediately disqualified. Sourcing certifications from handloom weaver cooperatives must be submitted
                  during regional auditions.
                </p>
              </div>
            </div>

            {/* Regional Audition Tour */}
            <div className="bg-white border border-slate-200 rounded-[20px] p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-4">
                <div>
                  <span className="text-[9px] font-primary tracking-widest text-slate-400 font-bold uppercase">AUDITION TRACKS</span>
                  <h2 className="text-lg font-black text-slate-900 font-primary uppercase tracking-tight mt-0.5">
                    REGIONAL AUDITION TOUR
                  </h2>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl text-[10px] font-primary font-bold uppercase tracking-wider text-slate-500 self-start border border-slate-200">
                  <button
                    onClick={() => setActiveHub("north")}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeHub === "north" ? "bg-white text-indigo-600 shadow-sm" : "hover:text-slate-800"}`}
                  >
                    North Hub
                  </button>
                  <button
                    onClick={() => setActiveHub("south")}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeHub === "south" ? "bg-white text-indigo-600 shadow-sm" : "hover:text-slate-800"}`}
                  >
                    South Hub
                  </button>
                  <button
                    onClick={() => setActiveHub("eastwest")}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeHub === "eastwest" ? "bg-white text-indigo-600 shadow-sm" : "hover:text-slate-800"}`}
                  >
                    East/West Hub
                  </button>
                </div>
              </div>

              {/* Grid of locations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {hubGroups[activeHub].map((spot, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex flex-col gap-2.5">
                    <span className="text-[8px] text-amber-500 font-primary font-bold uppercase tracking-widest">AUDITION GATEWAY</span>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs font-primary">{spot.city}</h4>
                      <p className="text-slate-500 text-[10.5px] font-secondary mt-0.5">{spot.venue}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 font-primary block mt-1">{spot.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Eligibility & Guidelines */}
            <div className="bg-white border border-slate-200 rounded-[20px] p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4">
              <h2 className="text-xs font-primary tracking-widest text-slate-400 font-bold uppercase flex items-center gap-2">
                📋 ELIGIBILITY & GUIDELINES
              </h2>
              <ol className="flex flex-col gap-2.5 text-xs text-slate-600 font-secondary mt-1">
                {eligibilityRules.map((rule, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="font-primary text-indigo-500 font-bold">{idx + 1}.</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Crown Audition Rules */}
            <div className="bg-white border border-slate-200 rounded-[20px] p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4">
              <h2 className="text-xs font-primary tracking-widest text-slate-400 font-bold uppercase flex items-center gap-2">
                🛡️ CROWN AUDITION RULES
              </h2>
              <ul className="flex flex-col gap-2.5 text-xs text-slate-600 font-secondary mt-1">
                {auditionRules.map((rule, idx) => (
                  <li key={idx} className="flex gap-2 items-start">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Elite Audition Curation Jury */}
            <div className="bg-white border border-slate-200 rounded-[20px] p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-6">
              <h2 className="text-xs font-primary tracking-widest text-slate-400 font-bold uppercase flex items-center gap-2">
                👥 ELITE AUDITION CURATION JURY
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {competition.judges.map((j, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 bg-slate-250 rounded-full flex items-center justify-center text-slate-400">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-[11px] font-primary tracking-tight leading-tight uppercase">{j.name}</h4>
                      <span className="text-[8px] text-amber-500 font-primary font-bold tracking-wider uppercase mt-1 block">{j.role}</span>
                    </div>
                    <p className="text-slate-500 text-[9.5px] leading-relaxed font-secondary">{j.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Accordion */}
            <div className="bg-white border border-slate-200 rounded-[20px] p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-6">
              <div>
                <span className="text-[9px] font-primary tracking-widest text-slate-400 font-bold uppercase">CONTESTANT SUPPORT HELPDESK</span>
                <h2 className="text-lg font-black text-slate-900 font-primary uppercase tracking-tight mt-0.5">
                  CHAMPIONSHIP ENTRY FAQS
                </h2>
              </div>

              <div className="flex flex-col gap-3">
                {competition.faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full text-left py-3 px-4 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer hover:bg-slate-100/50 transition-colors"
                      >
                        <span className="uppercase tracking-tight leading-snug">{faq.q}</span>
                        <span className="text-indigo-600 font-primary text-base font-extrabold">{isOpen ? "-" : "+"}</span>
                      </button>
                      {isOpen && (
                        <div className="p-4 bg-white border-t border-slate-150 text-[11px] leading-relaxed text-slate-600 font-secondary">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">

            {/* 1. Countdown Widget */}
            <div className="bg-[#0f172a] border border-gray-800 rounded-[20px] p-6 text-left shadow-[0_12px_30px_rgba(0,0,0,0.15)] flex flex-col gap-4 relative overflow-hidden">
              <span className="text-pink-500 font-primary text-[8px] font-extrabold tracking-widest uppercase">AUDITION PORTAL STATUS</span>
              <h3 className="font-extrabold text-white text-[11.5px] font-primary uppercase tracking-tight -mt-1.5">
                NATIONAL REGISTRATION GATEWAY
              </h3>

              {/* Countdown Ticker */}
              <div className="grid grid-cols-4 gap-2 text-center mt-1">
                {[
                  { value: timeLeft.days, label: "DAYS" },
                  { value: timeLeft.hours, label: "HOURS" },
                  { value: timeLeft.minutes, label: "MINS" },
                  { value: timeLeft.seconds, label: "SECS" }
                ].map((c, i) => (
                  <div key={i} className="bg-slate-900 border border-gray-800 rounded-xl p-3 flex flex-col items-center">
                    <span className="text-xl sm:text-2xl font-black text-white font-primary tracking-tight">{c.value.toString().padStart(2, '0')}</span>
                    <span className="text-[7.5px] text-slate-400 font-primary font-bold tracking-widest mt-1 block">{c.label}</span>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-slate-400 font-secondary leading-relaxed text-center mt-1">
                Formal registration approvals take 48-72 hours post digital submission verification.
              </p>
            </div>

            {/* 2. Contender Customizer Card */}
            <div className="bg-[#0c1222] border border-gray-805 rounded-[20px] p-6 text-left shadow-[0_12px_30px_rgba(0,0,0,0.15)] flex flex-col gap-4 relative overflow-hidden">
              <div>
                <span className="text-amber-500 font-primary text-[8px] font-extrabold tracking-widest uppercase">CONTESTANT PROFILE CURATION</span>
                <h3 className="font-extrabold text-white text-xs font-primary uppercase tracking-tight mt-0.5">
                  LIVE CONTENDER CARD CUSTOMIZER
                </h3>
                <p className="text-slate-400 text-[10px] font-secondary mt-0.5">
                  Customize your contender prior to auditing.
                </p>
              </div>

              <form onSubmit={handleRegister} className="flex flex-col gap-4">

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[8px] font-primary tracking-wider text-slate-400 font-bold uppercase">CONTESTANT NAME</label>
                  <input
                    type="text"
                    value={contenderName}
                    onChange={(e) => setContenderName(e.target.value.toUpperCase())}
                    className="w-full text-xs font-primary font-bold text-white bg-slate-950 border border-gray-800 rounded-xl px-3.5 py-2.5 outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700 uppercase"
                    placeholder="ENTER FULL NAME"
                    required
                  />
                </div>

                {/* Couture Division */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[8px] font-primary tracking-wider text-slate-400 font-bold uppercase">COUTURE DIVISION</label>
                  <select
                    value={coutureDivision}
                    onChange={(e) => setCoutureDivision(e.target.value)}
                    className="w-full text-xs text-white bg-slate-950 border border-gray-800 rounded-xl px-3.5 py-2.5 outline-none focus:border-gray-700"
                  >
                    <option value="Miss Traditional India">Miss Traditional India</option>
                    <option value="Mr Traditional India">Mr Traditional India</option>
                  </select>
                </div>

                {/* Handloom Focus */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[8px] font-primary tracking-wider text-slate-400 font-bold uppercase">REGIONAL HANDLOOM FOCUS</label>
                  <select
                    value={handloomFocus}
                    onChange={(e) => setHandloomFocus(e.target.value)}
                    className="w-full text-xs text-white bg-slate-950 border border-gray-800 rounded-xl px-3.5 py-2.5 outline-none focus:border-gray-700"
                  >
                    <option value="Varanasi Brocade Silk">Varanasi Brocade Silk</option>
                    <option value="Kanjeevaram Handloom">Kanjeevaram Handloom</option>
                    <option value="Pochampally Ikat Weave">Pochampally Ikat Weave</option>
                    <option value="Benarasi Tanchoi Zari">Benarasi Tanchoi Zari</option>
                    <option value="Chanderi Cotton-Silk">Chanderi Cotton-Silk</option>
                  </select>
                </div>

                {/* Dynamic Preview Card */}
                <div className="border border-gray-800 bg-slate-950/90 rounded-2xl p-4.5 flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-bl-full filter blur-xl"></div>

                  <div className="flex justify-between items-start">
                    <div className="text-left">
                      <span className="text-[7.5px] font-primary text-slate-500 font-bold uppercase block">ATHLETE MONIKER</span>
                      <span className="text-xs font-black text-white font-primary uppercase tracking-wide block mt-0.5">{contenderName || "TBD CONTENDER"}</span>
                    </div>
                    <Trophy size={14} className="text-amber-500" />
                  </div>

                  <div className="flex justify-between items-end pt-3.5 border-t border-gray-800">
                    <div className="text-left flex flex-col gap-0.5">
                      <span className="text-[7.5px] font-primary text-slate-500 font-bold uppercase">DIVISION / TEXTILE FOCUS</span>
                      <span className="text-[9.5px] font-bold text-slate-200 font-primary uppercase tracking-tight">{coutureDivision}</span>
                      <span className="text-[8.5px] text-amber-500 font-primary font-medium uppercase tracking-tight">織 Fabric: {handloomFocus}</span>
                    </div>

                    <div className="text-right flex flex-col gap-0.5">
                      <span className="text-[7.5px] font-primary text-slate-500 font-bold uppercase">PROJECTED RANK</span>
                      <span className="text-[10px] font-black text-indigo-400 font-primary uppercase tracking-wide">TOP 10</span>
                      <span className="text-[6.5px] text-slate-500 font-primary font-bold tracking-widest uppercase">RN-CROWN-3275</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-800">
                    <span className="bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 text-[6.5px] font-primary font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Verified Championship Contender
                    </span>
                    <span className="bg-indigo-500/10 border border-indigo-500/35 text-indigo-400 text-[6.5px] font-primary font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Stage Eligible
                    </span>
                  </div>
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-bold text-xs bg-pink-500 hover:bg-pink-600 text-white font-primary uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-pink-500/10 transition-colors"
                >
                  Register Athlete Slot <ArrowRight size={14} />
                </button>
                <span className="text-[7px] text-slate-500 font-primary font-bold text-center block uppercase tracking-widest">
                  Prize allocations protected by Recharge Nation Escrow
                </span>

              </form>

            </div>

            {/* 3. Arena Logistics */}
            <div className="bg-white border border-slate-200 rounded-[20px] p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4">
              <h3 className="font-extrabold text-slate-800 text-xs font-primary uppercase tracking-tight border-b border-slate-100 pb-2.5">
                ARENA LOGISTICS
              </h3>

              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <span className="text-lg">🏆</span>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-primary tracking-widest text-slate-400 font-bold uppercase leading-none">National Grand Finals</span>
                    <span className="text-xs font-bold text-slate-800 mt-1 font-secondary">{competition.eventDate}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-lg">🕒</span>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-primary tracking-widest text-slate-400 font-bold uppercase leading-none">Finals Audition Timings</span>
                    <span className="text-xs font-bold text-slate-800 mt-1 font-secondary">06:00 PM - 11:00 PM</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-lg">📍</span>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-primary tracking-widest text-slate-400 font-bold uppercase leading-none">Audition Venue & City</span>
                    <span className="text-xs font-bold text-slate-800 mt-1 font-secondary">{competition.venue}, {competition.city}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Championship Custodians */}
            <div className="bg-[#0f172a] border border-gray-800 rounded-[20px] p-6 text-left shadow-[0_12px_30px_rgba(0,0,0,0.15)] flex flex-col gap-3">
              <span className="text-amber-500 font-primary text-[8px] font-extrabold tracking-widest uppercase">CHAMPIONSHIP CUSTODIANS</span>
              <div>
                <span className="text-[9.5px] font-primary text-slate-400 font-bold uppercase">ORGANIZER</span>
                <h4 className="font-extrabold text-white text-xs font-primary mt-0.5">{competition.organizer.name}</h4>
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed font-secondary">
                {competition.organizer.contact}
              </p>
              <div className="border-t border-gray-850 pt-3 flex flex-col gap-1.5 text-[9px] font-primary font-bold text-slate-400 uppercase tracking-wider">
                <span>✉ {competition.organizer.email}</span>
                <span>📞 {competition.organizer.phone}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {showBoardingModal && (
        <CompetitorBoardingModal
          competition={competition}
          onClose={() => setShowBoardingModal(false)}
          initialName={contenderName}
          initialTrack={coutureDivision}
        />
      )}
    </div>
  );
}
