"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, Calendar, MapPin, Trophy, ArrowRight, Star, Heart, 
  Flame, Compass, ChevronRight, Music, Sparkles, Paintbrush, 
  HelpCircle, Eye, Mail, Award, CheckCircle, Ticket, Layers, 
  Laptop, Briefcase, GraduationCap, Globe, Shield, RefreshCw, 
  ChevronLeft, BookOpen, Send, ImageIcon, Utensils, Megaphone,
  Palette, Rocket, Mic, Tv, Building2, TrendingUp, CheckCircle2,
  ExternalLink, ArrowUpRight, X
} from "lucide-react";
import { ApiClient, GalleryItem, Event, CompetitionRecord, Blog, Sponsor } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import BlogCard from "@/components/BlogCard";

function isVideoUrl(url: string): boolean {
  const clean = url.trim().toLowerCase().split("?")[0];
  return clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".mov") || clean.endsWith(".ogg");
}

interface HeroContent {
  edition?: string;
  watermark?: string;
  title?: string;
  dateText?: string;
  bgImage?: string;
  slug?: string;
  upcomingLinks?: { label: string; href: string }[];
}

interface Testimonial { quote: string; author: string; role: string }
interface StatItem { value: string; label: string }
interface NewsletterContent { eyebrow: string; heading: string; description: string; ctaLabel: string; successMessage: string }

interface AboutStatsContent { eyebrow: string; heading: string; description: string }

interface AlliedVenture {
  name: string;
  category: string;
  desc: string;
  tag: string;
  badge: string;
  isFlagship?: boolean | string;
  logoUrl?: string;
  iconType?: string;
  link?: string;
}

interface AlliedVenturesContent {
  eyebrow?: string;
  heading?: string;
  description?: string;
  ventures: AlliedVenture[];
}

const ICON_MAP: Record<string, any> = {
  Megaphone,
  Palette,
  Rocket,
  Building2,
  Tv,
  Globe,
  Award,
  Sparkles,
  Layers,
  Utensils,
  Trophy,
  Star,
};

interface SerialEventItem {
  id: string;
  serial: string;
  name: string;
  subtitle: string;
  dates: string;
  badge: string;
  category: string;
  description: string;
  venue: string;
  city: string;
  slug: string;
  image: string;
  tags: string[];
  filterCategory: string;
  isFoodExpo?: boolean;
}

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


