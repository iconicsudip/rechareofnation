"use client";

import { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar, MapPin, Phone, Mail, Share2,
  ArrowLeft, Check, Ticket, Trophy, Upload, ShieldCheck,
  AlertCircle, Printer, X, Clock, ArrowRight,
  ChevronDown, ChevronUp, Sliders, Star, HelpCircle, Sparkles,
  Radio, Navigation, Flame, Zap, CheckCircle2, Music,
  ExternalLink, QrCode, CheckCheck, Send,
  ChevronLeft, ChevronRight, Play, Maximize2, Film, Image as ImageIcon
} from "lucide-react";
import {
  ApiClient, Event, TicketType, TicketPriceInfo, TicketBooking,
  CompetitionRegistration, User, GalleryItem, EventSectionItem
} from "@/lib/api-client";
import RichTextContent from "@/components/RichTextContent";
import { isFieldEnabled, DEFAULT_TICKET_BOOKING_FIELDS, DEFAULT_INQUIRY_FORM_FIELDS } from "@/lib/bookingFormFields";

interface FoodExpoSponsorTier {
  no: number;
  rank?: string;
  name: string;
  price: string;
  tag: string;
  desc?: string;
  bg: string;
}

interface FoodExpoConfig {
  exhibitors: string[];
  visitors: string[];
  sponsorshipTiers: FoodExpoSponsorTier[];
  benefits: string[];
  portals: { name: string; url: string }[];
  slogans: { primary: string; motto: string };
  images: { chartPoster: string; sponsorshipPoster: string };
}

// Parses the admin's freeform "Exhibit"/"Visit" textarea into an intro
// paragraph (text before the first blank line) plus a bullet list (remaining
// non-empty lines) — the admin form is plain text, not rich text.
function parseInfoBlock(text: string): { intro: string; items: string[] } {
  const blocks = text.trim().split(/\n\s*\n/);
  const intro = blocks[0]?.trim() ?? "";
  const items = blocks.slice(1).join("\n").split("\n").map(l => l.trim()).filter(Boolean);
  return { intro, items };
}

function isVideoUrl(url: string): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  return (
    clean.includes("youtube.com") ||
    clean.includes("youtu.be") ||
    clean.includes("vimeo.com") ||
    clean.endsWith(".mp4") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".ogg") ||
    clean.endsWith(".mov") ||
    clean.includes(".mp4?") ||
    clean.includes(".webm?")
  );
}

function getYoutubeId(url: string): string | null {
  if (!url) return null;
  const match = url.trim().match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

function getEmbedVideoUrl(url: string): string | null {
  if (!url) return null;
  const clean = url.trim();
  const ytId = getYoutubeId(clean);
  if (ytId) {
    return `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`;
  }
  const vimeoMatch = clean.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }
  return null;
}

function getVideoPoster(url: string, fallbackBanner?: string): string {
  const ytId = getYoutubeId(url);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }
  return fallbackBanner || "";
}

interface HeroMediaItem {
  id: string;
  url: string;
  type: "image" | "video";
  title: string;
  poster?: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

type BadgeColorTheme = "gold" | "indigo" | "rose" | "emerald";

export default function EventDetailPage({ params }: PageProps) {
  const { id: eventId } = use(params);

  const [event, setEvent] = useState<Event | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal and share states
  const [activeWizard, setActiveWizard] = useState<"booking" | "registration" | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeNavSection, setActiveNavSection] = useState<string>("experience");

