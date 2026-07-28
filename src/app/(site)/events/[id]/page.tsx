"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Calendar, MapPin, Phone, Mail, User, Shield, Share2, 
  ArrowLeft, Check, Ticket, Trophy, Upload, ShieldCheck, 
  AlertCircle, DollarSign, ExternalLink, Printer, X,
  Info, Volume2, VolumeX, Clock, ArrowRight, ChevronDown, ChevronUp, Music, Sliders, Star, HelpCircle
} from "lucide-react";
import { ApiClient, Event, TicketType, TicketPriceInfo, TicketBooking, CompetitionRegistration } from "@/lib/api-client";
import RichTextContent from "@/components/RichTextContent";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id: eventId } = use(params);

  const [event, setEvent] = useState<Event | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal and share states
  const [activeWizard, setActiveWizard] = useState<"booking" | "registration" | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Interactive page states
  const [selectedZone, setSelectedZone] = useState<number>(0);
  const [passholderName, setPassholderName] = useState("");
  const [badgeGlow, setBadgeGlow] = useState<"purple" | "pink" | "orange" | "green">("purple");
  const [scheduleTab, setScheduleTab] = useState<number>(0);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  // Curator bot states
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "curator"; text: string }>>([
    { sender: "curator", text: "Hello! Ask me anything about this event's entry rules, F&B passes, transport arrangements, or check the FAQs below." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Unified Fetch
  useEffect(() => {
    const fetchEventData = async () => {
      const allEvents = await ApiClient.getEvents();
      const found = allEvents.find(e => e.slug === eventId || e.id === eventId);
      
      if (found) {
        setEvent(found);
      }
      setCurrentUser(ApiClient.getCurrentUser());
      setIsLoading(false);
    };
    fetchEventData();
  }, [eventId]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Synthesize Web Audio API sound sweeps for live acoustic preview
  const playMockAcoustic = (trackName: string) => {
    if (typeof window === "undefined") return;
    if (playingTrack === trackName) {
      setPlayingTrack(null);
      return;
    }
    setPlayingTrack(trackName);

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Pitch arrays mapping to track themes
      const notes = trackName.toLowerCase().includes("jugalbandi")
        ? [293.66, 329.63, 440.0, 523.25] // Acoustic Sitar sequence (D4, E4, A4, C5)
        : trackName.toLowerCase().includes("bass")
        ? [82.41, 110.0, 73.42, 55.0]     // EDM Heavy Bass drops (E2, A2, D2, G1)
        : [329.63, 392.0, 440.0, 587.33]; // Runway Theme (E4, G4, A4, D5)

      let time = ctx.currentTime;
      notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);
        
        osc.start(time);
        osc.stop(time + 0.5);
        time += 0.15;
      });

      setTimeout(() => {
        setPlayingTrack(null);
      }, 800);
    } catch (err) {
      console.log("AudioContext blocked:", err);
    }
  };

  const handleCuratorAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatHistory(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      const fallback = "I don't have an answer for that — please check the FAQs below or contact the organizer.";
      let reply = fallback;

      if (event && event.faqs.length > 0) {
        const q = userMsg.toLowerCase();
        const queryWords = q.split(/\s+/).map(w => w.trim()).filter(w => w.length > 2);

        const matched = event.faqs.find(faq => {
          const faqText = `${faq.q} ${faq.a}`.toLowerCase();
          if (faqText.includes(q)) return true;
          return queryWords.some(word => faqText.includes(word));
        });

        if (matched) {
          reply = matched.a;
        }
      }

      setChatHistory(prev => [...prev, { sender: "curator", text: reply }]);
      setIsTyping(false);
    }, 850);
  };

  if (isLoading) {
    return (
      <div className="container py-20 text-center text-slate-400 text-sm font-secondary">
        Loading Event Specifications...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-20 text-center flex flex-col items-center gap-4">
        <span className="text-4xl">⚠️</span>
        <h3 className="text-xl font-bold text-slate-800">Event Not Found</h3>
        <p className="text-slate-500 text-sm">The event you are looking for does not exist or has been removed.</p>
        <Link href="/events" className="bg-[#0c1222] text-white text-xs px-6 py-2 rounded-full uppercase font-primary font-bold tracking-wider hover:bg-pink-500 transition-all">
          Back to Events Listing
        </Link>
      </div>
    );
  }

  const eventTag = event.isFeatured ? "SELLING OUT FAST" : undefined;
  const eventRating = event.rating;
  const eventReviews = event.reviewCount;

  // Real ticket tier currently highlighted in the seating zone selector / badge preview.
  // Falls back gracefully when ticketPrices is empty.
  const selectedTicketInfo = event.ticketPrices[selectedZone] || event.ticketPrices[0] || null;

  // Deterministic, non-fabricated pass reference derived from the real event id + ticket type
  const getPassRef = (id: string, ticketType: string) => {
    const idPart = (id.replace(/[^A-Za-z0-9]/g, "").slice(-4) || "GEN").toUpperCase();
    const typePart = (ticketType.replace(/[^A-Za-z]/g, "").slice(0, 3) || "TIX").toUpperCase();
    return `RN-${typePart}-${idPart}`;
  };

  // Holographic Glow themes helper
  const getGlowStyles = (color: string) => {
    switch (color) {
      case "pink":
        return "bg-gradient-to-tr from-pink-600 via-rose-500 to-orange-400 text-white shadow-[0_0_25px_rgba(244,63,94,0.3)]";
      case "orange":
        return "bg-gradient-to-tr from-amber-500 via-orange-600 to-red-500 text-white shadow-[0_0_25px_rgba(245,158,11,0.3)]";
      case "green":
        return "bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.3)]";
      default:
        return "bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white shadow-[0_0_25px_rgba(139,92,246,0.35)]";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 pb-20 font-secondary text-slate-800">
      
      {/* Dynamic Wizard Overlays */}
      {activeWizard === "booking" && (
        <TicketBookingWizard 
          event={event} 
          user={currentUser} 
          onClose={() => setActiveWizard(null)} 
        />
      )}
      
      {activeWizard === "registration" && (
        <CompetitionRegistrationWizard 
          event={event} 
          user={currentUser} 
          onClose={() => setActiveWizard(null)} 
        />
      )}

      {/* Main Container */}
      <div className="container max-w-7xl mx-auto px-4 flex flex-col gap-8">
        
        {/* Back Link */}
        <div className="flex justify-start">
          <Link href="/events" className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-900 font-primary font-bold uppercase tracking-widest transition-colors">
            <ArrowLeft size={8.5} /> Back to Directory
          </Link>
        </div>

        {/* Dynamic Dark Hero Banner */}
        <section className="relative rounded-[32px] overflow-hidden p-8 lg:p-12 bg-gradient-to-r from-slate-950 via-[#0a0f1e] to-slate-900 shadow-lg min-h-[340px] flex flex-col justify-end text-left border border-slate-950">
          {/* Subtle starry overlay backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col gap-4 max-w-3xl">
            {/* Tag Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="bg-indigo-600/90 text-white text-[8px] font-bold tracking-widest uppercase rounded px-2.5 py-1 inline-block border border-indigo-400/20 font-primary">
                ★ {event.category ? event.category.toUpperCase() : "FEATURED EVENT"} ★
              </span>
              {eventTag && (
                <span className="bg-rose-500/90 text-white text-[8px] font-bold tracking-widest uppercase rounded px-2.5 py-1 inline-block border border-rose-400/20 font-primary">
                  {eventTag}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-white font-primary uppercase tracking-tight leading-none mt-1">
              {event.name}
            </h1>

            {/* Description */}
            <p className="text-slate-300 text-xs sm:text-sm font-secondary leading-relaxed max-w-2xl mt-1">
              {event.summary || event.description.replace(/<[^>]+>/g, ' ').trim()}
            </p>

            {/* Info Badges Row */}
            <div className="flex flex-wrap gap-y-2 gap-x-6 mt-4 pt-4 border-t border-slate-800/80 text-[10px] sm:text-xs font-primary font-bold text-slate-400 tracking-wider">
              <span className="flex items-center gap-1.5 uppercase">
                <MapPin size={13} className="text-pink-500 shrink-0" />
                {event.venue}, {event.city}
              </span>
              <span className="flex items-center gap-1.5 uppercase">
                <Calendar size={13} className="text-pink-500 shrink-0" />
                {event.date}
              </span>
              <span className="flex items-center gap-1.5 uppercase text-amber-400">
                <Star size={13} className="fill-amber-400 text-amber-400 shrink-0" />
                {eventRating} RATING ({eventReviews} REVIEWS)
              </span>
            </div>
          </div>
        </section>

        {/* 2-Column Grid Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column Panels */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Card 1: THE EXPERIENCE */}
            <div className="bg-white border border-slate-200/90 rounded-[28px] p-6 md:p-8 shadow-sm flex flex-col gap-4 text-left">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <Info size={16} className="text-indigo-600" />
                <h3 className="text-sm font-bold font-primary text-slate-900 uppercase tracking-wider">
                  The {event.name.replace("RECHARGE ", "").replace(" 2026", "")} Experience
                </h3>
              </div>
              <RichTextContent
                html={event.description}
                className="text-slate-500 text-xs sm:text-sm leading-relaxed font-secondary"
              />
            </div>

            {/* Card 2: ACOUSTICS PREVIEW */}
            <div className="bg-white border border-slate-200/90 rounded-[28px] p-6 md:p-8 shadow-sm flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                <span className="text-[8px] font-primary tracking-widest text-indigo-600 font-bold uppercase">
                  Interactive Soundscape Preview
                </span>
                <div className="flex items-center gap-2.5">
                  <Volume2 size={16} className="text-indigo-600 animate-pulse" />
                  <h3 className="text-sm font-bold font-primary text-slate-900 uppercase tracking-wider">
                    Simulate Stage Acoustics
                  </h3>
                </div>
              </div>
              
              <p className="text-slate-500 text-xs leading-relaxed font-secondary">
                Click any live track preview button below to test stage equalizers, 3D spatial mixing, and audio sync configurations.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {(event.headliners.length > 0
                  ? event.headliners.slice(0, 3).map((h, i) => ({
                      title: `${h.name} — Live Preview`,
                      desc: h.role || "Live Performance",
                      duration: ["2:15m Preview", "1:50m Preview", "3:05m Preview"][i] || "Preview"
                    }))
                  : [
                      { title: "Live Performance Preview", desc: "Main Stage", duration: "2:15m Preview" },
                      { title: "Featured Set", desc: "Live Mix", duration: "1:50m Preview" },
                      { title: "Opening Act Preview", desc: "Live Performance", duration: "3:05m Preview" }
                    ]
                ).map((track) => {
                  const isCurrent = playingTrack === track.title;
                  return (
                    <button
                      key={track.title}
                      onClick={() => playMockAcoustic(track.title)}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                        isCurrent 
                          ? "border-pink-500 bg-pink-500/5 shadow-sm" 
                          : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/50"
                      }`}
                    >
                      <div className="flex flex-col gap-1 z-10">
                        <span className="text-[8px] font-primary tracking-wider text-slate-400 font-bold uppercase group-hover:text-pink-500 transition-colors">
                          Soundboard Preview
                        </span>
                        <h4 className="text-[11px] font-black text-slate-800 uppercase font-primary mt-1 line-clamp-1">
                          {track.title}
                        </h4>
                        <p className="text-slate-400 text-[9px] font-secondary mt-0.5 line-clamp-1">
                          {track.desc}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-200/60 z-10 w-full">
                        <span className="text-[8px] font-primary text-slate-400">{track.duration}</span>
                        {isCurrent ? (
                          <div className="flex gap-0.5 items-end h-3">
                            <span className="w-0.5 bg-pink-500 animate-[bounce_0.8s_infinite_100ms]" style={{ height: '100%' }}></span>
                            <span className="w-0.5 bg-pink-500 animate-[bounce_0.8s_infinite_300ms]" style={{ height: '60%' }}></span>
                            <span className="w-0.5 bg-pink-500 animate-[bounce_0.8s_infinite_200ms]" style={{ height: '80%' }}></span>
                          </div>
                        ) : (
                          <Music size={10} className="text-slate-400 group-hover:text-pink-500 transition-colors" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card 3: PROGRAM SCHEDULE (only if the event has schedule days configured) */}
            {event.scheduleDays.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-[28px] p-6 md:p-8 shadow-sm flex flex-col gap-5 text-left">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-primary tracking-widest text-indigo-600 font-bold uppercase">
                      Festival Timetable
                    </span>
                    <div className="flex items-center gap-2.5">
                      <Clock size={16} className="text-indigo-600" />
                      <h3 className="text-sm font-bold font-primary text-slate-900 uppercase tracking-wider">
                        Festival Program Schedule
                      </h3>
                    </div>
                  </div>

                  {/* Day Tab Pills */}
                  <div className="flex bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
                    {event.scheduleDays.map((day, idx) => (
                      <button
                        key={idx}
                        onClick={() => setScheduleTab(idx)}
                        className={`px-4 py-1.5 rounded-lg text-[9px] font-primary font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          scheduleTab === idx
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {day.dayLabel}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Day Schedule Timeline */}
                {event.scheduleDays[scheduleTab] && (
                  <div className="flex flex-col gap-6 pl-1 mt-2">
                    {event.scheduleDays[scheduleTab].items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 sm:gap-6 items-start relative group">
                        <span className="w-16 sm:w-20 shrink-0 text-[10px] font-primary font-bold tracking-widest text-indigo-600 bg-indigo-50 px-2 py-1 rounded text-center border border-indigo-100">
                          {item.time}
                        </span>
                        <div className="flex flex-col text-left">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase font-primary">
                            {item.title}
                          </h4>
                          <p className="text-slate-400 text-[10.5px] sm:text-xs leading-relaxed font-secondary mt-1">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Card 4: SEATING ZONES SELECTOR (only if the event has ticket tiers configured) */}
            {event.ticketPrices.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-[28px] p-6 md:p-8 shadow-sm flex flex-col gap-5 text-left">
                <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                  <span className="text-[8px] font-primary tracking-widest text-indigo-600 font-bold uppercase">
                    Interactive Stadium Arena Map
                  </span>
                  <div className="flex items-center gap-2.5">
                    <Sliders size={16} className="text-indigo-600" />
                    <h3 className="text-sm font-bold font-primary text-slate-900 uppercase tracking-wider">
                      Select Seating Zone & Perks
                    </h3>
                  </div>
                </div>

                <p className="text-slate-500 text-xs leading-relaxed font-secondary">
                  Click any stadium zone card below to preview pricing, availability, and what&apos;s included.
                </p>

                {/* Seating zones grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {event.ticketPrices.map((ticket, idx) => {
                    const isSelected = selectedZone === idx;
                    const isSoldOut = ticket.available <= 0;
                    return (
                      <button
                        key={`${ticket.type}-${idx}`}
                        onClick={() => setSelectedZone(idx)}
                        className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 relative group cursor-pointer ${
                          isSelected
                            ? "border-indigo-600 bg-slate-950 text-white shadow-md scale-[1.01]"
                            : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/60 text-slate-800"
                        }`}
                      >
                        {/* Checkmark indicator */}
                        {isSelected && (
                          <span className="absolute top-4 right-4 bg-indigo-600 text-white w-4 h-4 rounded-full flex items-center justify-center">
                            <Check size={9} strokeWidth={3} />
                          </span>
                        )}

                        <div className="flex flex-col text-left gap-1">
                          <span className={`text-[8.5px] font-primary tracking-wider uppercase font-bold ${isSelected ? "text-indigo-400" : "text-slate-400"}`}>
                            Stadium Tier
                          </span>
                          <h4 className="text-xs sm:text-sm font-black uppercase font-primary mt-1">
                            {ticket.type}
                          </h4>
                        </div>

                        <div className="flex items-end justify-between mt-6 pt-3 border-t border-slate-200/50 w-full">
                          <span className={`text-base font-black font-primary ${isSelected ? "text-white" : "text-slate-900"}`}>
                            ₹{ticket.price.toLocaleString()}
                          </span>
                          <span className={`text-[8px] font-primary tracking-wider font-bold ${
                            isSoldOut
                              ? "text-rose-500"
                              : isSelected ? "text-indigo-400" : "text-emerald-600"
                          }`}>
                            ● {isSoldOut ? "SOLD OUT" : `${ticket.available.toLocaleString()} PASSES AVAILABLE`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic description for the selected tier */}
                {selectedTicketInfo && (() => {
                  const perkItems = selectedTicketInfo.description
                    ? selectedTicketInfo.description.split(/[,;]/).map(s => s.trim()).filter(Boolean)
                    : [];
                  return (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mt-2 text-left">
                      <span className="text-[8px] font-primary font-bold tracking-widest text-slate-400 uppercase block mb-3">
                        Included with {selectedTicketInfo.type}:
                      </span>
                      {perkItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                          {perkItems.map((perk, i) => (
                            <div key={i} className="flex items-center gap-2 text-[10.5px] sm:text-xs text-slate-600">
                              <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-150 flex items-center justify-center shrink-0">
                                <Check size={9} strokeWidth={3.5} />
                              </span>
                              <span className="font-secondary font-bold text-slate-700">{perk}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10.5px] sm:text-xs text-slate-500 font-secondary">
                          No additional details provided for this tier.
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Card 5: HEADLINERS CIRCLES (only if the event has any configured) */}
            {event.headliners.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-[28px] p-6 md:p-8 shadow-sm flex flex-col gap-6 text-left">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <User size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-bold font-primary text-slate-900 uppercase tracking-wider">
                    National & Global Headliners
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-1">
                  {event.headliners.map((artist, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center gap-2 group">
                      <div className="w-20 h-20 rounded-full overflow-hidden shadow border border-slate-200 relative">
                        <img
                          src={artist.img}
                          alt={artist.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex flex-col gap-0.5 mt-1">
                        <h4 className="text-[11px] font-black text-slate-900 uppercase font-primary tracking-tight">
                          {artist.name}
                        </h4>
                        <span className="text-[8px] font-primary tracking-wider font-bold text-indigo-600 uppercase">
                          {artist.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card 6: FREQUENTLY ASKED QUESTIONS & CURATOR CHAT */}
            <div className="bg-white border border-slate-200/90 rounded-[28px] p-6 md:p-8 shadow-sm flex flex-col gap-6 text-left">
              {event.faqs.length > 0 && (
                <>
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                    <HelpCircle size={16} className="text-indigo-600" />
                    <h3 className="text-sm font-bold font-primary text-slate-900 uppercase tracking-wider">
                      Frequently Asked Questions
                    </h3>
                  </div>

                  {/* Accordion FAQ items */}
                  <div className="flex flex-col gap-3 mt-1">
                    {event.faqs.map((faq, i) => {
                      const isOpen = faqOpen === i;
                      return (
                        <div key={i} className="border border-slate-200/80 rounded-xl overflow-hidden bg-slate-50 transition-colors">
                          <button
                            onClick={() => setFaqOpen(isOpen ? null : i)}
                            className="w-full px-4 py-3.5 flex items-center justify-between text-left text-xs font-bold font-primary uppercase text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <span>{faq.q}</span>
                            {isOpen ? <ChevronUp size={14} className="text-indigo-600" /> : <ChevronDown size={14} className="text-slate-400" />}
                          </button>

                          {isOpen && (
                            <div className="px-4 pb-4 pt-1 text-[11px] sm:text-xs leading-relaxed text-slate-500 font-secondary border-t border-slate-200/50 mt-1">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Interactive Curator Chatbot box */}
              <div className="border border-slate-200 rounded-2xl p-4 md:p-5 mt-3 bg-slate-50/50 flex flex-col gap-4 text-left">
                <span className="text-[8px] font-primary tracking-widest text-slate-400 font-bold uppercase block">
                  Helpdesk Hub
                </span>
                
                {/* Chat screen */}
                <div className="flex flex-col gap-3 max-h-48 overflow-y-auto bg-white border border-slate-200/60 p-3 rounded-xl">
                  {chatHistory.map((chat, idx) => (
                    <div key={idx} className={`flex flex-col max-w-[85%] text-xs rounded-xl p-3 leading-relaxed font-secondary ${
                      chat.sender === "user" 
                        ? "bg-indigo-600 text-white self-end text-right" 
                        : "bg-slate-100 text-slate-700 self-start text-left border border-slate-200/40"
                    }`}>
                      <span className={`text-[7px] font-primary font-bold uppercase mb-1 block ${
                        chat.sender === "user" ? "text-indigo-200" : "text-slate-400"
                      }`}>
                        {chat.sender === "user" ? "You" : "Curator Curator"}
                      </span>
                      <span>{chat.text}</span>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="bg-slate-105 text-slate-500 self-start text-xs rounded-xl p-2 px-3 border border-slate-200/40 animate-pulse font-primary font-bold text-[8.5px]">
                      Curator is typing...
                    </div>
                  )}
                </div>

                {/* Input form */}
                <form onSubmit={handleCuratorAsk} className="flex gap-2 w-full mt-1">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about gate access, locker spaces, VIP catering..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="bg-slate-950 text-white text-[10px] font-primary font-bold tracking-widest px-5 py-2.5 rounded-xl uppercase hover:bg-indigo-600 transition-all cursor-pointer shadow-sm"
                  >
                    Ask
                  </button>
                </form>
              </div>

            </div>

          </div>

          {/* Right Column Panels (Sidebar) */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
            
            {/* Card 1: LIVE TICKET BADGE CUSTOMIZER */}
            <div className="bg-[#0a0f1d] text-white border border-slate-900 rounded-[32px] p-6 shadow-xl flex flex-col gap-5 text-left relative overflow-hidden">
              {/* Star details layout backdrop decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full filter blur-2xl"></div>
              
              <div className="flex flex-col gap-1 border-b border-slate-800/80 pb-3 relative z-10">
                <span className="text-[8px] font-primary tracking-widest text-indigo-400 font-bold uppercase">
                  Live Badge Customizer Studio
                </span>
                <h3 className="text-sm font-bold font-primary text-white uppercase tracking-wider">
                  Watch Your Ticket Form Live
                </h3>
                <span className="text-[9.5px] text-slate-400 mt-1 font-secondary">
                  Customize your name and color palette before booking.
                </span>
              </div>

              {/* Pass Holder name input */}
              <div className="flex flex-col gap-1.5 relative z-10 mt-1">
                <label className="text-[8px] font-primary font-bold tracking-widest text-slate-400 uppercase">
                  Pass-Holder Name
                </label>
                <input
                  type="text"
                  value={passholderName}
                  onChange={(e) => setPassholderName(e.target.value.toUpperCase())}
                  placeholder="Enter Holder Name"
                  maxLength={22}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-primary tracking-wide"
                />
              </div>

              {/* Holographic Glow selector dots */}
              <div className="flex flex-col gap-1.5 relative z-10">
                <label className="text-[8px] font-primary font-bold tracking-widest text-slate-400 uppercase">
                  Badge Holographic Glow
                </label>
                <div className="flex gap-2.5 mt-1">
                  {[
                    { color: "purple", class: "bg-indigo-600" },
                    { color: "pink", class: "bg-rose-500" },
                    { color: "orange", class: "bg-amber-500" },
                    { color: "green", class: "bg-emerald-500" }
                  ].map((item) => {
                    const isSelected = badgeGlow === item.color;
                    return (
                      <button
                        key={item.color}
                        onClick={() => setBadgeGlow(item.color as any)}
                        className={`w-6 h-6 rounded-full ${item.class} transition-all relative flex items-center justify-center cursor-pointer hover:scale-105 shadow-md`}
                      >
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-white animate-scale"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Ticket Badge Preview Card */}
              <div className={`rounded-2xl p-5 flex flex-col gap-6 text-left relative overflow-hidden transition-all duration-500 border border-white/5 ${getGlowStyles(badgeGlow)}`}>
                
                {/* Header credentials */}
                <div className="flex items-start justify-between w-full relative z-10 border-b border-white/10 pb-3">
                  <div className="flex flex-col text-left">
                    <h4 className="text-[13px] font-black font-primary tracking-tight leading-none">
                      {event.name}
                    </h4>
                    <span className="text-[7.5px] font-primary font-bold tracking-widest text-white/70 uppercase mt-1">
                      Gate Access Credentials
                    </span>
                  </div>
                  
                  {/* Dynamic mock QR icon */}
                  <div className="w-8 h-8 shrink-0 bg-white/10 border border-white/20 rounded p-1 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-0.5 w-full h-full opacity-90">
                      <div className="bg-white rounded-[1px]"></div>
                      <div className="bg-white rounded-[1px]"></div>
                      <div className="bg-white rounded-[1px]"></div>
                      <div className="border border-white border-dashed rounded-[1px]"></div>
                    </div>
                  </div>
                </div>

                {/* Middle details tier */}
                <div className="flex flex-col text-left relative z-10">
                  <span className="text-[6.5px] font-primary tracking-widest text-white/60 font-bold uppercase">
                    Stadium Tier
                  </span>
                  <h3 className="text-sm font-black font-primary uppercase tracking-wide mt-0.5 line-clamp-1">
                    {selectedTicketInfo ? selectedTicketInfo.type : "General Entry"}
                  </h3>
                </div>

                {/* Bottom passholder name */}
                <div className="flex flex-col text-left relative z-10">
                  <span className="text-[6.5px] font-primary tracking-widest text-white/60 font-bold uppercase">
                    Delegate Enrolled
                  </span>
                  <h3 className="text-base font-black font-primary tracking-wider mt-0.5 line-clamp-1">
                    {passholderName || "DELEGATE HOLDER"}
                  </h3>
                </div>

                {/* Card footer details metadata */}
                <div className="flex items-center justify-between border-t border-white/15 pt-3 mt-1 relative z-10 text-[8.5px] font-primary font-bold tracking-wider text-white/80">
                  <div className="flex flex-col text-left">
                    <span className="text-white/50 text-[6.5px] uppercase">City Hub</span>
                    <span className="uppercase">{event.city}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-white/50 text-[6.5px] uppercase">Pass Ref No</span>
                    <span className="uppercase">
                      {selectedTicketInfo ? getPassRef(event.id, selectedTicketInfo.type) : "—"}
                    </span>
                  </div>
                </div>

                {/* Subfooter status bar with blinking green dot */}
                <div className="flex items-center justify-between relative z-10 pt-2 text-[7.5px] font-primary font-bold tracking-widest text-white/60 uppercase">
                  <span>Holographic Festival Pass</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Live_Ticket_Gen</span>
                  </span>
                </div>

                {/* Holographic scanning diagonal lights layout backdrop */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-out skew-x-12"></div>
              </div>

              {/* Book ticket CTA */}
              <div className="flex flex-col gap-2 mt-2 relative z-10">
                <button
                  onClick={() => setActiveWizard("booking")}
                  className="bg-indigo-600 text-white text-[10.5px] font-primary font-bold tracking-widest py-3.5 w-full rounded-2xl uppercase hover:bg-indigo-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  Book This Custom Badge <ArrowRight size={12} />
                </button>
                <span className="text-[7.5px] font-primary font-bold tracking-widest text-slate-500 uppercase text-center mt-1">
                  100% SECURE GATE CHECKOUTS VIA UPI & NETBANKING
                </span>
              </div>
            </div>

            {/* Card 2: WEATHER & TRAVEL PLANNER */}
            <div className="bg-white border border-slate-200/90 rounded-[28px] p-6 shadow-sm flex flex-col gap-4 text-left">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <MapPin size={15} className="text-indigo-600" />
                <h4 className="text-xs font-bold font-primary text-slate-900 uppercase tracking-wider">
                  Weather & Travel Planner
                </h4>
              </div>

              {/* Weather info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200/60 p-4 rounded-xl text-left">
                <div className="flex flex-col gap-0.5 border-r border-slate-200/60 pr-2">
                  <span className="text-[7px] font-primary font-bold tracking-wider text-slate-400 uppercase">
                    Weather
                  </span>
                  <span className="text-[11px] font-black text-slate-900 uppercase font-primary mt-1 leading-snug">
                    Check Forecast
                  </span>
                  <span className="text-[9px] text-slate-500 font-secondary mt-0.5 line-clamp-2">
                    Check the local weather closer to the event date.
                  </span>
                </div>

                <div className="flex flex-col gap-0.5 pl-1">
                  <span className="text-[7px] font-primary font-bold tracking-wider text-slate-400 uppercase">
                    Air Quality
                  </span>
                  <span className="text-[11px] font-black text-slate-900 uppercase font-primary mt-1 leading-snug">
                    Check AQI
                  </span>
                  <span className="text-[9px] text-slate-500 font-secondary mt-0.5 font-bold line-clamp-2">
                    Check the local air quality index before you travel.
                  </span>
                </div>
              </div>

              {/* Secure checklist details instructions */}
              <div className="flex flex-col gap-2.5 text-[10.5px] leading-relaxed text-slate-500 font-secondary mt-1">
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-slate-700">1.</span>
                  <span>Security checkpoints typically open well ahead of the event start time. Please carry a valid photo ID, especially if you booked a discounted or student ticket.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-slate-700">2.</span>
                  <span>Cloakroom / luggage storage may be available at the venue for a nominal fee — please check with venue staff on arrival.</span>
                </div>
              </div>
            </div>

            {/* Card 3: EVENT CUSTODIANS */}
            <div className="bg-white border border-slate-200/90 rounded-[28px] p-6 shadow-sm flex flex-col gap-4 text-left">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck size={15} className="text-indigo-600" />
                <h4 className="text-xs font-bold font-primary text-slate-900 uppercase tracking-wider">
                  Event Custodians
                </h4>
              </div>

              <div className="flex flex-col gap-3 text-left">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[7.5px] font-primary font-bold text-slate-400 uppercase">Organizer</span>
                  <span className="text-[11.5px] font-black text-slate-800 uppercase font-primary leading-tight mt-0.5">
                    {event.organizer.name}
                  </span>
                  {event.organizer.contact && (
                    <p className="text-slate-500 text-[10.5px] leading-relaxed font-secondary mt-1">
                      {event.organizer.contact}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 pt-3 border-t border-slate-100 text-[10px] font-primary font-bold tracking-wider text-slate-500">
                  <span className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                    <Mail size={12} className="text-indigo-600 shrink-0" />
                    {event.organizer.email}
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                    <Phone size={12} className="text-indigo-600 shrink-0" />
                    {event.organizer.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: SPONSORSHIP TIERS (only if the event has any) */}
            {event.sponsorshipTiers.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-[28px] p-6 shadow-sm flex flex-col gap-4 text-left">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Trophy size={15} className="text-indigo-600" />
                  <h4 className="text-xs font-bold font-primary text-slate-900 uppercase tracking-wider">
                    Sponsorship Opportunities
                  </h4>
                </div>
                <div className="flex flex-col gap-3">
                  {event.sponsorshipTiers.map((tier, i) => (
                    <div key={i} className="pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-black text-slate-800 uppercase font-primary">{tier.tier}</span>
                        <span className="text-[11px] font-bold text-indigo-600">{tier.amount}</span>
                      </div>
                      {tier.benefits && (
                        <p className="text-slate-500 text-[10.5px] leading-relaxed font-secondary mt-1">{tier.benefits}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card 5: STALL / BOOTH BOOKING OPTIONS (only if the event has any) */}
            {event.stallOptions.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-[28px] p-6 shadow-sm flex flex-col gap-4 text-left">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <DollarSign size={15} className="text-indigo-600" />
                  <h4 className="text-xs font-bold font-primary text-slate-900 uppercase tracking-wider">
                    Stall &amp; Booth Booking
                  </h4>
                </div>
                <div className="flex flex-col gap-3">
                  {event.stallOptions.map((stall, i) => (
                    <div key={i} className="pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-black text-slate-800 uppercase font-primary">{stall.type}</span>
                        <span className="text-[11px] font-bold text-indigo-600">{stall.rate}</span>
                      </div>
                      <p className="text-slate-500 text-[10.5px] leading-relaxed font-secondary mt-1">
                        {stall.size}{stall.includes ? ` — ${stall.includes}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card 6: DIRECTORY / AD RATES (only if the event has any) */}
            {event.adRates.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-[28px] p-6 shadow-sm flex flex-col gap-4 text-left">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Info size={15} className="text-indigo-600" />
                  <h4 className="text-xs font-bold font-primary text-slate-900 uppercase tracking-wider">
                    Directory Ad Rates
                  </h4>
                </div>
                <div className="flex flex-col gap-2">
                  {event.adRates.map((rate, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 text-[10.5px]">
                      <span className="text-slate-600 font-secondary">{rate.category}</span>
                      <span className="font-bold text-slate-800 font-primary">{rate.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

// ----------------------------------------------------
// TICKET BOOKING WIZARD COMPONENT
// ----------------------------------------------------
interface WizardProps {
  event: Event;
  user: any;
  onClose: () => void;
}

function TicketBookingWizard({ event, user, onClose }: WizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Booking details form
  const [selectedTicket, setSelectedTicket] = useState<TicketPriceInfo | null>(event.ticketPrices[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [visitorName, setVisitorName] = useState(user?.name || "");
  const [visitorEmail, setVisitorEmail] = useState(user?.email || "");
  const [visitorMobile, setVisitorMobile] = useState(user?.mobile || "");
  const [visitorCity, setVisitorCity] = useState(user?.city || "");
  const [specialRequests, setSpecialRequests] = useState("");

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<TicketBooking | null>(null);

  // Price calculations
  const pricePerTicket = selectedTicket ? selectedTicket.price : 0;
  const totalAmount = pricePerTicket * quantity;

  // Razorpay simulator trigger
  const handlePayment = async () => {
    if (!visitorName || !visitorEmail || !visitorMobile || !visitorCity) {
      setError("Please fill in all mandatory visitor details.");
      return;
    }
    setError(null);
    setIsProcessing(true);

    // Simulate Payment delay (3 seconds)
    setTimeout(async () => {
      try {
        const mockPayId = "pay_rzp_" + Math.random().toString(36).substr(2, 9);
        const booking = await ApiClient.createBooking({
          eventId: event.id,
          eventName: event.name,
          eventDate: event.date,
          eventVenue: event.venue,
          eventBanner: event.bannerUrl,
          visitorName,
          visitorEmail,
          visitorMobile,
          visitorCity,
          ticketType: selectedTicket?.type as TicketType,
          quantity,
          totalAmount,
          specialRequests,
          paymentId: mockPayId,
          paymentMethod
        });
        
        setCompletedBooking(booking);
        setStep(5); // Go to final confirmation screen
      } catch (err) {
        setError("Booking failed. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }, 2500);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F19]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg glass-panel relative rounded-2xl border-indigo-500/25 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
          <h3 className="font-bold text-white font-primary text-base">Book Audience Pass</h3>
          <button onClick={onClose} className="p-1 hover:bg-[rgba(255,255,255,0.05)] rounded-full text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-grow">
          {error && (
            <div className="mb-4 p-4 bg-pink-500/10 border border-pink-500/30 text-pink-400 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Select Ticket Tier */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-gray-300">1. Select Ticket Tier</h4>
              <div className="flex flex-col gap-3">
                {event.ticketPrices.map((ticket) => (
                  <div 
                    key={ticket.type} 
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-start gap-4 ${
                      selectedTicket?.type === ticket.type 
                        ? "border-cyan-500 bg-cyan-500/5" 
                        : "border-[rgba(255,255,255,0.06)] bg-gray-900/20 hover:border-gray-700"
                    }`}
                  >
                    <div>
                      <h5 className="font-bold text-sm text-white">{ticket.type}</h5>
                      <p className="text-gray-400 text-xs mt-1 leading-normal">{ticket.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-white text-base">₹{ticket.price}</span>
                      <span className="text-[10px] text-gray-500 block mt-0.5">{ticket.available} left</span>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setStep(2)}
                className="btn btn-primary w-full py-3.5 font-bold mt-4"
              >
                Proceed to Quantity
              </button>
            </div>
          )}

          {/* STEP 2: Choose Quantity */}
          {step === 2 && (
            <div className="flex flex-col gap-4 text-center py-6">
              <h4 className="text-sm font-semibold text-gray-300 text-left">2. Choose Quantity</h4>
              
              <div className="glass-panel p-6 max-w-xs mx-auto w-full flex items-center justify-between border-[rgba(255,255,255,0.06)] rounded-xl mt-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border border-gray-700 hover:border-white text-white flex items-center justify-center font-bold text-lg"
                >
                  -
                </button>
                <span className="text-3xl font-black text-white">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="w-10 h-10 rounded-full border border-gray-700 hover:border-white text-white flex items-center justify-center font-bold text-lg"
                >
                  +
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">Maximum of 10 tickets allowed per transaction.</p>
              
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn btn-secondary py-3 px-6 text-sm font-semibold">
                  Back
                </button>
                <button onClick={() => setStep(3)} className="btn btn-primary py-3 flex-grow text-sm font-bold">
                  Enter Visitor Details
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Enter Visitor Details */}
          {step === 3 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(4); }} className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-gray-300">3. Visitor Information</h4>
              
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input 
                  type="text" 
                  placeholder="Visitor name" 
                  className="form-input"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input 
                  type="email" 
                  placeholder="visitor@example.com" 
                  className="form-input"
                  value={visitorEmail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input 
                    type="tel" 
                    placeholder="99999 88888" 
                    className="form-input"
                    value={visitorMobile}
                    onChange={(e) => setVisitorMobile(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input 
                    type="text" 
                    placeholder="Bangalore" 
                    className="form-input"
                    value={visitorCity}
                    onChange={(e) => setVisitorCity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Special Requests (Optional)</label>
                <textarea 
                  placeholder="Wheelchair assistance, front rows for elderly etc." 
                  className="form-input h-20 resize-none"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setStep(2)} className="btn btn-secondary py-3 px-6 text-sm font-semibold">
                  Back
                </button>
                <button type="submit" className="btn btn-primary py-3 flex-grow text-sm font-bold">
                  Review & Pay
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Review & Payment Simulator */}
          {step === 4 && (
            <div className="flex flex-col gap-5">
              <h4 className="text-sm font-semibold text-gray-300">4. Review & Payment</h4>
              
              {/* Order breakdown */}
              <div className="glass-panel p-5 rounded-xl border-[rgba(255,255,255,0.06)] bg-gray-900/10 flex flex-col gap-3">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Event</span>
                  <span className="font-bold text-white">{event.name}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Ticket Type</span>
                  <span className="font-bold text-white">{selectedTicket?.type}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Quantity</span>
                  <span className="font-bold text-white">{quantity}</span>
                </div>
                <div className="border-t border-[rgba(255,255,255,0.06)] pt-3 flex justify-between text-sm">
                  <span className="font-bold text-white">Total Amount</span>
                  <span className="font-black text-cyan-400 text-base">₹{totalAmount}</span>
                </div>
              </div>

              {/* Razorpay Interface Simulator */}
              <div className="border border-indigo-500/20 rounded-xl overflow-hidden bg-slate-900/90 relative p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <span className="text-xs font-bold tracking-widest text-gray-400">RAZORPAY CHECKOUT</span>
                  <div className="w-12 h-4 bg-gray-700/50 rounded flex items-center justify-center text-[7px] text-gray-300 font-bold">SECURE</div>
                </div>

                {isProcessing ? (
                  <div className="py-10 flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-gray-400 font-semibold animate-pulse">Processing secure payment overlay...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-gray-500 font-bold uppercase">Select Payment Channel</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["UPI", "Credit/Debit Card", "Net Banking", "Wallets"].map(method => (
                          <div 
                            key={method} 
                            onClick={() => setPaymentMethod(method)}
                            className={`p-3 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
                              paymentMethod === method 
                                ? "border-cyan-400 bg-cyan-400/5 text-white" 
                                : "border-gray-800 text-gray-400 hover:border-gray-700"
                            }`}
                          >
                            {method}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={handlePayment}
                      className="btn btn-primary w-full py-3.5 text-xs font-black shadow-neon-pink"
                    >
                      PAY ₹{totalAmount} WITH RAZORPAY
                    </button>
                  </>
                )}
              </div>

              {!isProcessing && (
                <button onClick={() => setStep(3)} className="btn btn-secondary py-3 text-xs font-semibold">
                  Go Back
                </button>
              )}
            </div>
          )}

          {/* STEP 5: Success Pass */}
          {step === 5 && completedBooking && (
            <div className="flex flex-col items-center gap-6 text-center py-4 print-area">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl animate-bounce">
                ✓
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-white font-primary">Booking Confirmed!</h4>
                <p className="text-gray-400 text-xs mt-1">A simulated ticket confirmation mail has been triggered via SMTP.</p>
              </div>

              {/* Printable Ticket Pass Layout */}
              <div className="w-full border border-dashed border-gray-700 rounded-xl bg-gray-900/50 p-6 flex flex-col gap-4 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-bl-full"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-bold">RECHARGE NATION ENTRY PASS</span>
                    <h5 className="font-extrabold text-white text-base leading-snug font-primary mt-1 line-clamp-1">{completedBooking.eventName}</h5>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-gray-500 block uppercase font-bold">REF NUMBER</span>
                    <span className="font-primary text-xs font-bold text-white">{completedBooking.bookingRef}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs py-2 border-y border-[rgba(255,255,255,0.06)]">
                  <div>
                    <span className="text-[8px] text-gray-500 uppercase block">Attendee</span>
                    <span className="font-bold text-white line-clamp-1">{completedBooking.visitorName}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-500 uppercase block">Ticket Tier</span>
                    <span className="font-bold text-cyan-400">{completedBooking.ticketType} x {completedBooking.quantity}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-500 uppercase block">Date & Venue</span>
                    <span className="font-bold text-gray-300">{completedBooking.eventDate}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-500 uppercase block">Gate Location</span>
                    <span className="font-bold text-gray-300">{completedBooking.eventVenue}</span>
                  </div>
                </div>

                {/* Simulated QR Code */}
                <div className="flex items-center justify-between gap-4 mt-2">
                  <div className="flex flex-col gap-1 text-[10px] text-gray-400">
                    <span>* Bring this pass with you for scan-in.</span>
                    <span>* Food/Beverage is subject to pass terms.</span>
                  </div>
                  {/* Styled Mock SVG QR Code */}
                  <div className="w-16 h-16 bg-white p-1.5 rounded flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                      <rect width="25" height="25" fill="black"/>
                      <rect x="75" width="25" height="25" fill="black"/>
                      <rect y="75" width="25" height="25" fill="black"/>
                      <rect x="35" y="35" width="30" height="30" fill="black"/>
                      <rect x="10" y="45" width="15" height="15" fill="black"/>
                      <rect x="45" y="10" width="15" height="15" fill="black"/>
                      <rect x="75" y="75" width="20" height="20" fill="black"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 w-full mt-4">
                <button 
                  onClick={handlePrint}
                  className="btn btn-secondary py-3 flex-grow text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Printer size={14} /> Download PDF Ticket
                </button>
                <button 
                  onClick={() => {
                    onClose();
                    router.push("/dashboard");
                  }}
                  className="btn btn-primary py-3 px-6 text-xs font-bold"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// COMPETITION REGISTRATION WIZARD COMPONENT
// ----------------------------------------------------
function CompetitionRegistrationWizard({ event, user, onClose }: WizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Registration form states
  const [category, setCategory] = useState("");
  const [fullName, setFullName] = useState(user?.name || "");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState<number>(18);
  const [gender, setGender] = useState("Male");
  const [email, setEmail] = useState(user?.email || "");
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [city, setCity] = useState(user?.city || "");
  const [state, setState] = useState(user?.state || "");
  const [address, setAddress] = useState(user?.address || "");
  const [organization, setOrganization] = useState(user?.organization || "");
  const [emergencyContact, setEmergencyContact] = useState("");

  // Upload simulation states (store filenames)
  const [photograph, setPhotograph] = useState<string | null>(null);
  const [govId, setGovId] = useState<string | null>(null);
  const [performanceVideo, setPerformanceVideo] = useState("");

  // Verification code simulator
  const [verificationCode, setVerificationCode] = useState("");
  const [userEnteredCode, setUserEnteredCode] = useState("");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  // Payment simulator state
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedReg, setCompletedReg] = useState<CompetitionRegistration | null>(null);

  const registrationFee = event.registrationFee || 0;

  // Age group configurations mock categories
  const categories = [
    { name: "Junior (Age 8 - 14)", fee: registrationFee },
    { name: "Senior (Age 15 - 22)", fee: registrationFee },
    { name: "Open Category (Age 23+)", fee: registrationFee }
  ];

  // Set default category
  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories]);

  // Simulate file upload
  const handleFileUpload = (type: "photo" | "id", filename: string) => {
    if (type === "photo") setPhotograph(filename);
    if (type === "id") setGovId(filename);
  };

  // Step 3 submission trigger - launches email verification step
  const handleProceedToVerify = () => {
    if (!fullName || !email || !mobile || !dob || !city || !state || !emergencyContact) {
      setError("Please fill in all mandatory participant details.");
      return;
    }
    setError(null);
    setIsVerifyingEmail(true);

    // Simulate sending email verification code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(generatedCode);
    console.log(`[MOCK EMAIL SMTP] Competition registration code for ${email} is ${generatedCode}`);
    setStep(4);
    setIsVerifyingEmail(false);
  };

  const handleVerifyCodeSubmit = () => {
    if (userEnteredCode !== verificationCode) {
      setError("Incorrect email verification code. Check your simulated log/console.");
      return;
    }
    setError(null);
    if (registrationFee > 0) {
      setStep(5); // Go to payment
    } else {
      handleFinalizeRegistration("waived", "free_direct");
    }
  };

  // Final submit registration saving
  const handleFinalizeRegistration = async (paymentStatus: 'paid' | 'waived', paymentId = "") => {
    setIsProcessing(true);
    try {
      const reg = await ApiClient.createRegistration({
        competitionId: event.id,
        competitionName: event.name,
        competitionDate: event.date,
        competitionVenue: event.venue,
        competitionBanner: event.bannerUrl,
        fullName,
        dob,
        age,
        gender,
        email,
        mobile,
        city,
        state,
        address,
        organization,
        category,
        emergencyContact,
        uploads: {
          photograph: photograph || undefined,
          govId: govId || undefined,
          performanceVideo: performanceVideo || undefined
        },
        paymentId: paymentId || undefined,
        paymentStatus,
        status: "pending" // Pending approval from admin later
      });

      setCompletedReg(reg);
      setStep(6); // Success Pass
    } catch (err) {
      setError("Failed to submit registration. Please check your inputs.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F19]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg glass-panel relative rounded-2xl border-indigo-500/25 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
          <h3 className="font-bold text-white font-primary text-base">Competition Registration</h3>
          <button onClick={onClose} className="p-1 hover:bg-[rgba(255,255,255,0.05)] rounded-full text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-grow">
          {error && (
            <div className="mb-4 p-4 bg-pink-500/10 border border-pink-500/30 text-pink-400 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Select Category */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-gray-300">1. Select Competition Class</h4>
              <div className="flex flex-col gap-3">
                {categories.map((cat) => (
                  <div 
                    key={cat.name} 
                    onClick={() => setCategory(cat.name)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                      category === cat.name 
                        ? "border-cyan-500 bg-cyan-500/5" 
                        : "border-[rgba(255,255,255,0.06)] bg-gray-900/20 hover:border-gray-700"
                    }`}
                  >
                    <div>
                      <h5 className="font-bold text-sm text-white">{cat.name}</h5>
                      <span className="text-[10px] text-gray-500 uppercase block mt-1">Registration Charge</span>
                    </div>
                    <span className="font-bold text-white text-base">₹{cat.fee}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setStep(2)}
                className="btn btn-primary w-full py-3.5 font-bold mt-4"
              >
                Enter Personal Information
              </button>
            </div>
          )}

          {/* STEP 2: Participant Info */}
          {step === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-gray-300">2. Participant Details</h4>
              
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input 
                  type="text" 
                  placeholder="Participant full name" 
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={dob}
                    onChange={(e) => {
                      setDob(e.target.value);
                      // Calculate mock age
                      const birthYear = new Date(e.target.value).getFullYear();
                      const currentYear = new Date().getFullYear();
                      if (birthYear) setAge(currentYear - birthYear);
                    }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input 
                    type="email" 
                    placeholder="name@college.edu" 
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input 
                    type="tel" 
                    placeholder="99999 88888" 
                    className="form-input"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input 
                    type="text" 
                    placeholder="Pune" 
                    className="form-input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input 
                    type="text" 
                    placeholder="Maharashtra" 
                    className="form-input"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input 
                  type="text" 
                  placeholder="Street name, landmark..." 
                  className="form-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">School/College/Org</label>
                  <input 
                    type="text" 
                    placeholder="DY Patil Pune" 
                    className="form-input"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Emergency Contact *</label>
                  <input 
                    type="tel" 
                    placeholder="Parent mobile number" 
                    className="form-input"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary py-3 px-6 text-sm font-semibold">
                  Back
                </button>
                <button type="submit" className="btn btn-primary py-3 flex-grow text-sm font-bold">
                  Document Uploads
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Document Uploads Simulator */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <h4 className="text-sm font-semibold text-gray-300">3. Upload Supporting Credentials</h4>
              
              <div className="flex flex-col gap-4">
                {/* Photograph */}
                <div className="p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-gray-900/10 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">Photograph *</h5>
                    <p className="text-[10px] text-gray-500 mt-0.5">JPEG or PNG. Max 2MB.</p>
                  </div>
                  <button 
                    onClick={() => handleFileUpload("photo", "passport_photo.png")}
                    className="btn btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Upload size={12} /> {photograph ? "Uploaded" : "Upload file"}
                  </button>
                </div>
                {photograph && <p className="text-[10px] text-emerald-400 -mt-2 ml-1">✓ File: {photograph}</p>}

                {/* Government ID */}
                <div className="p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-gray-900/10 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">Aadhaar / Passport ID *</h5>
                    <p className="text-[10px] text-gray-500 mt-0.5">PDF or JPG. Max 5MB.</p>
                  </div>
                  <button 
                    onClick={() => handleFileUpload("id", "aadhar_card.pdf")}
                    className="btn btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Upload size={12} /> {govId ? "Uploaded" : "Upload file"}
                  </button>
                </div>
                {govId && <p className="text-[10px] text-emerald-400 -mt-2 ml-1">✓ File: {govId}</p>}

                {/* Video Links */}
                <div className="form-group">
                  <label className="form-label">Performance Video Link (Optional)</label>
                  <input 
                    type="url" 
                    placeholder="YouTube, Drive or Vimeo link" 
                    className="form-input"
                    value={performanceVideo}
                    onChange={(e) => setPerformanceVideo(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-500 leading-normal">Required for initial pre-selection screen evaluation rounds.</p>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setStep(2)} className="btn btn-secondary py-3 px-6 text-sm font-semibold">
                  Back
                </button>
                <button 
                  onClick={handleProceedToVerify}
                  className="btn btn-primary py-3 flex-grow text-sm font-bold"
                >
                  Verify Contact
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Email Verification Step */}
          {step === 4 && (
            <div className="flex flex-col gap-4 text-center py-4">
              <ShieldCheck size={36} className="text-cyan-400 mx-auto" />
              <h4 className="text-sm font-semibold text-gray-300">4. Email Authentication</h4>
              <p className="text-xs text-gray-500">A verification code has been dispatched to {email}.</p>

              {/* Log Code for Testing */}
              {verificationCode && (
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-lg text-[10px] font-primary">
                  DEV MODE - Code generated is: <strong>{verificationCode}</strong>
                </div>
              )}

              <div className="form-group text-left max-w-[200px] mx-auto mt-4">
                <label className="form-label text-center">Verify 6-digit Code</label>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="123456" 
                  className="form-input text-center tracking-widest font-bold"
                  value={userEnteredCode}
                  onChange={(e) => setUserEnteredCode(e.target.value)}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(3)} className="btn btn-secondary py-3 px-6 text-sm font-semibold">
                  Back
                </button>
                <button 
                  onClick={handleVerifyCodeSubmit}
                  className="btn btn-primary py-3 flex-grow text-sm font-bold"
                >
                  Verify Code
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Payment Step */}
          {step === 5 && (
            <div className="flex flex-col gap-5">
              <h4 className="text-sm font-semibold text-gray-300">5. Registration Fee Payment</h4>
              
              <div className="glass-panel p-5 rounded-xl border-[rgba(255,255,255,0.06)] bg-gray-900/10 flex flex-col gap-3">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Competition</span>
                  <span className="font-bold text-white">{event.name}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Class Category</span>
                  <span className="font-bold text-white">{category}</span>
                </div>
                <div className="border-t border-[rgba(255,255,255,0.06)] pt-3 flex justify-between text-sm">
                  <span className="font-bold text-white">Fee Amount</span>
                  <span className="font-black text-cyan-400 text-base">₹{registrationFee}</span>
                </div>
              </div>

              {/* Razorpay Integration */}
              <div className="border border-indigo-500/20 rounded-xl overflow-hidden bg-slate-900/90 p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="text-xs font-bold text-gray-400 tracking-wider">SECURE RAZORPAY PLATFORM</span>
                </div>

                {isProcessing ? (
                  <div className="py-8 flex flex-col items-center gap-2">
                    <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-gray-500">Completing secure checkout...</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleFinalizeRegistration("paid", "pay_rzp_comp_" + Math.random().toString(36).substr(2, 9))}
                    className="btn btn-primary w-full py-3.5 text-xs font-bold"
                  >
                    PAY ₹{registrationFee} & COMPLETE REGISTRATION
                  </button>
                )}
              </div>

              {!isProcessing && (
                <button onClick={() => setStep(4)} className="btn btn-secondary py-3 text-xs font-semibold">
                  Go Back
                </button>
              )}
            </div>
          )}

          {/* STEP 6: Success Screen */}
          {step === 6 && completedReg && (
            <div className="flex flex-col items-center gap-6 text-center py-4 print-area">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl">
                ✓
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-white font-primary">Registration Pending Approval!</h4>
                <p className="text-gray-400 text-xs mt-1">An SMTP notification email has been triggered. The admin will verify uploads shortly.</p>
              </div>

              {/* Printable Pass */}
              <div className="w-full border border-dashed border-gray-700 rounded-xl bg-gray-900/50 p-6 flex flex-col gap-4 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500/5 rounded-bl-full"></div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-pink-400 font-bold">RECHARGE PARTICIPANT ID PASS</span>
                    <h5 className="font-extrabold text-white text-base leading-snug font-primary mt-1 line-clamp-1">{completedReg.competitionName}</h5>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-gray-500 block uppercase font-bold">PARTICIPANT ID</span>
                    <span className="font-primary text-xs font-bold text-white">{completedReg.participantId}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs py-2 border-y border-[rgba(255,255,255,0.06)]">
                  <div>
                    <span className="text-[8px] text-gray-500 uppercase block">Name</span>
                    <span className="font-bold text-white line-clamp-1">{completedReg.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-500 uppercase block">Competition Class</span>
                    <span className="font-bold text-pink-400">{completedReg.category}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-500 uppercase block">Date & Venue</span>
                    <span className="font-bold text-gray-300">{completedReg.competitionDate}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-500 uppercase block">Verify Status</span>
                    <span className="font-bold text-yellow-500 uppercase text-[9px]">{completedReg.status}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 mt-2">
                  <div className="flex flex-col gap-1 text-[10px] text-gray-400">
                    <span>* Status approval update notification will arrive via SMS.</span>
                    <span>* Auditions timeline details are in Dashboard.</span>
                  </div>
                  {/* Styled Mock SVG QR Code */}
                  <div className="w-16 h-16 bg-white p-1.5 rounded flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                      <rect width="25" height="25" fill="black"/>
                      <rect x="75" width="25" height="25" fill="black"/>
                      <rect y="75" width="25" height="25" fill="black"/>
                      <rect x="35" y="35" width="30" height="30" fill="black"/>
                      <rect x="10" y="45" width="15" height="15" fill="black"/>
                      <rect x="45" y="10" width="15" height="15" fill="black"/>
                      <rect x="75" y="75" width="20" height="20" fill="black"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 w-full mt-4">
                <button 
                  onClick={() => {
                    onClose();
                    router.push("/dashboard");
                  }}
                  className="btn btn-primary w-full py-3 text-xs font-bold"
                >
                  View in My Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
