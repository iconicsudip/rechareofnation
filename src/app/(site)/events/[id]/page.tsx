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

type BadgeColorTheme = "gold" | "maroon" | "amber" | "crimson";

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
  const [commercialInquiry, setCommercialInquiry] = useState<{ title: string; category: string; amount?: string; mode?: "proposal" | "apply" } | null>(null);
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ name: "", email: "", phone: "", company: "", message: "" });
  const [showFoodExpoLightbox, setShowFoodExpoLightbox] = useState<"directory" | "sponsorship" | null>(null);

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
          // Ensure list-type fields are always arrays so rendering never hits undefined.
          setEvent({
            ...found,
            scheduleDays: found.scheduleDays ?? [],
            ticketPrices: found.ticketPrices ?? [],
            headliners: found.headliners ?? [],
            rules: found.rules ?? [],
            faqs: found.faqs ?? [],
            sponsorshipTiers: found.sponsorshipTiers ?? [],
            stallOptions: found.stallOptions ?? [],
            adRates: found.adRates ?? [],
            galleryUrls: found.galleryUrls ?? [],
          });
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
      const sections = [
        "experience",
        "exhibit",
        "visit",
        "schedule",
        "tickets",
        "pass-studio",
        "headliners",
        "gallery",
        "venue",
        "rules",
        "faq",
        "commercial",
        "custodians",
      ];
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

  // Holographic badge themes - strictly Royal Maroon and Gold
  const getBadgeTheme = (theme: BadgeColorTheme) => {
    switch (theme) {
      case "maroon":
        return {
          bg: "bg-gradient-to-br from-[#4A0814] via-[#32050D] to-[#1A0206]",
          border: "border-[#C59B27]/50",
          accentText: "text-[#FCE7B2]",
          glow: "shadow-[0_0_35px_rgba(123,17,35,0.4)]",
          pill: "bg-[#7B1123]/30 text-[#F3BA2F] border-[#C59B27]/40",
          chip: "bg-[#7B1123]",
          foil: "from-[#7B1123]/30 via-[#C59B27]/20 to-transparent"
        };
      case "amber":
        return {
          bg: "bg-gradient-to-br from-[#3B2505] via-[#241703] to-[#120B01]",
          border: "border-[#E5C05B]/60",
          accentText: "text-[#FFDF88]",
          glow: "shadow-[0_0_35px_rgba(243,186,47,0.35)]",
          pill: "bg-[#F3BA2F]/20 text-[#FFDF88] border-[#E5C05B]/40",
          chip: "bg-[#F3BA2F]",
          foil: "from-[#F3BA2F]/30 via-white/25 to-transparent"
        };
      case "crimson":
        return {
          bg: "bg-gradient-to-br from-[#5C0A19] via-[#3D0610] to-[#200308]",
          border: "border-[#E5C05B]/60",
          accentText: "text-[#FCE7B2]",
          glow: "shadow-[0_0_35px_rgba(150,30,52,0.4)]",
          pill: "bg-[#961E34]/30 text-[#FCE7B2] border-[#E5C05B]/40",
          chip: "bg-[#961E34]",
          foil: "from-[#961E34]/30 via-[#E5C05B]/20 to-transparent"
        };
      case "gold":
      default:
        return {
          bg: "bg-gradient-to-br from-[#2D1F08] via-[#1D1405] to-[#0F0A02]",
          border: "border-[#D4AF37]/60",
          accentText: "text-[#F3D079]",
          glow: "shadow-[0_0_35px_rgba(212,175,55,0.35)]",
          pill: "bg-[#C59B27]/20 text-[#F3BA2F] border-[#C59B27]/40",
          chip: "bg-[#C59B27]",
          foil: "from-[#D4AF37]/30 via-white/25 to-transparent"
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
        <div className="w-12 h-12 rounded-full border border-[#7B1123]/20 border-t-[#C59B27] animate-spin" />
        <span className="text-xs font-primary font-bold tracking-widest uppercase text-[#7B1123]">
          Loading Royal Event Experience...
        </span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 gap-5">
        <div className="w-16 h-16 rounded-xl bg-[#7B1123]/10 border border-[#C59B27]/40 flex items-center justify-center text-[#7B1123]">
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
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7B1123] to-[#961E34] text-[#F3BA2F] text-xs px-6 py-3 rounded-full font-primary font-bold uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#7B1123]/30 border border-[#C59B27]/40 transition-all"
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

  const heroBgImage =
    (event.bannerUrl && !isVideoUrl(event.bannerUrl) ? event.bannerUrl : null) ||
    heroMediaItems.find((m) => m.type === "image")?.url ||
    heroMediaItems.find((m) => m.poster)?.poster ||
    null;

  const hasStalls = Array.isArray(event.stallOptions) && event.stallOptions.length > 0;
  const hasSponsors = Array.isArray(event.sponsorshipTiers) && event.sponsorshipTiers.length > 0;
  const hasTickets = Array.isArray(event.ticketPrices) && event.ticketPrices.length > 0;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-secondary relative selection:bg-[#7B1123]/20 selection:text-[#7B1123] overflow-x-hidden">

      {/* ─── Luxurious Modern Background Atmosphere & Architectural Guides ─── */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none">
        {/* Architectural Hairline Margin Guides */}
        <div className="absolute inset-y-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 pointer-events-none">
          <div className="w-full h-full border-x border-[#EADBCE]/35" />
        </div>

        {/* Golden Champagne & Velvet Wine Ambient Glow Orbs */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(197,155,39,0.08)_0%,rgba(123,17,35,0.03)_50%,transparent_75%)] blur-3xl pointer-events-none" />
        <div className="absolute top-[1800px] -left-48 w-[800px] h-[650px] bg-[radial-gradient(circle_at_center,rgba(123,17,35,0.04)_0%,rgba(197,155,39,0.03)_50%,transparent_75%)] blur-3xl pointer-events-none" />
        <div className="absolute top-[3800px] -right-48 w-[850px] h-[700px] bg-[radial-gradient(circle_at_center,rgba(197,155,39,0.06)_0%,rgba(140,109,35,0.02)_50%,transparent_75%)] blur-3xl pointer-events-none" />
        <div className="absolute top-[5600px] left-1/3 -translate-x-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(123,17,35,0.035)_0%,rgba(197,155,39,0.025)_55%,transparent_75%)] blur-3xl pointer-events-none" />

        {/* Subtle Micro-Lattice Texture */}
        <div className="absolute inset-0 opacity-[0.018] bg-[radial-gradient(#7B1123_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      </div>

      {/* Dynamic Cinema Lightbox Overlay */}
      {isLightboxOpen && currentMedia && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="w-full max-w-6xl flex items-center justify-between gap-4 py-2 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-primary font-bold uppercase tracking-wider ${currentMedia.type === "video" ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-[#7B1123]/30 text-[#F3BA2F] border border-[#C59B27]/40"
                }`}>
                {currentMedia.type === "video" ? "Cinema Video" : "High-Res Photo"}
              </span>
              <h4 className="text-white text-sm sm:text-base font-primary font-bold truncate max-w-[280px] sm:max-w-md">
                {currentMedia.title} &mdash; {event.name}
              </h4>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-amber-200/90 font-primary font-bold">
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
                className="absolute left-2 sm:left-4 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-[#7B1123] hover:text-[#F3BA2F] border border-[#C59B27]/40 text-white flex items-center justify-center transition-all shadow-xl cursor-pointer"
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
                      className="w-full h-full max-w-4xl aspect-video rounded-xl border border-white/20 shadow-2xl"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={currentMedia.url}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full max-w-4xl max-h-[75vh] object-contain rounded-xl border border-white/20 shadow-2xl"
                    />
                  );
                })()
              ) : (
                <img
                  src={currentMedia.url}
                  alt={currentMedia.title}
                  className="max-w-full max-h-full w-auto h-auto object-contain rounded-xl shadow-2xl border border-white/10 select-none"
                />
              )}
            </div>

            {filteredMedia.length > 1 && (
              <button
                type="button"
                onClick={handleNextMedia}
                className="absolute right-2 sm:right-4 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-[#7B1123] hover:text-[#F3BA2F] border border-[#C59B27]/40 text-white flex items-center justify-center transition-all shadow-xl cursor-pointer"
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
                  className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border transition-all cursor-pointer ${idx === safeIndex
                      ? "border-[#C59B27] scale-105 shadow-[0_0_15px_rgba(197,155,39,0.6)]"
                      : "border-white/20 opacity-60 hover:opacity-100"
                    }`}
                >
                  {m.type === "video" ? (
                    <div className="w-full h-full bg-[#1C0509] flex items-center justify-center relative">
                      {m.poster && (
                        <img src={m.poster} alt="" className="w-full h-full object-cover opacity-60" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play size={14} className="text-[#F3BA2F] fill-[#F3BA2F]" />
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
      {/* Commercial Inquiry / Proposal / Application Modal */}
      {commercialInquiry && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[var(--bg-panel)] relative rounded-xl shadow-2xl border border-[var(--border-color)] overflow-hidden flex flex-col p-6 sm:p-7 text-left">
            <div className="flex items-start justify-between border-b border-[var(--border-color)] pb-3.5 mb-4">
              <div>
                <span className="text-[9px] font-primary font-bold tracking-widest text-[#7B1123] uppercase bg-[#7B1123]/10 px-2.5 py-1 rounded-full border border-[#C59B27]/40">
                  {commercialInquiry.mode === "proposal" ? "Official RFP & Proposal Request" : "Partnership & Sponsor Application"}
                </span>
                <h3 className="font-serif font-black text-[var(--text-primary)] text-xl sm:text-2xl uppercase mt-2">
                  {commercialInquiry.title}
                </h3>
                {commercialInquiry.amount && (
                  <span className="text-base font-bold text-[#7B1123] font-serif block mt-0.5">
                    Tier Rate: {commercialInquiry.amount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setCommercialInquiry(null);
                  setInquirySent(false);
                }}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-[#7B1123]/10 flex items-center justify-center text-stone-600 hover:text-[#7B1123] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {inquirySent ? (
              <div className="flex flex-col items-center gap-4 text-center py-6">
                <div className="w-14 h-14 rounded-full bg-[#7B1123]/10 border border-[#C59B27] text-[#C59B27] flex items-center justify-center text-2xl shadow-lg">
                  <Check size={28} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-[var(--text-primary)] font-serif uppercase">
                    {commercialInquiry.mode === "proposal" ? "Proposal Request Sent!" : "Application Submitted!"}
                  </h4>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 font-secondary max-w-sm leading-relaxed">
                    {commercialInquiry.mode === "proposal"
                      ? `Our corporate relations custodian for ${event.name} will email the complete proposal deck and schedule a briefing regarding the ${commercialInquiry.title} package.`
                      : `Your priority brand application for ${commercialInquiry.title} has been logged. Our festival committee will reach out to finalize the partnership MoU.`}
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 w-full mt-3">
                  {event.brochurePdfUrl && (
                    <a
                      href={event.brochurePdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#C59B27] to-[#E5C05B] text-[#1C0509] font-black rounded-xl py-3 text-xs font-serif uppercase tracking-wider shadow-md hover:brightness-105 transition-all"
                    >
                      <ExternalLink size={14} /> Download Event Brochure PDF
                    </a>
                  )}
                  {event.organizer.email && (
                    <a
                      href={`mailto:${event.organizer.email}?subject=Inquiry for ${commercialInquiry.title}&body=Hello ${event.organizer.name}, I am interested in ${commercialInquiry.title} for ${event.name}.`}
                      className="bg-gradient-to-r from-[#7B1123] to-[#961E34] text-[#F3BA2F] border border-[#C59B27]/40 rounded-xl py-2.5 text-xs font-serif font-black uppercase tracking-wider text-center shadow-sm"
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
                    className="border border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-[#7B1123] rounded-xl py-2.5 text-xs font-serif font-bold uppercase tracking-wider cursor-pointer transition-colors"
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
                  <label className="text-[10px] font-serif font-bold uppercase text-stone-700 block mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryForm.name}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-white shadow-sm border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]/40"
                  />
                </div>

                <div className={showInquiryPhone ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : ""}>
                  <div>
                    <label className="text-[10px] font-serif font-bold uppercase text-stone-700 block mb-1">
                      Work Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={inquiryForm.email}
                      onChange={(e) => setInquiryForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="corporate@company.com"
                      className="w-full bg-white shadow-sm border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]/40"
                    />
                  </div>
                  {showInquiryPhone && (
                    <div>
                      <label className="text-[10px] font-serif font-bold uppercase text-stone-700 block mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={inquiryForm.phone}
                        onChange={(e) => setInquiryForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className="w-full bg-white shadow-sm border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]/40"
                      />
                    </div>
                  )}
                </div>

                {showInquiryCompany && (
                  <div>
                    <label className="text-[10px] font-serif font-bold uppercase text-stone-700 block mb-1">
                      Organization / Brand Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={inquiryForm.company}
                      onChange={(e) => setInquiryForm(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="e.g. Nexus Enterprises / Tata Consumer"
                      className="w-full bg-white shadow-sm border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]/40"
                    />
                  </div>
                )}

                {showInquiryNotes && (
                  <div>
                    <label className="text-[10px] font-serif font-bold uppercase text-stone-700 block mb-1">
                      {commercialInquiry.mode === "proposal" ? "Brand Deliverable Goals & Questions" : "Notes / Requirements"}
                    </label>
                    <textarea
                      rows={2}
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Specific deliverables requested, target audience segments, or brand activation ideas..."
                      className="w-full bg-white shadow-sm border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]/40 resize-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="mt-2 bg-gradient-to-r from-[#7B1123] via-[#961E34] to-[#7B1123] hover:from-[#961E34] hover:to-[#7B1123] text-[#F3BA2F] border border-[#C59B27]/50 rounded-xl py-3 text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#7B1123]/25"
                >
                  {commercialInquiry.mode === "proposal" ? "Request Official Proposal & Deck" : "Submit Sponsorship Application"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Lightbox modal for Food Expo Posters */}
      {showFoodExpoLightbox && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative max-w-5xl w-full max-h-[92vh] flex flex-col bg-white border border-[#C59B27]/40 rounded-xl p-4 sm:p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-stone-200 mb-3">
              <div className="flex flex-col">
                <span className="text-[9px] font-primary font-bold text-[#7B1123] uppercase tracking-widest">
                  Food Expo 2026–2027 Official Blueprint
                </span>
                <h3 className="text-sm sm:text-lg font-black font-primary text-[var(--text-primary)] uppercase">
                  {showFoodExpoLightbox === "directory" ? "Exhibitor & Visitor Directory" : "Sponsorship Categories & Benefits"}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFoodExpoLightbox(showFoodExpoLightbox === "directory" ? "sponsorship" : "directory")}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-[#7B1123]/10 border border-stone-200 text-[#7B1123] hover:text-[#961E34] text-[11px] font-bold font-primary uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Switch to {showFoodExpoLightbox === "directory" ? "Sponsorship Poster" : "Directory Poster"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFoodExpoLightbox(null)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-stone-100 hover:bg-[#7B1123]/10 border border-stone-200 flex items-center justify-center text-stone-700 hover:text-[#7B1123] cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="overflow-hidden max-h-[80vh] w-full rounded-xl flex items-center justify-center p-2 bg-black/40">
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
        <div className="fixed bottom-6 right-6 z-50 bg-[#4A0814] border border-[#C59B27] text-[#F3BA2F] text-xs px-5 py-3 rounded-xl shadow-[0_12px_40px_rgba(123,17,35,0.45)] flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCheck size={16} className="text-[#F3BA2F]" />
          <span className="font-primary font-bold uppercase tracking-wider text-[11px]">
            Event link copied to clipboard!
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HERO OVERVIEW & MEDIA SHOWCASE MARQUEE                                 */}
      {/* ========================================================================= */}
      <section id="hero" className="relative isolate overflow-hidden pt-6 sm:pt-8 pb-16 sm:pb-24 lg:min-h-[680px] flex items-center border-b border-[#C59B27]/40 bg-[#1C0509]">
        {/* Hero Background Image & Overlays */}
        <div className="absolute inset-0 -z-10 pointer-events-none select-none">
          {heroBgImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroBgImage} alt="" className="absolute inset-0 w-full h-full object-cover scale-105" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#140205] via-[#1C0509]/90 to-[#1C0509]/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#140205] via-transparent to-[#140205]/60" />
          <div className="absolute -top-24 -left-24 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(197,155,39,0.18),transparent_70%)] blur-3xl" />
          <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#F3BA2F_1px,transparent_1px)] [background-size:26px_26px]" />
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C59B27]/70 to-transparent" />
        </div>
        <div className="container relative z-10 max-w-7xl mx-auto px-4">
          
          {/* Top Breadcrumb & Share Navigation Bar */}
          <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-xs font-serif font-bold uppercase tracking-wider text-white/90 hover:text-[#F3BA2F] transition-colors group bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 hover:border-[#C59B27] shadow-xs"
            >
              <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform text-[#F3BA2F]" />
              <span>Events Listing</span>
              <span className="text-white/40">/</span>
              <span className="text-[#F3BA2F]">{event.city}</span>
            </Link>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl border border-white/20 hover:border-[#C59B27] bg-white/10 backdrop-blur-md hover:bg-[#7B1123] text-white/90 hover:text-white text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
              title="Share event link"
            >
              <Share2 size={13} />
              <span>Share</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8">
            
            {/* Left Content Column */}
            <div className="max-w-3xl flex flex-col gap-6 text-left">
              
              {/* Status & Category Badges */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[9px] font-serif font-bold tracking-widest uppercase bg-white/10 backdrop-blur-md text-[#F3BA2F] border border-white/20 shadow-xs">
                  <Sparkles size={11} className="text-[#F3BA2F]" />
                  # {event.category ? event.category.toUpperCase() : "HOSPITALITY CONCLAVES"}
                </span>

                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[9px] font-serif font-bold tracking-widest uppercase bg-gradient-to-r from-[#7B1123] to-[#961E34] text-[#F3BA2F] border border-[#C59B27]/60 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F3BA2F] animate-pulse" />
                  LIVE TICKETING
                </span>

                {event.isFeatured && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-serif font-bold tracking-widest uppercase bg-[#FDF2F4] text-[#7B1123] border border-[#EADBCE] shadow-xs">
                    <Flame size={11} className="text-[#7B1123]" /> SELLING OUT FAST
                  </span>
                )}

                {event.dateIsTentative && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-serif font-bold tracking-widest uppercase bg-[#C59B27]/15 text-[#7B1123] border border-[#C59B27]/40 shadow-xs">
                    <Clock size={11} /> DATE TENTATIVE
                  </span>
                )}
              </div>

              {/* Event Title */}
              <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black font-serif uppercase tracking-tight leading-[1.1] text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.5)]">
                {event.name}
              </h1>

              {/* Event Excerpt / Summary */}
              <p className="text-white/80 text-sm sm:text-base leading-relaxed font-secondary max-w-2xl">
                {event.summary || event.description.replace(/<[^>]+>/g, " ").slice(0, 240).trim() + "..."}
              </p>

              {/* 4 Key Specs Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-1">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-[#C59B27] rounded-xl p-3.5 sm:p-4 flex flex-col gap-1 shadow-xs hover:shadow-md transition-all duration-300">
                  <span className="flex items-center gap-1.5 text-[9px] font-serif font-bold tracking-wider text-[#F3BA2F] uppercase">
                    <Calendar size={13} className="text-[#F3BA2F] shrink-0" /> Date
                  </span>
                  <span className="text-xs sm:text-sm font-serif font-black text-white uppercase truncate">
                    {event.date}
                  </span>
                  <span className="text-[10px] text-white/60 font-mono truncate">
                    {event.time || "10:00 AM - 07:00 PM"}
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-[#C59B27] rounded-xl p-3.5 sm:p-4 flex flex-col gap-1 shadow-xs hover:shadow-md transition-all duration-300">
                  <span className="flex items-center gap-1.5 text-[9px] font-serif font-bold tracking-wider text-[#F3BA2F] uppercase">
                    <MapPin size={13} className="text-[#F3BA2F] shrink-0" /> City Hub
                  </span>
                  <span className="text-xs sm:text-sm font-serif font-black text-white uppercase truncate">
                    {event.city}
                  </span>
                  <span className="text-[10px] text-white/60 font-sans truncate">
                    {event.venue}
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-[#C59B27] rounded-xl p-3.5 sm:p-4 flex flex-col gap-1 shadow-xs hover:shadow-md transition-all duration-300">
                  <span className="flex items-center gap-1.5 text-[9px] font-serif font-bold tracking-wider text-[#F3BA2F] uppercase">
                    <Star size={13} className="text-[#F3BA2F] fill-[#F3BA2F] shrink-0" /> Rating
                  </span>
                  <span className="text-xs sm:text-sm font-serif font-black text-white uppercase">
                    {event.rating} / 5.0
                  </span>
                  <span className="text-[10px] text-white/60 font-sans truncate">
                    {event.reviewCount} Verified Reviews
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-[#C59B27] rounded-xl p-3.5 sm:p-4 flex flex-col gap-1 shadow-xs hover:shadow-md transition-all duration-300">
                  <span className="flex items-center gap-1.5 text-[9px] font-serif font-bold tracking-wider text-[#F3BA2F] uppercase">
                    <Ticket size={13} className="text-[#F3BA2F] shrink-0" /> Passes
                  </span>
                  <span className="text-xs sm:text-sm font-serif font-black text-[#F3BA2F] uppercase">
                    {minPrice !== null ? `From ₹${minPrice.toLocaleString()}` : "Free Entry"}
                  </span>
                  <span className="text-[10px] text-[#F3BA2F] font-mono font-bold">
                    Fast Check-in
                  </span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                {event.ticketPrices.length > 0 && (
                  <button
                    onClick={() => setActiveWizard("booking")}
                    className="inline-flex items-center gap-2 bg-[#7B1123] hover:bg-[#961E34] text-[#F3BA2F] border border-[#C59B27]/60 px-5 py-2.5 rounded-xl font-serif font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <Ticket size={14} />
                    <span>Book Pass</span>
                  </button>
                )}

                {event.ticketPrices.length > 0 && (
                  <a
                    href="#tickets"
                    className="inline-flex items-center gap-1.5 text-xs font-serif font-bold uppercase tracking-wider text-white/90 hover:text-[#F3BA2F] bg-white/10 backdrop-blur-md border border-white/20 hover:border-[#C59B27] px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <Sliders size={13} className="text-[#F3BA2F]" /> Explore Seating Tiers
                  </a>
                )}


                {currentMedia && (
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-serif font-bold uppercase tracking-wider text-[#1C0509] bg-gradient-to-r from-[#C59B27] to-[#F3BA2F] px-4 py-2.5 rounded-xl border border-[#C59B27]/60 transition-all shadow-xs cursor-pointer hover:brightness-110"
                  >
                    <Play size={13} className="fill-[#1C0509]" /> {heroMediaItems.some(m => m.type === "video") ? "Watch Video" : "View Photos"}
                  </button>
                )}

                {activeSections.map((sec) => {
                  const pillClass = "inline-flex items-center gap-1.5 text-xs font-serif font-bold uppercase tracking-wider text-white/90 hover:text-[#F3BA2F] bg-white/10 backdrop-blur-md border border-white/20 hover:border-[#C59B27] px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer";

                  if (sec.type === "pdf") {
                    return (
                      <button key={sec.id} onClick={handleViewPdf} className={pillClass}>
                        <ExternalLink size={13} className="text-[#F3BA2F]" /> {sec.label || "View PDF"}
                      </button>
                    );
                  }
                  if (sec.type === "exhibit") {
                    return (
                      <a key={sec.id} href="#exhibit" className={pillClass}>
                        <Sliders size={13} className="text-[#F3BA2F]" /> {sec.label || "Exhibit"}
                      </a>
                    );
                  }
                  if (sec.type === "visit") {
                    return (
                      <a key={sec.id} href="#visit" className={pillClass}>
                        <Sliders size={13} className="text-[#F3BA2F]" /> {sec.label || "Visit"}
                      </a>
                    );
                  }
                  if (sec.type === "gallery" && eventGalleryItems.length > 0) {
                    return (
                      <a key={sec.id} href="#gallery" className={pillClass}>
                        <ImageIcon size={13} className="text-[#F3BA2F]" /> {sec.label || "Gallery"}
                      </a>
                    );
                  }
                  if (sec.type === "book_space" || sec.type === "sponsorship") {
                    return (
                      <a key={sec.id} href="#commercial" className={pillClass}>
                        <Sliders size={13} className="text-[#F3BA2F]" /> {sec.label || "Commercial"}
                      </a>
                    );
                  }
                  if (sec.type === "custom" && sec.url) {
                    return (
                      <a key={sec.id} href={sec.url} target="_blank" rel="noopener noreferrer" className={pillClass}>
                        <ExternalLink size={13} className="text-[#F3BA2F]" /> {sec.label}
                      </a>
                    );
                  }
                  return null;
                })}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 2. STICKY SUB-NAV STRIP (Luxury Editorial Navigation)                     */}
      {/* ========================================================================= */}
      <nav className="sticky top-16 z-30 bg-[#FCFAF6]/90 backdrop-blur-xl border-b border-[#EADBCE] shadow-[0_2px_15px_rgba(0,0,0,0.03)] pt-2.5 pb-2.5">
        <div className="container max-w-7xl mx-auto px-4 flex items-center justify-between gap-4 overflow-x-auto py-1 no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {[
              { id: "experience", label: "Experience" },
              ...(event.exhibitInfo && event.exhibitInfo.trim() ? [{ id: "exhibit", label: "Why Exhibit" }] : []),
              ...(event.visitInfo && event.visitInfo.trim() ? [{ id: "visit", label: "Why Visit" }] : []),
              ...(event.scheduleDays.length > 0 ? [{ id: "schedule", label: "Schedule" }] : []),
              ...(event.ticketPrices.length > 0 ? [{ id: "tickets", label: "Tickets & Arena" }] : []),
              ...(event.ticketPrices.length > 0 ? [{ id: "pass-studio", label: "Pass Studio" }] : []),
              ...(event.headliners.length > 0 ? [{ id: "headliners", label: "Headliners" }] : []),
              ...(eventGalleryItems.length > 0 ? [{ id: "gallery", label: "Gallery" }] : []),
              { id: "venue", label: "Venue & Travel" },
              ...(event.rules && event.rules.length > 0 ? [{ id: "rules", label: "Guidelines" }] : []),
              ...(event.faqs && event.faqs.length > 0 ? [{ id: "faq", label: "FAQs" }] : []),
              ...(event.sponsorshipTiers.length > 0 || event.stallOptions.length > 0 || event.adRates.length > 0
                ? [{ id: "commercial", label: "Commercial" }] : []),
              { id: "custodians", label: "Organizers" },
            ].map(item => {
              const isActive = activeNavSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-200 outline-none focus:outline-none ${isActive
                      ? "text-[#F3BA2F] bg-[#7B1123] border border-[#C59B27]/50 shadow-sm"
                      : "text-stone-700 hover:text-[#7B1123] hover:bg-[#7B1123]/5 border border-transparent"
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
              className="hidden sm:inline-flex items-center gap-2 bg-[#7B1123] hover:bg-[#961E34] text-[#F3BA2F] border border-[#C59B27]/60 px-5 py-1.5 rounded-full font-serif font-bold text-xs uppercase tracking-wider shadow-sm transition-all transform hover:-translate-y-0.5 shrink-0 cursor-pointer outline-none focus:outline-none"
            >
              <Ticket size={13} className="shrink-0" />
              <span>Book Pass</span>
            </button>
          )}
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 3. SINGLE PAGE LANDING PAGE FLOW                                         */}
      {/* ========================================================================= */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 flex flex-col gap-16 md:gap-24">

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 1: THE EXPERIENCE                                         */}
            {/* ----------------------------------------------------------------- */}
            <section id="experience" className="scroll-mt-36 flex flex-col gap-8 text-left relative">
              <div className="relative flex flex-col items-start gap-2 pb-6 border-b border-[#EADBCE]/80 overflow-hidden">
                {/* Floating Architectural Watermark Numeral */}
                <span className="absolute -top-3 sm:-top-7 right-0 text-7xl sm:text-8xl md:text-9xl font-serif font-black italic text-[#8C6D23]/[0.06] select-none pointer-events-none tracking-tighter">
                  01
                </span>

                {/* Luxury Chapter Pill Badge */}
                <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-gradient-to-r from-[#FBF6EE] via-[#F7EFE2] to-[#FAF3E8] border border-[#EADBCE] shadow-xs w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D23] animate-pulse" />
                  <span className="text-[10px] sm:text-[11px] font-serif font-bold tracking-[0.24em] text-[#8C6D23] uppercase">
                    CHAPTER 01 • THE FESTIVAL EXPERIENCE
                  </span>
                  <span className="text-[9px] text-[#C59B27] font-serif">✦</span>
                </div>

                {/* Gilded Decorative Rule */}
                <div className="flex items-center gap-2.5 mt-2 mb-1.5">
                  <div className="h-[1.5px] w-10 sm:w-14 bg-gradient-to-r from-[#7B1123] to-[#8C6D23]" />
                  <div className="w-1.5 h-1.5 rotate-45 border border-[#8C6D23] bg-[#F3BA2F]" />
                  <div className="h-[1px] w-20 sm:w-28 bg-gradient-to-r from-[#8C6D23]/60 to-transparent" />
                </div>

                <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-black text-[#23080E] tracking-tight leading-[1.1]">
                  {event.name}
                </h2>
                {event.summary && (
                  <p className="text-stone-600 font-sans text-sm sm:text-base max-w-3xl leading-relaxed mt-2 font-normal">
                    {event.summary}
                  </p>
                )}
              </div>

              {/* Curated Manuscript / Description Box */}
              <div className="bg-[#FCFAF6] border border-[#EADBCE] rounded-xl p-7 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] relative overflow-hidden">
                <RichTextContent
                  html={event.description}
                  className="text-stone-700 text-sm sm:text-base leading-relaxed font-sans space-y-4"
                />
              </div>

              {/* Dynamic Feature Highlights & Visual Experience Pillars */}
              {(() => {
                const fallbackHighlights = [
                  {
                    title: "B2B Sourcing & Commercial Procurement",
                    desc: "Direct access to premier manufacturers and distributors across commercial kitchen equipment, cutlery, refrigeration, and eco-packaging.",
                    tags: ["COMMERCIAL SOURCING", "B2B PROCUREMENT", "BULK DEALS"],
                    image: event.galleryUrls?.[0] || event.bannerUrl || "/images/why-exhibit-1.jpg",
                  },
                  {
                    title: "Live Culinary Masterclasses & Workshops",
                    desc: "Interactive demonstrations led by celebrated master chefs, pastry specialists, and culinary innovators showcasing new gastronomic techniques.",
                    tags: ["MASTERCLASSES", "CULINARY ARENA", "LIVE TASTINGS"],
                    image: event.galleryUrls?.[1] || "/images/why-exhibit-2.jpg",
                  },
                  {
                    title: "Hospitality Leadership & Industry Conclaves",
                    desc: "Strategic keynote dialogues on regional tourism growth, restaurant scaling, luxury banquet operations, and supply chain management.",
                    tags: ["INDUSTRY CONCLAVE", "KEYNOTE PANELS", "NETWORKING"],
                    image: event.galleryUrls?.[2] || "/images/why-exhibit-3.jpg",
                  },
                  {
                    title: "Artisanal Tasting & Regional Food Showcase",
                    desc: "Curated pavilions spotlighting heritage spices, dairy innovations, organic agricultural produce, and signature hospitality offerings.",
                    tags: ["TASTING PAVILION", "HERITAGE FOOD", "EXHIBITOR EXPO"],
                    image: event.galleryUrls?.[3] || "/images/why-exhibit-4.jpg",
                  },
                ];

                const hasCustomHighlights = Array.isArray(event.highlights) && event.highlights.length > 0;
                const rawList = hasCustomHighlights ? event.highlights! : fallbackHighlights;

                const displayHighlights = rawList.map((item, idx) => {
                  const fallback = fallbackHighlights[idx % fallbackHighlights.length];
                  const title = (item.title || "").trim() || fallback.title;
                  const desc = (item.desc || "").trim() || fallback.desc;
                  const image = (item.image || "").trim() || (hasCustomHighlights ? "" : fallback.image);
                  let tags: string[] = [];
                  const rawTags = (item as any)?.tags;
                  if (Array.isArray(rawTags)) {
                    tags = rawTags.map((t: unknown) => String(t || "").trim()).filter(Boolean);
                  } else if (typeof rawTags === "string" && rawTags.trim()) {
                    tags = rawTags.split(",").map((t: string) => t.trim()).filter(Boolean);
                  }
                  if (tags.length === 0) tags = fallback.tags;
                  return { title, desc, image, tags };
                });

                return (
                  <div className="flex flex-col gap-6 pt-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#8C6D23]/30">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-[#8C6D23] inline-block shadow-xs" />
                        <span className="text-xs text-[#7B1123]">✦</span>
                        <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] text-[#7B1123] uppercase">
                          Key Highlights &amp; Pillars
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-[#8C6D23] bg-[#8C6D23]/10 border border-[#8C6D23]/30 px-3 py-1 rounded-xl">
                        {displayHighlights.length} Highlights
                      </span>
                    </div>

                    <div className="flex flex-col gap-5">
                      {displayHighlights.map((item, idx) => {
                        const serial = String(idx + 1).padStart(2, "0");
                        const hasImage = Boolean(item.image);
                        return (
                          <div
                            key={idx}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-7 p-6 sm:p-7 bg-[#FCFAF6] border border-[#EADBCE] hover:border-[#8C6D23] rounded-xl shadow-xs hover:shadow-md transition-all duration-300"
                          >
                            {/* Left: Large Serif Italic Number */}
                            <span className="font-serif italic font-bold text-5xl sm:text-6xl text-[#C59B27] shrink-0 select-none w-14 sm:w-16 leading-none">
                              {serial}
                            </span>

                            {/* Middle: Content (Title, Description, Tags) */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#7B1123]">
                                {item.title}
                              </h3>
                              <p className="mt-1.5 text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                                {item.desc}
                              </p>
                              {item.tags && item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3.5">
                                  {item.tags.map((tag, tIdx) => (
                                    <span
                                      key={tIdx}
                                      className="text-[10px] font-bold tracking-wider uppercase text-[#7B1123] bg-[#7B1123]/5 border border-[#7B1123]/20 px-2.5 py-1 rounded-xl"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Right: Feature Photo (Image at Right) */}
                            {hasImage && (
                              <div className="shrink-0 w-full sm:w-56 md:w-64 lg:w-72 aspect-[16/10] rounded-xl overflow-hidden border border-[#EADBCE] shadow-xs relative group/img self-center">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                                  loading="lazy"
                                />
                                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#7B1123] text-[#F3BA2F] text-[10px] font-bold font-mono shadow-xs">
                                  {serial}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </section>

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 1B: WHY EXHIBIT                                           */}
            {/* ----------------------------------------------------------------- */}
            {Boolean(event.exhibitInfo?.trim() || (event.exhibitPillars && event.exhibitPillars.length > 0)) && (() => {
              const { intro, items: sectorItems } = parseInfoBlock(event.exhibitInfo || "");
              

              const rawPillars = Array.isArray(event.exhibitPillars) && event.exhibitPillars.length > 0
                ? event.exhibitPillars
                : ((
                    sectorItems.length > 0 ? sectorItems.slice(0, 4).map((it, i) => ({
                      title: it.toUpperCase(),
                      desc: `Key exhibitor profile and commercial showcase focus for ${event.name}.`,
                      image: event.galleryUrls?.[i] || undefined,
                    })) : []
                  ));

              const displayPillars = rawPillars.map((p, idx) => ({
                title: (p.title || `PILLAR 0${idx + 1}`).trim().toUpperCase(),
                desc: (p.desc || "").trim(),
                image: (p.image || "").trim(),
              }));

              const sectionTitle = event.name.includes("(") ? event.name.match(/\((.*?)\)/)?.[1]?.trim() || event.name : event.name;

              return (
                <section id="exhibit" className="scroll-mt-32 flex flex-col gap-8 text-left py-4 relative">
                  {/* Eyebrow & Editorial Heading Matching Reference */}
                  <div className="relative flex flex-col items-start border-b border-[#EADBCE]/80 pb-5 overflow-hidden">
                    {/* Floating Architectural Watermark Numeral */}
                    <span className="absolute -top-3 sm:-top-7 right-0 text-7xl sm:text-8xl md:text-9xl font-serif font-black italic text-[#8C6D23]/[0.06] select-none pointer-events-none tracking-tighter">
                      EXHIBIT
                    </span>

                    {/* Luxury Chapter Pill Badge */}
                    <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-gradient-to-r from-[#FBF6EE] via-[#F7EFE2] to-[#FAF3E8] border border-[#EADBCE] shadow-xs w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4F5927] animate-pulse" />
                      <span className="text-[10px] sm:text-[11px] font-serif font-bold tracking-[0.24em] text-[#4F5927] uppercase">
                        FOR EXHIBITORS &amp; ENTERPRISES
                      </span>
                      <span className="text-[9px] text-[#8C6D23] font-serif">✦</span>
                    </div>

                    {/* Gilded Decorative Rule */}
                    <div className="flex items-center gap-2.5 mt-2 mb-1.5">
                      <div className="h-[1.5px] w-10 sm:w-14 bg-gradient-to-r from-[#4F5927] to-[#8C6D23]" />
                      <div className="w-1.5 h-1.5 rotate-45 border border-[#8C6D23] bg-[#E8C766]" />
                      <div className="h-[1px] w-20 sm:w-28 bg-gradient-to-r from-[#8C6D23]/60 to-transparent" />
                    </div>

                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-[#23080E] mt-1">
                      Why Exhibit at {sectionTitle}?
                    </h2>
                    {intro && (
                      <p className="text-xs sm:text-sm text-stone-600 font-secondary mt-2 max-w-3xl leading-relaxed">
                        {intro}
                      </p>
                    )}
                  </div>

                  {/* 2-Column Editorial Grid (Matching Reference Image) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-14 gap-y-10 sm:gap-y-12">
                    {displayPillars.map((item, idx) => {
                      const serial = String(idx + 1).padStart(2, "0");
                      const hasImage = Boolean(item.image);
                      return (
                        <div key={idx} className="flex flex-col group">
                          {/* Optional Photo on Top */}
                          {hasImage && (
                            <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-stone-100 shadow-xs relative group mb-4">
                              <img
                                src={item.image}
                                alt={item.title}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                              />
                            </div>
                          )}

                          {/* Bottom Spec Row: 01 | TITLE + Description */}
                          <div className="flex items-start gap-4 sm:gap-5">
                            {/* Numeral in Olive / Gold */}
                            <span className="font-serif text-4xl sm:text-5xl font-bold text-[#4F5927] leading-none shrink-0 select-none">
                              {serial}
                            </span>

                            {/* Hairline vertical divider */}
                            <div className="w-[1px] h-10 bg-stone-300 self-center shrink-0" />

                            {/* Text Details */}
                            <div className="flex flex-col gap-1">
                              <h4 className="text-sm sm:text-base font-serif font-black tracking-wider uppercase text-stone-900 leading-tight">
                                {item.title}
                              </h4>
                              {item.desc && (
                                <p className="text-xs sm:text-[13px] text-stone-600 font-secondary leading-relaxed">
                                  {item.desc}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Exhibitor Sectors & Profiles Cloud (if available) */}
                  {sectorItems.length > 0 && (
                    <div className="mt-2 p-5 sm:p-6 bg-stone-50 border border-stone-200 rounded-xl flex flex-col gap-3">
                      <span className="text-[11px] font-primary font-bold uppercase tracking-wider text-stone-500">
                        Featured Exhibitor Categories &amp; Sectors
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {sectorItems.map((sec, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-xs font-secondary font-medium px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 shadow-2xs"
                          >
                            {sec}
                          </span>
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
            {Boolean(event.visitInfo?.trim() || (event.visitPillars && event.visitPillars.length > 0)) && (() => {
              const { intro, items: visitorItems } = parseInfoBlock(event.visitInfo || "");


              const rawPillars = Array.isArray(event.visitPillars) && event.visitPillars.length > 0
                ? event.visitPillars
                : ((
                    visitorItems.length > 0 ? visitorItems.slice(0, 4).map((it, i) => ({
                      title: it.toUpperCase(),
                      desc: `Exclusive visitor opportunity and buyer networking track for ${event.name}.`,
                      image: event.galleryUrls?.[i + 1] || undefined,
                    })) : []
                  ));

              const displayPillars = rawPillars.map((p, idx) => ({
                title: (p.title || `PILLAR 0${idx + 1}`).trim().toUpperCase(),
                desc: (p.desc || "").trim(),
                image: (p.image || "").trim(),
              }));

              const sectionTitle = event.name.includes("(") ? event.name.match(/\((.*?)\)/)?.[1]?.trim() || event.name : event.name;

              return (
                <section id="visit" className="scroll-mt-32 flex flex-col gap-8 text-left py-4 relative">
                  {/* Eyebrow & Editorial Heading Matching Reference */}
                  <div className="relative flex flex-col items-start border-b border-[#EADBCE]/80 pb-5 overflow-hidden">
                    {/* Floating Architectural Watermark Numeral */}
                    <span className="absolute -top-3 sm:-top-7 right-0 text-7xl sm:text-8xl md:text-9xl font-serif font-black italic text-[#8C6D23]/[0.06] select-none pointer-events-none tracking-tighter">
                      VISIT
                    </span>

                    {/* Luxury Chapter Pill Badge */}
                    <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-gradient-to-r from-[#FBF6EE] via-[#F7EFE2] to-[#FAF3E8] border border-[#EADBCE] shadow-xs w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4F5927] animate-pulse" />
                      <span className="text-[10px] sm:text-[11px] font-serif font-bold tracking-[0.24em] text-[#4F5927] uppercase">
                        FOR VISITORS &amp; TRADE BUYERS
                      </span>
                      <span className="text-[9px] text-[#8C6D23] font-serif">✦</span>
                    </div>

                    {/* Gilded Decorative Rule */}
                    <div className="flex items-center gap-2.5 mt-2 mb-1.5">
                      <div className="h-[1.5px] w-10 sm:w-14 bg-gradient-to-r from-[#4F5927] to-[#8C6D23]" />
                      <div className="w-1.5 h-1.5 rotate-45 border border-[#8C6D23] bg-[#E8C766]" />
                      <div className="h-[1px] w-20 sm:w-28 bg-gradient-to-r from-[#8C6D23]/60 to-transparent" />
                    </div>

                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-[#23080E] mt-1">
                      Why Visit {sectionTitle}?
                    </h2>
                    {intro && (
                      <p className="text-xs sm:text-sm text-stone-600 font-secondary mt-2 max-w-3xl leading-relaxed">
                        {intro}
                      </p>
                    )}
                  </div>

                  {/* 2-Column Editorial Grid (Matching Reference Image) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-14 gap-y-10 sm:gap-y-12">
                    {displayPillars.map((item, idx) => {
                      const serial = String(idx + 1).padStart(2, "0");
                      const hasImage = Boolean(item.image);
                      return (
                        <div key={idx} className="flex flex-col group">
                          {/* Optional Photo on Top */}
                          {hasImage && (
                            <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-stone-100 shadow-xs relative group mb-4">
                              <img
                                src={item.image}
                                alt={item.title}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                              />
                            </div>
                          )}

                          {/* Bottom Spec Row: 01 | TITLE + Description */}
                          <div className="flex items-start gap-4 sm:gap-5">
                            {/* Numeral in Olive / Gold */}
                            <span className="font-serif text-4xl sm:text-5xl font-bold text-[#4F5927] leading-none shrink-0 select-none">
                              {serial}
                            </span>

                            {/* Hairline vertical divider */}
                            <div className="w-[1px] h-10 bg-stone-300 self-center shrink-0" />

                            {/* Text Details */}
                            <div className="flex flex-col gap-1">
                              <h4 className="text-sm sm:text-base font-serif font-black tracking-wider uppercase text-stone-900 leading-tight">
                                {item.title}
                              </h4>
                              {item.desc && (
                                <p className="text-xs sm:text-[13px] text-stone-600 font-secondary leading-relaxed">
                                  {item.desc}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Visitor Profile Cloud (if available) */}
                  {visitorItems.length > 0 && (
                    <div className="mt-2 p-5 sm:p-6 bg-stone-50 border border-stone-200 rounded-xl flex flex-col gap-3">
                      <span className="text-[11px] font-primary font-bold uppercase tracking-wider text-stone-500">
                        Targeted Visitor &amp; Trade Profiles
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {visitorItems.map((v, vIdx) => (
                          <span
                            key={vIdx}
                            className="text-xs font-secondary font-medium px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 shadow-2xs"
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              );
            })()}

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 2: PROGRAM SCHEDULE                                       */}
            {/* ----------------------------------------------------------------- */}
            {event.scheduleDays.length > 0 && (
              <section id="schedule" className="scroll-mt-32 flex flex-col gap-8 text-left">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200/80">
                  <div className="flex flex-col gap-1.5">
                    <div className="relative flex flex-col items-start gap-2">
                      <span className="absolute -top-4 left-48 sm:left-72 text-6xl sm:text-8xl font-serif font-black italic text-[#8C6D23]/[0.06] select-none pointer-events-none tracking-tighter">
                        02
                      </span>
                      <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-gradient-to-r from-[#FBF6EE] via-[#F7EFE2] to-[#FAF3E8] border border-[#EADBCE] shadow-xs w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D23] animate-pulse" />
                        <span className="text-[10px] sm:text-[11px] font-serif font-bold tracking-[0.24em] text-[#8C6D23] uppercase">
                          CHAPTER 02 • THE ITINERARY &amp; PROGRAM
                        </span>
                        <span className="text-[9px] text-[#C59B27] font-serif">✦</span>
                      </div>
                      <div className="flex items-center gap-2.5 mt-1 mb-1.5">
                        <div className="h-[1.5px] w-10 sm:w-14 bg-gradient-to-r from-[#7B1123] to-[#8C6D23]" />
                        <div className="w-1.5 h-1.5 rotate-45 border border-[#8C6D23] bg-[#F3BA2F]" />
                        <div className="h-[1px] w-20 sm:w-28 bg-gradient-to-r from-[#8C6D23]/60 to-transparent" />
                      </div>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-serif font-black text-stone-900 tracking-tight leading-[1.1]">
                      Festival Program &amp; Schedule
                    </h2>
                  </div>

                  {/* Day Switcher */}
                  <div className="flex bg-[#FCFAF6] border border-[#EADBCE] p-1 rounded-xl gap-1 shrink-0">
                    {event.scheduleDays.map((day, idx) => (
                      <button
                        key={idx}
                        onClick={() => setScheduleTab(idx)}
                        className={`px-4 py-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer ${scheduleTab === idx
                            ? "bg-[#7B1123] text-[#F3BA2F] border border-[#C59B27]/50 shadow-sm"
                            : "text-stone-700 hover:text-[#7B1123]"
                          }`}
                      >
                        {day.dayLabel}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeline Component */}
                {event.scheduleDays[scheduleTab] && (
                  <div className="bg-[#FCFAF6] border border-[#EADBCE] rounded-xl p-7 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-6">
                    <div className="flex items-center justify-between border-b border-[#EADBCE] pb-3">
                      <span className="text-xs font-serif font-bold text-[#7B1123] uppercase tracking-widest">
                        {event.scheduleDays[scheduleTab].dayLabel} Itinerary
                      </span>
                      <span className="text-[11px] font-mono text-stone-500 uppercase">
                        {event.scheduleDays[scheduleTab].items.length} Track Sessions
                      </span>
                    </div>

                    <div className="flex flex-col gap-6 relative before:absolute before:left-3 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#8C6D23] before:via-[#8C6D23]/30 before:to-transparent">
                      {event.scheduleDays[scheduleTab].items.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4 sm:gap-6 relative pl-8 group">
                          {/* Dot on Timeline */}
                          <div className="absolute left-1.5 top-2 w-3.5 h-3.5 rounded-full bg-[#7B1123] border border-[#D4AF37] group-hover:scale-125 transition-all shadow-[0_0_8px_rgba(212,175,55,0.4)]" />

                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 w-full bg-white hover:bg-[#FDFBF7] border border-[#EADBCE] group-hover:border-[#8C6D23] p-5 rounded-xl transition-all shadow-xs">
                            <div className="flex flex-col gap-1 text-left">
                              <span className="w-fit text-[10px] font-mono font-bold tracking-wider text-[#7B1123] bg-[#7B1123]/5 border border-[#7B1123]/20 px-2.5 py-0.5 rounded-md uppercase">
                                {item.time}
                              </span>
                              <h4 className="text-base sm:text-lg font-serif font-black text-stone-900 uppercase tracking-tight mt-1.5">
                                {item.title}
                              </h4>
                              <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed mt-0.5 font-normal">
                                {item.desc}
                              </p>
                            </div>
                            <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-stone-400 shrink-0 self-start sm:self-center">
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
              <section id="tickets" className="scroll-mt-32 flex flex-col gap-8 text-left">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200/80">
                  <div className="flex flex-col gap-1.5">
                    <div className="relative flex flex-col items-start gap-2">
                      <span className="absolute -top-4 left-48 sm:left-72 text-6xl sm:text-8xl font-serif font-black italic text-[#8C6D23]/[0.06] select-none pointer-events-none tracking-tighter">
                        03
                      </span>
                      <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-gradient-to-r from-[#FBF6EE] via-[#F7EFE2] to-[#FAF3E8] border border-[#EADBCE] shadow-xs w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D23] animate-pulse" />
                        <span className="text-[10px] sm:text-[11px] font-serif font-bold tracking-[0.24em] text-[#8C6D23] uppercase">
                          CHAPTER 03 • ADMISSION &amp; ARENA SUITES
                        </span>
                        <span className="text-[9px] text-[#C59B27] font-serif">✦</span>
                      </div>
                      <div className="flex items-center gap-2.5 mt-1 mb-1.5">
                        <div className="h-[1.5px] w-10 sm:w-14 bg-gradient-to-r from-[#7B1123] to-[#8C6D23]" />
                        <div className="w-1.5 h-1.5 rotate-45 border border-[#8C6D23] bg-[#F3BA2F]" />
                        <div className="h-[1px] w-20 sm:w-28 bg-gradient-to-r from-[#8C6D23]/60 to-transparent" />
                      </div>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-serif font-black text-stone-900 tracking-tight leading-[1.1]">
                      Arena Sightlines &amp; Reserve Passes
                    </h2>
                  </div>
                  <span className="text-xs text-stone-600 font-sans font-medium">
                    Select any zone to preview dedicated deliverables &amp; privileges
                  </span>
                </div>

                {/* Unique Modern Interactive Arena Visualizer */}
                <div className="bg-[#FCFAF6] border border-[#EADBCE] rounded-xl p-7 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-8">

                  {/* SVG Stadium Diagram */}
                  <div className="relative w-full rounded-xl bg-gradient-to-br from-[#1C0509] via-[#120205] to-[#0A0103] border border-[#C59B27]/40 p-6 overflow-hidden flex flex-col items-center justify-center shadow-inner">
                    <div className="absolute top-3 left-4 text-[9px] font-mono tracking-widest text-[#F3BA2F]/80 uppercase font-bold">
                      ARENA SIGHTLINE BLUEPRINT
                    </div>
                    <div className="absolute top-3 right-4 flex items-center gap-2 text-[9px] font-serif font-bold text-[#F3BA2F] uppercase">
                      <span className="w-2 h-2 rounded-full bg-[#C59B27] animate-pulse" />
                      INTERACTIVE SEATING SALON
                    </div>

                    <div className="w-full max-w-lg my-4">
                      <svg viewBox="0 0 500 240" className="w-full h-auto drop-shadow-xl">
                        <defs>
                          <linearGradient id="stageGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#C59B27" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#7B1123" stopOpacity="0.5" />
                          </linearGradient>
                          <radialGradient id="arenaLight" cx="50%" cy="20%" r="80%">
                            <stop offset="0%" stopColor="#C59B27" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                          </radialGradient>
                        </defs>

                        {/* Background Arena Aura */}
                        <path d="M 50 200 A 200 130 0 0 1 450 200 Z" fill="url(#arenaLight)" />

                        {/* Outer General Circle Zone */}
                        <path
                          d="M 60 210 A 190 120 0 0 1 440 210 L 400 210 A 150 90 0 0 0 100 210 Z"
                          className={`transition-all duration-300 cursor-pointer ${selectedZone === 2 || hoveredZone === 2
                              ? "fill-[#7B1123]/80 stroke-[#C59B27] stroke-2"
                              : "fill-white/5 stroke-white/20 hover:fill-[#7B1123]/30"
                            }`}
                          onClick={() => event.ticketPrices[2] && setSelectedZone(2)}
                          onMouseEnter={() => setHoveredZone(2)}
                          onMouseLeave={() => setHoveredZone(null)}
                        />

                        {/* Mid Tier / Club Stand */}
                        <path
                          d="M 105 205 A 145 85 0 0 1 395 205 L 355 205 A 110 60 0 0 0 145 205 Z"
                          className={`transition-all duration-300 cursor-pointer ${selectedZone === 1 || hoveredZone === 1
                              ? "fill-[#7B1123] stroke-[#C59B27] stroke-2"
                              : "fill-white/10 stroke-white/25 hover:fill-[#7B1123]/40"
                            }`}
                          onClick={() => event.ticketPrices[1] && setSelectedZone(1)}
                          onMouseEnter={() => setHoveredZone(1)}
                          onMouseLeave={() => setHoveredZone(null)}
                        />

                        {/* VIP Lounge / Front Pit Zone */}
                        <path
                          d="M 150 200 A 105 55 0 0 1 350 200 L 310 200 A 70 30 0 0 0 190 200 Z"
                          className={`transition-all duration-300 cursor-pointer ${selectedZone === 0 || hoveredZone === 0
                              ? "fill-[#C59B27]/80 stroke-[#F3BA2F] stroke-2"
                              : "fill-[#C59B27]/30 stroke-[#C59B27]/60 hover:fill-[#C59B27]/50"
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
                          stroke="#F3BA2F"
                          strokeWidth="1.5"
                        />
                        <text
                          x="250"
                          y="171"
                          textAnchor="middle"
                          fill="#F3BA2F"
                          fontSize="9.5"
                          fontWeight="bold"
                          fontFamily="serif"
                          letterSpacing="1.5"
                        >
                          ✦ MAIN STAGE
                        </text>

                        {/* Zone Labels */}
                        <text x="250" y="196" textAnchor="middle" fill="#F3BA2F" fontSize="8" fontWeight="bold" letterSpacing="1">
                          VIP LOUNGE / PIT
                        </text>
                        <text x="250" y="142" textAnchor="middle" fill="#E8D5B5" fontSize="7.5" fontWeight="bold" letterSpacing="0.8">
                          CLUB DECK / MEZZANINE
                        </text>
                        <text x="250" y="105" textAnchor="middle" fill="#E8D5B5" fontSize="7.5" fontWeight="bold" letterSpacing="0.8">
                          GENERAL ARENA ENCLOSURE
                        </text>
                      </svg>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-serif font-bold uppercase tracking-wider text-stone-200">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#C59B27]" /> VIP Salon
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#7B1123]" /> Club Deck
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-stone-400" /> General Enclosure
                      </span>
                    </div>
                  </div>

                  {/* Luxury Ticket Tier Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                          className={`relative rounded-xl p-7 border transition-all duration-300 flex flex-col justify-between gap-6 cursor-pointer overflow-hidden ${isSelected
                              ? "bg-gradient-to-br from-[#380912] via-[#24040A] to-[#120205] border-[#D4AF37] shadow-[0_12px_40px_rgba(56,9,18,0.35)] scale-[1.01]"
                              : "bg-white hover:bg-[#FDFBF7] border-[#EADBCE] hover:border-[#8C6D23] text-stone-900 shadow-xs"
                            }`}
                        >
                          {/* Ticket Cutout Notches */}
                          <div className={`absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FCFAF6] border-r ${isSelected ? "border-[#D4AF37]/60" : "border-[#EADBCE]"} z-10 pointer-events-none`} />
                          <div className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FCFAF6] border-l ${isSelected ? "border-[#D4AF37]/60" : "border-[#EADBCE]"} z-10 pointer-events-none`} />

                          {/* Selected Checkmark Badge */}
                          {isSelected && (
                            <span className="absolute top-4 right-4 bg-gradient-to-r from-[#C59B27] to-[#F3BA2F] text-[#1C0509] px-3 py-0.5 rounded-full text-[9px] font-black font-serif uppercase tracking-wider flex items-center gap-1 shadow-xs">
                              <Check size={11} strokeWidth={3} /> Selected Tier
                            </span>
                          )}

                          {/* Header Tier Info */}
                          <div className="flex flex-col text-left gap-1">
                            <span className={`text-[9px] font-serif font-bold tracking-widest uppercase ${isSelected ? "text-[#F3BA2F]" : "text-[#7B1123]"
                              }`}>
                              Tier #{idx + 1} • Turnstile Gate Access
                            </span>
                            <h3 className={`text-lg sm:text-xl font-serif font-black uppercase tracking-tight ${isSelected ? "text-white" : "text-stone-900"
                              }`}>
                              {ticketTitle}
                            </h3>
                            {ticket.description && (
                              <p className={`text-xs font-sans mt-1 leading-relaxed line-clamp-2 ${isSelected ? "text-stone-200" : "text-stone-600"
                                }`}>
                                {ticket.description}
                              </p>
                            )}
                          </div>

                          {/* Pricing & Stock Row */}
                          <div className={`flex items-end justify-between pt-5 border-t border-dashed ${isSelected ? "border-[#D4AF37]/40" : "border-[#EADBCE]"}`}>
                            <div className="flex flex-col">
                              <span className={`text-[8.5px] font-serif uppercase tracking-wider ${isSelected ? "text-amber-200/90 font-bold" : "text-stone-500 font-medium"
                                }`}>
                                Rate Per Attendee
                              </span>
                              <span className={`text-2xl sm:text-3xl font-serif font-bold ${isSelected ? "text-[#F3BA2F]" : "text-[#7B1123]"
                                }`}>
                                ₹{ticketPrice.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex flex-col items-end">
                              <span className={`text-[9.5px] font-serif font-bold tracking-wider uppercase ${isSoldOut ? "text-stone-400" : isSelected ? "text-[#F3BA2F]" : "text-[#7B1123]"
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
                                className="mt-2.5 bg-[#7B1123] hover:bg-[#961E34] disabled:opacity-40 disabled:cursor-not-allowed text-[#F3BA2F] border border-[#C59B27]/50 px-4 py-2 rounded-xl text-[10px] font-serif font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
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
                    <div className="bg-white border border-[#EADBCE] rounded-xl p-6 text-left flex flex-col gap-4 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-serif font-bold tracking-widest uppercase text-[#7B1123]">
                          Included Deliverables for {selectedTicketInfo.type}:
                        </span>
                        <span className="text-[10px] font-mono text-stone-500">
                          Gate Clearance: Fast-Track Encrypted QR
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(selectedTicketInfo.description
                          ? selectedTicketInfo.description.split(/[,;\n]/).map(s => s.trim()).filter(Boolean)
                          : [
                            `Admission clearance for ${event.name}`,
                            `Designated ${selectedTicketInfo.type} access enclosure at ${event.venue}`,
                            `Personalized digital E-Pass with encrypted QR token`,
                            `Turnstile check-in assistance on ${event.date}`
                          ]
                        ).map((perk, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-xs text-stone-700 font-sans">
                            <span className="w-4 h-4 rounded-full bg-[#7B1123]/10 text-[#7B1123] border border-[#C59B27]/40 flex items-center justify-center shrink-0">
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
            {/* SECTION 3B: INTERACTIVE DELEGATE ACCREDITATION PASS STUDIO        */}
            {/* ----------------------------------------------------------------- */}
            {event.ticketPrices.length > 0 && (
              <section id="pass-studio" className="scroll-mt-32 flex flex-col gap-8 text-left">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200/80">
                  <div className="flex flex-col gap-1.5">
                    <div className="relative flex flex-col items-start gap-2">
                      <span className="absolute -top-4 left-48 sm:left-72 text-6xl sm:text-8xl font-serif font-black italic text-[#8C6D23]/[0.06] select-none pointer-events-none tracking-tighter">
                        PASS
                      </span>
                      <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-gradient-to-r from-[#FBF6EE] via-[#F7EFE2] to-[#FAF3E8] border border-[#EADBCE] shadow-xs w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D23] animate-pulse" />
                        <span className="text-[10px] sm:text-[11px] font-serif font-bold tracking-[0.24em] text-[#8C6D23] uppercase">
                          CHAPTER 03B • THE CREDENTIAL ATELIER
                        </span>
                        <span className="text-[9px] text-[#C59B27] font-serif">✦</span>
                      </div>
                      <div className="flex items-center gap-2.5 mt-1 mb-1.5">
                        <div className="h-[1.5px] w-10 sm:w-14 bg-gradient-to-r from-[#7B1123] to-[#8C6D23]" />
                        <div className="w-1.5 h-1.5 rotate-45 border border-[#8C6D23] bg-[#F3BA2F]" />
                        <div className="h-[1px] w-20 sm:w-28 bg-gradient-to-r from-[#8C6D23]/60 to-transparent" />
                      </div>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-serif font-black text-stone-900 tracking-tight leading-[1.1]">
                      Interactive Delegate Pass Studio
                    </h2>
                  </div>
                  <span className="text-xs text-stone-600 font-sans font-medium">
                    Personalize your delegate moniker and metallic foil before reservation
                  </span>
                </div>

                <div className="bg-[#FCFAF6] border border-[#EADBCE] rounded-xl p-7 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] relative overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    {/* Left: Customizer Controls (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col gap-6 text-left">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#7B1123]/10 border border-[#8C6D23]/30 text-[#7B1123] text-[9.5px] font-serif font-bold tracking-widest uppercase">
                            <Sparkles size={10} className="text-[#8C6D23]" />
                            Bespoke Credential Engine
                          </span>
                          <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#7B1123]">
                            <span className="w-2 h-2 rounded-full bg-[#8C6D23] animate-pulse" />
                            Fast-Track NFC
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-serif font-black text-stone-900 uppercase tracking-tight mt-1">
                          Personalize Your Arena Badge
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed">
                          Your pass is your turnstile credential passport. Type your moniker, pick an authentic holographic finish, and watch your 3D digital pass render in real-time.
                        </p>
                      </div>

                      {/* Attendee Name Input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-serif font-bold tracking-widest text-stone-700 uppercase">
                          Pass-Holder Moniker / Name
                        </label>
                        <input
                          type="text"
                          value={passholderName}
                          onChange={(e) => setPassholderName(e.target.value.toUpperCase())}
                          placeholder={currentUser?.name?.toUpperCase() || "ENTER YOUR FULL NAME"}
                          maxLength={24}
                          className="w-full bg-white border border-[#EADBCE] focus:border-[#8C6D23] rounded-xl px-4 py-3 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none font-serif font-bold tracking-wider uppercase transition-colors shadow-xs"
                        />
                      </div>

                      {/* Foil Color Theme Selector */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-serif font-bold tracking-widest text-stone-700 uppercase">
                          Holographic Metallic Foil
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: "gold", label: "Royal Gold", class: "bg-[#C59B27]" },
                            { id: "maroon", label: "Imperial Maroon", class: "bg-[#7B1123]" },
                            { id: "amber", label: "Antique Bronze", class: "bg-[#8C6D23]" },
                            { id: "crimson", label: "Heritage Wine", class: "bg-[#961E34]" }
                          ].map((theme) => (
                            <button
                              key={theme.id}
                              type="button"
                              onClick={() => setBadgeGlow(theme.id as BadgeColorTheme)}
                              className={`flex items-center gap-2 p-2 rounded-xl border text-[10px] font-serif font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                badgeGlow === theme.id
                                  ? "border border-[#8C6D23] bg-white text-[#7B1123] shadow-xs"
                                  : "border-[#EADBCE] bg-white/60 text-stone-700 hover:bg-white"
                              }`}
                            >
                              <span className={`w-3.5 h-3.5 rounded-full ${theme.class} shrink-0`} />
                              <span className="truncate">{theme.label.split(" ")[1]}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tier Info summary */}
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-[#EADBCE] text-xs">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-serif uppercase tracking-wider text-stone-500 font-medium">Selected Tier</span>
                          <span className="font-serif font-black uppercase text-[#7B1123] text-sm">
                            {selectedTicketInfo ? selectedTicketInfo.type : "General Entry"}
                          </span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[9px] font-serif uppercase tracking-wider text-stone-500 font-medium">Admission Fee</span>
                          <span className="font-serif font-black text-[#7B1123] text-sm">
                            ₹{(selectedTicketInfo ? Number(selectedTicketInfo.price) : (minPrice || 0)).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <div className="flex flex-col gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setActiveWizard("booking")}
                          className="w-full bg-[#7B1123] hover:bg-[#961E34] text-[#F3BA2F] border border-[#C59B27]/50 py-3.5 rounded-xl font-serif font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Ticket size={16} />
                          <span>Reserve This Customized Badge</span>
                          <ArrowRight size={16} />
                        </button>
                        <span className="text-[9px] font-serif tracking-widest text-stone-500 uppercase text-center">
                          Instant Digital E-Pass &amp; QR Delivery
                        </span>
                      </div>
                    </div>

                    {/* Right: The 3D Digital Holographic Pass Live Preview (7 cols) */}
                    <div className="lg:col-span-7 flex flex-col justify-center items-center py-4">
                      {/* VIP Lanyard Clasp Flourish */}
                      <div className="w-20 h-4 rounded-full bg-gradient-to-r from-[#C59B27] via-[#F3BA2F] to-[#C59B27] border border-[#C59B27] shadow-sm flex items-center justify-center mb-1">
                        <div className="w-8 h-1 rounded-full bg-[#1C0509]/60" />
                      </div>

                      <div className="w-full max-w-md">
                        <div
                          className={`rounded-xl p-7 border flex flex-col gap-6 relative overflow-hidden transition-all duration-500 shadow-xl ${currentBadgeTheme.bg} ${currentBadgeTheme.border} ${currentBadgeTheme.glow}`}
                        >
                          {/* Diagonal Scanning Light Sweep */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

                          {/* Top Badge Header */}
                          <div className="flex items-start justify-between border-b border-white/15 pb-4 relative z-10">
                            <div className="flex flex-col text-left">
                              <span className="text-[8.5px] font-mono tracking-widest uppercase text-white/70 font-bold">
                                OFFICIAL CREDENTIAL PASS
                              </span>
                              <h4 className="text-base font-serif font-black tracking-tight text-white uppercase mt-0.5 line-clamp-1">
                                {event.name}
                              </h4>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 p-1.5 flex items-center justify-center shrink-0 shadow-inner">
                              <QrCode size={24} className="text-white" />
                            </div>
                          </div>

                          {/* Tier & City Details */}
                          <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div className="flex flex-col text-left">
                              <span className="text-[8.5px] font-serif uppercase tracking-widest text-white/60">
                                Arena Tier
                              </span>
                              <span className="text-sm font-serif font-black uppercase text-white truncate">
                                {selectedTicketInfo ? selectedTicketInfo.type : "General Entry"}
                              </span>
                            </div>
                            <div className="flex flex-col text-right">
                              <span className="text-[8.5px] font-serif uppercase tracking-widest text-white/60">
                                City Hub
                              </span>
                              <span className="text-sm font-serif font-black uppercase text-white truncate">
                                {event.city}
                              </span>
                            </div>
                          </div>

                          {/* Delegate Name */}
                          <div className="flex flex-col text-left relative z-10 border-t border-white/15 pt-4">
                            <span className="text-[8.5px] font-serif uppercase tracking-widest text-white/60">
                              Enrolled Delegate
                            </span>
                            <span className="text-lg font-serif font-black uppercase tracking-wider text-white truncate mt-0.5">
                              {passholderName || currentUser?.name?.toUpperCase() || "VALUED ATTENDEE"}
                            </span>
                          </div>

                          {/* Footer Pass Ref & Security */}
                          <div className="flex items-center justify-between text-[9px] font-mono font-bold tracking-wider text-white/70 relative z-10 border-t border-white/15 pt-3.5">
                            <span className="uppercase">
                              REF: {selectedTicketInfo ? getPassRef(event.id, selectedTicketInfo.type) : "RN-GEN-7092"}
                            </span>
                            <span className="flex items-center gap-1.5 text-[#F3BA2F]">
                              <span className="w-2 h-2 rounded-full bg-[#F3BA2F] animate-ping" />
                              LIVE_NFC_CLEAR
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 4: HEADLINERS & PERFORMERS                                */}
            {/* ----------------------------------------------------------------- */}
            {event.headliners.length > 0 && (
              <section id="headliners" className="scroll-mt-32 flex flex-col gap-8 text-left">
                <div className="flex flex-col gap-1.5 pb-6 border-b border-stone-200/80">
                  <div className="relative flex flex-col items-start gap-2">
                    <span className="absolute -top-4 left-48 sm:left-72 text-6xl sm:text-8xl font-serif font-black italic text-[#8C6D23]/[0.06] select-none pointer-events-none tracking-tighter">
                      04
                    </span>
                    <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-gradient-to-r from-[#FBF6EE] via-[#F7EFE2] to-[#FAF3E8] border border-[#EADBCE] shadow-xs w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D23] animate-pulse" />
                      <span className="text-[10px] sm:text-[11px] font-serif font-bold tracking-[0.24em] text-[#8C6D23] uppercase">
                        CHAPTER 04 • DISTINGUISHED HEADLINERS &amp; GUESTS
                      </span>
                      <span className="text-[9px] text-[#C59B27] font-serif">✦</span>
                    </div>
                    <div className="flex items-center gap-2.5 mt-1 mb-1.5">
                      <div className="h-[1.5px] w-10 sm:w-14 bg-gradient-to-r from-[#7B1123] to-[#8C6D23]" />
                      <div className="w-1.5 h-1.5 rotate-45 border border-[#8C6D23] bg-[#F3BA2F]" />
                      <div className="h-[1px] w-20 sm:w-28 bg-gradient-to-r from-[#8C6D23]/60 to-transparent" />
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-serif font-black text-stone-900 tracking-tight leading-[1.1]">
                    Featured Lineup &amp; Keynote Speakers
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6">
                  {event.headliners.map((artist, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-[#EADBCE] hover:border-[#8C6D23] rounded-xl p-5 flex flex-col items-center text-center gap-3 transition-all duration-300 hover:-translate-y-1 shadow-xs group"
                    >
                      <div className="relative w-24 h-24 rounded-full p-1 border border-[#C59B27] bg-[#FCFAF6] transition-colors shadow-xs">
                        <div className="w-full h-full rounded-full overflow-hidden bg-stone-100">
                          <img
                            src={artist.img}
                            alt={artist.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#7B1123] text-[#F3BA2F] border border-[#C59B27]/50 flex items-center justify-center shadow-xs">
                          <Music size={12} />
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <h4 className="text-sm font-serif font-black uppercase text-stone-900 tracking-tight">
                          {artist.name}
                        </h4>
                        <span className="text-[9px] font-serif font-semibold tracking-wider text-[#7B1123] uppercase bg-[#7B1123]/5 px-2.5 py-0.5 rounded-full border border-[#7B1123]/20">
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
              <section id="gallery" className="scroll-mt-32 flex flex-col gap-8 text-left">
                <div className="flex flex-col gap-1.5 pb-6 border-b border-stone-200/80">
                  <div className="relative flex flex-col items-start gap-2">
                    <span className="absolute -top-4 left-48 sm:left-72 text-6xl sm:text-8xl font-serif font-black italic text-[#8C6D23]/[0.06] select-none pointer-events-none tracking-tighter">
                      ARCHIVE
                    </span>
                    <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-gradient-to-r from-[#FBF6EE] via-[#F7EFE2] to-[#FAF3E8] border border-[#EADBCE] shadow-xs w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D23] animate-pulse" />
                      <span className="text-[10px] sm:text-[11px] font-serif font-bold tracking-[0.24em] text-[#8C6D23] uppercase">
                        CHAPTER 04B • THE VISUAL ARCHIVE
                      </span>
                      <span className="text-[9px] text-[#C59B27] font-serif">✦</span>
                    </div>
                    <div className="flex items-center gap-2.5 mt-1 mb-1.5">
                      <div className="h-[1.5px] w-10 sm:w-14 bg-gradient-to-r from-[#7B1123] to-[#8C6D23]" />
                      <div className="w-1.5 h-1.5 rotate-45 border border-[#8C6D23] bg-[#F3BA2F]" />
                      <div className="h-[1px] w-20 sm:w-28 bg-gradient-to-r from-[#8C6D23]/60 to-transparent" />
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-serif font-black text-stone-900 tracking-tight leading-[1.1]">
                    Photographic Archive • {event.category}
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                  {eventGalleryItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative aspect-square rounded-xl overflow-hidden border border-[#EADBCE] hover:border-[#8C6D23] bg-stone-900 group shadow-xs transition-all"
                    >
                      <img
                        src={item.thumbnailUrl || item.url}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {item.type === "video" && (
                        <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#7B1123] text-[#F3BA2F] border border-[#C59B27]/50 flex items-center justify-center shadow-xs">
                          <Play size={12} />
                        </span>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <span className="text-xs text-white font-sans leading-snug line-clamp-2">{item.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 5: VENUE & TRAVEL INTELLIGENCE                            */}
            {/* ----------------------------------------------------------------- */}
            <section id="venue" className="scroll-mt-32 flex flex-col gap-8 text-left">
              <div className="flex flex-col gap-1.5 pb-6 border-b border-stone-200/80">
                <div className="relative flex flex-col items-start gap-2">
                  <span className="absolute -top-4 left-48 sm:left-72 text-6xl sm:text-8xl font-serif font-black italic text-[#8C6D23]/[0.06] select-none pointer-events-none tracking-tighter">
                    05
                  </span>
                  <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-gradient-to-r from-[#FBF6EE] via-[#F7EFE2] to-[#FAF3E8] border border-[#EADBCE] shadow-xs w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D23] animate-pulse" />
                    <span className="text-[10px] sm:text-[11px] font-serif font-bold tracking-[0.24em] text-[#8C6D23] uppercase">
                      CHAPTER 05 • VENUE &amp; ARRIVAL DOSSIER
                    </span>
                    <span className="text-[9px] text-[#C59B27] font-serif">✦</span>
                  </div>
                  <div className="flex items-center gap-2.5 mt-1 mb-1.5">
                    <div className="h-[1.5px] w-10 sm:w-14 bg-gradient-to-r from-[#7B1123] to-[#8C6D23]" />
                    <div className="w-1.5 h-1.5 rotate-45 border border-[#8C6D23] bg-[#F3BA2F]" />
                    <div className="h-[1px] w-20 sm:w-28 bg-gradient-to-r from-[#8C6D23]/60 to-transparent" />
                  </div>
                </div>
                <h2 className="text-3xl md:text-5xl font-serif font-black text-stone-900 tracking-tight leading-[1.1]">
                  Venue Protocols &amp; Arrival Intelligence
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                {/* Left: Map / Venue Frame */}
                <div className="md:col-span-7 bg-[#FCFAF6] border border-[#EADBCE] rounded-xl p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b border-[#EADBCE] pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <MapPin size={18} className="text-[#8C6D23]" />
                      <h4 className="text-sm font-serif font-black uppercase text-stone-900 tracking-wider">
                        {event.venue}
                      </h4>
                    </div>
                    <span className="text-[10px] font-serif font-bold text-[#7B1123] uppercase bg-[#7B1123]/5 border border-[#7B1123]/20 px-2.5 py-0.5 rounded-full">
                      {event.city}
                    </span>
                  </div>

                  {/* Embed Map or Fallback Display */}
                  <div className="w-full h-72 rounded-xl overflow-hidden border border-[#EADBCE] bg-stone-100 relative shadow-inner">
                    {event.googleMapEmbedUrl ? (
                      <iframe
                        src={event.googleMapEmbedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Venue Location Map"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3.5 p-6 text-center">
                        <MapPin size={36} className="text-[#8C6D23]" />
                        <span className="text-sm font-serif font-black uppercase text-stone-900">
                          {event.venue}, {event.city}
                        </span>
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(`${event.venue}, ${event.city}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#7B1123] hover:bg-[#961E34] text-[#F3BA2F] border border-[#C59B27]/50 px-5 py-2.5 rounded-xl text-xs font-serif font-bold uppercase tracking-wider shadow-xs transition-colors"
                        >
                          <Navigation size={13} /> Open in Google Maps
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-stone-500 font-sans">
                      Exact turnstile arrival gates will be indicated on your official E-Pass.
                    </span>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(`${event.venue}, ${event.city}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-serif font-bold uppercase tracking-wider text-[#7B1123] hover:text-[#961E34] flex items-center gap-1.5"
                    >
                      Route Directions <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                {/* Right: Arrival & Gate Briefing */}
                <div className="md:col-span-5 flex flex-col gap-6">
                  <div className="bg-[#FCFAF6] border border-[#EADBCE] rounded-xl p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-5">
                    <span className="text-[10px] font-serif font-bold tracking-widest uppercase text-[#7B1123]">
                      Arrival Concierge &amp; Turnstile Briefing
                    </span>

                    <div className="flex flex-col gap-3.5 bg-white border border-[#EADBCE] p-4 rounded-xl text-left shadow-xs">
                      <div className="flex flex-col gap-1 border-b border-stone-100 pb-3">
                        <span className="text-[8.5px] font-serif font-bold uppercase text-stone-500">Destination Hub</span>
                        <span className="text-sm font-serif font-black text-stone-900 uppercase truncate">{event.venue}</span>
                        <span className="text-[11px] text-stone-600 font-sans truncate">{event.city}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[8.5px] font-serif font-bold uppercase text-stone-500">Door &amp; Gate Clearance</span>
                        <span className="text-sm font-mono font-bold text-[#7B1123] uppercase">{event.time || "18:00"}</span>
                        <span className="text-[11px] text-stone-600 font-sans truncate">{event.date}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3.5 text-xs text-stone-600 font-sans mt-1">
                      <div className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-[#7B1123]/10 text-[#7B1123] border border-[#8C6D23]/30 font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                        <span className="leading-relaxed">Turnstiles open 60 minutes in advance. Save your E-Pass on your mobile device for instant NFC/QR scan-in.</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-[#7B1123]/10 text-[#7B1123] border border-[#8C6D23]/30 font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                        <span className="leading-relaxed">Valet and self-parking at {event.venue} is subject to availability. Pre-arranged executive ridesharing is recommended.</span>
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
              <section id="rules" className="scroll-mt-32 flex flex-col gap-8 text-left">
                <div className="flex flex-col gap-1.5 pb-6 border-b border-stone-200/80">
                  <div className="relative flex flex-col items-start gap-2">
                    <span className="absolute -top-4 left-48 sm:left-72 text-6xl sm:text-8xl font-serif font-black italic text-[#8C6D23]/[0.06] select-none pointer-events-none tracking-tighter">
                      06
                    </span>
                    <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-gradient-to-r from-[#FBF6EE] via-[#F7EFE2] to-[#FAF3E8] border border-[#EADBCE] shadow-xs w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D23] animate-pulse" />
                      <span className="text-[10px] sm:text-[11px] font-serif font-bold tracking-[0.24em] text-[#8C6D23] uppercase">
                        CHAPTER 06 • ETIQUETTE &amp; PROTOCOLS
                      </span>
                      <span className="text-[9px] text-[#C59B27] font-serif">✦</span>
                    </div>
                    <div className="flex items-center gap-2.5 mt-1 mb-1.5">
                      <div className="h-[1.5px] w-10 sm:w-14 bg-gradient-to-r from-[#7B1123] to-[#8C6D23]" />
                      <div className="w-1.5 h-1.5 rotate-45 border border-[#8C6D23] bg-[#F3BA2F]" />
                      <div className="h-[1px] w-20 sm:w-28 bg-gradient-to-r from-[#8C6D23]/60 to-transparent" />
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-serif font-black text-stone-900 tracking-tight leading-[1.1]">
                    The Gala Protocol &amp; House Code
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {event.rules.map((rule, idx) => {
                    const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
                    const roman = romanNumerals[idx] || String(idx + 1);
                    return (
                      <div key={idx} className="bg-[#FCFAF6] border border-[#EADBCE] hover:border-[#8C6D23] rounded-xl p-6 flex flex-col gap-3 shadow-xs transition-all duration-300">
                        <div className="flex items-center gap-2 text-[#7B1123] font-serif font-bold text-xs uppercase tracking-wider">
                          <CheckCircle2 size={16} className="text-[#8C6D23]" /> Protocol {roman}
                        </div>
                        <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed">
                          {rule}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 7: FREQUENTLY ASKED QUESTIONS                            */}
            {/* ----------------------------------------------------------------- */}
            {event.faqs && event.faqs.length > 0 && (
              <section id="faq" className="scroll-mt-36 flex flex-col gap-8 text-left">
                <div className="flex flex-col gap-1.5 pb-6 border-b border-stone-200/80">
                  <div className="relative flex flex-col items-start gap-2">
                    <span className="absolute -top-4 left-48 sm:left-72 text-6xl sm:text-8xl font-serif font-black italic text-[#8C6D23]/[0.06] select-none pointer-events-none tracking-tighter">
                      07
                    </span>
                    <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-gradient-to-r from-[#FBF6EE] via-[#F7EFE2] to-[#FAF3E8] border border-[#EADBCE] shadow-xs w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D23] animate-pulse" />
                      <span className="text-[10px] sm:text-[11px] font-serif font-bold tracking-[0.24em] text-[#8C6D23] uppercase">
                        CHAPTER 07 • CONCIERGE INQUIRIES
                      </span>
                      <span className="text-[9px] text-[#C59B27] font-serif">✦</span>
                    </div>
                    <div className="flex items-center gap-2.5 mt-1 mb-1.5">
                      <div className="h-[1.5px] w-10 sm:w-14 bg-gradient-to-r from-[#7B1123] to-[#8C6D23]" />
                      <div className="w-1.5 h-1.5 rotate-45 border border-[#8C6D23] bg-[#F3BA2F]" />
                      <div className="h-[1px] w-20 sm:w-28 bg-gradient-to-r from-[#8C6D23]/60 to-transparent" />
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-serif font-black text-stone-900 tracking-tight leading-[1.1]">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 font-sans mt-1">
                    Essential clarifications regarding passes, turnstiles, dress protocols, and hospitality services.
                  </p>
                </div>

                <div className="flex flex-col gap-3.5 w-full">
                  {event.faqs.map((faq, i) => {
                    const isOpen = faqOpen === i;
                    return (
                      <div
                        key={i}
                        className="border border-[#EADBCE] hover:border-[#8C6D23] rounded-xl overflow-hidden bg-white shadow-xs transition-all"
                      >
                        <button
                          onClick={() => setFaqOpen(isOpen ? null : i)}
                          className="w-full px-6 py-5 flex items-center justify-between text-left text-sm sm:text-base font-serif font-black uppercase text-stone-900 hover:bg-[#FCFAF6] transition-colors cursor-pointer gap-4 outline-none focus:outline-none"
                        >
                          <span>{faq.q}</span>
                          {isOpen ? (
                            <ChevronUp size={18} className="text-[#7B1123] shrink-0" />
                          ) : (
                            <ChevronDown size={18} className="text-stone-400 shrink-0" />
                          )}
                        </button>

                        {isOpen && (
                          <div className="px-6 pb-6 pt-1 text-xs sm:text-sm leading-relaxed text-stone-600 font-sans border-t border-stone-100 bg-[#FCFAF6]/50">
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
              <section id="commercial" className="scroll-mt-32 flex flex-col gap-8 text-left">
                {/* Heading & Subtitle Block matching Reference Design */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-stone-200/80">
                  <div className="flex flex-col text-left">
                    <div className="relative flex flex-col items-start gap-2">
                      <span className="absolute -top-4 left-48 sm:left-72 text-6xl sm:text-8xl font-serif font-black italic text-[#8C6D23]/[0.06] select-none pointer-events-none tracking-tighter">
                        08
                      </span>
                      <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-gradient-to-r from-[#FBF6EE] via-[#F7EFE2] to-[#FAF3E8] border border-[#EADBCE] shadow-xs w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D23] animate-pulse" />
                        <span className="text-[10px] sm:text-[11px] font-serif font-bold tracking-[0.24em] text-[#8C6D23] uppercase">
                          CHAPTER 08 • PARTNERSHIP &amp; COMMERCIAL PROSPECTUS
                        </span>
                        <span className="text-[9px] text-[#C59B27] font-serif">✦</span>
                      </div>
                      <div className="flex items-center gap-2.5 mt-1 mb-1.5">
                        <div className="h-[1.5px] w-10 sm:w-14 bg-gradient-to-r from-[#7B1123] to-[#8C6D23]" />
                        <div className="w-1.5 h-1.5 rotate-45 border border-[#8C6D23] bg-[#F3BA2F]" />
                        <div className="h-[1px] w-20 sm:w-28 bg-gradient-to-r from-[#8C6D23]/60 to-transparent" />
                      </div>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-serif font-black uppercase tracking-tight text-stone-900 leading-tight">
                      Partnership &amp; Sponsorship Opportunities
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600 font-sans max-w-2xl leading-relaxed mt-2 font-normal">
                      Associate your brand with {event.name} and reach a highly targeted audience across {event.category ? event.category.toLowerCase() : "food, hospitality, catering, wedding and tourism"} industries.
                    </p>
                  </div>

                  {/* Optional Switcher between Sponsorships, Stalls, and Ads */}
                  {(event.stallOptions.length > 0 || event.adRates.length > 0) && (
                    <div className="flex bg-[#FCFAF6] border border-[#EADBCE] p-1 rounded-xl gap-1 shrink-0 self-start sm:self-auto">
                      {event.sponsorshipTiers.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setCommercialTab("sponsorship")}
                          className={`px-4 py-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            commercialTab === "sponsorship"
                              ? "bg-[#7B1123] text-[#F3BA2F] border border-[#C59B27]/50 shadow-sm"
                              : "text-stone-700 hover:text-[#7B1123]"
                          }`}
                        >
                          Sponsorships ({event.sponsorshipTiers.length})
                        </button>
                      )}
                      {event.stallOptions.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setCommercialTab("stalls")}
                          className={`px-4 py-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            commercialTab === "stalls"
                              ? "bg-[#7B1123] text-[#F3BA2F] border border-[#C59B27]/50 shadow-sm"
                              : "text-stone-700 hover:text-[#7B1123]"
                          }`}
                        >
                          Stalls ({event.stallOptions.length})
                        </button>
                      )}
                      {event.adRates.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setCommercialTab("ads")}
                          className={`px-4 py-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            commercialTab === "ads"
                              ? "bg-[#7B1123] text-[#F3BA2F] border border-[#C59B27]/50 shadow-sm"
                              : "text-stone-700 hover:text-[#7B1123]"
                          }`}
                        >
                          Directory Ads ({event.adRates.length})
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Main Content Area */}
                <div className="w-full">
                  {commercialTab === "sponsorship" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                      {event.sponsorshipTiers.map((tier, i) => {
                        const isTopTier =
                          i < 2 ||
                          tier.tier.toLowerCase().includes("presenter") ||
                          tier.tier.toLowerCase().includes("title sponsor");

                        return (
                          <div
                            key={i}
                            className={`rounded-xl p-6 sm:p-7 flex flex-col justify-between min-h-[290px] transition-all duration-200 hover:-translate-y-1 ${
                              isTopTier
                                ? "bg-[#4E121E] text-white shadow-[0_8px_30px_rgba(78,18,30,0.22)] border border-[#6E1C2C]"
                                : "bg-white text-[#1C0509] shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-[#EADBCE] hover:border-[#C59B27]/40"
                            }`}
                          >
                            <div>
                              <h3
                                className={`font-serif font-bold text-sm sm:text-base uppercase tracking-wider ${
                                  isTopTier ? "text-white" : "text-[#1C0509]"
                                }`}
                              >
                                {tier.tier}
                              </h3>
                              <div
                                className={`font-serif font-bold text-2xl sm:text-3xl mt-3 tracking-tight ${
                                  isTopTier ? "text-[#E5A93C]" : "text-[#541520]"
                                }`}
                              >
                                {tier.amount}
                              </div>
                              {tier.benefits && (
                                <p
                                  className={`text-xs mt-3 line-clamp-3 leading-relaxed font-sans ${
                                    isTopTier ? "text-stone-300" : "text-stone-600"
                                  }`}
                                >
                                  {tier.benefits}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col gap-2.5 mt-6">
                              <button
                                type="button"
                                onClick={() =>
                                  setCommercialInquiry({
                                    title: `${tier.tier} Sponsorship`,
                                    category: "Sponsorship",
                                    amount: tier.amount,
                                    mode: "proposal",
                                  })
                                }
                                className={`w-full py-2.5 px-3 rounded-xl text-xs font-serif font-semibold transition-all text-center cursor-pointer border ${
                                  isTopTier
                                    ? "border-[#8C3A48] hover:border-[#E5A93C] text-stone-200 hover:text-white bg-[#3B0E16]/80 hover:bg-[#3B0E16]"
                                    : "border-[#D5BE99] hover:border-[#B88E3E] text-[#541520] hover:bg-[#541520]/5 bg-transparent"
                                }`}
                              >
                                Request Proposal
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setCommercialInquiry({
                                    title: `${tier.tier} Sponsorship`,
                                    category: "Sponsorship",
                                    amount: tier.amount,
                                    mode: "apply",
                                  })
                                }
                                className="w-full py-2.5 px-3 rounded-xl bg-[#B88E3E] hover:bg-[#A37B30] text-white text-xs font-serif font-bold transition-all text-center cursor-pointer shadow-sm hover:shadow-md"
                              >
                                Apply Now
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {commercialTab === "stalls" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {event.stallOptions.map((stall, i) => (
                        <div
                          key={i}
                          className="bg-white border border-[#EADBCE] hover:border-[#C59B27]/40 rounded-xl p-6 flex flex-col justify-between gap-5 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:-translate-y-1"
                        >
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <h4 className="text-base font-serif font-bold text-[#1C0509] uppercase">
                                {stall.type}
                              </h4>
                              <span className="text-lg font-serif font-bold text-[#541520]">
                                {stall.rate}
                              </span>
                            </div>
                            <span className="text-[11px] font-serif text-stone-500 uppercase tracking-wide">
                              Booth Dimension: {stall.size}
                            </span>
                            {stall.includes && (
                              <p className="text-xs text-stone-600 font-sans mt-2 leading-relaxed">
                                Entitlements: {stall.includes}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setCommercialInquiry({
                                  title: `${stall.type} Stall (${stall.size})`,
                                  category: "Stall Booking",
                                  amount: stall.rate,
                                  mode: "proposal",
                                })
                              }
                              className="w-full py-2 px-3 rounded-xl border border-[#D5BE99] hover:border-[#B88E3E] text-[#541520] hover:bg-[#541520]/5 text-xs font-serif font-semibold transition-all text-center cursor-pointer"
                            >
                              Request Floorplan &amp; Details
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setCommercialInquiry({
                                  title: `${stall.type} Stall (${stall.size})`,
                                  category: "Stall Booking",
                                  amount: stall.rate,
                                  mode: "apply",
                                })
                              }
                              className="w-full py-2 px-3 rounded-xl bg-[#B88E3E] hover:bg-[#A37B30] text-white text-xs font-serif font-bold transition-all text-center cursor-pointer shadow-sm"
                            >
                              Reserve Booth
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {commercialTab === "ads" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {event.adRates.map((rate, i) => (
                        <div
                          key={i}
                          className="bg-white border border-[#EADBCE] hover:border-[#C59B27]/40 rounded-xl p-6 flex flex-col justify-between gap-4 text-center transition-all shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:-translate-y-1"
                        >
                          <div className="flex flex-col gap-1.5">
                            <span className="text-xs text-stone-600 font-serif uppercase tracking-wider font-bold">
                              {rate.category}
                            </span>
                            <span className="text-2xl font-serif font-bold text-[#541520]">
                              {rate.amount}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setCommercialInquiry({
                                title: `${rate.category} Directory Ad`,
                                category: "Directory Ad",
                                amount: rate.amount,
                                mode: "apply",
                              })
                            }
                            className="w-full py-2.5 px-3 rounded-xl bg-[#B88E3E] hover:bg-[#A37B30] text-white text-xs font-serif font-bold transition-all text-center cursor-pointer shadow-sm"
                          >
                            Book Ad Placement
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 9: EVENT CUSTODIANS & VERIFIED ORGANIZERS                 */}
            {/* ----------------------------------------------------------------- */}
            <section id="custodians" className="scroll-mt-32 flex flex-col gap-8 text-left">
              <div className="flex flex-col gap-1.5 pb-6 border-b border-stone-200/80">
                <div className="relative flex flex-col items-start gap-2">
                  <span className="absolute -top-4 left-48 sm:left-72 text-6xl sm:text-8xl font-serif font-black italic text-[#8C6D23]/[0.06] select-none pointer-events-none tracking-tighter">
                    09
                  </span>
                  <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-gradient-to-r from-[#FBF6EE] via-[#F7EFE2] to-[#FAF3E8] border border-[#EADBCE] shadow-xs w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D23] animate-pulse" />
                    <span className="text-[10px] sm:text-[11px] font-serif font-bold tracking-[0.24em] text-[#8C6D23] uppercase">
                      CHAPTER 09 • THE ROYAL SEAL OF PROVENANCE
                    </span>
                    <span className="text-[9px] text-[#C59B27] font-serif">✦</span>
                  </div>
                  <div className="flex items-center gap-2.5 mt-1 mb-1.5">
                    <div className="h-[1.5px] w-10 sm:w-14 bg-gradient-to-r from-[#7B1123] to-[#8C6D23]" />
                    <div className="w-1.5 h-1.5 rotate-45 border border-[#8C6D23] bg-[#F3BA2F]" />
                    <div className="h-[1px] w-20 sm:w-28 bg-gradient-to-r from-[#8C6D23]/60 to-transparent" />
                  </div>
                </div>
                <h2 className="text-3xl md:text-5xl font-serif font-black text-stone-900 tracking-tight leading-[1.1]">
                  Official Custodians &amp; Concierge Desk
                </h2>
              </div>

              <div className="bg-[#FCFAF6] border border-[#EADBCE] rounded-xl p-8 sm:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.03)] relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-[#7B1123] border border-[#C59B27] flex items-center justify-center text-[#F3BA2F] shadow-md shrink-0">
                        <ShieldCheck size={32} />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-[9.5px] font-serif font-bold uppercase tracking-widest text-stone-500">Official Host &amp; Curator</span>
                          <span className="text-[9px] font-serif font-bold uppercase text-[#7B1123] bg-[#7B1123]/5 px-2.5 py-0.5 rounded-full border border-[#7B1123]/20">
                            ● Verified Organizer
                          </span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-serif font-black uppercase text-stone-900 mt-0.5">
                          {event.organizer.name}
                        </h3>
                      </div>
                    </div>

                    {event.organizer.contact && (
                      <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed">
                        {event.organizer.contact}
                      </p>
                    )}

                    {/* Organizer Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="bg-white border border-[#EADBCE] rounded-xl p-4 flex flex-col gap-1 shadow-xs">
                        <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#7B1123]">Authenticity Guarantee</span>
                        <span className="text-xs font-semibold text-stone-800">100% Genuine Passes</span>
                      </div>
                      <div className="bg-white border border-[#EADBCE] rounded-xl p-4 flex flex-col gap-1 shadow-xs">
                        <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#7B1123]">Concierge Support</span>
                        <span className="text-xs font-semibold text-stone-800">Direct Inquiries Desk</span>
                      </div>
                      <div className="bg-white border border-[#EADBCE] rounded-xl p-4 flex flex-col gap-1 shadow-xs">
                        <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#7B1123]">Secure Clearance</span>
                        <span className="text-xs font-semibold text-stone-800">Encrypted QR Turnstiles</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Direct Contact Helpline */}
                  <div className="lg:col-span-5 bg-white border border-[#EADBCE] rounded-xl p-7 flex flex-col gap-4 shadow-xs">
                    <h4 className="text-xs font-serif font-black uppercase text-stone-900 tracking-wider">
                      Concierge Desk &amp; Direct Support
                    </h4>
                    <div className="flex flex-col gap-3.5 text-xs font-serif font-bold">
                      {event.organizer.email && (
                        <a
                          href={`mailto:${event.organizer.email}`}
                          className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#FCFAF6] hover:bg-[#7B1123]/5 border border-[#EADBCE] text-stone-800 hover:text-[#7B1123] transition-colors"
                        >
                          <div className="w-10 h-10 rounded-xl bg-[#7B1123] border border-[#C59B27]/40 flex items-center justify-center text-[#F3BA2F] shrink-0">
                            <Mail size={16} />
                          </div>
                          <div className="flex flex-col truncate text-left">
                            <span className="text-[9px] uppercase tracking-wider text-stone-400 font-sans font-medium">Official Liaison</span>
                            <span className="truncate">{event.organizer.email}</span>
                          </div>
                        </a>
                      )}
                      {event.organizer.phone && (
                        <a
                          href={`tel:${event.organizer.phone}`}
                          className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#FCFAF6] hover:bg-[#7B1123]/5 border border-[#EADBCE] text-stone-800 hover:text-[#7B1123] transition-colors"
                        >
                          <div className="w-10 h-10 rounded-xl bg-[#7B1123] border border-[#C59B27]/40 flex items-center justify-center text-[#F3BA2F] shrink-0">
                            <Phone size={16} />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-[9px] uppercase tracking-wider text-stone-400 font-sans font-medium">Liaison Helpline</span>
                            <span>{event.organizer.phone}</span>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 10: GRAND CLOSING LANDING BANNER                          */}
            {/* ----------------------------------------------------------------- */}
            <section id="cta" className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#2E070F] via-[#1B0307] to-[#0D0104] border border-[#D4AF37]/50 p-10 sm:p-16 lg:p-20 text-center text-white shadow-[0_25px_80px_rgba(46,7,15,0.4)]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#C59B27]/25 via-transparent to-transparent pointer-events-none" />

              <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7B1123] border border-[#C59B27] text-[#F3BA2F] text-[10px] font-serif font-bold tracking-[0.25em] uppercase shadow-md">
                  <Sparkles size={12} className="text-[#F3BA2F]" />
                  Secure Your Attendance Today
                </span>

                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black uppercase tracking-tight text-[#E8C766] leading-tight">
                  Experience {event.name} Live in {event.city}
                </h2>

                <p className="text-xs sm:text-sm md:text-base text-stone-200 font-sans max-w-2xl leading-relaxed">
                  Join fellow culture, art, and heritage enthusiasts for this landmark celebration on {event.date} at {event.venue}. Passes are strictly limited per arena zone.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  {event.ticketPrices.length > 0 && (
                    <button
                      onClick={() => setActiveWizard("booking")}
                      className="inline-flex items-center gap-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-[#1A0307] border border-[#E5C158] px-8 py-4 rounded-full font-serif font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_6px_25px_rgba(212,175,55,0.45)] transform hover:-translate-y-0.5 transition-all cursor-pointer"
                    >
                      <Ticket size={18} />
                      <span>Book Passes Now</span>
                      <ArrowRight size={16} />
                    </button>
                  )}

                  {event.scheduleDays.length > 0 && (
                    <a
                      href="#schedule"
                      className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-[#C59B27]/40 text-[#F3BA2F] px-7 py-4 rounded-full font-serif font-bold text-xs sm:text-sm uppercase tracking-wider transition-all"
                    >
                      <Calendar size={16} />
                      <span>View Schedule</span>
                    </a>
                  )}

                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/15 border border-white/20 text-stone-200 hover:text-white px-6 py-4 rounded-full font-serif font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <Share2 size={16} />
                    <span>{copiedLink ? "Link Copied!" : "Share Event"}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 pt-5 text-[10px] font-mono font-bold tracking-widest uppercase text-stone-300 border-t border-[#C59B27]/30 w-full mt-2">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#F3BA2F]" /> Instant E-Pass Delivery
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#F3BA2F]" /> Verified Host
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#F3BA2F]" /> Fast-Track QR Turnstiles
                  </span>
                </div>
              </div>
            </section>

      </div>

      {/* Mobile Fixed Bottom Action Bar */}
      {(event.ticketPrices.length > 0 || (event.registrationFee !== undefined && event.registrationFee > 0)) && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#C59B27]/40 px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-8px_30px_rgba(123,17,35,0.12)]">
          <div className="flex flex-col text-left truncate">
            <span className="text-[9px] font-primary font-bold uppercase text-stone-500 tracking-wider">
              {event.ticketPrices.length > 0 ? "Entry Passes" : "Contestant Fee"}
            </span>
            <span className="text-base font-black font-primary text-[#7B1123] leading-tight">
              {minPrice !== null ? `₹${minPrice.toLocaleString()}` : event.registrationFee ? `₹${event.registrationFee}` : "Free"}
            </span>
            <span className="text-[9.5px] text-stone-600 font-secondary truncate">
              {event.city} • {event.date}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {event.ticketPrices.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveWizard("booking")}
                className="bg-gradient-to-r from-[#7B1123] to-[#961E34] hover:from-[#961E34] hover:to-[#7B1123] text-[#F3BA2F] border border-[#C59B27] px-5 py-2.5 rounded-xl font-primary font-black text-xs uppercase tracking-wider shadow-md shadow-[#7B1123]/30 active:scale-95 transition-all cursor-pointer"
              >
                Book Pass
              </button>
            )}
            {event.registrationFee !== undefined && event.registrationFee > 0 && !event.ticketPrices.length && (
              <button
                type="button"
                onClick={() => setActiveWizard("registration")}
                className="bg-gradient-to-r from-[#7B1123] to-[#961E34] hover:from-[#961E34] hover:to-[#7B1123] text-[#F3BA2F] border border-[#C59B27] px-5 py-2.5 rounded-xl font-primary font-black text-xs uppercase tracking-wider shadow-md shadow-[#7B1123]/30 active:scale-95 transition-all cursor-pointer"
              >
                Register
              </button>
            )}
          </div>
        </div>
      )}

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
      <div className="w-full max-w-lg bg-white relative rounded-xl shadow-2xl border border-[#C59B27]/50 overflow-hidden flex flex-col max-h-[92vh]">

        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-[#C59B27]/20 flex items-center justify-between shrink-0 bg-[#FCFBF7]">
          <div className="flex flex-col text-left">
            <span className="text-[8px] font-primary font-bold tracking-widest text-[#C59B27] uppercase">
              Official Reservation Gateway
            </span>
            <h3 className="font-black text-[#1C0509] font-primary text-sm sm:text-base uppercase tracking-wider">
              Book Audience Pass
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-[#7B1123]/10 flex items-center justify-center text-stone-600 hover:text-[#7B1123] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Wizard Stepper Progress Bar */}
        <div className="px-6 py-2.5 bg-[#FCFBF7] border-b border-[#C59B27]/20 flex items-center justify-between text-[9px] font-primary font-bold uppercase tracking-wider">
          {["1. Tier", "2. Qty", "3. Info", "4. Checkout", "5. E-Pass"].map((s, idx) => (
            <span
              key={idx}
              className={`${step === idx + 1
                  ? "text-[#7B1123] font-black underline decoration-[#C59B27] underline-offset-4"
                  : step > idx + 1
                    ? "text-[#C59B27] font-bold"
                    : "text-stone-400"
                }`}
            >
              {s}
            </span>
          ))}
        </div>

        {/* Wizard Dynamic Body */}
        <div className="p-6 overflow-y-auto flex-grow text-left">
          {error && (
            <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-700 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Select Tier */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-primary font-bold uppercase tracking-widest text-[#7B1123]">
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
                      className={`p-4 rounded-xl border transition-all flex justify-between items-start gap-4 ${soldOut
                          ? "border-stone-200 bg-stone-100 opacity-50 cursor-not-allowed"
                          : isSelected
                            ? "border-[#C59B27] bg-[#7B1123]/5 shadow-md cursor-pointer"
                            : "border-stone-200 bg-[#FCFBF7] hover:border-[#C59B27]/60 hover:bg-stone-50 cursor-pointer shadow-sm"
                        }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-[#1C0509] uppercase font-primary">
                            {ticket.type}
                          </h5>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-[#7B1123]" />}
                        </div>
                        <p className="text-xs text-stone-600 mt-0.5 leading-normal">
                          {ticket.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-black text-base font-primary text-[#7B1123]">
                          ₹{(ticket.price ?? 0).toLocaleString()}
                        </span>
                        <span className={`text-[9.5px] block font-primary font-bold ${soldOut ? "text-stone-400" : isSelected ? "text-[#C59B27]" : "text-[#7B1123]"
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
                className="bg-gradient-to-r from-[#7B1123] to-[#961E34] hover:from-[#961E34] hover:to-[#7B1123] text-[#F3BA2F] border border-[#C59B27] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl py-3.5 font-primary font-black text-xs uppercase tracking-wider transition-all w-full mt-2 cursor-pointer shadow-md"
              >
                Proceed to Quantity
              </button>
            </div>
          )}

          {/* STEP 2: Quantity */}
          {step === 2 && (
            <div className="flex flex-col gap-4 text-center py-4">
              <span className="text-[10px] font-primary font-bold uppercase tracking-widest text-[#7B1123] text-left">
                2. Select Number of Passes
              </span>

              <div className="bg-[#FCFBF7] border border-[#C59B27]/30 p-6 max-w-xs mx-auto w-full flex items-center justify-between rounded-xl mt-2 shadow-inner">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border border-[#C59B27]/40 hover:border-[#C59B27] hover:bg-[#7B1123] hover:text-[#F3BA2F] text-stone-800 flex items-center justify-center font-bold text-lg cursor-pointer transition-colors"
                >
                  -
                </button>
                <div className="flex flex-col">
                  <span className="text-3xl font-black font-primary text-[#1C0509]">{quantity}</span>
                  <span className="text-[9px] uppercase font-primary text-[#C59B27] font-bold">Passes</span>
                </div>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(maxAllowedQty, quantity + 1))}
                  disabled={quantity >= maxAllowedQty}
                  className="w-10 h-10 rounded-full border border-[#C59B27]/40 hover:border-[#C59B27] hover:bg-[#7B1123] hover:text-[#F3BA2F] text-stone-800 flex items-center justify-center font-bold text-lg cursor-pointer transition-colors disabled:opacity-30"
                >
                  +
                </button>
              </div>

              <p className="text-xs text-stone-600 font-secondary">
                {maxAllowedQty < 10
                  ? `Only ${maxAllowedQty} passes left for ${selectedTicket?.type}.`
                  : "Maximum of 10 passes permitted per booking session."}
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="border border-stone-200 text-stone-600 hover:border-[#C59B27]/40 hover:text-[#7B1123] rounded-xl py-3 px-6 text-xs font-primary font-bold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-gradient-to-r from-[#7B1123] to-[#961E34] hover:from-[#961E34] hover:to-[#7B1123] text-[#F3BA2F] border border-[#C59B27] rounded-xl py-3 flex-grow text-xs font-primary font-black uppercase tracking-wider cursor-pointer shadow-md transition-all"
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
              <span className="text-[10px] font-primary font-bold uppercase tracking-widest text-[#7B1123]">
                3. Primary Attendee Information
              </span>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-stone-700">Full Legal Name *</label>
                <input
                  type="text"
                  placeholder="Attendee full name"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl bg-white shadow-sm border border-stone-200 px-4 py-3 text-stone-900 outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]/30"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-stone-700">Email Address *</label>
                <input
                  type="email"
                  placeholder="attendee@example.com"
                  value={visitorEmail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl bg-white shadow-sm border border-stone-200 px-4 py-3 text-stone-900 outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]/30"
                  required
                />
              </div>

              <div className={showBookingCity ? "grid grid-cols-2 gap-3" : ""}>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-700">Mobile Number *</label>
                  <input
                    type="tel"
                    placeholder="99999 88888"
                    value={visitorMobile}
                    onChange={(e) => setVisitorMobile(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl bg-white shadow-sm border border-stone-200 px-4 py-3 text-stone-900 outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]/30"
                    required
                  />
                </div>
                {showBookingCity && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-stone-700">City *</label>
                    <input
                      type="text"
                      placeholder="Bangalore"
                      value={visitorCity}
                      onChange={(e) => setVisitorCity(e.target.value)}
                      className="w-full text-xs sm:text-sm rounded-xl bg-white shadow-sm border border-stone-200 px-4 py-3 text-stone-900 outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]/30"
                      required
                    />
                  </div>
                )}
              </div>

              {showBookingNotes && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-700">Special Notes (Optional)</label>
                  <textarea
                    placeholder="Wheelchair seating, parking assistance etc."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl bg-white shadow-sm border border-stone-200 px-4 py-2.5 text-stone-900 outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]/30 h-16 resize-none"
                  />
                </div>
              )}

              <div className="flex gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="border border-stone-200 text-stone-600 hover:border-[#C59B27]/40 hover:text-[#7B1123] rounded-xl py-3 px-6 text-xs font-primary font-bold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#7B1123] to-[#961E34] hover:from-[#961E34] hover:to-[#7B1123] text-[#F3BA2F] border border-[#C59B27] rounded-xl py-3 flex-grow text-xs font-primary font-black uppercase tracking-wider cursor-pointer shadow-md transition-all"
                >
                  Review &amp; Checkout
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Review & Payment Simulator */}
          {step === 4 && (
            <div className="flex flex-col gap-5">
              <span className="text-[10px] font-primary font-bold uppercase tracking-widest text-[#7B1123]">
                4. Review Order &amp; Gateway
              </span>

              {/* Order Breakdown Box */}
              <div className="bg-[#FCFBF7] border border-[#C59B27]/30 p-4 rounded-xl flex flex-col gap-2.5">
                <div className="flex justify-between text-xs text-stone-600">
                  <span>Festival Event</span>
                  <span className="font-bold text-[#1C0509] truncate max-w-[200px]">{event.name}</span>
                </div>
                <div className="flex justify-between text-xs text-stone-600">
                  <span>Ticket Tier</span>
                  <span className="font-bold text-[#7B1123]">{selectedTicket?.type}</span>
                </div>
                <div className="flex justify-between text-xs text-stone-600">
                  <span>Pass Quantity</span>
                  <span className="font-bold text-[#1C0509]">{quantity}</span>
                </div>
                <div className="flex justify-between text-xs text-stone-600">
                  <span>Attendee</span>
                  <span className="font-bold text-[#1C0509]">{visitorName}</span>
                </div>
                <div className="border-t border-[#C59B27]/20 pt-2.5 flex justify-between text-sm">
                  <span className="font-black font-primary text-[#1C0509] uppercase">Total Amount</span>
                  <span className="font-black font-primary text-[#7B1123] text-lg">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Razorpay Simulator */}
              <div className="border border-[#C59B27]/30 rounded-xl overflow-hidden bg-white p-5 flex flex-col gap-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <span className="text-xs font-black font-primary text-[#1C0509] tracking-widest">
                    RAZORPAY SECURE GATEWAY
                  </span>
                  <div className="bg-[#7B1123]/10 text-[#7B1123] border border-[#C59B27]/40 rounded px-2 py-0.5 text-[8px] font-bold">
                    256-BIT ENCRYPTED
                  </div>
                </div>

                {isProcessing ? (
                  <div className="py-8 flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[#7B1123] border-t-[#C59B27] rounded-full animate-spin" />
                    <span className="text-xs text-[#7B1123] font-primary font-bold animate-pulse">
                      Authorizing simulated payment gateway...
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] text-stone-500 font-primary font-bold uppercase">
                        Select Payment Method
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {["UPI", "Credit / Debit Card", "Net Banking", "Wallets"].map((method) => (
                          <div
                            key={method}
                            onClick={() => setPaymentMethod(method)}
                            className={`p-3 rounded-xl border text-center text-xs font-bold font-primary uppercase cursor-pointer transition-all ${paymentMethod === method
                                ? "border-[#C59B27] bg-[#7B1123]/10 text-[#7B1123]"
                                : "border-stone-200 text-stone-600 hover:border-[#C59B27]/40"
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
                      className="bg-gradient-to-r from-[#7B1123] via-[#961E34] to-[#7B1123] text-[#F3BA2F] border border-[#C59B27] rounded-xl py-3.5 text-xs font-black font-primary uppercase tracking-wider shadow-lg shadow-[#7B1123]/30 w-full transition-all cursor-pointer hover:brightness-110"
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
                  className="border border-stone-200 text-stone-600 hover:border-[#C59B27]/40 hover:text-[#7B1123] rounded-xl py-2.5 text-xs font-primary font-bold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Back to Attendee Info
                </button>
              )}
            </div>
          )}

          {/* STEP 5: Success Pass */}
          {step === 5 && completedBooking && (
            <div className="flex flex-col items-center gap-5 text-center py-2">
              <div className="w-14 h-14 rounded-full bg-[#7B1123] border border-[#C59B27] text-[#F3BA2F] flex items-center justify-center text-2xl shadow-lg">
                <Check size={28} />
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-black text-[#1C0509] font-primary uppercase tracking-tight">
                  Pass Reservation Confirmed!
                </h4>
                <p className="text-stone-600 text-xs mt-1 font-secondary">
                  Your digital E-Pass credentials have been generated and sent to your email.
                </p>
              </div>

              {/* Printable Ticket Pass Layout */}
              <div className="w-full border border-dashed border-[#C59B27] rounded-xl bg-gradient-to-br from-[#4A0814] via-[#2A050B] to-[#140205] p-5 flex flex-col gap-4 text-left relative overflow-hidden shadow-2xl text-white">
                <div className="flex justify-between items-start border-b border-[#C59B27]/30 pb-3">
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-[#F3BA2F] font-bold font-primary">
                      RECHARGE NATION ENTRY PASS
                    </span>
                    <h5 className="font-black text-white text-sm sm:text-base uppercase font-primary mt-0.5 truncate max-w-[220px]">
                      {completedBooking.eventName}
                    </h5>
                  </div>
                  <div className="text-right">
                    <span className="text-[7.5px] text-stone-400 block uppercase font-bold font-primary">
                      BOOKING REF
                    </span>
                    <span className="font-primary text-xs font-bold text-[#F3BA2F] uppercase">
                      {completedBooking.bookingRef}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs py-1">
                  <div>
                    <span className="text-[7.5px] text-stone-400 uppercase font-primary font-bold block">
                      Attendee Name
                    </span>
                    <span className="font-bold text-white truncate block">{completedBooking.visitorName}</span>
                  </div>
                  <div>
                    <span className="text-[7.5px] text-stone-400 uppercase font-primary font-bold block">
                      Tier &amp; Qty
                    </span>
                    <span className="font-bold text-[#F3BA2F] truncate block">
                      {completedBooking.ticketType} x {completedBooking.quantity}
                    </span>
                  </div>
                  <div>
                    <span className="text-[7.5px] text-stone-400 uppercase font-primary font-bold block">
                      Date &amp; Schedule
                    </span>
                    <span className="font-bold text-stone-300 truncate block">{completedBooking.eventDate}</span>
                  </div>
                  <div>
                    <span className="text-[7.5px] text-stone-400 uppercase font-primary font-bold block">
                      Venue Gate
                    </span>
                    <span className="font-bold text-stone-300 truncate block">{completedBooking.eventVenue}</span>
                  </div>
                </div>

                {/* QR Code Bar */}
                <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#C59B27]/30">
                  <div className="flex flex-col text-[9.5px] text-stone-300">
                    <span>* Please have this digital or printed pass ready at gates.</span>
                    <span>* Photo ID verification mandatory for admission.</span>
                  </div>
                  <div className="w-14 h-14 bg-white p-1 rounded-xl flex items-center justify-center shrink-0 border border-[#C59B27]/50 shadow-md">
                    <QrCode size={44} className="text-black" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 w-full mt-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="border border-[#C59B27]/40 text-[#7B1123] hover:bg-[#7B1123]/5 rounded-xl py-3 flex-grow text-xs font-primary font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Printer size={14} /> Download E-Pass
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push("/dashboard");
                  }}
                  className="bg-gradient-to-r from-[#7B1123] to-[#961E34] hover:from-[#961E34] hover:to-[#7B1123] text-[#F3BA2F] border border-[#C59B27] rounded-xl py-3 px-6 text-xs font-primary font-black uppercase tracking-wider cursor-pointer shadow-md transition-all"
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
      <div className="w-full max-w-lg bg-white relative rounded-xl shadow-2xl border border-[#C59B27]/50 overflow-hidden flex flex-col max-h-[92vh]">

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#C59B27]/20 flex items-center justify-between shrink-0 bg-[#FCFBF7]">
          <div className="flex flex-col text-left">
            <span className="text-[8px] font-primary font-bold tracking-widest text-[#C59B27] uppercase">
              Competitor Accreditation
            </span>
            <h3 className="font-black text-[#1C0509] font-primary text-sm sm:text-base uppercase tracking-wider">
              Competition Registration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-[#7B1123]/10 flex items-center justify-center text-stone-600 hover:text-[#7B1123] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-grow text-left">
          {error && (
            <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-700 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Category */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-primary font-bold uppercase tracking-widest text-[#7B1123]">
                1. Select Competition Class
              </span>
              <div className="flex flex-col gap-3">
                {categories.map((cat) => {
                  const selected = category === cat.name;
                  return (
                    <div
                      key={cat.name}
                      onClick={() => setCategory(cat.name)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${selected
                          ? "border-[#C59B27] bg-[#7B1123]/5 text-[#1C0509] shadow-md"
                          : "border-stone-200 bg-[#FCFBF7] hover:border-[#C59B27]/60 text-stone-700 shadow-sm"
                        }`}
                    >
                      <div className="flex flex-col">
                        <h5 className="font-bold text-sm font-primary uppercase text-[#1C0509]">
                          {cat.name}
                        </h5>
                        <span className="text-[9.5px] uppercase font-primary text-[#7B1123] font-bold mt-0.5">
                          Accreditation Fee: ₹{cat.fee}
                        </span>
                      </div>
                      <span className="font-black font-primary text-[#7B1123] text-base">₹{cat.fee}</span>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-gradient-to-r from-[#7B1123] to-[#961E34] hover:from-[#961E34] hover:to-[#7B1123] text-[#F3BA2F] border border-[#C59B27] rounded-xl py-3.5 font-primary font-black text-xs uppercase tracking-wider transition-all w-full mt-2 cursor-pointer shadow-md"
              >
                Enter Participant Information
              </button>
            </div>
          )}

          {/* STEP 2: Participant Details */}
          {step === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="flex flex-col gap-3.5">
              <span className="text-[10px] font-primary font-bold uppercase tracking-widest text-[#7B1123]">
                2. Participant Credentials
              </span>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-stone-700">Full Legal Name *</label>
                <input
                  type="text"
                  placeholder="Participant name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl bg-white border border-stone-200 px-4 py-2.5 text-stone-900 outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]/30 shadow-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-700">Date of Birth *</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl bg-white border border-stone-200 px-4 py-2.5 text-stone-900 outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]/30 shadow-sm"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-700">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl bg-white border border-stone-200 px-4 py-2.5 text-stone-900 outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]/30 shadow-sm"
                  >
                    <option value="Male" className="bg-white text-stone-900">Male</option>
                    <option value="Female" className="bg-white text-stone-900">Female</option>
                    <option value="Other" className="bg-white text-stone-900">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-700">Email *</label>
                  <input
                    type="email"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl bg-white border border-stone-200 px-4 py-2.5 text-stone-900 outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]/30 shadow-sm"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-700">Mobile *</label>
                  <input
                    type="tel"
                    placeholder="99999 88888"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl bg-white border border-stone-200 px-4 py-2.5 text-stone-900 outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]/30 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-700">City *</label>
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl bg-white border border-stone-200 px-4 py-2.5 text-stone-900 outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]/30 shadow-sm"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-700">State *</label>
                  <input
                    type="text"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl bg-white border border-stone-200 px-4 py-2.5 text-stone-900 outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]/30 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-700">Residential Address</label>
                  <input
                    type="text"
                    placeholder="Address / Street"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl bg-white border border-stone-200 px-4 py-2.5 text-stone-900 outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]/30 shadow-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-700">School / Institution</label>
                  <input
                    type="text"
                    placeholder="Academy or College"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl bg-white border border-stone-200 px-4 py-2.5 text-stone-900 outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]/30 shadow-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-stone-700">Emergency Contact Mobile *</label>
                <input
                  type="tel"
                  placeholder="Guardian / Parent mobile"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl bg-white border border-stone-200 px-4 py-2.5 text-stone-900 outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]/30 shadow-sm"
                  required
                />
              </div>

              <div className="flex gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="border border-stone-200 text-stone-600 hover:border-[#C59B27]/40 hover:text-[#7B1123] rounded-xl py-3 px-6 text-xs font-primary font-bold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#7B1123] to-[#961E34] hover:from-[#961E34] hover:to-[#7B1123] text-[#F3BA2F] border border-[#C59B27] rounded-xl py-3 flex-grow text-xs font-primary font-black uppercase tracking-wider cursor-pointer shadow-md transition-all"
                >
                  Upload Credentials
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Uploads */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-primary font-bold uppercase tracking-widest text-[#7B1123]">
                3. Supporting Credentials
              </span>

              <div className="p-4 rounded-xl border border-dashed border-[#C59B27]/40 bg-[#FCFBF7] flex items-center justify-between gap-4">
                <div>
                  <h5 className="text-xs font-bold text-[#1C0509] font-primary uppercase">Passport Photograph</h5>
                  <p className="text-[10px] text-stone-500 font-secondary">JPEG or PNG under 2MB</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleFileUpload("photo", "participant_photo.jpg")}
                  className="bg-[#7B1123] hover:bg-[#961E34] text-[#F3BA2F] border border-[#C59B27]/50 rounded-xl py-2 px-3 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Upload size={12} /> {photograph ? "Attached" : "Browse"}
                </button>
              </div>
              {photograph && <span className="text-[10px] text-[#7B1123] font-bold -mt-2">✓ Attached: {photograph}</span>}

              <div className="p-4 rounded-xl border border-dashed border-[#C59B27]/40 bg-[#FCFBF7] flex items-center justify-between gap-4">
                <div>
                  <h5 className="text-xs font-bold text-[#1C0509] font-primary uppercase">Government Photo ID</h5>
                  <p className="text-[10px] text-stone-500 font-secondary">Aadhaar, Passport, or Student ID</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleFileUpload("id", "gov_identity.pdf")}
                  className="bg-[#7B1123] hover:bg-[#961E34] text-[#F3BA2F] border border-[#C59B27]/50 rounded-xl py-2 px-3 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Upload size={12} /> {govId ? "Attached" : "Browse"}
                </button>
              </div>
              {govId && <span className="text-[10px] text-[#7B1123] font-bold -mt-2">✓ Attached: {govId}</span>}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-stone-700">Performance Video Link (Optional)</label>
                <input
                  type="url"
                  placeholder="YouTube, Google Drive or Vimeo URL"
                  value={performanceVideo}
                  onChange={(e) => setPerformanceVideo(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl bg-white border border-stone-200 px-4 py-2.5 text-stone-900 outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]/30 shadow-sm"
                />
              </div>

              <div className="flex gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="border border-stone-200 text-stone-600 hover:border-[#C59B27]/40 hover:text-[#7B1123] rounded-xl py-3 px-6 text-xs font-primary font-bold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleProceedToVerify}
                  className="bg-gradient-to-r from-[#7B1123] to-[#961E34] hover:from-[#961E34] hover:to-[#7B1123] text-[#F3BA2F] border border-[#C59B27] rounded-xl py-3 flex-grow text-xs font-primary font-black uppercase tracking-wider cursor-pointer shadow-md transition-all"
                >
                  Verify Contact
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Email Verification */}
          {step === 4 && (
            <div className="flex flex-col gap-4 text-center py-4">
              <ShieldCheck size={36} className="text-[#C59B27] mx-auto" />
              <span className="text-[10px] font-primary font-bold uppercase tracking-widest text-[#7B1123]">
                4. Verify Email Address
              </span>
              <p className="text-xs text-stone-600 font-secondary">
                A verification code has been dispatched to {email}.
              </p>

              {verificationCode && (
                <div className="p-2.5 bg-[#7B1123]/10 border border-[#C59B27]/40 text-[#7B1123] rounded-xl text-[10px] font-primary font-bold">
                  SIMULATION PASSCODE: <strong>{verificationCode}</strong>
                </div>
              )}

              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={userEnteredCode}
                onChange={(e) => setUserEnteredCode(e.target.value)}
                className="w-40 mx-auto text-center tracking-widest text-lg font-black font-primary rounded-xl bg-white border border-[#C59B27]/50 py-2 text-stone-900 outline-none focus:border-[#C59B27] shadow-inner"
              />

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="border border-stone-200 text-stone-600 hover:border-[#C59B27]/40 hover:text-[#7B1123] rounded-xl py-3 px-6 text-xs font-primary font-bold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleVerifyCodeSubmit}
                  className="bg-gradient-to-r from-[#7B1123] to-[#961E34] hover:from-[#961E34] hover:to-[#7B1123] text-[#F3BA2F] border border-[#C59B27] rounded-xl py-3 flex-grow text-xs font-primary font-black uppercase tracking-wider cursor-pointer shadow-md transition-all"
                >
                  Verify Code
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Payment */}
          {step === 5 && (
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-primary font-bold uppercase tracking-widest text-[#7B1123]">
                5. Accreditation Fee Checkout
              </span>

              <div className="bg-[#FCFBF7] border border-[#C59B27]/30 p-4 rounded-xl flex flex-col gap-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Competition</span>
                  <span className="font-bold text-[#1C0509]">{event.name}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Accreditation Class</span>
                  <span className="font-bold text-[#7B1123]">{category}</span>
                </div>
                <div className="border-t border-[#C59B27]/20 pt-2 flex justify-between text-sm">
                  <span className="font-bold text-[#1C0509] font-primary uppercase">Registration Fee</span>
                  <span className="font-black text-[#7B1123] font-primary">₹{registrationFee.toLocaleString()}</span>
                </div>
              </div>

              {isProcessing ? (
                <div className="py-8 flex flex-col items-center gap-3 text-center">
                  <div className="w-10 h-10 border-4 border-[#7B1123] border-t-[#C59B27] rounded-full animate-spin" />
                  <span className="text-xs text-[#7B1123] font-primary font-bold">Processing accreditation...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleFinalizeRegistration("paid", "pay_comp_" + Math.random().toString(36).substring(2, 9))}
                  className="bg-gradient-to-r from-[#7B1123] via-[#961E34] to-[#7B1123] text-[#F3BA2F] border border-[#C59B27] rounded-xl py-3.5 text-xs font-black font-primary uppercase tracking-wider shadow-md w-full transition-all cursor-pointer hover:brightness-110"
                >
                  PAY ₹{registrationFee.toLocaleString()} &amp; CONFIRM REGISTRATION
                </button>
              )}
            </div>
          )}

          {/* STEP 6: Success */}
          {step === 6 && completedReg && (
            <div className="flex flex-col items-center gap-5 text-center py-2">
              <div className="w-14 h-14 rounded-full bg-[#7B1123] border border-[#C59B27] text-[#F3BA2F] flex items-center justify-center text-2xl shadow-lg">
                <Check size={28} />
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-black text-[#1C0509] font-primary uppercase tracking-tight">
                  Accreditation Submitted!
                </h4>
                <p className="text-stone-600 text-xs mt-1 font-secondary">
                  Your registration status is currently pending custodian review.
                </p>
              </div>

              <div className="w-full border border-dashed border-[#C59B27] rounded-xl bg-gradient-to-br from-[#4A0814] via-[#2A050B] to-[#140205] p-5 flex flex-col gap-3 text-left text-white shadow-xl">
                <div className="flex justify-between items-start border-b border-[#C59B27]/30 pb-3">
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-[#F3BA2F] font-bold font-primary">
                      COMPETITOR ACCREDITATION PASS
                    </span>
                    <h5 className="font-black text-white text-sm uppercase font-primary mt-0.5 truncate max-w-[220px]">
                      {completedReg.competitionName}
                    </h5>
                  </div>
                  <div className="text-right">
                    <span className="text-[7.5px] text-stone-400 block uppercase font-bold font-primary">
                      PARTICIPANT ID
                    </span>
                    <span className="font-primary text-xs font-bold text-[#F3BA2F] uppercase">
                      {completedReg.participantId}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-1">
                  <div>
                    <span className="text-[7.5px] text-stone-400 uppercase font-primary font-bold block">Name</span>
                    <span className="font-bold text-white truncate block">{completedReg.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[7.5px] text-stone-400 uppercase font-primary font-bold block">Class</span>
                    <span className="font-bold text-[#F3BA2F] truncate block">{completedReg.category}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push("/dashboard");
                }}
                className="bg-gradient-to-r from-[#7B1123] to-[#961E34] hover:from-[#961E34] hover:to-[#7B1123] text-[#F3BA2F] border border-[#C59B27] rounded-xl py-3 px-6 text-xs font-primary font-black uppercase tracking-wider cursor-pointer w-full shadow-md transition-all"
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