  // Interactive page states
  const [selectedZone, setSelectedZone] = useState<number>(0);
  const [hoveredZone, setHoveredZone] = useState<number | null>(null);
  const [passholderName, setPassholderName] = useState("");
  const [badgeGlow, setBadgeGlow] = useState<BadgeColorTheme>("gold");
  const [scheduleTab, setScheduleTab] = useState<number>(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [commercialTab, setCommercialTab] = useState<"sponsorship" | "stalls" | "ads">("sponsorship");
  const [commercialInquiry, setCommercialInquiry] = useState<{ title: string; category: string; amount?: string } | null>(null);
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ name: "", email: "", phone: "", company: "", message: "" });
  const [showFoodExpoLightbox, setShowFoodExpoLightbox] = useState<"directory" | "sponsorship" | null>(null);
  const [foodExpoSectionTab, setFoodExpoSectionTab] = useState<"sponsorship" | "directory">("sponsorship");
  const [foodExpoConfig, setFoodExpoConfig] = useState<FoodExpoConfig>({
    exhibitors: [], visitors: [], sponsorshipTiers: [], benefits: [],
    portals: [], slogans: { primary: "", motto: "" }, images: { chartPoster: "", sponsorshipPoster: "" },
  });

  // Hero Media Showcase States
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [mediaFilter, setMediaFilter] = useState<"all" | "image" | "video">("all");
  const [isPlayingInlineVideo, setIsPlayingInlineVideo] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  // Unified Fetch
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const allEvents = await ApiClient.getEvents();
        const found = allEvents.find(e => e.slug === eventId || e.id === eventId);
        if (found) {
          setEvent(found);
        }
        setCurrentUser(ApiClient.getCurrentUser());
      } catch (err) {
        console.error("Failed to load event data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEventData();
    ApiClient.getGalleryItems().then(setGalleryItems).catch(() => setGalleryItems([]));
    ApiClient.getSiteContent<FoodExpoConfig>("food_expo_config").then(cfg => {
      if (cfg && cfg.sponsorshipTiers) setFoodExpoConfig(cfg);
    }).catch(() => {});
  }, [eventId]);

  // Gallery items tagged with this event's category — the Gallery admin
  // stores that tag in the (confusingly-named) `event` field.
  const eventGalleryItems = event ? galleryItems.filter(g => g.event === event.category) : [];

  const activeSections = useMemo(() => {
    const raw = event?.eventSections;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.filter((s) => s.enabled);
    }
    return [
      { id: "exhibit", label: "Exhibit", enabled: true, type: "exhibit" },
      { id: "visit", label: "Visit", enabled: true, type: "visit" },
      { id: "gallery", label: "Gallery", enabled: true, type: "gallery" },
      { id: "view_pdf", label: "View PDF", enabled: true, type: "pdf" },
      { id: "book_space", label: "Book Space", enabled: true, type: "book_space" },
      { id: "sponsorship", label: "Sponsorship Opportunities", enabled: true, type: "sponsorship" },
    ] as EventSectionItem[];
  }, [event?.eventSections]);

  const handleViewPdf = () => {
    if (event?.brochurePdfUrl) {
      window.open(event.brochurePdfUrl, "_blank", "noopener,noreferrer");
    } else {
      alert("The official brochure PDF for this event will be published shortly. Please check back soon or contact the organizers.");
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["experience", "exhibit", "visit", "gallery", "schedule", "tickets", "headliners", "venue", "rules", "faq", "commercial"];
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

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2400);
    }
  };

  ;

  const getPassRef = (id: string, ticketType: string) => {
    const idPart = (id.replace(/[^A-Za-z0-9]/g, "").slice(-4) || "7092").toUpperCase();
    const typePart = (ticketType.replace(/[^A-Za-z]/g, "").slice(0, 3) || "VIP").toUpperCase();
    return `RN-${typePart}-${idPart}`;
  };

  // Holographic badge themes
  const getBadgeTheme = (theme: BadgeColorTheme) => {
    switch (theme) {
      case "indigo":
        return {
          bg: "bg-gradient-to-br from-indigo-900 via-[#13112c] to-[#0b0819]",
          border: "border-indigo-400/40",
          accentText: "text-indigo-300",
          glow: "shadow-[0_0_35px_rgba(99,102,241,0.25)]",
          pill: "bg-indigo-500/20 text-indigo-300 border-indigo-400/30",
          chip: "bg-indigo-500",
          foil: "from-indigo-400/20 via-white/20 to-transparent"
        };
      case "rose":
        return {
          bg: "bg-gradient-to-br from-[#3b0b14] via-[#22070c] to-[#120306]",
          border: "border-rose-400/40",
          accentText: "text-rose-300",
          glow: "shadow-[0_0_35px_rgba(244,63,94,0.25)]",
          pill: "bg-rose-500/20 text-rose-300 border-rose-400/30",
          chip: "bg-rose-500",
          foil: "from-rose-400/20 via-white/20 to-transparent"
        };
      case "emerald":
        return {
          bg: "bg-gradient-to-br from-[#06241b] via-[#041712] to-[#020b08]",
          border: "border-emerald-400/40",
          accentText: "text-emerald-300",
          glow: "shadow-[0_0_35px_rgba(16,185,129,0.25)]",
          pill: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
          chip: "bg-emerald-500",
          foil: "from-emerald-400/20 via-white/20 to-transparent"
        };
      case "gold":
      default:
        return {
          bg: "bg-gradient-to-br from-[#2a170a] via-[#1c0d06] to-[#0f0703]",
          border: "border-amber-400/50",
          accentText: "text-amber-300",
          glow: "shadow-[0_0_35px_rgba(201,162,39,0.3)]",
          pill: "bg-amber-500/20 text-amber-300 border-amber-400/30",
          chip: "bg-amber-500",
          foil: "from-amber-400/20 via-white/25 to-transparent"
        };
    }
  };

  // Hero Media Collection
  const heroMediaItems: HeroMediaItem[] = useMemo(() => {
    if (!event) return [];
    const items: HeroMediaItem[] = [];
    const seenUrls = new Set<string>();

    // 1. Primary Promo Video
    if (event.videoUrl && event.videoUrl.trim()) {
      const vUrl = event.videoUrl.trim();
      seenUrls.add(vUrl);
      items.push({
        id: "hero-promo-video",
        url: vUrl,
        type: "video",
        title: "Official Promo Video",
        poster: getVideoPoster(vUrl, event.bannerUrl),
      });
    }

    // 2. Banner Image / Video
    if (event.bannerUrl && event.bannerUrl.trim()) {
      const bUrl = event.bannerUrl.trim();
      if (!seenUrls.has(bUrl)) {
        seenUrls.add(bUrl);
        const isVid = isVideoUrl(bUrl);
        items.push({
          id: "hero-banner",
          url: bUrl,
          type: isVid ? "video" : "image",
          title: "Main Showcase",
          poster: isVid ? getVideoPoster(bUrl) : bUrl,
        });
      }
    }

    // 3. Additional Gallery URLs (Images or Videos)
    if (Array.isArray(event.galleryUrls)) {
      event.galleryUrls.forEach((rawUrl, idx) => {
        const u = (rawUrl || "").trim();
        if (u && !seenUrls.has(u)) {
          seenUrls.add(u);
          const isVid = isVideoUrl(u);
          items.push({
            id: `hero-gallery-${idx}`,
            url: u,
            type: isVid ? "video" : "image",
            title: isVid ? `Video #${idx + 1}` : `Photo #${idx + 1}`,
            poster: isVid ? getVideoPoster(u, event.bannerUrl) : u,
          });
        }
      });
    }

    return items;
  }, [event]);

  const filteredMedia = useMemo(() => {
    if (mediaFilter === "all") return heroMediaItems;
    return heroMediaItems.filter(item => item.type === mediaFilter);
  }, [heroMediaItems, mediaFilter]);

  const safeIndex = activeMediaIndex >= filteredMedia.length ? 0 : activeMediaIndex;
  const currentMedia = filteredMedia[safeIndex] || null;
  const hasMultipleMedia = filteredMedia.length > 1;
  const imageCount = useMemo(() => heroMediaItems.filter(m => m.type === "image").length, [heroMediaItems]);
  const videoCount = useMemo(() => heroMediaItems.filter(m => m.type === "video").length, [heroMediaItems]);

  const handleSelectFilter = (filter: "all" | "image" | "video") => {
    setMediaFilter(filter);
    setActiveMediaIndex(0);
    setIsPlayingInlineVideo(false);
  };

  const handleNextMedia = () => {
    if (filteredMedia.length <= 1) return;
    setActiveMediaIndex(prev => (prev + 1) % filteredMedia.length);
    setIsPlayingInlineVideo(false);
  };

  const handlePrevMedia = () => {
    if (filteredMedia.length <= 1) return;
    setActiveMediaIndex(prev => (prev - 1 + filteredMedia.length) % filteredMedia.length);
    setIsPlayingInlineVideo(false);
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        setActiveMediaIndex(prev => (prev - 1 + filteredMedia.length) % (filteredMedia.length || 1));
        setIsPlayingInlineVideo(false);
      } else if (e.key === "ArrowRight") {
        setActiveMediaIndex(prev => (prev + 1) % (filteredMedia.length || 1));
        setIsPlayingInlineVideo(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, filteredMedia.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--bg-main)] text-[var(--text-secondary)] font-secondary">
        <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
        <span className="text-xs font-primary font-bold tracking-widest uppercase text-amber-400/80">
          Loading Event Experience...
        </span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 gap-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-black text-[var(--text-primary)] font-primary uppercase tracking-tight">
          Event Not Found
        </h2>
        <p className="text-[var(--text-secondary)] text-sm max-w-md font-secondary">
          The event you are looking for does not exist or may have been archived.
        </p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-[#170D08] text-xs px-6 py-3 rounded-full font-primary font-bold uppercase tracking-wider hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all"
        >
          <ArrowLeft size={14} /> Back to Events Directory
        </Link>
      </div>
    );
  }

  // Derived ticket pricing calculations
  const prices = event.ticketPrices.map(t => t.price).filter(p => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const selectedTicketInfo = event.ticketPrices[selectedZone] || event.ticketPrices[0] || null;
  const currentBadgeTheme = getBadgeTheme(badgeGlow);

  const showInquiryPhone = isFieldEnabled(event.inquiryFormFields, DEFAULT_INQUIRY_FORM_FIELDS, "phone");
  const showInquiryCompany = isFieldEnabled(event.inquiryFormFields, DEFAULT_INQUIRY_FORM_FIELDS, "company");
  const showInquiryNotes = isFieldEnabled(event.inquiryFormFields, DEFAULT_INQUIRY_FORM_FIELDS, "notes");

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-secondary relative selection:bg-amber-500/30 selection:text-amber-200">

      {/* Dynamic Cinema Lightbox Overlay */}
      {isLightboxOpen && currentMedia && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="w-full max-w-6xl flex items-center justify-between gap-4 py-2 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-primary font-bold uppercase tracking-wider ${currentMedia.type === "video" ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}>
                {currentMedia.type === "video" ? "Cinema Video" : "High-Res Photo"}
              </span>
              <h4 className="text-white text-sm sm:text-base font-primary font-bold truncate max-w-[280px] sm:max-w-md">
                {currentMedia.title} &mdash; {event.name}
              </h4>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--text-muted)] font-primary">
                {safeIndex + 1} / {filteredMedia.length}
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close Cinema Mode (Esc)"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Central Media Stage */}
          <div className="relative w-full max-w-5xl flex-1 my-4 flex items-center justify-center min-h-0">
            {filteredMedia.length > 1 && (
              <button
                type="button"
                onClick={handlePrevMedia}
                className="absolute left-2 sm:left-4 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-amber-500 hover:text-[#170D08] border border-white/20 text-white flex items-center justify-center transition-all shadow-xl cursor-pointer"
                title="Previous (Left Arrow)"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <div className="w-full h-full max-h-[75vh] flex items-center justify-center">
              {currentMedia.type === "video" ? (
                (() => {
                  const embedUrl = getEmbedVideoUrl(currentMedia.url);
                  return embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={currentMedia.title}
                      className="w-full h-full max-w-4xl aspect-video rounded-2xl border border-white/20 shadow-2xl"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={currentMedia.url}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full max-w-4xl max-h-[75vh] object-contain rounded-2xl border border-white/20 shadow-2xl"
                    />
                  );
                })()
              ) : (
                <img
                  src={currentMedia.url}
                  alt={currentMedia.title}
                  className="max-w-full max-h-full w-auto h-auto object-contain rounded-2xl shadow-2xl border border-white/10 select-none"
                />
              )}
            </div>

            {filteredMedia.length > 1 && (
              <button
                type="button"
                onClick={handleNextMedia}
                className="absolute right-2 sm:right-4 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-amber-500 hover:text-[#170D08] border border-white/20 text-white flex items-center justify-center transition-all shadow-xl cursor-pointer"
                title="Next (Right Arrow)"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Filmstrip at Bottom of Lightbox */}
          {filteredMedia.length > 1 && (
            <div className="w-full max-w-3xl flex items-center justify-center gap-2 overflow-x-auto py-2 no-scrollbar">
              {filteredMedia.map((m, idx) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setActiveMediaIndex(idx);
                    setIsPlayingInlineVideo(false);
                  }}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${idx === safeIndex
                      ? "border-amber-400 scale-105 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                      : "border-white/20 opacity-60 hover:opacity-100"
                    }`}
                >
                  {m.type === "video" ? (
                    <div className="w-full h-full bg-[#201008] flex items-center justify-center relative">
                      {m.poster && (
                        <img src={m.poster} alt="" className="w-full h-full object-cover opacity-60" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play size={14} className="text-amber-400 fill-amber-400" />
                      </div>
                    </div>
                  ) : (
                    <img src={m.url} alt="" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dynamic Wizard Overlays */}
      {activeWizard === "booking" && (
        <TicketBookingWizard
          event={event}
          user={currentUser}
          initialTierIndex={selectedZone}
          customPassholderName={passholderName}
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

      {/* Commercial Inquiry Modal */}
      {commercialInquiry && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-[var(--bg-panel)] relative rounded-[32px] shadow-2xl border border-[var(--border-color)] overflow-hidden flex flex-col p-6 text-left">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-4">
              <div>
                <span className="text-[8px] font-primary font-bold tracking-widest text-amber-400 uppercase">
                  {commercialInquiry.category} Inquiry
                </span>
                <h3 className="font-black text-[var(--text-primary)] font-primary text-base uppercase">
                  {commercialInquiry.title}
                </h3>
                {commercialInquiry.amount && (
                  <span className="text-sm font-bold text-amber-400 font-primary">
                    Rate: {commercialInquiry.amount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setCommercialInquiry(null);
                  setInquirySent(false);
                }}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {inquirySent ? (
              <div className="flex flex-col items-center gap-4 text-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xl">
                  <Check size={24} />
                </div>
                <div>
                  <h4 className="text-base font-black text-[var(--text-primary)] font-primary uppercase">
                    Inquiry Submitted!
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 font-secondary">
                    The festival custodians for {event.name} will contact you shortly regarding the {commercialInquiry.title} package.
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full mt-2">
                  {event.organizer.email && (
                    <a
                      href={`mailto:${event.organizer.email}?subject=Inquiry for ${commercialInquiry.title}&body=Hello ${event.organizer.name}, I am interested in ${commercialInquiry.title}.`}
                      className="bg-amber-500 hover:bg-amber-400 text-[#170D08] rounded-xl py-2.5 text-xs font-primary font-black uppercase tracking-wider text-center"
                    >
                      Email Organizer Directly
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setCommercialInquiry(null);
                      setInquirySent(false);
                    }}
                    className="border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-white/5 rounded-xl py-2.5 text-xs font-primary font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setInquirySent(true);
                }}
                className="flex flex-col gap-3.5"
              >
                <div>
                  <label className="text-[9px] font-primary font-bold uppercase text-[var(--text-muted)] block mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryForm.name}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-white/5 border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className={showInquiryPhone ? "grid grid-cols-2 gap-3" : ""}>
                  <div>
                    <label className="text-[9px] font-primary font-bold uppercase text-[var(--text-muted)] block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={inquiryForm.email}
                      onChange={(e) => setInquiryForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="name@company.com"
                      className="w-full bg-white/5 border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  {showInquiryPhone && (
                    <div>
                      <label className="text-[9px] font-primary font-bold uppercase text-[var(--text-muted)] block mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={inquiryForm.phone}
                        onChange={(e) => setInquiryForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className="w-full bg-white/5 border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  )}
                </div>

                {showInquiryCompany && (
                  <div>
                    <label className="text-[9px] font-primary font-bold uppercase text-[var(--text-muted)] block mb-1">
                      Company / Brand Name
                    </label>
                    <input
                      type="text"
                      value={inquiryForm.company}
                      onChange={(e) => setInquiryForm(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="e.g. Nexus Enterprises"
                      className="w-full bg-white/5 border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}

                {showInquiryNotes && (
                  <div>
                    <label className="text-[9px] font-primary font-bold uppercase text-[var(--text-muted)] block mb-1">
                      Notes / Requirements
                    </label>
                    <textarea
                      rows={2}
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Specific placement preferences, brand deliverables, or stall requirements..."
                      className="w-full bg-white/5 border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-400 resize-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="mt-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#170D08] rounded-xl py-3 text-xs font-primary font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Submit Official Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Lightbox modal for Food Expo Posters */}
      {showFoodExpoLightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative max-w-5xl w-full max-h-[92vh] flex flex-col bg-[#120B07] border border-amber-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 mb-3">
              <div className="flex flex-col">
                <span className="text-[9px] font-primary font-bold text-amber-400 uppercase tracking-widest">
                  Food Expo 2026–2027 Official Blueprint
                </span>
                <h3 className="text-sm sm:text-lg font-black font-primary text-white uppercase">
                  {showFoodExpoLightbox === "directory" ? "Exhibitor & Visitor Directory" : "Sponsorship Categories & Benefits"}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFoodExpoLightbox(showFoodExpoLightbox === "directory" ? "sponsorship" : "directory")}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-stone-300 hover:text-white text-[11px] font-bold font-primary uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Switch to {showFoodExpoLightbox === "directory" ? "Sponsorship Poster" : "Directory Poster"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFoodExpoLightbox(null)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="overflow-hidden max-h-[80vh] w-full rounded-2xl flex items-center justify-center p-2 bg-black/40">
              <img
                src={showFoodExpoLightbox === "directory" ? "/images/food-expo-chart.png" : "/images/food-expo-sponsorship.png"}
                alt={showFoodExpoLightbox === "directory" ? "Food Expo Directory Poster" : "Food Expo Sponsorship Poster"}
                className="max-w-full max-h-[76vh] w-auto h-auto object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification when link copied */}
      {copiedLink && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1f1107] border border-amber-400/60 text-amber-300 text-xs px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCheck size={16} className="text-emerald-400" />
          <span className="font-primary font-bold uppercase tracking-wider text-[11px]">
            Event link copied to clipboard!
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CINEMATIC HERO BANNER                                                 */}
      {/* ========================================================================= */}
      <section className="relative pt-6 pb-12 sm:pt-8 md:pt-10 md:pb-16 overflow-hidden border-b border-[var(--border-color)]">
        {/* Ambient Blurred Backdrop */}
        {event.bannerUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-15 scale-110 pointer-events-none"
            style={{ backgroundImage: `url(${event.bannerUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-main)]/80 to-[var(--bg-main)] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-rose-600/10 rounded-full filter blur-[100px] pointer-events-none" />

        <div className="container max-w-7xl mx-auto px-4 relative z-10">

          {/* Top Breadcrumb & Share Row */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-xs font-primary font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-amber-400 transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span>Events Listing</span>
              <span className="text-[var(--border-color)]">/</span>
              <span className="text-[var(--text-secondary)]">{event.city}</span>
            </Link>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[var(--border-color)] bg-white/5 hover:bg-white/10 hover:border-amber-400/40 text-[var(--text-secondary)] hover:text-amber-400 text-xs font-primary font-bold uppercase tracking-wider transition-all cursor-pointer"
              title="Share event link"
            >
              <Share2 size={13} />
              <span>Share</span>
            </button>
          </div>

          {/* Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-left">

              {/* Status & Category Pills */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-primary font-extrabold tracking-widest uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Sparkles size={11} className="text-amber-400" />
                  {event.category ? event.category.toUpperCase() : "FEATURED EVENT"}
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-primary font-bold tracking-widest uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE TICKETING
                </span>

                {event.isFeatured && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-primary font-bold tracking-widest uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    <Flame size={11} className="text-rose-400" /> SELLING OUT FAST
                  </span>
                )}

                {event.dateIsTentative && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-primary font-bold tracking-widest uppercase bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                    <Clock size={11} /> DATE TENTATIVE
                  </span>
                )}
              </div>

              {/* Event Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-primary uppercase tracking-tight leading-[1.05] text-[var(--text-primary)]">
                {event.name}
              </h1>

              {/* Event Excerpt / Summary */}
              <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed font-secondary max-w-2xl">
                {event.summary || event.description.replace(/<[^>]+>/g, " ").slice(0, 220).trim() + "..."}
              </p>

              {/* Key Specs Capsule Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
                <div className="bg-white/[0.03] border border-[var(--border-color)] rounded-2xl p-3.5 flex flex-col gap-1 backdrop-blur-sm">
                  <span className="flex items-center gap-1.5 text-[8.5px] font-primary font-bold tracking-wider text-amber-400/80 uppercase">
                    <Calendar size={12} className="text-amber-400 shrink-0" /> Date
                  </span>
                  <span className="text-xs sm:text-sm font-black font-primary text-[var(--text-primary)] uppercase truncate">
                    {event.date}
                  </span>
                  {event.time && (
                    <span className="text-[10px] text-[var(--text-muted)] font-secondary truncate">
                      {event.time}
                    </span>
                  )}
                </div>

                <div className="bg-white/[0.03] border border-[var(--border-color)] rounded-2xl p-3.5 flex flex-col gap-1 backdrop-blur-sm">
                  <span className="flex items-center gap-1.5 text-[8.5px] font-primary font-bold tracking-wider text-amber-400/80 uppercase">
                    <MapPin size={12} className="text-amber-400 shrink-0" /> City Hub
                  </span>
                  <span className="text-xs sm:text-sm font-black font-primary text-[var(--text-primary)] uppercase truncate">
                    {event.city}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-secondary truncate">
                    {event.venue}
                  </span>
                </div>

                <div className="bg-white/[0.03] border border-[var(--border-color)] rounded-2xl p-3.5 flex flex-col gap-1 backdrop-blur-sm">
                  <span className="flex items-center gap-1.5 text-[8.5px] font-primary font-bold tracking-wider text-amber-400/80 uppercase">
                    <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" /> Rating
                  </span>
                  <span className="text-xs sm:text-sm font-black font-primary text-[var(--text-primary)] uppercase">
                    {event.rating} / 5.0
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-secondary truncate">
                    {event.reviewCount} Verified Reviews
                  </span>
                </div>

                <div className="bg-white/[0.03] border border-[var(--border-color)] rounded-2xl p-3.5 flex flex-col gap-1 backdrop-blur-sm">
                  <span className="flex items-center gap-1.5 text-[8.5px] font-primary font-bold tracking-wider text-amber-400/80 uppercase">
                    <Ticket size={12} className="text-amber-400 shrink-0" /> Passes
                  </span>
                  <span className="text-xs sm:text-sm font-black font-primary text-amber-400 uppercase">
                    {minPrice !== null ? `From ₹${minPrice.toLocaleString()}` : "Free Entry"}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-secondary font-bold">
                    Fast Check-in
                  </span>
                </div>
              </div>

              {/* Hero Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {event.ticketPrices.length > 0 && (
                  <button
                    onClick={() => setActiveWizard("booking")}
                    className="group relative overflow-hidden inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-[#170D08] px-7 py-4 rounded-2xl font-primary font-black text-xs sm:text-sm uppercase tracking-wider hover:brightness-110 shadow-[0_10px_30px_rgba(201,162,39,0.35)] transition-all cursor-pointer"
                  >
                    <Ticket size={17} />
                    <span>Book Audience Pass</span>
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                  </button>
                )}

                {event.registrationFee !== undefined && event.registrationFee > 0 && (
                  <button
                    onClick={() => setActiveWizard("registration")}
                    className="inline-flex items-center justify-center gap-2 border border-amber-500/50 hover:border-amber-400 bg-white/5 hover:bg-white/10 text-amber-300 px-6 py-4 rounded-2xl font-primary font-black text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <Trophy size={16} className="text-amber-400" />
                    <span>Register as Competitor (₹{event.registrationFee})</span>
                  </button>
                )}

                {event.ticketPrices.length > 0 && (
                  <a
                    href="#tickets"
                    className="inline-flex items-center gap-1.5 text-xs font-primary font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-amber-400 px-3 py-2 transition-colors"
                  >
                    <Sliders size={14} /> Explore Seating Tiers
                  </a>
                )}

                {activeSections.map((sec) => {
                  const hasCommercialData = event.sponsorshipTiers.length > 0 || event.stallOptions.length > 0 || event.adRates.length > 0;
                  const pillClass = "inline-flex items-center gap-1.5 text-xs font-primary font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-amber-400 px-3 py-2 transition-colors cursor-pointer";

                  if (sec.type === "pdf" && event.brochurePdfUrl) {
                    return (
                      <button key={sec.id} onClick={handleViewPdf} className={pillClass}>
                        <ExternalLink size={14} /> {sec.label || "View PDF"}
                      </button>
                    );
                  }
                  if (sec.type === "exhibit" && event.exhibitInfo && event.exhibitInfo.trim()) {
                    return (
                      <a key={sec.id} href="#exhibit" className={pillClass}>
                        <Sliders size={14} /> {sec.label || "Why Exhibit"}
                      </a>
                    );
                  }
                  if (sec.type === "visit" && event.visitInfo && event.visitInfo.trim()) {
                    return (
                      <a key={sec.id} href="#visit" className={pillClass}>
                        <Sliders size={14} /> {sec.label || "Why Visit"}
                      </a>
                    );
                  }
                  if (sec.type === "gallery" && eventGalleryItems.length > 0) {
                    return (
                      <a key={sec.id} href="#gallery" className={pillClass}>
                        <ImageIcon size={14} /> {sec.label || "Gallery"}
                      </a>
                    );
                  }
                  if ((sec.type === "book_space" || sec.type === "sponsorship") && hasCommercialData) {
                    return (
                      <a key={sec.id} href="#commercial" className={pillClass}>
                        <Sliders size={14} /> {sec.label || "Commercial"}
                      </a>
                    );
                  }
                  if (sec.type === "custom" && sec.url) {
                    return (
                      <a key={sec.id} href={sec.url} target="_blank" rel="noopener noreferrer" className={pillClass}>
                        <ExternalLink size={14} /> {sec.label}
                      </a>
                    );
                  }
                  return null;
                })}
              </div>

            </div>

            {/* Right Media Showcase Column (Single or Multiple Images / Videos) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-lg relative group">

                {/* Subtle Gold Corner Flourishes */}
                <div className="absolute -top-2.5 -left-2.5 w-6 h-6 border-t-2 border-l-2 border-amber-400/80 rounded-tl-lg z-20 pointer-events-none" />
                <div className="absolute -top-2.5 -right-2.5 w-6 h-6 border-t-2 border-r-2 border-amber-400/80 rounded-tr-lg z-20 pointer-events-none" />
                <div className="absolute -bottom-2.5 -left-2.5 w-6 h-6 border-b-2 border-l-2 border-amber-400/80 rounded-bl-lg z-20 pointer-events-none" />
                <div className="absolute -bottom-2.5 -right-2.5 w-6 h-6 border-b-2 border-r-2 border-amber-400/80 rounded-br-lg z-20 pointer-events-none" />

                {/* Main Card Frame */}
                <div className="relative rounded-[28px] overflow-hidden border border-[var(--border-color)] bg-gradient-to-b from-[#25140b] to-[#120703] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">

                  {/* Filter & Counter Bar (rendered if multiple items or mixed types exist) */}
                  {(heroMediaItems.length > 1 || (imageCount > 0 && videoCount > 0)) && (
                    <div className="flex items-center justify-between gap-2 px-1 pb-2.5 pt-0.5">
                      {/* Filter Pills */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleSelectFilter("all")}
                          className={`px-2.5 py-1 rounded-lg text-[9px] font-primary font-bold uppercase tracking-wider transition-all cursor-pointer ${mediaFilter === "all"
                              ? "bg-amber-500 text-[#170D08] font-black shadow-sm"
                              : "bg-white/5 hover:bg-white/10 text-[var(--text-muted)]"
                            }`}
                        >
                          All ({heroMediaItems.length})
                        </button>
                        {imageCount > 0 && (
                          <button
                            type="button"
                            onClick={() => handleSelectFilter("image")}
                            className={`px-2.5 py-1 rounded-lg text-[9px] font-primary font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${mediaFilter === "image"
                                ? "bg-amber-500 text-[#170D08] font-black shadow-sm"
                                : "bg-white/5 hover:bg-white/10 text-[var(--text-muted)]"
                              }`}
                          >
                            <ImageIcon size={10} /> Photos ({imageCount})
                          </button>
                        )}
                        {videoCount > 0 && (
                          <button
                            type="button"
                            onClick={() => handleSelectFilter("video")}
                            className={`px-2.5 py-1 rounded-lg text-[9px] font-primary font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${mediaFilter === "video"
                                ? "bg-red-500 text-white font-black shadow-sm"
                                : "bg-white/5 hover:bg-white/10 text-[var(--text-muted)]"
                              }`}
                          >
                            <Film size={10} /> Videos ({videoCount})
                          </button>
                        )}
                      </div>

                      {/* Counter & Lightbox Action */}
                      <div className="flex items-center gap-2">
                        {currentMedia && (
                          <span className="text-[10px] font-primary text-[var(--text-muted)] font-bold">
                            {safeIndex + 1} / {filteredMedia.length}
                          </span>
                        )}
                        {currentMedia && (
                          <button
                            type="button"
                            onClick={() => setIsLightboxOpen(true)}
                            className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
                            title="Open Cinema View"
                          >
                            <Maximize2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Main Media Viewport */}
                  <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden bg-black/60 border border-white/10 group/player">
                    {currentMedia ? (
                      currentMedia.type === "video" ? (
                        isPlayingInlineVideo ? (
                          (() => {
                            const embedUrl = getEmbedVideoUrl(currentMedia.url);
                            return embedUrl ? (
                              <iframe
                                src={embedUrl}
                                title={currentMedia.title}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={currentMedia.url}
                                controls
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                              />
                            );
                          })()
                        ) : (
                          /* Video Poster with Glowing Play Button */
                          <div
                            onClick={() => setIsPlayingInlineVideo(true)}
                            className="w-full h-full relative cursor-pointer group/vid"
                          >
                            {currentMedia.poster ? (
                              <img
                                src={currentMedia.poster}
                                alt={currentMedia.title}
                                className="w-full h-full object-cover group-hover/vid:scale-105 transition-transform duration-700 brightness-90"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#2f180c] to-[#0c0502] flex items-center justify-center">
                                <Film size={44} className="text-amber-500/30" />
                              </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20 group-hover/vid:from-black/70 transition-colors" />

                            {/* Centered Glowing Play Button */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 pointer-events-none">
                              <div className="w-16 h-16 rounded-full bg-amber-500 group-hover/vid:bg-amber-400 text-[#170D08] flex items-center justify-center pl-1 shadow-[0_0_30px_rgba(245,158,11,0.6)] group-hover/vid:scale-110 transition-transform duration-300">
                                <Play size={28} className="fill-[#170D08]" />
                              </div>
                              <span className="text-[11px] font-primary font-black uppercase tracking-widest text-amber-300 drop-shadow">
                                Play Official Video
                              </span>
                            </div>

                            {/* Video Pill Top Left */}
                            <div className="absolute top-3 left-3 bg-red-600/90 text-white text-[8px] font-primary font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                              <Film size={10} /> Video Feature
                            </div>
                          </div>
                        )
                      ) : (
                        /* Image Slide */
                        <div
                          onClick={() => setIsLightboxOpen(true)}
                          className="w-full h-full relative cursor-pointer overflow-hidden"
                          title="Click to expand"
                        >
                          <img
                            src={currentMedia.url}
                            alt={currentMedia.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                          {/* Top right quick zoom badge */}
                          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/20 text-white text-[8px] font-primary font-bold px-2 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Maximize2 size={10} /> Expand
                          </div>
                        </div>
                      )
                    ) : (
                      /* Fallback Empty Showcase */
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
                        <Ticket size={40} className="text-amber-400/40" />
                        <span className="text-xs uppercase tracking-widest font-primary">Official Event Showcase</span>
                      </div>
                    )}

                    {/* Top Right Festival Badge */}
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md border border-white/20 text-white text-[8px] font-primary font-black px-2.5 py-1 rounded-full uppercase tracking-wider pointer-events-none">
                      Official Festival Event
                    </div>

                    {/* Overlay Info at Bottom */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-white pointer-events-none z-10">
                      <div className="flex flex-col">
                        <span className="text-[7.5px] font-primary font-bold uppercase tracking-widest text-amber-300">
                          {event.venue}
                        </span>
                        <span className="text-xs font-black font-primary uppercase tracking-tight drop-shadow truncate max-w-[200px]">
                          {currentMedia ? currentMedia.title : `${event.city} Arena`}
                        </span>
                      </div>
                      <div className="bg-amber-500 text-[#170D08] px-2.5 py-1 rounded-lg text-[9px] font-black font-primary uppercase tracking-wider shrink-0 shadow-md">
                        Digital QR Entry
                      </div>
                    </div>

                    {/* Prev / Next Slide Arrows (if more than 1 item) */}
                    {hasMultipleMedia && !isPlayingInlineVideo && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrevMedia();
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-amber-500 hover:text-[#170D08] text-white border border-white/20 flex items-center justify-center transition-all opacity-80 hover:opacity-100 cursor-pointer z-20 shadow-lg"
                          title="Previous media"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNextMedia();
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-amber-500 hover:text-[#170D08] text-white border border-white/20 flex items-center justify-center transition-all opacity-80 hover:opacity-100 cursor-pointer z-20 shadow-lg"
                          title="Next media"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Filmstrip (if more than 1 item) */}
                  {hasMultipleMedia && (
                    <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1 px-1 no-scrollbar">
                      {filteredMedia.map((item, idx) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setActiveMediaIndex(idx);
                            setIsPlayingInlineVideo(false);
                          }}
                          className={`relative w-12 h-10 rounded-lg overflow-hidden shrink-0 border transition-all cursor-pointer ${idx === safeIndex
                              ? "border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow-md"
                              : "border-white/10 opacity-60 hover:opacity-100"
                            }`}
                        >
                          {item.type === "video" ? (
                            <div className="w-full h-full bg-[#1e0f07] flex items-center justify-center relative">
                              {item.poster && (
                                <img src={item.poster} alt="" className="w-full h-full object-cover opacity-60" />
                              )}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Play size={10} className="text-amber-400 fill-amber-400" />
                              </div>
                            </div>
                          ) : (
                            <img src={item.url} alt="" className="w-full h-full object-cover" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

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
                          {event.organizer.name}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveWizard("booking")}
                      className="text-[9.5px] font-primary font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      Instant Pass <ArrowRight size={11} />
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. STICKY SUB-NAV STRIP                                                  */}
      {/* ========================================================================= */}
      <nav className="sticky top-16 z-30 bg-[#120B07]/85 backdrop-blur-xl border-b border-amber-500/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] pt-3 pb-3">
        <div className="container max-w-7xl mx-auto px-4 flex items-center justify-between gap-4 overflow-x-auto py-2.5 no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {[
              { id: "experience", label: "Experience" },
              ...(event.exhibitInfo && event.exhibitInfo.trim() ? [{ id: "exhibit", label: "Why Exhibit" }] : []),
              ...(event.visitInfo && event.visitInfo.trim() ? [{ id: "visit", label: "Why Visit" }] : []),
              ...(event.scheduleDays.length > 0 ? [{ id: "schedule", label: "Schedule" }] : []),
              ...(event.ticketPrices.length > 0 ? [{ id: "tickets", label: "Tickets & Arena" }] : []),
              ...(event.headliners.length > 0 ? [{ id: "headliners", label: "Headliners" }] : []),
              ...(eventGalleryItems.length > 0 ? [{ id: "gallery", label: "Gallery" }] : []),
              { id: "venue", label: "Venue & Travel" },
              ...(event.rules && event.rules.length > 0 ? [{ id: "rules", label: "Guidelines" }] : []),
              ...(event.faqs && event.faqs.length > 0 ? [{ id: "faq", label: "FAQs" }] : []),
              ...(event.sponsorshipTiers.length > 0 || event.stallOptions.length > 0 || event.adRates.length > 0
                ? [{ id: "commercial", label: "Commercial" }] : []),
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

          {event.ticketPrices.length > 0 && (
            <button
              onClick={() => setActiveWizard("booking")}
              className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-[#170D08] px-4.5 py-1.5 rounded-full font-primary font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all transform hover:-translate-y-0.5 shrink-0 cursor-pointer outline-none focus:outline-none"
            >
              <Ticket size={13} className="shrink-0" />
              <span>Book Pass</span>
            </button>
          )}
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 3. MAIN DUAL-COLUMN CONTENT LAYOUT                                       */}
      {/* ========================================================================= */}
      <div className="container max-w-7xl mx-auto px-4 !py-10 !md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* LEFT 8 COLUMNS: ALL PRIMARY EVENT SECTIONS */}
          <div className="lg:col-span-8 flex flex-col gap-12 sm:gap-16">

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 1: THE EXPERIENCE                                         */}
            {/* ----------------------------------------------------------------- */}
            <section id="experience" className="scroll-mt-36 flex flex-col gap-6 text-left">
              <div className="flex flex-col gap-2 border-b border-white/[0.08] pb-5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-bold tracking-[0.2em] uppercase font-primary">
                    <Sparkles size={11} className="text-amber-400" />
                    01 • Festival Experience
                  </span>
                  <span className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/20 via-white/5 to-transparent" />
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-primary uppercase tracking-tight text-white mt-1">
                  {event.name}
                </h2>
                {event.summary && (
                  <p className="text-xs sm:text-sm text-stone-400 font-secondary mt-1 max-w-3xl leading-relaxed">
                    {event.summary}
                  </p>
                )}
              </div>

              {/* Rich Description */}
              <div className="bg-[#160E09]/80 backdrop-blur-md border border-amber-500/15 rounded-[28px] p-6 sm:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.35)] relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <RichTextContent
                  html={event.description}
                  className="text-stone-300 text-sm sm:text-[15px] leading-relaxed font-secondary space-y-4"
                />
              </div>

              {/* Dynamic Feature Highlights — numbered index list */}
              <div className="flex flex-col">
                {[
                  {
                    title: `${event.category || "Official Gathering"} • ${event.city}`,
                    desc: `Hosted at ${event.venue}. Fast-track attendee turnstiles and organized entry zones.`,
                    tags: ["VENUE", "CITY HUB", "FAST-TRACK ENTRY"],
                  },
                  {
                    title: `Schedule: ${event.date}`,
                    desc: `Program gates open at ${event.time || "18:00"}. Please carry your digital QR ticket for swift check-in.`,
                    tags: ["GATE TIMING", "DIGITAL QR", "SWIFT CHECK-IN"],
                  },
                  {
                    title: event.ticketPrices.length > 0 ? `${event.ticketPrices.length} Access Tier${event.ticketPrices.length > 1 ? "s" : ""}` : "General Admission",
                    desc: event.ticketPrices.length > 0
                      ? `Passes starting from ₹${minPrice !== null ? minPrice.toLocaleString() : "Free"}. Instant digital confirmation.`
                      : "Open attendance with advance registration pass.",
                    tags: [event.ticketPrices.length > 0 ? "ACCESS TIERS" : "GENERAL ADMISSION", "INSTANT CONFIRMATION", "DIGITAL PASS"],
                  },
                  {
                    title: `Curated By ${event.organizer.name}`,
                    desc: `${event.organizer.contact ? `${event.organizer.contact}. ` : ""}Official event coordinators ensuring secure access & visitor support.`,
                    tags: ["VERIFIED ORGANIZER", "SECURE ACCESS", "VISITOR SUPPORT"],
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col sm:flex-row gap-4 sm:gap-8 py-8 text-left ${idx > 0 ? "border-t border-[var(--border-color)]" : ""}`}
                  >
                    <span className="font-primary italic font-black text-4xl sm:text-5xl text-transparent shrink-0 sm:w-24" style={{ WebkitTextStroke: "1.5px #D97706" }}>
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="flex flex-col gap-2.5">
                      <h3 className="text-lg sm:text-xl font-black font-primary text-[var(--text-primary)]">
                        {item.title}
                      </h3>
                      <p className="text-[13px] text-[var(--text-secondary)] font-secondary leading-relaxed max-w-xl">
                        {item.desc}
                      </p>
                      <div className="flex flex-wrap gap-2.5 mt-1.5">
                        {item.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[9.5px] font-primary font-bold tracking-widest uppercase text-amber-400 border border-amber-500/30 rounded-md px-3 py-1.5"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 1B: WHY EXHIBIT                                           */}
            {/* ----------------------------------------------------------------- */}
            {event.exhibitInfo && event.exhibitInfo.trim() && (() => {
              const { intro, items } = parseInfoBlock(event.exhibitInfo);
              return (
                <section id="exhibit" className="scroll-mt-32 flex flex-col gap-6 text-left">
                  <div className="flex flex-col gap-1.5 border-b border-[var(--border-color)] pb-4">
                    <span className="text-[9px] font-primary font-bold tracking-[0.2em] text-amber-400 uppercase">
                      {"✦ EXHIBITOR PLATFORM"}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black font-primary uppercase tracking-tight text-[var(--text-primary)]">
                      Why Exhibit
                    </h2>
                    {intro && (
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-secondary mt-1 max-w-2xl leading-relaxed">
                        {intro}
                      </p>
                    )}
                  </div>

                  {items.length > 0 && (
                    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[28px] p-6 sm:p-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                            <span className="text-xs sm:text-[13px] text-[var(--text-secondary)] font-secondary leading-relaxed">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              );
            })()}

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 1C: WHY VISIT                                             */}
            {/* ----------------------------------------------------------------- */}
            {event.visitInfo && event.visitInfo.trim() && (() => {
              const { intro, items } = parseInfoBlock(event.visitInfo);
              return (
                <section id="visit" className="scroll-mt-32 flex flex-col gap-6 text-left">
                  <div className="flex flex-col gap-1.5 border-b border-[var(--border-color)] pb-4">
                    <span className="text-[9px] font-primary font-bold tracking-[0.2em] text-amber-400 uppercase">
                      {"✦ VISITOR PROFILE"}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black font-primary uppercase tracking-tight text-[var(--text-primary)]">
                      Why Visit
                    </h2>
                    {intro && (
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-secondary mt-1 max-w-2xl leading-relaxed">
                        {intro}
                      </p>
                    )}
                  </div>

                  {items.length > 0 && (
                    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[28px] p-6 sm:p-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                            <span className="text-xs sm:text-[13px] text-[var(--text-secondary)] font-secondary leading-relaxed">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              );
            })()}

            {/* ----------------------------------------------------------------- */}
            {/* OFFICIAL FOOD EXPO: SPONSORSHIP & DIRECTORY BLUEPRINTS            */}
            {/* ----------------------------------------------------------------- */}
            {(event.slug?.includes("catering") || event.slug?.includes("food") || event.slug === "udaipur-hospitality-catering-tourism-food-festival-2025") && (
              <section className="flex flex-col gap-6 text-left">
                {/* Header & Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-primary font-bold tracking-[0.2em] text-amber-400 uppercase">
                      {"✦ TASTE · TRADE · GROW · OFFICIAL BLUEPRINT"}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black font-primary uppercase tracking-tight text-[var(--text-primary)]">
                      Food Expo Official Ecosystem
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-secondary mt-0.5">
                      Explore official Sponsorship Tiers (7 Categories &amp; 9 Benefits) and Exhibitor &amp; Visitor Profiles.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* View Switcher Pills */}
                    <div className="flex bg-white/5 border border-white/10 p-1 rounded-2xl gap-1">
                      <button
                        type="button"
                        onClick={() => setFoodExpoSectionTab("sponsorship")}
                        className={`px-3.5 py-1.5 rounded-xl text-[10px] font-primary font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          foodExpoSectionTab === "sponsorship"
                            ? "bg-amber-500 text-[#170D08] font-black shadow-md"
                            : "text-[var(--text-secondary)] hover:text-white"
                        }`}
                      >
                        Sponsorship ({foodExpoConfig.sponsorshipTiers.length} Tiers)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFoodExpoSectionTab("directory")}
                        className={`px-3.5 py-1.5 rounded-xl text-[10px] font-primary font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          foodExpoSectionTab === "directory"
                            ? "bg-amber-500 text-[#170D08] font-black shadow-md"
                            : "text-[var(--text-secondary)] hover:text-white"
                        }`}
                      >
                        Exhibitor Directory
                      </button>
                    </div>

                    {foodExpoConfig.portals.map((p, pIdx) => (
                      <a
                        key={pIdx}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-primary uppercase tracking-wider transition-colors ${
                          pIdx === 0
                            ? "bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400"
                            : "bg-white/5 hover:bg-white/10 border border-white/15 text-stone-300 hover:text-white"
                        }`}
                      >
                        <span>{p.name.replace("www.", "")}</span>
                        <ExternalLink size={12} />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Tab 1: Sponsorship Categories & Benefits */}
                {foodExpoSectionTab === "sponsorship" ? (
                  <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[var(--bg-card)] border border-amber-500/25 rounded-[32px] p-6 sm:p-8 shadow-[0_15px_45px_rgba(0,0,0,0.35)]">
                      {/* Left: 7 Sponsorship Categories */}
                      <div className="lg:col-span-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                              <Trophy size={16} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-primary font-bold text-amber-400 uppercase tracking-widest">
                                Tier Breakdown
                              </span>
                              <h3 className="text-base font-black font-primary uppercase text-white">
                                Sponsorship Categories
                              </h3>
                            </div>
                          </div>
                          <span className="text-[10px] text-stone-400 font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                            {foodExpoConfig.sponsorshipTiers.length} Tiers
                          </span>
                        </div>

                        <div className="flex flex-col gap-2">
                          {foodExpoConfig.sponsorshipTiers.map((cat) => (
                            <div
                              key={cat.rank || cat.no}
                              className="group flex flex-col gap-2.5 px-3.5 py-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-amber-500/40 transition-all duration-200"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center text-white bg-gradient-to-br ${cat.bg} shadow-md shrink-0`}>
                                  {cat.rank || cat.no}
                                </span>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs sm:text-sm font-black text-white font-primary uppercase tracking-tight whitespace-nowrap">
                                    {cat.name}
                                  </span>
                                  <span className="text-[9px] text-stone-400 font-secondary truncate">
                                    {cat.desc || cat.tag}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-2 pl-10">
                                <span className="text-xs sm:text-sm font-black font-mono text-amber-300 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                                  {cat.price}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setCommercialInquiry({ title: `${cat.name} Sponsorship`, category: "Sponsorship", amount: cat.price })}
                                  className="inline-flex px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-[#170D08] text-[9.5px] font-primary font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                  Inquire
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Middle Slogan */}
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/25 text-center shadow-inner">
                          <p className="text-xs sm:text-sm font-bold text-amber-300 font-serif italic tracking-wide">
                            &ldquo;{foodExpoConfig.slogans.primary}&rdquo;
                          </p>
                        </div>
                      </div>

                      {/* Right: 9 Sponsorship Benefits */}
                      <div className="lg:col-span-7 flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                              <Star size={16} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-primary font-bold text-amber-400 uppercase tracking-widest">
                                Guaranteed Privileges
                              </span>
                              <h3 className="text-base font-black font-primary uppercase text-white">
                                Sponsorship Benefits &amp; Deliverables
                              </h3>
                            </div>
                          </div>
                          <span className="text-[10px] text-stone-400 font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                            {foodExpoConfig.benefits.length} Deliverables
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {foodExpoConfig.benefits.map((benefit, bIdx) => (
                            <div
                              key={bIdx}
                              className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs text-stone-300 leading-snug font-secondary hover:border-amber-500/30 transition-colors"
                            >
                              <span className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                {bIdx + 1}
                              </span>
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>

                        {/* Bottom Tagline & Poster CTA */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10 mt-auto">
                          <span className="text-xs text-stone-400 italic font-primary">
                            {foodExpoConfig.slogans.motto}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setShowFoodExpoLightbox("sponsorship")}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-[#170D08] font-bold text-xs font-primary uppercase tracking-wider hover:bg-amber-400 transition-colors cursor-pointer shadow-md"
                            >
                              <Maximize2 size={12} />
                              <span>View Poster Chart</span>
                            </button>
                            <a
                              href="#commercial"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-stone-300 hover:text-white text-xs font-primary font-bold uppercase tracking-wider transition-colors"
                            >
                              <span>Explore Stalls &amp; Ads</span>
                              <ArrowRight size={12} />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Visual Poster Banner */}
                    <div
                      onClick={() => setShowFoodExpoLightbox("sponsorship")}
                      className="group relative rounded-[28px] overflow-hidden border border-amber-500/30 shadow-[0_15px_45px_rgba(0,0,0,0.4)] bg-[#120B07] p-2 sm:p-4 cursor-pointer flex items-center justify-center max-h-[520px] aspect-[16/9] sm:aspect-[16/8]"
                    >
                      <img
                        src={foodExpoConfig.images.sponsorshipPoster}
                        alt="Food Expo Sponsorship Categories &amp; Benefits Poster"
                        className="w-full h-full max-h-full max-w-full object-contain rounded-2xl group-hover:scale-[1.01] transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[28px]">
                        <span className="px-4 py-2 rounded-xl bg-amber-500 text-[#170D08] font-primary font-black text-xs uppercase tracking-wider shadow-2xl flex items-center gap-2">
                          <Maximize2 size={14} /> Click to Enlarge Sponsorship Poster
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Tab 2: Exhibitor & Visitor Directory */
                  <div className="flex flex-col gap-4">
                    <div
                      onClick={() => setShowFoodExpoLightbox("directory")}
                      className="group relative rounded-[28px] overflow-hidden border border-amber-500/20 shadow-[0_15px_45px_rgba(0,0,0,0.4)] bg-[#120B07] p-2 sm:p-4 cursor-pointer flex items-center justify-center max-h-[520px] aspect-[16/9] sm:aspect-[16/8]"
                    >
                      <img
                        src={foodExpoConfig.images.chartPoster}
                        alt="Food Expo Exhibitor &amp; Visitor Directory"
                        className="w-full h-full max-h-full max-w-full object-contain rounded-2xl group-hover:scale-[1.01] transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[28px]">
                        <span className="px-4 py-2 rounded-xl bg-amber-500 text-[#170D08] font-primary font-black text-xs uppercase tracking-wider shadow-2xl flex items-center gap-2">
                          <Maximize2 size={14} /> Click to Enlarge Directory Poster
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 2: PROGRAM SCHEDULE                                       */}
            {/* ----------------------------------------------------------------- */}
            {event.scheduleDays.length > 0 && (
              <section id="schedule" className="scroll-mt-32 flex flex-col gap-6 text-left">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-color)] pb-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-primary font-bold tracking-[0.2em] text-amber-400 uppercase">
                      {"✦ 02. TIMETABLE"}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black font-primary uppercase tracking-tight text-[var(--text-primary)]">
                      Festival Program Schedule
                    </h2>
                  </div>

                  {/* Day Pills */}
                  <div className="flex bg-white/5 border border-[var(--border-color)] p-1 rounded-2xl gap-1">
                    {event.scheduleDays.map((day, idx) => (
                      <button
                        key={idx}
                        onClick={() => setScheduleTab(idx)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-primary font-bold uppercase tracking-wider transition-all cursor-pointer ${scheduleTab === idx
                            ? "bg-amber-500 text-[#170D08] font-black shadow-md"
                            : "text-[var(--text-secondary)] hover:text-white"
                          }`}
                      >
                        {day.dayLabel}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeline Component */}
                {event.scheduleDays[scheduleTab] && (
                  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[28px] p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.3)] flex flex-col gap-6">
                    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                      <span className="text-xs font-black font-primary text-amber-400 uppercase tracking-widest">
                        {event.scheduleDays[scheduleTab].dayLabel} Itinerary
                      </span>
                      <span className="text-[10px] font-primary font-bold uppercase text-[var(--text-muted)]">
                        {event.scheduleDays[scheduleTab].items.length} Track Sessions
                      </span>
                    </div>

                    <div className="flex flex-col gap-6 relative before:absolute before:left-3 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-amber-400/40 before:via-amber-500/20 before:to-transparent">
                      {event.scheduleDays[scheduleTab].items.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4 sm:gap-6 relative pl-8 group">
                          {/* Dot on Timeline */}
                          <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-[#170D08] border-2 border-amber-400 group-hover:scale-125 group-hover:bg-amber-400 transition-all shadow-[0_0_8px_rgba(201,162,39,0.5)]" />

                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 w-full bg-white/[0.02] hover:bg-white/[0.05] border border-[var(--border-color)] group-hover:border-amber-500/40 p-4 rounded-2xl transition-all">
                            <div className="flex flex-col gap-1 text-left">
                              <span className="w-fit text-[9px] font-primary font-black tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md uppercase">
                                {item.time}
                              </span>
                              <h4 className="text-sm sm:text-base font-black font-primary text-[var(--text-primary)] uppercase tracking-tight mt-1">
                                {item.title}
                              </h4>
                              <p className="text-xs text-[var(--text-secondary)] font-secondary leading-relaxed mt-0.5">
                                {item.desc}
                              </p>
                            </div>
                            <span className="text-[9px] font-primary font-bold uppercase tracking-wider text-[var(--text-muted)] shrink-0 self-start sm:self-center">
                              Session #{idx + 1}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 3: INTERACTIVE STADIUM ARENA & SEATING ZONES              */}
            {/* ----------------------------------------------------------------- */}
            {event.ticketPrices.length > 0 && (
              <section id="tickets" className="scroll-mt-32 flex flex-col gap-6 text-left">
                <div className="flex flex-col gap-1.5 border-b border-[var(--border-color)] pb-4">
                  <span className="text-[9px] font-primary font-bold tracking-[0.2em] text-amber-400 uppercase">
                    {"✦ 03. TICKETS & ARENA ACCESS"}
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h2 className="text-xl sm:text-2xl font-black font-primary uppercase tracking-tight text-[var(--text-primary)]">
                      Stadium Arena Map &amp; Passes
                    </h2>
                    <span className="text-xs text-[var(--text-muted)] font-secondary">
                      Select any zone to preview access &amp; perks
                    </span>
                  </div>
                </div>

                {/* Unique Modern Interactive Arena Visualizer */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[28px] p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.3)] flex flex-col gap-6">

                  {/* SVG Stadium Diagram */}
                  <div className="relative w-full rounded-2xl bg-[#0e0704] border border-[var(--border-color)] p-6 overflow-hidden flex flex-col items-center justify-center">
                    <div className="absolute top-3 left-4 text-[8px] font-primary font-bold tracking-widest text-[var(--text-muted)] uppercase">
                      ARENA SIGHTLINE VISUALIZER
                    </div>
                    <div className="absolute top-3 right-4 flex items-center gap-2 text-[8.5px] font-primary font-bold text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      INTERACTIVE SEATING STADIUM
                    </div>

                    <div className="w-full max-w-lg my-4">
                      <svg viewBox="0 0 500 240" className="w-full h-auto drop-shadow-xl">
                        <defs>
                          <linearGradient id="stageGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#C9A227" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#2A1510" stopOpacity="0.4" />
                          </linearGradient>
                          <radialGradient id="arenaLight" cx="50%" cy="20%" r="80%">
                            <stop offset="0%" stopColor="#C9A227" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                          </radialGradient>
                        </defs>

                        {/* Background Arena Aura */}
                        <path d="M 50 200 A 200 130 0 0 1 450 200 Z" fill="url(#arenaLight)" />

                        {/* Outer General Circle Zone */}
                        <path
                          d="M 60 210 A 190 120 0 0 1 440 210 L 400 210 A 150 90 0 0 0 100 210 Z"
                          className={`transition-all duration-300 cursor-pointer ${selectedZone === 2 || hoveredZone === 2
                              ? "fill-amber-500/40 stroke-amber-400 stroke-2"
                              : "fill-white/5 stroke-white/20 hover:fill-amber-500/20"
                            }`}
                          onClick={() => event.ticketPrices[2] && setSelectedZone(2)}
                          onMouseEnter={() => setHoveredZone(2)}
                          onMouseLeave={() => setHoveredZone(null)}
                        />

                        {/* Mid Tier / Club Stand */}
                        <path
                          d="M 105 205 A 145 85 0 0 1 395 205 L 355 205 A 110 60 0 0 0 145 205 Z"
                          className={`transition-all duration-300 cursor-pointer ${selectedZone === 1 || hoveredZone === 1
                              ? "fill-amber-500/50 stroke-amber-400 stroke-2"
                              : "fill-white/10 stroke-white/25 hover:fill-amber-500/25"
                            }`}
                          onClick={() => event.ticketPrices[1] && setSelectedZone(1)}
                          onMouseEnter={() => setHoveredZone(1)}
                          onMouseLeave={() => setHoveredZone(null)}
                        />

                        {/* VIP Lounge / Front Pit Zone */}
                        <path
                          d="M 150 200 A 105 55 0 0 1 350 200 L 310 200 A 70 30 0 0 0 190 200 Z"
                          className={`transition-all duration-300 cursor-pointer ${selectedZone === 0 || hoveredZone === 0
                              ? "fill-amber-400/60 stroke-amber-300 stroke-2"
                              : "fill-amber-500/20 stroke-amber-500/40 hover:fill-amber-400/40"
                            }`}
                          onClick={() => event.ticketPrices[0] && setSelectedZone(0)}
                          onMouseEnter={() => setHoveredZone(0)}
                          onMouseLeave={() => setHoveredZone(null)}
                        />

                        {/* Front Stage Box */}
                        <rect
                          x="190"
                          y="155"
                          width="120"
                          height="24"
                          rx="4"
                          fill="url(#stageGlow)"
                          stroke="#E4C465"
                          strokeWidth="1.5"
                        />
                        <text
                          x="250"
                          y="171"
                          textAnchor="middle"
                          fill="#F5EEE2"
                          fontSize="9.5"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                          letterSpacing="1.5"
                        >
                          ✦ MAIN STAGE
                        </text>

                        {/* Zone Labels */}
                        <text x="250" y="196" textAnchor="middle" fill="#E4C465" fontSize="8" fontWeight="bold" letterSpacing="1">
                          VIP LOUNGE / PIT
                        </text>
                        <text x="250" y="142" textAnchor="middle" fill="#CBB9A0" fontSize="7.5" fontWeight="bold" letterSpacing="0.8">
                          CLUB DECK / MEZZANINE
                        </text>
                        <text x="250" y="105" textAnchor="middle" fill="#8F7A66" fontSize="7.5" fontWeight="bold" letterSpacing="0.8">
                          GENERAL ARENA ENCLOSURE
                        </text>
                      </svg>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 text-[9.5px] font-primary font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-amber-400/80" /> VIP Zone
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-white/20" /> Club Deck
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-white/10" /> General Enclosure
                      </span>
                    </div>
                  </div>

                  {/* Luxury Ticket Tier Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.ticketPrices.map((ticket, idx) => {
                      const isSelected = selectedZone === idx;
                      const availableCount = ticket.available ?? 100;
                      const isSoldOut = availableCount <= 0;
                      const ticketPrice = ticket.price ?? 0;
                      const ticketTitle = ticket.type || (ticket as any).tier || `Tier ${idx + 1}`;
                      return (
                        <div
                          key={`${ticketTitle}-${idx}`}
                          onClick={() => setSelectedZone(idx)}
                          className={`relative rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between gap-5 cursor-pointer overflow-hidden ${isSelected
                              ? "bg-gradient-to-br from-[#2f190e] via-[#1f1008] to-[#120703] border-amber-400 shadow-[0_10px_35px_rgba(201,162,39,0.25)] scale-[1.01]"
                              : "bg-white/[0.02] hover:bg-white/[0.05] border-[var(--border-color)] hover:border-amber-500/40 text-[var(--text-secondary)]"
                            }`}
                        >
                          {/* Ticket Cutout Notches (Left & Right) */}
                          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--bg-main)] border-r border-[var(--border-color)] z-10 pointer-events-none" />
                          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--bg-main)] border-l border-[var(--border-color)] z-10 pointer-events-none" />

                          {/* Selected Checkmark Badge */}
                          {isSelected && (
                            <span className="absolute top-4 right-4 bg-amber-400 text-[#170D08] px-2.5 py-0.5 rounded-full text-[8.5px] font-black font-primary uppercase tracking-wider flex items-center gap-1 shadow">
                              <Check size={11} strokeWidth={3} /> Selected Tier
                            </span>
                          )}

                          {/* Header Tier Info */}
                          <div className="flex flex-col text-left gap-1">
                            <span className={`text-[8.5px] font-primary font-bold tracking-widest uppercase ${isSelected ? "text-amber-400" : "text-[var(--text-muted)]"
                              }`}>
                              Tier #{idx + 1} • Gate Access
                            </span>
                            <h3 className="text-base sm:text-lg font-black font-primary uppercase tracking-tight text-[var(--text-primary)]">
                              {ticketTitle}
                            </h3>
                            {ticket.description && (
                              <p className="text-xs text-[var(--text-secondary)] font-secondary mt-1 leading-relaxed line-clamp-2">
                                {ticket.description}
                              </p>
                            )}
                          </div>

                          {/* Pricing & Stock Row */}
                          <div className="flex items-end justify-between pt-4 border-t border-dashed border-[var(--border-color)]">
                            <div className="flex flex-col">
                              <span className="text-[8px] font-primary uppercase tracking-wider text-[var(--text-muted)]">
                                Price Per Attendee
                              </span>
                              <span className="text-xl sm:text-2xl font-black font-primary text-amber-400">
                                ₹{ticketPrice.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex flex-col items-end">
                              <span className={`text-[9px] font-primary font-bold tracking-wider uppercase ${isSoldOut ? "text-rose-400" : isSelected ? "text-amber-400" : "text-emerald-400"
                                }`}>
                                ● {isSoldOut ? "SOLD OUT" : `${availableCount.toLocaleString()} PASSES LEFT`}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedZone(idx);
                                  setActiveWizard("booking");
                                }}
                                disabled={isSoldOut}
                                className="mt-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#170D08] px-3.5 py-1.5 rounded-xl text-[9.5px] font-primary font-black uppercase tracking-wider transition-colors shadow-sm"
                              >
                                {isSoldOut ? "Sold Out" : "Book Tier"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Included Perks for Selected Tier */}
                  {selectedTicketInfo && (
                    <div className="bg-white/[0.02] border border-[var(--border-color)] rounded-2xl p-5 text-left flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-primary font-bold tracking-widest uppercase text-amber-400">
                          Included Deliverables for {selectedTicketInfo.type}:
                        </span>
                        <span className="text-[9px] text-[var(--text-muted)] font-primary">
                          Gate Clearance: Fast-Track QR
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {(selectedTicketInfo.description
                          ? selectedTicketInfo.description.split(/[,;\n]/).map(s => s.trim()).filter(Boolean)
                          : [
                            `Admission clearance for ${event.name}`,
                            `Designated ${selectedTicketInfo.type} access enclosure at ${event.venue}`,
                            `Personalized digital E-Pass with encrypted QR token`,
                            `Turnstile check-in assistance on ${event.date}`
                          ]
                        ).map((perk, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)] font-secondary">
                            <span className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                              <Check size={10} strokeWidth={3} />
                            </span>
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </section>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 4: HEADLINERS & PERFORMERS                                */}
            {/* ----------------------------------------------------------------- */}
            {event.headliners.length > 0 && (
              <section id="headliners" className="scroll-mt-32 flex flex-col gap-6 text-left">
                <div className="flex flex-col gap-1.5 border-b border-[var(--border-color)] pb-4">
                  <span className="text-[9px] font-primary font-bold tracking-[0.2em] text-amber-400 uppercase">
                    {"✦ 04. HEADLINERS & GUESTS"}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black font-primary uppercase tracking-tight text-[var(--text-primary)]">
                    Featured Lineup &amp; Keynotes
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                  {event.headliners.map((artist, idx) => (
                    <div
                      key={idx}
                      className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-amber-500/40 rounded-2xl p-5 flex flex-col items-center text-center gap-3 transition-all duration-300 hover:-translate-y-1 shadow-md group"
                    >
                      <div className="relative w-24 h-24 rounded-full p-1 border-2 border-amber-400/50 group-hover:border-amber-400 transition-colors shadow-lg">
                        <div className="w-full h-full rounded-full overflow-hidden bg-black/40">
                          <img
                            src={artist.img}
                            alt={artist.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-amber-500 text-[#170D08] flex items-center justify-center shadow">
                          <Music size={12} />
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <h4 className="text-xs sm:text-sm font-black font-primary uppercase text-[var(--text-primary)] tracking-tight">
                          {artist.name}
                        </h4>
                        <span className="text-[8.5px] font-primary font-bold tracking-wider text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          {artist.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 4B: GALLERY (items tagged with this event's category)     */}
            {/* ----------------------------------------------------------------- */}
            {eventGalleryItems.length > 0 && (
              <section id="gallery" className="scroll-mt-32 flex flex-col gap-6 text-left">
                <div className="flex flex-col gap-1.5 border-b border-[var(--border-color)] pb-4">
                  <span className="text-[9px] font-primary font-bold tracking-[0.2em] text-amber-400 uppercase">
                    {"✦ GALLERY"}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black font-primary uppercase tracking-tight text-[var(--text-primary)]">
                    From {event.category}
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {eventGalleryItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative aspect-square rounded-2xl overflow-hidden border border-[var(--border-color)] bg-black/40 group"
                    >
                      <img
                        src={item.thumbnailUrl || item.url}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {item.type === "video" && (
                        <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white">
                          <Play size={12} />
                        </span>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <span className="text-[10px] text-white font-secondary leading-snug line-clamp-2">{item.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 5: VENUE & TRAVEL INTELLIGENCE                            */}
            {/* ----------------------------------------------------------------- */}
            <section id="venue" className="scroll-mt-32 flex flex-col gap-6 text-left">
              <div className="flex flex-col gap-1.5 border-b border-[var(--border-color)] pb-4">
                <span className="text-[9px] font-primary font-bold tracking-[0.2em] text-amber-400 uppercase">
                  {"✦ 05. LOCATION & TRAVEL"}
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-primary uppercase tracking-tight text-[var(--text-primary)]">
                  Venue &amp; Arrival Intelligence
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Left: Map / Venue Frame */}
                <div className="md:col-span-7 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[28px] p-6 shadow-md flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-amber-400" />
                      <h4 className="text-xs font-black font-primary uppercase text-[var(--text-primary)] tracking-wider">
                        {event.venue}
                      </h4>
                    </div>
                    <span className="text-[9px] font-primary font-bold text-amber-400 uppercase">
                      {event.city}
                    </span>
                  </div>

                  {/* Embed Map or Fallback Display */}
                  <div className="w-full h-64 rounded-2xl overflow-hidden border border-[var(--border-color)] bg-black/40 relative">
                    {event.googleMapEmbedUrl ? (
                      <iframe
                        src={event.googleMapEmbedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(85%) contrast(110%)" }}
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Venue Location Map"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
                        <MapPin size={32} className="text-amber-400" />
                        <span className="text-xs font-black font-primary uppercase text-[var(--text-primary)]">
                          {event.venue}, {event.city}
                        </span>
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(`${event.venue}, ${event.city}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-amber-500 text-[#170D08] px-4 py-2 rounded-xl text-[10px] font-primary font-bold uppercase tracking-wider"
                        >
                          <Navigation size={12} /> Open in Google Maps
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-[var(--text-secondary)] font-secondary">
                      Exact arena gates will be indicated on your E-Pass.
                    </span>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(`${event.venue}, ${event.city}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-primary font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      Directions <ExternalLink size={11} />
                    </a>
                  </div>
                </div>

                {/* Right: Arrival & Gate Briefing */}
                <div className="md:col-span-5 flex flex-col gap-4">
                  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[28px] p-6 shadow-md flex flex-col gap-4">
                    <span className="text-[9px] font-primary font-bold tracking-widest uppercase text-amber-400">
                      Arrival &amp; Turnstile Briefing
                    </span>

                    <div className="flex flex-col gap-3 bg-white/5 border border-[var(--border-color)] p-3.5 rounded-2xl text-left">
                      <div className="flex flex-col gap-1 border-b border-[var(--border-color)] pb-3">
                        <span className="text-[7.5px] font-primary font-bold uppercase text-[var(--text-muted)]">Venue Hub</span>
                        <span className="text-xs font-black font-primary text-[var(--text-primary)] uppercase truncate">{event.venue}</span>
                        <span className="text-[9.5px] text-[var(--text-secondary)] font-secondary truncate">{event.city}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[7.5px] font-primary font-bold uppercase text-[var(--text-muted)]">Door Timing</span>
                        <span className="text-xs font-black font-primary text-amber-400 uppercase">{event.time || "18:00"}</span>
                        <span className="text-[9.5px] text-[var(--text-secondary)] font-secondary truncate">{event.date}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 text-xs text-[var(--text-secondary)] font-secondary mt-1">
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                        <span>Doors and turnstiles open in advance. Download your E-Pass on your mobile device for immediate scan-in.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                        <span>Venue parking is subject to availability at {event.venue}. Local transit and ridesharing are strongly encouraged.</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 6: EVENT GUIDELINES & RULES                               */}
            {/* ----------------------------------------------------------------- */}
            {event.rules && Array.isArray(event.rules) && event.rules.length > 0 && (
              <section id="rules" className="scroll-mt-32 flex flex-col gap-6 text-left">
                <div className="flex flex-col gap-1.5 border-b border-[var(--border-color)] pb-4">
                  <span className="text-[9px] font-primary font-bold tracking-[0.2em] text-amber-400 uppercase">
                    {"✦ 06. GUIDELINES"}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black font-primary uppercase tracking-tight text-[var(--text-primary)]">
                    Event Rules &amp; Entry Code
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.rules.map((rule, idx) => (
                    <div key={idx} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-amber-400 font-primary font-bold text-xs uppercase tracking-wider">
                        <CheckCircle2 size={16} /> Rule #{idx + 1}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] font-secondary leading-relaxed">
                        {rule}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 7: FREQUENTLY ASKED QUESTIONS                            */}
            {/* ----------------------------------------------------------------- */}
            {event.faqs && event.faqs.length > 0 && (
              <section id="faq" className="scroll-mt-36 flex flex-col gap-6 text-left">
                <div className="flex flex-col gap-2 border-b border-white/[0.08] pb-5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-bold tracking-[0.2em] uppercase font-primary">
                      <Sparkles size={11} className="text-amber-400" />
                      07 • Attendee Intelligence
                    </span>
                    <span className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/20 via-white/5 to-transparent" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black font-primary uppercase tracking-tight text-white mt-1">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-400 font-secondary mt-0.5">
                    Everything you need to know about attendance, entry protocols, passes, and venue guidelines.
                  </p>
                </div>

                <div className="flex flex-col gap-3 w-full">
                  {event.faqs.map((faq, i) => {
                    const isOpen = faqOpen === i;
                    return (
                      <div
                        key={i}
                        className="border border-white/[0.08] rounded-2xl overflow-hidden bg-[#160E09]/70 backdrop-blur-md transition-colors"
                      >
                        <button
                          onClick={() => setFaqOpen(isOpen ? null : i)}
                          className="w-full px-5 py-4 flex items-center justify-between text-left text-xs sm:text-sm font-bold font-primary uppercase text-white hover:bg-white/5 transition-colors cursor-pointer gap-3 outline-none focus:outline-none"
                        >
                          <span>{faq.q}</span>
                          {isOpen ? (
                            <ChevronUp size={16} className="text-amber-400 shrink-0" />
                          ) : (
                            <ChevronDown size={16} className="text-stone-400 shrink-0" />
                          )}
                        </button>

                        {isOpen && (
                          <div className="px-5 pb-5 pt-2 text-xs sm:text-[13px] leading-relaxed text-stone-300 font-secondary border-t border-white/[0.06]">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 8: COMMERCIAL / SPONSORSHIPS & STALLS                     */}
            {/* ----------------------------------------------------------------- */}
            {(event.sponsorshipTiers.length > 0 || event.stallOptions.length > 0 || event.adRates.length > 0) && (
              <section id="commercial" className="scroll-mt-32 flex flex-col gap-6 text-left">
                <div className="flex flex-col gap-1.5 border-b border-[var(--border-color)] pb-4">
                  <span className="text-[9px] font-primary font-bold tracking-[0.2em] text-amber-400 uppercase">
                    {"✦ 08. PARTNERSHIPS"}
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-xl sm:text-2xl font-black font-primary uppercase tracking-tight text-[var(--text-primary)]">
                      Commercial &amp; Brand Opportunities
                    </h2>

                    {/* Tab Switcher */}
                    <div className="flex bg-white/5 border border-[var(--border-color)] p-1 rounded-2xl gap-1">
                      {event.sponsorshipTiers.length > 0 && (
                        <button
                          onClick={() => setCommercialTab("sponsorship")}
                          className={`px-3 py-1.5 rounded-xl text-[9.5px] font-primary font-bold uppercase tracking-wider transition-all cursor-pointer ${commercialTab === "sponsorship" ? "bg-amber-500 text-[#170D08] font-black" : "text-[var(--text-secondary)]"
                            }`}
                        >
                          Sponsorships
                        </button>
                      )}
                      {event.stallOptions.length > 0 && (
                        <button
                          onClick={() => setCommercialTab("stalls")}
                          className={`px-3 py-1.5 rounded-xl text-[9.5px] font-primary font-bold uppercase tracking-wider transition-all cursor-pointer ${commercialTab === "stalls" ? "bg-amber-500 text-[#170D08] font-black" : "text-[var(--text-secondary)]"
                            }`}
                        >
                          Stall Booking
                        </button>
                      )}
                      {event.adRates.length > 0 && (
                        <button
                          onClick={() => setCommercialTab("ads")}
                          className={`px-3 py-1.5 rounded-xl text-[9.5px] font-primary font-bold uppercase tracking-wider transition-all cursor-pointer ${commercialTab === "ads" ? "bg-amber-500 text-[#170D08] font-black" : "text-[var(--text-secondary)]"
                            }`}
                        >
                          Directory Ads
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[28px] p-6 sm:p-8 shadow-md">
                  {commercialTab === "sponsorship" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {event.sponsorshipTiers.map((tier, i) => (
                        <div key={i} className="bg-white/[0.03] border border-[var(--border-color)] rounded-2xl p-5 flex flex-col justify-between gap-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[8.5px] font-primary font-bold text-amber-400 uppercase tracking-widest">
                              Tier #{i + 1}
                            </span>
                            <h4 className="text-base font-black font-primary text-[var(--text-primary)] uppercase">
                              {tier.tier}
                            </h4>
                            <span className="text-lg font-black font-primary text-amber-400 mt-1">
                              {tier.amount}
                            </span>
                            {tier.benefits && (
                              <p className="text-xs text-[var(--text-secondary)] font-secondary mt-2 leading-relaxed line-clamp-6">
                                {tier.benefits}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setCommercialInquiry({ title: `${tier.tier} Sponsorship`, category: "Sponsorship", amount: tier.amount })}
                            className="bg-white/5 hover:bg-amber-500 hover:text-[#170D08] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-2 text-center text-[10px] font-primary font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Inquire for Package
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {commercialTab === "stalls" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {event.stallOptions.map((stall, i) => (
                        <div key={i} className="bg-white/[0.03] border border-[var(--border-color)] rounded-2xl p-5 flex flex-col justify-between gap-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-black font-primary text-[var(--text-primary)] uppercase">
                                {stall.type}
                              </h4>
                              <span className="text-sm font-black font-primary text-amber-400">
                                {stall.rate}
                              </span>
                            </div>
                            <span className="text-[10px] font-primary text-[var(--text-muted)] uppercase">
                              Dimensions: {stall.size}
                            </span>
                            {stall.includes && (
                              <p className="text-xs text-[var(--text-secondary)] font-secondary mt-2 leading-relaxed">
                                Includes: {stall.includes}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setCommercialInquiry({ title: `${stall.type} Stall (${stall.size})`, category: "Stall Booking", amount: stall.rate })}
                            className="bg-white/5 hover:bg-amber-500 hover:text-[#170D08] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-2 text-center text-[10px] font-primary font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Reserve Booth
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {commercialTab === "ads" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {event.adRates.map((rate, i) => (
                        <div key={i} className="bg-white/[0.03] border border-[var(--border-color)] rounded-2xl p-4 flex flex-col justify-between gap-3 text-center">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-[var(--text-muted)] font-primary uppercase font-bold">
                              {rate.category}
                            </span>
                            <span className="text-base font-black font-primary text-amber-400">
                              {rate.amount}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCommercialInquiry({ title: `${rate.category} Directory Ad`, category: "Directory Ad", amount: rate.amount })}
                            className="bg-white/5 hover:bg-amber-500 hover:text-[#170D08] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-1.5 text-center text-[9.5px] font-primary font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Inquire Ad Slot
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

          </div>

          {/* RIGHT 4 COLUMNS: FLOATING TICKET STUDIO & CUSTODIANS */}
          <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-28">

            {/* ----------------------------------------------------------------- */}
            {/* SIDEBAR CARD 1: LIVE HOLOGRAPHIC TICKET STUDIO                    */}
            {/* ----------------------------------------------------------------- */}
            {event.ticketPrices.length > 0 && (
            <div className="bg-[#160E09]/90 border border-amber-500/20 rounded-[32px] p-6 shadow-2xl flex flex-col gap-5 text-left relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-bl-full filter blur-2xl pointer-events-none" />

              <div className="flex flex-col gap-1.5 border-b border-white/[0.08] pb-3.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-bold tracking-widest uppercase">
                    <Sparkles size={10} className="text-amber-400" />
                    Accreditation Studio
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <h3 className="text-sm sm:text-base font-black font-primary text-white uppercase tracking-wider mt-1">
                  Real-Time Credential Pass
                </h3>
                <span className="text-[11px] text-stone-400 font-secondary">
                  Personalize attendee name &amp; holographic foil before booking.
                </span>
              </div>

              {/* Attendee Name Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] font-primary font-bold tracking-widest text-[var(--text-muted)] uppercase">
                  Pass-Holder Name
                </label>
                <input
                  type="text"
                  value={passholderName}
                  onChange={(e) => setPassholderName(e.target.value.toUpperCase())}
                  placeholder={currentUser?.name?.toUpperCase() || "ENTER YOUR FULL NAME"}
                  maxLength={24}
                  className="w-full bg-black/30 border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-400 font-primary font-bold tracking-wider uppercase transition-colors"
                />
              </div>

              {/* Foil Color Theme Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] font-primary font-bold tracking-widest text-[var(--text-muted)] uppercase">
                  Hologram Foil Theme
                </label>
                <div className="flex items-center gap-2 mt-1">
                  {[
                    { id: "gold", label: "Heritage Gold", class: "bg-amber-500" },
                    { id: "indigo", label: "Cyber Indigo", class: "bg-indigo-600" },
                    { id: "rose", label: "Electric Rose", class: "bg-rose-500" },
                    { id: "emerald", label: "Neon Emerald", class: "bg-emerald-500" }
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setBadgeGlow(theme.id as BadgeColorTheme)}
                      className={`w-7 h-7 rounded-full ${theme.class} flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-md ${badgeGlow === theme.id ? "ring-2 ring-white ring-offset-2 ring-offset-[#170D08]" : "opacity-80"
                        }`}
                      title={theme.label}
                    >
                      {badgeGlow === theme.id && <Check size={12} className="text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* The Live Rendered Pass Badge */}
              <div
                className={`rounded-2xl p-5 border flex flex-col gap-5 relative overflow-hidden transition-all duration-500 ${currentBadgeTheme.bg} ${currentBadgeTheme.border} ${currentBadgeTheme.glow}`}
              >
                {/* Diagonal Scanning Light Sweep */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

                {/* Top Badge Header */}
                <div className="flex items-start justify-between border-b border-white/10 pb-3 relative z-10">
                  <div className="flex flex-col text-left">
                    <span className="text-[7px] font-primary font-bold tracking-widest uppercase text-white/70">
                      OFFICIAL CREDENTIAL PASS
                    </span>
                    <h4 className="text-xs font-black font-primary tracking-tight text-white uppercase mt-0.5 line-clamp-1">
                      {event.name}
                    </h4>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 p-1 flex items-center justify-center shrink-0">
                    <QrCode size={20} className="text-white" />
                  </div>
                </div>

                {/* Tier & City Details */}
                <div className="grid grid-cols-2 gap-2 relative z-10">
                  <div className="flex flex-col text-left">
                    <span className="text-[7px] font-primary font-bold uppercase tracking-widest text-white/60">
                      Arena Tier
                    </span>
                    <span className="text-xs font-black font-primary uppercase text-white truncate">
                      {selectedTicketInfo ? selectedTicketInfo.type : "General Entry"}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[7px] font-primary font-bold uppercase tracking-widest text-white/60">
                      City Hub
                    </span>
                    <span className="text-xs font-black font-primary uppercase text-white truncate">
                      {event.city}
                    </span>
                  </div>
                </div>

                {/* Delegate Name */}
                <div className="flex flex-col text-left relative z-10 border-t border-white/10 pt-3">
                  <span className="text-[7px] font-primary font-bold uppercase tracking-widest text-white/60">
                    Enrolled Delegate
                  </span>
                  <span className="text-sm font-black font-primary uppercase tracking-wider text-white truncate mt-0.5">
                    {passholderName || currentUser?.name?.toUpperCase() || "VALUED ATTENDEE"}
                  </span>
                </div>

                {/* Footer Pass Ref & Security */}
                <div className="flex items-center justify-between text-[7.5px] font-primary font-bold tracking-wider text-white/70 relative z-10 border-t border-white/10 pt-2.5">
                  <span className="uppercase">
                    REF: {selectedTicketInfo ? getPassRef(event.id, selectedTicketInfo.type) : "RN-GEN-7092"}
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE_NFC_CLEAR
                  </span>
                </div>
              </div>

              {/* Book CTA for Custom Badge */}
              <button
                onClick={() => setActiveWizard("booking")}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#170D08] py-3.5 rounded-2xl font-primary font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Book This Custom Badge</span>
                <ArrowRight size={14} />
              </button>

              <span className="text-[7.5px] font-primary font-bold tracking-widest text-[var(--text-muted)] uppercase text-center">
                100% SECURE CHECKOUTS VIA UPI, RAZORPAY &amp; NETBANKING
              </span>
            </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* SIDEBAR CARD 2: EVENT CUSTODIANS & ORGANIZERS                     */}
            {/* ----------------------------------------------------------------- */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[28px] p-6 shadow-md flex flex-col gap-4 text-left">
              <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
                <ShieldCheck size={16} className="text-amber-400" />
                <h4 className="text-xs font-black font-primary uppercase text-[var(--text-primary)] tracking-wider">
                  Event Custodians
                </h4>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-primary font-bold uppercase text-[var(--text-muted)]">Official Host</span>
                  <span className="text-[8px] font-primary font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Verified</span>
                </div>
                <h5 className="text-xs sm:text-sm font-black font-primary uppercase text-[var(--text-primary)]">
                  {event.organizer.name}
                </h5>
                {event.organizer.contact && (
                  <p className="text-[11px] text-[var(--text-secondary)] font-secondary leading-relaxed">
                    {event.organizer.contact}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-3 border-t border-[var(--border-color)] text-xs font-primary font-bold text-[var(--text-secondary)]">
                {event.organizer.email && (
                  <a
                    href={`mailto:${event.organizer.email}`}
                    className="flex items-center gap-2 hover:text-amber-400 transition-colors"
                  >
                    <Mail size={13} className="text-amber-400 shrink-0" />
                    <span className="truncate">{event.organizer.email}</span>
                  </a>
                )}
                {event.organizer.phone && (
                  <a
                    href={`tel:${event.organizer.phone}`}
                    className="flex items-center gap-2 hover:text-amber-400 transition-colors"
                  >
                    <Phone size={13} className="text-amber-400 shrink-0" />
                    <span>{event.organizer.phone}</span>
                  </a>
                )}
              </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* SIDEBAR CARD 3: QUICK COMMERCIAL INQUIRY                          */}
            {/* ----------------------------------------------------------------- */}
            {(() => {
              // Mirrors the Commercial section's own tab switcher — whichever
              // tabs have data there is exactly what shows here, so this never
              // needs to be updated by hand when a tab is added/removed.
              const commercialQuickLinks = [
                { tab: "sponsorship" as const, hasData: event.sponsorshipTiers.length > 0, label: "Inquire for Package" },
                { tab: "stalls" as const, hasData: event.stallOptions.length > 0, label: "Inquire Stall Booking" },
                { tab: "ads" as const, hasData: event.adRates.length > 0, label: "Inquire Ad Slot" },
              ].filter((l) => l.hasData);

              if (commercialQuickLinks.length === 0) return null;

              return (
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[28px] p-6 shadow-md flex flex-col gap-3 text-left">
                  <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
                    <Sliders size={16} className="text-amber-400" />
                    <h4 className="text-xs font-black font-primary uppercase text-[var(--text-primary)] tracking-wider">
                      Commercial Opportunities
                    </h4>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {commercialQuickLinks.map((link) => (
                      <a
                        key={link.tab}
                        href="#commercial"
                        onClick={() => setCommercialTab(link.tab)}
                        className="w-full text-center bg-white/5 hover:bg-amber-500 hover:text-[#170D08] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-2.5 text-[10px] font-primary font-bold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              );
            })()}

          </div>

        </div>
      </div>

    </div>
  );
}

// =============================================================================
// MODAL 1: TICKET BOOKING WIZARD
// =============================================================================
interface BookingWizardProps {
  event: Event;
  user: User | null;
  initialTierIndex?: number;
  customPassholderName?: string;
  onClose: () => void;
}

function TicketBookingWizard({ event, user, initialTierIndex = 0, customPassholderName = "", onClose }: BookingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const showBookingCity = isFieldEnabled(event.bookingFormFields, DEFAULT_TICKET_BOOKING_FIELDS, "city");
  const showBookingNotes = isFieldEnabled(event.bookingFormFields, DEFAULT_TICKET_BOOKING_FIELDS, "notes");

  // Selected tier
  const [selectedTicket, setSelectedTicket] = useState<TicketPriceInfo | null>(
    event.ticketPrices[initialTierIndex] ||
    event.ticketPrices.find((t) => t.available > 0) ||
    event.ticketPrices[0] ||
    null
  );

  const [quantity, setQuantity] = useState(1);

  // Visitor info
  const [visitorName, setVisitorName] = useState(customPassholderName || user?.name || "");
  const [visitorEmail, setVisitorEmail] = useState(user?.email || "");
  const [visitorMobile, setVisitorMobile] = useState(user?.mobile || "");
  const [visitorCity, setVisitorCity] = useState(user?.city || "");
  const [specialRequests, setSpecialRequests] = useState("");

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<TicketBooking | null>(null);

  const pricePerTicket = selectedTicket ? selectedTicket.price : 0;
  const totalAmount = pricePerTicket * quantity;
  const maxAllowedQty = Math.max(1, Math.min(10, selectedTicket?.available ?? 10));

  const handleSelectTier = (ticket: TicketPriceInfo) => {
    if (ticket.available <= 0) return;
    setSelectedTicket(ticket);
    const newMax = Math.max(1, Math.min(10, ticket.available));
    if (quantity > newMax) {
      setQuantity(newMax);
    }
  };

  const handlePayment = async () => {
    if (!visitorName.trim() || !visitorEmail.trim() || !visitorMobile.trim() || !visitorCity.trim()) {
      setError("Please fill in all mandatory visitor details.");
      return;
    }
    setError(null);
    setIsProcessing(true);

    setTimeout(async () => {
      try {
        const mockPayId = "pay_rzp_" + Math.random().toString(36).substring(2, 11);
        const booking = await ApiClient.createBooking({
          eventId: event.id,
          eventName: event.name,
          eventDate: event.date,
          eventVenue: event.venue,
          eventBanner: event.bannerUrl,
          visitorName: visitorName.trim(),
          visitorEmail: visitorEmail.trim(),
          visitorMobile: visitorMobile.trim(),
          visitorCity: visitorCity.trim(),
          ticketType: selectedTicket?.type as TicketType,
          quantity,
          totalAmount,
          specialRequests: specialRequests.trim() || undefined,
          paymentId: mockPayId,
          paymentMethod
        });

        setCompletedBooking(booking);
        setStep(5);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Booking processing failed. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }, 2400);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-[var(--bg-panel)] relative rounded-[32px] shadow-2xl border border-[var(--border-color)] overflow-hidden flex flex-col max-h-[92vh]">

        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between shrink-0 bg-white/[0.02]">
          <div className="flex flex-col text-left">
            <span className="text-[8px] font-primary font-bold tracking-widest text-amber-400 uppercase">
              Official Reservation Gateway
            </span>
            <h3 className="font-black text-[var(--text-primary)] font-primary text-sm sm:text-base uppercase tracking-wider">
              Book Audience Pass
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Wizard Stepper Progress Bar */}
        <div className="px-6 py-2 bg-black/30 border-b border-[var(--border-color)] flex items-center justify-between text-[9px] font-primary font-bold uppercase tracking-wider">
          {["1. Tier", "2. Qty", "3. Info", "4. Checkout", "5. E-Pass"].map((s, idx) => (
            <span
              key={idx}
              className={`${step === idx + 1
                  ? "text-amber-400 font-black"
                  : step > idx + 1
                    ? "text-emerald-400"
                    : "text-[var(--text-muted)]"
                }`}
            >
              {s}
            </span>
          ))}
        </div>

        {/* Wizard Dynamic Body */}
        <div className="p-6 overflow-y-auto flex-grow text-left">
          {error && (
            <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Select Tier */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-primary font-bold uppercase tracking-widest text-amber-400">
                1. Select Ticket Tier
              </span>
              <div className="flex flex-col gap-3">
                {event.ticketPrices.map((ticket) => {
                  const soldOut = ticket.available <= 0;
                  const isSelected = selectedTicket?.type === ticket.type;
                  return (
                    <div
                      key={ticket.type}
                      onClick={() => handleSelectTier(ticket)}
                      className={`p-4 rounded-2xl border transition-all flex justify-between items-start gap-4 ${soldOut
                          ? "border-[var(--border-color)] bg-white/5 opacity-50 cursor-not-allowed"
                          : isSelected
                            ? "border-amber-400 bg-amber-500/10 shadow-md cursor-pointer"
                            : "border-[var(--border-color)] bg-white/5 hover:border-amber-500/40 hover:bg-white/[0.07] cursor-pointer"
                        }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-[var(--text-primary)] uppercase font-primary">
                            {ticket.type}
                          </h5>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-normal">
                          {ticket.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-black text-base font-primary text-amber-400">
                          ₹{(ticket.price ?? 0).toLocaleString()}
                        </span>
                        <span className={`text-[9.5px] block font-primary font-bold ${soldOut ? "text-rose-400" : isSelected ? "text-amber-400" : "text-emerald-400"
                          }`}>
                          {soldOut ? "SOLD OUT" : `${ticket.available ?? 100} left`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!selectedTicket || selectedTicket.available <= 0}
                className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#170D08] rounded-2xl py-3.5 font-primary font-black text-xs uppercase tracking-wider transition-colors w-full mt-2 cursor-pointer shadow-md"
              >
                Proceed to Quantity
              </button>
            </div>
          )}

          {/* STEP 2: Quantity */}
          {step === 2 && (
            <div className="flex flex-col gap-4 text-center py-4">
              <span className="text-[10px] font-primary font-bold uppercase tracking-widest text-amber-400 text-left">
                2. Select Number of Passes
              </span>

              <div className="bg-white/5 border border-[var(--border-color)] p-6 max-w-xs mx-auto w-full flex items-center justify-between rounded-2xl mt-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border border-[var(--border-color)] hover:border-amber-400 hover:text-amber-400 text-[var(--text-primary)] flex items-center justify-center font-bold text-lg cursor-pointer transition-colors"
                >
                  -
                </button>
                <div className="flex flex-col">
                  <span className="text-3xl font-black font-primary text-[var(--text-primary)]">{quantity}</span>
                  <span className="text-[9px] uppercase font-primary text-amber-400 font-bold">Passes</span>
                </div>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(maxAllowedQty, quantity + 1))}
                  disabled={quantity >= maxAllowedQty}
                  className="w-10 h-10 rounded-full border border-[var(--border-color)] hover:border-amber-400 hover:text-amber-400 text-[var(--text-primary)] flex items-center justify-center font-bold text-lg cursor-pointer transition-colors disabled:opacity-30"
                >
                  +
                </button>
              </div>

              <p className="text-xs text-[var(--text-muted)] font-secondary">
                {maxAllowedQty < 10
                  ? `Only ${maxAllowedQty} passes left for ${selectedTicket?.type}.`
                  : "Maximum of 10 passes permitted per booking session."}
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-white/5 rounded-2xl py-3 px-6 text-xs font-primary font-bold uppercase tracking-wider cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-amber-500 hover:bg-amber-400 text-[#170D08] rounded-2xl py-3 flex-grow text-xs font-primary font-black uppercase tracking-wider cursor-pointer"
                >
                  Enter Attendee Details
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Attendee Information */}
          {step === 3 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep(4);
              }}
              className="flex flex-col gap-4"
            >
              <span className="text-[10px] font-primary font-bold uppercase tracking-widest text-amber-400">
                3. Primary Attendee Information
              </span>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Full Legal Name *</label>
                <input
                  type="text"
                  placeholder="Attendee full name"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl bg-white/5 border border-[var(--border-color)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Email Address *</label>
                <input
                  type="email"
                  placeholder="attendee@example.com"
                  value={visitorEmail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl bg-white/5 border border-[var(--border-color)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className={showBookingCity ? "grid grid-cols-2 gap-3" : ""}>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Mobile Number *</label>
                  <input
                    type="tel"
                    placeholder="99999 88888"
                    value={visitorMobile}
                    onChange={(e) => setVisitorMobile(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl bg-white/5 border border-[var(--border-color)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-amber-400"
                    required
                  />
                </div>
                {showBookingCity && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">City *</label>
                    <input
                      type="text"
                      placeholder="Bangalore"
                      value={visitorCity}
                      onChange={(e) => setVisitorCity(e.target.value)}
                      className="w-full text-xs sm:text-sm rounded-xl bg-white/5 border border-[var(--border-color)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                )}
              </div>

              {showBookingNotes && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Special Notes (Optional)</label>
                  <textarea
                    placeholder="Wheelchair seating, parking assistance etc."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl bg-white/5 border border-[var(--border-color)] px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-amber-400 h-16 resize-none"
                  />
                </div>
              )}

              <div className="flex gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-white/5 rounded-2xl py-3 px-6 text-xs font-primary font-bold uppercase tracking-wider cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-[#170D08] rounded-2xl py-3 flex-grow text-xs font-primary font-black uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Review &amp; Checkout
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Review & Payment Simulator */}
          {step === 4 && (
            <div className="flex flex-col gap-5">
              <span className="text-[10px] font-primary font-bold uppercase tracking-widest text-amber-400">
                4. Review Order &amp; Gateway
              </span>

              {/* Order Breakdown Box */}
              <div className="bg-white/5 border border-[var(--border-color)] p-4 rounded-2xl flex flex-col gap-2.5">
                <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                  <span>Festival Event</span>
                  <span className="font-bold text-[var(--text-primary)] truncate max-w-[200px]">{event.name}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                  <span>Ticket Tier</span>
                  <span className="font-bold text-amber-400">{selectedTicket?.type}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                  <span>Pass Quantity</span>
                  <span className="font-bold text-[var(--text-primary)]">{quantity}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                  <span>Attendee</span>
                  <span className="font-bold text-[var(--text-primary)]">{visitorName}</span>
                </div>
                <div className="border-t border-[var(--border-color)] pt-2.5 flex justify-between text-sm">
                  <span className="font-black font-primary text-[var(--text-primary)] uppercase">Total Amount</span>
                  <span className="font-black font-primary text-amber-400 text-lg">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Razorpay Simulator */}
              <div className="border border-[var(--border-color)] rounded-2xl overflow-hidden bg-black/20 p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                  <span className="text-xs font-black font-primary text-[var(--text-primary)] tracking-widest">
                    RAZORPAY SECURE GATEWAY
                  </span>
                  <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded px-2 py-0.5 text-[8px] font-bold">
                    256-BIT ENCRYPTED
                  </div>
                </div>

                {isProcessing ? (
                  <div className="py-8 flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-amber-300 font-primary font-bold animate-pulse">
                      Authorizing simulated payment gateway...
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] text-[var(--text-muted)] font-primary font-bold uppercase">
                        Select Payment Method
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {["UPI", "Credit / Debit Card", "Net Banking", "Wallets"].map((method) => (
                          <div
                            key={method}
                            onClick={() => setPaymentMethod(method)}
                            className={`p-3 rounded-xl border text-center text-xs font-bold font-primary uppercase cursor-pointer transition-all ${paymentMethod === method
                                ? "border-amber-400 bg-amber-500/15 text-amber-300"
                                : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-amber-400/30"
                              }`}
                          >
                            {method}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handlePayment}
                      className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-[#170D08] rounded-2xl py-3.5 text-xs font-black font-primary uppercase tracking-wider shadow-lg shadow-amber-500/20 w-full transition-all cursor-pointer hover:brightness-110"
                    >
                      PAY ₹{totalAmount.toLocaleString()} VIA RAZORPAY
                    </button>
                  </>
                )}
              </div>

              {!isProcessing && (
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-white/5 rounded-2xl py-2.5 text-xs font-primary font-bold uppercase tracking-wider cursor-pointer"
                >
                  Back to Attendee Info
                </button>
              )}
            </div>
          )}

          {/* STEP 5: Success Pass */}
          {step === 5 && completedBooking && (
            <div className="flex flex-col items-center gap-5 text-center py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl animate-bounce">
                <Check size={28} />
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-black text-[var(--text-primary)] font-primary uppercase tracking-tight">
                  Pass Reservation Confirmed!
                </h4>
                <p className="text-[var(--text-secondary)] text-xs mt-1 font-secondary">
                  Your digital E-Pass credentials have been generated and sent to your email.
                </p>
              </div>

              {/* Printable Ticket Pass Layout */}
              <div className="w-full border-2 border-dashed border-amber-400/50 rounded-2xl bg-gradient-to-br from-[#2a170a] to-[#120703] p-5 flex flex-col gap-4 text-left relative overflow-hidden shadow-2xl">
                <div className="flex justify-between items-start border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-amber-400 font-bold font-primary">
                      RECHARGE NATION ENTRY PASS
                    </span>
                    <h5 className="font-black text-[var(--text-primary)] text-sm sm:text-base uppercase font-primary mt-0.5 truncate max-w-[220px]">
                      {completedBooking.eventName}
                    </h5>
                  </div>
                  <div className="text-right">
                    <span className="text-[7.5px] text-[var(--text-muted)] block uppercase font-bold font-primary">
                      BOOKING REF
                    </span>
                    <span className="font-primary text-xs font-bold text-amber-400 uppercase">
                      {completedBooking.bookingRef}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs py-1">
                  <div>
                    <span className="text-[7.5px] text-[var(--text-muted)] uppercase font-primary font-bold block">
                      Attendee Name
                    </span>
                    <span className="font-bold text-[var(--text-primary)] truncate block">{completedBooking.visitorName}</span>
                  </div>
                  <div>
                    <span className="text-[7.5px] text-[var(--text-muted)] uppercase font-primary font-bold block">
                      Tier &amp; Qty
                    </span>
                    <span className="font-bold text-amber-400 truncate block">
                      {completedBooking.ticketType} x {completedBooking.quantity}
                    </span>
                  </div>
                  <div>
                    <span className="text-[7.5px] text-[var(--text-muted)] uppercase font-primary font-bold block">
                      Date &amp; Schedule
                    </span>
                    <span className="font-bold text-[var(--text-secondary)] truncate block">{completedBooking.eventDate}</span>
                  </div>
                  <div>
                    <span className="text-[7.5px] text-[var(--text-muted)] uppercase font-primary font-bold block">
                      Venue Gate
                    </span>
                    <span className="font-bold text-[var(--text-secondary)] truncate block">{completedBooking.eventVenue}</span>
                  </div>
                </div>

                {/* QR Code Bar */}
                <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/10">
                  <div className="flex flex-col text-[9.5px] text-[var(--text-muted)]">
                    <span>* Please have this digital or printed pass ready at gates.</span>
                    <span>* Photo ID verification mandatory for admission.</span>
                  </div>
                  <div className="w-14 h-14 bg-white p-1 rounded-lg flex items-center justify-center shrink-0">
                    <QrCode size={44} className="text-black" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 w-full mt-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-white/5 rounded-2xl py-3 flex-grow text-xs font-primary font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Printer size={14} /> Download E-Pass
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push("/dashboard");
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-[#170D08] rounded-2xl py-3 px-6 text-xs font-primary font-black uppercase tracking-wider cursor-pointer shadow-md"
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

// =============================================================================
// MODAL 2: COMPETITION REGISTRATION WIZARD
// =============================================================================
function CompetitionRegistrationWizard({ event, user, onClose }: { event: Event; user: User | null; onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const registrationFee = event.registrationFee || 0;
  const categories = useMemo(() => [
    { name: "Junior Division (Age 8 - 14)", fee: registrationFee },
    { name: "Senior Division (Age 15 - 22)", fee: registrationFee },
    { name: "Open Category (Age 23+)", fee: registrationFee }
  ], [registrationFee]);

  const [category, setCategory] = useState(categories[0].name);
  const [fullName, setFullName] = useState(user?.name || "");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [email, setEmail] = useState(user?.email || "");
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [city, setCity] = useState(user?.city || "");
  const [state, setState] = useState(user?.state || "");
  const [address, setAddress] = useState(user?.address || "");
  const [organization, setOrganization] = useState(user?.organization || "");
  const [emergencyContact, setEmergencyContact] = useState("");

  const [photograph, setPhotograph] = useState<string | null>(null);
  const [govId, setGovId] = useState<string | null>(null);
  const [performanceVideo, setPerformanceVideo] = useState("");

  const [verificationCode, setVerificationCode] = useState("");
  const [userEnteredCode, setUserEnteredCode] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [completedReg, setCompletedReg] = useState<CompetitionRegistration | null>(null);

  const handleFileUpload = (type: "photo" | "id", filename: string) => {
    if (type === "photo") setPhotograph(filename);
    if (type === "id") setGovId(filename);
  };

  const handleProceedToVerify = () => {
    if (!fullName.trim() || !email.trim() || !mobile.trim() || !dob || !city.trim() || !emergencyContact.trim()) {
      setError("Please fill in all mandatory participant details.");
      return;
    }
    setError(null);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    setStep(4);
  };

  const handleVerifyCodeSubmit = () => {
    if (userEnteredCode !== verificationCode) {
      setError("Incorrect email verification code. Please check the simulated OTP.");
      return;
    }
    setError(null);
    if (registrationFee > 0) {
      setStep(5);
    } else {
      handleFinalizeRegistration("waived", "free_direct");
    }
  };

  const handleFinalizeRegistration = async (paymentStatus: "paid" | "waived", paymentId = "") => {
    setIsProcessing(true);
    try {
      const birthYear = new Date(dob).getFullYear();
      const currentYear = new Date().getFullYear();
      const calculatedAge = birthYear ? currentYear - birthYear : 18;

      const reg = await ApiClient.createRegistration({
        competitionId: event.id,
        competitionName: event.name,
        competitionDate: event.date,
        competitionVenue: event.venue,
        competitionBanner: event.bannerUrl,
        fullName: fullName.trim(),
        dob,
        age: calculatedAge,
        gender,
        email: email.trim(),
        mobile: mobile.trim(),
        city: city.trim(),
        state: state.trim(),
        address: address.trim(),
        organization: organization.trim(),
        category,
        emergencyContact: emergencyContact.trim(),
        uploads: {
          photograph: photograph || undefined,
          govId: govId || undefined,
          performanceVideo: performanceVideo.trim() || undefined
        },
        paymentId: paymentId || undefined,
        paymentStatus,
        status: "pending"
      });

      setCompletedReg(reg);
      setStep(6);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit registration. Please verify inputs.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-[var(--bg-panel)] relative rounded-[32px] shadow-2xl border border-[var(--border-color)] overflow-hidden flex flex-col max-h-[92vh]">

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between shrink-0 bg-white/[0.02]">
          <div className="flex flex-col text-left">
            <span className="text-[8px] font-primary font-bold tracking-widest text-amber-400 uppercase">
              Competitor Accreditation
            </span>
            <h3 className="font-black text-[var(--text-primary)] font-primary text-sm sm:text-base uppercase tracking-wider">
              Competition Registration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-grow text-left">
          {error && (
            <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Category */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-primary font-bold uppercase tracking-widest text-amber-400">
                1. Select Competition Class
              </span>
              <div className="flex flex-col gap-3">
                {categories.map((cat) => {
                  const selected = category === cat.name;
                  return (
                    <div
                      key={cat.name}
                      onClick={() => setCategory(cat.name)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${selected
                          ? "border-amber-400 bg-amber-500/15 text-[var(--text-primary)] shadow-md"
                          : "border-[var(--border-color)] bg-white/5 hover:border-amber-400/40 text-[var(--text-secondary)]"
                        }`}
                    >
                      <div className="flex flex-col">
                        <h5 className="font-bold text-sm font-primary uppercase text-[var(--text-primary)]">
                          {cat.name}
                        </h5>
                        <span className="text-[9.5px] uppercase font-primary text-amber-400 font-bold mt-0.5">
                          Accreditation Fee: ₹{cat.fee}
                        </span>
                      </div>
                      <span className="font-black font-primary text-amber-400 text-base">₹{cat.fee}</span>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-amber-500 hover:bg-amber-400 text-[#170D08] rounded-2xl py-3.5 font-primary font-black text-xs uppercase tracking-wider transition-colors w-full mt-2 cursor-pointer shadow-md"
              >
                Enter Participant Information
              </button>
            </div>
          )}

          {/* STEP 2: Participant Details */}
          {step === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="flex flex-col gap-3.5">
              <span className="text-[10px] font-primary font-bold uppercase tracking-widest text-amber-400">
                2. Participant Credentials
              </span>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Full Legal Name *</label>
                <input
                  type="text"
                  placeholder="Participant name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl bg-white/5 border border-[var(--border-color)] px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Date of Birth *</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl bg-white/5 border border-[var(--border-color)] px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl bg-[#1f1008] border border-[var(--border-color)] px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-amber-400"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Email *</label>
                  <input
                    type="email"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl bg-white/5 border border-[var(--border-color)] px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Mobile *</label>
                  <input
                    type="tel"
                    placeholder="99999 88888"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl bg-white/5 border border-[var(--border-color)] px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">City *</label>
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl bg-white/5 border border-[var(--border-color)] px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">State *</label>
                  <input
                    type="text"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl bg-white/5 border border-[var(--border-color)] px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Residential Address</label>
                  <input
                    type="text"
                    placeholder="Address / Street"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl bg-white/5 border border-[var(--border-color)] px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">School / Institution</label>
                  <input
                    type="text"
                    placeholder="Academy or College"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl bg-white/5 border border-[var(--border-color)] px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Emergency Contact Mobile *</label>
                <input
                  type="tel"
                  placeholder="Guardian / Parent mobile"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl bg-white/5 border border-[var(--border-color)] px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="flex gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-white/5 rounded-2xl py-3 px-6 text-xs font-primary font-bold uppercase tracking-wider cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-[#170D08] rounded-2xl py-3 flex-grow text-xs font-primary font-black uppercase tracking-wider cursor-pointer"
                >
                  Upload Credentials
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Uploads */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-primary font-bold uppercase tracking-widest text-amber-400">
                3. Supporting Credentials
              </span>

              <div className="p-4 rounded-2xl border border-dashed border-[var(--border-color)] bg-white/5 flex items-center justify-between gap-4">
                <div>
                  <h5 className="text-xs font-bold text-[var(--text-primary)] font-primary uppercase">Passport Photograph</h5>
                  <p className="text-[10px] text-[var(--text-muted)] font-secondary">JPEG or PNG under 2MB</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleFileUpload("photo", "participant_photo.jpg")}
                  className="bg-white/10 hover:bg-white/20 text-white rounded-xl py-2 px-3 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Upload size={12} /> {photograph ? "Attached" : "Browse"}
                </button>
              </div>
              {photograph && <span className="text-[10px] text-emerald-400 -mt-2">✓ Attached: {photograph}</span>}

              <div className="p-4 rounded-2xl border border-dashed border-[var(--border-color)] bg-white/5 flex items-center justify-between gap-4">
                <div>
                  <h5 className="text-xs font-bold text-[var(--text-primary)] font-primary uppercase">Government Photo ID</h5>
                  <p className="text-[10px] text-[var(--text-muted)] font-secondary">Aadhaar, Passport, or Student ID</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleFileUpload("id", "gov_identity.pdf")}
                  className="bg-white/10 hover:bg-white/20 text-white rounded-xl py-2 px-3 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Upload size={12} /> {govId ? "Attached" : "Browse"}
                </button>
              </div>
              {govId && <span className="text-[10px] text-emerald-400 -mt-2">✓ Attached: {govId}</span>}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Performance Video Link (Optional)</label>
                <input
                  type="url"
                  placeholder="YouTube, Google Drive or Vimeo URL"
                  value={performanceVideo}
                  onChange={(e) => setPerformanceVideo(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl bg-white/5 border border-[var(--border-color)] px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-white/5 rounded-2xl py-3 px-6 text-xs font-primary font-bold uppercase tracking-wider cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleProceedToVerify}
                  className="bg-amber-500 hover:bg-amber-400 text-[#170D08] rounded-2xl py-3 flex-grow text-xs font-primary font-black uppercase tracking-wider cursor-pointer"
                >
                  Verify Contact
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Email Verification */}
          {step === 4 && (
            <div className="flex flex-col gap-4 text-center py-4">
              <ShieldCheck size={36} className="text-amber-400 mx-auto" />
              <span className="text-[10px] font-primary font-bold uppercase tracking-widest text-amber-400">
                4. Verify Email Address
              </span>
              <p className="text-xs text-[var(--text-secondary)] font-secondary">
                A verification code has been dispatched to {email}.
              </p>

              {verificationCode && (
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-[10px] font-primary">
                  SIMULATION PASSCODE: <strong>{verificationCode}</strong>
                </div>
              )}

              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={userEnteredCode}
                onChange={(e) => setUserEnteredCode(e.target.value)}
                className="w-40 mx-auto text-center tracking-widest text-lg font-black font-primary rounded-xl bg-white/5 border border-[var(--border-color)] py-2 text-[var(--text-primary)] outline-none focus:border-amber-400"
              />

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-white/5 rounded-2xl py-3 px-6 text-xs font-primary font-bold uppercase tracking-wider cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleVerifyCodeSubmit}
                  className="bg-amber-500 hover:bg-amber-400 text-[#170D08] rounded-2xl py-3 flex-grow text-xs font-primary font-black uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Verify Code
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Payment */}
          {step === 5 && (
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-primary font-bold uppercase tracking-widest text-amber-400">
                5. Accreditation Fee Checkout
              </span>

              <div className="bg-white/5 border border-[var(--border-color)] p-4 rounded-2xl flex flex-col gap-2 text-xs">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Competition</span>
                  <span className="font-bold text-[var(--text-primary)]">{event.name}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Accreditation Class</span>
                  <span className="font-bold text-amber-400">{category}</span>
                </div>
                <div className="border-t border-[var(--border-color)] pt-2 flex justify-between text-sm">
                  <span className="font-bold text-[var(--text-primary)] font-primary uppercase">Registration Fee</span>
                  <span className="font-black text-amber-400 font-primary">₹{registrationFee.toLocaleString()}</span>
                </div>
              </div>

              {isProcessing ? (
                <div className="py-8 flex flex-col items-center gap-3 text-center">
                  <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-amber-300 font-primary font-bold">Processing accreditation...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleFinalizeRegistration("paid", "pay_comp_" + Math.random().toString(36).substring(2, 9))}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#170D08] rounded-2xl py-3.5 text-xs font-black font-primary uppercase tracking-wider shadow-md w-full transition-all cursor-pointer"
                >
                  PAY ₹{registrationFee.toLocaleString()} &amp; CONFIRM REGISTRATION
                </button>
              )}
            </div>
          )}

          {/* STEP 6: Success */}
          {step === 6 && completedReg && (
            <div className="flex flex-col items-center gap-5 text-center py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl animate-bounce">
                <Check size={28} />
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-black text-[var(--text-primary)] font-primary uppercase tracking-tight">
                  Accreditation Submitted!
                </h4>
                <p className="text-[var(--text-secondary)] text-xs mt-1 font-secondary">
                  Your registration status is currently pending custodian review.
                </p>
              </div>

              <div className="w-full border-2 border-dashed border-amber-400/50 rounded-2xl bg-gradient-to-br from-[#2a170a] to-[#120703] p-5 flex flex-col gap-3 text-left">
                <div className="flex justify-between items-start border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-amber-400 font-bold font-primary">
                      COMPETITOR ACCREDITATION PASS
                    </span>
                    <h5 className="font-black text-[var(--text-primary)] text-sm uppercase font-primary mt-0.5 truncate max-w-[220px]">
                      {completedReg.competitionName}
                    </h5>
                  </div>
                  <div className="text-right">
                    <span className="text-[7.5px] text-[var(--text-muted)] block uppercase font-bold font-primary">
                      PARTICIPANT ID
                    </span>
                    <span className="font-primary text-xs font-bold text-amber-400 uppercase">
                      {completedReg.participantId}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-1">
                  <div>
                    <span className="text-[7.5px] text-[var(--text-muted)] uppercase font-primary font-bold block">Name</span>
                    <span className="font-bold text-[var(--text-primary)] truncate block">{completedReg.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[7.5px] text-[var(--text-muted)] uppercase font-primary font-bold block">Class</span>
                    <span className="font-bold text-amber-400 truncate block">{completedReg.category}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push("/dashboard");
                }}
                className="bg-amber-500 hover:bg-amber-400 text-[#170D08] rounded-2xl py-3 px-6 text-xs font-primary font-black uppercase tracking-wider cursor-pointer w-full shadow-md"
              >
                View in My Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