export default function HomePage() {
  const router = useRouter();

  // Dynamic CMS content — all content is loaded from the database; no
  // hardcoded fallback copy ships in the bundle, so sections simply render
  // once their CMS data has loaded (same pattern as gallery/blogs/sponsors below).
  const [heroContent, setHeroContent] = useState<HeroContent>({});
  const [stats, setStats] = useState<StatItem[]>([]);
  const [aboutStatsContent, setAboutStatsContent] = useState<AboutStatsContent>({ eyebrow: "", heading: "", description: "" });
  const [ecosystemContent, setEcosystemContent] = useState<AlliedVenturesContent>({ eyebrow: "", heading: "", description: "", ventures: [] });
  const [foodExpoConfig, setFoodExpoConfig] = useState<FoodExpoConfig>({
    exhibitors: [], visitors: [], sponsorshipTiers: [], benefits: [],
    portals: [], slogans: { primary: "", motto: "" }, images: { chartPoster: "", sponsorshipPoster: "" },
  });
  const [serialEvents, setSerialEvents] = useState<SerialEventItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [foodExpoTab, setFoodExpoTab] = useState<"exhibitor" | "visitor" | "sponsorship">("exhibitor");
  const [showFoodChartModal, setShowFoodChartModal] = useState<boolean>(false);
  const [showFoodSponsorModal, setShowFoodSponsorModal] = useState<boolean>(false);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterContent, setNewsletterContent] = useState<NewsletterContent>({ eyebrow: "", heading: "", description: "", ctaLabel: "", successMessage: "" });

  // Fetch CMS site content and live database events atomically
  useEffect(() => {
    Promise.all([
      ApiClient.getAllSiteContent(),
      ApiClient.getEvents().catch(() => []),
    ]).then(([all, events]) => {
      const rawHero = all.homepage_hero as any;
      if (rawHero && (rawHero.title || rawHero.edition)) {
        setHeroContent((prev) => ({ ...prev, ...rawHero }));
      }
      const statsContent = all.homepage_stats as Partial<AboutStatsContent> & { stats?: StatItem[] } | undefined;
      if (statsContent?.stats && statsContent.stats.length > 0) {
        setStats(statsContent.stats);
      }
      if (statsContent) {
        setAboutStatsContent((prev) => ({
          eyebrow: statsContent.eyebrow || prev.eyebrow,
          heading: statsContent.heading || prev.heading,
          description: statsContent.description || prev.description,
        }));
      }
      const venturesContent = all.homepage_allied_ventures as Partial<AlliedVenturesContent> | undefined;
      if (venturesContent) {
        setEcosystemContent((prev) => ({
          eyebrow: venturesContent.eyebrow || prev.eyebrow,
          heading: venturesContent.heading || prev.heading,
          description: venturesContent.description || prev.description,
          ventures:
            venturesContent.ventures && venturesContent.ventures.length > 0
              ? venturesContent.ventures
              : prev.ventures,
        }));
      }
      const foodConfig = all.food_expo_config as FoodExpoConfig | undefined;
      if (foodConfig && foodConfig.exhibitors && foodConfig.sponsorshipTiers) {
        setFoodExpoConfig(foodConfig);
      }
      setTestimonials((all.homepage_testimonials as { testimonials: Testimonial[] } | undefined)?.testimonials ?? []);
      const rawNewsletter = all.homepage_newsletter as Partial<NewsletterContent> | undefined;
      if (rawNewsletter) {
        setNewsletterContent((prev) => ({ ...prev, ...rawNewsletter }));
      }

      // Serial events come from CMS (homepage_serial_events), enriched with
      // whatever tags/description/venue/etc. aren't in the CMS row yet from
      // the matching live database event (by slug/id).
      const serialContent = all.homepage_serial_events as { events?: Partial<SerialEventItem>[] } | undefined;
      let baseList: SerialEventItem[] = (serialContent?.events ?? []).map((cmsEvt, idx) => ({
        tags: [],
        ...cmsEvt,
        id: cmsEvt.id || `event-${String(idx + 1).padStart(2, "0")}`,
        serial: cmsEvt.serial || String(idx + 1).padStart(2, "0"),
      } as SerialEventItem));

      // Merge live database event attributes (dates, venues, ticket links, real images)
      if (events && events.length > 0) {
        baseList = baseList.map((item) => {
          const match = events.find((e) => e.slug === item.slug || e.id === item.id);
          if (!match) return item;
          return {
            ...item,
            name: match.name || item.name,
            description: match.summary || match.description || item.description,
            venue: match.venue || item.venue,
            city: match.city || item.city,
            image: match.bannerUrl || item.image,
            category: match.category || item.category,
            dates: match.date
              ? new Date(match.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
              : item.dates,
          };
        });
      }
      setSerialEvents(baseList);
    }).catch(() => {});

    ApiClient.getGalleryItems().then(setGallery).catch(() => {});
    ApiClient.getBlogs().then(setBlogs).catch(() => {});
    ApiClient.getSponsors().then(setSponsors).catch(() => {});
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
    }
  };

  const filteredEvents = activeFilter === "all" 
    ? serialEvents 
    : serialEvents.filter((e) => e.filterCategory === activeFilter);

  return (
    <div className="flex flex-col text-left">
      
      {/* 1. CINEMATIC HERO BANNER (Udaipur Catering Festival / Food Expo) */}
      <section className="relative min-h-[620px] sm:min-h-[680px] md:min-h-[760px] flex flex-col justify-between pt-20 sm:pt-24 pb-8 sm:pb-12 overflow-hidden border-b border-[var(--border-color)]">
        {/* Background Image & Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-102"
          style={{ backgroundImage: heroContent.bgImage ? `url('${heroContent.bgImage}')` : undefined }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-[#0e0704]/95 backdrop-blur-[0.5px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-black/80 pointer-events-none" />

        {/* Top spacer */}
        <div className="hidden sm:block" />

        {/* Center Content Showcase */}
        <div className="container max-w-5xl mx-auto px-4 relative z-10 text-center flex flex-col items-center justify-center my-auto">
          {/* Watermark Behind Heading */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
            <span className="text-white/[0.06] font-black text-6xl sm:text-8xl md:text-9xl lg:text-[140px] font-primary tracking-[0.2em] uppercase whitespace-nowrap">
              {heroContent.watermark}
            </span>
          </div>

          {/* Eyebrow / Edition Tag */}
          <div className="relative z-10 inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 backdrop-blur-md">
            <Sparkles size={14} className="text-amber-400" />
            <span className="text-amber-300 font-primary text-xs sm:text-sm font-bold tracking-[0.2em] uppercase">
              {heroContent.edition}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="relative z-10 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-primary text-white tracking-tight uppercase leading-[1.12] max-w-4xl mx-auto drop-shadow-2xl">
            {heroContent.title}
          </h1>

          {/* Date & Location Pill */}
          <div className="relative z-10 text-amber-200 font-mono text-xs sm:text-sm md:text-base font-bold tracking-widest uppercase mt-4 px-4 py-1 rounded-full bg-black/40 border border-amber-500/20 backdrop-blur-sm">
            {heroContent.dateText}
          </div>

          {/* Action CTAs */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8">
            <Link
              href={heroContent.slug ? `/events/${heroContent.slug}` : "/events"}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-[#170D08] font-black text-xs sm:text-sm font-primary uppercase tracking-wider px-8 py-4 rounded-full shadow-[0_8px_30px_rgba(245,158,11,0.35)] transition-all hover:scale-105 cursor-pointer"
            >
              <Utensils size={16} /> Explore Catering Festival
            </Link>
            <a
              href="#serial-events"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-xs sm:text-sm font-primary uppercase tracking-wider px-7 py-4 rounded-full backdrop-blur-sm transition-all hover:scale-102"
            >
              <span>View Serial Events (#01 - #09)</span>
              <ArrowRight size={14} className="text-amber-400" />
            </a>
          </div>
        </div>

        {/* Bottom Quick Jump Strip - All 9 Serial Events 100% Visible */}
        <div className="relative z-10 w-full mt-auto pt-8 pb-3">
          <div className="text-center mb-3">
            <span className="text-[10.5px] sm:text-[11px] font-primary tracking-[0.25em] text-amber-400 font-bold uppercase drop-shadow inline-flex items-center gap-2">
              <span className="w-8 h-px bg-amber-400/50" />
              Official Serial Events Listing (01 – 09)
              <span className="w-8 h-px bg-amber-400/50" />
            </span>
          </div>

          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-center">
              {(heroContent.upcomingLinks || []).map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  className="text-stone-200 hover:text-[#170D08] hover:bg-gradient-to-r hover:from-amber-400 hover:to-amber-500 text-[11px] sm:text-xs font-primary font-bold tracking-wide transition-all px-3.5 py-1.5 rounded-full bg-black/60 hover:border-amber-400 border border-white/15 shadow-sm backdrop-blur-md hover:scale-105 hover:shadow-[0_4px_16px_rgba(245,158,11,0.3)]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. FRONT PAGE KEY STATS & HERITAGE (26+ Yrs, 75+ Events, 18+ Publications, 12+ Exhibition) */}
      <section className="py-12 sm:py-16 bg-[#120B07] border-b border-[var(--border-color)] relative">
        <div className="container max-w-6xl mx-auto px-4">
          {aboutStatsContent.heading && (
            <div className="text-center max-w-2xl mx-auto mb-10 flex flex-col gap-2">
              {aboutStatsContent.eyebrow && (
                <span className="text-[10.5px] font-primary tracking-[0.25em] text-amber-400 font-bold uppercase">
                  {aboutStatsContent.eyebrow}
                </span>
              )}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-primary uppercase tracking-tight">
                {aboutStatsContent.heading}
              </h2>
              {aboutStatsContent.description && (
                <p className="text-stone-400 text-xs sm:text-sm font-secondary">
                  {aboutStatsContent.description}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#1A100B]/90 border border-amber-500/20 hover:border-amber-500/50 rounded-2xl p-6 sm:p-7 flex flex-col items-center justify-center text-center shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1 group"
              >
                <span className="text-3xl sm:text-4xl md:text-5xl font-black font-primary text-transparent bg-clip-text bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 tracking-tight group-hover:scale-105 transition-transform">
                  {item.value}
                </span>
                <span className="text-[10.5px] sm:text-xs font-bold uppercase tracking-[0.18em] text-stone-300 font-primary mt-2.5">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. GROUP ALLIANCE & CORE LOGOS (Laxmi Publicity, B.B. Creative worlds, Recharge for Nation, New Venture) */}
      <section className="py-14 sm:py-18 bg-[#0D0603] border-b border-[var(--border-color)]">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10 flex flex-col gap-2">
            <span className="text-[10.5px] font-primary tracking-[0.25em] text-amber-400 font-bold uppercase">
              {ecosystemContent.eyebrow || "Brand Alignment & Group Network"}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-primary uppercase tracking-tight">
              {ecosystemContent.heading || "Our Core Ecosystem"}
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm font-secondary">
              {ecosystemContent.description || "Pioneering media, experiential stagecraft, digital platforms, and innovative national enterprises."}
            </p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,300px))] justify-center gap-6">
            {ecosystemContent.ventures.map((venture, idx) => {
              const Icon = venture.iconType ? ICON_MAP[venture.iconType] : null;
              const isFlagship = venture.isFlagship === true || String(venture.isFlagship).toLowerCase() === "true";
              const CardTag = venture.link ? "a" : "div";
              const cardProps = venture.link
                ? {
                    href: venture.link,
                    target: venture.link.startsWith("http") ? "_blank" : undefined,
                    rel: venture.link.startsWith("http") ? "noopener noreferrer" : undefined,
                  }
                : {};
              return (
                <CardTag
                  key={idx}
                  {...cardProps}
                  className={`rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 border ${
                    venture.link ? "cursor-pointer hover:-translate-y-1.5 hover:shadow-2xl" : ""
                  } ${
                    isFlagship
                      ? "bg-gradient-to-b from-[#23150D] to-[#160D08] border-amber-500/40 shadow-[0_10px_35px_rgba(245,158,11,0.18)] ring-1 ring-amber-500/20"
                      : "bg-[#140C07] border-white/10 hover:border-amber-500/30 shadow-[0_6px_25px_rgba(0,0,0,0.25)]"
                  }`}
                >
                  <div className="flex flex-col gap-4">
                    <span className="self-start shrink-0 whitespace-nowrap text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25 font-primary">
                      {venture.badge}
                    </span>

                    <div className="h-14 w-full flex items-center justify-start">
                      {venture.logoUrl ? (
                        <div className="h-14 w-14 rounded-xl bg-white/95 border border-amber-500/20 flex items-center justify-center overflow-hidden p-1.5 shadow-[0_4px_16px_rgba(245,158,11,0.25)]">
                          <img
                            src={venture.logoUrl}
                            alt={venture.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ) : Icon ? (
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                          <Icon size={22} />
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <h3 className="text-lg font-black font-primary text-white uppercase tracking-tight">
                        {venture.name}
                      </h3>
                      <p className="text-[11px] font-bold text-amber-400/90 font-primary uppercase tracking-wider mt-0.5">
                        {venture.category}
                      </p>
                      <p className="text-xs text-stone-400 font-secondary mt-2.5 leading-relaxed">
                        {venture.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/10">
                    <span className="text-[10px] font-primary font-bold text-stone-400 uppercase tracking-wider">
                      {venture.tag}
                    </span>
                  </div>
                </CardTag>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. SCROLLING IMAGES FOR EVENTS & NAMES (Continuous Marquee Ribbon) */}
      <section className="py-14 sm:py-18 bg-[#120B07] border-b border-[var(--border-color)] overflow-hidden">
        <div className="container max-w-6xl mx-auto px-4 mb-14 text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
          <div>
            <span className="text-[10.5px] font-primary tracking-[0.25em] text-amber-400 font-bold uppercase">
              Continuous Visual Showcase
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-primary uppercase tracking-tight">
              Featured Events &amp; Festivals
            </h2>
          </div>
          <a
            href="#serial-events"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 font-primary uppercase tracking-wider flex items-center gap-1.5"
          >
            <span>Explore Serial Order (1-9)</span>
            <ArrowRight size={14} />
          </a>
        </div>

        {/* Seamless Infinite Horizontal Scroll */}
        <div className="relative w-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#120B07] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#120B07] to-transparent z-10 pointer-events-none" />

          <div className="flex gap-8 animate-marquee py-2 select-none">
            {[...serialEvents, ...serialEvents].map((evt, idx) => (
              <a
                key={idx}
                href={`#${evt.id}`}
                className="shrink-0 w-[280px] sm:w-[320px] rounded-2xl overflow-hidden bg-[#180E09] border border-white/10 hover:border-amber-500/50 shadow-[0_8px_25px_rgba(0,0,0,0.35)] transition-all duration-300 group block"
              >
                <div className="relative h-44 w-full overflow-hidden bg-black/40">
                  <img
                    src={evt.image}
                    alt={evt.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10" />

                  {/* Serial Number & Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-500 text-[#170D08] font-primary font-black text-xs flex items-center justify-center shadow-md">
                      {evt.serial}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-amber-300 border border-white/10 font-primary">
                      {evt.dates}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-1.5 text-left">
                  <span className="text-[9.5px] font-bold uppercase tracking-widest text-amber-400 font-primary">
                    {evt.badge}
                  </span>
                  <h4 className="font-black text-white text-base font-primary uppercase tracking-tight line-clamp-1 group-hover:text-amber-400 transition-colors">
                    {evt.name}
                  </h4>
                  <p className="text-[11px] text-stone-400 font-secondary line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 5. OFFICIAL "EVENT LISTING SERIAL WISE" (#01 TO #09) */}
      <section id="serial-events" className="py-16 md:py-24 bg-[#0D0603] border-b border-[var(--border-color)] scroll-mt-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="text-amber-500 font-black text-xs font-primary uppercase tracking-[0.25em]">
                  Official Sequence &amp; Calendar
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-primary uppercase tracking-tight">
                Event Listing (Serial Wise)
              </h2>
              <p className="text-stone-400 text-xs sm:text-sm font-secondary mt-1 max-w-xl">
                The master serial itinerary of flagship competitions, culinary expos, conclaves, and international festivals.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: "All (1-9)" },
                { id: "dance", label: "Classical & Dance" },
                { id: "food", label: "Food & Hospitality" },
                { id: "conclave", label: "Conclaves & Media" },
                { id: "lifestyle", label: "Heritage & Lifestyle" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider font-primary transition-all cursor-pointer ${
                    activeFilter === tab.id
                      ? "bg-amber-500 text-[#170D08] shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                      : "bg-white/[0.04] text-stone-300 hover:text-white hover:bg-white/[0.08] border border-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Serial Numbered Cards List */}
          <div className="flex flex-col gap-8 sm:gap-10">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                id={evt.id}
                className="bg-[#160E09]/90 border border-amber-500/15 hover:border-amber-500/40 rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all duration-300 flex flex-col lg:flex-row group lg:h-[380px] xl:h-[360px]"
              >
                {/* Image Showcase Column - matches full card height on desktop */}
                <div className="relative w-full lg:w-5/12 h-64 sm:h-72 lg:h-full overflow-hidden shrink-0 bg-black/40">
                  <img
                    src={evt.image}
                    alt={evt.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-106"
                  />
                  <div className="absolute inset-0 bg-black/40 lg:bg-black/25" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10 lg:bg-gradient-to-r lg:from-transparent lg:to-[#160E09]/90" />
                  
                  {/* Floating Serial Number Top Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-[#170D08] font-black text-base font-primary flex items-center justify-center shadow-lg">
                      {evt.serial}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md text-amber-300 border border-white/10 font-primary">
                      {evt.dates}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-white/90 text-xs font-primary font-bold">
                    <MapPin size={13} className="text-amber-400 shrink-0" />
                    <span className="truncate">{evt.venue}, {evt.city}</span>
                  </div>
                </div>

                {/* Content Column - flex justify-between with uniform height */}
                <div className="p-6 sm:p-7 lg:p-7 flex flex-col justify-between flex-1 h-full overflow-hidden gap-4">
                  <div className="flex flex-col gap-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/25 font-primary">
                        {evt.badge}
                      </span>
                      <span className="text-[10px] text-stone-400 font-primary font-bold uppercase tracking-widest">
                        Serial #{evt.serial}
                      </span>
                    </div>

                    <Link href={`/events/${evt.slug}`}>
                      <h3 className="text-xl sm:text-2xl font-black text-white font-primary uppercase tracking-tight hover:text-amber-400 transition-colors leading-tight line-clamp-1">
                        {evt.name}
                      </h3>
                    </Link>

                    <p className="text-xs font-semibold text-amber-300/90 font-primary uppercase tracking-wider line-clamp-1">
                      {evt.subtitle}
                    </p>

                    <p className="text-stone-300 text-xs sm:text-[13px] leading-relaxed font-secondary line-clamp-2 sm:line-clamp-3">
                      {evt.description}
                    </p>

                    {/* Tag highlights */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {evt.tags.slice(0, 3).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] px-2.5 py-1 rounded-md bg-white/[0.04] text-stone-300 border border-white/10 font-primary font-semibold truncate max-w-[200px]"
                        >
                          ✦ {tag}
                        </span>
                      ))}
                    </div>

                    {/* Specialized Exhibitor & Visitor Directory for Food Expo */}
                    {(evt.isFoodExpo || evt.id === "event-02" || evt.slug?.includes("catering") || evt.slug?.includes("food")) && (
                      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25">
                        <div className="flex items-center gap-2 text-[11px] font-primary font-bold text-amber-300 truncate">
                          <Utensils size={13} className="text-amber-400 shrink-0" />
                          <span className="truncate">18 Exhibitor Sectors • 16 Visitor Profiles • 7 Sponsorship Tiers</span>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowFoodChartModal(true)}
                            className="text-[10.5px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                          >
                            Directory
                          </button>
                          <span className="text-amber-500/40">•</span>
                          <button
                            type="button"
                            onClick={() => setShowFoodSponsorModal(true)}
                            className="text-[10.5px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                          >
                            Sponsorship Chart
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs font-primary font-bold text-amber-400">
                      <Calendar size={14} />
                      <span>{evt.dates}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/events/${evt.slug}`}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-[#170D08] font-black text-xs font-primary uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.25)] transition-all hover:scale-102 cursor-pointer"
                      >
                        Explore Event <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SEASON SNAPSHOTS (Gallery Mosaic) */}
      {gallery.length > 0 && (
        <section className="py-16 bg-[#120B07] border-b border-[var(--border-color)]">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex items-end justify-between border-b border-white/10 pb-4 mb-8">
              <div>
                <span className="text-[10px] font-primary tracking-[0.25em] text-amber-400 font-bold uppercase">
                  Archived Visuals
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-primary uppercase">
                  Season Snapshots
                </h2>
              </div>
              <Link href="/gallery" className="text-xs font-bold text-amber-400 hover:text-amber-300 font-primary uppercase tracking-wider">
                Full Gallery &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 sm:grid-rows-2 gap-4 sm:h-[460px]">
              {gallery.slice(0, 5).map((item, idx) => (
                <div
                  key={item.id}
                  className={`relative rounded-2xl overflow-hidden group border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:border-amber-500/40 transition-all duration-300 bg-black/20 ${
                    idx === 0 ? "col-span-2 row-span-2 h-72 sm:h-full" : "h-44 sm:h-full"
                  }`}
                >
                  {(item.thumbnailUrl || item.url) ? (
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon size={24} className="text-stone-500" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-0.5 text-left z-10">
                    <span className="text-[7.5px] text-amber-400 font-primary font-bold tracking-widest uppercase">{item.event}</span>
                    <span className={`text-white font-bold line-clamp-2 ${idx === 0 ? "text-sm sm:text-base" : "text-[10px]"}`}>
                      {item.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6.5 BRAND PARTNERS & ALLIANCE PATRONS */}
      {sponsors.length > 0 && (
        <section className="py-16 bg-[#0D0603] border-b border-[var(--border-color)] overflow-hidden">
          <div className="container max-w-6xl mx-auto px-4 text-center mb-10">
            <span className="text-[10px] font-primary tracking-[0.25em] text-amber-400 font-bold uppercase">
              Our Network
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-primary uppercase tracking-tight mt-1">
              Brand Partners &amp; Alliance Patrons
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm font-secondary mt-2 max-w-xl mx-auto">
              Trusted by leading brands powering our events, competitions, and national campaigns.
            </p>
          </div>

          <div className="relative w-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0D0603] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0D0603] to-transparent z-10 pointer-events-none" />

            <div className="flex gap-10 animate-marquee py-2 select-none">
              {[...sponsors, ...sponsors].map((sp, idx) => (
                <a
                  key={idx}
                  href={sp.websiteUrl || undefined}
                  target={sp.websiteUrl ? "_blank" : undefined}
                  rel={sp.websiteUrl ? "noopener noreferrer" : undefined}
                  className="shrink-0 w-[220px] h-24 rounded-2xl bg-white flex items-center justify-center p-5 border border-white/10 shadow-[0_6px_20px_rgba(0,0,0,0.25)] hover:-translate-y-1 transition-all duration-300"
                >
                  <img src={sp.logoUrl} alt={sp.name} className="max-h-full max-w-full object-contain" />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. VERIFIED REVIEWS / TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-[#0D0603] border-b border-[var(--border-color)] overflow-hidden">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-14 flex flex-col gap-2">
              <span className="text-[10px] font-primary tracking-widest text-amber-400 font-bold uppercase">
                Verified Participants &amp; Patrons
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-primary uppercase">
                Trusted by Thousands
              </h2>
            </div>
          </div>

          <div className="relative w-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0D0603] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0D0603] to-transparent z-10 pointer-events-none" />

            <div className="flex gap-6 animate-marquee py-2 select-none">
              {[...testimonials, ...testimonials].map((t, idx) => (
                <div
                  key={idx}
                  className="shrink-0 w-[280px] sm:w-[320px] bg-[#160E09] border border-amber-500/15 rounded-2xl p-6 flex flex-col justify-between gap-5 shadow-[0_6px_20px_rgba(0,0,0,0.25)] text-left"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill="currentColor" className="text-amber-400" />
                      ))}
                    </div>
                    <p className="text-stone-300 italic text-xs leading-relaxed font-secondary">
                      &quot;{t.quote}&quot;
                    </p>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex flex-col gap-0.5">
                    <h4 className="font-bold text-white text-xs font-primary uppercase tracking-tight">{t.author}</h4>
                    <p className="text-amber-400/80 text-[9px] uppercase font-primary font-medium">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. RECHARGE CHRONICLE (BLOG PREVIEWS) */}
      {blogs.length > 0 && (
        <section className="py-16 bg-[#120B07] border-b border-[var(--border-color)]">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex items-end justify-between border-b border-white/10 pb-4 mb-8">
              <div>
                <span className="text-[10px] font-primary tracking-[0.25em] text-amber-400 font-bold uppercase">
                  Editorial Dispatch
                </span>
                <h2 className="text-2xl font-black text-white font-primary uppercase">
                  Recharge Chronicle
                </h2>
              </div>
              <Link href="/blogs" className="text-xs font-bold text-amber-400 hover:text-amber-300 font-primary uppercase tracking-wider">
                All Articles &gt;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogs.slice(0, 3).map((blog) => (
                <BlogCard
                  key={blog.id}
                  title={blog.title}
                  slug={blog.slug}
                  summary={blog.summary}
                  imageUrl={blog.imageUrl}
                  category={blog.category}
                  publishedAt={blog.publishedAt}
                  aspectRatio="aspect-[16/9]"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 9. VIP GATEWAY PRE-SALE ALERT CREW (NEWSLETTER) */}
      <section className="py-18 bg-[#0D0603]">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="p-8 sm:p-12 text-center rounded-3xl bg-[#1A100B] border border-amber-500/25 shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-bl-full filter blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-44 h-44 bg-amber-500/5 rounded-tr-full filter blur-2xl pointer-events-none" />

            <span className="text-[10px] font-primary tracking-widest text-amber-400 font-bold uppercase flex items-center gap-1.5">
              <span>✦</span> {newsletterContent.eyebrow}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-primary uppercase tracking-tight max-w-lg leading-tight">
              {newsletterContent.heading}
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm max-w-md font-secondary leading-relaxed">
              {newsletterContent.description}
            </p>

            {newsletterSubscribed ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl p-4 text-xs max-w-sm flex items-center gap-2">
                <CheckCircle size={16} />
                <span>{newsletterContent.successMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row w-full gap-3 max-w-md mt-2 relative z-10">
                <input
                  type="email"
                  placeholder="Enter email for pre-sale alert access"
                  className="flex-grow text-xs rounded-xl bg-black/40 border border-white/15 text-white placeholder-stone-400 outline-none px-4 py-3.5 focus:border-amber-500/50"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="py-3.5 px-8 rounded-xl font-bold text-xs shadow-lg transition-all font-primary uppercase tracking-wider text-[#170D08] bg-amber-500 hover:bg-amber-400 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  {newsletterContent.ctaLabel}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Official Directory Poster Modal */}
      {showFoodChartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-4xl w-full bg-[#160E09] border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <h3 className="text-sm sm:text-base font-black font-primary text-white uppercase tracking-tight">
                  Food Expo Exhibitor &amp; Visitor Directory
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFoodChartModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 overflow-hidden flex-1 flex items-center justify-center bg-black/40 max-h-[75vh]">
              <img
                src="/images/food-expo-chart.png"
                alt="Food Expo Exhibitor &amp; Visitor Directory"
                className="max-w-full max-h-full w-auto h-auto object-contain rounded-xl shadow-lg"
              />
            </div>
            <div className="p-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#110A06]">
              <div className="flex items-center gap-3 text-xs">
                <a href="https://www.udaipurfoodexpo.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline font-bold">
                  www.udaipurfoodexpo.com
                </a>
                <span className="text-stone-500">•</span>
                <a href="https://www.uhcvs.org" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline font-bold">
                  www.uhcvs.org
                </a>
              </div>
              <button
                type="button"
                onClick={() => setShowFoodChartModal(false)}
                className="px-5 py-2 rounded-xl bg-amber-500 text-[#170D08] font-bold text-xs uppercase font-primary cursor-pointer hover:bg-amber-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Sponsorship Poster Modal */}
      {showFoodSponsorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-4xl w-full bg-[#160E09] border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-amber-400" />
                <h3 className="text-sm sm:text-base font-black font-primary text-white uppercase tracking-tight">
                  Food Expo Sponsorship Categories &amp; Benefits
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFoodSponsorModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 overflow-hidden flex-1 flex items-center justify-center bg-black/40 max-h-[75vh]">
              <img
                src={foodExpoConfig.images.sponsorshipPoster}
                alt="Food Expo Sponsorship Categories &amp; Benefits"
                className="max-w-full max-h-full w-auto h-auto object-contain rounded-xl shadow-lg"
              />
            </div>
            <div className="p-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#110A06]">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-400 italic">Your Support &bull; <span className="text-amber-400 font-bold">Our Strength</span></span>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/sponsors"
                  onClick={() => setShowFoodSponsorModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase font-primary"
                >
                  Enquire as Sponsor
                </Link>
                <button
                  type="button"
                  onClick={() => setShowFoodSponsorModal(false)}
                  className="px-5 py-2 rounded-xl bg-amber-500 text-[#170D08] font-bold text-xs uppercase font-primary cursor-pointer hover:bg-amber-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
