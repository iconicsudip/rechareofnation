"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy, Calendar, MapPin, Award, ShieldAlert, ArrowRight,
  User, Check, Sparkles, ChevronRight, HelpCircle, AlertCircle
} from "lucide-react";
import CompetitorBoardingModal from "@/components/CompetitorBoardingModal";

export default function CompetitionsPage() {
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

  const regionalHubs = {
    north: [
      { city: "NEW DELHI AUDITIONS", venue: "Kamani Auditorium", date: "Sept 12 - 13, 2026" },
      { city: "CHANDIGARH AUDITIONS", venue: "Tagore Theatre", date: "Sept 19, 2026" },
      { city: "LUCKNOW AUDITIONS", venue: "Sangeet Natak Akademi", date: "Sept 26, 2026" }
    ],
    south: [
      { city: "BENGALURU AUDITIONS", venue: "Grand Pavilion, Palace Grounds", date: "Oct 04 - 05, 2026" },
      { city: "CHENNAI AUDITIONS", venue: "Music Academy Hall", date: "Oct 10, 2026" },
      { city: "HYDERABAD AUDITIONS", venue: "Ravindra Bharathi Hall", date: "Oct 17, 2026" }
    ],
    eastwest: [
      { city: "KOLKATA AUDITIONS", venue: "Rabindra Sadan", date: "Oct 24 - 25, 2026" },
      { city: "MUMBAI AUDITIONS", venue: "Sophia Bhabha Auditorium", date: "Nov 01 - 02, 2026" },
      { city: "GUWAHATI AUDITIONS", venue: "Pragjyotish Cultural Complex", date: "Nov 08, 2026" }
    ]
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 py-12 font-secondary">
      <div className="container max-w-7xl mx-auto px-4 flex flex-col gap-8">
        
        {/* Back Link */}
        <div className="text-left">
          <Link href="/events" className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 hover:text-pink-500 transition-colors uppercase tracking-wider">
            &lt; Back to Directory
          </Link>
        </div>

        {/* 1. Pageant Hero Banner */}
        <div className="bg-[#0f172a] rounded-[24px] border border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-8 md:p-12 relative overflow-hidden text-left flex flex-col gap-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-bl-full filter blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-wrap gap-2.5 relative z-10">
            <span className="bg-amber-500 text-slate-950 font-mono text-[8px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider">
              ✦ National Crown Championship ✦
            </span>
            <span className="bg-pink-600 text-white font-mono text-[8px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider">
              Handloom Couture Focus
            </span>
          </div>

          <div className="max-w-3xl relative z-10">
            <h1 className="text-3xl sm:text-5xl font-black text-white font-primary uppercase tracking-tight leading-tight">
              MISS & MR TRADITIONAL <span className="text-amber-400">INDIA 2026</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-4 font-secondary leading-relaxed max-w-2xl">
              The ultimate country-wide hunt for young icons who elegantly synthesize traditional ethnic grace, 
              linguistic eloquence, regional sartorial heritage, and cultural intellect. Organized across 28 regional 
              auditions, the grand national runway finals are the peak showcase of Indian handloom revival and 
              individual talent. More than just a pageant, this is a celebration of cultural ambassadorship.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-y-3 gap-x-6 pt-4 border-t border-gray-800 relative z-10 text-[10.5px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5"><MapPin size={13} className="text-pink-500" /> Grand Pavilion, Palace Grounds, Bengaluru</span>
            <span className="flex items-center gap-1.5"><Calendar size={13} className="text-indigo-400" /> 2026-11-28</span>
            <span className="flex items-center gap-1.5 text-amber-400"><Trophy size={13} /> Prize Pool: ₹25,00,000 + Modelling Contracts</span>
          </div>
        </div>

        {/* 2. Grid Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Preservation Mission */}
            <div className="bg-white border border-slate-200 rounded-[20px] p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4">
              <h2 className="text-xs font-mono tracking-widest text-amber-500 font-bold uppercase flex items-center gap-2">
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
                <span className="text-[9px] font-mono tracking-widest text-slate-400 font-bold uppercase">LIVE JURY EVALUATION SIMULATOR</span>
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
                  <span className="text-[8px] text-slate-400 font-mono font-bold tracking-widest uppercase">PROJECTED JURY SCORE</span>
                  <span className="text-5xl font-black text-indigo-600 font-primary tracking-tight">{pageantScore}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Weighted Average out of 100</span>
                  <span className="bg-indigo-50 border border-indigo-200 text-indigo-600 text-[8px] font-mono font-bold px-2 py-0.5 rounded mt-1.5">
                    {getRankBadge(pageantScore)}
                  </span>
                </div>

              </div>

              {/* Ethics Code Banner */}
              <div className="bg-[#0f172a] rounded-xl p-4 text-left border border-gray-800 flex flex-col gap-1.5 mt-2">
                <span className="text-amber-400 font-mono text-[8px] font-extrabold uppercase tracking-widest flex items-center gap-1">
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
                  <span className="text-[9px] font-mono tracking-widest text-slate-400 font-bold uppercase">AUDITION TRACKS</span>
                  <h2 className="text-lg font-black text-slate-900 font-primary uppercase tracking-tight mt-0.5">
                    REGIONAL AUDITION TOUR
                  </h2>
                </div>
                
                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 self-start border border-slate-200">
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
                {regionalHubs[activeHub].map((spot, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex flex-col gap-2.5">
                    <span className="text-[8px] text-amber-500 font-mono font-bold uppercase tracking-widest">AUDITION GATEWAY</span>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs font-primary">{spot.city}</h4>
                      <p className="text-slate-500 text-[10.5px] font-secondary mt-0.5">{spot.venue}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 font-mono block mt-1">{spot.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Eligibility & Guidelines */}
            <div className="bg-white border border-slate-200 rounded-[20px] p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4">
              <h2 className="text-xs font-mono tracking-widest text-slate-400 font-bold uppercase flex items-center gap-2">
                📋 ELIGIBILITY & GUIDELINES
              </h2>
              <ol className="flex flex-col gap-2.5 text-xs text-slate-600 font-secondary mt-1">
                <li className="flex gap-2">
                  <span className="font-mono text-indigo-500 font-bold">1.</span>
                  <span>Age bracket: 18 - 28 years (as of Jan 1, 2026).</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-indigo-500 font-bold">2.</span>
                  <span>Citizens of India or OCI Cardholders.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-indigo-500 font-bold">3.</span>
                  <span>Must prepare one regional handloom-based apparel for the runway round.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-indigo-500 font-bold">4.</span>
                  <span>Submission of 3 high-res portfolio headshots + 1-minute performance introduction video.</span>
                </li>
              </ol>
            </div>

            {/* Crown Audition Rules */}
            <div className="bg-white border border-slate-200 rounded-[20px] p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4">
              <h2 className="text-xs font-mono tracking-widest text-slate-400 font-bold uppercase flex items-center gap-2">
                🛡️ CROWN AUDITION RULES
              </h2>
              <ul className="flex flex-col gap-2.5 text-xs text-slate-600 font-secondary mt-1">
                <li className="flex gap-2 items-start">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  <span>Sartorial authenticity carries 40% weight in round 1 scoring.</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  <span>Intellect & Cultural Q&A carries 40% weight in finals scoring.</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  <span>Decision of the grand jury panels (consisting of top national fashion designers and cinema veterans) is final.</span>
                </li>
              </ul>
            </div>

            {/* Elite Audition Curation Jury */}
            <div className="bg-white border border-slate-200 rounded-[20px] p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-6">
              <h2 className="text-xs font-mono tracking-widest text-slate-400 font-bold uppercase flex items-center gap-2">
                👥 ELITE AUDITION CURATION JURY
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: "DR. VASUNDHARA SEN", role: "TEXTILE HISTORIAN", desc: "Curation Curator of National Handloom Museum." },
                  { name: "RAGHVENDRA RATHORE", role: "ROYAL COUTURIER", desc: "Pioneered traditional Indian heritage runway apparel." },
                  { name: "PROF. ALOK CHATURVEDI", role: "LINGUISTIC SCHOLAR", desc: "Head of Classical Languages at Delhi University." }
                ].map((j, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 bg-slate-250 rounded-full flex items-center justify-center text-slate-400">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-[11px] font-primary tracking-tight leading-tight uppercase">{j.name}</h4>
                      <span className="text-[8px] text-amber-500 font-mono font-bold tracking-wider uppercase mt-1 block">{j.role}</span>
                    </div>
                    <p className="text-slate-500 text-[9.5px] leading-relaxed font-secondary">{j.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Accordion */}
            <div className="bg-white border border-slate-200 rounded-[20px] p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-6">
              <div>
                <span className="text-[9px] font-mono tracking-widest text-slate-400 font-bold uppercase">CONTESTANT SUPPORT HELPDESK</span>
                <h2 className="text-lg font-black text-slate-900 font-primary uppercase tracking-tight mt-0.5">
                  CHAMPIONSHIP ENTRY FAQS
                </h2>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { q: "WHAT DOCUMENTS MUST I UPLOAD DURING THE FORMAL APPLICATION STAGE?", a: "Contenders must upload high-resolution headshots, a scanned photocopy of age proof (18-28 bracket), and a 1-minute regional language introduction clip." },
                  { q: "DO I HAVE TO WEAVE THE TRADITIONAL OUTFIT MYSELF?", a: "No, weaving is not required by contestants. However, the outfit must be sourced from authentic handloom clusters, and you must verify the weavers cooperative detail during review." },
                  { q: "ARE TRAVEL AND ACCOMMODATION EXPENSES COMPENSATED?", a: "For regional auditions, travel is self-funded. For candidates selected to represent their state in the Grand Finals in Bengaluru, all lodging and boarding will be covered by the committee." }
                ].map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                      <button 
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full text-left py-3 px-4 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer hover:bg-slate-100/50 transition-colors"
                      >
                        <span className="uppercase tracking-tight leading-snug">{faq.q}</span>
                        <span className="text-indigo-600 font-mono text-base font-extrabold">{isOpen ? "-" : "+"}</span>
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
              <span className="text-pink-500 font-mono text-[8px] font-extrabold tracking-widest uppercase">AUDITION PORTAL STATUS</span>
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
                    <span className="text-[7.5px] text-slate-400 font-mono font-bold tracking-widest mt-1 block">{c.label}</span>
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
                <span className="text-amber-500 font-mono text-[8px] font-extrabold tracking-widest uppercase">CONTESTANT PROFILE CURATION</span>
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
                  <label className="text-[8px] font-mono tracking-wider text-slate-400 font-bold uppercase">CONTESTANT NAME</label>
                  <input 
                    type="text" 
                    value={contenderName}
                    onChange={(e) => setContenderName(e.target.value.toUpperCase())}
                    className="w-full text-xs font-mono font-bold text-white bg-slate-950 border border-gray-800 rounded-xl px-3.5 py-2.5 outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700 uppercase"
                    placeholder="ENTER FULL NAME"
                    required
                  />
                </div>

                {/* Couture Division */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[8px] font-mono tracking-wider text-slate-400 font-bold uppercase">COUTURE DIVISION</label>
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
                  <label className="text-[8px] font-mono tracking-wider text-slate-400 font-bold uppercase">REGIONAL HANDLOOM FOCUS</label>
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
                      <span className="text-[7.5px] font-mono text-slate-500 font-bold uppercase block">ATHLETE MONIKER</span>
                      <span className="text-xs font-black text-white font-mono uppercase tracking-wide block mt-0.5">{contenderName || "TBD CONTENDER"}</span>
                    </div>
                    <Trophy size={14} className="text-amber-500" />
                  </div>

                  <div className="flex justify-between items-end pt-3.5 border-t border-gray-800">
                    <div className="text-left flex flex-col gap-0.5">
                      <span className="text-[7.5px] font-mono text-slate-500 font-bold uppercase">DIVISION / TEXTILE FOCUS</span>
                      <span className="text-[9.5px] font-bold text-slate-200 font-mono uppercase tracking-tight">{coutureDivision}</span>
                      <span className="text-[8.5px] text-amber-500 font-mono font-medium uppercase tracking-tight">織 Fabric: {handloomFocus}</span>
                    </div>

                    <div className="text-right flex flex-col gap-0.5">
                      <span className="text-[7.5px] font-mono text-slate-500 font-bold uppercase">PROJECTED RANK</span>
                      <span className="text-[10px] font-black text-indigo-400 font-mono uppercase tracking-wide">TOP 10</span>
                      <span className="text-[6.5px] text-slate-500 font-mono font-bold tracking-widest uppercase">RN-CROWN-3275</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-800">
                    <span className="bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 text-[6.5px] font-mono font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Verified Championship Contender
                    </span>
                    <span className="bg-indigo-500/10 border border-indigo-500/35 text-indigo-400 text-[6.5px] font-mono font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
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
                <span className="text-[7px] text-slate-500 font-mono font-bold text-center block uppercase tracking-widest">
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
                    <span className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase leading-none">National Grand Finals</span>
                    <span className="text-xs font-bold text-slate-800 mt-1 font-secondary">2026-11-28</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-lg">🕒</span>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase leading-none">Finals Audition Timings</span>
                    <span className="text-xs font-bold text-slate-800 mt-1 font-secondary">06:00 PM - 11:00 PM</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-lg">📍</span>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase leading-none">Audition Venue & City</span>
                    <span className="text-xs font-bold text-slate-800 mt-1 font-secondary">Grand Pavilion, Palace Grounds, Bengaluru</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Championship Custodians */}
            <div className="bg-[#0f172a] border border-gray-800 rounded-[20px] p-6 text-left shadow-[0_12px_30px_rgba(0,0,0,0.15)] flex flex-col gap-3">
              <span className="text-amber-500 font-mono text-[8px] font-extrabold tracking-widest uppercase">CHAMPIONSHIP CUSTODIANS</span>
              <div>
                <span className="text-[9.5px] font-mono text-slate-400 font-bold uppercase">ORGANIZER</span>
                <h4 className="font-extrabold text-white text-xs font-primary mt-0.5">India Weaves & Heritage Council</h4>
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed font-secondary">
                A philanthropic trust promoting the survival of traditional weaving clusters through modern luxury exposure and pageantry.
              </p>
              <div className="border-t border-gray-850 pt-3 flex flex-col gap-1.5 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                <span>✉ pageant@indiaweaves.org</span>
                <span>📞 +91 80 3456 7890</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {showBoardingModal && (
        <CompetitorBoardingModal
          onClose={() => setShowBoardingModal(false)}
          initialName={contenderName}
          initialTrack={coutureDivision}
        />
      )}
    </div>
  );
}
