"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Trophy, Calendar, MapPin, ShieldAlert, ShieldCheck, ArrowRight,
  User, Users, ClipboardList, Clock, Mail, Phone, AlertCircle,
  ArrowLeft
} from "lucide-react";
import CompetitorBoardingModal from "@/components/CompetitorBoardingModal";
import TraditionalPageantRegistrationForm from "@/components/TraditionalPageantRegistrationForm";
import RichTextContent from "@/components/RichTextContent";
import { ApiClient, CompetitionRecord } from "@/lib/api-client";

// The full marketing-copy sections below (About, Platform Benefits, Format,
// Prize titles, and the sponsorship tier table) are bespoke content written
// for this specific pageant — they don't come from any competition data
// field, so they're only shown for this exact competition. Any other
// competition still gets the fully data-driven sections (description, rules,
// jury, FAQs, regional hubs, countdown, registration, organizer) without
// this one's copy leaking onto it.
const BESPOKE_CONTENT_SLUG = "miss-mr-traditional-india-2026";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CompetitionDetailPage({ params }: PageProps) {
  const { slug } = use(params);

  // Fetched competition record
  const [competition, setCompetition] = useState<CompetitionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const fetchCompetition = async () => {
      const data = await ApiClient.getCompetitionBySlug(slug);
      setCompetition(data ?? null);
      setIsLoading(false);
    };
    fetchCompetition();
  }, [slug]);

  // Contender Card Customizer States
  const [contenderName, setContenderName] = useState("");
  const [coutureDivision, setCoutureDivision] = useState("");
  const [handloomFocus, setHandloomFocus] = useState("Varanasi Brocade Silk");

  // Regional Audition Tour Tab State
  const [activeHub, setActiveHub] = useState<"south" | "north" | "eastwest">("south");

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Competitor Boarding Modal State
  const [showBoardingModal, setShowBoardingModal] = useState(false);

  // Track active sub-nav section on scroll (mirrors the event details page).
  const [activeNavSection, setActiveNavSection] = useState<string>("about");
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["about", "benefits", "format", "prizes", "audition-tour", "rules", "jury", "faq", "sponsors"];
      const scrollPos = window.scrollY + 200;
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveNavSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Countdown timer state — computed live from the competition's real
  // registration deadline, not a fixed/fake starting point.
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!competition?.deadline) return;
    const target = new Date(competition.deadline).getTime();

    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [competition?.deadline]);

  // Default the customizer's division to the competition's first real category once it loads.
  useEffect(() => {
    if (competition && competition.categories.length > 0 && !coutureDivision) {
      setCoutureDivision(competition.categories[0].name);
    }
  }, [competition, coutureDivision]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setShowBoardingModal(true);
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen py-20 text-center text-[var(--text-muted)] text-sm font-secondary">
        Loading Competition Details...
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="w-full min-h-screen py-20 text-center flex flex-col items-center gap-4 font-secondary">
        <AlertCircle size={36} className="text-amber-500/70" />
        <h3 className="text-xl font-bold text-[var(--text-primary)] font-primary">Competition Not Found</h3>
        <p className="text-[var(--text-secondary)] text-sm">The competition you are looking for does not exist or has been removed.</p>
        <Link href="/competitions" className="bg-[var(--bg-panel)] hover:bg-amber-500 hover:text-[#170D08] text-[var(--text-primary)] font-primary font-bold text-xs uppercase px-6 py-3 rounded-full transition-colors">
          Back to Directory
        </Link>
      </div>
    );
  }

  const isBespokeContent = competition.slug === BESPOKE_CONTENT_SLUG;
  const registrationsOpen = !competition.deadline || new Date(competition.deadline).getTime() > Date.now();

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
    <div className="min-h-screen font-secondary">

      {/* 1. CINEMATIC HERO BANNER (matches the event details page pattern) */}
      <section className="relative  px-4 pt-12 pb-12 overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col gap-8">
          {competition.bannerUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-15 scale-110 pointer-events-none"
              style={{ backgroundImage: `url(${competition.bannerUrl})` }}
            />
          )}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full filter blur-[120px] pointer-events-none" />

          <div className="relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <Link href="/competitions" className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] font-primary font-bold uppercase tracking-widest transition-colors group">
                <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Back to Directory
              </Link>
            </div>

            {/* Hero Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

              {/* Left Content Column */}
              <div className="lg:col-span-7 flex flex-col gap-6 text-left">

                {/* Status & Category Pills */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-primary font-extrabold tracking-widest uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <Trophy size={11} className="text-amber-400" /> National Crown Championship
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-primary font-bold tracking-widest uppercase border ${registrationsOpen ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-rose-500/15 text-rose-300 border-rose-500/30"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${registrationsOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
                    {registrationsOpen ? "Registrations Open" : "Registrations Closed"}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-primary uppercase tracking-tight leading-[1.05] text-[var(--text-primary)]">
                  {competition.name}
                </h1>

                {/* Excerpt */}
                <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed font-secondary max-w-2xl">
                  {competition.summary}
                </p>

                {/* Key Specs Capsule Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
                  <div className="bg-white/[0.03] border border-[var(--border-color)] rounded-2xl p-3.5 flex flex-col gap-1 backdrop-blur-sm">
                    <span className="flex items-center gap-1.5 text-[8.5px] font-primary font-bold tracking-wider text-amber-400/80 uppercase">
                      <Calendar size={12} className="text-amber-400 shrink-0" /> Grand Finale
                    </span>
                    <span className="text-xs sm:text-sm font-black font-primary text-[var(--text-primary)] uppercase truncate">
                      {competition.eventDate}
                    </span>
                  </div>

                  <div className="bg-white/[0.03] border border-[var(--border-color)] rounded-2xl p-3.5 flex flex-col gap-1 backdrop-blur-sm">
                    <span className="flex items-center gap-1.5 text-[8.5px] font-primary font-bold tracking-wider text-amber-400/80 uppercase">
                      <MapPin size={12} className="text-amber-400 shrink-0" /> City Hub
                    </span>
                    <span className="text-xs sm:text-sm font-black font-primary text-[var(--text-primary)] uppercase truncate">
                      {competition.city}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-secondary truncate">
                      {competition.venue}
                    </span>
                  </div>

                  <div className="bg-white/[0.03] border border-[var(--border-color)] rounded-2xl p-3.5 flex flex-col gap-1 backdrop-blur-sm">
                    <span className="flex items-center gap-1.5 text-[8.5px] font-primary font-bold tracking-wider text-amber-400/80 uppercase">
                      <Trophy size={12} className="text-amber-400 shrink-0" /> Prize Pool
                    </span>
                    <span className="text-[11px] sm:text-xs font-black font-primary text-amber-400 uppercase leading-snug">
                      {competition.prizePool}
                    </span>
                  </div>

                  <div className="bg-white/[0.03] border border-[var(--border-color)] rounded-2xl p-3.5 flex flex-col gap-1 backdrop-blur-sm">
                    <span className="flex items-center gap-1.5 text-[8.5px] font-primary font-bold tracking-wider text-amber-400/80 uppercase">
                      <ClipboardList size={12} className="text-amber-400 shrink-0" /> Entry Fee
                    </span>
                    <span className="text-xs sm:text-sm font-black font-primary text-[var(--text-primary)] uppercase">
                      {competition.registrationFee === 0 ? "Free" : `From ₹${competition.registrationFee.toLocaleString()}`}
                    </span>
                  </div>
                </div>

                {/* Hero Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <a
                    href="#register"
                    className="group relative overflow-hidden inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-[#170D08] px-7 py-4 rounded-2xl font-primary font-black text-xs sm:text-sm uppercase tracking-wider hover:brightness-110 shadow-[0_10px_30px_rgba(201,162,39,0.35)] transition-all cursor-pointer"
                  >
                    <Trophy size={17} />
                    <span>Register Now</span>
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                  </a>

                  <a
                    href="#sponsors"
                    className="inline-flex items-center gap-1.5 text-xs font-primary font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-amber-400 px-3 py-2 transition-colors"
                  >
                    <ShieldAlert size={14} /> Partner &amp; Sponsor
                  </a>
                </div>

              </div>

              {/* Right Media Showcase Column (matches the event details hero pattern) */}
              {competition.bannerUrl && (
                <div className="lg:col-span-5 flex justify-center">
                  <div className="w-full max-w-lg relative">
                    <div className="absolute -top-2.5 -left-2.5 w-6 h-6 border-t-2 border-l-2 border-amber-400/80 rounded-tl-lg z-20 pointer-events-none" />
                    <div className="absolute -top-2.5 -right-2.5 w-6 h-6 border-t-2 border-r-2 border-amber-400/80 rounded-tr-lg z-20 pointer-events-none" />
                    <div className="absolute -bottom-2.5 -left-2.5 w-6 h-6 border-b-2 border-l-2 border-amber-400/80 rounded-bl-lg z-20 pointer-events-none" />
                    <div className="absolute -bottom-2.5 -right-2.5 w-6 h-6 border-b-2 border-r-2 border-amber-400/80 rounded-br-lg z-20 pointer-events-none" />

                    <div className="relative rounded-[28px] overflow-hidden border border-[var(--border-color)] bg-gradient-to-b from-[#25140b] to-[#120703] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">

                      {/* Main Media Viewport */}
                      <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden bg-black/60 border border-white/10">
                        <img src={competition.bannerUrl} alt={competition.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                        {/* Top Right Badge */}
                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md border border-white/20 text-white text-[8px] font-primary font-black px-2.5 py-1 rounded-full uppercase tracking-wider pointer-events-none">
                          Official Pageant Event
                        </div>

                        {/* Overlay Info at Bottom */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-white pointer-events-none z-10">
                          <div className="flex flex-col">
                            <span className="text-[7.5px] font-primary font-bold uppercase tracking-widest text-amber-300">
                              {competition.city}
                            </span>
                            <span className="text-xs font-black font-primary uppercase tracking-tight drop-shadow truncate max-w-[200px]">
                              National Grand Finale
                            </span>
                          </div>
                          <div className="bg-amber-500 text-[#170D08] px-2.5 py-1 rounded-lg text-[9px] font-black font-primary uppercase tracking-wider shrink-0 shadow-md">
                            Digital QR Entry
                          </div>
                        </div>
                      </div>

                      {/* Poster Substrip */}
                      <div className="p-3 flex items-center justify-between text-left border-t border-white/5 mt-1">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <ShieldCheck size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[8px] font-primary uppercase tracking-widest text-[var(--text-muted)] font-bold">
                              Curated By
                            </span>
                            <span className="text-xs font-black font-primary uppercase text-[var(--text-primary)]">
                              {competition.organizer.name}
                            </span>
                          </div>
                        </div>

                        <a
                          href="#register"
                          className="text-[9.5px] font-primary font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          Register Now <ArrowRight size={11} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* STICKY SUB-NAV STRIP (matches the event details page pattern)           */}
      {/* ========================================================================= */}
      <nav className="sticky top-16 z-30 bg-[#120B07]/85 backdrop-blur-xl border-b border-amber-500/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] pt-3 pb-3">
        <div className="container max-w-7xl mx-auto px-4 flex items-center justify-between gap-4 overflow-x-auto py-2.5 no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {[
              ...(isBespokeContent ? [{ id: "about", label: "About" }] : []),
              ...(isBespokeContent ? [{ id: "benefits", label: "Why Compete" }] : []),
              ...(isBespokeContent ? [{ id: "format", label: "Format" }] : []),
              ...(isBespokeContent ? [{ id: "prizes", label: "Prizes" }] : []),
              ...(competition.regionalHubs.length > 0 ? [{ id: "audition-tour", label: "Audition Tour" }] : []),
              ...(eligibilityRules.length > 0 || auditionRules.length > 0 ? [{ id: "rules", label: "Guidelines" }] : []),
              { id: "jury", label: "Jury" },
              ...(competition.faqs.length > 0 ? [{ id: "faq", label: "FAQs" }] : []),
              { id: "sponsors", label: "Sponsors" },
            ].map(item => {
              const isActive = activeNavSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 outline-none focus:outline-none ${isActive
                    ? "text-amber-400 bg-amber-500/15 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.12)]"
                    : "text-stone-400 hover:text-stone-200 hover:bg-white/[0.04] border border-transparent"
                    }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          <a
            href="#register"
            className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-[#170D08] px-4.5 py-1.5 rounded-full font-primary font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all transform hover:-translate-y-0.5 shrink-0 cursor-pointer outline-none focus:outline-none"
          >
            <Trophy size={13} className="shrink-0" />
            <span>Register</span>
          </a>
        </div>
      </nav>

      <div className="container mx-auto px-4 flex flex-col gap-8 !py-8 !md:py-10">
        {/* 2. Grid Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-8">

            {/* About the Event — bespoke copy, only for the pageant it was written for */}
            {isBespokeContent && (
              <div id="about" className="scroll-mt-32 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] p-6 md:p-8 text-left shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col gap-4">
                <span className="text-[9px] font-primary tracking-widest text-amber-400 font-bold uppercase flex items-center gap-1.5">
                  ✦ About The Event
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] font-primary leading-tight">
                  India&apos;s Traditions, One National Stage
                </h2>
                <p className="text-[var(--text-secondary)] text-xs sm:text-[13px] leading-relaxed font-secondary">
                  India is a country of diverse cultures, colours and traditional attire. <strong className="text-[var(--text-primary)]">Miss &amp; Mr. Traditional India 2026</strong> is a national-level platform that gives traditional boys &amp; girls models from every state a chance to showcase their culture, personality and talent.
                </p>
                <p className="text-[var(--text-secondary)] text-xs sm:text-[13px] leading-relaxed font-secondary">
                  This is not just a modelling competition — it&apos;s a celebration of Indian tradition, fashion, heritage and youth talent. Contestants walk the ramp in their state&apos;s traditional attire, showcase their talent, and compete for a national title.
                </p>
                <p className="text-[var(--text-secondary)] text-xs sm:text-[13px] leading-relaxed font-secondary">
                  Organized by <strong className="text-amber-400">BB Creative World&apos;s</strong>, the platform is built for aspiring models, fashion influencers, designers and cultural ambassadors seeking a career-defining opportunity.
                </p>

                <div className="grid grid-cols-3 gap-3 pt-4 mt-1 border-t border-[var(--border-color)]">
                  {[
                    { value: "20+", label: "States Represented" },
                    { value: "Limited", label: "Exclusive Entries" },
                    { value: "16–45", label: "Age Eligibility" },
                  ].map((s, i) => (
                    <div key={i} className="text-left">
                      <p className="text-lg sm:text-xl font-black font-primary text-amber-300">{s.value}</p>
                      <p className="text-[8px] sm:text-[9px] font-primary font-bold uppercase tracking-widest text-[var(--text-muted)] mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event & Registration Details (from the admin-authored description) — real data, works for any competition */}
            {competition.description && (
              <div id={isBespokeContent ? undefined : "about"} className="scroll-mt-32 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] p-6 md:p-8 text-left shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                <span className="text-[9px] font-primary tracking-widest text-amber-400 font-bold uppercase flex items-center gap-1.5 mb-4">
                  ✦ Event &amp; Registration Details
                </span>
                <RichTextContent
                  html={competition.description}
                  className="text-stone-300 text-xs sm:text-[13px] leading-relaxed font-secondary"
                />
              </div>
            )}

            {/* A Platform Built For Your Career — bespoke */}
            {isBespokeContent && (
              <div id="benefits" className="scroll-mt-32 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] p-6 md:p-8 text-left shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col gap-8">
                <div className="text-left max-w-xl flex flex-col gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-primary leading-tight">
                    A Platform Built For <span className="text-amber-300">Your Career</span>
                  </h2>
                  <p className="text-[var(--text-secondary)] text-xs font-secondary">
                    Six reasons contestants from across India are choosing this stage in 2026.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: "National Recognition", desc: "Perform on a national stage alongside contestants from 20+ states." },
                    { title: "Represent Your State", desc: "Present your state's traditional attire and culture in front of all of India." },
                    { title: "Professional Ramp Experience", desc: "Walk in front of celebrity judges and professional fashion mentors." },
                    { title: "Media & Social Exposure", desc: "Digital coverage, reels, interviews and dedicated social promotion." },
                    { title: "Career Opportunities", desc: "Fashion shows, ad shoots, brand campaigns and influencer collaborations." },
                    { title: "Titles & Awards", desc: "Compete for the national crown plus category awards in costume, ramp walk and culture." },
                  ].map((b, idx) => (
                    <div key={idx} className="border border-[var(--border-color)] rounded-xl p-4">
                      <h4 className="font-extrabold text-[var(--text-primary)] text-sm font-primary">{b.title}</h4>
                      <p className="text-[var(--text-secondary)] text-[11.5px] leading-relaxed font-secondary mt-1.5">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Three Rounds To The Crown — bespoke */}
            {isBespokeContent && (
              <div id="format" className="scroll-mt-32 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] p-6 md:p-8 text-left shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col gap-2">
                <span className="text-[9px] font-primary tracking-widest text-amber-400 font-bold uppercase flex items-center gap-1.5">
                  ✦ Competition Format
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-primary leading-tight mt-1">
                  Three Rounds To <span className="text-amber-300">The Crown</span>
                </h2>
                <p className="text-[var(--text-secondary)] text-xs font-secondary mt-1 max-w-lg">
                  Every contestant is judged across three structured rounds, scored by a national jury panel.
                </p>

                <div className="flex flex-col mt-4">
                  {[
                    { title: "Traditional Introduction", desc: "Contestants introduce themselves and their state in full traditional attire, judged on authenticity, presentation and confidence.", tags: ["Costume Authenticity", "Stage Presence", "Cultural Knowledge"] },
                    { title: "Ramp Walk", desc: "A professionally choreographed ramp walk in traditional wear, judged on poise, styling and camera presence.", tags: ["Poise & Grace", "Styling", "Camera Presence"] },
                    { title: "Talent + Q&A", desc: "A talent showcase — dance, music, craft or art — followed by a live Q&A with the jury panel.", tags: ["Talent Skill", "Communication", "Personality"] },
                  ].map((round, idx) => (
                    <div key={idx} className={`flex flex-col sm:flex-row gap-4 sm:gap-8 py-6 ${idx > 0 ? "border-t border-[var(--border-color)]" : ""}`}>
                      <span className="font-primary italic font-black text-3xl sm:text-4xl text-transparent shrink-0 sm:w-16" style={{ WebkitTextStroke: "1.3px #D97706" }}>
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div className="flex flex-col gap-2">
                        <h3 className="text-base sm:text-lg font-black font-primary text-[var(--text-primary)]">{round.title}</h3>
                        <p className="text-[var(--text-secondary)] text-xs leading-relaxed font-secondary max-w-lg">{round.desc}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {round.tags.map((tag, tIdx) => (
                            <span key={tIdx} className="text-[9px] font-primary font-bold tracking-widest uppercase text-emerald-400 border border-emerald-500/40 rounded-md px-2.5 py-1">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10.5px] text-[var(--text-muted)] font-secondary leading-relaxed pt-4 mt-2 border-t border-[var(--border-color)]">
                  Full judging criteria, scoring pattern and detailed rulebook are shared with confirmed contestants after registration.
                </p>
              </div>
            )}

            {/* What You're Competing For — bespoke */}
            {isBespokeContent && (
              <div id="prizes" className="scroll-mt-32 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] p-6 md:p-8 text-left shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col gap-8">
                <div className="text-left max-w-xl flex flex-col gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-primary leading-tight">
                    What You&apos;re <span className="text-amber-300">Competing For</span>
                  </h2>
                  <p className="text-[var(--text-secondary)] text-xs font-secondary">
                    Grand cash prizes, coveted crowns and career-defining trophies for our 2026 winners.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { title: "Miss Traditional India 2026", desc: "The national title for the winning female contestant." },
                    { title: "Mr Traditional India 2026", desc: "The national title for the winning male contestant." },
                  ].map((t, idx) => (
                    <div key={idx} className="border border-amber-500/30 rounded-2xl p-6 text-center flex flex-col items-center gap-2">
                      <Trophy size={28} className="text-amber-400" />
                      <h3 className="text-lg font-black font-primary text-amber-300">{t.title}</h3>
                      <p className="text-[var(--text-secondary)] text-xs font-secondary">{t.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {["Best Costume", "Best Smile", "Best Ramp Walk", "Cultural Ambassador Award"].map((award, idx) => (
                    <div key={idx} className="border border-[var(--border-color)] rounded-xl p-4 text-center">
                      <p className="text-[11px] font-bold font-primary text-[var(--text-primary)] leading-snug">{award}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regional Audition Tour — real data, works for any competition */}
            {competition.regionalHubs.length > 0 && (
              <div id="audition-tour" className="scroll-mt-32 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border-color)] pb-4 gap-4">
                  <div>
                    <span className="text-[9px] font-primary tracking-widest text-[var(--text-muted)] font-bold uppercase">AUDITION TRACKS</span>
                    <h2 className="text-lg font-black text-[var(--text-primary)] font-primary uppercase tracking-tight mt-0.5">
                      REGIONAL AUDITION TOUR
                    </h2>
                  </div>

                  {/* Tabs */}
                  <div className="flex bg-black/20 p-1 rounded-xl text-[10px] font-primary font-bold uppercase tracking-wider text-[var(--text-secondary)] self-start border border-[var(--border-color)]">
                    <button
                      onClick={() => setActiveHub("north")}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeHub === "north" ? "bg-amber-500 text-[#170D08]" : "hover:text-[var(--text-primary)]"}`}
                    >
                      North Hub
                    </button>
                    <button
                      onClick={() => setActiveHub("south")}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeHub === "south" ? "bg-amber-500 text-[#170D08]" : "hover:text-[var(--text-primary)]"}`}
                    >
                      South Hub
                    </button>
                    <button
                      onClick={() => setActiveHub("eastwest")}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeHub === "eastwest" ? "bg-amber-500 text-[#170D08]" : "hover:text-[var(--text-primary)]"}`}
                    >
                      East/West Hub
                    </button>
                  </div>
                </div>

                {/* Grid of locations */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {hubGroups[activeHub].map((spot, idx) => (
                    <div key={idx} className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col gap-2.5">
                      <span className="text-[8px] text-amber-400 font-primary font-bold uppercase tracking-widest">AUDITION GATEWAY</span>
                      <div>
                        <h4 className="font-extrabold text-[var(--text-primary)] text-xs font-primary">{spot.city}</h4>
                        <p className="text-[var(--text-secondary)] text-[10.5px] font-secondary mt-0.5">{spot.venue}</p>
                      </div>
                      <span className="text-[10px] font-semibold text-[var(--text-muted)] font-primary block mt-1">{spot.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Eligibility & Guidelines — real data */}
            {eligibilityRules.length > 0 && (
              <div id="rules" className="scroll-mt-32 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col gap-4">
                <h2 className="text-xs font-primary tracking-widest text-amber-400 font-bold uppercase flex items-center gap-2">
                  <ClipboardList size={14} /> ELIGIBILITY & GUIDELINES
                </h2>
                <ol className="flex flex-col gap-2.5 text-xs text-[var(--text-secondary)] font-secondary mt-1">
                  {eligibilityRules.map((rule, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="font-primary text-amber-400 font-bold">{idx + 1}.</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Crown Audition Rules — real data */}
            {auditionRules.length > 0 && (
              <div id={eligibilityRules.length > 0 ? undefined : "rules"} className="scroll-mt-32 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col gap-4">
                <h2 className="text-xs font-primary tracking-widest text-amber-400 font-bold uppercase flex items-center gap-2">
                  <ShieldAlert size={14} /> CROWN AUDITION RULES
                </h2>
                <ul className="flex flex-col gap-2.5 text-xs text-[var(--text-secondary)] font-secondary mt-1">
                  {auditionRules.map((rule, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Elite Audition Curation Jury — real data */}
            {competition.judges.length > 0 && (
              <div id="jury" className="scroll-mt-32 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col gap-6">
                <h2 className="text-xs font-primary tracking-widest text-amber-400 font-bold uppercase flex items-center gap-2">
                  <Users size={14} /> ELITE AUDITION CURATION JURY
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {competition.judges.map((j, idx) => (
                    <div key={idx} className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-5 flex flex-col items-center text-center gap-3">
                      <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-400">
                        <User size={20} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-[var(--text-primary)] text-[11px] font-primary tracking-tight leading-tight uppercase">{j.name}</h4>
                        <span className="text-[8px] text-amber-400 font-primary font-bold tracking-wider uppercase mt-1 block">{j.role}</span>
                      </div>
                      <p className="text-[var(--text-secondary)] text-[9.5px] leading-relaxed font-secondary">{j.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Panel To Be Announced — generic placeholder, works for any competition */}
            {competition.judges.length === 0 && (
              <div id="jury" className="scroll-mt-32 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] p-6 md:p-8 text-left shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col gap-6">
                <div className="text-left max-w-xl flex flex-col gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-primary leading-tight">
                    Panel To Be <span className="text-amber-300">Announced</span>
                  </h2>
                  <p className="text-[var(--text-secondary)] text-xs font-secondary">
                    Fashion mentors, celebrity guests and chief guests are confirmed progressively through the season.
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {["Jury Member", "Fashion Mentor", "Celebrity Guest", "Chief Guest"].map((role, idx) => (
                    <div key={idx} className="border border-[var(--border-color)] rounded-xl p-5 flex flex-col items-center text-center gap-3">
                      <div className="w-12 h-12 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-400/70">
                        <User size={20} />
                      </div>
                      <h4 className="font-extrabold text-[var(--text-primary)] text-xs font-primary">{role}</h4>
                      <span className="text-[9px] font-primary font-bold uppercase tracking-widest text-[var(--text-muted)]">To Be Announced</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ Accordion — real data */}
            {competition.faqs.length > 0 && (
              <div id="faq" className="scroll-mt-32 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col gap-6">
                <div>
                  <span className="text-[9px] font-primary tracking-widest text-[var(--text-muted)] font-bold uppercase">CONTESTANT SUPPORT HELPDESK</span>
                  <h2 className="text-lg font-black text-[var(--text-primary)] font-primary uppercase tracking-tight mt-0.5">
                    CHAMPIONSHIP ENTRY FAQS
                  </h2>
                </div>

                <div className="flex flex-col gap-3">
                  {competition.faqs.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div key={idx} className="border border-[var(--border-color)] rounded-xl overflow-hidden">
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full text-left py-3 px-4 bg-[var(--bg-panel)] flex items-center justify-between text-xs font-bold text-[var(--text-primary)] cursor-pointer hover:bg-white/5 transition-colors"
                        >
                          <span className="uppercase tracking-tight leading-snug">{faq.q}</span>
                          <span className="text-amber-400 font-primary text-base font-extrabold">{isOpen ? "-" : "+"}</span>
                        </button>
                        {isOpen && (
                          <div className="p-4 bg-[var(--bg-card)] border-t border-[var(--border-color)] text-[11px] leading-relaxed text-[var(--text-secondary)] font-secondary">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Partner With The Movement */}
            <div id="sponsors" className="scroll-mt-32 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] p-6 md:p-8 text-left shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col gap-6">
              <div>
                <span className="text-[9px] font-primary tracking-widest text-amber-400 font-bold uppercase flex items-center gap-1.5">
                  ✦ Sponsors &amp; Partners
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-primary leading-tight mt-1">
                  Partner With <span className="text-amber-300">The Movement</span>
                </h2>
                <p className="text-[var(--text-secondary)] text-xs font-secondary mt-2 max-w-lg">
                  Align your brand with {competition.name} and reach a national, highly engaged audience.
                </p>
              </div>

              {isBespokeContent ? (
                <div className="flex flex-col">
                  {[
                    { label: "Title Sponsor", slots: ["₹12 Lakh"] },
                    { label: "Powered By", slots: ["₹7 Lakh"] },
                    { label: "Co-Powered", slots: ["₹4 Lakh", "₹4 Lakh"] },
                    { label: "Associate Partner", slots: ["₹2 Lakh", "₹2 Lakh", "₹2 Lakh"] },
                    { label: "Fashion Partner", slots: ["Actual"] },
                    { label: "Beauty Partner", slots: ["Actual"] },
                    { label: "Media Partner", slots: ["₹1 Lakh"] },
                  ].map((tier, idx) => (
                    <div key={idx} className={`flex flex-col sm:flex-row sm:items-center gap-3 py-4 ${idx > 0 ? "border-t border-[var(--border-color)]" : ""}`}>
                      <span className="text-[10px] font-primary font-bold uppercase tracking-widest text-[var(--text-muted)] sm:w-40 shrink-0">
                        {tier.label}
                      </span>
                      <div className="flex flex-wrap gap-2.5">
                        {tier.slots.map((amount, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[11px] font-primary font-bold text-amber-300 border border-amber-500/30 rounded-lg px-4 py-2"
                          >
                            {amount} · Open
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--text-secondary)] text-xs sm:text-[13px] leading-relaxed font-secondary">
                  Sponsorship packages for this competition haven&apos;t been published yet — reach out to the organizing team below and they&apos;ll share the current tiers and availability.
                </p>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={`mailto:${competition.organizer.email}?subject=Sponsorship Inquiry — ${competition.name}`}
                  className="bg-amber-500 hover:bg-amber-400 text-[#170D08] font-primary font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full transition-colors cursor-pointer"
                >
                  Become a Sponsor
                </a>
                <a
                  href={`mailto:${competition.organizer.email}?subject=Sponsorship Kit Request — ${competition.name}`}
                  className="border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 font-primary font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full transition-colors underline cursor-pointer"
                >
                  Request Sponsorship Kit
                </a>
              </div>
            </div>

          </div>

          {/* Right Column (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">

            {/* 1. Countdown Widget */}
            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-[20px] p-6 text-left shadow-[0_12px_30px_rgba(0,0,0,0.3)] flex flex-col gap-4 relative overflow-hidden">
              <span className="text-amber-400 font-primary text-[8px] font-extrabold tracking-widest uppercase">AUDITION PORTAL STATUS</span>
              <h3 className="font-extrabold text-[var(--text-primary)] text-[11.5px] font-primary uppercase tracking-tight -mt-1.5">
                NATIONAL REGISTRATION GATEWAY
              </h3>

              {competition?.deadline && new Date(competition.deadline).getTime() > Date.now() ? (
                <>
                  {/* Countdown Ticker */}
                  <div className="grid grid-cols-4 gap-2 text-center mt-1">
                    {[
                      { value: timeLeft.days, label: "DAYS" },
                      { value: timeLeft.hours, label: "HOURS" },
                      { value: timeLeft.minutes, label: "MINS" },
                      { value: timeLeft.seconds, label: "SECS" }
                    ].map((c, i) => (
                      <div key={i} className="bg-black/20 border border-[var(--border-color)] rounded-xl p-3 flex flex-col items-center">
                        <span className="text-xl sm:text-2xl font-black text-amber-400 italic font-primary tracking-tight">{c.value.toString().padStart(2, '0')}</span>
                        <span className="text-[7.5px] text-[var(--text-muted)] font-primary font-bold tracking-widest mt-1 block">{c.label}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-[var(--text-muted)] font-secondary leading-relaxed text-center mt-1">
                    Formal registration approvals take 48-72 hours post digital submission verification.
                  </p>
                </>
              ) : (
                <p className="text-xs text-[var(--text-muted)] font-secondary leading-relaxed text-center mt-1">
                  Registrations for this round are now closed.
                </p>
              )}
            </div>

            {/* 2. Contender Customizer Card */}
            <div id="register" className="scroll-mt-24 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-[20px] p-6 text-left shadow-[0_12px_30px_rgba(0,0,0,0.3)] flex flex-col gap-4 relative overflow-hidden">
              {isBespokeContent ? (
                <TraditionalPageantRegistrationForm competition={competition} />
              ) : (
                <>
              <div>
                <span className="text-amber-400 font-primary text-[8px] font-extrabold tracking-widest uppercase">CONTESTANT PROFILE CURATION</span>
                <h3 className="font-extrabold text-[var(--text-primary)] text-xs font-primary uppercase tracking-tight mt-0.5">
                  LIVE CONTENDER CARD CUSTOMIZER
                </h3>
                <p className="text-[var(--text-muted)] text-[10px] font-secondary mt-0.5">
                  Customize your contender prior to auditing.
                </p>
              </div>

              <form onSubmit={handleRegister} className="flex flex-col gap-4">

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[8px] font-primary tracking-wider text-[var(--text-muted)] font-bold uppercase">CONTESTANT NAME</label>
                  <input
                    type="text"
                    value={contenderName}
                    onChange={(e) => setContenderName(e.target.value.toUpperCase())}
                    className="w-full text-xs font-primary font-bold text-[var(--text-primary)] bg-black/20 border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 uppercase"
                    placeholder="ENTER FULL NAME"
                    required
                  />
                </div>

                {/* Division (real competition categories) */}
                {competition.categories.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] font-primary tracking-wider text-[var(--text-muted)] font-bold uppercase">DIVISION</label>
                    <select
                      value={coutureDivision}
                      onChange={(e) => setCoutureDivision(e.target.value)}
                      className="w-full text-xs text-[var(--text-primary)] bg-black/20 border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500/40"
                    >
                      {competition.categories.map((cat) => (
                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Handloom Focus — bespoke to this pageant only */}
                {isBespokeContent && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] font-primary tracking-wider text-[var(--text-muted)] font-bold uppercase">REGIONAL HANDLOOM FOCUS</label>
                    <select
                      value={handloomFocus}
                      onChange={(e) => setHandloomFocus(e.target.value)}
                      className="w-full text-xs text-[var(--text-primary)] bg-black/20 border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500/40"
                    >
                      <option value="Varanasi Brocade Silk">Varanasi Brocade Silk</option>
                      <option value="Kanjeevaram Handloom">Kanjeevaram Handloom</option>
                      <option value="Pochampally Ikat Weave">Pochampally Ikat Weave</option>
                      <option value="Benarasi Tanchoi Zari">Benarasi Tanchoi Zari</option>
                      <option value="Chanderi Cotton-Silk">Chanderi Cotton-Silk</option>
                    </select>
                  </div>
                )}

                {/* Dynamic Preview Card */}
                <div className="border border-[var(--border-color)] bg-black/20 rounded-2xl p-4.5 flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full filter blur-xl"></div>

                  <div className="flex justify-between items-start">
                    <div className="text-left">
                      <span className="text-[7.5px] font-primary text-[var(--text-muted)] font-bold uppercase block">ATHLETE MONIKER</span>
                      <span className="text-xs font-black text-[var(--text-primary)] font-primary uppercase tracking-wide block mt-0.5">{contenderName || "TBD CONTENDER"}</span>
                    </div>
                    <Trophy size={14} className="text-amber-400" />
                  </div>

                  <div className="flex justify-between items-end pt-3.5 border-t border-[var(--border-color)]">
                    <div className="text-left flex flex-col gap-0.5">
                      <span className="text-[7.5px] font-primary text-[var(--text-muted)] font-bold uppercase">DIVISION{isBespokeContent ? " / TEXTILE FOCUS" : ""}</span>
                      <span className="text-[9.5px] font-bold text-[var(--text-secondary)] font-primary uppercase tracking-tight">{coutureDivision || "General"}</span>
                      {isBespokeContent && (
                        <span className="text-[8.5px] text-amber-400 font-primary font-medium uppercase tracking-tight">Fabric: {handloomFocus}</span>
                      )}
                    </div>

                    <div className="text-right flex flex-col gap-0.5">
                      <span className="text-[7.5px] font-primary text-[var(--text-muted)] font-bold uppercase">PROJECTED RANK</span>
                      <span className="text-[10px] font-black text-amber-400 font-primary uppercase tracking-wide">TOP 10</span>
                      <span className="text-[6.5px] text-[var(--text-muted)] font-primary font-bold tracking-widest uppercase">RN-CROWN-3275</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--border-color)]">
                    <span className="bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 text-[6.5px] font-primary font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Verified Championship Contender
                    </span>
                    <span className="bg-amber-500/10 border border-amber-500/35 text-amber-400 text-[6.5px] font-primary font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Stage Eligible
                    </span>
                  </div>
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-[#170D08] font-primary uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 transition-colors"
                >
                  Register Athlete Slot <ArrowRight size={14} />
                </button>
                <span className="text-[7px] text-[var(--text-muted)] font-primary font-bold text-center block uppercase tracking-widest">
                  Prize allocations protected by Recharge Nation Escrow
                </span>

              </form>
                </>
              )}

            </div>

            {/* 3. Arena Logistics */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col gap-4">
              <h3 className="font-extrabold text-[var(--text-primary)] text-xs font-primary uppercase tracking-tight border-b border-[var(--border-color)] pb-2.5">
                ARENA LOGISTICS
              </h3>

              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <Trophy size={16} className="text-amber-400 shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-primary tracking-widest text-[var(--text-muted)] font-bold uppercase leading-none">National Grand Finals</span>
                    <span className="text-xs font-bold text-[var(--text-primary)] mt-1 font-secondary">{competition.eventDate}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Clock size={16} className="text-amber-400 shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-primary tracking-widest text-[var(--text-muted)] font-bold uppercase leading-none">Finals Audition Timings</span>
                    <span className="text-xs font-bold text-[var(--text-primary)] mt-1 font-secondary">06:00 PM - 11:00 PM</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <MapPin size={16} className="text-amber-400 shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-primary tracking-widest text-[var(--text-muted)] font-bold uppercase leading-none">Audition Venue & City</span>
                    <span className="text-xs font-bold text-[var(--text-primary)] mt-1 font-secondary">{competition.venue}, {competition.city}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Championship Custodians */}
            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-[20px] p-6 text-left shadow-[0_12px_30px_rgba(0,0,0,0.3)] flex flex-col gap-3">
              <span className="text-amber-400 font-primary text-[8px] font-extrabold tracking-widest uppercase">CHAMPIONSHIP CUSTODIANS</span>
              <div>
                <span className="text-[9.5px] font-primary text-[var(--text-muted)] font-bold uppercase">ORGANIZER</span>
                <h4 className="font-extrabold text-[var(--text-primary)] text-xs font-primary mt-0.5">{competition.organizer.name}</h4>
              </div>
              <p className="text-[var(--text-secondary)] text-[10px] leading-relaxed font-secondary">
                {competition.organizer.contact}
              </p>
              <div className="border-t border-[var(--border-color)] pt-3 flex flex-col gap-1.5 text-[9px] font-primary font-bold text-[var(--text-muted)] uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><Mail size={11} className="text-amber-400" /> {competition.organizer.email}</span>
                <span className="flex items-center gap-1.5"><Phone size={11} className="text-amber-400" /> {competition.organizer.phone}</span>
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
